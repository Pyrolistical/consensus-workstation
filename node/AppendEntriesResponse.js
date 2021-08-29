import * as R from 'ramda';

export default (node, event) => {
  if (event.success) {
    return #[
      #{
        type: 'SaveNodeVolatileLeaderState',
        source: 'leader',
        state: #{
          nextIndex: #{
            ...node.volatileLeaderState.nextIndex,
            [event.source]: event.request.prevLogIndex + event.request.entries.length + 1
          },
          matchIndex: #{
            ...node.volatileLeaderState.matchIndex,
            [event.source]: event.request.prevLogIndex + event.request.entries.length
          }
        }
      }
    ];
  } else {
    return #[
      #{
        type: 'SaveNodeVolatileLeaderState',
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
