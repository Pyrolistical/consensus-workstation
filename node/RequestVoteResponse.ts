import type { CandidateNode, RequestVoteResponse, Event } from './types'

export default (
  {
    id,
    configuration: { peers },
    state: { currentTerm, log },
    volatileState: { commitIndex },
    voteResults: previousVoteResults,
  }: CandidateNode,
  { source, voteGranted }: RequestVoteResponse
): Event[] => {
  const majorityThreshold = peers.length / 2
  const voteResults = {
    ...previousVoteResults,
    [source]: voteGranted,
  }
  return Object.values(voteResults).filter((x) => x).length > majorityThreshold
    ? [
        {
          type: 'ChangeMode',
          source: id,
          mode: 'leader',
        },
        {
          type: 'SaveVolatileLeaderState',
          source: 'A',
          volatileLeaderState: {
            nextIndex: Object.fromEntries(
              peers
                .filter((peer) => peer !== id)
                .map((peer) => [peer, log.length])
            ),
            matchIndex: Object.fromEntries(
              peers.filter((peer) => peer !== id).map((peer) => [peer, 0])
            ),
          },
        },
        ...peers
          .filter((peer) => peer !== id)
          .map((peer) => ({
            type: 'AppendEntriesRequest' as const,
            clientRequest: undefined,
            source: id,
            destination: peer,
            term: currentTerm,
            leaderId: id,
            prevLogIndex: log.length - 1,
            prevLogTerm: log[log.length - 1]?.term ?? 1,
            entries: [],
            leaderCommit: commitIndex,
          })),
        {
          type: 'EmptyAppendEntriesTimerRestart',
          source: id,
        },
      ]
    : [
        {
          type: 'SaveVoteResults',
          source: id,
          voteResults,
        },
      ]
}
