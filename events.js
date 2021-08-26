// export function NetworkMessage(requestId, source, destination) {
//   return #{
//     requestId,
//     source,
//     destination
//   }
// };

// // export type SystemCall = {};

// // export type Network = {
// //   send(message: NetworkMessage);
// // };

// // export type Node = {
// //   nodeId: NodeId;
// //   handle(event: Event): Event[];
// // };

// // export type System = {
// //   send(call: SystemCall);
// // };

// // export type Typed = {
// //   type: string;
// // };

// // export type NodeId = string;

// // export type Command = string;

// // export type Entry = {
// //   term: number;
// //   command: Command;
// // };

// export function ClientRequest(commands) {
//   return #{
//     type: 'ClientRequest',
//     commands
//   };
// }

// export function ClientResponse() {
//   return #{
//     type: 'ClientResponse',
//     result
//   };
// }

// export function AppendEntriesRequest(term, leaderid, prevLogIndex, prevLogTerm, entries,) {
//   return #{
//     type: 'AppendEntriesRequest',
//     term,
//     leaderId,
//     prevLogIndex,
//     prevLogTerm,
//     entries,
//     leaderCommit,
//   };
// }

// export function AppendEntriesResponse(term, success) {
//   return #{
//     type: 'AppendEntriesResponse',
//     term,
//     success
//   };
// }

// export function RequestVotesRequest(destination, term, candidateId, lastLogIndex, lastLogTerm) {
//   return #{
//     type: 'RequestVotesRequest',
//     destination,
//     term,
//     candidateId,
//     lastLogIndex,
//     lastLogTerm
//   };
// }

// export function RequestVotesResponse(term, voteGranted) {
//   return #{
//     type: 'RequestVotesResponse',
//     term,
//     voteGranted,
//   };
// }

// // export type Request =
// //   | AppendEntriesRequest
// //   | ClientRequest
// //   | RequestVotesRequest;
// // export type Response =
// //   | AppendEntriesResponse
// //   | ClientResponse
// //   | RequestVotesResponse;

// // export interface Timer extends SystemCall {
// //   // timeout: number;
// // }

// export function ElectionTimerStarted(source) {
//   return #{
//     type: 'ElectionTimerStarted',
//     source
//   };
// }
// export function ElectionTimerEnded(destination) {
//   return #{
//     type: 'ElectionTimerEnded',
//     destination
//     // elapsed: number,
//   };
// }

// export function EmptyAppendEntriesTimerStarted() {
//   return #{
//     type: 'EmptyAppendEntriesTimerStarted'
//   };
// }
// export function EmptyAppendEntriesTimerEnded() {
//   return #{
//     type: 'EmptyAppendEntriesTimerEnded',
//     elapsed: number
//   };
// }

// // export type Configuration = {
// //   peers: NodeId[];
// // };
// // export type NodeState = {
// //   currentTerm: number;
// //   votedFor: NodeId;
// //   log: Entry[];
// // };

// // export type NodeVolatileState = {
// //   commitIndex: number;
// //   lastApplied: number;
// // };
// // export type NodeVolatileLeaderState = {
// //   nextIndex: {
// //     [nodeId: string]: number;
// //   };
// //   matchIndex: {
// //     [nodeId: string]: number;
// //   };
// // };

// // export type NetworkCallState = {
// //   nextRequestId: number;
// //   inflightRequests: {
// //     [requestId: string]: Request;
// //   };
// // };

// export interface NetworkCallStateRestored extends Typed, SystemCall {
//   type: 'NetworkCallStateRestored';
//   destination: NodeId;
//   state: NetworkCallState;
// }
// export interface SaveNetworkCallState extends Typed, SystemCall {
//   type: 'SaveNetworkCallState';
//   source: NodeId;
//   state: NetworkCallState;
// }

// export interface ConfigurationRestored extends Typed, SystemCall {
//   type: 'ConfigurationRestored';
//   destination: NodeId;
//   configuration: Configuration;
// }
// export interface SaveConfiguration extends Typed, SystemCall {
//   type: 'SaveConfiguration';
//   source: NodeId;
//   configuration: Configuration;
// }

// export interface NodeStateRestored extends Typed, SystemCall {
//   type: 'NodeStateRestored';
//   destination: NodeId;
//   state: NodeState;
// }
// export interface SaveNodeState extends Typed, SystemCall {
//   type: 'SaveNodeState';
//   source: NodeId;
//   state: NodeState;
// }
// export interface NodeVolatileStateRestored extends Typed, SystemCall {
//   type: 'NodeVolatileStateRestored';
//   destination: NodeId;
//   state: NodeVolatileState;
// }
// export interface SaveNodeVolatileState extends Typed, SystemCall {
//   type: 'SaveNodeVolatileState';
//   source: NodeId;
//   state: NodeVolatileState;
// }
// export interface NodeVolatileLeaderStateRestored extends Typed, SystemCall {
//   type: 'NodeVolatileLeaderStateRestored';
//   destination: NodeId;
//   state: NodeVolatileLeaderState;
// }
// export interface SaveNodeVolatileLeaderState extends Typed, SystemCall {
//   type: 'SaveNodeVolatileLeaderState';
//   source: NodeId;
//   state: NodeVolatileLeaderState;
// }

// // export type Event =
// //   | ClientRequest
// //   | ClientResponse
// //   | AppendEntriesRequest
// //   | AppendEntriesResponse
// //   | RequestVotesRequest
// //   | RequestVotesResponse
// //   | ElectionTimerStarted
// //   | ElectionTimerEnded
// //   | EmptyAppendEntriesTimerStarted
// //   | EmptyAppendEntriesTimerEnded
// //   | NetworkCallStateRestored
// //   | SaveNetworkCallState
// //   | ConfigurationRestored
// //   | SaveConfiguration
// //   | NodeStateRestored
// //   | SaveNodeState
// //   | NodeVolatileStateRestored
// //   | SaveNodeVolatileState
// //   | NodeVolatileLeaderStateRestored
// //   | SaveNodeVolatileLeaderState;
