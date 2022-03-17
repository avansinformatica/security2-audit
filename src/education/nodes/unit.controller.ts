import { Controller, Post, Put, Delete, Param, Body, ParseUUIDPipe, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Queries } from '../../neo4j/neo4j.queries'
import { PartialUnit, Unit } from '../../domain/unit.node';
import { v4 as generateUuid } from 'uuid';
import { AccessAuthGuard } from 'src/auth/access.guard';

@Controller('unit')
export class UnitController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @UsePipes(new ValidationPipe({whitelist: true}))
  @UseGuards(AccessAuthGuard)
  @Post()
  async createUnit(@Body('props') props: Unit) {
    const uuid = generateUuid();
    await this.neo4jService.execute(Queries.createUnit, {
      props: {
        ...props,
        uuid,
      }
    });
    return {id: uuid};
  }

  @UsePipes(new ValidationPipe({whitelist: true}))
  @UseGuards(AccessAuthGuard)
  @Post('/connected')
  async createConnectedUnit(@Body('props') props: Unit, @Body('programId') programId: string) {
    const relationId = generateUuid();
    const unitId = generateUuid();
    await this.neo4jService.execute(Queries.createConnectedUnit, {
      props: {
        ...props,
        uuid: unitId,
      },
      programId,
      relationId,
    });
    return {id: unitId};
  }
  
  @UsePipes(new ValidationPipe({whitelist: true}))
  @UseGuards(AccessAuthGuard)
  @Put('/:uuid')
  async updateUnit(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string, @Body('props') props: PartialUnit) {
    await this.neo4jService.execute(Queries.updateUnit, {uuid, props});
  }

  @UseGuards(AccessAuthGuard)
  @Delete('/:uuid')
  async deleteUnit(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string) {
    await this.neo4jService.execute(Queries.deleteNode, {uuid});
  }
}
