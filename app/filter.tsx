"use client";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const people = [
  { id: 1, name: "P2PKH" },
  { id: 2, name: "P2SH" },
  { id: 3, name: "P2WPKH" },
  { id: 4, name: "P2TR" },
];

export default function SideBar() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  return (
    <div className="flex bg-gray-50 pr-4 flex-shrink-0 border-l border-gray-200">
      <form id="find">
        <div className="pl-6 mr-4 w-80">
          <div className="pt-6">
            <label
              htmlFor="spent-amount"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Spent Amount
            </label>
          </div>
          <div className="mt-2 grid grid-cols-9 mr-5">
            <input
              type="text"
              name="spent-amount-start"
              id="spent-amount-start"
              autoComplete="family-name"
              className="block w-full h-6 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-6 col-span-3"
            />
            <p className="text-center">~</p>
            <input
              type="text"
              name="spent-amount-fin"
              id="spent-amount-fin"
              autoComplete="family-name"
              className="block w-full h-6 rounded-md border-0  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs col-span-3"
            />
            <div>
              <select
                id="location"
                name="location"
                className="py-0.5 block text-xs min-w-full h-6 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 col-span-3 ml-3"
                defaultValue="Canada"
              >
                <option>BTD</option>
                <option>KRW</option>
                <option>USD</option>
              </select>
            </div>
          </div>
        </div>
        <div className="pl-6 mr-4 w-80">
          <div className="pt-1 ">
            <label
              htmlFor="spent-amount"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Received Amount
            </label>
          </div>
          <div className="mt-2 grid grid-cols-9 mr-5">
            <input
              type="text"
              name="spent-amount-start"
              id="spent-amount-start"
              autoComplete="family-name"
              className="block w-full h-6 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-6 col-span-3"
            />
            <p className=" text-center">~</p>
            <input
              type="text"
              name="spent-amount-fin"
              id="spent-amount-fin"
              autoComplete="family-name"
              className="block w-full h-6 rounded-md border-0  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs col-span-3"
            />
            <div>
              <select
                id="location"
                name="location"
                className="py-0.5 block text-xs min-w-full h-6 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 col-span-3 ml-3"
                defaultValue="Canada"
              >
                <option>BTD</option>
                <option>KRW</option>
                <option>USD</option>
              </select>
            </div>
          </div>
        </div>
        <div className="pl-6 mr-4 w-80">
          <div className="pt-1">
            <label
              htmlFor="spent-amount"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Fee
            </label>
          </div>
          <div className="mt-2 grid grid-cols-9 mr-5">
            <input
              type="text"
              name="spent-amount-start"
              id="spent-amount-start"
              autoComplete="family-name"
              className="block w-full h-6 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-6 col-span-3"
            />
            <p className=" text-center">~</p>
            <input
              type="text"
              name="spent-amount-fin"
              id="spent-amount-fin"
              autoComplete="family-name"
              className="block w-full h-6 rounded-md border-0  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs col-span-3"
            />
            <div>
              <select
                id="currency-unit"
                name="currency-unit"
                className="py-0.5 block text-xs min-w-full h-6 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 col-span-3 ml-3"
                defaultValue="BTD"
              >
                <option>BTD</option>
                <option>KRW</option>
                <option>USD</option>
              </select>
            </div>
          </div>
        </div>
        <div className="pl-6 mr-4 w-80">
          <div className="pt-1 ">
            <label
              htmlFor="spent-amount"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Transaction Count
            </label>
          </div>
          <div className="mt-2 grid mr-5">
            <input
              type="text"
              name="spent-amount-start"
              id="spent-amount-start"
              autoComplete="family-name"
              className="block w-full h-6 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-6"
            />
          </div>
        </div>

        <fieldset className="pl-6 mr-4 w-80">
          <legend className="text-sm leading-6 text-gray-900 pt-1">
            Wallet Address Format
          </legend>
          <div className="flex flex-wrap">
            {people.map((person, personIdx) => (
              <div key={personIdx} className="flex items-center mr-4 py-1">
                <div className="flex-1 min-w-0 text-xs leading-6">
                  <label
                    htmlFor={`person-${person.id}`}
                    className="select-none font-medium text-gray-900"
                  >
                    {person.name}
                  </label>
                </div>
                <div className="ml-1 flex h-6 items-center">
                  <input
                    id={`person-${person.id}`}
                    name={`person-${person.id}`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="pl-6 mr-4 w-80 mt-1">
          <label
            htmlFor="spent-amount"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Transaction Create Date
          </label>
          <div className="mt-2 grid grid-cols-6 mr-5 items-center">
            <div className="col-span-2 flex items-center">
              <DatePicker
                className="py-0.5 block text-xs w-24 h-6 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>
            <p className="text-center col-span-2">~</p>
            <div className="col-span-2 flex items-center">
              <DatePicker
                className="py-0.5 block text-xs w-24 h-6 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
              />
            </div>
          </div>
        </div>
        <div className="pl-6 mr-4 w-80 mt-3">
          <button
            type="button"
            className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Submit
          </button>
          <button
            type="button"
            className="ml-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
