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
    return [
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
      },
      ...result
    ];
  } else {
    return [
      {
        type: 'SaveVolatileLeaderState',
        source: 'leader',
        volatileLeaderState: {
          ...node.volatileLeaderState,
          nextIndex: {
            ...node.volatileLeaderState.nextIndex,
            [event.source]: R.pathOr(1, [event.source], node.volatileLeaderState.nextIndex) - 1
          }
        }
      }
    ];
  }
};
