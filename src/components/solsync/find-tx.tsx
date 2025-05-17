"use client";
// FindTx.tsx
import React, { useEffect, useState } from 'react';
import "./find-tx.css";
import { useWalletUi } from '@wallet-ui/react';
import { useSearchParams } from 'next/navigation'
import { ellipsify } from '@/lib/utils'


interface Entry {
    signature: string;
    slot?: number;
    time: number;
    action: string;
    from: string;
    fromTokenAccount?: string;
    to: string;
    toTokenAccount?: string;
    amount: number;
    token: string;
    decimals?: number;
}

const stablecoinMints: { [key: string]: string } = {
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
};

const mintToSymbol: { [key: string]: string } = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
};

export function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
}

export async function getTokenSymbol(mint: string): Promise<string> {
    if (mintToSymbol[mint] !== undefined) {
        return mintToSymbol[mint];
    } else {
        const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_API_KEY}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "id": "test",
                "method": "getAsset",
                "params": {
                    "id": mint
                }
            }),
        });

        // Correctly await the response before calling .json()
        const data = await response.json();

        console.log(data);

        // Ensure response structure is valid before accessing properties
        return data?.result?.content?.metadata?.symbol || 'UNKNOWN';
    }
}

export function timeAgo(timestamp) {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp * 1000) / 1000); // Convert Unix timestamp to seconds
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30); // Approximate months as 30 days
    const diffInYears = Math.floor(diffInDays / 365); // Approximate years as 365 days

    if (diffInYears > 0) {
        return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
    } else if (diffInMonths > 0) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    } else if (diffInDays > 0) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
        return `${diffInSeconds} second${diffInSeconds > 1 ? 's' : ''} ago`;
    }
}

