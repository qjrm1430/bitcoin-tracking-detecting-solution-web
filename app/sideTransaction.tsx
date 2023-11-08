"use client";
import Link from "next/link";
import { MinusIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  deleteNode,
  appendNode,
  unixToFormattedDate,
  autoTrack,
} from "./lib/visHandler";
import { useGraphData } from "./GraphDataContext";

interface CheckBox {
  [key: string]: boolean;
}
export default function SideTransaction({ nodeData }: any) {
  const { graphDataState } = useGraphData();
  const { activeTab: currentTab, tabGraphData: graphData } = graphDataState;

  const [isCheckbox, setIsCheckbox] = useState<CheckBox>({});

  const [isInputAllChecked, setIsInputAllChecked] = useState(false);
  const [inputCheckbox, setInputCheckbox] = useState<Map<string, any>>(
    new Map(),
  );
  const [inputChecked, setInputChecked] = useState<Set<string>>(new Set());

  const [isOutputAllChecked, setIsOutputAllChecked] = useState(false);
  const [outputCheckbox, setOutputCheckbox] = useState<Map<string, any>>(
    new Map(),
  );
  const [outputChecked, setOutputChecked] = useState<Set<string>>(new Set());

  const [calNodeData, setCalNodeData] = useState<{
    Inputs: { addr: string; value: number; outpoints: string[] }[];
    Outputs: { addr: string; value: number; outpoints: string[] }[];
  } | null>(null);

  // inputs에 대한 전체 체크박스 상태 변경 핸들러
  async function handleInputsAllCheckbox() {
    const nowInputChecked = new Set(inputChecked);
    if (isInputAllChecked) {
      for (const [addr] of inputCheckbox) {
        if (isCheckbox[addr]) {
          await handleInputsCheckbox(inputCheckbox.get(addr), nowInputChecked);
        }
      }
    } else {
      for (const [addr] of inputCheckbox) {
        if (!isCheckbox[addr]) {
          await handleInputsCheckbox(inputCheckbox.get(addr), nowInputChecked);
        }
      }
    }
    setInputChecked(nowInputChecked);
    setIsInputAllChecked(nowInputChecked.size === inputCheckbox.size);
  }

  // inputs에 대한 개별 체크박스 상태 변경 핸들러
  async function handleInputsCheckbox(
    input: any,
    argInputChecked?: Set<string>,
  ) {
    const nowChecked = argInputChecked || new Set(inputChecked);
    if (isCheckbox[input.addr]) {
      await deleteNode(graphData[currentTab], input.addr);
      nowChecked.delete(input.addr);
      setIsCheckbox((prev) => ({
        ...prev,
        [input.addr]: false,
      }));
    } else {
      await appendNode(graphData[currentTab], nodeData, input, "Input");
      nowChecked.add(input.addr);
      setIsCheckbox((prev) => ({
        ...prev,
        [input.addr]: true,
      }));
    }
    if (!argInputChecked) {
      setInputChecked(nowChecked);
      setIsInputAllChecked(nowChecked.size === inputCheckbox.size);
    }
  }

  // 전체 체크박스 상태 변경 핸들러
  async function handleOutputsAllCheckbox() {
    const nowOutputChecked = new Set(outputChecked);
    if (isOutputAllChecked) {
      for (const [addr] of outputCheckbox) {
        if (isCheckbox[addr]) {
          await handleOutputsCheckbox(
            outputCheckbox.get(addr),
            nowOutputChecked,
          );
        }
      }
    } else {
      for (const [addr] of outputCheckbox) {
        if (!isCheckbox[addr]) {
          await handleOutputsCheckbox(
            outputCheckbox.get(addr),
            nowOutputChecked,
          );
        }
      }
    }
    setOutputChecked(nowOutputChecked);
    setIsOutputAllChecked(nowOutputChecked.size === outputCheckbox.size);
  }

  async function handleOutputsCheckbox(
    output: any,
    argOutChecked?: Set<string>,
  ) {
    const nowChecked = argOutChecked || new Set(outputChecked);
    if (isCheckbox[output.addr]) {
      await deleteNode(graphData[currentTab], output.addr);
      nowChecked.delete(output.addr);
      setIsCheckbox((prev) => ({
        ...prev,
        [output.addr]: false,
      }));
    } else {
      await appendNode(graphData[currentTab], nodeData, output, "Output");
      nowChecked.add(output.addr);
      setIsCheckbox((prev) => ({
        ...prev,
        [output.addr]: true,
      }));
    }
    if (!argOutChecked) {
      setOutputChecked(nowChecked);
      setIsOutputAllChecked(nowChecked.size === outputCheckbox.size);
    }
  }

  const [inputCurrentPage, setInputCurrentPage] = useState(1);
  const [outputCurrentPage, setOutputCurrentPage] = useState(1);
  const itemsPerPage = 10; // 페이지당 출력할 아이템 개수
  const inputTotalPages = Math.ceil(
    (calNodeData?.Inputs?.length || 0) / itemsPerPage,
  );
  const outputTotalPages = Math.ceil(
    (calNodeData?.Outputs?.length || 0) / itemsPerPage,
  );

  const inputHandlePageClick = (page: number) => setInputCurrentPage(page);
  const outputHandlePageClick = (page: number) => setOutputCurrentPage(page);

  const displayedPages = (x: string) => {
    const totalPages = x === "input" ? inputTotalPages : outputTotalPages;
    const currentPage = x === "input" ? inputCurrentPage : outputCurrentPage;

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
  };

  //
  //
  useEffect(() => {
    if (!graphData[currentTab]) return;
    const gData = graphData[currentTab].nodes.get();
    const wallets = new Map<string, { value: number; outpoints: string[] }>();
    const Inputs: { addr: string; value: number; outpoints: string[] }[] = [];
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
    let checkbox: CheckBox = {};
    wallets.forEach((data, key) => {
      if (data.value >= 0) {
        Inputs.push({
          addr: key,
          value: data.value,
          outpoints: data.outpoints,
        });
      } else {
        Outputs.push({
          addr: key,
          value: Math.abs(data.value),
          outpoints: data.outpoints,
        });
      }
      checkbox = {
        ...checkbox,
        [key]: gData.some((item: any) => item.label === key),
      };
    });
    setCalNodeData({ Inputs, Outputs });
    setIsCheckbox(checkbox);
  }, [nodeData]);

  useEffect(() => {
    if (calNodeData === null) return;
    let checked = new Set<string>();
    let checkboxMap = new Map<string, any>();
    calNodeData.Inputs.slice(
      (inputCurrentPage - 1) * itemsPerPage,
      inputCurrentPage * itemsPerPage,
    ).map((input) => {
      checkboxMap.set(input.addr, input);
      if (isCheckbox[input.addr]) checked.add(input.addr);
    });
    setInputChecked(checked);
    setInputCheckbox(checkboxMap);
    setIsInputAllChecked(checkboxMap.size === checked.size);
  }, [inputCurrentPage, calNodeData]);

  useEffect(() => {
    if (calNodeData === null) return;
    let checked = new Set<string>();
    let checkboxMap = new Map<string, any>();
    calNodeData.Outputs.slice(
      (outputCurrentPage - 1) * itemsPerPage,
      outputCurrentPage * itemsPerPage,
    ).map((Output) => {
      checkboxMap.set(Output.addr, Output);
      if (isCheckbox[Output.addr]) checked.add(Output.addr);
    });
    setOutputChecked(checked);
    setOutputCheckbox(checkboxMap);
    setIsOutputAllChecked(checkboxMap.size === checked.size);
  }, [outputCurrentPage, calNodeData]);

  if (calNodeData === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 border-l border-gray-200 flex-shrink-0">
      <div className="px-6 w-80 lg:w-[400px]">
        {nodeData && (
          <>
            <div className="px-1">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="pt-6 pb-2 text-lg font-bold leading-6 text-gray-900">
                  Transaction
                </h2>
                <button
                  type="button"
                  className="mt-4 rounded bg-gray-900 px-2 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                  onClick={() => autoTrack(graphData[currentTab], nodeData, 0)}
                >
                  Auto Tracking
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Link
                  key={nodeData.properties.hash}
                  href={`/explore/transaction/${nodeData.properties.hash}`}
                  className="text-blue-400 font-bold text-md"
                >
                  {`${nodeData.properties.hash.slice(
                    0,
                    12,
                  )}...${nodeData.properties.hash.slice(-8)}`}
                </Link>
                {/* <button
                  type="button"
                  className="rounded-full bg-gray-900 p-1 text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                > */}
                <button
                  onClick={() =>
                    deleteNode(graphData[currentTab], nodeData.properties.hash)
                  }
                  type="button"
                  className="rounded-full bg-gray-900 p-1 text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                  <MinusIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            {/* Info */}
            <div className="mt-4 flow-root">
              <div className="inline-block min-w-full">
                <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
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
                        <td className="font-medium pl-4 py-4 text-gray-900 text-sm whitespace-nowrap">
                          Input Value
                        </td>
                        <td className="px-4 py-4 text-blue-500 text-right text-sm whitespace-nowrap">
                          {(nodeData.properties.input_value * 10 ** -8).toFixed(
                            8,
                          )}{" "}
                          BTC
                        </td>
                      </tr>
                      <tr>
                        <td className="text-sm font-medium text-gray-900 whitespace-nowrap py-4 pl-4">
                          Output Value
                        </td>
                        <td className="px-4 py-4 text-red-500 text-right text-sm whitespace-nowrap">
                          {(
                            nodeData.properties.output_value *
                            10 ** -8
                          ).toFixed(8)}{" "}
                          BTC
                        </td>
                      </tr>
                      <tr>
                        <td className="font-medium pl-4 py-4 text-gray-900 text-sm whitespace-nowrap">
                          Fee
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-right text-sm whitespace-nowrap">
                          {(nodeData.properties.fee * 10 ** -8).toFixed(8)} BTC
                        </td>
                      </tr>
                      <tr>
                        <td className="font-medium pl-4 py-4 text-gray-900 text-sm whitespace-nowrap">
                          Block Height
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-right text-sm whitespace-nowrap">
                          {nodeData.properties.block_height}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-medium pl-4 py-4 text-gray-900 text-sm whitespace-nowrap">
                          Size
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-right text-sm whitespace-nowrap">
                          {nodeData.properties.size} B
                        </td>
                      </tr>
                      <tr>
                        <td className="font-medium pl-4 py-4 text-gray-900 text-sm whitespace-nowrap">
                          Date
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-right text-sm whitespace-nowrap">
                          {unixToFormattedDate(nodeData.properties.time)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="font-bold leading-6 mt-8 pl-1 text-gray-900 text-lg">
              Input
            </div>
            <div className="align-middle inline-block min-w-full mt-4">
              <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
                <table className="divide-y divide-gray-300 min-w-full">
                  <thead className="bg-gray-800">
                    <tr className="flex items-center sm:justify-between">
                      <th
                        scope="col"
                        className="font-semibold pl-4 pr-3 py-3 text-gray-100 text-left text-sm w-[80px]"
                      >
                        Wallet
                      </th>
                      <th className="flex-1 py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-100 lg:table-cell">
                        Value
                      </th>
                      <th
                        scope="col"
                        className="flex items-center px-2 py-2 relative"
                      >
                        <input
                          id="inputHeaderCheckbox"
                          type="checkbox"
                          className="border-gray-300 flex-1 focus:ring-indigo-600 h-4 rounded text-indigo-600 w-4"
                          checked={isInputAllChecked}
                          onChange={handleInputsAllCheckbox}
                        />
                      </th>
                    </tr>
                  </thead>
                  {/* <tbody className="block max-h-[200px] overflow-y-auto scrollbar-hide">
                    {calNodeData.Inputs.map((input: any, ipidx: any) => (
                      <tr
                        key={ipidx}
                        className="bg-white border-b flex items-center sm:justify-between"
                      >
                        <td className="font-medium h-[36px] pl-4 pr-3 py-2 text-gray-900 text-sm whitespace-nowrap w-[115px]">
                          <Link href={`/explore/wallet/${input.addr}`}>
                            {input.addr === "Unknown"
                              ? "Uknown"
                              : `${input.addr.slice(0, 6)}...${input.addr.slice(
                                  -4,
                                )}`}
                          </Link>
                        </td>
                        <td
                          className={
                            "flex-1 h-[36px] py-2 pl-4 pr-3 text-sm text-right whitespace-nowrap text-gray-500 lg:table-cell"
                          }
                        >
                          {(input.value * 10 ** -8).toFixed(8)} BTC
                        </td>
                        <td className="flex h-[36px] items-center px-2 py-2 relative">
                          <input
                            id={`rowCheckbox_${input}`}
                            type="checkbox"
                            className="border-gray-300 flex-1 focus:ring-indigo-600 h-4 rounded text-indigo-600 w-4"
                            checked={isCheckbox[input.addr]}
                            onChange={() => handleInputsCheckBox(input)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody> */}
                  <tbody className="block max-h-[500px]">
                    {calNodeData.Inputs.slice(
                      (inputCurrentPage - 1) * itemsPerPage,
                      inputCurrentPage * itemsPerPage,
                    ).map((input, ipidx: number) => (
                      <tr
                        key={ipidx}
                        className="bg-white border-b flex items-center sm:justify-between"
                      >
                        <td className="font-medium h-[36px] pl-4 pr-3 py-2 text-gray-900 text-sm whitespace-nowrap w-[115px]">
                          <Link href={`/explore/wallet/${input.addr}`}>
                            {input.addr === "Unknown"
                              ? "Uknown"
                              : `${input.addr.slice(0, 6)}...${input.addr.slice(
                                  -4,
                                )}`}
                          </Link>
                        </td>
                        <td
                          className={
                            "flex-1 h-[36px] py-2 pl-4 pr-3 text-sm text-right whitespace-nowrap text-gray-500 lg:table-cell"
                          }
                        >
                          {(input.value * 10 ** -8).toFixed(8)} BTC
                        </td>
                        <td className="flex h-[36px] items-center px-2 py-2 relative">
                          <input
                            id={`inputCheckbox_${input.addr}`}
                            type="checkbox"
                            className="border-gray-300 flex-1 focus:ring-indigo-600 h-4 rounded text-indigo-600 w-4"
                            checked={isCheckbox[input.addr] || false}
                            onChange={() => handleInputsCheckbox(input)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div aria-label="Input">
                  <ul className="list-style-none flex items-center justify-center">
                    {inputCurrentPage > 1 && (
                      <li>
                        <Link
                          href="#"
                          onClick={() =>
                            inputHandlePageClick(inputCurrentPage - 1)
                          }
                          className="relative block rounded bg-transparent px-3 py-1.5 text-sm font-bold transition-all duration-300 hover:bg-grey-400 dark:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                        >
                          <span aria-hidden="true">&laquo;</span>
                        </Link>
                      </li>
                    )}
                    {displayedPages("input").map((page) => (
                      <li key={page}>
                        <Link
                          className={`relative block rounded bg-transparent px-3 py-1.5 text-sm ${
                            page === inputCurrentPage
                              ? "text-gray-900 font-black"
                              : "text-gray-400 font-light"
                          } transition-all duration-300 hover:bg-grey-400 dark:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white`}
                          href="#"
                          onClick={() => inputHandlePageClick(page)}
                        >
                          {page}
                        </Link>
                      </li>
                    ))}
                    {inputCurrentPage < inputTotalPages && (
                      <li>
                        <Link
                          href="#"
                          onClick={() =>
                            inputHandlePageClick(inputCurrentPage + 1)
                          }
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

            {/* Output */}
            <div className="font-bold leading-6 mt-8 pl-1 text-gray-900 text-lg">
              Output
            </div>
            <div className="align-middle inline-block mb-48 min-w-full mt-4">
              <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
                <table className="divide-y divide-gray-300 min-w-full">
                  <thead className="bg-gray-800">
                    <tr className="flex items-center sm:justify-between">
                      <th className="w-[80px] py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-100">
                        Wallet
                      </th>
                      <th className="flex-1 py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-100 lg:table-cell">
                        Value
                      </th>
                      <th
                        scope="col"
                        className="flex items-center px-2 py-2 relative"
                      >
                        <input
                          id="outputHeaderCheckbox"
                          type="checkbox"
                          className="border-gray-300 flex-1 focus:ring-indigo-600 h-4 rounded text-indigo-600 w-4"
                          checked={isOutputAllChecked}
                          onChange={handleOutputsAllCheckbox}
                        />
                      </th>
                    </tr>
                  </thead>
                  {/* <tbody className="block max-h-[200px] overflow-y-auto scrollbar-hide">
                    {calNodeData.Outputs.map((output: any, opidx: number) => (
                      <tr
                        key={opidx}
                        className="bg-white border-b flex items-center sm:justify-between"
                      >
                        <td className="font-medium h-[36px] pl-4 pr-3 py-2 text-gray-900 text-sm whitespace-nowrap w-[115px]">
                          <Link href={`/explore/wallet/${output.addr}`}>
                            {output.addr === "Unknown"
                              ? "Uknown"
                              : `${output.addr.slice(
                                  0,
                                  6,
                                )}...${output.addr.slice(-4)}`}
                          </Link>
                        </td>
                        <td
                          className={`flex-1 h-[36px] py-2 pl-4 pr-3 text-sm text-right whitespace-nowrap ${
                            output.value < 0 ? "text-red-500" : "text-blue-500"
                          } lg:table-cell`}
                        >
                          {(output.value * 10 ** -8).toFixed(8)} BTC
                        </td>
                        <td className="flex h-[36px] items-center px-2 py-2 relative">
                          <input
                            id={`rowCheckbox2_${output}`}
                            type="checkbox"
                            className="border-gray-300 flex-1 focus:ring-indigo-600 h-4 rounded text-indigo-600 w-4"
                            checked={isCheckbox[output.addr]}
                            onChange={() => handleOutputsCheckBox(output)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody> */}
                  <tbody className="block max-h-[500px]">
                    {calNodeData.Outputs.slice(
                      (outputCurrentPage - 1) * itemsPerPage,
                      outputCurrentPage * itemsPerPage,
                    ).map((output, opidx: number) => (
                      <tr
                        key={opidx}
                        className="bg-white border-b flex items-center sm:justify-between"
                      >
                        <td className="font-medium h-[36px] pl-4 pr-3 py-2 text-gray-900 text-sm whitespace-nowrap w-[115px]">
                          <Link href={`/explore/wallet/${output.addr}`}>
                            {output.addr === "Unknown"
                              ? "Unknown"
                              : `${output.addr.slice(
                                  0,
                                  6,
                                )}...${output.addr.slice(-4)}`}
                          </Link>
                        </td>
                        <td
                          className={
                            "flex-1 h-[36px] py-2 pl-4 pr-3 text-sm text-right whitespace-nowrap text-gray-500 lg:table-cell"
                          }
                        >
                          {(output.value * 10 ** -8).toFixed(8)} BTC
                        </td>
                        <td className="flex h-[36px] items-center px-2 py-2 relative">
                          <input
                            id={`outputCheckBox${output.addr}`}
                            type="checkbox"
                            className="border-gray-300 flex-1 focus:ring-indigo-600 h-4 rounded text-indigo-600 w-4"
                            checked={isCheckbox[output.addr] || false}
                            onChange={() => handleOutputsCheckbox(output)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div aria-label="Output">
                  <ul className="list-style-none flex items-center justify-center">
                    {outputCurrentPage > 1 && (
                      <li>
                        <Link
                          href="#"
                          onClick={() =>
                            outputHandlePageClick(outputCurrentPage - 1)
                          }
                          className="relative block rounded bg-transparent px-3 py-1.5 text-sm font-bold transition-all duration-300 hover:bg-grey-400 dark:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                        >
                          <span aria-hidden="true">&laquo;</span>
                        </Link>
                      </li>
                    )}
                    {displayedPages("output").map((page) => (
                      <li key={page}>
                        <Link
                          className={`relative block rounded bg-transparent px-3 py-1.5 text-sm ${
                            page === outputCurrentPage
                              ? "text-gray-900 font-black"
                              : "text-gray-400 font-light"
                          } transition-all duration-300 hover:bg-grey-400 dark:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white`}
                          href="#"
                          onClick={() => outputHandlePageClick(page)}
                        >
                          {page}
                        </Link>
                      </li>
                    ))}
                    {outputCurrentPage < outputTotalPages && (
                      <li>
                        <Link
                          href="#"
                          onClick={() =>
                            outputHandlePageClick(outputCurrentPage + 1)
                          }
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
          </>
        )}
      </div>
    </div>
  );
}
