"use client";
import GraphVisualizer from "@/app/graphVisualizer";
import TabHeader from "./tabHeader";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { GraphDataProvider } from "./GraphDataContext";
import { NetworkProvider } from "./NetworkDataContext";
import axios from "axios";

export default function Home() {
  const [cookie, setCookie] = useCookies(["uid", "tabId"]);
  const [tabs, setTabs] = useState<{ _id: string; name: string }[] | null>(
    null,
  );
  useEffect(() => {
    const fetchData = async () => {
      const userData = await axios("/user/api/admin");
      setTabs(userData.data.tab);
      if (!cookie.tabId || !cookie.uid) {
        setCookie("uid", "admin");
        setCookie("tabId", userData.data.tab[0]._id);
      }
    };
    fetchData();
  }, []);

  if (!tabs) return;
  return (
    <GraphDataProvider>
      <NetworkProvider>
        <div className="mx-auto h-full w-full max-w-full flex-grow flex relative">
          <div className="min-w-0 flex-1 bg-white flex overflow-hidden">
            <div className="bg-gray-50 min-w-0 flex-1 overflow-hidden">
              <div className="grid grid-flow-col border-b border-t pl-6 border-gray-200 pb-4 pr-6 pt-4">
                <div className="flex items-center">
                  <TabHeader
                    tabList={tabs}
                    setTabList={setTabs}
                    onChangeCookie={setCookie}
                  />
                </div>
              </div>
              <div className="bg-gray-100 flex-1 relative">
                <GraphVisualizer />
              </div>
            </div>
          </div>
        </div>
      </NetworkProvider>
    </GraphDataProvider>
  );
}
