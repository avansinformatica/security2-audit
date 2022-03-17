export type Neo4jScheme = 'neo4j' | 'neo4j+s' | 'neo4j+ssc' | 'bolt' | 'bolt+s' | 'bolt+ssc';

export const NEO4J_CONFIG: string = 'NEO4J_CONFIG'

export const NEO4J_DRIVER: string = 'NEO4J_DRIVER'

export interface Neo4jConfig {
    scheme: Neo4jScheme;
    host: string;
    port: number | string;
    username: string;
    password: string;
    database?: string;
}
