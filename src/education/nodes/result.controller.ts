import { Controller, Post, Put, Delete, Param, Body, ParseUUIDPipe, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Queries } from '../../neo4j/neo4j.queries'
import { PartialResult, Result } from '../../domain/result.node';
import { v4 as generateUuid } from 'uuid';
import { AccessAuthGuard } from 'src/auth/access.guard';

@Controller('result')
export class ResultController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @UsePipes(new ValidationPipe({whitelist: true}))
  @UseGuards(AccessAuthGuard)
  @Post()
  async createResult(@Body('props') props: Result) {
    const uuid = generateUuid();
    await this.neo4jService.execute(Queries.createResult, {
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
  async updateResult(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string, @Body('props') props: PartialResult) {
    await this.neo4jService.execute(Queries.updateResult, {uuid, props});
  }

  @Delete('/:uuid')
  @UseGuards(AccessAuthGuard)
  async deleteResult(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string) {
    await this.neo4jService.execute(Queries.deleteNode, {uuid});
  }
}
