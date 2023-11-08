import axios from "axios";

const RPC_URI = process.env.RPC_URI;
const RPC_USERNAME = process.env.RPC_USERNAME;
const RPC_PASSWORD = process.env.RPC_PASSWORD;

if (!RPC_URI) {
  throw "Please define the BITCOINCORE_URI environment variable inside .env.local";
}
if (!RPC_USERNAME) {
  throw "Please define the RPC_USERNAME environment variable inside .env.local";
}
if (!RPC_PASSWORD) {
  throw "Please define the RPC_PASSOWRD environment variable inside .env.local";
}
async function getRawTransaction(txid: string) {
  try {
    const response = await axios({
      url: RPC_URI!,
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      auth: {
        username: RPC_USERNAME!,
        password: RPC_PASSWORD!,
      },
      data: {
        jsonrpc: "1.0",
        id: "getrawtransaction",
        method: "getrawtransaction",
        params: [txid, true],
      },
    });
    response.data.result.vout = response.data.result.vout.map((vout: any) => {
      vout.value = vout.value * 10 ** 8;
      return vout;
    });
    return response.data.result;
  } catch (error) {
    throw error;
  }
}

async function getBlock(blockHash: string) {
  try {
    const response = await axios({
      url: RPC_URI!,
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      auth: {
        username: RPC_USERNAME!,
        password: RPC_PASSWORD!,
      },
      data: {
        jsonrpc: "1.0",
        id: "getblock",
        method: "getblock",
        params: [blockHash, 1],
      },
    });
    return response.data.result;
  } catch (error) {
    throw error;
  }
}

async function getTxOut(txid: string, vout: number) {
  try {
    const response = await axios({
      url: RPC_URI!,
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      auth: {
        username: RPC_USERNAME!,
        password: RPC_PASSWORD!,
      },
      data: {
        jsonrpc: "1.0",
        id: "gettxout",
        method: "gettxout",
        params: [txid, vout],
      },
    });
    return response.data.result;
  } catch (error) {
    throw error;
  }
}

export { getRawTransaction, getBlock, getTxOut };
