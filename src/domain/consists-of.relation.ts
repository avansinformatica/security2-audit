import { IsUUID } from "class-validator";
import { Graph } from "../neo4j/graph.model";

// NOTE: if the relation ever gets properties you should implement
//       body validation in the relation endpoints, including tests!
//       see node endpoints and their test for example

export class ConsistsOf extends Graph.Relation {
  
}

export class ConsistsOfBody extends ConsistsOf {
  @IsUUID('4')
  public start: string;

  @IsUUID('4')
  public end: string;
}