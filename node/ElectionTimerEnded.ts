import * as R from 'ramda';
import { Node, ElectionTimerEnded, Event } from './types';

export default (node: Node, event: ElectionTimerEnded): Event[] => {
  return [
    {
      type: 'ChangeMode',
      source: node.id,
      mode: 'candidate'
    },
    {
      type: 'SaveNodeState',
      source: node.id,
      state: {
        ...node.state,
        currentTerm: node.state.currentTerm + 1
      }
    },
    ...R.pipe(
      R.reject<string, 'array'>(R.equals(node.id)),
      R.map(nodeId => {
        const lastLogTerm = R.pathOr(1, [node.state.log.length - 1, 'term'], node.state.log);
        return {
          type: 'RequestVotesRequest',
          source: node.id,
          destination: nodeId,
          term: node.state.currentTerm + 1,
          candidateId: node.id,
          lastLogIndex: node.state.log.length - 1,
          lastLogTerm
        };
      })
    )(node.configuration.peers) as Event[],
    {
      type: 'ElectionTimerRestart',
      source: node.id
    }
  ];
};