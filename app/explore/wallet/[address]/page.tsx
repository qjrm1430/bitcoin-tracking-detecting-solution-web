"use client";
import Link from "next/link";
import axios from "axios";
import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import BitcoinInfo from "@/types/bitcoin_info";
import { useRouter } from "next/navigation";
import { unixToFormattedDate } from "@/app/lib/visHandler";

export default function Wallet({ params }: { params: { address: string } }) {
  const [WalletData, setWalletData] = useState<BitcoinInfo.Wallet | null>(null);
  const [TxData, setTxData] = useState<BitcoinInfo.Txs | null>(null);
  const [date, setDate] = useState<{
    startDate: number;
    endDate: number;
  } | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        // GET 요청의 URL
        const getResponse = (
          await axios.get<BitcoinInfo.Wallet>(
            `/cpp/info/addr?hash=${params.address}`,
          )
        ).data;
        setWalletData(getResponse);
        if (getResponse.n_tx < 100) {
          setDate({
            startDate: getResponse.first_seen_receiving,
            endDate: Math.floor(Date.now() / 1000),
          });
        } else {
          setDate({
            startDate: Math.floor(Date.now() / 1000) - 604800,
            endDate: Math.floor(Date.now() / 1000),
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push(`/error404`);
      }
    };
    fetchData();
  }, [params]);

  useEffect(() => {
    if (!date) return;
    const fetchData = async () => {
      const postData = {
        hash: params.address,
        start_date: date.startDate,
        end_date: date.endDate,
      };
      // POST 요청의 URL
      const postResponse = (
        await axios.post<BitcoinInfo.Txs>(`/cpp/info/addr`, postData)
      ).data;
      if (postResponse.n_tx <= 0) {
        setDate((prev: any) => ({
          startDate: prev?.startDate - 604800,
          endDate: prev?.startDate,
        }));
      } else {
        setTxData(postResponse);
      }
    };
    fetchData();
  }, [date]);

  return (
    <div className=" overflow-y-auto group-[]:mx-auto h-full w-full max-w-full flex-grow flex">
      <div className="min-w-0 flex-1 xl:flex pb-4 pl-6 pr-6 pt-4">
        {WalletData && (
          <div key={WalletData.addr} className="min-w-0 flex-1">
            <div className="pb-4 pl-6 pr-6 pt-6 border-t-0">
              <div className="flex items-center">
                <h1 className="flex-1 font-black text-3xl mb-4">
                  Walllet Extended View
                </h1>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-base font-semibold leading-7 mr-0.5">
                  Hash ID :
                </h3>
                <p className="max-w-2xl leading-7 font-light text-gray-700">
                  {WalletData.addr}
                </p>
                <button
                  onClick={() => {
                    async function fetchData() {
                      const postData = {
                        type: "Wallet",
                        ...WalletData,
                      };
                      await axios.post("/graph/api", postData);
                      router.push("/");
                    }
                    fetchData();
                  }}
                  type="button"
                  className="rounded-full bg-gray-800 p-1 text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PlusIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {WalletData.profile && "flags" in WalletData.profile && (
                <div className="grid grid-cols-2 gap-0">
                  <div className="flex col-span-1 text-base leading-7">
                    <h3 className="font-medium">Flags : &nbsp;</h3>
                    <div className="max-w-2xl flex gap-2">
                      {WalletData.profile.flags.map((flag) => (
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
                      {WalletData.profile.entities.map((entity) => (
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
            {/* Info */}
            <div className="grid grid-rows-3 grid-flow-col grid-cols-5 gap-4">
              <div className="row-span-3 col-span-3 px-2 bg-[#ECECEC] mr-6 py-2 overflow-hidden rounded-md border-2 border-[#707070] shadow">
                <ul role="list" className="divide-y divide-gray-300">
                  <li className="py-3 px-1 flex justify-between">
                    <h1 className="font-black text-2xl">Info</h1>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Balance</span>
                    <span>
                      {(WalletData.final_balance * 10 ** -8).toFixed(8)} BTC
                    </span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Transaction Number</span>
                    <span>{WalletData.n_tx}</span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Received Transcation</span>
                    <span>{WalletData.n_rcv_tx}</span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Sent Transaction</span>
                    <span>{WalletData.n_sent_tx}</span>
                  </li>
                  <li className="py-2 px-1  flex justify-between">
                    <span className=" font-semibold">Total Received</span>
                    <span>
                      {(WalletData.total_received * 10 ** -8).toFixed(8)} BTC
                    </span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Total Sent</span>
                    <span>
                      {(WalletData.total_sent * 10 ** -8).toFixed(8)} BTC
                    </span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Format</span>
                    <span>{WalletData.format}</span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">First Receiving</span>
                    <span>
                      {unixToFormattedDate(WalletData.first_seen_receiving)}
                    </span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Last Receiving</span>
                    <span>
                      {unixToFormattedDate(WalletData.last_seen_receiving)}
                    </span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">First Seen Sending</span>
                    <span>
                      {unixToFormattedDate(WalletData.first_seen_sending)}
                    </span>
                  </li>
                  <li className="py-2 px-1 flex justify-between">
                    <span className=" font-semibold">Last Seen Sending</span>
                    <span>
                      {unixToFormattedDate(WalletData.last_seen_sending)}
                    </span>
                  </li>
                </ul>
              </div>
              {/* Right Side */}
              <div className="row-span-2 col-span-2 p-2 bg-[#ECECEC] overflow-hidden rounded-md border-2 border-[#707070] shadow">
                <ul role="list" className="divide-y divide-gray-300">
                  <li className="py-2 px-1 flex justify-between">
                    <h1 className="font-black text-xl">Transaction</h1>
                  </li>

                  <div className="max-h-40 overflow-y-auto scrollbar-hide divide-y divide-gray-300">
                    {TxData &&
                      TxData.txs.map((tx) => (
                        <li key={tx.txid} className="pb-1">
                          <span className="flex items-center gap-x-3">
                            <span className="flex-auto truncate text-sm font-semibold leading-6 text-orange-500">
                              <Link href={`/explore/transaction/${tx.txid}`}>
                                {tx.txid === "Unknown"
                                  ? "Unknown"
                                  : `${tx.txid.slice(0, 10)}...${tx.txid.slice(
                                      -8,
                                    )}`}
                              </Link>
                            </span>
                            <span className="flex-none text-xs text-gray-500">
                              <span>{unixToFormattedDate(tx.timestamp)}</span>
                            </span>
                          </span>
                          <span className="flex items-center justify-between gap-x-3 text-xs mb-1 text-gray-600">
                            <span className="flex-auto truncate">
                              value :
                              <span
                                className={
                                  tx.value < 0
                                    ? "text-red-500"
                                    : "text-blue-500"
                                }
                              >
                                &nbsp;{(tx.value * 10 ** -8).toFixed(8)}
                              </span>
                              &nbsp;BTC
                            </span>

                            <span className="flex-none text-gray-600">
                              fee : {(tx.fee * 10 ** -8).toFixed(8)} BTC
                            </span>
                          </span>
                        </li>
                      ))}
                  </div>

                  {WalletData && (
                    <>
                      <li className="py-2 px-1 flex justify-between">
                        <h2 className="font-black text-xl">Cluster</h2>
                      </li>
                      <li className="py-1 px-1 flex justify-between">
                        <span className=" font-semibold">Size</span>
                        <span>{WalletData.cluster.name}</span>
                      </li>
                      <li className="py-1 px-1 flex justify-between">
                        <span className=" font-semibold">Time</span>
                        <span>{WalletData.cluster._id}</span>
                      </li>
                      <li className="py-1 px-1 flex justify-between">
                        <span className=" font-semibold">Version</span>
                        <span>{WalletData.cluster.n_addr}</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              {/* Comment */}
              <div className="col-span-2 p-2 bg-[#ECECEC] overflow-hidden rounded-md border-2 border-[#707070] shadow mt-2">
                <h1 className="py-2 px-1 flex font-black text-2xl">Comment</h1>
                {WalletData.profile && "flags" in WalletData.profile && (
                  <p className="py-1 px-1 flex">
                    {WalletData.profile.comments}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
