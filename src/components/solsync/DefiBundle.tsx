import React from "react";

const DeFiBundle: React.FC = () => {
  return (
    <div
      id="bundle-2"
      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500 transition-all duration-200"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">DeFi Wallets</h3>
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
            3 addresses
          </span>
          <span className="inline-flex items-center ml-4">
            <i className="fa-solid fa-clock mr-1"></i>
            Updated 1 week ago
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs bg-gray-700 rounded-lg px-3 py-2">
            <i className="fa-solid fa-wallet text-green-400 mr-2"></i>
            <span className="text-gray-300 truncate">9YQs5RxLPJHdM8M5...pV2zR</span>
          </div>
          <div className="flex items-center text-xs bg-gray-700 rounded-lg px-3 py-2">
            <i className="fa-solid fa-wallet text-green-400 mr-2"></i>
            <span className="text-gray-300 truncate">5fRkKNrjx18XnJ8K...xCBGP</span>
          </div>
          <div className="flex items-center text-xs bg-gray-700 rounded-lg px-3 py-2">
            <i className="fa-solid fa-wallet text-green-400 mr-2"></i>
            <span className="text-gray-300 truncate">DvS3pFnmS1tUhPr2...qZwLK</span>
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

export default DeFiBundle;