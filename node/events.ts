// export type NetworkMessage = {
//   requestId: number;
//   source: NodeId;
//   destination: NodeId;
// };

// export type SystemCall = {};

// export type Network = {
//   send(message: NetworkMessage);
// };

// export type Node = {
//   nodeId: NodeId;
//   handle(event: Event): Event[];
// };

// export type System = {
//   send(call: SystemCall);
// };

// export type Typed = {
//   type: string;
// };

// export type NodeId = string;

// export type Command = string;

// export type Entry = {
//   term: number;
//   command: Command;
// };

// export interface ClientRequest extends Typed, NetworkMessage {
//   type: "ClientRequest";
//   commands: Command[];
// }

// export interface ClientResponse extends Typed, NetworkMessage {
//   type: "ClientResponse";
//   result;
// }

// export interface AppendEntriesRequest extends Typed, NetworkMessage {
//   type: "AppendEntriesRequest";
//   term: number;
//   leaderId: NodeId;
//   prevLogIndex: number;
//   prevLogTerm: number;
//   entries: Entry[];
//   leaderCommit: number;
// }

// export interface AppendEntriesResponse extends Typed, NetworkMessage {
//   type: "AppendEntriesResponse";
//   term: number;
//   success: boolean;
// }

// export interface RequestVotesRequest extends Typed, NetworkMessage {
//   type: "RequestVotesRequest";
//   destination: NodeId;
//   term: number;
//   candidateId: NodeId;
//   lastLogIndex: number;
//   lastLogTerm: number;
// }

// export interface RequestVotesResponse extends Typed, NetworkMessage {
//   type: "RequestVotesResponse";
//   term: number;
//   voteGranted: boolean;
// }

// export type Request =
//   | AppendEntriesRequest
//   | ClientRequest
//   | RequestVotesRequest;
// export type Response =
//   | AppendEntriesResponse
//   | ClientResponse
//   | RequestVotesResponse;

// export interface Timer extends SystemCall {
//   // timeout: number;
// }

// export interface ElectionTimerStarted extends Typed, Timer {
//   type: "ElectionTimerStarted";
//   source: Node;
// }
// export interface ElectionTimerEnded extends Typed, Timer {
//   type: "ElectionTimerEnded";
//   destination: NodeId;
//   // elapsed: number;
// }

// export interface EmptyAppendEntriesTimerStarted extends Typed, Timer {
//   type: "EmptyAppendEntriesTimerStarted";
// }
// export interface EmptyAppendEntriesTimerEnded extends Typed, Timer {
//   type: "EmptyAppendEntriesTimerEnded";
//   elapsed: number;
// }

// export type Configuration = {
//   peers: NodeId[];
// };
// export type NodeState = {
//   currentTerm: number;
//   votedFor: NodeId;
//   log: Entry[];
// };

// export type NodeVolatileState = {
//   commitIndex: number;
//   lastApplied: number;
// };
// export type NodeVolatileLeaderState = {
//   nextIndex: {
//     [nodeId: string]: number;
//   };
//   matchIndex: {
//     [nodeId: string]: number;
//   };
// };

// export type NetworkCallState = {
//   nextRequestId: number;
//   inflightRequests: {
//     [requestId: string]: Request;
//   };
// };

// export interface NetworkCallStateRestored extends Typed, SystemCall {
//   type: "NetworkCallStateRestored";
//   destination: NodeId;
//   state: NetworkCallState;
// }
// export interface SaveNetworkCallState extends Typed, SystemCall {
//   type: "SaveNetworkCallState";
//   source: NodeId;
//   state: NetworkCallState;
// }

// export interface ConfigurationRestored extends Typed, SystemCall {
//   type: "ConfigurationRestored";
//   destination: NodeId;
//   configuration: Configuration;
// }
// export interface SaveConfiguration extends Typed, SystemCall {
//   type: "SaveConfiguration";
//   source: NodeId;
//   configuration: Configuration;
// }

// export interface NodeStateRestored extends Typed, SystemCall {
//   type: "NodeStateRestored";
//   destination: NodeId;
//   state: NodeState;
// }
// export interface SaveNodeState extends Typed, SystemCall {
//   type: "SaveNodeState";
//   source: NodeId;
//   state: NodeState;
// }
// export interface NodeVolatileStateRestored extends Typed, SystemCall {
//   type: "NodeVolatileStateRestored";
//   destination: NodeId;
//   state: NodeVolatileState;
// }
// export interface SaveNodeVolatileState extends Typed, SystemCall {
//   type: "SaveNodeVolatileState";
//   source: NodeId;
//   state: NodeVolatileState;
// }
// export interface NodeVolatileLeaderStateRestored extends Typed, SystemCall {
//   type: "NodeVolatileLeaderStateRestored";
//   destination: NodeId;
//   state: NodeVolatileLeaderState;
// }
// export interface SaveNodeVolatileLeaderState extends Typed, SystemCall {
//   type: "SaveNodeVolatileLeaderState";
//   source: NodeId;
//   state: NodeVolatileLeaderState;
// }

// export type Event =
//   | ClientRequest
//   | ClientResponse
//   | AppendEntriesRequest
//   | AppendEntriesResponse
//   | RequestVotesRequest
//   | RequestVotesResponse
//   | ElectionTimerStarted
//   | ElectionTimerEnded
//   | EmptyAppendEntriesTimerStarted
//   | EmptyAppendEntriesTimerEnded
//   | NetworkCallStateRestored
//   | SaveNetworkCallState
//   | ConfigurationRestored
//   | SaveConfiguration
//   | NodeStateRestored
//   | SaveNodeState
//   | NodeVolatileStateRestored
//   | SaveNodeVolatileState
//   | NodeVolatileLeaderStateRestored
//   | SaveNodeVolatileLeaderState;
