import React from "react";

const NFTBundle: React.FC = () => {
  return (
    <div
      id="bundle-3"
      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500 transition-all duration-200"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">NFT Collections</h3>
          <div className="flex">
            <button className="text-gray-400 hover:text-blue-400 mr-2">
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
            <button className="text-gray-400 hover:text-red-400">
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-400 mb-4">
          <span className="inline-flex items-center">
            <i className="fa-solid fa-address-card mr-1"></i>
            4 addresses
          </span>
          <span className="inline-flex items-center ml-4">
            <i className="fa-solid fa-clock mr-1"></i>
            Updated today
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs bg-gray-700 rounded-lg px-3 py-2">
            <i className="fa-solid fa-wallet text-orange-400 mr-2"></i>
            <span className="text-gray-300 truncate">3BxrPLHzTRdNQU2...Wn6rT</span>
          </div>
          <div className="flex items-center text-xs bg-gray-700 rounded-lg px-3 py-2">
            <i className="fa-solid fa-wallet text-orange-400 mr-2"></i>
            <span className="text-gray-300 truncate">8sJG4TE9yVmZ6P7...kWqJM</span>
          </div>
          <div className="flex items-center text-xs bg-gray-700 rounded-lg px-3 py-2">
            <i className="fa-solid fa-wallet text-orange-400 mr-2"></i>
            <span className="text-gray-300">+ 2 more</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-750 border-t border-gray-700 p-3">
        <span className="flex justify-center items-center text-blue-400 hover:text-blue-300 cursor-pointer">
          View Transactions <i className="fa-solid fa-arrow-right ml-2"></i>
        </span>
      </div>
    </div>
  );
};

export default NFTBundle;