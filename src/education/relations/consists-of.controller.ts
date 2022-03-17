import { Controller, Post, Delete, Param, Body, ParseUUIDPipe, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Queries } from '../../neo4j/neo4j.queries'
import { v4 as generateUuid } from 'uuid';
import { ConsistsOfBody } from '../../domain/consists-of.relation';
import { ValidateConsistsOfRelationPipe } from '../../validation/validate-relation.pipe';
import { AccessAuthGuard } from 'src/auth/access.guard';

@Controller('consistsof')
export class ConsistsOfController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @UsePipes(ValidationPipe, ValidateConsistsOfRelationPipe)
  @UseGuards(AccessAuthGuard)
  @Post()
  async createConsistsOf(@Body('props') body: ConsistsOfBody) {
    await this.neo4jService.execute(Queries.createConsistsOf, {
      start: body.start,
      end: body.end,
      props: {
        uuid: generateUuid(),
      }
    });
  }

  // PUT not implemented, as there are no properties on a ConsistsOf relation
  
  @UseGuards(AccessAuthGuard)
  @Delete('/:uuid')
  async deleteConsistsOf(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string) {
    await this.neo4jService.execute(Queries.deleteRelation, {uuid});
  }
}
