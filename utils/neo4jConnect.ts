import * as neo4j from "neo4j-driver";

const URI = process.env.NEO4J_URI;
const UNAME = process.env.NEO4J_USERNAME;
const PWD = process.env.NEO4J_PASSWORD;

async function neo4jConnect() {
  let driver;
  if (!URI || !UNAME || !PWD) {
    throw new Error("Error! Check the Global Env details");
  }
  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(UNAME, PWD));
    return driver;
  } catch (err: any) {
    if (driver) await driver.close();
    throw new Error(`Connection err\n${err}\nCuase: ${err.cause}`);
  }
}

export default neo4jConnect;
