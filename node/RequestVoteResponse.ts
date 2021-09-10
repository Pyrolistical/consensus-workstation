import * as R from 'ramda';

import { CandidateNode, RequestVoteResponse, Event } from './types';

export default (node: CandidateNode, event: RequestVoteResponse): Event[] => {
  const majorityThreshold = node.configuration.peers.length / 2;
  const voteResults = {
    ...node.voteResults,
    [event.source]: event.voteGranted
  };
  if (Object.values(voteResults).filter((x) => x).length > majorityThreshold) {
    return [
      {
        type: 'ChangeMode',
        source: node.id,
        mode: 'leader'
      },
      {
        type: 'SaveVolatileLeaderState',
        source: 'A',
        volatileLeaderState: {
          nextIndex: R.pipe(
            R.reject<string, 'array'>(R.equals(node.id)),
            R.map<string, [string, number]>((peer) => [peer, node.state.log.length]),
            R.fromPairs
          )(node.configuration.peers),
          matchIndex: R.pipe(
            R.reject<string, 'array'>(R.equals(node.id)),
            R.map<string, [string, number]>((peer) => [peer, 0]),
            R.fromPairs
          )(node.configuration.peers)
        }
      },
      ...R.pipe(
        R.reject<string, 'array'>(R.equals(node.id)),
        R.map((peer) => ({
          type: 'AppendEntriesRequest' as const,
          clientRequest: undefined,
          source: node.id,
          destination: peer,
          term: node.state.currentTerm,
          leaderId: node.id,
          prevLogIndex: node.state.log.length - 1,
          prevLogTerm: R.pathOr(1, [node.state.log.length - 1, 'term'], node.state.log),
          entries: [],
          leaderCommit: node.volatileState.commitIndex
        }))
      )(node.configuration.peers),
      {
        type: 'EmptyAppendEntriesTimerRestart',
        source: node.id
      }
    ];
  } else {
    return [
      {
        type: 'SaveVoteResults',
        source: node.id,
        voteResults
      }
    ];
  }
};
