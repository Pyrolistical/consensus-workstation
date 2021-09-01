import * as R from 'ramda';
import {AppendEntriesResponse, Event} from './events';

export const calculateMajorityMatchIndex = (leaderIndex, matchIndex) => {
  const majorityThreshold = (Object.keys(matchIndex).length + 1) / 2;
  const indices = Object.values(matchIndex);
  for (let i = leaderIndex; i >= 0; i--) {
    const count = R.filter(R.lte(i))(indices);
    if (1 + count.length >= majorityThreshold) {
      return i;
    }
  }
  return -1;
}

export default (node, event: AppendEntriesResponse): Event[] => {
  if (event.success) {
    const updatedMatchIndex = #{
      ...node.volatileLeaderState.matchIndex,
      [event.source]: event.request.prevLogIndex + event.request.entries.length
    };
    const majorityMatchIndex = calculateMajorityMatchIndex(node.state.log.length - 1, updatedMatchIndex);
    return #[
      #{
        type: 'SaveVolatileLeaderState',
        source: 'leader',
        volatileLeaderState: #{
          nextIndex: #{
            ...node.volatileLeaderState.nextIndex,
            [event.source]: event.request.prevLogIndex + event.request.entries.length + 1
          },
          matchIndex: updatedMatchIndex
        }
      },
      ...(majorityMatchIndex > node.volatileState.commitIndex
          ? #[
            #{
              type: 'SaveVolatileState',
              source: node.id,
              volatileState: #{
                ...node.volatileState,
                commitIndex: majorityMatchIndex
              }
            },
            #{
              type: 'ClientCommandsResponse',
              destination: event.request.clientId,
              source: node.id,
              success: true
            }
          ]
          : #[]) as Event[]
    ];
  } else {
    return #[
      #{
        type: 'SaveVolatileLeaderState',
        source: 'leader',
        volatileLeaderState: #{
          ...node.volatileLeaderState,
          nextIndex: #{
            ...node.volatileLeaderState.nextState,
            [event.source]: node.volatileLeaderState.nextIndex[event.source] - 1
          }
        }
      }
    ];
  }
};
