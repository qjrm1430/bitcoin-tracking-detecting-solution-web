"use client";
import axios from "axios";
import { useState, useEffect, memo } from "react";

import "react-datepicker/dist/react-datepicker.css";
import SideWallet from "./sideWallet";
import SideTransaction from "./sideTransaction";
// import { graph } from "neo4j-driver";

export default memo(function SideBar({
  clickNode,
}: {
  clickNode: number | null;
}) {
  const [nodeData, setNodeData] = useState<any>(null);
  const [edgeData, setEdgeData] = useState<any>(null);

  useEffect(() => {
    if (clickNode === null) return;
    const fetchData = async () => {
      try {
        // GET 요청의 URL
        const getResponse = (await axios.get(`/graph/api/${clickNode}`)).data;
        setNodeData(getResponse._fields[0]);
        if (getResponse._fields[1]) setEdgeData(getResponse._fields[1]);
        else setEdgeData(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        // router.push(`/error400`);
      }
    };
    fetchData();
  }, [clickNode]);
  if (nodeData && nodeData.labels.includes("Wallet")) {
    return (
      <SideWallet
        className="overflow-y-auto"
        nodeData={nodeData}
        edgeData={edgeData}
      ></SideWallet>
    );
  } else if (nodeData && nodeData.labels.includes("Transaction")) {
    return (
      <SideTransaction
        className="overflow-y-auto"
        nodeData={nodeData}
      ></SideTransaction>
    );
  } else {
    return null;
  }
});
