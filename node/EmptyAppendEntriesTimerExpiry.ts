import * as R from 'ramda';
import { Node, EmptyAppendEntriesTimerExpiry, Event } from './types';

export default (node: Node, event: EmptyAppendEntriesTimerExpiry): Event[] => {
  return [
    ...R.pipe(
      R.reject<string, 'array'>(R.equals(node.id)),
      R.map((peer) => ({
        type: 'AppendEntriesRequest' as const,
        clientRequest: undefined,
        source: node.id,
        destination: peer,
        term: node.state.currentTerm,
        leaderId: node.id,
        prevLogIndex: node.state.log.length - 1,
        prevLogTerm: R.pathOr(1, [node.state.log.length - 1, 'term'], node.state.log),
        entries: [],
        leaderCommit: node.volatileState.commitIndex
      }))
    )(node.configuration.peers),
    {
      type: 'EmptyAppendEntriesTimerRestart',
      source: node.id
    }
  ];
};