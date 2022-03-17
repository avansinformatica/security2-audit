import neo4j, { Driver } from "neo4j-driver";
import { Neo4jConfig } from "./neo4j.config";

export const createDriver = async (config: Neo4jConfig) => {
    let url;
    if (config.port && config.port != "") {
        url = `${config.scheme}://${config.host}:${config.port}`;
    } else {
        url = `${config.scheme}://${config.host}`;
    }
    const driver: Driver = neo4j.driver(
        url,
        neo4j.auth.basic(config.username, config.password),
        { disableLosslessIntegers: true }
    );

    // switch this back on when actually connection to a database
    // await driver.verifyConnectivity()
    
    return driver
}