function downloadCSV(entries) {

    if (!entries.length) return;

    const headers = Object.keys(entries[0]).join(",");

    const csvRows = entries.map(entry =>
        Object.values(entry).map(value => (value !== undefined ? `${value}` : "")).join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...csvRows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "entries.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const FindTx = () => {
    const [tokenSymbols, setTokenSymbols] = useState<{ [key: string]: string }>({});
    const [transactions, setTransactions] = useState<Entry[]>([]);
    interface BundleInfo {
        totalSol?: number;
        solPrice?: number;
        tokens: { mint: string; amount: number; decimals: number; symbol: string; name: string }[];
    }

    const [bundleInfo, setBundleInfo] = useState<BundleInfo>({ tokens: [] });
    const [filter, setFilter] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [addresses, setAddresses] = useState<string[]>([]);
    const { account } = useWalletUi();
    const searchParams = useSearchParams();
    const [bundle, setBundle] = useState<Bundle | null>(null);
    interface Bundle {
        name: string;
        addresses: string[];
    }
    // Fetch search results whenever the query changes
    const fetchSearchResults = async () => {
        try {
            const res = await fetch(`api/search?addresses=${addresses}`);

            if (!res.ok) {
                const errorData = await res.json();
                return;
            }

            const data = await res.json();
            setTransactions(data.results || []);
        } catch (err) {

        }
    };

    useEffect(() => {
        const raw = sessionStorage.getItem("myAppBundle");
        if (!raw) return;

        try {
            setBundle(JSON.parse(raw));
        } catch (err) {
            console.error("Parsing error:", err);
        }
    }, []);

    useEffect(() => {
        if (bundle !== null) {
            const url = `http://localhost:3000/api/search?addresses=${encodeURIComponent(JSON.stringify(bundle?.addresses))}`;
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    setTransactions(data.results.flat())
                })
                .catch(err => console.error(err));

        }
    }, [bundle]);

    useEffect(() => {
        if (bundle !== null) {
            const url = `http://localhost:3000/api/get-bundle-info?addresses=${encodeURIComponent(JSON.stringify(bundle?.addresses))}`;
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    setBundleInfo(data)
                })
                .catch(err => console.error(err));

        }
    }, [bundle]);

    useEffect(() => {
        const bundleStr = searchParams.get('bundle')
        if (bundleStr) {
            try {
                setBundle(JSON.parse(decodeURIComponent(bundleStr)))
            } catch (e) {
                console.error('Error parsing bundle:', e)
            }
        }
    }, [searchParams])

    // Preload all token symbols
    useEffect(() => {
        const fetchAllTokenSymbols = async () => {
            const symbolMap: { [mint: string]: string } = {};

            for (const tx of transactions) {
                if (!symbolMap[tx.token]) {
                    const symbol = await getTokenSymbol(tx.token);
                    symbolMap[tx.token] = symbol;
                }
            }

            setTokenSymbols(symbolMap);
            setIsLoading(false);
        };

        fetchAllTokenSymbols();
    }, [transactions]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* <!-- Header --> */}
            <header id="header" className="border-b border-gray-800 bg-gray-900">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <i className="fa-brands fa-solana text-purple-500 text-2xl"></i>
                            <span className="text-xl font-bold">Solana Explorer</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {/* <!-- Breadcrumb --> */}
                <div id="breadcrumb" className="mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Bundles</span>
                        <i className="fa-solid fa-chevron-right text-gray-600"></i>
                        <span className="text-gray-400">{bundle?.name}</span>
                    </div>
                </div>
                <div id="net-worth-section" className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* <!-- Total Balance Card --> */}
                        <div className="bg-gray-800 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Total Balance</h3>
                                <i className="fa-solid fa-wallet text-purple-500"></i>
                            </div>
                            <div className="flex items-baseline">
                                <span className="text-3xl font-bold">{bundleInfo.totalSol}</span>
                                <span className="ml-2 text-purple-400">SOL</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <div className="text-sm text-green-400">
                                    <i className="fa-solid fa-arrow-trend-up mr-1"></i>
                                    +2.5% from last week
                                </div>
                                <div className="text-sm text-gray-400">
                                    ≈ {(bundleInfo.solPrice ?? 0) * (bundleInfo.totalSol || 0)} USD
                                </div>
                            </div>
                        </div>

                        {/* <!-- Token List Card --> */}
                        <div className="bg-gray-800 p-6 rounded-xl md:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Owned Tokens</h3>
                                <button className="text-sm text-purple-400 hover:text-purple-300">View All</button>
                            </div>
                            <div className="space-y-4 scrollbar max-h-64 overflow-y-auto">
                                {bundleInfo.tokens.map((token, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                <i className="fa-solid fa-coins text-white"></i>
                                            </div>
                                            <div className="ml-3">
                                                <div className="font-medium">{token.symbol}</div>
                                                <div className="text-sm text-gray-400">{token.name}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{(token.amount / 10 ** token.decimals).toLocaleString()}</div>
                                            {/* <div className="text-sm text-gray-400">${(token.amount * (bundleInfo.solPrice ?? 0)).toLocaleString()}</div> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* <!-- Search and Filters --> */}
                <div id="search-section" className="mb-8">
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <input type="text" placeholder="Search by transaction signature, address or block" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:border-purple-500" onChange={(e) => setQuery(e.target.value)}></input>
                                    <i className="fa-solid fa-search absolute left-3 top-4 text-gray-400"></i>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <select className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500" onChange={(e) => setFilter(e.target.value)}>
                                    <option value="">All Types</option>
                                    <option>Transfer</option>
                                    <option>Swap</option>
                                    <option>NFT</option>
                                    <option value="SOL TRANSFER">Sol Transfer</option>
                                    <option value="TOKEN TRANSFER">Token Transfer</option>
                                </select>
                                <button className="bg-gray-700 hover:bg-gray-600 px-4 rounded-lg">
                                    <i className="fa-solid fa-filter"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <!-- Transactions Table --> */}
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
                                {transactions && transactions?.map((transaction, index) => (transaction.action === filter || filter === "") && (
                                    <tr key={index} className="hover:bg-gray-750 relative">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center tooltip-signature">
                                                <a href={`https://www.solscan.io/tx/${transaction.signature}`} className="text-purple-400">{ellipsify(transaction.signature)}</a>
                                                <i className="fa-regular fa-copy ml-2 text-gray-400 cursor-pointer" onClick={() => copyToClipboard(transaction.signature)}></i>
                                                <div className="tooltip">{transaction.signature}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{timeAgo(transaction.time)}</td>
                                        <td className={"px-6 py-4"}>
                                            <span className={transaction.action === "SOL TRANSFER" ? "bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full" : transaction.action === "TOKEN TRANSFER" ? "bg-green-500/20 text-green-400 px-3 py-1 rounded-full" : "bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full"}>{transaction.action}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center tooltip-from">
                                                <a href={`https://www.solscan.io/account/${transaction.from}`} className="text-purple-400">{ellipsify(transaction.from)}</a>
                                                <i className="fa-regular fa-copy ml-2 text-gray-400 cursor-pointer" onClick={() => copyToClipboard(transaction.from)}></i>
                                                <div className="tooltip">{transaction.from}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center tooltip-to">
                                                <a href={`https://www.solscan.io/account/${transaction.to}`} className="text-purple-400">{ellipsify(transaction.to)}</a>
                                                <i className="fa-regular fa-copy ml-2 text-gray-400 cursor-pointer" onClick={() => copyToClipboard(transaction.to)}></i>
                                                <div className="tooltip">{transaction.to}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{transaction.amount
                                            ? transaction.action === "TOKEN TRANSFER"
                                                ? `${transaction.amount}`
                                                : `${(transaction.amount / Math.pow(10, transaction.decimals ?? 0)).toFixed(7)}`
                                            : "N/A"}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center tooltip-token">
                                                <a href={`https://www.solscan.io/account/${transaction.token}`} className="text-purple-400">{isLoading ? "Loading..." : (transaction.action === "SOL TRANSFER" ? "SOL" : tokenSymbols[transaction.token] || "Unknown")}</a>
                                                <i className="fa-regular fa-copy ml-2 text-gray-400 cursor-pointer" onClick={() => copyToClipboard(transaction.token)}></i>
                                                <div className="tooltip">{transaction.token}</div>
                                            </div>
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
            </main>
        </div>
    );
};

export default FindTx;