import next from './AppendEntriesRequest'
import type { FollowerNode, LeaderNode } from './types'

test('followers response success if append entries request passes consistency check', () => {
  const node: FollowerNode = {
    id: 'follower',
    mode: 'follower',
    leaderId: 'leader',
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
      ],
    },
    volatileState: {
      commitIndex: 0,
      lastApplied: 0,
    },
  }

  const events = next(node, {
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
  })

  expect(events).toEqual([
    {
      type: 'SaveNodeState',
      source: 'follower',
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
    },
    {
      type: 'ElectionTimerRestart',
      source: 'follower',
    },
    {
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
    },
  ])
})

test('followers response failure if they do not share a common log at given index', () => {
  const node: FollowerNode = {
    id: 'follower',
    mode: 'follower',
    leaderId: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'another follower'],
    },
    state: {
      currentTerm: 2,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: '',
        },
        {
          term: 2,
          command: '',
        },
      ],
    },
    volatileState: {
      commitIndex: 0,
      lastApplied: 0,
    },
  }

  const events = next(node, {
    type: 'AppendEntriesRequest',
    clientRequest: {
      type: 'ClientCommandsRequest',
      source: 'client',
      destination: 'leader',
      commands: ['do thing'],
    },
    source: 'leader',
    destination: 'follower',
    term: 3,
    leaderId: 'leader',
    prevLogIndex: 1,
    prevLogTerm: 3,
    entries: [
      {
        term: 3,
        command: 'do thing',
      },
    ],
    leaderCommit: 1,
  })

  expect(events).toEqual([
    {
      type: 'SaveNodeState',
      source: 'follower',
      state: {
        currentTerm: 3,
        votedFor: 'leader',
        log: [
          {
            term: 1,
            command: '',
          },
        ],
      },
    },
    {
      type: 'ElectionTimerRestart',
      source: 'follower',
    },
    {
      type: 'AppendEntriesResponse',
      source: 'follower',
      destination: 'leader',
      term: 3,
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
        term: 3,
        leaderId: 'leader',
        prevLogIndex: 1,
        prevLogTerm: 3,
        entries: [
          {
            term: 3,
            command: 'do thing',
          },
        ],
        leaderCommit: 1,
      },
    },
  ])
})

test('previous leader response failure if they do not share a common log at given index', () => {
  const node: LeaderNode = {
    id: 'previous leader',
    mode: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'previous leader'],
    },
    state: {
      currentTerm: 2,
      votedFor: 'previous leader',
      log: [
        {
          term: 1,
          command: '',
        },
        {
          term: 2,
          command: '',
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
        leader: 1,
      },
      matchIndex: {
        follower: 0,
        leader: 0,
      },
    },
  }

  const events = next(node, {
    type: 'AppendEntriesRequest',
    clientRequest: {
      type: 'ClientCommandsRequest',
      source: 'client',
      destination: 'leader',
      commands: ['do thing'],
    },
    source: 'leader',
    destination: 'previous leader',
    term: 3,
    leaderId: 'leader',
    prevLogIndex: 1,
    prevLogTerm: 3,
    entries: [
      {
        term: 3,
        command: 'do thing',
      },
    ],
    leaderCommit: 1,
  })

  expect(events).toEqual([
    {
      type: 'ChangeMode',
      source: 'previous leader',
      mode: 'follower',
      leaderId: 'leader',
    },
    {
      type: 'EmptyAppendEntriesTimerCancel',
      source: 'previous leader',
    },
    {
      type: 'SaveNodeState',
      source: 'previous leader',
      state: {
        currentTerm: 3,
        votedFor: 'previous leader',
        log: [
          {
            term: 1,
            command: '',
          },
        ],
      },
    },
    {
      type: 'ElectionTimerRestart',
      source: 'previous leader',
    },
    {
      type: 'AppendEntriesResponse',
      source: 'previous leader',
      destination: 'leader',
      term: 3,
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
        destination: 'previous leader',
        term: 3,
        leaderId: 'leader',
        prevLogIndex: 1,
        prevLogTerm: 3,
        entries: [
          {
            term: 3,
            command: 'do thing',
          },
        ],
        leaderCommit: 1,
      },
    },
  ])
})

