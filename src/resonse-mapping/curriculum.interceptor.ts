import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Curriculum {
  id: string;
  name: string;
  code: string;
  nodes: {uuid: string}[];
  relations: {start: string, end: string}[];
}

function formatNode(node) {
  const newNode = {
    ...node,
    id: node.uuid,
  };

  delete newNode.uuid;

  return newNode;
}

function formatRelationFactory(idMap) {
  return function(relation) {
    const newRelation = {
      ...relation,
      id: relation.uuid,
      start: idMap.get(relation.start),
      end: idMap.get(relation.end),
    }

    delete newRelation.uuid;

    return newRelation;
  }
}

@Injectable()
export class CurriculumInterceptor implements NestInterceptor<unknown, Curriculum> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Curriculum> {
    return next
      .handle()
      .pipe(
        map(cur => {
          const programIdx = cur.nodes.findIndex(node => node.kind === 'Program');
          const program = cur.nodes[programIdx];
          cur.nodes.splice(programIdx, 1);
          
          const idMap = new Map();
          for (let node of cur.nodes) {
            idMap.set(node.id, node.uuid);
          }

          return {
            id: program.uuid,
            name: program.name,
            code: program.code,
            nodes: cur.nodes.map(formatNode),
            relations: 
              cur.relations
                .filter(rel => rel.kind !== 'ConsistsOf')
                .map(formatRelationFactory(idMap)),
          }
        })
      );
  }
}
