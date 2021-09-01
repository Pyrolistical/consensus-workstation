import * as R from 'ramda';

import {Node, AppendEntriesRequest, Event} from './types';

export default (node: Node, event: AppendEntriesRequest): Event[] => {
  if (event.term < node.state.currentTerm) {
    return #[
      #{
        type: 'AppendEntriesResponse',
        destination: event.source,
        source: node.id,
        term: node.state.currentTerm,
        success: false,
        request: event
      }
    ];
  }

  const conflict = R.path([event.prevLogIndex, 'term'], node.state.log) !== event.prevLogTerm;
  if (conflict) {
    return #[
      #{
        type: 'SaveNodeState',
        source: node.id,
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
        source: node.id,
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
      : #[]) as Event[],
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
      : #[]) as Event[],
    #{
      type: 'ElectionTimerReset',
      source: node.id
    },
    #{
      type: 'AppendEntriesResponse',
      source: node.id,
      destination: event.source,
      term: node.state.currentTerm,
      success: true,
      request: event
    }
  ];
};
