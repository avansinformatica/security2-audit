import { Controller, Get, Param, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
import { SummaryInterceptor } from '../../resonse-mapping/summary.interceptor';
import { Queries } from '../../neo4j/neo4j.queries';
import { Neo4jService } from '../../neo4j/neo4j.service';
import { CurriculumInterceptor } from '../../resonse-mapping/curriculum.interceptor';

@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @UseInterceptors(SummaryInterceptor)
  @Get()
  async getCurriculaSummary() {
    return await this.neo4jService.execute(Queries.getCurricula, {});
  }

  @UseInterceptors(CurriculumInterceptor)
  @Get('/:uuid')
  async getCurriculum(@Param('uuid', new ParseUUIDPipe({version: '4'})) uuid: string) {
    const nodes = await this.neo4jService.execute(Queries.getCurriculumNodes, {uuid});
    const relations = await this.neo4jService.execute(Queries.getCurriculumRelations, {uuid});
    // console.log(nodes)
    // console.log(relations)
    return { nodes, relations }
  }
}
