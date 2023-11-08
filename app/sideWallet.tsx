"use client";
import Link from "next/link";
import axios from "axios";
import { useState, useEffect } from "react";
import BitcoinInfo from "@/types/bitcoin_info";
import DatePicker from "react-datepicker";
import { MinusIcon } from "@heroicons/react/20/solid";

import "react-datepicker/dist/react-datepicker.css";
import {
  deleteNode,
  appendNode,
  unixToFormattedDate,
} from "@/app/lib/visHandler";
import { useGraphData } from "./GraphDataContext";

interface CheckBox {
  [key: string]: boolean;
}

export default function SideWallet({ nodeData, edgeData }: any) {
  const { graphDataState } = useGraphData();
  const { activeTab: currentTab, tabGraphData: graphData } = graphDataState;
  const [TxData, setTxData] = useState<BitcoinInfo.Txs | null>(null);

  const [isCheckbox, setIsCheckbox] = useState<CheckBox>({});

  const [isOutpointAllChecked, setIsOutpointAllChecked] = useState(false);
  const [outpointCheckbox, setOutpointCheckbox] = useState<Map<string, any>>(
    new Map(),
  );
  const [outpointChecked, setOutpointChecked] = useState<Set<string>>(
    new Set(),
  );

  const [isTxsAllChecked, setIsTxsAllChecked] = useState(false);
  const [txsCheckbox, setTxsCheckbox] = useState<Map<string, any>>(new Map());
  const [txsChecked, setTxsChecked] = useState<Set<string>>(new Set());

  // const [startDate, setStartDate] = useState<Date>(
  //   new Date(Date.now() - 31536000000),
  // );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now()));
  const [date, setDate] = useState<{
    startDate: number;
    endDate: number;
  } | null>(null);
  const onChange = (dates: any) => {
    const [start, end] = dates;
    const newEndDate = new Date(end?.getTime()); // copy date object to avoid mutation
    newEndDate?.setHours(23, 59, 59);
    setStartDate(start);
    setEndDate(end);
  };
  const maxDate = new Date();
  const minDate = new Date(2008, 8, 18); // 2008년 8월 18일

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 페이지당 출력할 아이템 개수
  const totalPages = Math.ceil((TxData?.n_tx || 0) / itemsPerPage);

  const handlePageClick = (page: number) => setCurrentPage(page);

  //outpoint 전체 체크박스 클릭 시 호출
  async function handleAllOutpointChange() {
    const nowOutpointChecked = new Set(outpointChecked);
    const nowTxsChecked = new Set(txsChecked);
    if (isOutpointAllChecked) {
      for (const [txid] of outpointCheckbox) {
        if (isCheckbox[txid]) {
          await handleOutpointChange(
            outpointCheckbox.get(txid),
            nowOutpointChecked,
            nowTxsChecked,
          );
        }
      }
    } else {
      for (const [txid] of outpointCheckbox) {
        if (!isCheckbox[txid]) {
          await handleOutpointChange(
            outpointCheckbox.get(txid),
            nowOutpointChecked,
            nowTxsChecked,
          );
        }
      }
    }
    setOutpointChecked(nowOutpointChecked);
    setTxsChecked(nowTxsChecked);
    setIsOutpointAllChecked(nowOutpointChecked.size === outpointCheckbox.size);
    setIsTxsAllChecked(nowTxsChecked.size === txsCheckbox.size);
  }

  //outpoint 개별 체크박스 클릭 시 호출
  async function handleOutpointChange(
    SpendingTx: any,
    argOutChecked?: Set<string>,
    argTxsChecked?: Set<string>,
  ) {
    const nowOutpointsChecked = argOutChecked || new Set(outpointChecked);
    const nowTxsChecked = argTxsChecked || new Set(txsChecked);
    if (isCheckbox[SpendingTx.txid]) {
      await deleteNode(graphData[currentTab], SpendingTx.txid);
      nowOutpointsChecked.delete(SpendingTx.txid);
      nowTxsChecked.delete(SpendingTx.txid);
      setIsCheckbox((prev) => ({
        ...prev,
        [SpendingTx.txid]: false,
      }));
    } else {
      nowOutpointsChecked.add(SpendingTx.txid);
      if (txsCheckbox.has(SpendingTx.txid)) nowTxsChecked.add(SpendingTx.txid);
      await appendNode(graphData[currentTab], nodeData, SpendingTx, "Input");
      setIsCheckbox((prev) => ({
        ...prev,
        [SpendingTx.txid]: true,
      }));
    }

    if (!argOutChecked) {
      setOutpointChecked(nowOutpointsChecked);
      setTxsChecked(nowTxsChecked);
      setIsOutpointAllChecked(
        nowOutpointsChecked.size === outpointCheckbox.size,
      );
      setIsTxsAllChecked(nowTxsChecked.size === txsCheckbox.size);
    }
  }

  //txs 전체 체크박스 클릭 시 호출
  async function handleAllTxsChange() {
    const nowTxsChecked = new Set(txsChecked);
    const nowOutpointChecked = new Set(outpointChecked);

    if (isTxsAllChecked) {
      for (const [txid] of txsCheckbox) {
        if (isCheckbox[txid]) {
          await handleTxsChange(
            txsCheckbox.get(txid),
            nowTxsChecked,
            nowOutpointChecked,
          );
        }
      }
    } else {
      for (const [txid] of txsCheckbox) {
        if (!isCheckbox[txid]) {
          await handleTxsChange(
            txsCheckbox.get(txid),
            nowTxsChecked,
            nowOutpointChecked,
          );
        }
      }
    }
    setTxsChecked(nowTxsChecked);
    setOutpointChecked(nowOutpointChecked);
    setIsTxsAllChecked(nowTxsChecked.size === txsCheckbox.size);
    setIsOutpointAllChecked(nowOutpointChecked.size === outpointCheckbox.size);
  }

  //txs 개별 체크박스 클릭 시 호출
  async function handleTxsChange(
    tx: any,
    argTxChecked?: Set<string>,
    argOutChecked?: Set<string>,
  ) {
    const nowTxsChecked = argTxChecked || new Set(txsChecked);
    const nowOutpointsChecked = argOutChecked || new Set(outpointChecked);

    if (isCheckbox[tx.txid]) {
      await deleteNode(graphData[currentTab], tx.txid);
      nowTxsChecked.delete(tx.txid);
      nowOutpointsChecked.delete(tx.txid);
      setIsCheckbox((prev) => ({
        ...prev,
        [tx.txid]: false,
      }));
    } else {
      if (tx.value >= 0)
        await appendNode(graphData[currentTab], nodeData, tx, "Output");
      else await appendNode(graphData[currentTab], nodeData, tx, "Input");
      nowTxsChecked.add(tx.txid);
      if (outpointCheckbox.has(tx.txid)) {
        nowOutpointsChecked.add(tx.txid);
      }
      setIsCheckbox((prev) => ({
        ...prev,
        [tx.txid]: true,
      }));
    }

    if (!argTxChecked) {
      setTxsChecked(nowTxsChecked);
      setOutpointChecked(nowOutpointsChecked);
      setIsTxsAllChecked(nowTxsChecked.size === txsCheckbox.size);
      setIsOutpointAllChecked(
        nowOutpointsChecked.size === outpointCheckbox.size,
      );
    }
  }

  function displayedPages() {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return Array.from({ length: 5 }, (_, i) => i + 1);
    }

    if (currentPage > totalPages - 2) {
      return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    }

    return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i);
  }
  //
  //
  const hasValidOutpoints = edgeData?.some(
    (item: any) => item?.properties?.spending_outpoints?.length > 0,
  );

  useEffect(() => {
    if (!edgeData || !graphData[currentTab]) return;
    const gData = graphData[currentTab].nodes.get();
    let checkbox: CheckBox = {};
    let checked = new Set<string>();
    let checkboxMap = new Map<string, any>();
    edgeData.forEach((edge: any) => {
      if (edge.properties.spending_outpoints.length != 0) {
        edge.properties.spending_outpoints.forEach((outpoint: string) => {
          const [txid, timestamp, value] = outpoint.split("$");
          checkbox = {
            ...checkbox,
            [txid]: gData.some((item: any) => item.label === txid),
          };
          checkboxMap.set(txid, {
            txid,
            timestamp,
            value: -value,
          });
          if (checkbox[txid]) checked.add(txid);
        });
      }
    });
    setIsCheckbox(checkbox);
    setOutpointChecked(checked);
    setOutpointCheckbox(checkboxMap);
    setIsOutpointAllChecked(checkboxMap.size === checked.size);
  }, [edgeData]);

  useEffect(() => {
    if (nodeData.properties.n_tx <= 100) {
      setStartDate(new Date(nodeData.properties.first_seen_receiving * 1000));
      setDate({
        startDate: nodeData.properties.first_seen_receiving,
        endDate: Math.floor(endDate.getTime() / 1000),
      });
    } else {
      const date = Date.now() - 604800000;
      setStartDate(new Date(date));
      setDate({
        startDate: Math.floor(date / 1000),
        endDate: Math.floor(endDate.getTime() / 1000),
      });
    }
  }, [nodeData]);

  useEffect(() => {
    if (!date) return;
    const gData = graphData[currentTab].nodes.get();
    const fetchData = async () => {
      const postData = {
        hash: nodeData.properties.hash,
        start_date: date.startDate,
        end_date: date.endDate,
      };
      // POST 요청의 URL
      const postResponse = (await axios.post(`/cpp/info/addr`, postData)).data;
      setTxData(postResponse);
      let checkbox: CheckBox = {};
      postResponse.txs.forEach((tx: any) => {
        checkbox = {
          ...checkbox,
          [tx.txid]: gData.some((item: any) => item.label === tx.txid),
        };
      });
      setIsCheckbox(checkbox);
    };
    fetchData();
  }, [date]);

  useEffect(() => {
    if (TxData === null) return;
    let checked = new Set<string>();
    let checkboxMap = new Map<string, any>();
    TxData.txs
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((tx) => {
        checkboxMap.set(tx.txid, tx);
        if (isCheckbox[tx.txid]) checked.add(tx.txid);
      });
    setTxsChecked(checked);
    setTxsCheckbox(checkboxMap);
    setIsTxsAllChecked(checkboxMap.size === checked.size);
  }, [currentPage, TxData]);

  return (
    <div className="flex min-h-screen bg-gray-50 border-l border-gray-200 flex-shrink-0 ">
      <div className="px-6 w-80 lg:w-[400px]">
        {nodeData && (
          <>
            <div className="px-1">
              <h2 className="text-lg font-bold leading-6 text-gray-900 mb-2 pt-6 pb-2">
                Wallet Address
              </h2>
              <div className="flex items-center justify-between gap-2">
                <Link
                  key={nodeData.properties.hash}
                  href={`/explore/wallet/${nodeData.properties.hash}`}
                  className="text-md font-bold text-blue-400"
                >
                  {`${nodeData.properties.hash.slice(
                    0,
                    12,
                  )}...${nodeData.properties.hash.slice(-8)}`}
                </Link>
                <button
                  onClick={() =>
                    deleteNode(graphData[currentTab], nodeData.properties.hash)
                  }
                  type="button"
                  className="bg-gray-900 p-1 rounded-full text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                  <MinusIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="mt-4 flow-root">
              <div className="inline-block min-w-full">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="text-left text-sm font-semibold text-gray-100 py-3.5 pl-4"
                        >
                          INFO
                        </th>
                        <th
                          scope="col"
                          className="text-right text-sm font-semibold text-gray-100 py-3.5 px-4"
                        >
                          VALUE
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="text-sm font-medium text-gray-900 whitespace-nowrap py-4 pl-4">
                          Transactions
                        </td>
                        <td className="text-sm text-gray-500 text-right whitespace-nowrap py-4 px-4">
                          {nodeData.properties.n_tx}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-sm font-medium text-gray-900 whitespace-nowrap py-4 pl-4">
                          Received Amount
                        </td>
                        <td className="text-sm text-blue-500 text-right whitespace-nowrap py-4 px-4">
                          {(nodeData.properties.n_rcv_tx * 10 ** -8).toFixed(8)}{" "}
                          BTC
                        </td>
                      </tr>
                      <tr>
                        <td className="text-sm font-medium text-gray-900 whitespace-nowrap py-4 pl-4">
                          Sent Amount
                        </td>
                        <td className="text-sm text-red-500 text-right whitespace-nowrap py-4 px-4">
                          {(nodeData.properties.n_sent_tx * 10 ** -8).toFixed(
                            8,
                          )}{" "}
                          BTC
                        </td>
                      </tr>
                      <tr>
                        <td className="text-sm font-medium text-gray-900 whitespace-nowrap py-4 pl-4">
                          Balance
                        </td>
                        <td className="text-sm text-gray-500 text-right whitespace-nowrap py-4 px-4">
                          {(
                            nodeData.properties.final_balance *
                            10 ** -8
                          ).toFixed(8)}{" "}
                          BTC
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Spending Outpoints */}
            {hasValidOutpoints && (
              <div>
                <div className="pl-1">
                  <div className="pt-6 text-lg font-bold leading-6 text-gray-900">
                    Spending Outpoints
                  </div>
                </div>
                <div className="min-w-full mb-4 mt-4 align-middle">
                  <div className="shadow ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-800">
                        <tr className="flex sm:justify-between">
                          <th className="w-[80px] py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-100">
                            Date
                          </th>
                          <th className="w-[95px] py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-100">
                            Transaction
                          </th>
                          <th className="flex-1 py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-100 hidden lg:table-cell">
                            Credit
                          </th>
                          <th className="py-2 pr-2 flex items-center relative">
                            <input
                              id="outpointsheaderCheckbox"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 flex-1"
                              checked={isOutpointAllChecked}
                              onChange={handleAllOutpointChange}
                            />
                          </th>
                        </tr>
                      </thead>
                      <tbody className="max-h-[200px] overflow-y-auto scrollbar-hide block">
                        {edgeData.map((edge: any, opidx: number) => {
                          if (edge.properties.spending_outpoints.length != 0) {
                            return edge.properties.spending_outpoints.map(
                              (outpoint: any, opidx2: number) => {
                                const [txid, timestamp, value] =
                                  outpoint.split("$");
                                return (
                                  <tr
                                    key={`${opidx}-${opidx2}`}
                                    className="flex items-center sm:justify-between bg-white border-b"
                                  >
                                    <td className="w-[80px] h-[36px] py-2 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                      {unixToFormattedDate(timestamp)}
                                    </td>
                                    <td className="w-[95px] h-[36px] py-2 pl-4 pr-3 text-sm text-gray-500 whitespace-nowrap">
                                      <Link
                                        href={`/explore/transaction/${txid}`}
                                      >
                                        {txid === "Unknown"
                                          ? "Unknown"
                                          : `${txid.slice(0, 6)}...${txid.slice(
                                              -4,
                                            )}`}
                                      </Link>
                                    </td>
                                    <td
                                      className={
                                        "flex-1 h-[36px] py-2 pl-4 pr-3 text-sm text-right whitespace-nowrap text-gray-800 hidden lg:table-cell text-red-500"
                                      }
                                    >
                                      {(-value * 10 ** -8).toFixed(8)} BTC
                                    </td>
                                    <td className="h-[36px] py-2 pr-2 flex items-center relative">
                                      <input
                                        id={`outpoints_${txid}`}
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 flex-1"
                                        checked={isCheckbox[txid] || false}
                                        onChange={() =>
                                          handleOutpointChange({
                                            txid,
                                            timestamp,
                                            value: -value,
                                          })
                                        }
                                      />
                                    </td>
                                  </tr>
                                );
                              },
                            );
                          }
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {/* Date Filter */}
            <form id="txdate" className="mt-6">
              <label className="pl-1 text-lg font-bold text-gray-900 leading-6">
                Transaction
              </label>
              <div className="mt-2 grid grid-flow-col justify-between gap-2">
                <div className="pl-1 block text-sm font-medium leading-6 text-gray-900">
                  Date :
                </div>
                <div>
                  <DatePicker
                    className="py-0.5 block text-sm w-52 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    selectsRange
                    selected={startDate}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={onChange}
                    isClearable
                    dateFormat="yyyy/MM/dd"
                    fixedHeight
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    maxDate={maxDate}
                    minDate={minDate}
                  />
                </div>
              </div>
              <button
                type="button"
                className="mt-2 w-full rounded-md bg-gray-800 py-1 text-xs font-semibold text-white shadow-sm hover:bg-gray-600"
                onClick={() => {
                  if (startDate && endDate) {
                    setDate({
                      startDate: Math.floor(startDate.getTime() / 1000),
                      endDate: Math.floor(endDate.getTime() / 1000),
                    });
                  }
                }}
              >
                Apply
              </button>
              <div className="min-w-full mb-48 mt-4 align-middle">
                <div className="shadow ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-800">
                      <tr className="flex sm:justify-between">
                        <th className="w-[80px] py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-100">
                          Date
                        </th>
                        <th className="w-[95px] py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-100">
                          Transaction
                        </th>
                        <th className="flex-1 py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-100 hidden lg:table-cell">
                          Credit
                        </th>
                        <th className="py-2 pr-2 flex items-center relative">
                          <input
                            id="txsheaderCheckbox"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 flex-1"
                            checked={isTxsAllChecked}
                            onChange={handleAllTxsChange}
                          />
                        </th>
                      </tr>
                    </thead>
                    {TxData && (
                      // <tbody className="max-h-[200px] overflow-y-auto scrollbar-hide block">
                      //   {TxData.txs.map((tx) => (
                      //     <tr
                      //       key={tx.index}
                      //       className="flex items-center sm:justify-between bg-white border-b"
                      //     >
                      //       <td className="w-[80px] h-[36px] py-2 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      //         {unixToFormattedDate(tx.timestamp)}
                      //       </td>
                      //       <td className="w-[95px] h-[36px] py-2 pl-4 pr-3 text-sm text-gray-500 whitespace-nowrap">
                      //         <Link href={`/explore/transaction/${tx.txid}`}>
                      //           {tx.txid === "Unknown"
                      //             ? "Unknown"
                      //             : `${tx.txid.slice(0, 6)}...${tx.txid.slice(
                      //                 -4,
                      //               )}`}
                      //         </Link>
                      //       </td>
                      //       <td
                      //         className={`flex-1 h-[36px] py-2 pl-4 pr-3 text-sm text-right whitespace-nowrap ${
                      //           tx.value < 0 ? "text-red-500" : "text-blue-500"
                      //         } hidden lg:table-cell`}
                      //       >
                      //         {(tx.value * 10 ** -8).toFixed(8)} BTC
                      //       </td>
                      //       <td className="h-[36px] py-2 pr-2 flex items-center relative">
                      //         <input
                      //           id={`rowCheckbox_${tx.txid}`}
                      //           type="checkbox"
                      //           className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 flex-1"
                      //           checked={isCheckbox[tx.txid]}
                      //           onChange={() => handleTxsChange(tx)}
                      //         />
                      //       </td>
                      //     </tr>
                      //   ))}
                      // </tbody>
                      <tbody className="block max-h-[500px]">
                        {TxData.txs
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage,
                          )
                          .map((tx, txidx: number) => (
                            <tr
                              key={txidx}
                              className="flex items-center sm:justify-between bg-white border-b"
                            >
                              <td className="w-[80px] h-[36px] py-2 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                {unixToFormattedDate(tx.timestamp)}
                              </td>
                              <td className="w-[95px] h-[36px] py-2 pl-4 pr-3 text-sm text-gray-500 whitespace-nowrap">
                                <Link href={`/explore/transaction/${tx.txid}`}>
                                  {tx.txid === "Unknown"
                                    ? "Unknown"
                                    : `${tx.txid.slice(0, 6)}...${tx.txid.slice(
                                        -4,
                                      )}`}
                                </Link>
                              </td>
                              <td
                                className={`flex-1 h-[36px] py-2 pl-4 pr-3 text-sm text-right whitespace-nowrap ${
                                  tx.value < 0
                                    ? "text-red-500"
                                    : "text-blue-500"
                                } hidden lg:table-cell`}
                              >
                                {(tx.value * 10 ** -8).toFixed(8)} BTC
                              </td>
                              <td className="h-[36px] py-2 pr-2 flex items-center relative">
                                <input
                                  id={`txs_${tx.txid}`}
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 flex-1"
                                  checked={isCheckbox[tx.txid] || false}
                                  onChange={() => handleTxsChange(tx)}
                                />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    )}
                  </table>
                  <div aria-label="Page">
                    <ul className="list-style-none flex items-center justify-center">
                      {currentPage > 1 && (
                        <li>
                          <Link
                            href="#"
                            onClick={() => handlePageClick(currentPage - 1)}
                            className="relative block rounded bg-transparent px-3 py-1.5 text-sm font-bold transition-all duration-300 hover:bg-grey-400 dark:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                          >
                            <span aria-hidden="true">&laquo;</span>
                          </Link>
                        </li>
                      )}
                      {displayedPages().map((page) => (
                        <li key={page}>
                          <Link
                            className={`relative block rounded bg-transparent px-3 py-1.5 text-sm ${
                              page === currentPage
                                ? "text-gray-900 font-black"
                                : "text-gray-400 font-light"
                            } transition-all duration-300 hover:bg-grey-400 dark:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white`}
                            href="#"
                            onClick={() => handlePageClick(page)}
                          >
                            {page}
                          </Link>
                        </li>
                      ))}
                      {currentPage < totalPages && (
                        <li>
                          <Link
                            href="#"
                            onClick={() => handlePageClick(currentPage + 1)}
                            className="relative block rounded bg-transparent px-3 py-1.5 text-sm font-bold transition-all duration-300 hover:bg-grey-400 dark:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                          >
                            <span aria-hidden="true">&raquo;</span>
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
