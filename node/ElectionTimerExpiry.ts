import type { Node, ElectionTimerExpiry, Event } from './types'

export default (
  { id, state, configuration: { peers } }: Node,
  event: ElectionTimerExpiry
): Event[] => {
  const { currentTerm, log } = state
  return [
    {
      type: 'ChangeMode',
      source: id,
      mode: 'candidate',
    },
    {
      type: 'SaveNodeState',
      source: id,
      state: {
        ...state,
        currentTerm: currentTerm + 1,
      },
    },
    ...peers
      .filter((peer) => peer !== id)
      .map((nodeId) => {
        const lastLogTerm = log[log.length - 1]?.term ?? 1

        return {
          type: 'RequestVoteRequest' as const,
          source: id,
          destination: nodeId,
          term: currentTerm + 1,
          candidateId: id,
          lastLogIndex: log.length - 1,
          lastLogTerm,
        }
      }),
    {
      type: 'ElectionTimerRestart',
      source: id,
    },
  ]
}
