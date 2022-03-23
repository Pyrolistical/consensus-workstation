import next from './RequestVoteResponse'

test('save vote results before majority is reached', () => {
  const node = {
    id: 'A',
    mode: 'candidate' as const,
    configuration: {
      peers: ['A', 'B', 'C'],
    },
    state: {
      currentTerm: 3,
      votedFor: 'A',
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
    voteResults: {
      A: true,
    },
  }

  const events = next(node, {
    type: 'RequestVoteResponse',
    source: 'B',
    destination: 'A',
    term: 3,
    voteGranted: false,
    request: {
      type: 'RequestVoteRequest',
      source: 'A',
      destination: 'B',
      term: 3,
      candidateId: 'A',
      lastLogIndex: 0,
      lastLogTerm: 1,
    },
  })

  expect(events).toEqual([
    {
      type: 'SaveVoteResults',
      source: 'A',
      voteResults: {
        A: true,
        B: false,
      },
    },
  ])
})

test('become the leader if received majority votes', () => {
  const node = {
    id: 'A',
    mode: 'candidate' as const,
    configuration: {
      peers: ['A', 'B', 'C'],
    },
    state: {
      currentTerm: 3,
      votedFor: 'A',
      log: [
        {
          term: 1,
          command: '',
        },
      ],
    },
    volatileState: {
      commitIndex: 1,
      lastApplied: 0,
    },
    voteResults: {
      A: true,
    },
  }

  const events = next(node, {
    type: 'RequestVoteResponse',
    source: 'B',
    destination: 'A',
    term: 3,
    voteGranted: true,
    request: {
      type: 'RequestVoteRequest',
      source: 'A',
      destination: 'B',
      term: 3,
      candidateId: 'A',
      lastLogIndex: 0,
      lastLogTerm: 1,
    },
  })

  expect(events).toEqual([
    {
      type: 'ChangeMode',
      source: 'A',
      mode: 'leader',
    },
    {
      type: 'SaveVolatileLeaderState',
      source: 'A',
      volatileLeaderState: {
        nextIndex: {
          B: 1,
          C: 1,
        },
        matchIndex: {
          B: 0,
          C: 0,
        },
      },
    },
    {
      type: 'AppendEntriesRequest',
      source: 'A',
      destination: 'B',
      term: 3,
      leaderId: 'A',
      prevLogIndex: 0,
      prevLogTerm: 1,
      entries: [],
      leaderCommit: 1,
    },
    {
      type: 'AppendEntriesRequest',
      source: 'A',
      destination: 'C',
      term: 3,
      leaderId: 'A',
      prevLogIndex: 0,
      prevLogTerm: 1,
      entries: [],
      leaderCommit: 1,
    },
    {
      type: 'EmptyAppendEntriesTimerRestart',
      source: 'A',
    },
  ])
})
