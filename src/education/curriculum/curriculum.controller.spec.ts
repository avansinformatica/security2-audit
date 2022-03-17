import { Test } from "@nestjs/testing";
import { Queries } from "../../neo4j/neo4j.queries";
import { Neo4jService } from "../../neo4j/neo4j.service";
import { CurriculumController } from "./curriculum.controller";
import { v4 as generateUuid } from 'uuid';
import * as request from 'supertest';


describe('CurriculumController', () => {
  let curriculumController;
  let neo4jService;
  let app;

  beforeEach(async () => {
    const neo4jServiceMockProvider = {
      provide: Neo4jService,
      useFactory: () => ({execute: jest.fn()})
    }

    const moduleRef = await Test.createTestingModule({
      controllers: [CurriculumController],
      providers: [neo4jServiceMockProvider],
    })
    .compile();

    app = await moduleRef.createNestApplication().init();

    curriculumController = moduleRef.get<CurriculumController>(CurriculumController);
    neo4jService = moduleRef.get<Neo4jService>(Neo4jService);
  })

  describe('retrieving curricula summary', () => {
    test('gives response in correct format', async () => {
      neo4jService.execute
        .mockReturnValue([{
          id: 'id1',
          uuid: 'uuid1',
          name: 'name1',
          code: 'code1',
        }, {
          id: 'id2',
          uuid: 'uuid2',
          name: 'name2',
          code: 'code2',
        }]);

      await request(app.getHttpServer())
        .get('/curriculum')
        .expect(200)
        .then(response => {
          expect(response.body).toEqual([{
            id: 'uuid1',
            name: 'name1',
            code: 'code1',
          }, {
            id: 'uuid2',
            name: 'name2',
            code: 'code2',
          }]);
        })
    });
    
    test('executes correct query with parameters', async () => {
      // arrange
      const mockedValued = {mocked: 'return value'};
      neo4jService.execute.mockReturnValue(mockedValued);
  
      // act
      const returned = await curriculumController.getCurriculaSummary();
  
      // asserts
  
      // exactly 1 call to execute
      expect(neo4jService.execute).toBeCalledTimes(1);
      // first parameter is correct query, second parameter is empty
      expect(neo4jService.execute).toHaveBeenCalledWith(Queries.getCurricula, {})
      // returned value should be unaltered
      expect(returned).toEqual(mockedValued);
    });
  });

  describe('retrieving specific curriculum', () => {
    test('rejects an invalid uuid', async () => {
      await request(app.getHttpServer())
        .get('/curriculum/not-a-uuid')
        .expect(400)
        .then(response => {
          expect(response.body.message).toBe('Validation failed (uuid v4 is expected)');
        })
    });

    test('gives response in correct format', async () => {
      neo4jService.execute
        .mockReturnValueOnce([{
          id: 'nid1',
          kind: 'Program',
          uuid: 'uuid1',
          name: 'name1',
          code: 'code1',
        }, {
          id: 'nid2',
          kind: 'Unit',
          uuid: 'uuid2',
          name: 'name2',
          ec: 2,
          year: 1,
          period: 1,
        }, {
          id: 'nid3',
          kind: 'Result',
          uuid: 'uuid3',
          name: 'name3',
          description: 'description1',
        }])
        .mockReturnValueOnce([{
          id: 'nid4',
          uuid: 'uuid4',
          kind: 'ConsistsOf',
          start: 'nid1',
          end: 'nid2',
          future: 'property1',
        }, {
          id: 'nid5',
          uuid: 'uuid5',
          kind: 'Yields',
          start: 'nid2',
          end: 'nid3',
          future: 'property2',
        }]);

      await request(app.getHttpServer())
        .get(`/curriculum/${generateUuid()}`)
        .expect(200)
        .then(response => {
          expect(response.body).toEqual({
            id: 'uuid1',
            name: 'name1',
            code: 'code1',
            nodes: [{
              id: 'uuid2',
              kind: 'Unit',
              name: 'name2',
              ec: 2,
              year: 1,
              period: 1,
            }, {
              id: 'uuid3',
              kind: 'Result',
              name: 'name3',
              description: 'description1',
            }],
            relations: [{
              id: 'uuid5',
              kind: 'Yields',
              start: 'uuid2',
              end: 'uuid3',
              future: 'property2',
            }],
          });
        })
    });

    test('executes correct query with parameters', async () => {
      // arrange
      const mockedNodes = [{node: '1'}, {node: '2'}];
      const mockedRelations = [{relation: '1'}, {relation: '2'}];
      const mockedUuid = generateUuid();
      neo4jService.execute.mockReturnValueOnce(mockedNodes).mockReturnValueOnce(mockedRelations);
  
      // act
      const returned = await curriculumController.getCurriculum(mockedUuid);
  
      // asserts
  
      // exactly 1 call to execute
      expect(neo4jService.execute).toBeCalledTimes(2);
      // first parameter is correct query, second parameter has uuid
      expect(neo4jService.execute).toHaveBeenNthCalledWith(1, Queries.getCurriculumNodes, {uuid: mockedUuid});
      expect(neo4jService.execute).toHaveBeenNthCalledWith(2, Queries.getCurriculumRelations, {uuid: mockedUuid});
      // returned value has nodes and relations
      expect(returned).toHaveProperty('nodes');
      expect(returned.nodes).toEqual(mockedNodes);
      expect(returned).toHaveProperty('relations');
      expect(returned.relations).toEqual(mockedRelations);
    });
  });
})
