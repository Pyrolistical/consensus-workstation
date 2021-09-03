import * as R from 'ramda';
import { LeaderNode, AppendEntriesResponse, Event } from './types';

export const calculateMajorityMatchIndex = (majorityThreshold, leaderIndex, matchIndex) => {
  const indices = Object.values(matchIndex);
  for (let i = leaderIndex; i >= 0; i--) {
    const count = R.filter(R.lte(i))(indices);
    if (1 + count.length >= majorityThreshold) {
      return i;
    }
  }
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
            [event.source]: node.volatileLeaderState.nextIndex[event.source] - 1
          }
        }
      }
    ];
  }
};
