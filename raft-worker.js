import * as R from "ramda";

const configuration = {
  id,
  servers: [],
  heartbeatEveryMilliseconds: 50,
  electionTimeoutMilliseconds: 100
};
const persistent = {
  currentTerm: 0,
  votedFor: undefined,
  log: []
};

const volatile = {
  commitIndex: 0,
  lastApplied: 0,
  nextIndex: [],
  matchIndex: []
};

let state = "initializing";
const running = ["follower", "candinate", "leader"];

function postTypedMessage(type, body = {}) {
  return window.postMessage({
    ...body,
    type
  });
}
function postResponse(id, type, body = {}) {
  return window.postMessage({
    ...body,
    id,
    type
  });
}

function postAppendEntries(prevLogIndex, prevLogTerm, entries, destination) {
  return postTypedMessage("Post AppendEntries", {
    destination,
    arguments: {
      term: persistent.currentTerm,
      leaderId: configuration.id,
      prevLogIndex,
      prevLogTerm,
      entries,
      leaderCommit: volatile.commitIndex
    }
  });
}


window.onmessage = ({ data: { id, method, parameters = {} } = {} }) => {
  try {
    switch (method) {
      case "initialize state": {
        if (state !== "initializing") {
          throw new Error(
            "initialize state method is only allowed during initializing"
          );
        }
        const {
          configuration: { id, serverIds, electionTimeoutMilliseconds } = {},
          persistent: { currentTerm, votedFor, log } = {},
          volatile: { commitIndex, lastApplied, nextIndex, matchIndex } = {},
          state: serverState
        } = parameters;
        Object.assign(configuration, {
          id,
          serverIds,
          electionTimeoutMilliseconds
        });
        Object.assign(persistent, { currentTerm, votedFor, log });
        Object.assign(volatile, {
          commitIndex,
          lastApplied,
          nextIndex,
          matchIndex
        });
        state = serverState;
        break;
      }
      case "start": {
        state = "follower";
        postTypedMessage('start election timer')
        break;
      }
      case "Leader: client request": {
        if (state !== "leader") {
          throw new Error("client request can only be made to leader");
        }
        const { commands } = parameters;
        const entries = commands.map((command) => {
          return {
            term: persistent.currentTerm,
            command
          };
        });
        const prevLogIndex = persistent.log.length - 1;
        const {term: prevLogTerm} = persistent.log[prevLogIndex] || {}
        persistent.log.push(...entries);
        for (const server of configuration.servers) {
          postAppendEntries(prevLogIndex, prevLogTerm, entries, server);
        }
        break;
      }
      case "Leader: AppendEntries response": {
        const {term, success} = parameters;
        break;
      }
      case "Follower: AppendEntries request": {
        const {
          term,
          leaderId,
          prevLogIndex,
          prevLogTerm,
          entries,
          leaderCommit
        } = parameters;
        if (!running.includes(state)) {
          throw new Error(
            "AppendEntries request can only be made while the state is running"
          );
        }
        let success;
        if (term < persistent.currentTerm) {
          success = false;
        } else {
          if (term > persistent.currentTerm) {
            persistent.currentTerm = term;
            state = "follower";
          }
          const matchIndex = R.addIndex(
            R.findLastIndex,
            ({ term: logTerm }, index) =>
              index === prevLogIndex && logTerm === prevLogTerm,
            persistent.log
          );
          if (matchIndex === -1) {
            success = false;
          } else {
            for (let i = 0; i < entries.length; i++) {
              persistent.log[i + matchIndex + 1] = entries[i];
            }
          }
          if (leaderCommit > persistent.commitIndex) {
            persistent.commitIndex = Math.min(
              leaderCommit,
              matchIndex + 1 + entries.length - 1
            );
          }
        }
        return postResult(id, "Response", {
          term: persistent.currentTerm,
          success
        });
      }
      case "Leader: Follower heartbeat about to expire":
      case "Follower: Leader heartbeat expired":
      case "Candidate: RequestVotes response":
      case "Follower: RequestVotes request": {
        const { term, candidateId, lastLogIndex, lastLogTerm } = parameters;
        if (!running.includes(state)) {
          throw new Error(
            `RequestVote request can only be made while the state is running, but was ${state}`
          );
        }
        let voteGranted;
        if (term < persistent.currentTerm) {
          voteGranted = false;
        } else {
          if (term > persistent.currentTerm) {
            persistent.currentTerm = term;
            state = "follower";
          }
          const matchIndex = R.addIndex(
            R.findLastIndex,
            ({ term: logTerm }, index) =>
              index === lastLogIndex && logTerm === lastLogTerm,
            persistent.log
          );
          if (matchIndex < persistent.log.length - 1) {
            voteGranted = false;
          } else {
            voteGranted =
              !persistent.votedFor || persistent.votedFor === candidateId;
            persistent.votedFor = candidateId;
          }
        }
        return postResponse(id, {
          term,
          voteGranted
        });
      }
      default:
        throw new Error("unsupported method");
    }
  } catch (error) {
    return postResult(id, "crash", {
      id,
      method,
      parameters,
      error: error.message
    });
  }
};
