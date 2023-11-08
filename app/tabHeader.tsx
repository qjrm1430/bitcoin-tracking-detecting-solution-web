"use client";
import { PlusIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { memo, useEffect, useState } from "react";
import { useGraphData } from "./GraphDataContext";
import { useNetwork } from "./NetworkDataContext";
import axios from "axios";

export default memo(function TabHeader({
  tabList,
  setTabList,
  onChangeCookie,
}: any) {
  //const [activeNum, setActiveNum] = useState(0);
  const { network } = useNetwork();
  const { graphDataState, setGraphDataState, removeTabData } = useGraphData();
  const { activeTab } = graphDataState;
  const [isModalOpen, setModalOpen] = useState(false); // 모달의 상태를 관리
  const [inputValue, setInputValue] = useState("");

  function handleTabChange(tabId: any) {
    network.storePositions();
    onChangeCookie("tabId", tabId);
    setGraphDataState((prev) => ({
      ...prev,
      activeTab: tabId,
    }));
  }
  function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ");
  }
  async function handleUpdateTabName() {
    const result = await axios.patch(`/tab/${activeTab}`, {
      name: inputValue,
    });
    setTabList(result.data.tab);
    setModalOpen(false);
  }

  async function deleteTab(tabId: string) {
    let tabIdx = tabList.findIndex(
      (tab: { _id: string; name: string }) => tab._id === tabId,
    );
    await axios.delete("/graph/api");
    const result = await axios.delete(`/tab/${tabId}`);
    setTabList(result.data.tab);
    removeTabData();
    if (tabIdx >= result.data.tab.length) {
      tabIdx = result.data.tab.length - 1;
    }
    if (tabIdx < 0) {
      return;
    }
    handleTabChange(result.data.tab[tabIdx]._id);
  }

  async function newTab() {
    let idx = 1;
    let newTabName = "Tab ";
    while (tabList.some((obj: any) => obj.name === newTabName + idx)) {
      idx++;
    }
    newTabName = newTabName + idx;

    const result = await axios.put(`/tab`, { name: newTabName });
    setTabList(result.data.tab);
    handleTabChange(result.data.tab[result.data.tab.length - 1]._id);
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (isModalOpen && event.target === event.currentTarget) {
        setModalOpen(false);
      }
    }
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [isModalOpen]);

  if (!tabList) return;
  return (
    <div>
      <div className="sm:hidden">
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={activeTab}
        >
          {tabList.map((tab: any) => (
            <option key={tab._id} value={tab._id}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabList.map((tab: any) => (
            <div
              key={tab._id}
              className={classNames(
                tab._id === activeTab
                  ? "bg-gray-300 text-gray-900 font-extrabold"
                  : "text-gray-500 hover:bg-gray-200 hover:text-gray-700",
                "rounded-md px-3 py-2 text-sm font-medium items-center flex",
              )}
              {...(tab._id === activeTab ? { "aria-current": "page" } : {})}
            >
              <button onClick={() => handleTabChange(tab._id)}>
                {tab.name}
              </button>
              <button
                onClick={() => {
                  setModalOpen(true);
                }} // 모달을 열기 위한 함수
                className={classNames(
                  tab._id === activeTab
                    ? "pl-1 hover:text-green-800"
                    : "hidden",
                )}
              >
                <PencilSquareIcon className="h-3 w-3 " />
              </button>
              <button
                onClick={() => deleteTab(tab._id)}
                className={classNames(
                  tab._id === activeTab ? "pl-3 hover:text-red-800" : "hidden",
                )}
              >
                <XMarkIcon
                  className="h-5 w-5 hover:text-red-800"
                  aria-hidden="true"
                />
              </button>
            </div>
          ))}
          <button
            onClick={newTab}
            className={classNames(
              "text-gray-500 hover:text-gray-700",
              "rounded-md px-3 py-2 text-sm font-medium",
            )}
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
      {isModalOpen && ( // 모달의 상태에 따라 모달을 표시 또는 숨김
        <div
          className="z-30 fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50"
          onMouseDown={(e) => {
            e.target === e.currentTarget ? setModalOpen(false) : null;
          }}
        >
          <div
            className="bg-white rounded-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                탭 이름 바꾸기
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>원하는 이름으로 변경해보세요.</p>
              </div>
              <div className="mt-5 sm:flex sm:items-center">
                <div className="w-full sm:max-w-xs">
                  <input
                    type="text"
                    name="tabname"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="최대 8글자"
                    maxLength={8}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleUpdateTabName}
                  className="whitespace-nowrap mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
                >
                  변경하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
