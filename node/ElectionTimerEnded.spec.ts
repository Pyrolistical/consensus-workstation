import next from './ElectionTimerEnded';

import {FollowerConfiguration} from './types';

test('election started after leader fails', () => {
  const peers = #['leader', 'follower', 'another follower'];
  const configuration: FollowerConfiguration = #{
    peers,
    state: 'follower',
    leaderId: 'leader'
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
