// import { Event } from "./events";

// import Node from "./node";
// import Network from "./network";

// test("append entries are handled by followers", () => {
//   const peers = ["leader", "follower", "another follower"];
//   const nodes = peers.map(Node);
//   const network = Network(nodes);
//   const events: Event[] = [
//     {
//       type: "ConfigurationRestored",
//       destination: "follower",
//       configuration: {
//         peers
//       }
//     },
//     {
//       type: "NodeStateRestored",
//       destination: "follower",
//       state: {
//         currentTerm: 1,
//         votedFor: "leader",
//         log: [
//           {
//             term: 1,
//             command: ""
//           }
//         ]
//       }
//     },
//     {
//       type: "NodeVolatileStateRestored",
//       destination: "follower",
//       state: {
//         commitIndex: 0,
//         lastApplied: 0
//       }
//     },
//     {
//       requestId: 0,
//       type: "AppendEntriesRequest",
//       source: "leader",
//       destination: "follower",
//       term: 1,
//       leaderId: "leader",
//       prevLogIndex: 0,
//       prevLogTerm: 1,
//       entries: [
//         {
//           term: 1,
//           command: "do thing"
//         }
//       ],
//       leaderCommit: 0
//     }
//   ];

//   const results: Event[] = network.dispatch(events);

//   expect(results).toEqual([
//     {
//       type: "SaveNodeState",
//       source: "follower",
//       state: {
//         currentTerm: 1,
//         votedFor: "leader",
//         log: [
//           {
//             term: 1,
//             command: ""
//           },
//           {
//             term: 1,
//             command: "do thing"
//           }
//         ]
//       }
//     },
//     {
//       requestId: 0,
//       type: "AppendEntriesResponse",
//       destination: "leader",
//       term: 1,
//       success: true
//     }
//   ]);
// });

// test("leader updates nextIndex and matchIndex", () => {
//   const peers = ["leader", "follower", "another follower"];
//   const nodes = peers.map(Node);
//   const network = Network(nodes);
//   const events: Event[] = [
//     {
//       type: "ConfigurationRestored",
//       destination: "follower",
//       configuration: {
//         peers
//       }
//     },
//     {
//       type: "NodeStateRestored",
//       destination: "follower",
//       state: {
//         currentTerm: 1,
//         votedFor: "leader",
//         log: [
//           {
//             term: 1,
//             command: ""
//           },
//           {
//             term: 1,
//             command: "do thing"
//           }
//         ]
//       }
//     },
//     {
//       type: "NodeVolatileStateRestored",
//       destination: "leader",
//       state: {
//         commitIndex: 0,
//         lastApplied: 0
//       }
//     },
//     {
//       type: "NodeVolatileLeaderStateRestored",
//       destination: "leader",
//       state: {
//         nextIndex: {
//           follower: 2,
//           "another follower": 1
//         },
//         matchIndex: {
//           follower: 1,
//           "another follower": 0
//         }
//       }
//     },
//     {
//       type: "NetworkCallStateRestored",
//       destination: "leader",
//       state: {
//         nextRequestId: 1,
//         inflightRequests: {
//           0: {
//             requestId: 0,
//             type: "AppendEntriesRequest",
//             source: "leader",
//             destination: "follower",
//             term: 1,
//             leaderId: "leader",
//             prevLogIndex: 0,
//             prevLogTerm: 1,
//             entries: [
//               {
//                 term: 1,
//                 command: "do thing"
//               }
//             ],
//             leaderCommit: 0
//           }
//         }
//       }
//     },
//     {
//       requestId: 0,
//       type: "AppendEntriesResponse",
//       source: "follower",
//       destination: "leader",
//       term: 1,
//       success: true
//     }
//   ];

//   const results: Event[] = network.dispatch(events);

//   expect(results).toEqual([
//     {
//       type: "SaveNetworkCallState",
//       source: "leader",
//       state: {
//         nextRequestId: 1,
//         inflightRequests: {}
//       }
//     },
//     {
//       type: "SaveNodeVolatileLeaderState",
//       source: "leader",
//       state: {
//         nextIndex: {
//           follower: 1,
//           "another follower": 1
//         },
//         matchIndex: {
//           follower: 0,
//           "another follower": 0
//         }
//       }
//     }
//   ]);
// });
