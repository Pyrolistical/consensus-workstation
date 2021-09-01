import next from './ElectionTimerEnded';

test('election started after leader fails', () => {
  const node = #{
    id: 'B',
    mode: 'follower' as const,
    leaderId: 'A',
    configuration: #{
      peers: #['A', 'B', 'C']
    },
    state: #{
      currentTerm: 1,
      votedFor: 'A',
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
  };

  const events = next(node, #{
    type: 'ElectionTimerEnded',
    destination: 'B'
  });

  expect(events).toEqual(#[
    #{
      type: 'ChangeMode',
      source: 'B',
      mode: 'candidate'
    },
    #{
      type: 'SaveNodeState',
      source: 'B',
      state: #{
        currentTerm: 2,
        votedFor: 'A',
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
      source: 'B',
      destination: 'A',
      term: 2,
      candidateId: 'B',
      lastLogIndex: 0,
      lastLogTerm: 1
    },
    #{
      type: 'RequestVotesRequest',
      source: 'B',
      destination: 'C',
      term: 2,
      candidateId: 'B',
      lastLogIndex: 0,
      lastLogTerm: 1
    },
    #{
      type: 'ElectionTimerStarted',
      source: 'B'
    }
  ]);
});
