import type { Node, EmptyAppendEntriesTimerExpiry, Event } from './types'

export default (node: Node, event: EmptyAppendEntriesTimerExpiry): Event[] => {
  return [
    ...node.configuration.peers
      .filter((peer) => peer !== node.id)
      .map((peer) => ({
        type: 'AppendEntriesRequest' as const,
        clientRequest: undefined,
        source: node.id,
        destination: peer,
        term: node.state.currentTerm,
        leaderId: node.id,
        prevLogIndex: node.state.log.length - 1,
        prevLogTerm: node.state.log[node.state.log.length - 1]?.term ?? 1,
        entries: [],
        leaderCommit: node.volatileState.commitIndex,
      })),
    {
      type: 'EmptyAppendEntriesTimerRestart',
      source: node.id,
    },
  ]
}
