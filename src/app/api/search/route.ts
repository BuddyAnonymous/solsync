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

    // const transactionFilter = JSON.parse(filter) as Filter;

    // if (transactionFilter.account === 'THIS_ADDRESS') {
    //     transactionFilter.account = addresses;
    // }

    // if (transactionFilter.tokenFilter) {
    //     if (transactionFilter.tokenFilter[0].tokenAddress === 'ALL_STABLECOINS') {
    //         let amountLessThan = transactionFilter.tokenFilter[0].amountLessThan;
    //         let amountGreaterThan = transactionFilter.tokenFilter[0].amountGreaterThan;
    //         let direction = transactionFilter.tokenFilter[0].direction;

    //         transactionFilter.tokenFilter = Object.values(stablecoinMints).map(tokenAddress => ({
    //             tokenAddress,
    //             amountLessThan: amountLessThan,
    //             amountGreaterThan: amountGreaterThan,
    //             direction: direction,
    //         }));
    //     }
    // }

    // for (const token of transactionFilter.tokenFilter || []) {
    //     if (token.tokenAddress === 'NATIVE_SOL') {
    //         if (token.amountGreaterThan !== null) {
    //             token.amountGreaterThan *= LAMPORTS_PER_SOL;
    //         }
    //         if (token.amountLessThan !== null) {
    //             token.amountLessThan *= LAMPORTS_PER_SOL;
    //         }
    //     }
    // }

    // if (transactionFilter.txNum === null) {
    //     transactionFilter.txNum = 5;
    // }

    // console.log('Filter: ', transactionFilter);

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

