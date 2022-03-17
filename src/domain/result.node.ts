import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Graph } from "../neo4j/graph.model";

export class Result extends Graph.Node {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsOptional()
  public description?: string;
}

export class PartialResult extends PartialType(Result) {}
