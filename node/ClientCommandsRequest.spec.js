import next from './ClientCommandsRequest';

test('client request are distributed from leader to peers', () => {
    const peers = #['leader', 'follower', 'another follower'];
    const configuration = #{
      peers
    };
    const node = #{
      id: 'leader',
      configuration,
      state: #{
        currentTerm: 1,
        votedFor: 'leader',
        log: #[
          #{
            term: 1,
            command: ''
          }
        ]
      },
      volatileState: #{
        commitIndex: 0,
        lastApplied: 0
      },
      volatileLeaderState: #{
        nextIndex: #{
          follower: 1,
          'another follower': 1
        },
        matchIndex: #{
          follower: 0,
          'another follower': 0
        }
      }
    };

    const events = next(node, #{
      type: 'ClientCommandsRequest',
      source: 'client',
      destination: 'leader',
      commands: #['do thing']
    });

    expect(events).toEqual(#[
      #{
        type: 'SaveNodeState',
        source: 'leader',
        state: #{
          currentTerm: 1,
          votedFor: 'leader',
          log: #[
            #{
              term: 1,
              command: ''
            },
            #{
              term: 1,
              command: 'do thing'
            }
          ]
        }
      },
      #{
        type: 'AppendEntriesRequest',
        clientId: 'client',
        source: 'leader',
        destination: 'follower',
        term: 1,
        leaderId: 'leader',
        prevLogIndex: 0,
        prevLogTerm: 1,
        entries: #[
          #{
            term: 1,
            command: 'do thing'
          }
        ],
        leaderCommit: 0
      },
      #{
        type: 'AppendEntriesRequest',
        clientId: 'client',
        source: 'leader',
        destination: 'another follower',
        term: 1,
        leaderId: 'leader',
        prevLogIndex: 0,
        prevLogTerm: 1,
        entries: #[
          #{
            term: 1,
            command: 'do thing'
          }
        ],
        leaderCommit: 0
      }
    ]);
  });
