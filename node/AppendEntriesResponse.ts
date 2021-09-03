import * as R from 'ramda';
import { LeaderNode, AppendEntriesResponse, Event, Index } from './types';

function countLessThanOrEqualTo(i: number, array: number[]): number {
  return R.pipe(
    R.filter<number, 'array'>(R.lte(i)),
    R.length
  )(array);
};

export const calculateMajorityMatchIndex = (majorityThreshold: number, leaderIndex: number, matchIndex: Index) => {
  const indices = Object.values(matchIndex);
  for (let i = leaderIndex; i >= 0; i--) {
    const count = countLessThanOrEqualTo(i, indices);
    if (1 + count >= majorityThreshold) {
      return i;
    }
  }
  /* istanbul ignore next */
  return -1;
}

export default (node: LeaderNode, event: AppendEntriesResponse): Event[] => {
  if (event.success) {
    const updatedMatchIndex = {
      ...node.volatileLeaderState.matchIndex,
      [event.source]: event.request.prevLogIndex + event.request.entries.length
    };
    const majorityMatchIndex = calculateMajorityMatchIndex(node.configuration.peers.length / 2, node.state.log.length - 1, updatedMatchIndex);
    const result: Event[] = [];
    if (event.request.entries.length > 0) {
      result.push(
        {
          type: 'SaveVolatileLeaderState',
          source: 'leader',
          volatileLeaderState: {
            nextIndex: {
              ...node.volatileLeaderState.nextIndex,
              [event.source]: event.request.prevLogIndex + event.request.entries.length + 1
            },
            matchIndex: updatedMatchIndex
          }
        }
      );
    }
    if (majorityMatchIndex > node.volatileState.commitIndex) {
      result.push(
        {
          type: 'SaveVolatileState',
          source: node.id,
          volatileState: {
            ...node.volatileState,
            commitIndex: majorityMatchIndex
          }
        }
      );
      if (event.request.clientId) {
        result.push(
          {
            type: 'ClientCommandsResponse',
            destination: event.request.clientId,
            source: node.id,
            success: true
          }
        );
      }
    }
    return result;
  } else {
    const nextIndex = R.pathOr(1, [event.source], node.volatileLeaderState.nextIndex) - 1;
    const prevLogIndex = nextIndex - 1;
    return [
      {
        type: 'SaveVolatileLeaderState',
        source: 'leader',
        volatileLeaderState: {
          ...node.volatileLeaderState,
          nextIndex: {
            ...node.volatileLeaderState.nextIndex,
            [event.source]: nextIndex
          }
        }
      },
      {
        type: 'AppendEntriesRequest',
        clientId: event.request.clientId,
        source: node.id,
        destination: event.source,
        term: node.state.currentTerm,
        leaderId: node.id,
        prevLogIndex,
        prevLogTerm: R.pathOr(1, [prevLogIndex, 'term'], node.state.log),
        entries: R.takeLast(node.state.log.length - 1 - prevLogIndex, node.state.log),
        leaderCommit: node.volatileState.commitIndex
      },
      {
        type: 'EmptyAppendEntriesTimerRestart',
        source: node.id
      }
    ];
  }
};
