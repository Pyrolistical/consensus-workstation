import { isFollower, Node, ClientCommandsRequest, Event } from './types'

export default (node: Node, event: ClientCommandsRequest): Event[] => {
  const {
    id,
    configuration: { peers },
    state,
    volatileState: { commitIndex },
  } = node
  const { source, commands } = event
  const { currentTerm, log } = state
  if (isFollower(node)) {
    const { leaderId } = node
    return [
      {
        type: 'ClientCommandsResponse',
        destination: source,
        source: id,
        success: false,
        leaderId,
        request: event,
      },
    ]
  }

  const entries = commands.map((command) => ({
    term: currentTerm,
    command,
  }))
  return [
    {
      type: 'SaveNodeState',
      source: id,
      state: {
        ...state,
        log: [...log, ...entries],
      },
    },
    ...peers
      .filter((peer) => peer !== id)
      .map((peer) => ({
        type: 'AppendEntriesRequest' as const,
        clientRequest: event,
        source: id,
        destination: peer,
        term: currentTerm,
        leaderId: id,
        prevLogIndex: log.length - 1,
        prevLogTerm: log[log.length - 1]?.term ?? 1,
        entries,
        leaderCommit: commitIndex,
      })),
    {
      type: 'EmptyAppendEntriesTimerRestart',
      source: id,
    },
  ]
}
