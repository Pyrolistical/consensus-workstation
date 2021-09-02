import next from './RequestVoteRequest'

test('node rejects vote if own term is higher', () => {
  const node = {
    id: 'follower',
    mode: 'follower' as const,
    leaderId: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'another node']
    },
    state: {
      currentTerm: 3,
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
    type: 'RequestVoteRequest',
    source: 'another node',
    destination: 'follower',
    term: 2,
    candidateId: 'another node',
    lastLogIndex: 0,
    lastLogTerm: 1
  });

  expect(events).toEqual([
    {
      type: 'RequestVoteResponse',
      source: 'follower',
      destination: 'another node',
      term: 3,
      voteGranted: false,
      request: {
        type: 'RequestVoteRequest',
        source: 'another node',
        destination: 'follower',
        term: 2,
        candidateId: 'another node',
        lastLogIndex: 0,
        lastLogTerm: 1
      }
    }
  ]);
});

test('node rejects vote if own log is longer', () => {
  const node = {
    id: 'follower',
    mode: 'follower' as const,
    leaderId: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'another node']
    },
    state: {
      currentTerm: 2,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: ''
        },
        {
          term: 2,
          command: ''
        },
        {
          term: 2,
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
    type: 'RequestVoteRequest',
    source: 'another node',
    destination: 'follower',
    term: 3,
    candidateId: 'another node',
    lastLogIndex: 1,
    lastLogTerm: 2
  });

  expect(events).toEqual([
    {
      type: 'SaveNodeState',
      source: 'follower',
      state: {
        currentTerm: 3,
        votedFor: null,
        log: [
          {
            term: 1,
            command: ''
          },
          {
            term: 2,
            command: ''
          },
          {
            term: 2,
            command: ''
          }
        ]
      }
    },
    {
      type: 'RequestVoteResponse',
      source: 'follower',
      destination: 'another node',
      term: 3,
      voteGranted: false,
      request: {
        type: 'RequestVoteRequest',
        source: 'another node',
        destination: 'follower',
        term: 3,
        candidateId: 'another node',
        lastLogIndex: 1,
        lastLogTerm: 2
      }
    }
  ]);
});

test('node rejects vote if already voted for somebody else in current term', () => {
  const node = {
    id: 'follower',
    mode: 'follower' as const,
    leaderId: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'another node']
    },
    state: {
      currentTerm: 3,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: ''
        },
        {
          term: 2,
          command: ''
        },
        {
          term: 2,
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
    type: 'RequestVoteRequest',
    source: 'another node',
    destination: 'follower',
    term: 3,
    candidateId: 'another node',
    lastLogIndex: 1,
    lastLogTerm: 2
  });

  expect(events).toEqual([
    {
      type: 'RequestVoteResponse',
      source: 'follower',
      destination: 'another node',
      term: 3,
      voteGranted: false,
      request: {
        type: 'RequestVoteRequest',
        source: 'another node',
        destination: 'follower',
        term: 3,
        candidateId: 'another node',
        lastLogIndex: 1,
        lastLogTerm: 2
      }
    }
  ]);
});


test('grant vote of candidate log is as long as own', () => {
  const node = {
    id: 'follower',
    mode: 'follower' as const,
    leaderId: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'another node']
    },
    state: {
      currentTerm: 2,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: ''
        },
        {
          term: 2,
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
    type: 'RequestVoteRequest',
    source: 'another node',
    destination: 'follower',
    term: 3,
    candidateId: 'another node',
    lastLogIndex: 1,
    lastLogTerm: 2
  });

  expect(events).toEqual([
    {
      type: 'SaveNodeState',
      source: 'follower',
      state: {
        currentTerm: 3,
        votedFor: 'another node',
        log: [
          {
            term: 1,
            command: ''
          },
          {
            term: 2,
            command: ''
          }
        ]
      }
    },
    {
      type: 'RequestVoteResponse',
      source: 'follower',
      destination: 'another node',
      term: 3,
      voteGranted: true,
      request: {
        type: 'RequestVoteRequest',
        source: 'another node',
        destination: 'follower',
        term: 3,
        candidateId: 'another node',
        lastLogIndex: 1,
        lastLogTerm: 2
      }
    }
  ]);
});
