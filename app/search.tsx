"use client";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Search() {
  // 검색어(query) 및 검색 결과(results)의 상태를 선언합니다.
  const [query, setQuery] = useState<string>("");
  const router = useRouter();
  const isBitcoinAddress = (address: string) => {
    const legacyAndP2SHRegex = /^[123][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const bech32Regex = /^bc1[a-z0-9]{6,}$/;

    return legacyAndP2SHRegex.test(address) || bech32Regex.test(address);
  };

  // 검색 버튼을 클릭하면 실행되는 함수입니다.
  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      // 사용자가 입력한 검색어를 사용하여 API 요청을 보냅니다.
      if (query.length === 64) {
        router.push(`/explore/transaction/${query}`);
      } else if (isBitcoinAddress(query)) {
        router.push(`/explore/wallet/${query}`);
      } else {
        router.push(`/explore/cluster/${query}`);
      }
    } catch (error) {
      // API 요청 중 오류가 발생하면 오류를 콘솔에 기록합니다.
      console.error("Error fetching search results:", error);
    }
  };
  return (
    <div className="block sm:w-[400px] md:w-[600px]">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <form className="relative" onSubmit={handleSearch}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <input
          id="search"
          name="search"
          className="block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-10 pr-3 text-gray-300 placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
          placeholder="Search Transactions, Wallet Address, Cluster"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
        />
      </form>
    </div>
  );
}
