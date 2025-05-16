import { NextRequest } from 'next/server'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const addressesParam = searchParams.get('addresses');

    if (!addressesParam) {
        return new Response(JSON.stringify({ error: 'Addresses parameter is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const addresses: string[] = JSON.parse(decodeURIComponent(addressesParam));
    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_API_KEY}`, "confirmed");

    let totalSol = 0;
    let tokens: Record<string, any> = {};

    for (const addr of addresses) {
        const pubkey = new PublicKey(addr);

        // Get SOL balance
        const solBalance = await connection.getBalance(pubkey);
        totalSol += solBalance;

        // Get token accounts
        const resp = await connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID });
        resp.value.forEach((accountInfo) => {
            const mint = accountInfo.account.data["parsed"]["info"]["mint"];
            const decimals = accountInfo.account.data["parsed"]["info"]["tokenAmount"]["decimals"];
            const amount = accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"];
            if (!tokens[mint]) {
                tokens[mint] = { amount: BigInt(0), decimals };
            }
            tokens[mint].amount += BigInt(amount);
        });
    }

    let solPrice = null;
    try {
        const priceResp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const priceData = await priceResp.json();
        solPrice = priceData.solana.usd;
    } catch (e) {
        solPrice = null;
    }


    // Format tokens for output
    const tokensArr = Object.entries(tokens).map(([mint, { amount, decimals }]) => ({
        mint,
        amount: amount.toString(),
        decimals,
    }));

    return new Response(JSON.stringify({
        totalSol: totalSol / LAMPORTS_PER_SOL,
        tokens: tokensArr,
        solPrice,
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

    // ...existing code...
}