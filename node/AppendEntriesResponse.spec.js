import next, {calculateMajorityMatchIndex} from './AppendEntriesResponse'

test('leader updates nextIndex and matchIndex on successful AppendEntries', () => {
  const peers = #['leader', 'follower', 'another follower', 'yet another follower'];
  const configuration = #{
    peers
  };
  const node = #{
    id: 'leader',
    volatileLeaderState: #{
      nextIndex: #{
        follower: 1,
        'another follower': 1,
        'yet another follower': 1
      },
      matchIndex: #{
        follower: 0,
        'another follower': 0,
        'yet another follower': 0
      }
    }
  };

  const events = next(node, #{
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
      type: 'SaveVolatileLeaderState',
      source: 'leader',
      state: #{
        nextIndex: #{
          follower: 2,
          'another follower': 1,
          'yet another follower': 1
        },
        matchIndex: #{
          follower: 1,
          'another follower': 0,
          'yet another follower': 0
        }
      }
    }
  ]);
});

xtest('leader updates commitIndex when a log has be replicated to a majority of followers', () => {
  const peers = #['leader', 'follower', 'another follower'];
  const configuration = #{
    peers
  };
  const node = #{
    id: 'leader',
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
      type: 'SaveVolatileState',
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
    },
    #{
      type: 'SaveVolatileState',
      source: 'leader',
      volatileState: #{
        commitIndex: 1,
        lastApplied: 0
      }
    }
  ]);
});

describe('calculateMajorityMatchIndex', () => {
  test.each([
    {leaderIndex: 1, matchIndex: #{f1: 0, f2: 0}, expectedMajority: 0},
    {leaderIndex: 1, matchIndex: #{f1: 1, f2: 0}, expectedMajority: 1},
    {leaderIndex: 3, matchIndex: #{f1: 3, f2: 2, f3: 1, f4: 1}, expectedMajority: 2}
  ])('leaderIndex $leaderIndex & $matchIndex should have majority of $expectedMajority', ({leaderIndex, matchIndex, expectedMajority}) => {
    expect(calculateMajorityMatchIndex(leaderIndex, matchIndex)).toBe(expectedMajority);
  })
})