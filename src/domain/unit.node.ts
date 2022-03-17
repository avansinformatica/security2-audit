import { PartialType } from "@nestjs/mapped-types";
import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min } from "class-validator";
import { Graph } from "../neo4j/graph.model";

export class Unit extends Graph.Node {
    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsNumber()
    // @IsPositive()
    public ec: number;

    @IsInt()
    @Min(1)
    @Max(4)
    public year: number;

    @IsInt()
    @Min(1)
    @Max(4)
    public period: number;
}

export class PartialUnit extends PartialType(Unit) {}
