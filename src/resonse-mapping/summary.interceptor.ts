import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Graph } from 'src/neo4j/graph.model';

export interface Summary {
  id: string;
  name: string;
  code: string;
}

function summarizeProgram(program) {
  return {
    id: program.uuid,
    name: program.name,
    code: program.code,
  }
}

@Injectable()
export class SummaryInterceptor implements NestInterceptor<Graph.Node, Summary> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Summary> {
    return next
      .handle()
      .pipe(
        map(programs => programs.map(summarizeProgram))
      );
  }
}
