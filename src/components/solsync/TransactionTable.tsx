import React from "react";

const TransactionTable = () => {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <i className="fa-solid fa-filter text-gray-400 mr-2" />
          <span className="text-sm">Filter by bundle:</span>
          <select className="ml-2 bg-gray-700 text-gray-300 rounded px-2 py-1 text-sm border border-gray-600">
            <option>All Bundles</option>
            <option>Main Portfolio</option>
            <option>DeFi Wallets</option>
            <option>NFT Collections</option>
          </select>
        </div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search transactions"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <i className="fa-solid fa-search absolute right-3 top-2 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-750">
              <th className="px-6 py-3 font-medium">Transaction Hash</th>
              <th className="px-6 py-3 font-medium">From</th>
              <th className="px-6 py-3 font-medium">To</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Time</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {[
              {
                hash: "5Vt2...a38f",
                from: "7Nw3...z3dP",
                to: "9YQs...pV2z",
                amount: "2.5 SOL",
                time: "10 May 2025, 12:34",
                status: "Confirmed",
              },
              {
                hash: "3Rh7...b29c",
                from: "HqFT...jKUm",
                to: "DvS3...qZwL",
                amount: "0.8 SOL",
                time: "9 May 2025, 16:05",
                status: "Confirmed",
              },
              {
                hash: "9Kj2...f47d",
                from: "3BxrP...Wn6r",
                to: "8sJG...kWqJ",
                amount: "1.2 SOL",
                time: "8 May 2025, 09:22",
                status: "Confirmed",
              },
            ].map((tx, index) => (
              <tr key={index} className="hover:bg-gray-750">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <i className="fa-solid fa-arrow-right-arrow-left text-blue-400 mr-2" />
                    <span className="text-blue-400 text-sm">{tx.hash}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{tx.from}</td>
                <td className="px-6 py-4 text-sm">{tx.to}</td>
                <td className="px-6 py-4 text-sm">{tx.amount}</td>
                <td className="px-6 py-4 text-sm">{tx.time}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-400">
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 flex justify-between items-center">
        <div className="text-sm text-gray-400">Showing 3 of 156 transactions</div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 rounded bg-gray-700 text-gray-300">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white">1</button>
          <button className="px-3 py-1 rounded bg-gray-700 text-gray-300">2</button>
          <button className="px-3 py-1 rounded bg-gray-700 text-gray-300">3</button>
          <button className="px-3 py-1 rounded bg-gray-700 text-gray-300">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;