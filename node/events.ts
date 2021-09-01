export type NetworkMessage = {
  source: NodeId;
  destination: NodeId;
};

export type SystemCall = {};

export type Network = {
  send(message: NetworkMessage);
};

export type System = {
  send(call: SystemCall);
};

export type Typed = {
  type: string;
};

export type NodeId = string;

export type Command = string;

export type Entry = {
  term: number;
  command: Command;
};

export interface ClientCommandsRequest extends Typed, NetworkMessage {
  type: "ClientCommandsRequest";
  commands: Command[];
}

export interface ClientCommandsResponse extends Typed, NetworkMessage {
  type: "ClientCommandsResponse";
  success: boolean;
  leaderId?: string;
}

export interface AppendEntriesRequest extends Typed, NetworkMessage {
  type: "AppendEntriesRequest";
  clientId: string;
  term: number;
  leaderId: NodeId;
  prevLogIndex: number;
  prevLogTerm: number;
  entries: Entry[];
  leaderCommit: number;
}

export interface AppendEntriesResponse extends Typed, NetworkMessage {
  type: "AppendEntriesResponse";
  term: number;
  success: boolean;
  request: AppendEntriesRequest;
}

export interface RequestVotesRequest extends Typed, NetworkMessage {
  type: "RequestVotesRequest";
  destination: NodeId;
  term: number;
  candidateId: NodeId;
  lastLogIndex: number;
  lastLogTerm: number;
}

export interface RequestVotesResponse extends Typed, NetworkMessage {
  type: "RequestVotesResponse";
  term: number;
  voteGranted: boolean;
}

export type Request =
  | AppendEntriesRequest
  | ClientCommandsRequest
  | RequestVotesRequest;
export type Response =
  | AppendEntriesResponse
  | ClientCommandsResponse
  | RequestVotesResponse;

export interface Timer extends SystemCall {
  // timeout: number;
}

export interface ElectionTimerReset extends Typed, Timer {
  type: "ElectionTimerReset";
  source: NodeId;
}
export interface ElectionTimerEnded extends Typed, Timer {
  type: "ElectionTimerEnded";
  destination: NodeId;
  // elapsed: number;
}

export interface EmptyAppendEntriesTimerStarted extends Typed, Timer {
  type: "EmptyAppendEntriesTimerStarted";
}
export interface EmptyAppendEntriesTimerEnded extends Typed, Timer {
  type: "EmptyAppendEntriesTimerEnded";
  elapsed: number;
}

export type Configuration = {
  peers: NodeId[];
};
export type NodeState = {
  currentTerm: number;
  votedFor: NodeId;
  log: Entry[];
};

export type VolatileState = {
  commitIndex: number;
  lastApplied: number;
};
export type VolatileLeaderState = {
  nextIndex: {
    [nodeId: string]: number;
  };
  matchIndex: {
    [nodeId: string]: number;
  };
};

export type NetworkCallState = {
  nextRequestId: number;
  inflightRequests: {
    [requestId: string]: Request;
  };
};

export interface SaveNetworkCallState extends Typed, SystemCall {
  type: "SaveNetworkCallState";
  source: NodeId;
  state: NetworkCallState;
}

export interface SaveConfiguration extends Typed, SystemCall {
  type: "SaveConfiguration";
  source: NodeId;
  configuration: Configuration;
}

export interface SaveNodeState extends Typed, SystemCall {
  type: "SaveNodeState";
  source: NodeId;
  state: NodeState;
}

export interface SaveVolatileState extends Typed, SystemCall {
  type: "SaveVolatileState";
  source: NodeId;
  volatileState: VolatileState;
}

export interface SaveVolatileLeaderState extends Typed, SystemCall {
  type: "SaveVolatileLeaderState";
  source: NodeId;
  volatileLeaderState: VolatileLeaderState;
}

export type Event =
  | ClientCommandsRequest
  | ClientCommandsResponse
  | AppendEntriesRequest
  | AppendEntriesResponse
  | RequestVotesRequest
  | RequestVotesResponse
  | ElectionTimerReset
  | ElectionTimerEnded
  | EmptyAppendEntriesTimerStarted
  | EmptyAppendEntriesTimerEnded
  | SaveNetworkCallState
  | SaveConfiguration
  | SaveNodeState
  | SaveVolatileState
  | SaveVolatileLeaderState;
