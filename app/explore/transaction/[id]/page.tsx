"use client";
import Link from "next/link";
import axios from "axios";
import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import BitcoinInfo from "@/types/bitcoin_info";
import { useRouter } from "next/navigation";
import { unixToFormattedDate } from "@/app/lib/visHandler";

export default function Transaction({ params }: { params: { id: string } }) {
  const [TxData, setTxData] = useState<BitcoinInfo.Transaction | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<BitcoinInfo.Transaction>(
          `/cpp/info/txid?hash=${params.id}`,
        );
        setTxData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push(`/error404`);
      }
    };
    fetchData();
  }, [params]);

  return (
    <div className="overflow-y-auto mx-auto h-full w-full max-w-full flex-grow flex">
      <div className="min-w-0 flex-1 xl:flex pb-4 pl-6 pr-6 pt-4">
        {TxData && (
          <div key={TxData.txid} className="min-w-0 flex-1">
            <div className="pb-4 pl-6 pr-6 pt-6 border-t-0">
              <div className="flex items-center">
                <h1 className="flex-1 font-black text-3xl mb-4">
                  Transaction Extended View
                </h1>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-base font-semibold leading-7 mr-0.5">
                  Hash ID :
                </h3>
                <p className="max-w-2xl leading-7 font-light text-gray-700">
                  {TxData.txid}
                </p>
                <button
                  type="button"
                  className="rounded-full bg-gray-800 p-1 text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => {
                    async function fetchData() {
                      const postData = {
                        type: "Transaction",
                        ...TxData,
                      };
                      await axios.post("/graph/api", postData);
                      router.push("/");
                    }
                    fetchData();
                  }}
                >
                  <PlusIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {Object.keys(TxData.profile).length > 0 && (
                <div className="grid grid-cols-2 gap-0">
                  <div className="flex col-span-1 text-base leading-7">
                    <h3 className="font-medium">Flags : &nbsp;</h3>
                    <div className="max-w-2xl flex gap-2">
                      {TxData.profile.flags.map((flag) => (
                        <span
                          key={flag._id}
                          className="leading-7 border-2 inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                        >
                          {flag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex col-span-1 text-base leading-7">
                    <h3 className="font-medium">Entities : &nbsp;</h3>
                    <div className="max-w-2xl flex gap-2">
                      {TxData.profile.entities.map((entity) => (
                        <span
                          key={entity}
                          className="leading-7 border-2 inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                        >
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-rows-3 grid-flow-col grid-cols-5 gap-4">
              <div className="row-span-3 col-span-3 px-2 bg-[#ECECEC] mr-6 py-2 overflow-hidden rounded-md border-2 border-[#707070] shadow">
                <ul role="list" className="divide-y divide-gray-300">
                  <li className="py-3 px-1 flex justify-between">
                    <h1 className="font-black text-2xl">Info</h1>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Inputs</span>
                    <span>{TxData.n_input}</span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Outputs</span>
                    <span>{TxData.n_output}</span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Input value</span>
                    <span>
                      {(TxData.input_value * 10 ** -8).toFixed(8)} BTC
                    </span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Output value</span>
                    <span>
                      {(TxData.output_value * 10 ** -8).toFixed(8)} BTC
                    </span>
                  </li>
                  <li className="py-2 px-1  flex justify-between">
                    <span className=" font-semibold">Fee</span>
                    <span>{(TxData.fee * 10 ** -8).toFixed(8)} BTC</span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Block height</span>
                    <span>{TxData.block_height}</span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Size</span>
                    <span>{TxData.size} B</span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Time</span>
                    <span>{unixToFormattedDate(TxData.time)}</span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Version</span>
                    <span>{TxData.ver}</span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Locktime</span>
                    <span>{TxData.lock_time}</span>
                  </li>
                </ul>
              </div>
              {/* 여기서부터 오른쪽편 */}
              <div className="row-span-2 col-span-2 p-2 bg-[#ECECEC] overflow-hidden rounded-md border-2 border-[#707070] shadow">
                <ul role="list" className="divide-y divide-gray-300">
                  <li className="py-2 px-1 flex justify-between">
                    <h1 className="font-black text-xl">From</h1>
                  </li>
                  <div className="h-24 overflow-y-auto scrollbar-hide divide-y divide-gray-300">
                    {TxData.inputs.length === 0 ? (
                      <li className="pb-1">
                        <span className="flex items-center gap-x-3">
                          <h3 className="flex-auto truncate text-sm font-semibold leading-6 text-orange-500">
                            CoinBase
                          </h3>
                        </span>
                      </li>
                    ) : (
                      TxData.inputs.map((input) => (
                        <li key={input.prev_out.addr} className="pb-1">
                          <span className="flex items-center gap-x-3">
                            <h3 className="flex-auto truncate text-sm font-semibold leading-6 text-orange-500">
                              <Link
                                href={`/explore/wallet/${input.prev_out.addr}`}
                              >
                                {input.prev_out.addr === "Unknown"
                                  ? "Unknown"
                                  : `${input.prev_out.addr.slice(
                                      0,
                                      12,
                                    )}...${input.prev_out.addr.slice(-8)}`}
                              </Link>
                            </h3>
                            <span className="flex-none text-xs text-gray-500">
                              <div>{input.n}</div>
                            </span>
                          </span>

                          <span className="flex items-center gap-x-3 text-xs">
                            <span className="flex-auto truncate text-gray-900">
                              TX :{" "}
                              <Link
                                href={`/explore/transaction/${input.txid}`}
                                className="underline text-gray-700"
                              >
                                {`${input.txid.slice(
                                  0,
                                  10,
                                )}...${input.txid.slice(-8)}`}
                              </Link>
                            </span>
                            <span className="flex-none text-blue-500">
                              {(input.prev_out.value * 10 ** -8).toFixed(8)} BTC
                            </span>
                          </span>
                        </li>
                      ))
                    )}
                  </div>
                </ul>
                <ul role="list" className="divide-y divide-gray-300">
                  <li className="py-2 px-1 flex justify-between">
                    <h2 className="font-black text-xl">To</h2>
                  </li>
                  <div className="h-24 overflow-y-auto scrollbar-hide divide-y divide-gray-300">
                    {TxData.outputs.map((output) => (
                      <li key={output.addr} className="pb-1">
                        <div className="flex items-center gap-x-3">
                          <span className="flex-auto truncate text-sm font-semibold leading-6 text-orange-500">
                            <Link href={`/explore/wallet/${output.addr}`}>
                              {output.addr === "Unknown"
                                ? "Unknown"
                                : `${output.addr.slice(
                                    0,
                                    12,
                                  )}...${output.addr.slice(-8)}`}
                            </Link>
                          </span>
                          <span className="flex-none text-xs text-gray-500">
                            <span>{output.n}</span>
                          </span>
                        </div>
                        {output.spent && (
                          <span className="flex items-center gap-x-3 text-xs">
                            <span className="flex-auto truncate text-black">
                              TX :{" "}
                              <Link
                                href={`/explore/transaction/${output.spending_outpoints.txid}`}
                                className="underline text-gray-700"
                              >
                                {output.spending_outpoints.txid === "Unknown"
                                  ? "Unknown"
                                  : `${output.spending_outpoints.txid.slice(
                                      0,
                                      10,
                                    )}...${output.spending_outpoints.txid.slice(
                                      -8,
                                    )}`}
                              </Link>
                            </span>
                            <span className="flex-none text-red-500">
                              {(output.value * 10 ** -8).toFixed(8)} BTC
                            </span>
                          </span>
                        )}
                      </li>
                    ))}
                  </div>
                </ul>
              </div>
              <div className="col-span-2 p-2 bg-[#ECECEC] overflow-hidden rounded-md border-2 border-[#707070] shadow mt-2">
                <h1 className="py-2 px-1 flex font-black text-2xl">Comment</h1>
                <p className="py-1 px-1 flex">{TxData.profile.comments}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
