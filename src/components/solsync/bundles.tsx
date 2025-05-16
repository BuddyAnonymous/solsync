"use client";

import { useState, FC, MouseEvent, FormEvent, useRef, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import BundleComp from './Bundle';
import DeFiBundle from './DefiBundle';
import NFTBundle from './NFTBundles';
import TransactionTable from './TransactionTable';
import { Address } from 'gill';

type Bundle = {
  name: string;
  addresses: string[];
}

const BundlesPage: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [bundleName, setBundleName] = useState('');
  const [addresses, setAddresses] = useState<string[]>([]); // Start with one input
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editing, setEditing] = useState<Bundle | null>(null);
  const [userBundles, setUserBundles] = useState<Bundle[]>(() => {
  if (typeof window === 'undefined') return []; // for SSR safety
  try {
    const saved = localStorage.getItem('userBundles');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});

  const mouseDownOnBackdrop = useRef(false);

  useEffect(() => {
  localStorage.setItem('userBundles', JSON.stringify(userBundles));
}, [userBundles]);

  useEffect(() => {
    if (editing) {
      setBundleName(editing.name);
      setAddresses(editing.addresses);
    }
  }, [editing]);

  const handleAddClick = () => {
    setAddresses([...addresses, '']); // Add empty input
  };

  const handleInputChange = (index, value) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setEditing(null); // Reset editing state when closing the modal
    setIsModalOpen(false);
    setBundleName(''); // Reset text when closing the modal
    setAddresses([]); // Reset addresses when closing the modal
  }

  const handleCreateBundleSubmit = (e: FormEvent<HTMLFormElement>, bundleAddresses: string[]) => {
    e.preventDefault();
    const newBundle: Bundle = {
      name: bundleName,
      addresses: addresses,
    };
    setUserBundles((prevBundles) => [...prevBundles, newBundle]);
    closeModal();
  };

  const handleEditBundle = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedBundle: Bundle = {
    ...editing,
    name: bundleName,
    addresses: addresses,
  };

  setUserBundles(prevBundles =>
    prevBundles.map(bundle =>
      bundle.name === editing!.name && editing!.addresses === bundle.addresses ? updatedBundle : bundle
    )
  );
  closeModal();
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownOnBackdrop.current = e.target === e.currentTarget;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseDownOnBackdrop.current && e.target === e.currentTarget) {
      closeModal();
    }
    mouseDownOnBackdrop.current = false; // Reset
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <Head>
        {/* Google Font */}
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin></link>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Sora:wght@100..800&display=swap" rel="stylesheet"></link>
      </Head>

      {/* Scripts */}
      <Script src="https://cdn.jsdelivr.net/npm/apexcharts" strategy="beforeInteractive" />
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script id="fontawesome-config" strategy="beforeInteractive">
        {`window.FontAwesomeConfig = { autoReplaceSvg: 'nest' };`}
      </Script>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        strategy="beforeInteractive"
      />

      {/* Global Styles */}
      <style jsx global>{`
        * { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { display: none; }
        .highlighted-section { outline: 2px solid #3F20FB; background-color: rgba(63,32,251,0.1); }
        .edit-button { position: absolute; z-index: 1000; }
      `}</style>

      <div className="h-full text-base-content bg-gray-900 text-gray-200">
        {/* Header */}

        {/* Sidebar */}
        <div className="fixed left-0 top-12 h-full w-16 bg-gray-900 border-r border-gray-800">
          <div className="flex flex-col items-center py-4">
            {['house', 'chart-simple', 'layer-group', 'user', 'wallet'].map((icon) => (
              <span
                key={icon}
                className={`p-3 mb-2 cursor-pointer ${icon === 'layer-group' ? 'bg-blue-900 rounded-lg text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <i className={`fa-solid fa-${icon}`} />
              </span>
            ))}
            <div className="mt-auto">
              <span className="p-3 text-gray-400 hover:text-gray-200 cursor-pointer">
                <i className="fa-solid fa-gear" />
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="min-h-screen mx-auto px-6 py-6 ml-16">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-400 mb-6">
            {['Bundles'].map((crumb, idx) => (
              <span
                key={crumb}
                className={`${idx < 2 ? 'hover:text-blue-400 cursor-pointer mr-2' : 'text-gray-300'} flex items-center`}
              >
                {crumb}
                {idx < 2 && <i className="fa-solid fa-chevron-right mx-2 text-xs" />}
              </span>
            ))}
          </nav>

          {/* Page Title & Create Button */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Bundles</h1>
            <button onClick={openModal} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center">
              <i className="fa-solid fa-plus mr-2" /> Create Bundle
            </button>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Your Bundles</h2>
              <div className="relative w-64">
                <input type="text" onChange={handleSearchInputChange} placeholder="Search bundles" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></input>
                <i className="fa-solid fa-search absolute right-3 top-2.5 text-gray-400"></i>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {userBundles.map((bundle, index) => (
              bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) && (
                <BundleComp key={index} bundleName={bundle.name} bundleAddresses={bundle.addresses} setUserBundles={setUserBundles} userBundles={userBundles} setEditing={setEditing} editing={editing} />)
            ))}
          </div>
          <div id="transactions-section" className="mt-10">
            <h2 className="text-xl font-medium mb-4">Recent Transactions</h2>
            <TransactionTable />
          </div>

          {/* TODO: Stats, Bundles List, Transactions Table */}
        </main>

        {/* Modal */}
        {(isModalOpen || editing !== null) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">{editing ? "Edit Bundle": "Create New Bundle"}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <i className="fa-solid fa-xmark text-xl" />
                </button>
              </div>
              <form onSubmit={editing ? handleEditBundle : handleCreateBundleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2" htmlFor="bundleName">
                    Bundle Name
                  </label>
                  {editing ? <input
                    id="bundleName"
                    name="bundleName"
                    type="text"
                    placeholder="Enter bundle name"
                    value={bundleName}
                    onChange={(e) => setBundleName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />:
                  <input
                    id="bundleName"
                    name="bundleName"
                    type="text"
                    placeholder="Enter bundle name"
                    onChange={(e) => setBundleName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
}
                </div>
                <div className="w-full">
                  {/* Scrollable container for inputs */}
                  <div
                    className="space-y-2 scrollable"
                    style={{
                      maxHeight: '300px',
                    }}
                  >
                    {addresses.map((value, index) => (
                      <input
                        key={index}
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        placeholder={`Address ${index + 1}`}
                        className="border p-2 w-full"
                      />
                    ))}
                  </div>

                  {/* Button stays outside of scroll area */}
                  <button
                    type="button"
                    onClick={handleAddClick}
                    className="mt-2 text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <i className="fa-solid fa-plus mr-2" /> Add Another Address
                  </button>
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                    {editing ? "Confirm Edit" : "Create Bundle"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 border-t border-gray-800 bg-gray-900 py-6 ml-16">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <i className="fa-solid fa-cube text-white" />
              </div>
              <span className="text-gray-300 font-medium">SolTracker</span>
            </div>
            <div className="flex space-x-6 mb-4 md:mb-0">
              {['twitter', 'discord', 'github'].map((brand) => (
                <span key={brand} className="text-gray-400 hover:text-gray-200 cursor-pointer">
                  <i className={`fa-brands fa-${brand}`} />
                </span>
              ))}
              <span className="text-gray-400 hover:text-gray-200 cursor-pointer">
                <i className="fa-solid fa-circle-info" />
              </span>
            </div>
            <div className="text-sm text-gray-500">© 2025 SolTracker. All rights reserved. Solana is a registered trademark.</div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BundlesPage;