const mockResults = [
    {
        signature: '5iBvUHPzabvJ69XwspRbDZGiarTA6Vi6nG5AtRKnSzPmKnQ65mvKctmH6WGw7voiTayg7naDq5SxMQ28sbKTRXWP',
        time: 1737732293,
        action: 'TRANSFER',
        from: 'D5xJKhw44fy6SECd2JBVyMKFUTrifwvMTwiCPzDJdBQS',
        to: 'B3HaLQyCbwQ5Kmwvj7PxS2no8sTB2yyijg4GA4dbbXMk',
        fromTokenAccount: 'FV5FNE3iM342q9ekdPhXzx6tejQN588KGsHiFRcoJ5zc',
        toTokenAccount: 'CTLrjNFMUBGgfM55d3K8hV22HEE6uQpkeoXqyeNxbTM5',
        amount: '5000000000',
        decimals: 6,
        token: 'kH6hPcpdJqeMAATYU7W4rzqZuzYTkYr6QqGYTLkpump'
    },
    {
        signature: '2m5fo2eG9neCNkhTDXwLi4UwQNRAezTVYUfTcooXJsniuhiuHJWCxd6Nm26sbnE3RgyF7w33WWhjd9mm8rrEvWoE',
        time: 1736823624,
        action: 'TRANSFER',
        from: 'B3HaLQyCbwQ5Kmwvj7PxS2no8sTB2yyijg4GA4dbbXMk',
        to: '4SBpUJwh88EzRZJnxgYVi9yDc79oUYCNAhJdirRsfJX1',
        fromTokenAccount: 'G7Zef75oLzmkvR5xi2vgoszNPvPpGchmooUS8tpkMTxR',
        toTokenAccount: 'Ff94GhJ99c4pc2J4HvZbxmSz4k4A6g1XhikJCtQcAyeK',
        amount: '7268307',
        decimals: 6,
        token: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    },
    {
        signature: 'T88Jp7CzpUKaP3CCh56dDZx85gojhyGzgJGKnnNrbqCchUVBj5sSphsj7uQMYs6kLKjGDt2p1muq4Txi9qdFMUg',
        time: 1736823596,
        action: 'TRANSFER',
        from: '',
        to: 'BQ72nSv9f3PRyRKCBnHLVrerrv37CYTHm5h3s9VSGQDV',
        fromTokenAccount: '8cYyX2E4qmDMVVXZuBG2XMyynRgq7fRFTUVSVCsatnbQ',
        toTokenAccount: '8ctcHN52LY21FEipCjr1MVWtoZa1irJQTPyAaTj72h7S',
        amount: '40000000',
        decimals: 9,
        token: 'So11111111111111111111111111111111111111112'
    },
    {
        signature: 'T88Jp7CzpUKaP3CCh56dDZx85gojhyGzgJGKnnNrbqCchUVBj5sSphsj7uQMYs6kLKjGDt2p1muq4Txi9qdFMUg',
        time: 1736823596,
        action: 'TRANSFER',
        from: 'BQ72nSv9f3PRyRKCBnHLVrerrv37CYTHm5h3s9VSGQDV',
        to: 'B3HaLQyCbwQ5Kmwvj7PxS2no8sTB2yyijg4GA4dbbXMk',
        fromTokenAccount: '7u7cD7NxcZEuzRCBaYo8uVpotRdqZwez47vvuwzCov43',
        toTokenAccount: 'G7Zef75oLzmkvR5xi2vgoszNPvPpGchmooUS8tpkMTxR',
        amount: '7268307',
        decimals: 6,
        token: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    },
    {
        signature: '5FSyfSPrvKRR6XbaHqz3UAybxRAUSFxzsFB9UoZPmQQ3R4JJyfsxxvpHSa9pUwCwdBEZ3XJUbyBh9S9nhwrGAxya',
        time: 1736823359,
        action: 'TRANSFER',
        from: 'B3HaLQyCbwQ5Kmwvj7PxS2no8sTB2yyijg4GA4dbbXMk',
        to: '9tBgehN4wsnpxi2vhDhudGd8jmKYqgQtoE9Fj8Q9BV16',
        fromTokenAccount: 'omES6jFvRoENWR1KgrRebVyq9scEGkyDTETVyNvrX1h',
        toTokenAccount: 'JAHFsYKP91g77h3jEbei12jbx6hLgZGTE59hrUZzjPKr',
        amount: '100000000',
        decimals: 6,
        token: 'STREAMribRwybYpMmSYoCsQUdr6MZNXEqHgm7p1gu9M'
    },
    {
        signature: '5FSyfSPrvKRR6XbaHqz3UAybxRAUSFxzsFB9UoZPmQQ3R4JJyfsxxvpHSa9pUwCwdBEZ3XJUbyBh9S9nhwrGAxya',
        time: 1736823359,
        action: 'TRANSFER',
        from: '',
        to: '25mYnjJ2MXHZH6NvTTdA63JvjgRVcuiaj6MRiEQNs1Dq',
        fromTokenAccount: '3TfVRkiuTSt7ora4a38jqxzdXcU5HLNdhrBiiLYqanYR',
        toTokenAccount: '7dSiEK9yWTxxSWpMkjHpY968nJ4Xj4aNgK3sgM23nCeL',
        amount: '357995',
        decimals: 9,
        token: 'So11111111111111111111111111111111111111112'
    },
    {
        signature: '38pHCL95GcGJowevBZ9B6dbRrDPtFu8R4irBhikoJ3oGYcBAy3uwoivaL7j9nmQTWVLa2xzfbsArQjTtg1ktM3Y8',
        time: 1734568431,
        action: 'TRANSFER',
        from: 'B3HaLQyCbwQ5Kmwvj7PxS2no8sTB2yyijg4GA4dbbXMk',
        to: 'EZwBgDqoWdxE4Yy8giuYH82P8GmvxryzWCbWKUWU8HLH',
        fromTokenAccount: '781KAnzgqQzscECAhVpxetMcF9BYpQiT6LppWStN66RU',
        toTokenAccount: 'B8xaPRfWS8Ufrd1F9p1PuXyEbSZJNwJPR3LEKtwFLFT8',
        amount: '854316173',
        decimals: 6,
        token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
    },
    {
        signature: '5JQVVaVZMu1PyzZazwP45vQqY8u4AQ9uj11oNwDNWNw3PbmjRkWL5dn6otxhbmgfaz8h49LngYeHgxEGDHw8jH9r',
        time: 1734455350,
        action: 'TRANSFER',
        from: 'B3HaLQyCbwQ5Kmwvj7PxS2no8sTB2yyijg4GA4dbbXMk',
        to: '3LoAYHuSd7Gh8d7RTFnhvYtiTiefdZ5ByamU42vkzd76',
        fromTokenAccount: 'GnaH5QqCLfxWdnAT734Vv3LBNpsVisNiY4V9JaCESvvM',
        toTokenAccount: '8pzTZozaSATj5XgpJNRScqphrPqnXAufgouzuUvNRjZJ',
        amount: '27840000000',
        decimals: 6,
        token: '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv'
    },
    {
        signature: '5JQVVaVZMu1PyzZazwP45vQqY8u4AQ9uj11oNwDNWNw3PbmjRkWL5dn6otxhbmgfaz8h49LngYeHgxEGDHw8jH9r',
        time: 1734455350,
        action: 'TRANSFER',
        from: '3LoAYHuSd7Gh8d7RTFnhvYtiTiefdZ5ByamU42vkzd76',
        to: 'B3HaLQyCbwQ5Kmwvj7PxS2no8sTB2yyijg4GA4dbbXMk',
        fromTokenAccount: 'A5LZUZCbcsTxU2oszHASHpe4Cbo44TTHNy7aan9P7fyA',
        toTokenAccount: '781KAnzgqQzscECAhVpxetMcF9BYpQiT6LppWStN66RU',
        amount: '854316173',
        decimals: 6,
        token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
    },
    {
        signature: '8Vmn8p5hCS2bmcTnLsv7U7K9JxuMd27dtvuphFgST8fU7jDjy2qjkETxmnDbGTXC8KjNSFwYrsg9StzcNinrkPe',
        time: 1734453912,
        action: 'TRANSFER',
        from: 'BsL9EiaD1FLhvE1z27s2vSLPCFU9yUY8bphscbunnRag',
        to: 'B3HaLQyCbwQ5Kmwvj7PxS2no8sTB2yyijg4GA4dbbXMk',
        fromTokenAccount: '4hbDR2LT5iGGC3mXcbEsRybjWL8Pz3uEZ6YnBLeV91Ae',
        toTokenAccount: 'omES6jFvRoENWR1KgrRebVyq9scEGkyDTETVyNvrX1h',
        amount: '100000000',
        decimals: 6,
        token: 'STREAMribRwybYpMmSYoCsQUdr6MZNXEqHgm7p1gu9M'
    }
];

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
    // Step 1: Get signatures for the address
    const signatures = await connection.getSignaturesForAddress(new PublicKey(filter.account), {
        limit: 5, // Adjust the limit as needed
    });

    console.log("Signatures:", signatures);

    // Step 2: Get transaction details for each signature
    // const transactions = [];
    // for (const signatureInfo of signatures) {
    //     const tx = await connection.getParsedTransaction(signatureInfo.signature, {
    //         commitment: "confirmed",
    //         maxSupportedTransactionVersion: 0,
    //     });
    //     transactions.push(tx);
    // }

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