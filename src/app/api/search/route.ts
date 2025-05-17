import { type NextRequest } from 'next/server'
import { Filter, FilterSchema } from '../../helpers/schema';
import { stablecoinMints } from '../../helpers/constants';
import { LRUCache } from 'lru-cache'
import { Connection, clusterApiUrl, PublicKey, ParsedTransactionWithMeta, ParsedInstruction, PartiallyDecodedInstruction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as Filters from "../../helpers/schema";
import { getAccount, getMint } from "@solana/spl-token";
// import { applyFilters, fetchTransactionsAndApplyFilters } from '../../helpers/filtering';

const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_API_KEY}`, "confirmed");


const cache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 10, // cache for 10 minutes
});

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const addresses = JSON.parse(decodeURIComponent(searchParams.get('addresses')))

    if (!addresses) {
        return new Response(JSON.stringify({ error: 'Addresses parameter is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let results = [];
    for (const address of addresses) {
        results.push(await fetchTransactionsAndApplyFilters({
            account: address,
            types: ['TokenTransfer', 'SOLTransfer'],
        } as Filter));
    }


    console.log('Results: ', results);

    return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function getCachedAccountInfo(accountAddress: string): Promise<TokenAccount> {
  const key = `account:${accountAddress}`;
  if (cache.has(key)) return cache.get(key);

  const accountInfo = await getAccount(connection, new PublicKey(accountAddress));
  cache.set(key, accountInfo);
  return accountInfo;
}

export async function getCachedMintInfo(mintAddress: string): Promise<Mint> {
  const key = `mint:${mintAddress}`;
  if (cache.has(key)) return cache.get(key);

  const mintInfo = await getMint(connection, new PublicKey(mintAddress));
  cache.set(key, mintInfo);
  return mintInfo;
}

async function getTransactionsForAddress(address: string): Promise<ParsedTransactionWithMeta[]> {

    const publicKey = new PublicKey(address);

    // Step 1: Get signatures for the address
    const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 5, // Adjust the limit as needed
    });

    console.log("Signatures:", signatures);

    // Step 2: Get transaction details for each signature
    const transactions = [];
    for (const signatureInfo of signatures) {
        const tx = await connection.getParsedTransaction(signatureInfo.signature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        });
        transactions.push(tx);
    }

    return transactions as ParsedTransactionWithMeta[];
}

// let txs: ParsedTransactionWithMeta[];

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
    memo?: string;
    fee?: number;
}

export async function applyFilters(filter: Filters.Filter): Promise<Entry[]> {
    const signatures = await connection.getSignaturesForAddress(new PublicKey(filter.account), {
        limit: 5, // Adjust the limit as needed
    });

    console.log("Signatures:", signatures);

    const txTargetNum = filter.txNum || 10;
    const typeFilter = filter.types
    const timeRangeFilter = filter.timeRange
    const status = filter.status || 'successful';
    const account = filter.account;
    const tokenFilter = filter.tokenFilter;
    const memoFilter = filter.memo;
    const feeFilter = filter.feeFilter;
    let instructionCountFilter = filter.instructionCountFilter;

    let foundEntriesNum = 0;
    let foundEntries: Entry[] = [];

    // let filteredTxs: [] = [];
    // let noTxsLeft = false;
    for (let i = 0; i < signatures.length && foundEntriesNum < txTargetNum; i++) {
        const tx = await connection.getParsedTransaction(signatures[i].signature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        });
        // console.log(`\nChecking transaction #${i}`);
        if (feeFilter) {
            if (tx.meta?.fee !== null && (feeFilter.feeGreaterThan !== null && tx.meta?.fee < feeFilter.feeGreaterThan || (feeFilter.feeLessThan !== null && tx.meta.fee > feeFilter.feeLessThan))) continue;

            let entry = {
                signature: tx.transaction.signatures[0],
                time: tx.blockTime ?? 0,
                action: "FEE",
                from: "",
                to: "",
                amount: 0,
                token: "",
                fee: tx.meta?.fee || 0
            }

            foundEntries.push(entry);
            foundEntriesNum++;
            continue;
        }

        for (const instruction of tx.transaction.message.instructions) {
            let entry: Entry | null = null;
            if (typeFilter) {
                entry = await checkTypeFilterAndReturnEntry(typeFilter, tx, instruction, account);
                if (!entry) continue;
            }
            if (timeRangeFilter) {
                if (tx.blockTime && (timeRangeFilter.start !== null && tx.blockTime < timeRangeFilter.start || (timeRangeFilter.end !== null && tx.blockTime > timeRangeFilter.end))) continue;
            }
            if (tokenFilter) {
                let matchedFilter = false;
                for (const token of tokenFilter) {
                    // if (entry === null) continue;
                    if (token.tokenAddress !== entry?.token) continue;
                    if (token.amountLessThan !== null && entry.amount >= token.amountLessThan) continue;
                    if (token.amountGreaterThan !== null && entry.amount <= token.amountGreaterThan) {
                        continue
                    };
                    if (token.direction !== null && token.direction !== 'sent' && token.direction !== 'received') continue;
                    if (token.direction === 'sent' && entry.from !== account) continue;
                    if (token.direction === 'received' && entry.to !== account) continue;

                    matchedFilter = true;
                }

                if (!matchedFilter) continue;
            }
            if (memoFilter) {
                if (instruction.program === "spl-memo") {
                    let memo: string = instruction.parsed;
                    if (memo.toLowerCase().includes(memoFilter.toLowerCase())) {
                        entry = {
                            signature: tx.transaction.signatures[0],
                            time: tx.blockTime ?? 0,
                            action: "MEMO",
                            from: "",
                            to: "",
                            amount: 0,
                            token: "",
                            memo: memo
                        }
                    }
                }
            }
            if (entry) {
                foundEntries.push(entry);
                foundEntriesNum++;
            }

        }

        for (const innerIx of tx.meta?.innerInstructions || []) {
            let entry: Entry | null = null;
            for (const instruction of innerIx.instructions) {
                if (typeFilter) {
                    entry = await checkTypeFilterAndReturnEntry(typeFilter, tx, instruction, account);
                    if (!entry) continue;
                }
                if (timeRangeFilter) {
                    if (tx.blockTime && (timeRangeFilter.start !== null && tx.blockTime < timeRangeFilter.start || (timeRangeFilter.end !== null && tx.blockTime > timeRangeFilter.end))) continue;
                }
                if (tokenFilter) {
                    let matchedFilter = false;
                    for (const token of tokenFilter) {
                        // if (entry === null) continue;
                        if (token.tokenAddress !== entry?.token) continue;
                        if (token.amountLessThan !== null && entry.amount >= token.amountLessThan) continue;
                        if (token.amountGreaterThan !== null && entry.amount <= token.amountGreaterThan) {
                            continue
                        };
                        if (token.direction !== null && token.direction !== 'sent' && token.direction !== 'received') continue;
                        if (token.direction === 'sent' && entry.from !== account) continue;
                        if (token.direction === 'received' && entry.to !== account) continue;

                        matchedFilter = true;
                    }

                    if (!matchedFilter) continue;
                }
                if (memoFilter) {
                    if (instruction.program === "spl-memo") {
                        let memo: string = instruction.parsed;
                        if (memo.toLowerCase().includes(memoFilter.toLowerCase())) {
                            entry = {
                                signature: tx.transaction.signatures[0],
                                time: tx.blockTime ?? 0,
                                action: "MEMO",
                                from: "",
                                to: "",
                                amount: 0,
                                token: "",
                                memo: memo
                            }
                        }
                    }
                    if (entry) {
                        // console.log("TEST: ", entry, tokenFilter[0].amountGreaterThan);
                        foundEntries.push(entry);
                        foundEntriesNum++;
                    }
                }
            }
        }
    }
    return foundEntries;
}

