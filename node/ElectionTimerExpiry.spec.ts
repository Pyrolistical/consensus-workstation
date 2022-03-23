import next from './ElectionTimerExpiry'
import type { FollowerNode } from './types'

test('election started after leader fails', () => {
  const node: FollowerNode = {
    id: 'B',
    mode: 'follower',
    leaderId: 'A',
    configuration: {
      peers: ['A', 'B', 'C'],
    },
    state: {
      currentTerm: 1,
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
  }

  const events = next(node, {
    type: 'ElectionTimerExpiry',
    destination: 'B',
  })

  expect(events).toEqual([
    {
      type: 'ChangeMode',
      source: 'B',
      mode: 'candidate',
    },
    {
      type: 'SaveNodeState',
      source: 'B',
      state: {
        currentTerm: 2,
        votedFor: 'A',
        log: [
          {
            term: 1,
            command: '',
          },
        ],
      },
    },
    {
      type: 'RequestVoteRequest',
      source: 'B',
      destination: 'A',
      term: 2,
      candidateId: 'B',
      lastLogIndex: 0,
      lastLogTerm: 1,
    },
    {
      type: 'RequestVoteRequest',
      source: 'B',
      destination: 'C',
      term: 2,
      candidateId: 'B',
      lastLogIndex: 0,
      lastLogTerm: 1,
    },
    {
      type: 'ElectionTimerRestart',
      source: 'B',
    },
  ])
})
