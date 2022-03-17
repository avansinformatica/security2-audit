import { AdjacencyMap } from './cycle-detection';

describe('cycle detection', () => {
  let adjacencyMap: AdjacencyMap;

  beforeEach(() => {
    adjacencyMap = new AdjacencyMap();
  });

  test('finds no cycle in an empty graph', () => {
    expect(adjacencyMap.containsCycle()).toBe(false);
  });

  test('finds no cycle in a tree', () => {
    adjacencyMap.addNodes([{uuid: '0'}, {uuid: '1'}, {uuid: '2'}, {uuid: '11'}, {uuid: '12'}, {uuid: '21'}, {uuid: '22'}]);
    adjacencyMap.addRelations([{start: '0', end: '1'}, {start: '0', end: '2'}, {start: '1', end: '11'}, {start: '1', end: '12'}, {start: '2', end: '21'}, {start: '2', end: '22'}]);

    expect(adjacencyMap.containsCycle()).toBe(false);
  });

  test('finds no cycle in two disjoint trees', () => {
    adjacencyMap.addNodes([{uuid: 'a0'}, {uuid: 'a1'}, {uuid: 'a2'}, {uuid: 'a11'}, {uuid: 'a12'}, {uuid: 'a21'}, {uuid: 'a22'}]);
    adjacencyMap.addRelations([{start: 'a0', end: 'a1'}, {start: 'a0', end: 'a2'}, {start: 'a1', end: 'a11'}, {start: 'a1', end: 'a12'}, {start: 'a2', end: 'a21'}, {start: 'a2', end: 'a22'}]);
    adjacencyMap.addNodes([{uuid: 'b0'}, {uuid: 'b1'}, {uuid: 'b2'}, {uuid: 'b11'}, {uuid: 'b12'}, {uuid: 'b21'}, {uuid: 'b22'}]);
    adjacencyMap.addRelations([{start: 'b0', end: 'b1'}, {start: 'b0', end: 'b2'}, {start: 'b1', end: 'b11'}, {start: 'b1', end: 'b12'}, {start: 'b2', end: 'b21'}, {start: 'b2', end: 'b22'}]);

    expect(adjacencyMap.containsCycle()).toBe(false);
  });

  test('finds no cycle in a joining of two trees', () => {
    adjacencyMap.addNodes([{uuid: 'ra'}, {uuid: 'a1'}, {uuid: '2'}, {uuid: 'a11'}, {uuid: 'a21'}]);
    adjacencyMap.addRelations([{start: 'ra', end: 'a1'}, {start: 'ra', end: '2'}, {start: 'a1', end: 'a11'}, {start: '2', end: 'a21'}]);
    adjacencyMap.addNodes([{uuid: 'rb'}, {uuid: 'b1'}, {uuid: '2'}, {uuid: 'b11'}, {uuid: 'b21'}]);
    adjacencyMap.addRelations([{start: 'rb', end: 'b1'}, {start: 'rb', end: '2'}, {start: 'b1', end: 'b11'}, {start: '2', end: 'b21'}]);

    expect(adjacencyMap.containsCycle()).toBe(false);
  });

  test('finds no cycle in a diamond', () => {
    adjacencyMap.addNodes([{uuid: '1'}, {uuid: '2'}, {uuid: '3'}, {uuid: '4'}]);
    adjacencyMap.addRelations([{start: '1', end: '2'}, {start: '1', end: '3'}, {start: '2', end: '4'}, {start: '3', end: '4'}]);
    
    expect(adjacencyMap.containsCycle()).toBe(false);
  });

  test('finds no cycle in a diamond with crossing', () => {
    adjacencyMap.addNodes([{uuid: '1'}, {uuid: '2'}, {uuid: '3'}, {uuid: '4'}]);
    adjacencyMap.addRelations([{start: '1', end: '2'}, {start: '1', end: '3'}, {start: '2', end: '4'}, {start: '3', end: '4'}, {start: '2', end: '3'}]);
    
    expect(adjacencyMap.containsCycle()).toBe(false);
  });

  test('finds a cycle of length 2 in one set', () => {
    adjacencyMap.addNodes([{uuid: '1'}, {uuid: '2'}]);
    adjacencyMap.addRelations([{start: '1', end: '2'}, {start: '2', end: '1'}]);

    expect(adjacencyMap.containsCycle()).toBe(true);
  });

  test('finds a cycle of length 2 in two sets', () => {
    adjacencyMap.addNodes([{uuid: '1'}]);
    adjacencyMap.addNodes([{uuid: '2'}]);
    adjacencyMap.addRelations([{start: '1', end: '2'}]);
    adjacencyMap.addRelations([{start: '2', end: '1'}]);

    expect(adjacencyMap.containsCycle()).toBe(true);
  });

  test('finds a cycle of length 3 in one set', () => {
    adjacencyMap.addNodes([{uuid: '1'}, {uuid: '2'}, {uuid: '3'}]);
    adjacencyMap.addRelations([{start: '1', end: '2'}, {start: '2', end: '3'}, {start: '3', end: '1'}]);

    expect(adjacencyMap.containsCycle()).toBe(true);
  });

  test('finds a cycle of length 3 in two sets', () => {
    adjacencyMap.addNodes([{uuid: '1'}]);
    adjacencyMap.addNodes([{uuid: '2'}, {uuid: '3'}]);
    adjacencyMap.addRelations([{start: '1', end: '2'}]);
    adjacencyMap.addRelations([{start: '2', end: '3'}, {start: '3', end: '1'}]);

    expect(adjacencyMap.containsCycle()).toBe(true);
  });

  test('finds a cycle that is smaller than the full graph in one set', () => {
    adjacencyMap.addNodes([{uuid: '1'}, {uuid: '2'}, {uuid: '3'}, {uuid: '4'}, {uuid: '5'}]);
    adjacencyMap.addRelations([{start: '1', end: '2'}, {start: '2', end: '3'}, {start: '3', end: '1'}, {start: '5', end: '4'}, {start: '4', end: '1'}]);

    expect(adjacencyMap.containsCycle()).toBe(true);
  });

  test('finds a cycle that is smaller than the full graph but only in two sets', () => {
    adjacencyMap.addNodes([{uuid: '1'}, {uuid: '2'}, {uuid: '3'}]);
    adjacencyMap.addNodes([{uuid: '2'}, {uuid: '3'}, {uuid: '4'}, {uuid: '5'}]);
    adjacencyMap.addRelations([{start: '1', end: '2'}, {start: '3', end: '1'}]);
    adjacencyMap.addRelations([{start: '2', end: '3'}, {start: '5', end: '4'}, {start: '4', end: '1'}]);

    expect(adjacencyMap.containsCycle()).toBe(true);
  });

  test('finds a cycle when there are multiple intersecting cycles', () => {
    adjacencyMap.addNodes([{uuid: '1'}, {uuid: '2'}, {uuid: '3'}, {uuid: '4'}, {uuid: '5'}]);
    adjacencyMap.addRelations([{start: '1', end: '2'}, {start: '2', end: '3'}, {start: '3', end: '1'}, {start: '3', end: '4'}, {start: '4', end: '5'}, {start: '5', end: '3'}]);

    expect(adjacencyMap.containsCycle()).toBe(true);
  });
});
