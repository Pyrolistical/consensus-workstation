import type { LeaderNode, AppendEntriesResponse, Event, Index } from './types'

function countLessThanOrEqualTo(index: number, array: number[]): number {
  return array.filter((item) => item >= index).length
}

export const calculateMajorityMatchIndex = (
  majorityThreshold: number,
  leaderIndex: number,
  matchIndex: Index
) => {
  const indices = Object.values(matchIndex)
  for (let index = leaderIndex; index >= 0; index--) {
    const count = countLessThanOrEqualTo(index, indices)
    if (1 + count >= majorityThreshold) {
      return index
    }
  }

  return -1
}

export default (
  {
    id,
    state: { currentTerm, log },
    configuration: { peers },
    volatileState,
    volatileLeaderState,
  }: LeaderNode,
  {
    success,
    source,
    request: { prevLogIndex, entries, clientRequest },
  }: AppendEntriesResponse
): Event[] => {
  if (success) {
    const updatedMatchIndex = {
      ...volatileLeaderState.matchIndex,
      [source]: prevLogIndex + entries.length,
    }
    const majorityMatchIndex = calculateMajorityMatchIndex(
      peers.length / 2,
      log.length - 1,
      updatedMatchIndex
    )
    const result: Event[] = []
    if (entries.length > 0) {
      result.push({
        type: 'SaveVolatileLeaderState',
        source: 'leader',
        volatileLeaderState: {
          nextIndex: {
            ...volatileLeaderState.nextIndex,
            [source]: prevLogIndex + entries.length + 1,
          },
          matchIndex: updatedMatchIndex,
        },
      })
    }
    if (majorityMatchIndex > volatileState.commitIndex) {
      result.push({
        type: 'SaveVolatileState',
        source: id,
        volatileState: {
          ...volatileState,
          commitIndex: majorityMatchIndex,
        },
      })
      if (clientRequest) {
        result.push({
          type: 'ClientCommandsResponse',
          destination: clientRequest.source,
          source: id,
          success: true,
          request: clientRequest,
        })
      }
    }
    return result
  } else {
    const nextIndex = (volatileLeaderState.nextIndex[source] ?? 1) - 1
    const previousLogIndex = nextIndex - 1
    return [
      {
        type: 'SaveVolatileLeaderState',
        source: 'leader',
        volatileLeaderState: {
          ...volatileLeaderState,
          nextIndex: {
            ...volatileLeaderState.nextIndex,
            [source]: nextIndex,
          },
        },
      },
      {
        type: 'AppendEntriesRequest',
        clientRequest,
        source: id,
        destination: source,
        term: currentTerm,
        leaderId: id,
        prevLogIndex: previousLogIndex,
        prevLogTerm: log[previousLogIndex]?.term ?? 1,
        entries: log.slice(-(log.length - 1 - previousLogIndex)),
        leaderCommit: volatileState.commitIndex,
      },
      {
        type: 'EmptyAppendEntriesTimerRestart',
        source: id,
      },
    ]
  }
}
