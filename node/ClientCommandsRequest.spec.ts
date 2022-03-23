import next from './ClientCommandsRequest'

test('client request are distributed from leader to peers', () => {
  const node = {
    id: 'leader',
    mode: 'leader' as const,
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
    type: 'ClientCommandsRequest',
    source: 'client',
    destination: 'leader',
    commands: ['do thing'],
  })

  expect(events).toEqual([
    {
      type: 'SaveNodeState',
      source: 'leader',
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
    {
      type: 'AppendEntriesRequest',
      clientRequest: {
        type: 'ClientCommandsRequest',
        source: 'client',
        destination: 'leader',
        commands: ['do thing'],
      },
      source: 'leader',
      destination: 'another follower',
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
    {
      type: 'EmptyAppendEntriesTimerRestart',
      source: 'leader',
    },
  ])
})

test('client request is rejected if node is not the leader', () => {
  const node = {
    id: 'follower',
    mode: 'follower' as const,
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
    type: 'ClientCommandsRequest',
    source: 'client',
    destination: 'follower',
    commands: ['do thing'],
  })

  expect(events).toEqual([
    {
      type: 'ClientCommandsResponse',
      destination: 'client',
      source: 'follower',
      success: false,
      leaderId: 'leader',
      request: {
        type: 'ClientCommandsRequest',
        source: 'client',
        destination: 'follower',
        commands: ['do thing'],
      },
    },
  ])
})
