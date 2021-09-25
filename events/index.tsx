import React, { Fragment, JSXElementConstructor } from 'react';
import styled from "@emotion/styled";

import {
  Index,
  NetworkMessage,
  Event,
  ClientCommandsRequest,
  ClientCommandsResponse,
  AppendEntriesRequest,
  AppendEntriesResponse,
  RequestVoteRequest,
  RequestVoteResponse,
  ChangeMode,
  SaveConfiguration,
  SaveNodeState,
  SaveVolatileState,
  SaveVolatileLeaderState,
  SaveVoteResults,
  ElectionTimerRestart,
  ElectionTimerExpiry,
  ElectionTimerCancel,
  EmptyAppendEntriesTimerRestart,
  EmptyAppendEntriesTimerExpiry,
  EmptyAppendEntriesTimerCancel
} from '../node/types';


const EventContainer = styled.div`
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

function Routing(event: NetworkMessage) {
  const { source, destination } = event;
  return <>
    {source} ➡ {destination}
  </>;
}

function Index({ index }: { index: Index; }) {
  return <dl>
    {Object.keys(index).map((nodeId) => <Fragment key={nodeId}>
      <dt>{nodeId}</dt>
      <dd>{index[nodeId]}</dd>
    </Fragment>)}
  </dl>;
};

function ClientCommandsRequestCard({ event }: { event: ClientCommandsRequest; }) {
  const { type, commands } = event;
  return <EventContainer>
    <strong>⬇ {type}</strong>
    <dl>
      <dt>Routing</dt>
      <dd><Routing {...event} /></dd>
      <dt>Commands</dt>
      <dd><ol start={0}>
        {commands.map((command, index) => <li key={index}>{command}</li>)}
      </ol>
      </dd>
    </dl>
  </EventContainer>;
}

function ClientCommandsResponseCard({ event }: { event: ClientCommandsResponse; }) {
  const { type, success, leaderId, request } = event;
  return <EventContainer>
    <strong>⬆ {type}</strong>
    <dl>
      <dt>Routing</dt>
      <dd><Routing {...event} /></dd>
      <dt>Success</dt>
      <dd>{String(success)}</dd>
      {leaderId && <>
        <dt>Leader ID</dt>
        <dd>{leaderId}</dd>
      </>}
      <dt>Request</dt>
      <dd><ClientCommandsRequestCard event={request} /></dd>
    </dl>
  </EventContainer>;
}

function AppendEntriesRequestCard({ event }: { event: AppendEntriesRequest; }) {
  const { type, term, leaderId, prevLogIndex, prevLogTerm, entries, leaderCommit, clientRequest } = event;
  return <EventContainer>
    <strong>⬇ {type}</strong>
    <dl>
      <dt>Routing</dt>
      <dd><Routing {...event} /></dd>
      <dt>Term</dt>
      <dd>{term}</dd>
      <dt>Leader ID</dt>
      <dd>{leaderId}</dd>
      <dt>Previous log index</dt>
      <dd>{prevLogIndex}</dd>
      <dt>Previous log term</dt>
      <dd>{prevLogTerm}</dd>
      <dt>Entries</dt>
      <dd>
        <ol start={0}>
          {entries.map(({ term, command }, index) => <li key={index}>
            <dl>
              <dt>Term</dt>
              <dd>{term}</dd>
              <dt>Command</dt>
              <dd>{command}</dd>
            </dl>
          </li>)}
        </ol>
      </dd>
      <dt>Leader commit</dt>
      <dd>{leaderCommit}</dd>
      {clientRequest && <>
        <dt>Client request</dt>
        <dd><ClientCommandsRequestCard event={clientRequest} /></dd>
      </>}
    </dl>
  </EventContainer>;
}

function AppendEntriesResponseCard({ event }: { event: AppendEntriesResponse; }) {
  const { type, term, success, request } = event;
  return <EventContainer>
    <strong>⬆ {type}</strong>
    <dl>
      <dt>Routing</dt>
      <dd><Routing {...event} /></dd>
      <dt>Term</dt>
      <dd>{term}</dd>
      <dt>Success</dt>
      <dd>{String(success)}</dd>
      <dt>Request</dt>
      <dd><AppendEntriesRequestCard event={request} /></dd>
    </dl>
  </EventContainer>;
}


function RequestVoteRequestCard({ event }: { event: RequestVoteRequest; }) {
  const { type, term, candidateId, lastLogIndex, lastLogTerm } = event;
  return <EventContainer>
    <strong>⬇ {type}</strong>
    <dl>
      <dt>Routing</dt>
      <dd><Routing {...event} /></dd>
      <dt>Term</dt>
      <dd>{term}</dd>
      <dt>Candidate ID</dt>
      <dd>{candidateId}</dd>
      <dt>Last log index</dt>
      <dd>{lastLogIndex}</dd>
      <dt>Last log term</dt>
      <dd>{lastLogTerm}</dd>
    </dl>
  </EventContainer>;
}

function RequestVoteResponseCard({ event }: { event: RequestVoteResponse; }) {
  const { type, term, voteGranted, request } = event;
  return <EventContainer>
    <strong>⬆ {type}</strong>
    <dl>
      <dt>Routing</dt>
      <dd><Routing {...event} /></dd>
      <dt>Term</dt>
      <dd>{term}</dd>
      <dt>Vote granted</dt>
      <dd>{String(voteGranted)}</dd>
      <dt>Request</dt>
      <dd><RequestVoteRequestCard event={request} /></dd>
    </dl>
  </EventContainer>;
}

function ChangeModeCard({ event }: { event: ChangeMode; }) {
  const { type, source, mode, leaderId } = event;
  return <EventContainer>
    <strong>Δ {type}</strong>
    <dl>
      <dt>Source</dt>
      <dd>{source}</dd>
      <dt>Mode</dt>
      <dd>{mode}</dd>
      <dt>Leader ID</dt>
      <dd>{leaderId}</dd>
    </dl>
  </EventContainer>;
}

function SaveConfigurationCard({ event }: { event: SaveConfiguration; }) {
  const { type, source, configuration } = event;
  return <EventContainer>
    <strong>💾 {type}</strong>
    <dl>
      <dt>Source</dt>
      <dd>{source}</dd>
      <dt>Configuration</dt>
      <dd>
        <dl>
          <dt>Peers</dt>
          <dd>
            <ul>
              {configuration.peers.map((peer) => <li key={peer}>{peer}</li>)}
            </ul>
          </dd>
        </dl>
      </dd>
    </dl>
  </EventContainer>;
}

function SaveNodeStateCard({ event }: { event: SaveNodeState; }) {
  const { type, source, state: { currentTerm, votedFor, log } } = event;
  return <EventContainer>
    <strong>💾 {type}</strong>
    <dl>
      <dt>Source</dt>
      <dd>{source}</dd>
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
    </dl>
  </EventContainer>;
}

function SaveVolatileStateCard({ event }: { event: SaveVolatileState; }) {
  const { type, source, volatileState: { commitIndex, lastApplied } } = event;
  return <EventContainer>
    <strong>💾 {type}</strong>
    <dl>
      <dt>Source</dt>
      <dd>{source}</dd>
      <dt>Volatile state</dt>
      <dd>
        <dl>
          <dt>Commit index</dt>
          <dd>{commitIndex}</dd>
          <dt>Last applied</dt>
          <dd>{lastApplied}</dd>
        </dl>
      </dd>
    </dl>
  </EventContainer>;
}

function SaveVolatileLeaderStateCard({ event }: { event: SaveVolatileLeaderState; }) {
  const { type, source, volatileLeaderState: { nextIndex, matchIndex } } = event;
  return <EventContainer>
    <strong>💾 {type}</strong>
    <dl>
      <dt>Source</dt>
      <dd>{source}</dd>
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
  </EventContainer>;
}

function SaveVoteResultsCard({ event }: { event: SaveVoteResults; }) {
  const { type, source, voteResults } = event;
  return <EventContainer>
    <strong>💾 {type}</strong>
    <dl>
      <dt>Source</dt>
      <dd>{source}</dd>
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
  </EventContainer>;
}

function ElectionTimerRestartCard({ event }: { event: ElectionTimerRestart; }) {
  const { type, source } = event;
  return <EventContainer>
    <strong>↺ {type}</strong>
    <dl>
      <dt>Source</dt>
      <dd>{source}</dd>
    </dl>
  </EventContainer>;
}

function ElectionTimerExpiryCard({ event }: { event: ElectionTimerExpiry; }) {
  const { type, destination } = event;
  return <EventContainer>
    <strong>⏰ {type}</strong>
    <dl>
      <dt>Destination</dt>
      <dd>{destination}</dd>
    </dl>
  </EventContainer>;
}

function ElectionTimerCancelCard({ event }: { event: ElectionTimerCancel; }) {
  const { type, source } = event;
  return <EventContainer>
    <strong>❌ {type}</strong>
    <dl>
      <dt>Source</dt>
      <dd>{source}</dd>
    </dl>
  </EventContainer>;
}

function EmptyAppendEntriesTimerRestartCard({ event }: { event: EmptyAppendEntriesTimerRestart; }) {
  const { type, source } = event;
  return <EventContainer>
    <strong>↺ {type}</strong>
    <dl>
      <dt>Source</dt>
      <dd>{source}</dd>
    </dl>
  </EventContainer>;
}

function EmptyAppendEntriesTimerExpiryCard({ event }: { event: EmptyAppendEntriesTimerExpiry; }) {
  const { type, destination } = event;
  return <EventContainer>
    <strong>⏰ {type}</strong>
    <dl>
      <dt>Destination</dt>
      <dd>{destination}</dd>
    </dl>
  </EventContainer>;
}

function EmptyAppendEntriesTimerCancelCard({ event }: { event: EmptyAppendEntriesTimerCancel; }) {
  const { type, source } = event;
  return <EventContainer>
    <strong>❌ {type}</strong>
    <dl>
      <dt>Source</dt>
      <dd>{source}</dd>
    </dl>
  </EventContainer>;
}

export const EventCard = (props: { event: Event; }) => {
  const componentByType: { [eventType: string]: JSXElementConstructor<any>; } = {
    ClientCommandsRequest: ClientCommandsRequestCard,
    ClientCommandsResponse: ClientCommandsResponseCard,
    AppendEntriesRequest: AppendEntriesRequestCard,
    AppendEntriesResponse: AppendEntriesResponseCard,
    RequestVoteRequest: RequestVoteRequestCard,
    RequestVoteResponse: RequestVoteResponseCard,
    ChangeMode: ChangeModeCard,
    SaveConfiguration: SaveConfigurationCard,
    SaveNodeState: SaveNodeStateCard,
    SaveVolatileState: SaveVolatileStateCard,
    SaveVolatileLeaderState: SaveVolatileLeaderStateCard,
    SaveVoteResults: SaveVoteResultsCard,
    ElectionTimerRestart: ElectionTimerRestartCard,
    ElectionTimerExpiry: ElectionTimerExpiryCard,
    ElectionTimerCancel: ElectionTimerCancelCard,
    EmptyAppendEntriesTimerRestart: EmptyAppendEntriesTimerRestartCard,
    EmptyAppendEntriesTimerExpiry: EmptyAppendEntriesTimerExpiryCard,
    EmptyAppendEntriesTimerCancel: EmptyAppendEntriesTimerCancelCard
  };

  const Component: JSXElementConstructor<any> = componentByType[props.event.type] || (() => <>{props.event.type} not implemented</>);
  return <Component {...props} />;
};