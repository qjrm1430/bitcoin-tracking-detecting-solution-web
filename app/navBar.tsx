import Link from "next/link";
import { BellIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Search from "@/app/search";

export default function NavBar() {
  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-full px-2 sm:px-3 lg:px-7">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0 relative flex items-center px-2 lg:px-0">
            <Link href="/">
              <img className="h-8 w-auto" src="/logo.svg" alt="BTDS" />
            </Link>
          </div>
          <div>
            <Search />
          </div>
          <div className="ml-4 lg:block">
            <div className="flex items-center">
              <button
                type="button"
                className="relative flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span className="absolute -inset-1.5" />
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          {/* <div className="lg:block ml-4">
            <div className="flex items-center">
              <button
                type="button"
                className="relative flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span className="absolute -inset-1.5" />
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </nav>
  );
}
