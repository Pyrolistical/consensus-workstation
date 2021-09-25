import React, { useMemo } from 'react';
import styled from "@emotion/styled";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
`;

const Link = styled.a`
  font-weight: ${({ active }) => active
    ? 'bold'
    : 'normal'
  }
`;

const paths = [
  {
    href: '/node',
    label: 'Node'
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

  console.log({ contextPath });
  return <>
    <Container>
      <span>Worksheets:</span>
      {paths.map(({ href, label }) => <Link
        key={href}
        href={href}
        active={href === contextPath}
      >{label}</Link>)}
    </Container>
    {children}
  </>;
};