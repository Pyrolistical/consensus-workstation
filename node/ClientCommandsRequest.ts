import type { Node, ClientCommandsRequest, Event } from './types'

export default (node: Node, event: ClientCommandsRequest): Event[] => {
  if (node.mode === 'follower') {
    return [
      {
        type: 'ClientCommandsResponse',
        destination: event.source,
        source: node.id,
        success: false,
        leaderId: node.leaderId,
        request: event,
      },
    ]
  }

  const entries = event.commands.map((command) => ({
    term: node.state.currentTerm,
    command,
  }))
  return [
    {
      type: 'SaveNodeState',
      source: node.id,
      state: {
        ...node.state,
        log: [...node.state.log, ...entries],
      },
    },
    ...node.configuration.peers
      .filter((peer) => peer !== node.id)
      .map((peer) => ({
        type: 'AppendEntriesRequest' as const,
        clientRequest: event,
        source: node.id,
        destination: peer,
        term: node.state.currentTerm,
        leaderId: node.id,
        prevLogIndex: node.state.log.length - 1,
        prevLogTerm: node.state.log[node.state.log.length - 1]?.term ?? 1,
        entries,
        leaderCommit: node.volatileState.commitIndex,
      })),
    {
      type: 'EmptyAppendEntriesTimerRestart',
      source: node.id,
    },
  ]
}
