export type NetworkMessage = {
  source: NodeId;
  destination: NodeId;
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

export interface Timer {
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

export interface CommonNode {
  id: NodeId;
  state: NodeState;
  volatileState: VolatileState;
}

export type Node = LeaderNode
  | FollowerNode
  | CandidateNode;

export interface LeaderNode extends CommonNode {
  configuration: LeaderConfiguration;
  volatileLeaderState: VolatileLeaderState;
}

export interface FollowerNode extends CommonNode {
  configuration: FollowerConfiguration;
}

export interface CandidateNode extends CommonNode {
  configuration: CandidateConfiguration;
}

export interface ConfigurationState {
  peers: NodeId[];
  state: string;
}

export type Configuration = LeaderConfiguration
  | FollowerConfiguration
  | CandidateConfiguration;

export interface LeaderConfiguration extends ConfigurationState{
  state: 'leader';
};

export interface FollowerConfiguration extends ConfigurationState {
  state: 'follower';
  leaderId: NodeId;
};

export interface CandidateConfiguration extends ConfigurationState {
  state: 'candidate';
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

export interface SaveConfiguration extends Typed {
  type: "SaveConfiguration";
  source: NodeId;
  configuration: Configuration;
}

export interface SaveNodeState extends Typed {
  type: "SaveNodeState";
  source: NodeId;
  state: NodeState;
}

export interface SaveVolatileState extends Typed {
  type: "SaveVolatileState";
  source: NodeId;
  volatileState: VolatileState;
}

export interface SaveVolatileLeaderState extends Typed {
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
  | SaveConfiguration
  | SaveNodeState
  | SaveVolatileState
  | SaveVolatileLeaderState;

export type EventHandler<N extends Node, E extends Event> = (node: N, event: E) => Event[];
