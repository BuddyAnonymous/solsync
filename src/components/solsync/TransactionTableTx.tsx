import React from "react";

const TransactionTable = () => {
  return (
    <div id="transactions-table" className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left">Signature</th>
              <th className="px-6 py-4 text-left">Block</th>
              <th className="px-6 py-4 text-left">Time</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Amount</th>
              <th className="px-6 py-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            <tr className="hover:bg-gray-750">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <span className="text-purple-400">2TxP...8Zkp</span>
                  <i className="fa-regular fa-copy ml-2 text-gray-400 cursor-pointer"></i>
                </div>
              </td>
              <td className="px-6 py-4">219,126,345</td>
              <td className="px-6 py-4">2 mins ago</td>
              <td className="px-6 py-4">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">Transfer</span>
              </td>
              <td className="px-6 py-4">12.5 SOL</td>
              <td className="px-6 py-4">
                <span className="text-green-400">
                  <i className="fa-solid fa-check-circle mr-1"></i>Success
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-750">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <span className="text-purple-400">7Kvm...9Pqx</span>
                  <i className="fa-regular fa-copy ml-2 text-gray-400 cursor-pointer"></i>
                </div>
              </td>
              <td className="px-6 py-4">219,126,344</td>
              <td className="px-6 py-4">5 mins ago</td>
              <td className="px-6 py-4">
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">Swap</span>
              </td>
              <td className="px-6 py-4">5.2 SOL</td>
              <td className="px-6 py-4">
                <span className="text-green-400">
                  <i className="fa-solid fa-check-circle mr-1"></i>Success
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-750">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <span className="text-purple-400">9Hxn...2Wqr</span>
                  <i className="fa-regular fa-copy ml-2 text-gray-400 cursor-pointer"></i>
                </div>
              </td>
              <td className="px-6 py-4">219,126,343</td>
              <td className="px-6 py-4">10 mins ago</td>
              <td className="px-6 py-4">
                <span className="bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full">NFT</span>
              </td>
              <td className="px-6 py-4">1.8 SOL</td>
              <td className="px-6 py-4">
                <span className="text-red-400">
                  <i className="fa-solid fa-times-circle mr-1"></i>Failed
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div id="pagination" className="px-6 py-4 bg-gray-750 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing 1 to 10 of 234 transactions
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 rounded bg-gray-700 text-gray-400 hover:bg-gray-600">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="px-3 py-1 rounded bg-purple-600 text-white">1</button>
            <button className="px-3 py-1 rounded bg-gray-700 text-gray-400 hover:bg-gray-600">2</button>
            <button className="px-3 py-1 rounded bg-gray-700 text-gray-400 hover:bg-gray-600">3</button>
            <button className="px-3 py-1 rounded bg-gray-700 text-gray-400 hover:bg-gray-600">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;