import * as R from 'ramda';

import {Node, RequestVoteRequest, Event} from './types';

export default (node: Node, event: RequestVoteRequest): Event[] => {
  const longerLog = R.path([event.lastLogIndex, 'term'], node.state.log) >= event.lastLogTerm && node.state.log.length > event.lastLogIndex;
  if (node.state.currentTerm > event.term || longerLog) {
    return #[
      #{
        type: 'RequestVoteResponse',
        source: node.id,
        destination: event.source,
        term: node.state.currentTerm,
        voteGranted: false,
        request: event
      }
    ];
  }
  return #[];
};
