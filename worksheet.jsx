import React, { useMemo } from 'react';
import styled from "@emotion/styled";

const TabBar = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
  padding-top: 10px;
  position: relative;
  height: 100%;
`;

const Tabs = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
`;

const Tab = ({ active, href, children }) => {
  return <TabContainer active={active}>
    <a href={href}>{children}</a>
  </TabContainer>;
};

const TabContainer = styled.div`
  padding-left: 5px;
  padding-right: 5px;
  border-color: ${({ active }) => active ? 'black' : 'dimgrey'};
  border-width: 2px;
  border-style: solid;
  border-bottom-color: ${({ active }) => active ? 'white' : 'black'};
  border-radius: 8px 8px 0 0;
  height: 20px;
  z-index: 2;

  a {
    text-decoration: none;
    color: ${({ active }) => active ? 'black' : 'dimgrey'};
  }
`;

const TabBody = styled.div`;
  position: absolute;
  top: 32px;
  left: 0;
  right: 0;
  bottom: 0;
  border-top-color: black;
  border-top-style: solid;
  border-top-width: 2px;
  z-index: 1;
`;

const paths = [
  {
    href: '/nodes',
    label: 'Nodes'
  },
  {
    href: '/events',
    label: 'Events'
  },
];

export const Navigation = ({ children }) => {
  const contextPath = useMemo(() => {
    const [, contextPath] = window.location.pathname.split('/');
    return `/${contextPath}`;
  }, [window.location.pathname]);

  return <>
    <TabBar>
      <span>Worksheets:</span>
      <Tabs>
        {paths.map(({ href, label }) => <Tab
          key={href}
          href={href}
          active={href === contextPath}
        >{label}</Tab>)}
      </Tabs>
      <TabBody>
        {children}
      </TabBody>
    </TabBar>
  </>;
};