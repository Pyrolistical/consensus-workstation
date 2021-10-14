import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';

import { EventCard } from '../events';
import NodeHandler, { NodeCard } from './';
import { Navigation } from '../worksheet';

const Container = styled.div`
  overflow-x: hidden;
  overflow-y: scroll;
  height: 100%;
  padding: 5px;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 5px;
  ${'' /* flex-wrap: wrap; */}
`;

const EventContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
  ${'' /* flex-wrap: wrap; */}
`;

const App = () => {
  const node = {
    id: 'leader',
    mode: 'leader',
    configuration: {
      peers: ['leader', 'follower', 'another follower']
    },
    state: {
      currentTerm: 1,
      votedFor: 'leader',
      log: [
        {
          term: 1,
          command: ''
        }
      ]
    },
    volatileState: {
      commitIndex: 0,
      lastApplied: 0
    },
    volatileLeaderState: {
      nextIndex: {
        follower: 1,
        'another follower': 1
      },
      matchIndex: {
        follower: 0,
        'another follower': 0
      }
    }
  };

  const inputEvent = {
    type: 'ClientCommandsRequest',
    source: 'client',
    destination: 'leader',
    commands: ['do thing']
  };
  const events = NodeHandler(node, inputEvent);
  return <Navigation>
    <Container>
      <div>
        <h1>Input event</h1>
        <EventCard event={inputEvent} />
      </div>
      <div>
        <h1>Node</h1>
        <NodeCard node={node} />
      </div>
      <div>
        <h1>Output events</h1>
        <EventContainer>
          {events.map((event, index) => <EventCard key={index} event={event} />)}
        </EventContainer>
      </div>
    </Container>
  </Navigation>;
};

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);;
