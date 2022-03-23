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
  /* istanbul ignore next */
  return -1
}

export default (node: LeaderNode, event: AppendEntriesResponse): Event[] => {
  if (event.success) {
    const updatedMatchIndex = {
      ...node.volatileLeaderState.matchIndex,
      [event.source]: event.request.prevLogIndex + event.request.entries.length,
    }
    const majorityMatchIndex = calculateMajorityMatchIndex(
      node.configuration.peers.length / 2,
      node.state.log.length - 1,
      updatedMatchIndex
    )
    const result: Event[] = []
    if (event.request.entries.length > 0) {
      result.push({
        type: 'SaveVolatileLeaderState',
        source: 'leader',
        volatileLeaderState: {
          nextIndex: {
            ...node.volatileLeaderState.nextIndex,
            [event.source]:
              event.request.prevLogIndex + event.request.entries.length + 1,
          },
          matchIndex: updatedMatchIndex,
        },
      })
    }
    if (majorityMatchIndex > node.volatileState.commitIndex) {
      result.push({
        type: 'SaveVolatileState',
        source: node.id,
        volatileState: {
          ...node.volatileState,
          commitIndex: majorityMatchIndex,
        },
      })
      if (event.request.clientRequest) {
        result.push({
          type: 'ClientCommandsResponse',
          destination: event.request.clientRequest.source,
          source: node.id,
          success: true,
          request: event.request.clientRequest,
        })
      }
    }
    return result
  } else {
    const nextIndex =
      (node.volatileLeaderState.nextIndex[event.source] ?? 1) - 1
    const previousLogIndex = nextIndex - 1
    return [
      {
        type: 'SaveVolatileLeaderState',
        source: 'leader',
        volatileLeaderState: {
          ...node.volatileLeaderState,
          nextIndex: {
            ...node.volatileLeaderState.nextIndex,
            [event.source]: nextIndex,
          },
        },
      },
      {
        type: 'AppendEntriesRequest',
        clientRequest: event.request.clientRequest,
        source: node.id,
        destination: event.source,
        term: node.state.currentTerm,
        leaderId: node.id,
        prevLogIndex: previousLogIndex,
        prevLogTerm: node.state.log[previousLogIndex]?.term ?? 1,
        entries: node.state.log.slice(
          -(node.state.log.length - 1 - previousLogIndex)
        ),
        leaderCommit: node.volatileState.commitIndex,
      },
      {
        type: 'EmptyAppendEntriesTimerRestart',
        source: node.id,
      },
    ]
  }
}
