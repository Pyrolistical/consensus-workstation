import * as R from 'ramda';

import {Node, ClientCommandsRequest, Event} from './types';

export default (node: Node, event: ClientCommandsRequest): Event[] => {
  if (node.configuration.state === 'follower') {
    return #[
      #{
        type: 'ClientCommandsResponse',
        destination: event.source,
        source: node.id,
        success: false,
        leaderId: node.configuration.leaderId
      }
    ];
  }

  const entries = #[
    ...event.commands.map((command) => #{
      term: node.state.currentTerm,
      command
    })
  ];
  return #[
    #{
      type: 'SaveNodeState',
      source: node.id,
      state: #{
        ...node.state,
        log: #[
          ...node.state.log,
          ...entries
        ]
      }
    },
    ...R.pipe(
      R.reject(R.equals(node.id)),
      R.map((peer) => #{
        type: 'AppendEntriesRequest',
        clientId: event.source,
        source: node.id,
        destination: peer,
        term: node.state.currentTerm,
        leaderId: node.id,
        prevLogIndex: node.state.log.length - 1,
        prevLogTerm: node.state.log[node.state.log.length - 1].term,
        entries,
        leaderCommit: node.volatileState.commitIndex
      })
    )(node.configuration.peers)
  ];
};