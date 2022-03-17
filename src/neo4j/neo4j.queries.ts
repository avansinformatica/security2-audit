import { Graph } from './graph.model';
import Node = Graph.Node;
import Relation = Graph.Relation;

import { Degree } from '../domain/degree.node';
import { Program } from '../domain/program.node';
import { Unit } from '../domain/unit.node';
import { Result } from '../domain/result.node';
import { Yields } from 'src/domain/yields.relation';
import { ConsistsOf } from 'src/domain/consists-of.relation';
import { UsedIn } from 'src/domain/used-in.relation';


// currently only handles one result type, Node or Relation
// in future possibly multiple types (e.g. a pair of Nodes)?
export abstract class NeoQuery<Result, Params> {
  // actual cypher query
  readonly cypher: string; 
  
  // makes the driver connect to the correct and most efficient instance in a cluster
  readonly writeAccess: boolean; 

  constructor(cypher: string, writeAccess: boolean) {
    this.cypher = cypher;
    this.writeAccess = writeAccess;
  }
}

class GetCurricula extends NeoQuery<Node, {}> {
  constructor() {
    super("MATCH (program:Program) RETURN program", false);
  }
}

class GetCurriculumNodes extends NeoQuery<Node, {uuid: string}> {
  constructor() {
    // super("MATCH (program:Program {uuid:$uuid}) MATCH (program)-[*]-(node) RETURN DISTINCT node", false);
    super("MATCH (program:Program {uuid:$uuid}) MATCH path=(program)-[*0..2]-(node) UNWIND nodes(path) as nodes RETURN DISTINCT nodes", false);
  }
}

class GetCurriculumRelations extends NeoQuery<Relation, {uuid: string}> {
  constructor() {
    super("MATCH (program:Program {uuid:$uuid}) MATCH (program)-[path*1..2]-() UNWIND path AS relation RETURN DISTINCT relation", false);
  }
}

class GetConnectedNodes extends NeoQuery<Node, {uuid: string}> {
  constructor() {
    super("MATCH (node {uuid:$uuid}) MATCH (node)-[*0..]-(connected) RETURN DISTINCT connected", false);
  }
}

class GetConnectedRelations extends NeoQuery<Relation, {uuid: string}> {
  constructor() {
    super("MATCH (node {uuid:$uuid}) MATCH (node)-[path*]-() UNWIND path as relation RETURN DISTINCT relation", false);
  }
}

// cypher queries don't allow parameters on the node label or relationship type
// that's why the generic queries require a label or type as string
// https://neo4j.com/docs/cypher-manual/current/syntax/parameters/
// https://github.com/neo4j/neo4j/issues/4334

type SomeNode = Program | Degree | Unit | Result;
type SomeRelation = Yields | ConsistsOf | UsedIn;

class CreateNode<T extends SomeNode> extends NeoQuery<undefined, {props: T}> {
  constructor(label: string) {
    super(`CREATE (:${label} $props)`, true);
  }
}

class CreateConnectedUnit extends NeoQuery<undefined, {programId: string, props: Unit, relationId: string}> {
  constructor() {
    super("MATCH (program:Program {uuid:$programId}) CREATE (unit:Unit $props)<-[:ConsistsOf {uuid:$relationId}]-(program)", true);
  }
}

class UpdateNode<T extends SomeNode> extends NeoQuery<undefined, {uuid: string, props: T}> {
  constructor(label: string) {
    super(`MATCH (n:${label}) WHERE n.uuid=$uuid SET n+=$props`, true);
  }
}

class DeleteNode extends NeoQuery<undefined, {uuid: string}> {
  constructor() {
    super("MATCH (n) WHERE n.uuid=$uuid DETACH DELETE n", true);
  }
}

class CreateRelation<T extends SomeRelation> extends NeoQuery<undefined, {props: T, start: string, end: string}> {
  constructor(type: string) {
    super(`MATCH (s) WHERE s.uuid=$start MATCH (e) WHERE e.uuid=$end MERGE (s)-[r:${type}]->(e) ON CREATE SET r+=$props`, true);
  }
}

class UpdateRelation<T extends SomeRelation> extends NeoQuery<undefined, {uuid: string, props: T}> {
  constructor(type: string) {
    super(`MATCH ()-[r:${type}]-() WHERE r.uuid=$uuid SET r+=$props`, true);
  }
}

class DeleteRelation extends NeoQuery<undefined, {uuid: string}> {
  constructor() {
    super("MATCH ()-[r]-() WHERE r.uuid=$uuid DELETE r", true);
  }
}


export namespace Queries {
  // expose queries as singletons
  export const getCurricula = new GetCurricula();
  export const getCurriculumNodes = new GetCurriculumNodes();
  export const getCurriculumRelations = new GetCurriculumRelations();

  export const getConnectedNodes = new GetConnectedNodes();
  export const getConnectedRelations = new GetConnectedRelations();

  export const createProgram = new CreateNode<Program>("Program");
  export const createDegree = new CreateNode<Degree>("Degree");
  export const createUnit = new CreateNode<Unit>("Unit");
  export const createResult = new CreateNode<Result>("Result");

  export const createConnectedUnit = new CreateConnectedUnit();

  export const updateProgram = new UpdateNode<Program>("Program");
  export const updateDegree = new UpdateNode<Degree>("Degree");
  export const updateUnit = new UpdateNode<Unit>("Unit");
  export const updateResult = new UpdateNode<Result>("Result");

  export const deleteNode = new DeleteNode();

  export const createYields = new CreateRelation<Yields>("Yields");
  export const createConsistsOf = new CreateRelation<ConsistsOf>("ConsistsOf");
  export const createUsedIn = new CreateRelation<UsedIn>("UsedIn");

  export const updateYields = new UpdateRelation<Yields>("Yields");
  export const updateConsistsOf = new UpdateRelation<ConsistsOf>("ConsistsOf");
  export const updateUsedIn = new UpdateRelation<UsedIn>("UsedIn");

  export const deleteRelation = new DeleteRelation();
}
