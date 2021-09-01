export type NetworkMessage = {
  source: NodeId;
  destination: NodeId;
};

export type NodeId = string;

export type Command = string;

export type Entry = {
  term: number;
  command: Command;
};

export interface ClientCommandsRequest extends NetworkMessage {
  type: "ClientCommandsRequest";
  commands: Command[];
}

export interface ClientCommandsResponse extends NetworkMessage {
  type: "ClientCommandsResponse";
  success: boolean;
  leaderId?: string;
}

export interface AppendEntriesRequest extends NetworkMessage {
  type: "AppendEntriesRequest";
  clientId: string;
  term: number;
  leaderId: NodeId;
  prevLogIndex: number;
  prevLogTerm: number;
  entries: Entry[];
  leaderCommit: number;
}

export interface AppendEntriesResponse extends NetworkMessage {
  type: "AppendEntriesResponse";
  term: number;
  success: boolean;
  request: AppendEntriesRequest;
}

export interface RequestVotesRequest extends NetworkMessage {
  type: "RequestVotesRequest";
  destination: NodeId;
  term: number;
  candidateId: NodeId;
  lastLogIndex: number;
  lastLogTerm: number;
}

export interface RequestVotesResponse extends NetworkMessage {
  type: "RequestVotesResponse";
  term: number;
  voteGranted: boolean;
}

export interface Timer {
  // timeout: number;
}

export interface ElectionTimerReset extends Timer {
  type: "ElectionTimerReset";
  source: NodeId;
}
export interface ElectionTimerEnded extends Timer {
  type: "ElectionTimerEnded";
  destination: NodeId;
  // elapsed: number;
}

export interface EmptyAppendEntriesTimerStarted extends Timer {
  type: "EmptyAppendEntriesTimerStarted";
}
export interface EmptyAppendEntriesTimerEnded extends Timer {
  type: "EmptyAppendEntriesTimerEnded";
  elapsed: number;
}

export interface CommonNode {
  id: NodeId;
  configuration: Configuration;
  state: NodeState;
  volatileState: VolatileState;
}

export type Node = LeaderNode
  | FollowerNode
  | CandidateNode;

export interface LeaderNode extends CommonNode {
  mode: 'leader';
  volatileLeaderState: VolatileLeaderState;
}

export interface FollowerNode extends CommonNode {
  mode: 'follower';
  leaderId: NodeId;
}

export interface CandidateNode extends CommonNode {
  mode: 'candidate';
}

export interface Configuration {
  peers: NodeId[];
}

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

export interface ChangeMode {
  type: "ChangeMode";
  source: NodeId;
  mode: 'leader' | 'follower' | 'candidate';
  leaderId?: NodeId;
}

export interface SaveConfiguration {
  type: "SaveConfiguration";
  source: NodeId;
  configuration: Configuration;
}

export interface SaveNodeState {
  type: "SaveNodeState";
  source: NodeId;
  state: NodeState;
}

export interface SaveVolatileState {
  type: "SaveVolatileState";
  source: NodeId;
  volatileState: VolatileState;
}

export interface SaveVolatileLeaderState {
  type: "SaveVolatileLeaderState";
  source: NodeId;
  volatileLeaderState: VolatileLeaderState;
}

export type Event =
  | ChangeMode
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
  | SaveConfiguration
  | SaveNodeState
  | SaveVolatileState
  | SaveVolatileLeaderState;

export type EventHandler<N extends Node, E extends Event> = (node: N, event: E) => Event[];
