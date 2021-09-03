import * as R from 'ramda';

import { Node, RequestVoteRequest, Event } from './types';

export default (node: Node, event: RequestVoteRequest): Event[] => {
  const lastTerm: number | undefined = R.path([event.lastLogIndex, 'term'], node.state.log);
  const longerLog = lastTerm && lastTerm >= event.lastLogTerm && node.state.log.length - 1 > event.lastLogIndex;
  const alreadyVoted = node.state.currentTerm === event.term && node.state.votedFor !== event.source;
  if (node.state.currentTerm > event.term || longerLog || alreadyVoted) {
    const result: Event[] = [];
    if (node.state.currentTerm < event.term) {
      result.push(
        {
          type: 'SaveNodeState',
          source: node.id,
          state: {
            ...node.state,
            currentTerm: event.term,
            votedFor: null
          }
        }
      );
    }
    return [
      ...result,
      {
        type: 'RequestVoteResponse',
        source: node.id,
        destination: event.source,
        term: Math.max(node.state.currentTerm, event.term),
        voteGranted: false,
        request: event
      }
    ];
  }
  return [
    {
      type: 'SaveNodeState',
      source: node.id,
      state: {
        ...node.state,
        currentTerm: event.term,
        votedFor: event.source
      }
    },
    {
      type: 'RequestVoteResponse',
      source: node.id,
      destination: event.source,
      term: event.term,
      voteGranted: true,
      request: event
    }
  ];
};
