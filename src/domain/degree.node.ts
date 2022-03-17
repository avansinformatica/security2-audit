import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString } from "class-validator";
import { Graph } from "../neo4j/graph.model";

export class Degree extends Graph.Node {
  @IsString()
  @IsNotEmpty()
  public name: string;
}

export class PartialDegree extends PartialType(Degree) {}
