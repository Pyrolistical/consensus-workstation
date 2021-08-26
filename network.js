// import * as R from "ramda";
// import { Event, Node, NodeId } from "./events";

// export default (nodes) => {
//   const nodeById: Record<NodeId, Node> = R.indexBy(R.prop("nodeId"), nodes);
//   const self = {
//     dispatch(events: Event[]) {
//       const results = [];
//       for (const event of events) {
//         switch (event.type) {
//           case "ClientRequest":
//           case "AppendEntriesRequest":
//           case "AppendEntriesResponse":
//           case "NetworkCallStateRestored":
//           case "ConfigurationRestored":
//           case "NodeStateRestored":
//           case "NodeVolatileStateRestored":
//           case "NodeVolatileLeaderStateRestored":
//           case "ElectionTimerEnded": {
//             const node = nodeById[event.destination];
//             if (!node) {
//               throw new Error(`no node for "${event.destination}"`);
//             }
//             results.push(...node.handle(event));
//             continue;
//           }
//         }
//       }
//       return results;
//     }
//   };
//   return self;
// };
