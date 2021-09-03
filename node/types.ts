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
  clientId: string | undefined;
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

export interface RequestVoteRequest extends NetworkMessage {
  type: "RequestVoteRequest";
  term: number;
  candidateId: NodeId;
  lastLogIndex: number;
  lastLogTerm: number;
}

export interface RequestVoteResponse extends NetworkMessage {
  type: "RequestVoteResponse";
  term: number;
  voteGranted: boolean;
  request: RequestVoteRequest;
}

export interface Timer {
  // timeout: number;
}

export interface ElectionTimerRestart extends Timer {
  type: "ElectionTimerRestart";
  source: NodeId;
}
export interface ElectionTimerEnded extends Timer {
  type: "ElectionTimerEnded";
  destination: NodeId;
  // elapsed: number;
}
export interface ElectionTimerCancel extends Timer {
  type: "ElectionTimerCancel";
  source: NodeId;
}

export interface EmptyAppendEntriesTimerRestart extends Timer {
  type: "EmptyAppendEntriesTimerRestart";
  source: NodeId;
}
export interface EmptyAppendEntriesTimerEnded extends Timer {
  type: "EmptyAppendEntriesTimerEnded";
  destination: NodeId;
  // elapsed: number;
}
export interface EmptyAppendEntriesTimerCancel extends Timer {
  type: "EmptyAppendEntriesTimerCancel";
  source: NodeId;
}

export interface CommonNode {
  id: NodeId;
  configuration: Configuration;
  state: NodeState;
  volatileState: VolatileState;
}

export type Node =
  | LeaderNode
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
  voteResults: VoteResults;
}

export interface Configuration {
  peers: NodeId[];
}

export type NodeState = {
  currentTerm: number;
  votedFor: NodeId | null;
  log: Entry[];
};

export type VolatileState = {
  commitIndex: number;
  lastApplied: number;
};

export type Index = {
  [nodeId: string]: number;
};
export type VolatileLeaderState = {
  nextIndex: Index;
  matchIndex: Index;
};

export type VoteResults = {
  [node: string]: boolean;
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

export interface SaveVoteResults {
  type: "SaveVoteResults";
  source: NodeId;
  voteResults: VoteResults;
}

export type Event =
  | ChangeMode
  | ClientCommandsRequest
  | ClientCommandsResponse
  | AppendEntriesRequest
  | AppendEntriesResponse
  | RequestVoteRequest
  | RequestVoteResponse
  | ElectionTimerRestart
  | ElectionTimerEnded
  | ElectionTimerCancel
  | EmptyAppendEntriesTimerRestart
  | EmptyAppendEntriesTimerEnded
  | EmptyAppendEntriesTimerCancel
  | SaveConfiguration
  | SaveNodeState
  | SaveVolatileState
  | SaveVolatileLeaderState
  | SaveVoteResults;

export type EventHandler<N extends Node, E extends Event> = (node: N, event: E) => Event[];
