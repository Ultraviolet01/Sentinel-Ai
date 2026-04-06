import { sanitizeAddress } from "./src/lib/utils.js";
import { fetchTokenData } from "./src/lib/data-fetcher.js";

async function testParsing() {
  const cases = [
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", // BNB
    "https://dexscreener.com/bsc/0x58f876857a02d6762e0101bb5c46a8c1ed44dc16", // DexScreener WBNB/BUSD
    "https://four.meme/token/0x55d398326f99059ff775485246999027b3197955", // USDT on Four.Meme
  ];

  for (const c of cases) {
    const address = sanitizeAddress(c);
    console.log(`INPUT: ${c} -> ADDR: ${address}`);
    if (address.startsWith('0x')) {
        try {
            const data = await fetchTokenData(address);
            console.log(`  SUCCESS: Found ${data.name} (${data.symbol})`);
        } catch (e) {
            console.error(`  FAILURE: ${e.message}`);
        }
    } else {
        console.error(`  INVALID ADDR`);
    }
  }
}

testParsing();
