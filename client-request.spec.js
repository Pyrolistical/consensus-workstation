// import { Event } from "./events";

// import Node from "./node";
// import Network from "./network";

// test("client request are distributed from leader to peers", () => {
//   const peers = ["leader", "follower", "another follower"];
//   const nodes = peers.map(Node);
//   const network = Network(nodes);
//   const events: Event[] = [
//     {
//       type: "ConfigurationRestored",
//       destination: "leader",
//       configuration: {
//         peers
//       }
//     },
//     {
//       type: "NodeStateRestored",
//       destination: "leader",
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
//           follower: 1,
//           "another follower": 1
//         },
//         matchIndex: {
//           follower: 0,
//           "another follower": 0
//         }
//       }
//     },
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
//       type: "ConfigurationRestored",
//       destination: "another follower",
//       configuration: {
//         peers
//       }
//     },
//     {
//       type: "NodeStateRestored",
//       destination: "another follower",
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
//       requestId: 0,
//       type: "ClientRequest",
//       source: "client",
//       destination: "leader",
//       commands: ["do thing"]
//     }
//   ];

//   const results: Event[] = network.dispatch(events);

//   expect(results).toEqual([
//     {
//       type: "SaveNodeState",
//       source: "leader",
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
//       type: "SaveNetworkCallState",
//       source: "leader",
//       state: {
//         nextRequestId: 1,
//         inflightRequests: {
//           0: {
//             requestId: 0,
//             type: "AppendEntriesRequest",
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
//       type: "AppendEntriesRequest",
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
//     },
//     {
//       type: "SaveNetworkCallState",
//       source: "leader",
//       state: {
//         nextRequestId: 2,
//         inflightRequests: {
//           0: {
//             requestId: 0,
//             type: "AppendEntriesRequest",
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
//           },
//           1: {
//             requestId: 1,
//             type: "AppendEntriesRequest",
//             destination: "another follower",
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
//       requestId: 1,
//       type: "AppendEntriesRequest",
//       destination: "another follower",
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
//   ]);
// });
