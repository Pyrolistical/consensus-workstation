import type { Node, EmptyAppendEntriesTimerExpiry, Event } from './types'

export default (
  {
    id,
    state: { currentTerm, log },
    configuration: { peers },
    volatileState: { commitIndex },
  }: Node,
  event: EmptyAppendEntriesTimerExpiry
): Event[] => {
  return [
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
}
