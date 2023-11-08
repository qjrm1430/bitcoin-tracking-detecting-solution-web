import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import neo4jConnect from "@/utils/neo4jConnect";
import { makeTxParam, makeWalletParam } from "./lib/makeParam";

// 전체 그래프 데이터 조회
export async function GET(request: Request) {
  //UID, tabIdumber, hash, transaction|wallet, 객체 정보
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
      MATCH (n:${uid.value}:id_${tabId.value})
      OPTIONAL MATCH (n)-[r]->()
      WITH n, COLLECT(r) AS relationship
      RETURN n, relationship;
    `,
      {},
      { database: "neo4j" },
    );
    return NextResponse.json(records);
  } catch (err: any) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  } finally {
    if (driver) driver.close();
  }
}

// 신규 생성
export async function POST(request: Request) {
  //UID, tabIdumber, hash, transaction|wallet, 객체 정보
  const data = await request.json();
  const cookieStore = cookies();
  const uid = cookieStore.get("uid");
  const tabId = cookieStore.get("tabId");
  if (!uid || !tabId) {
    return NextResponse.json({ error: "cookie error" }, { status: 400 });
  }
  let driver;
  try {
    driver = await neo4jConnect();
    let params;
    if (data.type === "Transaction") {
      params = makeTxParam(data);
    } else if (data.type === "Wallet") {
      params = makeWalletParam(data);
    } else {
      throw new Error("Data type undefined");
    }
    const { records } = await driver.executeQuery(
      `
      MERGE (n:${uid.value}:id_${tabId.value}:${data.type}{hash: $params.hash})
      SET n += $params
      RETURN n;`,
      { params },
      { database: "neo4j" },
    );
    return NextResponse.json(records, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: `${err}` }, { status: 400 });
  } finally {
    if (driver) driver.close();
  }
}

export async function DELETE(request: Request) {
  let driver;
  const cookieStore = cookies();
  const uid = cookieStore.get("uid");
  const tabId = cookieStore.get("tabId");
  if (!uid || !tabId) {
    return NextResponse.json({ error: "cookie error" }, { status: 400 });
  }
  try {
    driver = await neo4jConnect();
    await driver.executeQuery(
      `
      MATCH(n:${uid.value}:id_${tabId.value})
      OPTIONAL MATCH (n)-[r]-()
      DELETE n, r`,
      { database: "neo4j" },
    );
    return NextResponse.json({ status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err }, { status: 500 });
  } finally {
    if (driver) driver.close();
  }
}
