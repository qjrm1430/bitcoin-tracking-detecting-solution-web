import axios from "axios";
import { Node, Edge } from "vis-network/peer/esm/vis-network";

const NODE_CONFIG: {
  [key: string]: { color: string; shape: string };
} = {
  Transaction: { color: "#58FAAC", shape: "square" },
  CoinJoin: { color: "#FF7800", shape: "square" },
  Wallet: { color: "#81BEF7", shape: "dot" },
  VASP: { color: "#A0A0FF", shape: "dot" },
  default: { color: "", shape: "" },
};

const EDGE_CONFIG = {
  Input: "green",
  Output: "red",
  default: "",
};
interface BodyData {
  type: "Wallet" | "Transaction";
  hash: string;
  relationship: {
    type: "Input" | "Output";
    value: number;
    timestamp: number;
    spending_outpoints?: string[];
  };
}

export async function appendNode(
  graphData: { nodes: any; edges: any },
  prevNode: any,
  nodeData: any,
  relayType: "Input" | "Output",
): Promise<any> {
  let id = prevNode.identity.low;
  let type: "Wallet" | "Transaction" = prevNode.labels.includes("Wallet")
    ? "Transaction"
    : "Wallet";
  const bodyData: BodyData = {
    type,
    hash: "",
    relationship: {
      type: relayType,
      value: 0,
      timestamp: 0,
      spending_outpoints: undefined,
    },
  };

  if (type === "Wallet" && relayType === "Input") {
    bodyData.hash = nodeData.addr;
    bodyData.relationship.value = nodeData.value;
    bodyData.relationship.timestamp = prevNode.properties.time;
  } else if (type === "Wallet" && relayType === "Output") {
    bodyData.hash = nodeData.addr;
    bodyData.relationship.value = nodeData.value;
    bodyData.relationship.timestamp = prevNode.properties.time;
    bodyData.relationship.spending_outpoints = nodeData.outpoints;
  } else if (type === "Transaction" && relayType === "Input") {
    bodyData.hash = nodeData.txid;
    bodyData.relationship.value = Math.abs(nodeData.value);
    bodyData.relationship.timestamp = nodeData.timestamp;
  } else if (type === "Transaction" && relayType === "Output") {
    bodyData.hash = nodeData.txid;
    bodyData.relationship.value = nodeData.value;
    bodyData.relationship.timestamp = nodeData.timestamp;
    if (nodeData.spending_outpoints.length != 0) {
      const { txid, value } = nodeData.spending_outpoints;
      console.log(nodeData.spending_outpoints);
      const outTxData = await axios(`/cpp/info/txid?hash=${txid}`);
      const outpoints = [`${txid}$${outTxData.data.time}$${value}`];
      bodyData.relationship.spending_outpoints = outpoints;
    } else {
      bodyData.relationship.spending_outpoints = [];
    }
  }

  try {
    const result = await axios.put(`/graph/api/${id}`, bodyData);
    const node = result.data._fields[0];
    const edge = result.data._fields[1];
    const selectOption = (node: any): string => {
      if (node.labels.includes("Transaction")) {
        return node.properties.is_CoinJoin ? "CoinJoin" : "Transaction";
      } else if (node.labels.includes("Wallet")) {
        return node.properties.n_tx > 500000 ? "VASP" : "Wallet";
      } else {
        return "default";
      }
    };
    const { color: nodeColor, shape: nodeShape } =
      NODE_CONFIG[selectOption(node)];
    const edgeColor =
      EDGE_CONFIG[edge.type as keyof typeof EDGE_CONFIG] ||
      EDGE_CONFIG["default"];
    try {
      graphData.nodes.add({
        id: node.identity.low,
        label: node.properties.hash,
        color: nodeColor,
        shape: nodeShape,
      } as Node);
    } catch {}

    try {
      graphData.edges.add({
        id: edge.identity.low,
        from: edge.start.low,
        to: edge.end.low,
        label: edge.properties.value / 100000000 + " BTC",
        color: edgeColor,
      } as Edge);
    } catch {}
    return result.data;
  } catch {
    return false;
  }
}
export async function deleteNode(
  graphData: { nodes: any; edges: any },
  hash: string,
) {
  try {
    const result = await axios.delete(`/graph/api/${hash}`);
    const node = result.data._fields[0];
    const edge = result.data._fields[1];

    graphData.nodes.remove(node.identity.low);
    edge.forEach((item: any) => {
      graphData.nodes.remove(item.identity.low);
    });
  } catch (error) {
    console.error("Deleting Node Failed : ", error);
  }
}

export function unixToFormattedDate(timestamp: number) {
  const dates = new Date(timestamp * 1000);
  return dates.toLocaleDateString("ko-KR");
}

export async function autoTrack(gData: any, nodeData: any, depth: number) {
  depth++;
  if (nodeData.properties.true_recipient.length === 0) return;
  if (depth >= 4) return;

  const tRecipients = nodeData.properties.true_recipient;
  const wallets = new Map<string, { value: number; outpoints: string[] }>();
  const Outputs: { addr: string; value: number; outpoints: string[] }[] = [];

  function addValue(key: string, value: number, outpoints?: string) {
    if (wallets.has(key)) {
      const wallet = wallets.get(key)!;
      wallet.value += value;
      if (outpoints) wallet.outpoints.push(outpoints);
    } else {
      wallets.set(key, { value, outpoints: outpoints ? [outpoints] : [] });
    }
  }

  nodeData.properties.inputs.forEach((input: string) => {
    const addr = input.split(":")[1];
    const value = parseInt(input.split(":")[2]);
    addValue(addr, value);
  });

  nodeData.properties.outputs.forEach((output: string) => {
    const splitOutput = output.split(":");
    const addr = splitOutput[0];
    const value = -parseInt(splitOutput[1]);
    if (splitOutput[2] === "true") {
      addValue(addr, value, `${splitOutput[3]}$${splitOutput[1]}`);
    } else addValue(addr, value);
  });

  wallets.forEach((data, key) => {
    if (data.value < 0) {
      Outputs.push({
        addr: key,
        value: Math.abs(data.value),
        outpoints: data.outpoints,
      });
    }
  });

  const walletOutputs = Outputs.filter((output) =>
    tRecipients.includes(output.addr),
  );

  for (const walletOutput of walletOutputs) {
    const fResult = await appendNode(gData, nodeData, walletOutput, "Output");
    if (fResult && fResult._fields[0].properties.n_tx <= 500000) {
      const preNode = fResult._fields[0];
      const edgeData = fResult._fields[1];
      if (edgeData && edgeData.properties.spending_outpoints.length != 0) {
        for (const outpoint of edgeData.properties.spending_outpoints) {
          const [txid, timestamp, value] = outpoint.split("$");
          const tx = { txid, value, timestamp };
          const sResult = await appendNode(gData, preNode, tx, "Input");
          return autoTrack(gData, sResult._fields[0], depth);
        }
      }
    }
  }
}
