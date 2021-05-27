// import React, { StrictMode, useState, Fragment, useEffect } from "react";
// import ReactDOM from "react-dom";
// import { css } from "emotion";
// import styled from "@emotion/styled";
// import * as R from "ramda";

// import { ViewportCanvas, Circle, Rect, Line, injectVh } from "./shapes.js";

// const Server = styled(Circle)`
//   background-color: blue;
// `;

// const Network = styled(Line)`
//   background-color: lightgray;
// `;

// function rotate(array) {
//   return [R.last(array), ...R.init(array)];
// }
// const App = () => {
//   const [servers, setServers] = useState(5);
//   const [sendPacket, setSendPacket] = useState({});
//   const serverCoordinates = R.range(0, servers).map((server) => {
//     const x = 20 * Math.sin((server * 2 * Math.PI) / servers) + 50;
//     const y = 30 - 20 * Math.cos((server * 2 * Math.PI) / servers);
//     return { x, y };
//   });
//   const serverConnections = serverCoordinates.flatMap((c1, i) =>
//     serverCoordinates.slice(i + 1).map((c2) => [c1, c2])
//   );

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const index = Math.floor(Math.random() * serverConnections.length);
//       const direction = Math.random() < 0.5 ? "+" : "-";
//       const key = `${direction}${index}`;
//       setSendPacket({
//         ...sendPacket,
//         [key]: true
//       });
//       setTimeout(() => {
//         setSendPacket({
//           ...sendPacket,
//           [key]: false
//         });
//       }, 1000);
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [serverConnections]);
//   return (
//     <ViewportCanvas>
//       {serverConnections.map(([{ x: x1, y: y1 }, { x: x2, y: y2 }], index) => {
//         const transformToStart = css`
//           transition: transform 1s;
//           ${injectVh(`
//             transform: translate(${(x1 - x2).toFixed(2)}vw, ${(y1 - y2).toFixed(
//             2
//           )}vw);
//           `)}
//         `;
//         const transformToEnd = css`
//           transition: transform 1s;
//           ${injectVh(`
//             transform: translate(${(x2 - x1).toFixed(2)}vw, ${(y2 - y1).toFixed(
//             2
//           )}vw);
//           `)}
//         `;
//         return (
//           <Fragment key={`${x1},${y1},${x2},${y2}`}>
//             <Network {...{ x1, y1, x2, y2 }} strokeWidth={0.5} />
//             <Rect.fromCenter
//               className={sendPacket[`+${index}`] && transformToEnd}
//               {...{ x: x1, y: y1, width: 1, height: 1 }}
//             />
//             <Rect.fromCenter
//               className={!sendPacket[`-${index}`] && transformToStart}
//               {...{ x: x2, y: y2, width: 1, height: 1 }}
//             />
//           </Fragment>
//         );
//       })}
//       {serverCoordinates.map(({ x, y }) => (
//         <Server key={`${x},${y}`} x={x} y={y} radius={2} strokeWidth={0} />
//       ))}
//     </ViewportCanvas>
//   );
// };

// // ReactDOM.render(
// //   <StrictMode>
// //     <App />
// //   </StrictMode>,
// //   document.getElementById("root")
// // );