export async function fetchTransactionsAndApplyFilters(filter: Filters.Filter): Promise<Entry[]> {
    // let txs = await getTransactionsForAddress(filter.account);
    return applyFilters(filter);
}

async function checkTypeFilterAndReturnEntry(typeFilter: string[], tx: ParsedTransactionWithMeta, instruction: ParsedInstruction | PartiallyDecodedInstruction, account: string): Promise<Entry | null> {
    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_API_KEY}`, "confirmed");

    let entry: Entry | null = null
    for (const type of typeFilter) {
        switch (type) {
            case 'TokenTransfer': {
                if ('parsed' in instruction && instruction.programId.toString() == "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" && (instruction.parsed.type == "transfer" || instruction.parsed.type == "transferChecked")) {
                    let mint = instruction.parsed.info?.mint;
                    let source = instruction.parsed.info?.source;
                    let dest = instruction.parsed.info?.destination;
                    let authority = instruction.parsed.info?.authority;
                    let tokenAmount = instruction.parsed.info?.tokenAmount;
                    let sourcePk = new PublicKey(source);
                    let destPk = new PublicKey(dest);
                    let sourceOwner: string = "";
                    let destOwner: string = "";
                    let decimals: number | null = null;

                    try {
                        let sourceTokenAccount = await getCachedAccountInfo(sourcePk);
                        sourceOwner = sourceTokenAccount.owner.toBase58();
                        mint = sourceTokenAccount.mint;
                    } catch (e) {
                        try {
                            let destTokenAccount = await getCachedAccountInfo(destPk);
                            destOwner = destTokenAccount.owner.toBase58();
                            mint = destTokenAccount.mint;
                        } catch (e) {
                            console.log("Error getting mint address");
                        }
                    }

                    try {
                        let destTokenAccount = await getCachedAccountInfo(destPk);
                        destOwner = destTokenAccount.owner.toBase58();
                    } catch (e) {
                        // console.log("Error getting mint address");
                    }

                    if (sourceOwner !== account && authority !== account && destOwner !== account) continue

                    if (mint && !decimals) {
                        let mintAccount = await getCachedMintInfo(new PublicKey(mint));
                        decimals = mintAccount.decimals;
                    }

                    entry = {
                        signature: tx.transaction.signatures[0],
                        time: tx.blockTime ?? 0,
                        action: "TOKEN TRANSFER",
                        from: sourceOwner,
                        to: destOwner,
                        fromTokenAccount: instruction.parsed.info.source,
                        toTokenAccount: instruction.parsed.info.destination,
                        amount: instruction.parsed.info?.tokenAmount?.uiAmount ?? Number(instruction.parsed.info.amount) / Math.pow(10, decimals ?? 0),
                        decimals: decimals ?? undefined,
                        token: mint.toString()
                    }

                    // console.log(`\Entry #${foundEntriesNum} sig: ${tx.transaction.signatures[0]}:`);
                    // foundEntries.push(entry);
                    // foundEntriesNum++;
                    // console.dir(instruction, { depth: null });
                }
                break;
            }
            case 'SOLTransfer': {
                if (instruction.programId.toString() == "11111111111111111111111111111111" && 'parsed' in instruction && instruction.parsed.type == "transfer") {
                    // console.log(`\nTransaction #${foundEntriesNum} sig: ${tx.transaction.signatures[0]}:`);
                    // filteredTxs.push(tx);

                    let source = instruction.parsed.info.source;
                    let dest = instruction.parsed.info.destination;

                    if (source !== account && dest !== account) continue

                    entry = {
                        signature: tx.transaction.signatures[0],
                        time: tx.blockTime ?? 0,
                        action: "SOL TRANSFER",
                        from: instruction.parsed.info.source,
                        to: instruction.parsed.info.destination,
                        fromTokenAccount: "/",
                        toTokenAccount: "/",
                        amount: instruction.parsed.info.lamports,
                        decimals: 9,
                        token: "NATIVE_SOL"
                    }

                    // foundEntriesNum++;
                    // console.dir(instruction, { depth: null });
                }
            }
        }
    }

    return entry;
}

// console.log(`\nFiltered entries:`);
// console.dir(foundEntries, { depth: null });
// export { };