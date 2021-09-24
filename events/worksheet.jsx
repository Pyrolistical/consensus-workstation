import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import styled from "@emotion/styled";

import { EventCard } from './';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 5px;
  flex-wrap: wrap;
  padding: 5px;
  overflow-x: hidden;
  overflow-y: scroll;
  height: 100%;
`;

const App = () => {
  return <Container>
    <EventCard event={{
      type: 'RequestVoteRequest',
      source: 'candidate',
      destination: 'follower',
      term: 2,
      candidateId: 'candidate',
      lastLogIndex: 2,
      lastLogTerm: 1
    }} />
    <EventCard event={{
      type: 'RequestVoteResponse',
      source: 'follower',
      destination: 'candidate',
      term: 2,
      voteGranted: true,
      request: {
        type: 'RequestVoteRequest',
        source: 'candidate',
        destination: 'follower',
        term: 2,
        candidateId: 'candidate',
        lastLogIndex: 2,
        lastLogTerm: 1
      }
    }} />
    <EventCard event={{
      type: 'ClientCommandsRequest',
      source: 'client',
      destination: 'leader',
      commands: ['do thing']
    }} />
    <EventCard event={{
      type: 'ClientCommandsResponse',
      source: 'leader',
      destination: 'client',
      success: true,
      leaderId: 'leader',
      request: {
        type: 'ClientCommandsRequest',
        source: 'client',
        destination: 'leader',
        commands: ['do thing']
      }
    }} />
    <EventCard event={{
      type: 'AppendEntriesRequest',
      source: 'leader',
      destination: 'follower',
      term: 1,
      leaderId: 'leader',
      prevLogIndex: 0,
      prevLogTerm: 1,
      entries: [
        {
          term: 1,
          command: 'do thing'
        }
      ],
      leaderCommit: 0,
      clientRequest: {
        type: 'ClientCommandsRequest',
        source: 'client',
        destination: 'leader',
        commands: ['do thing']
      }
    }} />
    <EventCard event={{
      type: 'AppendEntriesResponse',
      source: 'follower',
      destination: 'leader',
      term: 1,
      success: true,
      request: {
        type: 'AppendEntriesRequest',
        source: 'leader',
        destination: 'follower',
        term: 1,
        leaderId: 'leader',
        prevLogIndex: 0,
        prevLogTerm: 1,
        entries: [
          {
            term: 1,
            command: 'do thing'
          }
        ],
        leaderCommit: 0,
        clientRequest: {
          type: 'ClientCommandsRequest',
          source: 'client',
          destination: 'leader',
          commands: ['do thing']
        }
      }
    }} />
    <EventCard event={{
      type: 'ChangeMode',
      source: 'follower',
      mode: 'leader',
      leaderId: 'leader'
    }} />
    <EventCard event={{
      type: 'SaveConfiguration',
      source: 'follower',
      configuration: {
        peers: [
          'leader',
          'follower',
          'another follower'
        ]
      }
    }} />
    <EventCard event={{
      type: 'SaveNodeState',
      source: 'follower',
      state: {
        currentTerm: 1,
        votedFor: 'leader',
        log: [
          {
            term: 1,
            command: 'do thing'
          },
          {
            term: 1,
            command: 'do another thing'
          }
        ]
      }
    }} />
    <EventCard event={{
      type: 'SaveVolatileState',
      source: 'leader',
      volatileState: {
        commitIndex: 3,
        lastApplied: 4
      }
    }} />
    <EventCard event={{
      type: 'SaveVolatileLeaderState',
      source: 'leader',
      volatileLeaderState: {
        nextIndex: {
          follower: 3,
          'another folllower': 4
        },
        matchIndex: {
          follower: 2,
          'another folllower': 3
        }
      }
    }} />
    <EventCard event={{
      type: 'SaveVoteResults',
      source: 'candidate',
      voteResults: {
        follower: false,
        'candidate': true
      }
    }} />
    <EventCard event={{
      type: 'ElectionTimerRestart',
      source: 'follower'
    }} />
    <EventCard event={{
      type: 'ElectionTimerExpiry',
      destination: 'follower'
    }} />
    <EventCard event={{
      type: 'ElectionTimerCancel',
      source: 'candidate'
    }} />
    <EventCard event={{
      type: 'EmptyAppendEntriesTimerRestart',
      source: 'follower'
    }} />
    <EventCard event={{
      type: 'EmptyAppendEntriesTimerExpiry',
      destination: 'follower'
    }} />
    <EventCard event={{
      type: 'EmptyAppendEntriesTimerCancel',
      source: 'candidate'
    }} />
  </Container>;
};

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);;
