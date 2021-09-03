import * as R from 'ramda';
import { Node, EmptyAppendEntriesTimerEnded, Event } from './types';

export default (node: Node, event: EmptyAppendEntriesTimerEnded): Event[] => {
  return [
    ...R.pipe(
      R.reject<string, 'array'>(R.equals(node.id)),
      R.map((peer) => ({
        type: 'AppendEntriesRequest',
        source: node.id,
        destination: peer,
        term: node.state.currentTerm,
        leaderId: node.id,
        prevLogIndex: node.state.log.length - 1,
        prevLogTerm: node.state.log[node.state.log.length - 1].term,
        entries: [],
        leaderCommit: node.volatileState.commitIndex
      }))
    )(node.configuration.peers) as Event[],
    {
      type: 'EmptyAppendEntriesTimerRestart',
      source: node.id
    }
  ];
};