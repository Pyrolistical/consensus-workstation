import next from './AppendEntriesRequest'

test('followers response success if append entries request passes consistency check', () => {
  const node = {
    id: 'follower',
    mode: 'follower' as const,
    leaderId: 'leader',
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
        }
      ]
    },
    volatileState: {
      commitIndex: 0,
      lastApplied: 0
    }
  };

  const events = next(node, {
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
  });

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
            command: ''
          },
          {
            term: 1,
            command: 'do thing'
          }
        ]
      }
    },
    {
      type: 'ElectionTimerRestart',
      source: 'follower'
    },
    {
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
    }
  ]);
});

test('followers update their commitIndex with the leaderCommit', () => {
  const node = {
    id: 'follower',
    mode: 'follower' as const,
    leaderId: 'leader',
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
    }
  };

  const events = next(node, {
    type: 'AppendEntriesRequest',
    clientId: 'client',
    source: 'leader',
    destination: 'follower',
    term: 1,
    leaderId: 'leader',
    prevLogIndex: 1,
    prevLogTerm: 1,
    entries: [],
    leaderCommit: 1
  });

  expect(events).toEqual([
    {
      type: 'SaveVolatileState',
      source: 'follower',
      volatileState: {
        commitIndex: 1,
        lastApplied: 0
      }
    },
    {
      type: 'ElectionTimerRestart',
      source: 'follower'
    },
    {
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
        prevLogIndex: 1,
        prevLogTerm: 1,
        entries: [],
        leaderCommit: 1
      }
    }
  ]);
})

test('superseeded leaders convert to followers when they see a higher term', () => {
  const node = {
    id: 'previous leader',
    mode: 'leader' as const,
    configuration: {
      peers: ['leader', 'follower', 'previous leader']
    },
    state: {
      currentTerm: 1,
      votedFor: 'previous leader',
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
      commitIndex: 1,
      lastApplied: 1
    },
    volatileLeaderState: {
      nextIndex: {
        follower: 2,
        'leader': 2
      },
      matchIndex: {
        follower: 1,
        'leader': 1
      }
    }
  };

  const events = next(node, {
    type: 'AppendEntriesRequest',
    clientId: 'client',
    source: 'leader',
    destination: 'previous leader',
    term: 2,
    leaderId: 'leader',
    prevLogIndex: 1,
    prevLogTerm: 1,
    entries: [],
    leaderCommit: 1
  });

  expect(events).toEqual([
    {
      type: 'ChangeMode',
      source: 'previous leader',
      mode: 'follower',
      leaderId: 'leader'
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
            command: ''
          },
          {
            term: 1,
            command: 'do thing'
          }
        ]
      }
    },
    {
      type: 'EmptyAppendEntriesTimerCancel',
      source: 'previous leader'
    },
    {
      type: 'ElectionTimerRestart',
      source: 'previous leader'
    },
    {
      type: 'AppendEntriesResponse',
      source: 'previous leader',
      destination: 'leader',
      term: 2,
      success: true,
      request: {
        type: 'AppendEntriesRequest',
        clientId: 'client',
        source: 'leader',
        destination: 'previous leader',
        term: 2,
        leaderId: 'leader',
        prevLogIndex: 1,
        prevLogTerm: 1,
        entries: [],
        leaderCommit: 1
      }
    }
  ]);
})