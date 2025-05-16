import React from "react";

const TransactionTable = ({bundle}) => {
  return (
    <div id="transactions-table" className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left">Signature</th>
              <th className="px-6 py-4 text-left">Time</th>
              <th className="px-6 py-4 text-left">Action</th>
              <th className="px-6 py-4 text-left">From</th>
              <th className="px-6 py-4 text-left">To</th>
              <th className="px-6 py-4 text-left">Amount</th>
              <th className="px-6 py-4 text-left">Token</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {bundle && bundle.addresses?.map((address, index) => (
              <tr key={index} className="hover:bg-gray-750">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-purple-400">{address}</span>
                    <i className="fa-regular fa-copy ml-2 text-gray-400 cursor-pointer"></i>
                  </div>
                </td>
                <td className="px-6 py-4">219,126,346</td>
                <td className="px-6 py-4">1 min ago</td>
                <td className="px-6 py-4">
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">Transfer</span>
                </td>
                <td className="px-6 py-4">0.5 SOL</td>
                <td className="px-6 py-4">
                  <span className="text-green-400">
                    <i className="fa-solid fa-check-circle mr-1"></i>Success
                  </span>
                </td>
              </tr>
            ))}
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