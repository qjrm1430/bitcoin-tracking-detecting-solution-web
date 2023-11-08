import React, { createContext, useContext, useState, ReactNode } from "react";
import { useCookies } from "react-cookie";

interface GraphDataState {
  activeTab: string;
  tabGraphData: {
    [key: string]: { nodes: any; edges: any };
  };
}

const GraphDataContext = createContext<
  | {
      graphDataState: GraphDataState;
      setGraphDataState: React.Dispatch<React.SetStateAction<GraphDataState>>;
      removeTabData: () => void;
    }
  | undefined
>(undefined);

export const GraphDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cookie] = useCookies(["tabId"]);
  const [graphDataState, setGraphDataState] = useState<GraphDataState>({
    activeTab: cookie.tabId,
    tabGraphData: {},
  });

  const removeTabData = () => {
    setGraphDataState((prevState: any) => {
      const { [prevState.activeTab]: _, ...newTabGraphData } =
        prevState.tabGraphData;
      return {
        ...prevState,
        tabGraphData: newTabGraphData,
      };
    });
  };

  return (
    <GraphDataContext.Provider
      value={{ graphDataState, setGraphDataState, removeTabData }}
    >
      {children}
    </GraphDataContext.Provider>
  );
};

export const useGraphData = () => {
  const context = useContext(GraphDataContext);
  if (!context) {
    throw new Error("useGraphData must be used within a GraphDataProvider");
  }
  return context;
};
