import next from './ElectionTimerEnded'

test('election started after leader fails', () => {
  const peers = #['leader', 'follower', 'another follower'];
  const configuration = #{
    peers
  };
  const node = #{
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
