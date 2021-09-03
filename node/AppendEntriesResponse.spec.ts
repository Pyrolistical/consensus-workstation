import next, { calculateMajorityMatchIndex } from './AppendEntriesResponse';
import { Index } from './types';

test('leader updates nextIndex and matchIndex on successful AppendEntries', () => {
  const node = {
    id: 'leader',
    mode: 'leader' as const,
    configuration: {
      peers: ['leader', 'follower', 'another follower', 'yet another follower', 'last follower']
    },
    state: {
      currentTerm: 1,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: ''
        },
        {
          term: 1,
          command: 'do thing'
        }
      ]
    },
    volatileState: {
      commitIndex: 0,
      lastApplied: 0
    },
    volatileLeaderState: {
      nextIndex: {
        follower: 1,
        'another follower': 1,
        'yet another follower': 1,
        'last follower': 1
      },
      matchIndex: {
        follower: 0,
        'another follower': 0,
        'yet another follower': 0,
        'last follower': 0
      }
    }
  };

  const events = next(node, {
    type: 'AppendEntriesResponse',
    source: 'follower',
    destination: 'leader',
    term: 1,
    success: true,
    request: {
      type: 'AppendEntriesRequest',
      clientId: 'client',
      source: 'leader',
      destination: 'follower',
      term: 1,
      leaderId: 'leader',
      prevLogIndex: 0,
      prevLogTerm: 1,
      entries: [
        {
          term: 1,
          command: 'do thing'
        }
      ],
      leaderCommit: 0
    }
  });

  expect(events).toEqual([
    {
      type: 'SaveVolatileLeaderState',
      source: 'leader',
      volatileLeaderState: {
        nextIndex: {
          follower: 2,
          'another follower': 1,
          'yet another follower': 1,
          'last follower': 1
        },
        matchIndex: {
          follower: 1,
          'another follower': 0,
          'yet another follower': 0,
          'last follower': 0
        }
      }
    }
  ]);
});

test('leader updates commitIndex when a log has be replicated to a majority of followers', () => {
  const node = {
    id: 'leader',
    mode: 'leader' as const,
    configuration: {
      peers: ['leader', 'follower', 'another follower']
    },
    state: {
      currentTerm: 1,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: ''
        },
        {
          term: 1,
          command: 'do thing'
        }
      ]
    },
    volatileState: {
      commitIndex: 0,
      lastApplied: 0
    },
    volatileLeaderState: {
      nextIndex: {
        follower: 1,
        'another follower': 1
      },
      matchIndex: {
        follower: 0,
        'another follower': 0
      }
    }
  };

  const events = next(node, {
    type: 'AppendEntriesResponse',
    source: 'follower',
    destination: 'leader',
    term: 1,
    success: true,
    request: {
      type: 'AppendEntriesRequest',
      clientId: 'client',
      source: 'leader',
      destination: 'follower',
      term: 1,
      leaderId: 'leader',
      prevLogIndex: 0,
      prevLogTerm: 1,
      entries: [
        {
          term: 1,
          command: 'do thing'
        }
      ],
      leaderCommit: 0
    }
  })

  expect(events).toEqual([
    {
      type: 'SaveVolatileLeaderState',
      source: 'leader',
      volatileLeaderState: {
        nextIndex: {
          follower: 2,
          'another follower': 1
        },
        matchIndex: {
          follower: 1,
          'another follower': 0
        }
      }
    },
    {
      type: 'SaveVolatileState',
      source: 'leader',
      volatileState: {
        commitIndex: 1,
        lastApplied: 0
      }
    },
    {
      type: 'ClientCommandsResponse',
      destination: 'client',
      source: 'leader',
      success: true
    }
  ]);
});

describe('calculateMajorityMatchIndex', () => {
  test.each([
    { majorityThreshold: 1.5, leaderIndex: 1, matchIndex: { f1: 0, f2: 0 }, expectedMajority: 0 },
    { majorityThreshold: 1.5, leaderIndex: 1, matchIndex: { f1: 1, f2: 0 }, expectedMajority: 1 },
    { majorityThreshold: 2.5, leaderIndex: 3, matchIndex: { f1: 3, f2: 2, f3: 1, f4: 1 }, expectedMajority: 2 }
  ])('leaderIndex $leaderIndex & $matchIndex should have majority of $expectedMajority', ({ majorityThreshold, leaderIndex, matchIndex, expectedMajority }) => {
    expect(calculateMajorityMatchIndex(majorityThreshold, leaderIndex, matchIndex as Index)).toBe(expectedMajority);
  })
})