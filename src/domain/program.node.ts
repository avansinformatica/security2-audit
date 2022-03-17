import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString } from "class-validator";
import { Graph } from "../neo4j/graph.model";

export class Program extends Graph.Node {
    @IsString()
    @IsNotEmpty()
    public code: string;

    @IsString()
    @IsNotEmpty()
    public name: string;
}

export class PartialProgram extends PartialType(Program) {}
