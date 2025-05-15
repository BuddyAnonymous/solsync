import React from "react";
import { useState } from "react";

interface BundleComp {
  bundleName: string;
  bundleAddresses: string[];
  setUserBundles: React.Dispatch<React.SetStateAction<any>>;
  userBundles: any;
}

const BundleComp: React.FC<BundleComp> = ({ bundleName, bundleAddresses, setUserBundles, userBundles }) => {
const [editing, setEditing] = useState(false);
const removeBundle = () => {
  // Find the index of the first matching bundle
  const indexToRemove = userBundles.findIndex(
    (bundle: any) => bundle.name === bundleName && bundle.addresses === bundleAddresses
  );

  // If a match is found, create a new array excluding that item
  if (indexToRemove !== -1) {
    const updatedBundles = [
      ...userBundles.slice(0, indexToRemove),  // Items before the found index
      ...userBundles.slice(indexToRemove + 1), // Items after the found index
    ];
    setUserBundles(updatedBundles);
  }
};
const handleEditBundle = () => {
  setEditing(true);
}

  return (
    <div
      id="bundle-1"
      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500 transition-all duration-200"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">{bundleName}</h3>
          <div className="flex">
            <button onClick={handleEditBundle} className="text-gray-400 hover:text-blue-400 mr-2">
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
            <button onClick={removeBundle} className="text-gray-400 hover:text-red-400">
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-400 mb-4">
          <span className="inline-flex items-center">
            <i className="fa-solid fa-address-card mr-1"></i>
            {bundleAddresses.length} addresses
          </span>
          <span className="inline-flex items-center ml-4">
            <i className="fa-solid fa-clock mr-1"></i>  
            Updated 2 days ago
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {bundleAddresses.slice(0, 2).map((address, index) => (
            <div key={index} className="flex items-center text-xs bg-gray-700 rounded-lg px-3 py-2">
              <i className="fa-solid fa-wallet text-purple-400 mr-2"></i>
              <span className="text-gray-300 truncate">{address}</span>
            </div>
          ))}
          {bundleAddresses.length > 2 && (
            <div className="flex items-center text-xs bg-gray-700 rounded-lg px-3 py-2">
              <i className="fa-solid fa-wallet text-purple-400 mr-2"></i>
              <span className="text-gray-300">+ {bundleAddresses.length - 2} more</span>
            </div>
          )}
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

export default BundleComp;