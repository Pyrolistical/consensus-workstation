import next, { calculateMajorityMatchIndex } from './AppendEntriesResponse'
import type { Index, LeaderNode } from './types'

test('leader updates nextIndex and matchIndex on successful AppendEntries', () => {
  const node: LeaderNode = {
    id: 'leader',
    mode: 'leader',
    configuration: {
      peers: [
        'leader',
        'follower',
        'another follower',
        'yet another follower',
        'last follower',
      ],
    },
    state: {
      currentTerm: 1,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: '',
        },
        {
          term: 1,
          command: 'do thing',
        },
      ],
    },
    volatileState: {
      commitIndex: 0,
      lastApplied: 0,
    },
    volatileLeaderState: {
      nextIndex: {
        follower: 1,
        'another follower': 1,
        'yet another follower': 1,
        'last follower': 1,
      },
      matchIndex: {
        follower: 0,
        'another follower': 0,
        'yet another follower': 0,
        'last follower': 0,
      },
    },
  }

  const events = next(node, {
    type: 'AppendEntriesResponse',
    source: 'follower',
    destination: 'leader',
    term: 1,
    success: true,
    request: {
      type: 'AppendEntriesRequest',
      clientRequest: {
        type: 'ClientCommandsRequest',
        source: 'client',
        destination: 'leader',
        commands: ['do thing'],
      },
      source: 'leader',
      destination: 'follower',
      term: 1,
      leaderId: 'leader',
      prevLogIndex: 0,
      prevLogTerm: 1,
      entries: [
        {
          term: 1,
          command: 'do thing',
        },
      ],
      leaderCommit: 0,
    },
  })

  expect(events).toEqual([
    {
      type: 'SaveVolatileLeaderState',
      source: 'leader',
      volatileLeaderState: {
        nextIndex: {
          follower: 2,
          'another follower': 1,
          'yet another follower': 1,
          'last follower': 1,
        },
        matchIndex: {
          follower: 1,
          'another follower': 0,
          'yet another follower': 0,
          'last follower': 0,
        },
      },
    },
  ])
})

test('leader decrementals nextIndex on failed AppendEntries and tries again', () => {
  const node: LeaderNode = {
    id: 'leader',
    mode: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'another follower'],
    },
    state: {
      currentTerm: 1,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: '',
        },
        {
          term: 1,
          command: 'do thing',
        },
      ],
    },
    volatileState: {
      commitIndex: 1,
      lastApplied: 0,
    },
    volatileLeaderState: {
      nextIndex: {
        follower: 2,
        'another follower': 2,
      },
      matchIndex: {
        follower: 0,
        'another follower': 1,
      },
    },
  }

  const events = next(node, {
    type: 'AppendEntriesResponse',
    source: 'follower',
    destination: 'leader',
    term: 1,
    success: false,
    request: {
      type: 'AppendEntriesRequest',
      clientRequest: {
        type: 'ClientCommandsRequest',
        source: 'client',
        destination: 'leader',
        commands: ['do thing'],
      },
      source: 'leader',
      destination: 'follower',
      term: 1,
      leaderId: 'leader',
      prevLogIndex: 1,
      prevLogTerm: 1,
      entries: [],
      leaderCommit: 1,
    },
  })

  expect(events).toEqual([
    {
      type: 'SaveVolatileLeaderState',
      source: 'leader',
      volatileLeaderState: {
        nextIndex: {
          follower: 1,
          'another follower': 2,
        },
        matchIndex: {
          follower: 0,
          'another follower': 1,
        },
      },
    },
    {
      type: 'AppendEntriesRequest',
      clientRequest: {
        type: 'ClientCommandsRequest',
        source: 'client',
        destination: 'leader',
        commands: ['do thing'],
      },
      source: 'leader',
      destination: 'follower',
      term: 1,
      leaderId: 'leader',
      prevLogIndex: 0,
      prevLogTerm: 1,
      entries: [
        {
          term: 1,
          command: 'do thing',
        },
      ],
      leaderCommit: 1,
    },
    {
      type: 'EmptyAppendEntriesTimerRestart',
      source: 'leader',
    },
  ])
})

