import type { Node, RequestVoteRequest, Event } from './types'

export default (node: Node, event: RequestVoteRequest): Event[] => {
  const lastTerm = node.state.log[event.lastLogIndex]?.term ?? 1
  const longerLog =
    lastTerm &&
    lastTerm >= event.lastLogTerm &&
    node.state.log.length - 1 > event.lastLogIndex
  const alreadyVoted =
    node.state.currentTerm === event.term &&
    node.state.votedFor !== event.source
  if (node.state.currentTerm > event.term || longerLog || alreadyVoted) {
    const result: Event[] = []
    if (node.state.currentTerm < event.term) {
      result.push({
        type: 'SaveNodeState',
        source: node.id,
        state: {
          ...node.state,
          currentTerm: event.term,
          votedFor: undefined,
        },
      })
    }
    return [
      ...result,
      {
        type: 'RequestVoteResponse',
        source: node.id,
        destination: event.source,
        term: Math.max(node.state.currentTerm, event.term),
        voteGranted: false,
        request: event,
      },
    ]
  }
  return [
    {
      type: 'SaveNodeState',
      source: node.id,
      state: {
        ...node.state,
        currentTerm: event.term,
        votedFor: event.source,
      },
    },
    {
      type: 'RequestVoteResponse',
      source: node.id,
      destination: event.source,
      term: event.term,
      voteGranted: true,
      request: event,
    },
  ]
}
