import { Controller, Post, Delete, Param, Body, ParseUUIDPipe, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Queries } from '../../neo4j/neo4j.queries'
import { v4 as generateUuid } from 'uuid';
import { YieldsBody } from '../../domain/yields.relation';
import { ValidateYieldsRelationPipe } from '../../validation/validate-relation.pipe';
import { AccessAuthGuard } from 'src/auth/access.guard';

@Controller('yields')
export class YieldsController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @UsePipes(ValidationPipe, ValidateYieldsRelationPipe)
  @UseGuards(AccessAuthGuard)
  @Post()
  async createYields(@Body('props') body: YieldsBody) {
    await this.neo4jService.execute(Queries.createYields, {
      start: body.start,
      end: body.end,
      props: {
        uuid: generateUuid(),
      }
    });
  }

  // PUT not implemented, as there are no properties on a Yields relation
  
  @UseGuards(AccessAuthGuard)
  @Delete('/:uuid')
  async deleteYields(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string) {
    await this.neo4jService.execute(Queries.deleteRelation, {uuid});
  }
}
