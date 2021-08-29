import {next} from './raft-state-machine'

test('election started after leader fails', () => {
  const peers = #['leader', 'next candidate', 'follower'];
  const configuration = #{
    peers
  };
  const nodes = #[
    #{
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
      }
    },
    #{
      id: 'next candidate',
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
      }
    },
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
      }
    }
  ];

  const events = next(nodes, #{
    type: 'ElectionTimerEnded',
    destination: 'next candidate'
  });

  expect(events).toEqual(#[
    #{
      type: 'SaveNodeState',
      source: 'next candidate',
      state: #{
        currentTerm: 2,
        votedFor: 'leader',
        log: #[
          #{
            term: 1,
            command: ''
          }
        ]
      }
    },
    #{
      type: 'RequestVotesRequest',
      destination: 'leader',
      term: 2,
      candidateId: 'next candidate',
      lastLogIndex: 0,
      lastLogTerm: 1
    },
    #{
      type: 'RequestVotesRequest',
      destination: 'follower',
      term: 2,
      candidateId: 'next candidate',
      lastLogIndex: 0,
      lastLogTerm: 1
    },
    #{
      type: 'ElectionTimerStarted',
      source: 'next candidate'
    }
  ]);
});
