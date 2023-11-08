import { NextResponse } from "next/server";
import neo4jConnect from "@/utils/neo4jConnect";
import { cookies } from "next/headers";
import axios from "axios";
import { makeTxParam, makeWalletParam } from "../lib/makeParam";

interface RelationshipParams {
  type: string;
  value: number;
  timestamp: number;
  spending_outpoints?: string;
}

// 개별 노드 정보 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  let driver;
  try {
    driver = await neo4jConnect();
    const { records } = await driver.executeQuery(
      `
      MATCH (n) WHERE ID(n) = $id
      OPTIONAL MATCH ()-[r]->(n:Wallet)
      WITH n, COLLECT(r) AS relaytionships
      RETURN n,
      CASE
          WHEN SIZE(relaytionships) = 0 THEN null
          ELSE relaytionships
      END AS relaytionship;
      `,
      { id: parseInt(params.id) },
      { database: "neo4j" },
    );
    return NextResponse.json(records[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err }, { status: 404 });
  } finally {
    if (driver) driver.close();
  }
}

// 그래프 추가
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const cookieStore = cookies();
  const uid = cookieStore.get("uid");
  const tabId = cookieStore.get("tabId");
  const data = await request.json();

  if (!process.env.CORE_SERVER) {
    return NextResponse.json(
      { error: "env파일에 CORE_SERVER 정보가 없습니다. " },
      { status: 500 },
    );
  }
  if (!uid || !tabId) {
    return NextResponse.json({ error: "cookie error" }, { status: 400 });
  }
  let driver;
  let response;
  let nodeParams: any;
  let relationParams: RelationshipParams;
  let query: any;
  const coreServer = process.env.CORE_SERVER;
  try {
    if (data.type === "Transaction") {
      response = await axios.get(`${coreServer}/info/txid?hash=${data.hash}`);
      nodeParams = makeTxParam(response.data);
      relationParams = {
        type: data.relationship.type,
        value: data.relationship.value,
        timestamp: data.relationship.timestamp,
        spending_outpoints: data.relationship.spending_outpoints,
      };
    } else if (data.type === "Wallet") {
      response = await axios.get(`${coreServer}/info/addr?hash=${data.hash}`);
      nodeParams = makeWalletParam(response.data);
      relationParams = {
        type: data.relationship.type,
        value: data.relationship.value,
        timestamp: data.relationship.timestamp,
        spending_outpoints: data.relationship.spending_outpoints,
      };
    } else {
      return NextResponse.json(
        { error: "Data type undefined" },
        { status: 400 },
      );
    }
    if (
      (data.type === "Transaction" && data.relationship.type === "Input") ||
      (data.type === "Wallet" && data.relationship.type === "Output")
    ) {
      query = `
      MATCH (n) WHERE ID(n) = $prevId
      MERGE (t:${uid.value}:id_${tabId.value}:${data.type}{hash: $nodeParams.hash})
      CREATE (n)-[r:${relationParams.type}]->(t)
      SET t += $nodeParams, r += $relationParams 
      RETURN t, r;
    `;
    } else if (
      (data.type === "Transaction" && data.relationship.type === "Output") ||
      (data.type === "Wallet" && data.relationship.type === "Input")
    ) {
      query = `
      MATCH (n) WHERE ID(n) = $prevId
      MERGE (t:${uid.value}:id_${tabId.value}:${data.type}{hash: $nodeParams.hash})
      CREATE (t)-[r:${relationParams.type}]->(n)
      SET t += $nodeParams, r += $relationParams 
      RETURN t, r;
    `;
    } else {
      return NextResponse.json(
        { error: "Node or Edge type undefined" },
        { status: 400 },
      );
    }
    driver = await neo4jConnect();
    const { records } = await driver.executeQuery(
      query,
      { prevId: parseInt(params.id), nodeParams, relationParams },
      { database: "neo4j" },
    );
    return NextResponse.json(records[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err }, { status: 500 });
  } finally {
    if (driver) driver.close();
  }
}

//노드 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const cookieStore = cookies();
  const uid = cookieStore.get("uid");
  const tabId = cookieStore.get("tabId");
  if (!uid || !tabId) {
    return NextResponse.json({ error: "cookie error" }, { status: 400 });
  }
  let driver;
  try {
    driver = await neo4jConnect();
    const { records } = await driver.executeQuery(
      `
      MATCH (n:${uid.value}:id_${tabId.value}{hash: $hash})
      OPTIONAL MATCH (n)-[r]-()
      DELETE r, n
      WITH n, COLLECT(r) AS relaytionships
      return n, relaytionships
    `,
      { hash: params.id },
      { database: "neo4j" },
    );
    return NextResponse.json(records[0], { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err }, { status: 500 });
  } finally {
    if (driver) driver.close();
  }
}
