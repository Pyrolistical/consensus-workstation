// import React, { forwardRef } from "react";
// import styled from "@emotion/styled";

// export const ViewportCanvas = styled.div`
//   max-width: ${({ width = 16, height = 9 }) => (100 * width) / height}vh;
//   max-height: ${({ width = 16, height = 9 }) => (100 * height) / width}vw;
//   width: 100vw;
//   height: 100vh;
// `;

// export function injectVh(cssLines, width = 16, height = 9) {
//   const vhs = [];
//   for (const css of cssLines.split(";\n")) {
//     const re = /(-?\d+(?:\.\d{1,2})?)vw/gm;
//     const matches = [];
//     let match;
//     // eslint-disable-next-line no-cond-assign
//     while ((match = re.exec(css)) !== null) {
//       matches.push({
//         value: Number.parseFloat(match[1]),
//         index: match.index,
//         length: match[1].length + 2
//       });
//     }
//     let vh = css;
//     let indexShift = 0;
//     for (const { value, index, length } of matches) {
//       const before = vh.slice(0, index + indexShift);
//       const vhValue = ((value * width) / height).toFixed(2);
//       const after = vh.slice(index + indexShift + length);
//       vh = `${before}${vhValue}vh${after}`;
//       indexShift += vhValue.length + 2 - length;
//     }
//     vhs.push(vh);
//   }
//   return `${cssLines}
//   @media (min-aspect-ratio: ${width}/${height}) {
//     ${vhs.join(";\n")}
//   }`;
// }

// export const Rect = styled.div`
//   box-sizing: border-box;
//   position: fixed;
//   border-color: black;
//   border-style: solid;
//   ${({ x = 0, y = 0, width = 10, height = 10, strokeWidth = 1 }) => {
//     const halfStrokeWidth = strokeWidth / 2;
//     return injectVh(`
//       left: ${(x - halfStrokeWidth).toFixed(2)}vw;
//       top: ${(y - halfStrokeWidth).toFixed(2)}vw;
//       width: ${(width + strokeWidth).toFixed(2)}vw;
//       height: ${(height + strokeWidth).toFixed(2)}vw;
//       border-width: ${strokeWidth.toFixed(2)}vw;
//     `);
//   }}
// `;
// Rect.fromCenter = forwardRef(
//   ({ x: centerX, y: centerY, width, height, ...props }, ref) => {
//     const x = centerX - width / 2;
//     const y = centerY - height / 2;
//     return <Rect ref={ref} {...{ x, y, width, height, ...props }} />;
//   }
// );

// export const Circle = styled.div`
//   box-sizing: border-box;
//   position: fixed;
//   border-color: black;
//   border-style: solid;
//   ${({ x = 0, y = 0, radius = 10, strokeWidth = 1 }) => {
//     const radiusWithStroke = radius + strokeWidth / 2;
//     const diameter = 2 * radiusWithStroke;
//     return injectVh(`
//       left: ${(x - radiusWithStroke).toFixed(2)}vw;
//       top: ${(y - radiusWithStroke).toFixed(2)}vw;
//       width: ${diameter.toFixed(2)}vw;
//       height: ${diameter.toFixed(2)}vw;
//       border-radius: ${radiusWithStroke.toFixed(2)}vw;
//       border-width: ${strokeWidth.toFixed(2)}vw;
//     `);
//   }}
// `;

// function dist(x1, y1, x2, y2) {
//   return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
// }

// export const Line = styled.div`
//   box-sizing: border-box;
//   position: fixed;
//   background-color: black;
//   ${({ x1, y1, x2, y2, strokeWidth = 1 }) => {
//     const length = dist(x1, y1, x2, y2) + strokeWidth;
//     const x0 = x1.toFixed(2);
//     const y0 = y1.toFixed(2);
//     const halfStrokeWidth = (strokeWidth / 2).toFixed(2);
//     return injectVh(`
//       top: ${y0}vw;
//       left: ${x0}vw;
//       width: ${length.toFixed(2)}vw;
//       height: ${strokeWidth.toFixed(2)}vw;
//       transform-origin: ${halfStrokeWidth}vw ${halfStrokeWidth}vw;
//       transform: translate(${-halfStrokeWidth}vw, ${-halfStrokeWidth}vw) rotate(${Math.atan2(
//       y2 - y1,
//       x2 - x1
//     ).toFixed(2)}rad);
//     `);
//   }}
// `;
