import type { Node, ElectionTimerExpiry, Event } from './types'

export default (node: Node, event: ElectionTimerExpiry): Event[] => {
  return [
    {
      type: 'ChangeMode',
      source: node.id,
      mode: 'candidate',
    },
    {
      type: 'SaveNodeState',
      source: node.id,
      state: {
        ...node.state,
        currentTerm: node.state.currentTerm + 1,
      },
    },
    ...node.configuration.peers
      .filter((peer) => peer !== node.id)
      .map((nodeId) => {
        const lastLogTerm = node.state.log[node.state.log.length - 1]?.term ?? 1

        return {
          type: 'RequestVoteRequest' as const,
          source: node.id,
          destination: nodeId,
          term: node.state.currentTerm + 1,
          candidateId: node.id,
          lastLogIndex: node.state.log.length - 1,
          lastLogTerm,
        }
      }),
    {
      type: 'ElectionTimerRestart',
      source: node.id,
    },
  ]
}
