import * as R from 'ramda';

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

export default (node, event) => {
  if (event.success) {
    const updatedMatchIndex = #{
      ...node.volatileLeaderState.matchIndex,
      [event.source]: event.request.prevLogIndex + event.request.entries.length
    };
    return #[
      #{
        type: 'SaveVolatileLeaderState',
        source: 'leader',
        state: #{
          nextIndex: #{
            ...node.volatileLeaderState.nextIndex,
            [event.source]: event.request.prevLogIndex + event.request.entries.length + 1
          },
          matchIndex: updatedMatchIndex
        }
      }
    ];
  } else {
    return #[
      #{
        type: 'SaveVolatileLeaderState',
        source: 'leader',
        state: #{
          ...node.volatileLeaderState,
          nextIndex: #{
            ...node.volatileLeaderState.nextState,
            [event.source]: nodevolatileLeaderState.nextIndex[event.source] - 1
          }
        }
      }
    ];
  }
};
