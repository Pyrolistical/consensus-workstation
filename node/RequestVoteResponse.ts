import type { CandidateNode, RequestVoteResponse, Event } from './types'

export default (node: CandidateNode, event: RequestVoteResponse): Event[] => {
  const majorityThreshold = node.configuration.peers.length / 2
  const voteResults = {
    ...node.voteResults,
    [event.source]: event.voteGranted,
  }
  return Object.values(voteResults).filter((x) => x).length > majorityThreshold
    ? [
        {
          type: 'ChangeMode',
          source: node.id,
          mode: 'leader',
        },
        {
          type: 'SaveVolatileLeaderState',
          source: 'A',
          volatileLeaderState: {
            nextIndex: Object.fromEntries(
              node.configuration.peers
                .filter((peer) => peer !== node.id)
                .map((peer) => [peer, node.state.log.length])
            ),
            matchIndex: Object.fromEntries(
              node.configuration.peers
                .filter((peer) => peer !== node.id)
                .map((peer) => [peer, 0])
            ),
          },
        },
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
    : [
        {
          type: 'SaveVoteResults',
          source: node.id,
          voteResults,
        },
      ]
}
