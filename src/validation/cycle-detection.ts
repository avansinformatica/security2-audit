/*
The idea of this algorithm is to build a tree starting from a random node
and following its outbound edges. When an outbound edge goes to a node that
we already incorporated into the tree we found a cycle. (Must keep track of tree depth!)
When the tree is fully built there might be nodes left unvisited. Therefore
we start this tree building procedure on each node that was not yet visited.
https://www.baeldung.com/cs/detecting-cycles-in-directed-graph
https://www.algotree.org/algorithms/tree_graph_traversal/depth_first_search/cycle_detection_in_directed_graphs/
*/

export class AdjacencyMap {
  private nodes: Map<number, Set<number>>;

  constructor() {
    this.nodes = new Map();
  }

  addNodes(nodeList: {id: number}[]) {
    for (let node of nodeList) {
      this.nodes.set(node.id, new Set());
    }
  }
  
  addRelations(relationList: {start: number, end: number}[]) {
    for (let relation of relationList) {
      if (!relation.start) relation.start = 0;
      if (!relation.end) relation.end = 0;
      // console.log(relation.start, relation.end, this.nodes)
      this.nodes.get(relation.start).add(relation.end);
    }
  }
  
  containsCycle(): boolean {
    const visited = new Set();
  
    for (let node of this.nodes.keys()) {
      const recursed = new Map();
      if (this.containsBackEdge(visited, recursed, node, 0)) {
        return true;
      }
    }
  
    return false;
  }
  
  private containsBackEdge(visited, recursed, node, depth): boolean {
    if (visited.has(node)) {
      return false;
    }
    
    recursed.set(node, depth);
    visited.add(node);
    for (let neighbor of this.nodes.get(node)) {
      if (recursed.has(neighbor) && recursed.get(neighbor) < depth) {
        return true;
      }
      if (this.containsBackEdge(visited, recursed, neighbor, depth + 1)) {
        return true;
      }
    }
  
    return false;
  }
}
