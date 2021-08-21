import { Event } from './events';

import Node from './node';
import Network from './network';

test('election started after leader fails', () => {
  const peers = ['leader', 'next candidate', 'follower'];
  const nodes = peers.map(Node);
  const network = Network(nodes);
  const events: Event[] = [
    {
      type: 'ConfigurationRestored',
      destination: 'leader',
      configuration: {
        peers
      }
    },
    {
      type: 'NodeStateRestored',
      destination: 'leader',
      state: {
        currentTerm: 1,
        votedFor: 'leader',
        log: [
          {
            term: 1,
            command: ''
          }
        ]
      }
    },
    {
      type: 'ConfigurationRestored',
      destination: 'next candidate',
      configuration: {
        peers
      }
    },
    {
      type: 'NodeStateRestored',
      destination: 'next candidate',
      state: {
        currentTerm: 1,
        votedFor: 'leader',
        log: [
          {
            term: 1,
            command: ''
          }
        ]
      }
    },
    {
      type: 'ConfigurationRestored',
      destination: 'follower',
      configuration: {
        peers
      }
    },
    {
      type: 'NodeStateRestored',
      destination: 'follower',
      state: {
        currentTerm: 1,
        votedFor: 'leader',
        log: [
          {
            term: 1,
            command: ''
          }
        ]
      }
    },
    {
      type: 'ElectionTimerEnded',
      destination: 'next candidate'
    }
  ];

  const results: Event[] = network.dispatch(events);

  expect(results).toEqual([
    {
      type: 'SaveNodeState',
      source: 'next candidate',
      state: {
        currentTerm: 2,
        votedFor: 'leader',
        log: [
          {
            term: 1,
            command: ''
          }
        ]
      }
    },
    {
      type: 'RequestVotesRequest',
      destination: 'leader',
      term: 2,
      candidateId: 'next candidate',
      lastLogIndex: 0,
      lastLogTerm: 1
    },
    {
      requestId: 0,
      type: 'RequestVotesRequest',
      destination: 'leader',
      term: 2,
      candidateId: 'next candidate',
      lastLogIndex: 0,
      lastLogTerm: 1
    },
    {
      type: 'RequestVotesRequest',
      destination: 'follower',
      term: 2,
      candidateId: 'next candidate',
      lastLogIndex: 0,
      lastLogTerm: 1
    },
    {
      requestId: 1,
      type: 'RequestVotesRequest',
      destination: 'follower',
      term: 2,
      candidateId: 'next candidate',
      lastLogIndex: 0,
      lastLogTerm: 1
    },
    {
      type: 'ElectionTimerStarted',
      source: 'next candidate'
    }
  ]);
});
