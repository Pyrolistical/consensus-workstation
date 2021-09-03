import * as R from 'ramda';

import { Node, AppendEntriesRequest, Event } from './types';

export default (node: Node, event: AppendEntriesRequest): Event[] => {
  if (event.term < node.state.currentTerm) {
    return [
      {
        type: 'AppendEntriesResponse',
        destination: event.source,
        source: node.id,
        term: node.state.currentTerm,
        success: false,
        request: event
      }
    ];
  }
  const descended = node.mode !== 'follower' && event.term > node.state.currentTerm;

  const conflict = R.path([event.prevLogIndex, 'term'], node.state.log) !== event.prevLogTerm;
  if (conflict) {
    const result: Event[] = [];
    if (descended) {
      result.push(
        {
          type: 'ChangeMode',
          source: node.id,
          mode: 'follower',
          leaderId: event.source
        },
        {
          type: 'SaveNodeState',
          source: node.id,
          state: {
            ...node.state,
            currentTerm: event.term,
            log: R.drop(event.prevLogIndex, node.state.log)
          }
        }
      );
    } else {
      result.push({
        type: 'SaveNodeState',
        source: node.id,
        state: {
          ...node.state,
          log: R.drop(event.prevLogIndex, node.state.log)
        }
      });
    }
    return [
      ...result,
      {
        type: 'ElectionTimerReset',
        source: node.id
      },
      {
        type: 'AppendEntriesResponse',
        source: node.id,
        destination: event.source,
        term: node.state.currentTerm,
        success: false,
        request: event
      }
    ];
  }

  const result: Event[] = [];
  if (event.leaderCommit > node.volatileState.commitIndex) {
    result.push({
      type: 'SaveVolatileState',
      source: node.id,
      volatileState: {
        ...node.volatileState,
        commitIndex: event.leaderCommit
      }
    });
  }
  if (descended) {
    result.push({
      type: 'ChangeMode',
      source: node.id,
      mode: 'follower',
      leaderId: event.source
    });
    if (event.entries.length > 0) {
      result.push({
        type: 'SaveNodeState',
        source: node.id,
        state: {
          ...node.state,
          currentTerm: event.term,
          log: [
            ...node.state.log,
            ...event.entries
          ]
        }
      });
    } else {
      result.push({
        type: 'SaveNodeState',
        source: node.id,
        state: {
          ...node.state,
          currentTerm: event.term
        }
      });
    }
  } else if (event.entries.length > 0) {
    result.push({
      type: 'SaveNodeState',
      source: node.id,
      state: {
        ...node.state,
        log: [
          ...node.state.log,
          ...event.entries
        ]
      }
    });
  }
  return [
    ...result,
    {
      type: 'ElectionTimerReset',
      source: node.id
    },
    {
      type: 'AppendEntriesResponse',
      source: node.id,
      destination: event.source,
      term: event.term,
      success: true,
      request: event
    }
  ];
};
