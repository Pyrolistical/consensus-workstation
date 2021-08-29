import {next} from './raft-state-machine'

test('followers response success if append entries request passes consistency check', () => {
  const peers = #['leader', 'follower', 'another follower'];
  const configuration = #{
    peers
  };
  const nodes = #[
    #{
      id: 'follower',
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
      }
    }
  ];

  const events = next(nodes, #{
    type: 'AppendEntriesRequest',
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
  });

  expect(events).toEqual(#[
    #{
      type: 'SaveNodeState',
      source: 'follower',
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
      type: 'AppendEntriesResponse',
      destination: 'leader',
      term: 1,
      success: true,
      request: #{
        type: 'AppendEntriesRequest',
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
      }
    }
  ]);
});

test('leader updates nextIndex and matchIndex on successful AppendEntries', () => {
  const peers = #['leader', 'follower', 'another follower'];
  const configuration = #{
    peers
  };
  const nodes = #[
    #{
      id: 'follower',
      configuration,
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
      },
      volatileState: #{
        commitIndex: 0,
        lastApplied: 0
      }
    },
    #{
      id: 'leader',
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
    }
  ];

  const events = next(nodes, #{
      type: 'AppendEntriesResponse',
      source: 'follower',
      destination: 'leader',
      term: 1,
      success: true,
      request: #{
        type: 'AppendEntriesRequest',
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
      }
    })

  expect(events).toEqual(#[
    #{
      type: 'SaveNodeVolatileLeaderState',
      source: 'leader',
      state: #{
        nextIndex: #{
          follower: 2,
          'another follower': 1
        },
        matchIndex: #{
          follower: 1,
          'another follower': 0
        }
      }
    }
  ]);
});
