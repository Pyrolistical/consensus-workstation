import next from './ElectionTimerEnded';

test('election started after leader fails', () => {
  const node = #{
    id: 'follower',
    mode: 'follower' as const,
    leaderId: 'leader',
    configuration: #{
      peers: #['leader', 'follower', 'another follower']
    },
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
  };

  const events = next(node, #{
    type: 'ElectionTimerEnded',
    destination: 'follower'
  });

  expect(events).toEqual(#[
    #{
      type: 'SaveNodeState',
      source: 'follower',
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
      source: 'follower',
      destination: 'leader',
      term: 2,
      candidateId: 'follower',
      lastLogIndex: 0,
      lastLogTerm: 1
    },
    #{
      type: 'RequestVotesRequest',
      source: 'follower',
      destination: 'another follower',
      term: 2,
      candidateId: 'follower',
      lastLogIndex: 0,
      lastLogTerm: 1
    },
    #{
      type: 'ElectionTimerStarted',
      source: 'follower'
    }
  ]);
});
