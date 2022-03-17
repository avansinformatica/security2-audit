import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Graph } from 'src/neo4j/graph.model';
import { Queries } from '../neo4j/neo4j.queries';
import { Neo4jService } from '../neo4j/neo4j.service';
import { relationAllowed } from './allowed-relations';
import { AdjacencyMap } from './cycle-detection';


class ValidateRelationPipe implements PipeTransform {
  constructor(private relationType: string, private readonly neo4jService: Neo4jService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    // check that nodes are not the same
    if (value.start === value.end) throw new BadRequestException([`start and end node cannot have the same id ${value.start}`]);
    
    // erase types as we have nodes with uuid (gets exposed as id after controller)
    // const startConnectedNodes: any[] = await this.neo4jService.execute(Queries.getConnectedNodes, {uuid: value.start});
    // const endConnectedNodes: any[] = await this.neo4jService.execute(Queries.getConnectedNodes, {uuid: value.end});
    
    // check that nodes exist
    // const errors = []; // error accumulator
    // if (startConnectedNodes.length == 0) errors.push(`start node ${value.start} does not exist`)
    // if (endConnectedNodes.length == 0) errors.push(`end node ${value.end} does not exist`)

    // console.log(startConnectedNodes)
    // console.log(endConnectedNodes)
    
    // return if there are errors, as calculations in next part don't make sense without data
    // if (errors.length > 0) throw new BadRequestException(errors);

    // const startNode = startConnectedNodes.find(node => node.uuid === value.start);
    // const endNode = endConnectedNodes.find(rel => rel.uuid === value.end);

    // const startType = startNode.kind;
    // const endType = endNode.kind;

    // const startId = startNode.id;
    // const endId = endNode.id;

    // check that relation type is allowed
    // if (!relationAllowed(this.relationType, startType, endType)) throw new BadRequestException([`${this.relationType} relation not allowed from ${startType} to ${endType} nodes`])
    
    // const startConnectedRelations: any[] = await this.neo4jService.execute(Queries.getConnectedRelations, {uuid: value.start});
    // const endConnectedRelations: any[] = await this.neo4jService.execute(Queries.getConnectedRelations, {uuid: value.end});

    // console.log(startConnectedRelations)
    // console.log(endConnectedRelations)

    // const adjacencyMap = new AdjacencyMap();

    // adjacencyMap.addNodes(startConnectedNodes);
    // adjacencyMap.addNodes(endConnectedNodes);

    // adjacencyMap.addRelations(startConnectedRelations);
    // adjacencyMap.addRelations(endConnectedRelations);

    // adjacencyMap.addRelations([{start: startId, end: endId}]);

    // if (adjacencyMap.containsCycle()) throw new BadRequestException(['creating this relation would introduce a cycle']);
    
    return value;
  }
}


// the constructor of the ValidateRelationPipe has a fixed parameter and an
// injected parameter. to make that work you seem to need three types...
@Injectable()
export class ValidateConsistsOfRelationPipe extends ValidateRelationPipe {
  constructor(neo4jService: Neo4jService) {
    super("ConsistsOf", neo4jService);
  }
}

@Injectable()
export class ValidateUsedInRelationPipe extends ValidateRelationPipe {
  constructor(neo4jService: Neo4jService) {
    super("UsedIn", neo4jService);
  }
}

@Injectable()
export class ValidateYieldsRelationPipe extends ValidateRelationPipe {
  constructor(neo4jService: Neo4jService) {
    super("Yields", neo4jService);
  }
}
