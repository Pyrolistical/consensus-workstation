import * as R from 'ramda';

import { Node, ClientCommandsRequest, Event } from './types';

export default (node: Node, event: ClientCommandsRequest): Event[] => {
  if (node.mode === 'follower') {
    return [
      {
        type: 'ClientCommandsResponse',
        destination: event.source,
        source: node.id,
        success: false,
        leaderId: node.leaderId
      }
    ];
  }

  const entries = event.commands.map((command) => ({
    term: node.state.currentTerm,
    command
  }));
  return [
    {
      type: 'SaveNodeState',
      source: node.id,
      state: {
        ...node.state,
        log: [
          ...node.state.log,
          ...entries
        ]
      }
    },
    ...R.pipe(
      R.reject<string, 'array'>(R.equals(node.id)),
      R.map((peer) => ({
        type: 'AppendEntriesRequest' as const,
        clientId: event.source,
        source: node.id,
        destination: peer,
        term: node.state.currentTerm,
        leaderId: node.id,
        prevLogIndex: node.state.log.length - 1,
        prevLogTerm: R.pathOr(1, [node.state.log.length - 1, 'term'], node.state.log),
        entries,
        leaderCommit: node.volatileState.commitIndex
      }))
    )(node.configuration.peers),
    {
      type: 'EmptyAppendEntriesTimerRestart',
      source: node.id
    }
  ];
};