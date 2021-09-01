import * as R from 'ramda';
import {ElectionTimerEnded, Event} from './events';

export default (node, event: ElectionTimerEnded): Event[] => {
  return #[
    #{
      type: 'SaveNodeState',
      source: node.id,
      state: #{
        ...node.state,
        currentTerm: node.state.currentTerm + 1
      }
    },
    ...R.pipe(
      R.reject(R.equals(node.id)),
      R.map(nodeId => {
        const { term: lastLogTerm } = R.last(node.state.log);
        return #{
          type: 'RequestVotesRequest',
          source: node.id,
          destination: nodeId,
          term: node.state.currentTerm + 1,
          candidateId: node.id,
          lastLogIndex: node.state.log.length - 1,
          lastLogTerm
        };
      })
    )(node.configuration.peers),
    #{
      type: 'ElectionTimerStarted',
      source: node.id
    }
  ];
};