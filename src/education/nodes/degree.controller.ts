import { Controller, Post, Put, Delete, Param, Body, ParseUUIDPipe, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { v4 as generateUuid } from 'uuid';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Queries } from '../../neo4j/neo4j.queries'
import { Degree, PartialDegree } from '../../domain/degree.node';
import { AccessAuthGuard } from 'src/auth/access.guard';

@Controller('degree')
export class DegreeController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @UsePipes(new ValidationPipe({whitelist: true}))
  @UseGuards(AccessAuthGuard)
  @Post()
  async createDegree(@Body('props') props: Degree) {
    const uuid = generateUuid();
    await this.neo4jService.execute(Queries.createDegree, {
      props: {
        ...props,
        uuid,
      }
    });
    return {id: uuid};
  }
  
  @UsePipes(new ValidationPipe({whitelist: true}))
  @UseGuards(AccessAuthGuard)
  @Put('/:uuid')
  async updateDegree(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string, @Body('props') props: PartialDegree) {
    await this.neo4jService.execute(Queries.updateDegree, {uuid, props});
  }

  @UseGuards(AccessAuthGuard)
  @Delete('/:uuid')
  async deleteDegree(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string) {
    await this.neo4jService.execute(Queries.deleteNode, {uuid});
  }
}
