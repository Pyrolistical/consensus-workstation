import * as R from 'ramda';

export function next (node, event) {
  // function appendEntries(destination) {
  //   if (
  //     state.log.length - 1 >=
  //     volatileLeaderState.nextIndex[destination]
  //   ) {
  //     const prevLogIndex = volatileLeaderState.nextIndex[destination] - 1;
  //     const { term: prevLogTerm } = state.log[prevLogIndex];
  //     const entries = state.log.slice(prevLogIndex + 1);
  //     results.push({
  //       type: 'AppendEntriesRequest',
  //       destination: destination,
  //       term: state.currentTerm,
  //       leaderId: selfNodeId,
  //       prevLogIndex,
  //       prevLogTerm,
  //       entries,
  //       leaderCommit: volatileState.commitIndex
  //     });
  //   }
  // }
  switch (event.type) {
    // case 'ClientRequest':
    //   const entries = event.commands.map(command => {
    //     return {
    //       term: state.currentTerm,
    //       command
    //     };
    //   });
    //   state.log.push(...entries);
    //   results.push({
    //     type: 'SaveNodeState',
    //     source: selfNodeId,
    //     state
    //   });

    //   R.pipe(
    //     R.reject(R.equals(selfNodeId)),
    //     R.forEach(nodeId => {
    //       appendEntries(nodeId);
    //     })
    //   )(configuration.peers);
    //   break;
    // case 'AppendEntriesRequest': {
    //   if (event.term < state.currentTerm) {
    //     results.push({
    //       requestId: event.requestId,
    //       type: 'AppendEntriesResponse',
    //       destination: event.source,
    //       term: state.currentTerm,
    //       success: false
    //     });
    //     break;
    //   }
    //   const conflict =
    //     R.path([event.prevLogIndex, 'term'], state.log) !==
    //     event.prevLogTerm;
    //   state.log.slice(event.prevLogIndex);
    //   if (conflict) {
    //     results.push({
    //       type: 'SaveNodeState',
    //       source: selfNodeId,
    //       state
    //     });
    //     results.push({
    //       requestId: event.requestId,
    //       type: 'AppendEntriesResponse',
    //       destination: event.source,
    //       term: state.currentTerm,
    //       success: false
    //     });
    //     break;
    //   }
    //   state.log.push(...event.entries);
    //   if (event.leaderCommit > volatileState.commitIndex) {
    //     volatileState.commitIndex = Math.min(
    //       event.leaderCommit,
    //       state.log.length - 1
    //     );
    //     results.push({
    //       type: 'SaveNodeVolatileState',
    //       source: selfNodeId,
    //       volatileState
    //     });
    //   }
    //   results.push({
    //     type: 'SaveNodeState',
    //     source: selfNodeId,
    //     state
    //   });
    //   results.push({
    //     requestId: event.requestId,
    //     type: 'AppendEntriesResponse',
    //     destination: event.source,
    //     term: state.currentTerm,
    //     success: true
    //   });
    //   break;
    // }
    // case 'ConfigurationRestored':
    //   configuration = event.configuration;
    //   break;
    // case 'NodeStateRestored':
    //   state = event.state;
    //   break;
    // case 'NodeVolatileStateRestored':
    //   volatileState = event.state;
    //   break;
    // case 'NodeVolatileLeaderStateRestored':
    //   volatileLeaderState = event.state;
    //   break;
    case 'ElectionTimerEnded':
      return #[
        #{
          type: 'SaveNodeState',
          source: node.id,
          state: #{
            ...node.state,
            currentTerm: node.state.currentTerm + 1
          }
        },
        ...R.pipe(
          R.reject(R.equals(node.id)),
          R.map(nodeId => {
            const { term: lastLogTerm } = R.last(node.state.log);
            return #{
              type: 'RequestVotesRequest',
              destination: nodeId,
              term: node.state.currentTerm + 1,
              candidateId: node.id,
              lastLogIndex: node.state.log.length - 1,
              lastLogTerm
            };
          })
        )(node.configuration.peers),
        #{
          type: 'ElectionTimerStarted',
          source: node.id
        }
      ];
    // case 'AppendEntriesResponse': {
      // const request = loadRequest(event.requestId) as AppendEntriesRequest;
      // if (!request) {
      //   break;
      // }
      // if (event.success) {
      //   volatileLeaderState.nextIndex[event.source] =
      //     request.prevLogIndex + request.entries.length;
      //   volatileLeaderState.matchIndex[event.source] =
      //     request.prevLogIndex + request.entries.length - 1;
      //   results.push({
      //     type: 'SaveNodeVolatileLeaderState',
      //     source: 'leader',
      //     state: volatileLeaderState
      //   });
      // } else {
      //   if (event.term > state.currentTerm) {
      //     state.currentTerm = event.term;
      //     results.push({
      //       type: 'SaveNodeState',
      //       source: selfNodeId,
      //       state
      //     });
      //     break;
      //   }
      //   volatileLeaderState.nextIndex[event.source] -= 1;
      //   results.push({
      //     type: 'SaveNodeVolatileLeaderState',
      //     source: 'leader',
      //     state: volatileLeaderState
      //   });
      // }
      // appendEntries(event.source);

    //   break;
    // }
  }
  return #[
    ...results
  ];
};
