import React, { createContext, useContext, useState, ReactNode } from "react";

type NetworkType = {
  network: any;
  setNetwork: React.Dispatch<React.SetStateAction<any>>;
};

const NetworkContext = createContext<NetworkType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [network, setNetwork] = useState<any>(null);

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};
