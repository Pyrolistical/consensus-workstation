import * as R from "ramda";
import produce from "immer";

import {
  Request,
  AppendEntriesRequest,
  NetworkCallState,
  Configuration,
  Event,
  Node,
  NodeState,
  NodeVolatileState,
  NodeVolatileLeaderState,
  NodeId
} from "./events";

export default (selfNodeId: NodeId): Node => {
  let networkCallState: NetworkCallState = {
    nextRequestId: 0,
    inflightRequests: {}
  };

  let configuration: Configuration = {
    peers: []
  };
  let state: NodeState = {
    currentTerm: -1,
    votedFor: null,
    log: []
  };
  let volatileState: NodeVolatileState = {
    commitIndex: -1,
    lastApplied: -1
  };
  let volatileLeaderState: NodeVolatileLeaderState = {
    nextIndex: {},
    matchIndex: {}
  };
  const self = {
    nodeId: selfNodeId,
    handle(event: Event): Event[] {
      const results = [];

      function saveRequest(request: Partial<Request>): Request {
        networkCallState = produce(networkCallState, (draft) => {
          request.requestId = draft.nextRequestId++;
          draft.inflightRequests[request.requestId] = request as Request;
        });
        results.push({
          type: "SaveNetworkCallState",
          source: selfNodeId,
          state: networkCallState
        });
        return request as Request;
      }

      function loadRequest(requestId: number): Request {
        const request: Request = networkCallState.inflightRequests[requestId];
        networkCallState = produce(networkCallState, (draft) => {
          delete draft.inflightRequests[requestId];
        });
        results.push({
          type: "SaveNetworkCallState",
          source: selfNodeId,
          state: networkCallState
        });
        return request;
      }

      function appendEntries(destination) {
        if (
          state.log.length - 1 >=
          volatileLeaderState.nextIndex[destination]
        ) {
          const prevLogIndex = volatileLeaderState.nextIndex[destination] - 1;
          const { term: prevLogTerm } = state.log[prevLogIndex];
          const entries = state.log.slice(prevLogIndex + 1);
          results.push(
            saveRequest({
              type: "AppendEntriesRequest",
              destination: destination,
              term: state.currentTerm,
              leaderId: selfNodeId,
              prevLogIndex,
              prevLogTerm,
              entries,
              leaderCommit: volatileState.commitIndex
            })
          );
        }
      }
      switch (event.type) {
        case "ClientRequest":
          const entries = event.commands.map((command) => {
            return {
              term: state.currentTerm,
              command
            };
          });
          state = produce(state, (draft) => {
            draft.log.push(...entries);
          });
          results.push({
            type: "SaveNodeState",
            source: selfNodeId,
            state
          });

          R.pipe(
            R.reject(R.equals(selfNodeId)),
            R.forEach((nodeId) => {
              appendEntries(nodeId);
            })
          )(configuration.peers);
          break;
        case "AppendEntriesRequest": {
          if (event.term < state.currentTerm) {
            results.push({
              requestId: event.requestId,
              type: "AppendEntriesResponse",
              destination: event.source,
              term: state.currentTerm,
              success: false
            });
            break;
          }
          const conflict =
            R.path([event.prevLogIndex, "term"], state.log) !==
            event.prevLogTerm;
          state = produce(state, (draft) => {
            draft.log.slice(event.prevLogIndex);
          });
          if (conflict) {
            results.push({
              type: "SaveNodeState",
              source: selfNodeId,
              state
            });
            results.push({
              requestId: event.requestId,
              type: "AppendEntriesResponse",
              destination: event.source,
              term: state.currentTerm,
              success: false
            });
            break;
          }
          state = produce(state, (draft) => {
            draft.log.push(...event.entries);
          });
          if (event.leaderCommit > volatileState.commitIndex) {
            volatileState = produce(volatileState, (draft) => {
              draft.commitIndex = Math.min(
                event.leaderCommit,
                state.log.length - 1
              );
            });
            results.push({
              type: "SaveNodeVolatileState",
              source: selfNodeId,
              volatileState
            });
          }
          results.push({
            type: "SaveNodeState",
            source: selfNodeId,
            state
          });
          results.push({
            requestId: event.requestId,
            type: "AppendEntriesResponse",
            destination: event.source,
            term: state.currentTerm,
            success: true
          });
          break;
        }
        case "NetworkCallStateRestored":
          networkCallState = event.state;
          break;
        case "ConfigurationRestored":
          configuration = event.configuration;
          break;
        case "NodeStateRestored":
          state = event.state;
          break;
        case "NodeVolatileStateRestored":
          volatileState = event.state;
          break;
        case "NodeVolatileLeaderStateRestored":
          volatileLeaderState = event.state;
          break;
        case "ElectionTimerEnded":
          state = produce(state, (draft) => {
            draft.currentTerm += 1;
          });
          results.push({
            type: "SaveNodeState",
            source: selfNodeId,
            state
          });
          R.pipe(
            R.reject(R.equals(selfNodeId)),
            R.forEach((nodeId) => {
              const { term: lastLogTerm } = R.last(state.log);
              results.push(
                saveRequest({
                  type: "RequestVotesRequest",
                  destination: nodeId,
                  term: state.currentTerm,
                  candidateId: selfNodeId,
                  lastLogIndex: state.log.length - 1,
                  lastLogTerm
                })
              );
            })
          )(configuration.peers);
          results.push({
            type: "ElectionTimerStarted",
            source: selfNodeId
          });
          break;
        case "AppendEntriesResponse": {
          const request = loadRequest(event.requestId) as AppendEntriesRequest;
          if (!request) {
            break;
          }
          if (event.success) {
            volatileLeaderState = produce(volatileLeaderState, (draft) => {
              draft.nextIndex[event.source] =
                request.prevLogIndex + request.entries.length;
              draft.matchIndex[event.source] =
                request.prevLogIndex + request.entries.length - 1;
            });
            results.push({
              type: "SaveNodeVolatileLeaderState",
              source: "leader",
              state: volatileLeaderState
            });
          } else {
            if (event.term > state.currentTerm) {
              state = produce(state, (draft) => {
                draft.currentTerm = event.term;
              });
              results.push({
                type: "SaveNodeState",
                source: selfNodeId,
                state
              });
              break;
            }
            volatileLeaderState = produce(volatileLeaderState, (draft) => {
              draft.nextIndex[event.source] -= 1;
            });
            results.push({
              type: "SaveNodeVolatileLeaderState",
              source: "leader",
              state: volatileLeaderState
            });
          }
          appendEntries(event.source);

          break;
        }
      }
      return results;
    }
  };
  return self;
};
