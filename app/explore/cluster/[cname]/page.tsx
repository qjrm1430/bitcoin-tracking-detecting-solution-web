"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import BitcoinInfo from "@/types/bitcoin_info";

export default function Cluster({ params }: { params: { cname: string } }) {
  const [ClsData, setClsData] = useState<BitcoinInfo.Cluster | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<BitcoinInfo.Cluster>(
          `/cpp/info/cluster?target=${params.cname}`,
        );

        setClsData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        // router.push(`/error404`);
      }
    };
    fetchData();
  }, [params]);
  return (
    <div className="overflow-y-auto mx-auto h-full w-full max-w-full flex-grow lg:flex">
      <div className="min-w-0 flex-1 xl:flex pb-4 pl-6 pr-6 pt-4">
        {ClsData && (
          <div key={ClsData._id} className="lg:min-w-0 lg:flex-1">
            <div className="pb-4 pl-6 pr-6 pt-6 border-t-0">
              <div className="flex items-center">
                <h1 className="flex-1 font-black text-3xl mb-4">
                  Cluster Extended View
                </h1>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-base font-semibold leading-7 mr-0.5">
                  ID :
                </h3>
                <p className="max-w-2xl leading-7 font-light text-gray-700">
                  {ClsData._id}
                </p>
                <button
                  type="button"
                  className="rounded-full bg-gray-800 p-1 text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PlusIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {ClsData.profile && "flags" in ClsData.profile && (
                <div className="grid grid-cols-2 gap-0">
                  <div className="flex col-span-1 text-base leading-7">
                    <h3 className="font-medium">Flags : &nbsp;</h3>
                    <div className="max-w-2xl flex gap-2">
                      {ClsData.profile.flags.map((flag) => (
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
                      {ClsData.profile.entities.map((entity) => (
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
            <div className="px-2 bg-[#ECECEC] mr-6 py-2 overflow-hidden rounded-md border-2 border-[#707070] shadow">
              <ul role="list" className="divide-y divide-gray-300">
                <li className="py-3 px-1 flex justify-between">
                  <h1 className="font-black text-2xl">Info</h1>
                </li>
                <li className="py-2 px-1 flex justify-between">
                  <span className=" font-semibold">Name</span>
                  <span>{ClsData.name}</span>
                </li>
                <li className="py-2 px-1 flex justify-between">
                  <span className=" font-semibold">Wallet Name</span>
                  <span>{ClsData.n_wallet}</span>
                </li>

                <li className="py-2 px-1 flex justify-between">
                  <span className="font-semibold">Wallet Address</span>
                  <span>
                    {ClsData.wallet
                      ? ClsData.wallet.map((wallet) => wallet.addr)
                      : "N/A"}
                  </span>
                </li>
                <li className="py-2 px-1 flex justify-between">
                  <span className="font-semibold">Wallet Balance</span>
                  <span>
                    {ClsData.wallet
                      ? ClsData.wallet.map((wallet) => wallet.balance)
                      : "N/A"}
                  </span>
                </li>
                <li className="py-2 px-1  flex justify-between">
                  <span className=" font-semibold">Create Date</span>
                  <span>{ClsData.date_created}</span>
                </li>
                <li className="py-2 px-1 flex justify-between">
                  <span className=" font-semibold">Constructor</span>
                  <span>{ClsData.constructor}</span>
                </li>
                <li className="py-2 px-1 flex justify-between">
                  <span className=" font-semibold">Last Modified Date</span>
                  <span>{ClsData.date_last_modified}</span>
                </li>
                <li className="py-2 px-1 flex justify-between">
                  <span className=" font-semibold">Last Modifier</span>
                  <span>{ClsData.last_modifier}</span>
                </li>
              </ul>
            </div>
            {/* Comment */}
            <div className="p-2 bg-[#ECECEC] overflow-hidden rounded-md border-2 border-[#707070] shadow mr-6 mt-2">
              <h1 className="py-3 px-1 flex font-black text-2xl">Comment</h1>
              {ClsData.profile && "flags" in ClsData.profile && (
                <p className="py-2 px-1 flex">{ClsData.profile.comments}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
