import { Inject, Injectable } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';
import { NeoQuery } from './neo4j.queries';
import { Neo4jConfig, NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.config';

function mapRecords(key) {
    return function(record) {
        const unpacked = record.get(key);
        return {
            id: unpacked.identity,
            ...(unpacked.start || unpacked.start === 0 ? {start: unpacked.start} : {}), // conditional property
            ...(unpacked.end || unpacked.end === 0 ? {end: unpacked.end} : {}), // conditional property
            kind: unpacked.type ? unpacked.type : unpacked.labels[0], // rename type and label as kind, assumes one label on nodes
            ...unpacked.properties,
        } as unknown; // the type needs to be erased for the type checker to accept the cast
    }
}

@Injectable()
export class Neo4jService {

    constructor(@Inject(NEO4J_CONFIG) private readonly config: Neo4jConfig, @Inject(NEO4J_DRIVER) private readonly driver: Driver) { }

    private getSession(writeAccess: boolean) {
      return this.driver.session({
          database: this.config.database,
          defaultAccessMode: writeAccess ? neo4j.session.WRITE : neo4j.session.READ,
      });
    }
    
    async execute<R,P>(query: NeoQuery<R,P>, params: P): Promise<R[]> {
        // const session = this.getSession(query.writeAccess);
        // const neo_results = await session.run(query.cypher, params);
        
        // if (neo_results.records.length > 0) {
        //     // this assumes a cypher query with a return with one column
        //     const key = neo_results.records[0].keys[0]; 
        //     return neo_results.records.map(mapRecords(key)) as R[];
        // } else {
        //     return [];
        // }

        // the code above actually executes a query, but requires a database connection
        // you can switch it back on if you have neo4j instance connected
        return [];
    }
}
