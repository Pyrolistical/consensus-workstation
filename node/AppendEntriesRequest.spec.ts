import next from './AppendEntriesRequest'

import {FollowerConfiguration} from './types';

test('followers response success if append entries request passes consistency check', () => {
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
      type: 'ElectionTimerReset',
      source: 'follower'
    },
    #{
      type: 'AppendEntriesResponse',
      source: 'follower',
      destination: 'leader',
      term: 1,
      success: true,
      request: #{
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
      }
    }
  ]);
});

test('followers update their commitIndex with the leaderCommit', () => {
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
  };

  const events = next(node, #{
    type: 'AppendEntriesRequest',
    clientId: 'client',
    source: 'leader',
    destination: 'follower',
    term: 1,
    leaderId: 'leader',
    prevLogIndex: 1,
    prevLogTerm: 1,
    entries: #[],
    leaderCommit: 1
  });

  expect(events).toEqual(#[
    #{
      type: 'SaveVolatileState',
      source: 'follower',
      volatileState: #{
        commitIndex: 1,
        lastApplied: 0
      }
    },
    #{
      type: 'ElectionTimerReset',
      source: 'follower'
    },
    #{
      type: 'AppendEntriesResponse',
      source: 'follower',
      destination: 'leader',
      term: 1,
      success: true,
      request: #{
        type: 'AppendEntriesRequest',
        clientId: 'client',
        source: 'leader',
        destination: 'follower',
        term: 1,
        leaderId: 'leader',
        prevLogIndex: 1,
        prevLogTerm: 1,
        entries: #[],
        leaderCommit: 1
      }
    }
  ]);
})