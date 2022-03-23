import type { Node, RequestVoteRequest, Event } from './types'

export default ({ id, state }: Node, event: RequestVoteRequest): Event[] => {
  const { currentTerm, log, votedFor } = state
  const { source, term, lastLogIndex, lastLogTerm } = event
  const lastTerm = log[lastLogIndex]?.term ?? 1
  const longerLog =
    lastTerm && lastTerm >= lastLogTerm && log.length - 1 > lastLogIndex
  const alreadyVoted = currentTerm === term && votedFor !== source
  if (currentTerm > term || longerLog || alreadyVoted) {
    const result: Event[] = []
    if (currentTerm < term) {
      result.push({
        type: 'SaveNodeState',
        source: id,
        state: {
          ...state,
          currentTerm: term,
          votedFor: undefined,
        },
      })
    }
    return [
      ...result,
      {
        type: 'RequestVoteResponse',
        source: id,
        destination: source,
        term: Math.max(currentTerm, term),
        voteGranted: false,
        request: event,
      },
    ]
  }
  return [
    {
      type: 'SaveNodeState',
      source: id,
      state: {
        ...state,
        currentTerm: term,
        votedFor: source,
      },
    },
    {
      type: 'RequestVoteResponse',
      source: id,
      destination: source,
      term,
      voteGranted: true,
      request: event,
    },
  ]
}
