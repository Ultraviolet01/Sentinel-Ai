import { createPublicClient, http, isAddress, parseAbi } from 'viem';
import { bsc } from 'viem/chains';

const RPC_URL = import.meta.env.VITE_BSC_RPC || 'https://bsc-dataseed.binance.org';

const publicClient = createPublicClient({
  chain: bsc,
  transport: http(RPC_URL)
});

const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)'
]);

export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  priceUsd?: string;
  volume24h?: string;
  liquidityUsd?: string;
  fdv?: string;
  pairAddress?: string;
  socials?: { type: string; url: string }[];
  description?: string;
  isFourMeme?: boolean;
}

export async function fetchTokenData(input: string): Promise<TokenMetadata> {
  let address = '';

  // 1. Parse Input
  if (isAddress(input)) {
    address = input;
  } else if (input.includes('four.meme/token/')) {
    const parts = input.split('/');
    address = parts[parts.length - 1].split('?')[0];
  } else {
    // Search by name via DexScreener
    const searchRes = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(input)}`);
    const searchData = await searchRes.json();
    if (searchData.pairs && searchData.pairs.length > 0) {
      // Filter for BSC pairs
      const bscPair = searchData.pairs.find((p: any) => p.chainId === 'bsc');
      if (bscPair) address = bscPair.baseToken.address;
    }
  }

  if (!isAddress(address)) {
    throw new Error('Invalid token address or name not found.');
  }

  // 2. Fetch Multi-source Data
  const [onChainData, dexData] = await Promise.all([
    fetchOnChainMetadata(address),
    fetchDexScreenerData(address)
  ]);

  return {
    ...onChainData,
    ...dexData,
    address,
    isFourMeme: input.includes('four.meme') || dexData?.isFourMeme
  };
}

async function fetchOnChainMetadata(address: `0x${string}`) {
  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      publicClient.readContract({ address, abi: ERC20_ABI, functionName: 'name' }),
      publicClient.readContract({ address, abi: ERC20_ABI, functionName: 'symbol' }),
      publicClient.readContract({ address, abi: ERC20_ABI, functionName: 'decimals' }),
      publicClient.readContract({ address, abi: ERC20_ABI, functionName: 'totalSupply' })
    ]);

    return {
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
      totalSupply: (totalSupply as bigint).toString()
    };
  } catch (err) {
    console.error('Error fetching on-chain metadata:', err);
    return { name: 'Unknown', symbol: '???', decimals: 18, totalSupply: '0' };
  }
}

async function fetchDexScreenerData(address: string) {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    const data = await res.json();
    
    if (!data.pairs || data.pairs.length === 0) return {};

    // Get the highest liquidity BSC pair
    const bscPairs = data.pairs.filter((p: any) => p.chainId === 'bsc');
    if (bscPairs.length === 0) return {};

    const mainPair = bscPairs.sort((a: any, b: any) => parseFloat(b.liquidity?.usd || '0') - parseFloat(a.liquidity?.usd || '0'))[0];

    return {
      priceUsd: mainPair.priceUsd,
      volume24h: mainPair.volume?.h24,
      liquidityUsd: mainPair.liquidity?.usd,
      fdv: mainPair.fdv,
      pairAddress: mainPair.pairAddress,
      socials: mainPair.info?.socials || [],
      description: mainPair.info?.description || '',
      isFourMeme: !!mainPair.labels?.includes('four.meme')
    };
  } catch (err) {
    console.error('Error fetching DexScreener data:', err);
    return {};
  }
}
