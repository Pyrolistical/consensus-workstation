import React, { Fragment, JSXElementConstructor } from 'react';
import styled from "@emotion/styled";

import AppendEntriesRequestHandler from './AppendEntriesRequest';
import AppendEntriesResponseHandler from './AppendEntriesResponse';
import ClientCommandsRequestHandler from './ClientCommandsRequest';
import ElectionTimerExpiryHandler from './ElectionTimerExpiry';
import EmptyAppendEntriesTimerExpiryHandler from './EmptyAppendEntriesTimerExpiry';
import RequestVoteRequestHandler from './RequestVoteRequest';
import RequestVoteResponseHandler from './RequestVoteResponse';

import {
  Index,
  Node,
  CommonNode,
  FollowerNode,
  LeaderNode,
  CandidateNode,
  Event
} from './types';

const NodeContainer = styled.div`
  display: inline-flex;
  border: solid 5px black;
  padding: 5px;
  flex-direction: column;
  align-items: flex-start;
  font-family: 'Courier New';
  font-size: 16px;

  strong {
    align-self: center;
  }
`;

function CommonNodeFields({ id, configuration: { peers }, state: { currentTerm, votedFor, log }, volatileState: { commitIndex, lastApplied } }: CommonNode) {
  return <>
    <dt>ID</dt>
    <dd>{id}</dd>
    <dt>Configuration</dt>
    <dd>
      <dl>
        <dt>Peers</dt>
        <dd>
          <ul>
            {peers.map((peer) => <li key={peer}>{peer}</li>)}
          </ul>
        </dd>
      </dl>
    </dd>
    <dt>State</dt>
    <dd>
      <dl>
        <dt>Current term</dt>
        <dd>{currentTerm}</dd>
        <dt>Voted for</dt>
        <dd>{votedFor}</dd>
        <dt>Entries</dt>
        <dt>Log</dt>
        <dd>
          <ol start={0}>
            {log.map(({ term, command }, index) => <li key={index}>
              <dl>
                <dt>Term</dt>
                <dd>{term}</dd>
                <dt>Command</dt>
                <dd>{command}</dd>
              </dl>
            </li>)}
          </ol>
        </dd>
      </dl>
    </dd>
    <dt>Volatile state</dt>
    <dd>
      <dl>
        <dt>Commit index</dt>
        <dd>{commitIndex}</dd>
        <dt>Last applied</dt>
        <dd>{lastApplied}</dd>
      </dl>
    </dd>
  </>;
}

function FollowerNodeCard({ node }: { node: FollowerNode; }) {
  const { mode, leaderId } = node;
  return <NodeContainer>
    <strong>👷🏻 {mode}</strong>
    <dl>
      <CommonNodeFields {...node} />
      <dt>Leader ID</dt>
      <dd>{leaderId}</dd>
    </dl>
  </NodeContainer>;
}


function Index({ index }: { index: Index; }) {
  return <dl>
    {Object.keys(index).map((nodeId) => <Fragment key={nodeId}>
      <dt>{nodeId}</dt>
      <dd>{index[nodeId]}</dd>
    </Fragment>)}
  </dl>;
};

function LeaderNodeCard({ node }: { node: LeaderNode; }) {
  const { mode, volatileLeaderState: { nextIndex, matchIndex } } = node;
  return <NodeContainer>
    <strong>👸🏻 {mode}</strong>
    <dl>
      <CommonNodeFields {...node} />
      <dt>Volatile leader state</dt>
      <dd>
        <dl>
          <dt>Next index</dt>
          <dd><Index index={nextIndex} /></dd>
          <dt>Match index</dt>
          <dd><Index index={matchIndex} /></dd>
        </dl>
      </dd>
    </dl>
  </NodeContainer>;
}

function CandidateNodeCard({ node }: { node: CandidateNode; }) {
  const { mode, voteResults } = node;
  return <NodeContainer>
    <strong>🙋🏻 {mode}</strong>
    <dl>
      <CommonNodeFields {...node} />
      <dt>Vote results</dt>
      <dd>
        <dl>
          {Object.keys(voteResults).map((nodeId) => <Fragment key={nodeId}>
            <dt>{nodeId}</dt>
            <dd>{String(voteResults[nodeId])}</dd>
          </Fragment>)}
        </dl>
      </dd>
    </dl>
  </NodeContainer>;
}

export const NodeCard = (props: { node: Node; }) => {
  const componentByType: { [mode: string]: JSXElementConstructor<any>; } = {
    follower: FollowerNodeCard,
    leader: LeaderNodeCard,
    candidate: CandidateNodeCard,
  };

  const Component: JSXElementConstructor<any> = componentByType[props.node.mode] || (() => <>{props.node.mode} not implemented</>);
  return <Component {...props} />;
};

export default (node: Node, event: Event) => {
  switch (event.type) {
    case 'AppendEntriesRequest':
      return AppendEntriesRequestHandler(node, event);
    case 'AppendEntriesResponse':
      return AppendEntriesResponseHandler(node as LeaderNode, event);
    case 'ClientCommandsRequest':
      return ClientCommandsRequestHandler(node, event);
    case 'ElectionTimerExpiry':
      return ElectionTimerExpiryHandler(node, event);
    case 'EmptyAppendEntriesTimerExpiry':
      return EmptyAppendEntriesTimerExpiryHandler(node, event);
    case 'RequestVoteRequest':
      return RequestVoteRequestHandler(node, event);
    case 'RequestVoteResponse':
      return RequestVoteResponseHandler(node as CandidateNode, event);
    default:
      throw new Error(`${event.type} not implemented`);
  }
};