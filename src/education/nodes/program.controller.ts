import { Controller, Post, Put, Delete, Param, Body, ParseUUIDPipe, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { Queries } from '../../neo4j/neo4j.queries'
import { PartialProgram, Program } from '../../domain/program.node';
import { v4 as generateUuid } from 'uuid';
import { AccessAuthGuard } from 'src/auth/access.guard';

@Controller('program')
export class ProgramController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @UsePipes(new ValidationPipe({whitelist: true}))
  @UseGuards(AccessAuthGuard)
  @Post()
  async createProgram(@Body('props') props: Program) {
    const uuid = generateUuid();
    await this.neo4jService.execute(Queries.createProgram, {
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
  async updateProgram(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string, @Body('props') props: PartialProgram) {
    await this.neo4jService.execute(Queries.updateProgram, {uuid, props});
  }

  @UseGuards(AccessAuthGuard)
  @Delete('/:uuid')
  async deleteProgram(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string) {
    await this.neo4jService.execute(Queries.deleteNode, {uuid});
  }
}
