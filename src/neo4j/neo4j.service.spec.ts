import { Driver } from "neo4j-driver";
import { Neo4jConfig } from "./neo4j.config";
import { NeoQuery, Queries } from "./neo4j.queries";
import { Neo4jService } from "./neo4j.service";

describe('Neo4jService', () => {
  class TestQuery extends NeoQuery<Node,{mocked: string}> {
    constructor() {
      super("some cypher query", false);
    }
  }

  let neo4jService;
  let mockedRun;
  let query;
  let mockedParams;

  beforeEach(() => {
    query = new TestQuery();
    mockedParams = {mocked: 'param'};
    neo4jService = new Neo4jService(undefined as Neo4jConfig, undefined as Driver);
    mockedRun = jest.fn();
    neo4jService.getSession = jest.fn().mockReturnValue({run: mockedRun});
  });

  test('executes correct query with parameters, returning empty list', async () => {
    // arrange
    mockedRun.mockReturnValue({records: []});

    // act
    const returned = await neo4jService.execute(query, mockedParams);

    // asserts

    // getSession should be called once
    expect(neo4jService.getSession).toBeCalledTimes(1);
    expect(neo4jService.getSession).toBeCalledWith(query.writeAccess);
    // session.run should be called once with correct query and parameters
    expect(mockedRun).toBeCalledTimes(1);
    expect(mockedRun).toBeCalledWith(query.cypher, mockedParams);
    // service should return empty list
    expect(returned).toEqual([]);
  });

  test('executes correct query with parameters, returning populated node list', async () => {
    // arrange
    const node1 = {
      identity: 'id1',
      labels: ['l1'],
      properties: {
        some: 'props1',
      },
    };

    const node1mapped = {
      id: 'id1',
      kind: 'l1',
      some: 'props1',
    };

    const node2 = {
      identity: 'id2',
      labels: ['l2'],
      properties: {
        some: 'props2',
      },
    };

    const node2mapped = {
      id: 'id2',
      kind: 'l2',
      some: 'props2',
    };

    mockedRun.mockReturnValue({records: [
      {
        keys: ['k'],
        get: () => node1,
      },
      {
        keys: ['k'],
        get: () => node2,
      }
    ]});

    // act
    const returned = await neo4jService.execute(query, mockedParams);

    // asserts

    // getSession should be called once
    expect(neo4jService.getSession).toBeCalledTimes(1);
    expect(neo4jService.getSession).toBeCalledWith(query.writeAccess);
    // session.run should be called once with correct query and parameters
    expect(mockedRun).toBeCalledTimes(1);
    expect(mockedRun).toBeCalledWith(query.cypher, mockedParams);
    // service should return populated node list
    expect(returned).toEqual([node1mapped, node2mapped]);
  });

  test('executes correct query with parameters, returning populated relation list', async () => {
    // arrange
    const relation1 = {
      identity: 'id1',
      start: 's1',
      end: 'e1',
      type: 't1',
      properties: {
        some: 'props1',
      },
    };

    const relation1mapped = {
      id: 'id1',
      start: 's1',
      end: 'e1',
      kind: 't1',
      some: 'props1',
    };

    const relation2 = {
      identity: 'id2',
      start: 's2',
      end: 'e2',
      type: 't2',
      properties: {
        some: 'props2',
      },
    };

    const relation2mapped = {
      id: 'id2',
      start: 's2',
      end: 'e2',
      kind: 't2',
      some: 'props2',
    };

    mockedRun.mockReturnValue({records: [
      {
        keys: ['k'],
        get: () => relation1,
      },
      {
        keys: ['k'],
        get: () => relation2,
      }
    ]});

    // act
    const returned = await neo4jService.execute(query, mockedParams);

    // asserts

    // getSession should be called once
    expect(neo4jService.getSession).toBeCalledTimes(1);
    expect(neo4jService.getSession).toBeCalledWith(query.writeAccess);
    // session.run should be called once with correct query and parameters
    expect(mockedRun).toBeCalledTimes(1);
    expect(mockedRun).toBeCalledWith(query.cypher, mockedParams);
    // service should return populated node list
    expect(returned).toEqual([relation1mapped, relation2mapped]);  
  });
})