test('followers update their commitIndex with the leaderCommit', () => {
  const node: FollowerNode = {
    id: 'follower',
    mode: 'follower',
    leaderId: 'leader',
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
  }

  const events = next(node, {
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
  })

  expect(events).toEqual([
    {
      type: 'SaveVolatileState',
      source: 'follower',
      volatileState: {
        commitIndex: 1,
        lastApplied: 0,
      },
    },
    {
      type: 'ElectionTimerRestart',
      source: 'follower',
    },
    {
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
        prevLogIndex: 1,
        prevLogTerm: 1,
        entries: [],
        leaderCommit: 1,
      },
    },
  ])
})

test('superseeded leaders convert to followers when they see a higher term', () => {
  const node: LeaderNode = {
    id: 'previous leader',
    mode: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'previous leader'],
    },
    state: {
      currentTerm: 1,
      votedFor: 'previous leader',
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
        leader: 2,
      },
      matchIndex: {
        follower: 1,
        leader: 1,
      },
    },
  }

  const events = next(node, {
    type: 'AppendEntriesRequest',
    clientRequest: {
      type: 'ClientCommandsRequest',
      source: 'client',
      destination: 'leader',
      commands: ['do thing'],
    },
    source: 'leader',
    destination: 'previous leader',
    term: 2,
    leaderId: 'leader',
    prevLogIndex: 1,
    prevLogTerm: 1,
    entries: [
      {
        term: 2,
        command: 'do thing',
      },
    ],
    leaderCommit: 1,
  })

  expect(events).toEqual([
    {
      type: 'ChangeMode',
      source: 'previous leader',
      mode: 'follower',
      leaderId: 'leader',
    },
    {
      type: 'EmptyAppendEntriesTimerCancel',
      source: 'previous leader',
    },
    {
      type: 'SaveNodeState',
      source: 'previous leader',
      state: {
        currentTerm: 2,
        votedFor: 'previous leader',
        log: [
          {
            term: 1,
            command: '',
          },
          {
            term: 1,
            command: 'do thing',
          },
          {
            term: 2,
            command: 'do thing',
          },
        ],
      },
    },
    {
      type: 'ElectionTimerRestart',
      source: 'previous leader',
    },
    {
      type: 'AppendEntriesResponse',
      source: 'previous leader',
      destination: 'leader',
      term: 2,
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
        destination: 'previous leader',
        term: 2,
        leaderId: 'leader',
        prevLogIndex: 1,
        prevLogTerm: 1,
        entries: [
          {
            term: 2,
            command: 'do thing',
          },
        ],
        leaderCommit: 1,
      },
    },
  ])
})

test('reject requests with lower terms', () => {
  const node: FollowerNode = {
    id: 'follower',
    mode: 'follower',
    leaderId: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'previous leader'],
    },
    state: {
      currentTerm: 2,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: '',
        },
        {
          term: 2,
          command: 'do thing',
        },
      ],
    },
    volatileState: {
      commitIndex: 1,
      lastApplied: 1,
    },
  }

  const events = next(node, {
    type: 'AppendEntriesRequest',
    clientRequest: {
      type: 'ClientCommandsRequest',
      source: 'client',
      destination: 'leader',
      commands: ['do thing'],
    },
    source: 'previous leader',
    destination: 'follower',
    term: 1,
    leaderId: 'previous leader',
    prevLogIndex: 0,
    prevLogTerm: 0,
    entries: [],
    leaderCommit: 1,
  })

  expect(events).toEqual([
    {
      type: 'AppendEntriesResponse',
      source: 'follower',
      destination: 'previous leader',
      term: 2,
      success: false,
      request: {
        type: 'AppendEntriesRequest',
        clientRequest: {
          type: 'ClientCommandsRequest',
          source: 'client',
          destination: 'leader',
          commands: ['do thing'],
        },
        source: 'previous leader',
        destination: 'follower',
        term: 1,
        leaderId: 'previous leader',
        prevLogIndex: 0,
        prevLogTerm: 0,
        entries: [],
        leaderCommit: 1,
      },
    },
  ])
})
