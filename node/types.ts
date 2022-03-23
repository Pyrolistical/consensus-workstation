export type NodeId = string

export type NetworkMessage = {
  source: NodeId
  destination: NodeId
}

export type Command = string

export type Entry = {
  term: number
  command: Command
}

export interface ClientCommandsRequest extends NetworkMessage {
  type: 'ClientCommandsRequest'
  commands: Command[]
}

export interface ClientCommandsResponse extends NetworkMessage {
  type: 'ClientCommandsResponse'
  success: boolean
  leaderId?: string
  request: ClientCommandsRequest
}

export interface AppendEntriesRequest extends NetworkMessage {
  type: 'AppendEntriesRequest'
  clientRequest: ClientCommandsRequest | undefined
  term: number
  leaderId: NodeId
  prevLogIndex: number
  prevLogTerm: number
  entries: Entry[]
  leaderCommit: number
}

export interface AppendEntriesResponse extends NetworkMessage {
  type: 'AppendEntriesResponse'
  term: number
  success: boolean
  request: AppendEntriesRequest
}

export interface RequestVoteRequest extends NetworkMessage {
  type: 'RequestVoteRequest'
  term: number
  candidateId: NodeId
  lastLogIndex: number
  lastLogTerm: number
}

export interface RequestVoteResponse extends NetworkMessage {
  type: 'RequestVoteResponse'
  term: number
  voteGranted: boolean
  request: RequestVoteRequest
}

export interface Timer {
  // timeout: number
}

export interface ElectionTimerRestart extends Timer {
  type: 'ElectionTimerRestart'
  source: NodeId
}
export interface ElectionTimerExpiry extends Timer {
  type: 'ElectionTimerExpiry'
  destination: NodeId
  // elapsed: number;
}
export interface ElectionTimerCancel extends Timer {
  type: 'ElectionTimerCancel'
  source: NodeId
}

export interface EmptyAppendEntriesTimerRestart extends Timer {
  type: 'EmptyAppendEntriesTimerRestart'
  source: NodeId
}
export interface EmptyAppendEntriesTimerExpiry extends Timer {
  type: 'EmptyAppendEntriesTimerExpiry'
  destination: NodeId
  // elapsed: number;
}
export interface EmptyAppendEntriesTimerCancel extends Timer {
  type: 'EmptyAppendEntriesTimerCancel'
  source: NodeId
}

export interface Configuration {
  peers: NodeId[]
}

export type NodeState = {
  currentTerm: number
  votedFor: NodeId | undefined
  log: Entry[]
}

export type VolatileState = {
  commitIndex: number
  lastApplied: number
}

export interface CommonNode {
  id: NodeId
  configuration: Configuration
  state: NodeState
  volatileState: VolatileState
}

export type Index = {
  [nodeId: string]: number
}

export type VolatileLeaderState = {
  nextIndex: Index
  matchIndex: Index
}

export interface LeaderNode extends CommonNode {
  mode: 'leader'
  volatileLeaderState: VolatileLeaderState
}

export interface FollowerNode extends CommonNode {
  mode: 'follower'
  leaderId: NodeId
}

export type VoteResults = {
  [node: string]: boolean
}

export interface CandidateNode extends CommonNode {
  mode: 'candidate'
  voteResults: VoteResults
}

export type Node = LeaderNode | FollowerNode | CandidateNode

export function isFollower(node: Node): node is FollowerNode {
  return node.mode === 'follower'
}

export interface ChangeMode {
  type: 'ChangeMode'
  source: NodeId
  mode: 'leader' | 'follower' | 'candidate'
  leaderId?: NodeId
}

export interface SaveConfiguration {
  type: 'SaveConfiguration'
  source: NodeId
  configuration: Configuration
}

export interface SaveNodeState {
  type: 'SaveNodeState'
  source: NodeId
  state: NodeState
}

export interface SaveVolatileState {
  type: 'SaveVolatileState'
  source: NodeId
  volatileState: VolatileState
}

export interface SaveVolatileLeaderState {
  type: 'SaveVolatileLeaderState'
  source: NodeId
  volatileLeaderState: VolatileLeaderState
}

export interface SaveVoteResults {
  type: 'SaveVoteResults'
  source: NodeId
  voteResults: VoteResults
}

export type Event =
  | RequestVoteRequest
  | RequestVoteResponse
  | ClientCommandsRequest
  | ClientCommandsResponse
  | AppendEntriesRequest
  | AppendEntriesResponse
  | ChangeMode
  | SaveConfiguration
  | SaveNodeState
  | SaveVolatileState
  | SaveVolatileLeaderState
  | SaveVoteResults
  | ElectionTimerRestart
  | ElectionTimerExpiry
  | ElectionTimerCancel
  | EmptyAppendEntriesTimerRestart
  | EmptyAppendEntriesTimerExpiry
  | EmptyAppendEntriesTimerCancel

export type EventHandler<N extends Node, E extends Event> = (
  node: N,
  event: E
) => Event[]
