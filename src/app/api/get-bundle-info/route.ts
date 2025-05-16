import { NextRequest } from 'next/server'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_API_KEY}`

interface AssetResponse {
    jsonrpc: '2.0'
    id: string
    result: {
        content: {
            metadata: {
                symbol?: string
                name?: string
            }
        }
    }
}

export async function GET(request: NextRequest) {
    const qs = request.nextUrl.searchParams
    const addrsParam = qs.get('addresses')
    if (!addrsParam) {
        return new Response(JSON.stringify({ error: 'Addresses parameter is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const addresses: string[] = JSON.parse(decodeURIComponent(addrsParam))
    const conn = new Connection(HELIUS_RPC, 'confirmed')

    let totalSol = 0n
    const tokens: Record<string, { amount: bigint; decimals: number }> = {}

    // 1) gather balances
    for (const addr of addresses) {
        const pk = new PublicKey(addr)
        totalSol += BigInt(await conn.getBalance(pk))

        const { value } = await conn.getParsedTokenAccountsByOwner(pk, { programId: TOKEN_PROGRAM_ID })
        for (const { account } of value) {
            const info = account.data.parsed.info
            const mint = info.mint
            const amt = BigInt(info.tokenAmount.amount)
            const dec = info.tokenAmount.decimals
            if (!tokens[mint]) tokens[mint] = { amount: 0n, decimals: dec }
            tokens[mint].amount += amt
        }
    }

    // 2) for each mint, fetch its DAS metadata in parallel
    const allTokens = await Promise.all(
        Object.entries(tokens).map(async ([mint, { amount, decimals }]) => {
            const body = {
                jsonrpc: '2.0',
                id: mint,
                method: 'getAsset',
                params: { id: mint },
            }
            let symbol: string | null = null
            let name: string | null = null

            try {
                const res = (await fetch(HELIUS_RPC, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                }).then((r) => r.json())) as AssetResponse

                symbol = res.result.content.metadata.symbol ?? null
                name = res.result.content.metadata.name ?? null
            } catch {
                // swallow errors—leave symbol/name null
            }


            return {
                mint,
                amount: amount.toString(),
                decimals,
                symbol,
                name,
            }
        })
    )

    const tokensArr = allTokens.filter(
        (t) => t.symbol !== null && t.name !== null
    )


    // 3) (optional) SOL price
    let solPrice: number | null = null
    try {
        const p = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        solPrice = (await p.json()).solana.usd
    } catch { }

    return new Response(
        JSON.stringify({
            totalSol: Number(totalSol) / LAMPORTS_PER_SOL,
            solPrice,
            tokens: tokensArr,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
}
