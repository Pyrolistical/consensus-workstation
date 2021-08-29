import * as R from 'ramda';

export function next (node, event) {
  // function appendEntries(destination) {
  //   if (
  //     node.state.log.length - 1 >=
  //     node.volatileLeaderState.nextIndex[destination]
  //   ) {
  //     const prevLogIndex = node.volatileLeaderState.nextIndex[destination] - 1;
  //     const { term: prevLogTerm } = node.state.log[prevLogIndex];
  //     return #{
  //       type: 'AppendEntriesRequest',
  //       destination,
  //       term: node.state.currentTerm,
  //       leaderId: node.id,
  //       prevLogIndex,
  //       prevLogTerm,
  //       entries: R.drop(prevLogIndex + 1, node.state.log),
  //       leaderCommit: node.volatileState.commitIndex
  //     };
  //   }
  // }
  switch (event.type) {
    // case 'ClientRequest':
    //   const entries = event.commands.map(command => {
    //     return {
    //       term: state.currentTerm,
    //       command
    //     };
    //   });
    //   state.log.push(...entries);
    //   results.push({
    //     type: 'SaveNodeState',
    //     source: selfNodeId,
    //     state
    //   });

    //   R.pipe(
    //     R.reject(R.equals(selfNodeId)),
    //     R.forEach(nodeId => {
    //       appendEntries(nodeId);
    //     })
    //   )(configuration.peers);
    //   break;
    case 'AppendEntriesRequest': {
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

      const conflict =
        R.path([event.prevLogIndex, 'term'], node.state.log) !==
        event.prevLogTerm;
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
                type: 'SaveNodeVolatileState',
                source: node.id,
                volatileState: #{
                  ...node.volatileState,
                  commitIndex: Math.min(
                    event.leaderCommit,
                    node.state.log.length - 1
                  )
                }
              }
            ]
            : #[]),
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
        },
        #{
          type: 'AppendEntriesResponse',
          destination: event.source,
          term: node.state.currentTerm,
          success: true,
          request: event
        }
      ];
    }
    case 'ElectionTimerEnded':
      return #[
        #{
          type: 'SaveNodeState',
          source: node.id,
          state: #{
            ...node.state,
            currentTerm: node.state.currentTerm + 1
          }
        },
        ...R.pipe(
          R.reject(R.equals(node.id)),
          R.map(nodeId => {
            const { term: lastLogTerm } = R.last(node.state.log);
            return #{
              type: 'RequestVotesRequest',
              destination: nodeId,
              term: node.state.currentTerm + 1,
              candidateId: node.id,
              lastLogIndex: node.state.log.length - 1,
              lastLogTerm
            };
          })
        )(node.configuration.peers),
        #{
          type: 'ElectionTimerStarted',
          source: node.id
        }
      ];
    case 'AppendEntriesResponse': {
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
    }
  }
  return #[
    ...results
  ];
};
