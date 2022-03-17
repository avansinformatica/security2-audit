import { Controller, Post, Delete, Param, Body, ParseUUIDPipe, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Queries } from '../../neo4j/neo4j.queries'
import { v4 as generateUuid } from 'uuid';
import { ValidateUsedInRelationPipe } from '../../validation/validate-relation.pipe';
import { UsedInBody } from '../../domain/used-in.relation';
import { AccessAuthGuard } from 'src/auth/access.guard';

@Controller('usedin')
export class UsedInController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @UsePipes(ValidationPipe, ValidateUsedInRelationPipe)
  @UseGuards(AccessAuthGuard)
  @Post()
  async createUsedIn(@Body('props') body: UsedInBody) {
    await this.neo4jService.execute(Queries.createUsedIn, {
      start: body.start,
      end: body.end,
      props: {
        uuid: generateUuid(),
      }
    });
  }

  // PUT not implemented, as there are no properties on a UsedIn relation
  
  @UseGuards(AccessAuthGuard)
  @Delete('/:uuid')
  async deleteUsedIn(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string) {
    await this.neo4jService.execute(Queries.deleteRelation, {uuid});
  }
}
