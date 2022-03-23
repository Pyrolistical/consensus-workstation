import type { Node, AppendEntriesRequest, Event } from './types'

export default (
  { id, state, mode, volatileState }: Node,
  event: AppendEntriesRequest
): Event[] => {
  const { currentTerm, log } = state
  const { source, term, prevLogIndex, prevLogTerm, leaderCommit, entries } =
    event
  if (term < currentTerm) {
    return [
      {
        type: 'AppendEntriesResponse',
        destination: source,
        source: id,
        term: currentTerm,
        success: false,
        request: event,
      },
    ]
  }
  const descended = mode !== 'follower' && term > currentTerm

  const sharesCommonLog = log[prevLogIndex]?.term === prevLogTerm

  if (!sharesCommonLog) {
    const result: Event[] = []
    if (descended) {
      result.push(
        {
          type: 'ChangeMode',
          source: id,
          mode: 'follower',
          leaderId: source,
        },
        {
          type: 'EmptyAppendEntriesTimerCancel',
          source: id,
        },
        {
          type: 'SaveNodeState',
          source: id,
          state: {
            ...state,
            currentTerm: term,
            log: log.slice(0, prevLogIndex),
          },
        }
      )
    } else {
      result.push({
        type: 'SaveNodeState',
        source: id,
        state: {
          ...state,
          currentTerm: term,
          log: log.slice(0, prevLogIndex),
        },
      })
    }
    return [
      ...result,
      {
        type: 'ElectionTimerRestart',
        source: id,
      },
      {
        type: 'AppendEntriesResponse',
        source: id,
        destination: source,
        term,
        success: false,
        request: event,
      },
    ]
  }

  const result: Event[] = []
  if (leaderCommit > volatileState.commitIndex) {
    result.push({
      type: 'SaveVolatileState',
      source: id,
      volatileState: {
        ...volatileState,
        commitIndex: leaderCommit,
      },
    })
  }
  if (descended) {
    result.push(
      {
        type: 'ChangeMode',
        source: id,
        mode: 'follower',
        leaderId: source,
      },
      {
        type: 'EmptyAppendEntriesTimerCancel',
        source: id,
      },
      {
        type: 'SaveNodeState',
        source: id,
        state: {
          ...state,
          currentTerm: term,
          log: [...log, ...entries],
        },
      }
    )
  } else if (entries.length > 0) {
    result.push({
      type: 'SaveNodeState',
      source: id,
      state: {
        ...state,
        log: [...log, ...entries],
      },
    })
  }
  return [
    ...result,
    {
      type: 'ElectionTimerRestart',
      source: id,
    },
    {
      type: 'AppendEntriesResponse',
      source: id,
      destination: source,
      term,
      success: true,
      request: event,
    },
  ]
}