test('leader updates commitIndex when a log has be replicated to a majority of followers from client request', () => {
  const node: LeaderNode = {
    id: 'leader',
    mode: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'another follower'],
    },
    state: {
      currentTerm: 1,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: '',
        },
        {
          term: 1,
          command: 'do thing',
        },
      ],
    },
    volatileState: {
      commitIndex: 0,
      lastApplied: 0,
    },
    volatileLeaderState: {
      nextIndex: {
        follower: 1,
        'another follower': 1,
      },
      matchIndex: {
        follower: 0,
        'another follower': 0,
      },
    },
  }

  const events = next(node, {
    type: 'AppendEntriesResponse',
    source: 'follower',
    destination: 'leader',
    term: 1,
    success: true,
    request: {
      type: 'AppendEntriesRequest',
      clientRequest: {
        type: 'ClientCommandsRequest',
        source: 'client',
        destination: 'leader',
        commands: ['do thing'],
      },
      source: 'leader',
      destination: 'follower',
      term: 1,
      leaderId: 'leader',
      prevLogIndex: 0,
      prevLogTerm: 1,
      entries: [
        {
          term: 1,
          command: 'do thing',
        },
      ],
      leaderCommit: 0,
    },
  })

  expect(events).toEqual([
    {
      type: 'SaveVolatileLeaderState',
      source: 'leader',
      volatileLeaderState: {
        nextIndex: {
          follower: 2,
          'another follower': 1,
        },
        matchIndex: {
          follower: 1,
          'another follower': 0,
        },
      },
    },
    {
      type: 'SaveVolatileState',
      source: 'leader',
      volatileState: {
        commitIndex: 1,
        lastApplied: 0,
      },
    },
    {
      type: 'ClientCommandsResponse',
      destination: 'client',
      source: 'leader',
      success: true,
      request: {
        type: 'ClientCommandsRequest',
        source: 'client',
        destination: 'leader',
        commands: ['do thing'],
      },
    },
  ])
})

test('leader updates commitIndex when a log has be replicated to a majority of followers from follower catchup', () => {
  const node: LeaderNode = {
    id: 'leader',
    mode: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'another follower'],
    },
    state: {
      currentTerm: 1,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: '',
        },
        {
          term: 1,
          command: 'do thing',
        },
      ],
    },
    volatileState: {
      commitIndex: 0,
      lastApplied: 0,
    },
    volatileLeaderState: {
      nextIndex: {
        follower: 1,
        'another follower': 1,
      },
      matchIndex: {
        follower: 0,
        'another follower': 0,
      },
    },
  }

  const events = next(node, {
    type: 'AppendEntriesResponse',
    source: 'follower',
    destination: 'leader',
    term: 1,
    success: true,
    request: {
      type: 'AppendEntriesRequest',
      clientRequest: undefined,
      source: 'leader',
      destination: 'follower',
      term: 1,
      leaderId: 'leader',
      prevLogIndex: 0,
      prevLogTerm: 1,
      entries: [
        {
          term: 1,
          command: 'do thing',
        },
      ],
      leaderCommit: 0,
    },
  })

  expect(events).toEqual([
    {
      type: 'SaveVolatileLeaderState',
      source: 'leader',
      volatileLeaderState: {
        nextIndex: {
          follower: 2,
          'another follower': 1,
        },
        matchIndex: {
          follower: 1,
          'another follower': 0,
        },
      },
    },
    {
      type: 'SaveVolatileState',
      source: 'leader',
      volatileState: {
        commitIndex: 1,
        lastApplied: 0,
      },
    },
  ])
})

test('leader receive successful empty AppendEntries to avoid election', () => {
  const node: LeaderNode = {
    id: 'leader',
    mode: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'another follower'],
    },
    state: {
      currentTerm: 1,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: '',
        },
        {
          term: 1,
          command: 'do thing',
        },
      ],
    },
    volatileState: {
      commitIndex: 1,
      lastApplied: 1,
    },
    volatileLeaderState: {
      nextIndex: {
        follower: 2,
        'another follower': 2,
      },
      matchIndex: {
        follower: 1,
        'another follower': 1,
      },
    },
  }

  const events = next(node, {
    type: 'AppendEntriesResponse',
    source: 'follower',
    destination: 'leader',
    term: 1,
    success: true,
    request: {
      type: 'AppendEntriesRequest',
      clientRequest: undefined,
      source: 'leader',
      destination: 'follower',
      term: 1,
      leaderId: 'leader',
      prevLogIndex: 1,
      prevLogTerm: 1,
      entries: [],
      leaderCommit: 1,
    },
  })

  expect(events).toEqual([])
})

describe('calculateMajorityMatchIndex', () => {
  test.each([
    {
      majorityThreshold: 1.5,
      leaderIndex: 1,
      matchIndex: { f1: 0, f2: 0 },
      expectedMajority: 0,
    },
    {
      majorityThreshold: 1.5,
      leaderIndex: 1,
      matchIndex: { f1: 1, f2: 0 },
      expectedMajority: 1,
    },
    {
      majorityThreshold: 2.5,
      leaderIndex: 3,
      matchIndex: { f1: 3, f2: 2, f3: 1, f4: 1 },
      expectedMajority: 2,
    },
  ])(
    'leaderIndex $leaderIndex & $matchIndex should have majority of $expectedMajority',
    ({ majorityThreshold, leaderIndex, matchIndex, expectedMajority }) => {
      expect(
        calculateMajorityMatchIndex(
          majorityThreshold,
          leaderIndex,
          matchIndex as Index
        )
      ).toBe(expectedMajority)
    }
  )
})
