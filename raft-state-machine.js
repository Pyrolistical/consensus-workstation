import {next as nodeNext} from './node-state-machine';

export function next(nodes, event) {
  const node = nodes.find(({id}) => id === event.destination);
  return nodeNext(node, event);
}