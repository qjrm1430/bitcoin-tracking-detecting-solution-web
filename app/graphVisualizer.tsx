"use client";
import React, { memo, useEffect, useRef, useState } from "react";
import { Network, Node, Edge } from "vis-network/peer/esm/vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data";
import axios from "axios";
import { useGraphData } from "./GraphDataContext";
import { useNetwork } from "./NetworkDataContext";
import Sidebar from "./sideBar";
import { ScaleLoader } from "react-spinners";

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

const NETWORK_OPTIONS = {
  nodes: {
    fixed: {
      x: false,
      y: false,
    },
  },
  edges: {
    arrowStrikethrough: true,
    smooth: false,
    length: 300,
    font: {
      align: "top",
    },
    arrows: {
      to: {
        enabled: true,
        scaleFactor: 1,
        type: "arrow",
      },
    },
    color: {
      inherit: "from",
    },
  },
  interaction: { hover: true, zoomSpeed: 0.5 },
  physics: {
    enabled: true,
    solver: "barnesHut",
    barnesHut: {
      gravitationalConstant: -3000,
      springLength: 95,
      springConstant: 0.04,
      avoidOverlap: 1,
      damping: 0.3,
      centralGravity: 0,
    },

    stabilization: {
      enabled: true,
      iterations: 2000,
      updateInterval: 50,
    },
  },
  layout: {
    improvedLayout: false,
    hierarchical: {
      enabled: false,
      levelSeparation: 150,
      nodeSpacing: 100,
      treeSpacing: 200,
      blockShifting: true,
      edgeMinimization: true,
      parentCentralization: true,
      direction: "LR",
      sortMethod: "directed",
      shakeTowards: "leaves",
    },
  },
};

export default memo(function GraphVisualizer() {
  //const selectedNodeId: number | null = setSelectedNodeId;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { setNetwork } = useNetwork();
  const { graphDataState, setGraphDataState } = useGraphData();
  const { activeTab: currentTab, tabGraphData: graphData } = graphDataState;
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedNodeId(null);
    async function fetchData() {
      let nodes: any;
      let edges: any;
      if (graphData[currentTab]) {
        nodes = graphData[currentTab].nodes || new DataSet();
        edges = graphData[currentTab].edges || new DataSet();
      } else {
        nodes = new DataSet();
        edges = new DataSet();
        try {
          const response = await axios("/graph/api");
          if (response.data.length) {
            response.data.forEach((item: any) => {
              const node = item._fields[0];
              const selectOption = (node: any): string => {
                if (node.labels.includes("Transaction")) {
                  return node.properties.is_CoinJoin
                    ? "CoinJoin"
                    : "Transaction";
                } else if (node.labels.includes("Wallet")) {
                  return node.properties.n_tx > 500000 ? "VASP" : "Wallet";
                } else {
                  return "default";
                }
              };
              const { color, shape } = NODE_CONFIG[selectOption(node)];

              if (!nodes.get(node.identity.low)) {
                nodes.add({
                  id: node.identity.low,
                  label: node.properties.hash,
                  color,
                  shape,
                } as Node);
              }
              if (item._fields[1]) {
                item._fields[1].forEach((edge: any) => {
                  const color =
                    EDGE_CONFIG[edge.type as keyof typeof EDGE_CONFIG] ||
                    EDGE_CONFIG["default"];

                  if (!edges.get(edge.identity.low)) {
                    edges.add({
                      id: edge.identity.low,
                      from: edge.start.low,
                      to: edge.end.low,
                      label: edge.properties.value / 100000000 + " BTC",
                      color,
                    } as Edge);
                  }
                });
              }
              setGraphDataState((prevData: any) => ({
                ...prevData,
                tabGraphData: {
                  ...prevData.tabGraphData,
                  [currentTab]: {
                    nodes,
                    edges,
                  },
                },
              }));
            });
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error(err);
        }
      }

      if (containerRef.current) {
        try {
          const network = new Network(
            containerRef.current,
            graphData[currentTab],
            NETWORK_OPTIONS,
          );
          setNetwork(network);

          network.on("click", (params: any) => {
            if (params.nodes.length > 0) {
              const clickNode: any = nodes.get(params.nodes[0]);
              setSelectedNodeId(clickNode.id);
            }
          });
          network.on("stabilizationProgress", function (params) {
            if (!loading) setLoading(true);
          });
          network.on("stabilizationIterationsDone", function () {
            setLoading(false);
          });

          let MIN_ZOOM = 0.1;
          let MAX_ZOOM = 2.0;
          let lastZoomPosition = { x: 0, y: 0 };
          network.on("zoom", function (params) {
            let scale = network.getScale();
            if (scale <= MIN_ZOOM) {
              network.moveTo({
                position: lastZoomPosition,
                scale: MIN_ZOOM,
              });
            } else if (scale >= MAX_ZOOM) {
              network.moveTo({
                position: lastZoomPosition,
                scale: MAX_ZOOM,
              });
            } else {
              lastZoomPosition = network.getViewPosition();
            }
          });
          network.on("dragEnd", function (params) {
            lastZoomPosition = network.getViewPosition();
          });
          network.on("deselectNode", (params: any) => {
            setSelectedNodeId(null);
          });
        } catch (error) {
          console.error(error);
          //console.error("network create error!");
          return;
        }
      } else {
        console.error("ref is not found");
      }
    }
    fetchData();
  }, [graphDataState.activeTab, graphDataState.tabGraphData]);
  return (
    <div>
      <div
        className={`scrollbar-hide z-10 h-screen overflow-y-auto absolute right-0 w-fit ${
          selectedNodeId != null ? "inline-block" : "hidden"
        }`}
      >
        <Sidebar clickNode={selectedNodeId} />
      </div>
      <div className="h-screen overflow-hidden relative">
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-white bg-opacity-80">
            <ScaleLoader
              className="block"
              color={"#3498db"}
              loading={loading}
            />
          </div>
        )}
        <div ref={containerRef} className="h-screen overflow-hidden"></div>
      </div>
    </div>
  );
});
