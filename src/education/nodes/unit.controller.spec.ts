import { Test } from "@nestjs/testing";
import { Queries } from "../../neo4j/neo4j.queries";
import { Neo4jService } from "../../neo4j/neo4j.service";
import { UnitController } from "./unit.controller";
import { v4 as generateUuid, version as uuidVersion, validate as uuidValidate } from 'uuid';
import * as request from 'supertest';

export function validUuidV4(uuid: string) {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

describe('UnitController', () => {
  let unitController;
  let neo4jService;
  let app;

  beforeEach(async () => {
    const neo4jServiceMockProvider = {
      provide: Neo4jService,
      useFactory: () => ({execute: jest.fn()})
    }

    const moduleRef = await Test.createTestingModule({
      controllers: [UnitController],
      providers: [neo4jServiceMockProvider],
    })
    .compile();

    app = await moduleRef.createNestApplication().init();

    unitController = moduleRef.get<UnitController>(UnitController);
    neo4jService = moduleRef.get<Neo4jService>(Neo4jService);
  });

  describe('creating unit node', () => {
    test('rejects with missing name, ec, year, period', async () => {
      await request(app.getHttpServer())
        .post('/unit')
        .send({})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual([
            'name should not be empty', 
            'name must be a string',
            'ec must be a positive number',
            'ec must be a number conforming to the specified constraints',
            'year must not be greater than 4',
            'year must not be less than 1',
            'year must be an integer number',
            'period must not be greater than 4',
            'period must not be less than 1',
            'period must be an integer number',
          ]);
        });
    });

    test('rejects with empty name', async () => {
      await request(app.getHttpServer())
        .post('/unit')
        .send({name: '', ec: 1, year: 1, period: 1})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['name should not be empty']);
        });
    });

    test('rejects with name not a string', async () => {
      await request(app.getHttpServer())
        .post('/unit')
        .send({name: 5, ec: 1, year: 1, period: 1})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['name must be a string']);
        });
    });

    test('rejects with zero ec', async () => {
      await request(app.getHttpServer())
        .post('/unit')
        .send({name: 'name', ec: 0, year: 1, period: 1})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['ec must be a positive number']);
        });
      });

    test('rejects with negative ec', async () => {
      await request(app.getHttpServer())
        .post('/unit')
        .send({name: 'name', ec: -4, year: 1, period: 1})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['ec must be a positive number']);
        });
    });

    test('rejects with year below 1', async () => {
      await request(app.getHttpServer())
        .post('/unit')
        .send({name: 'name', ec: 1, year: 0, period: 1})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['year must not be less than 1']);
        });
      });

    test('rejects with year above 4', async () => {
      await request(app.getHttpServer())
        .post('/unit')
        .send({name: 'name', ec: 1, year: 5, period: 1})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['year must not be greater than 4']);
        });
    });

    test('rejects with period below 1', async () => {
      await request(app.getHttpServer())
        .post('/unit')
        .send({name: 'name', ec: 1, year: 1, period: 0})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['period must not be less than 1']);
        });
      });

    test('rejects with period above 4', async () => {
      await request(app.getHttpServer())
        .post('/unit')
        .send({name: 'name', ec: 1, year: 1, period: 5})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['period must not be greater than 4']);
        });
    });

    test('ignores extraneous parameters in body', async () => {
      await request(app.getHttpServer())
        .post('/unit')
        .send({name: 'name', extraneous: 'property', ec: 1, year: 1, period: 1})
        .expect(201);

      expect(neo4jService.execute.mock.calls[0][1]).not.toHaveProperty('extraneous');
    });

    test('executes correct query with parameters', async () => {
      // act
      await unitController.createUnit({fake: 'property'});
  
      // asserts
  
      // exactly 1 call to execute
      expect(neo4jService.execute).toBeCalledTimes(1);
      // first parameter is correct query
      expect(neo4jService.execute.mock.calls[0][0]).toEqual(Queries.createUnit);
  
      const props = neo4jService.execute.mock.calls[0][1]
      // second parameter has props
      expect(props).toHaveProperty('props');
      // fake property is propagated
      expect(props.props).toHaveProperty('fake', 'property')
      // uuid is generated by controller
      expect(props.props).toHaveProperty('uuid')
      expect(validUuidV4(props.props.uuid)).toBe(true);
    });
  });

  describe('updating unit node', () => {
    test('rejects an invalid uuid', async () => {
      await request(app.getHttpServer())
        .put('/unit/not-a-uuid')
        .expect(400)
        .then(response => {
          expect(response.body.message).toBe('Validation failed (uuid v4 is expected)');
        })
    });

    test('rejects with empty name', async () => {
      await request(app.getHttpServer())
        .put(`/unit/${generateUuid()}`)
        .send({name: ''})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['name should not be empty']);
        });
    });
  
    test('rejects with name not a string', async () => {
      await request(app.getHttpServer())
        .put(`/unit/${generateUuid()}`)
        .send({name: 5})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['name must be a string']);
        });
    });

    test('rejects with zero ec', async () => {
      await request(app.getHttpServer())
        .put(`/unit/${generateUuid()}`)
        .send({name: 'name', ec: 0, year: 1, period: 1})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['ec must be a positive number']);
        });
      });

    test('rejects with negative ec', async () => {
      await request(app.getHttpServer())
        .put(`/unit/${generateUuid()}`)
        .send({name: 'name', ec: -4, year: 1, period: 1})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['ec must be a positive number']);
        });
    });

    test('rejects with year below 1', async () => {
      await request(app.getHttpServer())
        .put(`/unit/${generateUuid()}`)
        .send({name: 'name', ec: 1, year: 0, period: 1})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['year must not be less than 1']);
        });
      });

    test('rejects with year above 4', async () => {
      await request(app.getHttpServer())
        .put(`/unit/${generateUuid()}`)
        .send({name: 'name', ec: 1, year: 5, period: 1})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['year must not be greater than 4']);
        });
    });

    test('rejects with period below 1', async () => {
      await request(app.getHttpServer())
        .put(`/unit/${generateUuid()}`)
        .send({name: 'name', ec: 1, year: 1, period: 0})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['period must not be less than 1']);
        });
      });

    test('rejects with period above 4', async () => {
      await request(app.getHttpServer())
        .put(`/unit/${generateUuid()}`)
        .send({name: 'name', ec: 1, year: 1, period: 5})
        .expect(400)
        .then(response => {
          expect(response.body.message).toEqual(['period must not be greater than 4']);
        });
    });
  
    test('ignores extraneous parameters in body', async () => {
      await request(app.getHttpServer())
        .put(`/unit/${generateUuid()}`)
        .send({name: 'name', extraneous: 'property'})
        .expect(200);
  
      expect(neo4jService.execute.mock.calls[0][1]).toHaveProperty('props');
      expect(neo4jService.execute.mock.calls[0][1].props).not.toHaveProperty('extraneous');
    });
  
    test('executes correct query with parameters', async () => {
      // arrange
      const uuid = generateUuid();
  
      // act
      await unitController.updateUnit(uuid, {fake: 'property'});
  
      // asserts
  
      // exactly 1 call to execute
      expect(neo4jService.execute).toBeCalledTimes(1);
      // first parameter is correct query
      expect(neo4jService.execute.mock.calls[0][0]).toEqual(Queries.updateUnit);
  
      const props = neo4jService.execute.mock.calls[0][1]
      // second parameter has props
      expect(props).toHaveProperty('props');
      // fake property is propagated
      expect(props.props).toHaveProperty('fake', 'property')
      // check that correct uuid is passed
      expect(props).toHaveProperty('uuid')
      expect(props.uuid).toBe(uuid);
    });
  });

  describe('deleting unit node', () => {
    test('rejects an invalid uuid', async () => {
      await request(app.getHttpServer())
        .delete('/unit/not-a-uuid')
        .expect(400)
        .then(response => {
          expect(response.body.message).toBe('Validation failed (uuid v4 is expected)');
        })
    });
  
    test('executes correct query with parameters', async () => {
      // arrange
      const uuid = generateUuid();
  
      // act
      await unitController.deleteUnit(uuid);
  
      // asserts
  
      // exactly 1 call to execute
      expect(neo4jService.execute).toBeCalledTimes(1);
      // first parameter is correct query
      expect(neo4jService.execute.mock.calls[0][0]).toEqual(Queries.deleteNode);
  
      const props = neo4jService.execute.mock.calls[0][1]
      // check that correct uuid is passed
      expect(props).toHaveProperty('uuid')
      expect(props.uuid).toBe(uuid);
    });
  });
})
