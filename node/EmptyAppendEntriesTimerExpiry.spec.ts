import next from './EmptyAppendEntriesTimerExpiry'
import type { LeaderNode } from './types'

test('send empty append entries when timer trips', () => {
  const node: LeaderNode = {
    id: 'A',
    mode: 'leader',
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
  }

  const events = next(node, {
    type: 'EmptyAppendEntriesTimerExpiry',
    destination: 'A',
  })

  expect(events).toEqual([
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
