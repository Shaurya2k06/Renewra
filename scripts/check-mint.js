import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const PROGRAM_ID = new PublicKey('5nU2nHv2Pw9bWWL2BsTotX6mDaP1fTj1EZ7JMXAe6T5Z');

// Derive REIT mint PDA
const [reitMint, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from('reit_mint')],
  PROGRAM_ID
);

console.log('Derived REIT Mint PDA:', reitMint.toBase58());
console.log('Bump:', bump);

// Check if it exists
const accountInfo = await connection.getAccountInfo(reitMint);
if (accountInfo) {
  console.log('✅ Mint account exists');
  console.log('Owner:', accountInfo.owner.toBase58());
  console.log('Data length:', accountInfo.data.length);
  
  try {
    const mintInfo = await getMint(connection, reitMint);
    console.log('Mint Authority:', mintInfo.mintAuthority?.toBase58());
    console.log('Supply:', mintInfo.supply.toString());
    console.log('Decimals:', mintInfo.decimals);
  } catch (e) {
    console.log('Could not parse as mint:', e.message);
  }
} else {
  console.log('❌ Mint account does not exist - program may not be fully initialized');
}
