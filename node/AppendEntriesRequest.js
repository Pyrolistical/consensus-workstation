import * as R from 'ramda';

export default (node, event) => {
  if (event.term < node.state.currentTerm) {
    return #[
      #{
        type: 'AppendEntriesResponse',
        destination: event.source,
        term: node.state.currentTerm,
        success: false
      }
    ];
  }

  const conflict = R.path([event.prevLogIndex, 'term'], node.state.log) !== event.prevLogTerm;
  if (conflict) {
    return #[
      #{
        type: 'SaveNodeState',
        source: selfNodeId,
        state: #{
          ...node.state,
          log: #[
            ...R.drop(event.prevLogIndex, node.state.log)
          ]
        }
      },
      #{
        type: 'ElectionTimerReset',
        source: node.id
      },
      #{
        type: 'AppendEntriesResponse',
        destination: event.source,
        term: node.state.currentTerm,
        success: false,
        request: event
      }
    ];
  }

  return #[
    ...(event.leaderCommit > node.volatileState.commitIndex
      ? #[
        #{
          type: 'SaveVolatileState',
          source: node.id,
          volatileState: #{
            ...node.volatileState,
            commitIndex: event.leaderCommit
          }
        }
      ]
      : #[]),
    ...(event.entries.length > 0
      ? #[
        #{
          type: 'SaveNodeState',
          source: node.id,
          state: #{
            ...node.state,
            log: #[
              ...node.state.log,
              ...event.entries
            ]
          }
        }
      ]
      : #[]),
    #{
      type: 'ElectionTimerReset',
      source: node.id
    },
    #{
      type: 'AppendEntriesResponse',
      destination: event.source,
      term: node.state.currentTerm,
      success: true,
      request: event
    }
  ];
};
