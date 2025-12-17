/**
 * Renewra Test Utilities
 * 
 * Scripts for end-to-end testing on devnet:
 * - Airdrop SOL to wallet
 * - Get devnet USDC (using faucet or mock)
 * - Check account balances
 * - Verify program state
 */

import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  getAccount,
  getMint,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const DEVNET_RPC = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('5nU2nHv2Pw9bWWL2BsTotX6mDaP1fTj1EZ7JMXAe6T5Z');

// Devnet USDC (Circle's official devnet USDC)
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// PDAs (derived from program)
const [GOVERNANCE_PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('governance')],
  PROGRAM_ID
);
const [NAV_ORACLE_PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('nav_oracle')],
  PROGRAM_ID
);
const [REIT_MINT_PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('reit_mint')],
  PROGRAM_ID
);
const [TREASURY_PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('treasury')],
  PROGRAM_ID
);
const [REDEMPTION_QUEUE_PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('redemption_queue')],
  PROGRAM_ID
);

const connection = new Connection(DEVNET_RPC, 'confirmed');

// ============================================================================
// Utility Functions
// ============================================================================

function loadKeypair(filepath) {
  const absolutePath = path.resolve(filepath);
  const secretKey = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
  return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

async function getBalance(pubkey) {
  const balance = await connection.getBalance(pubkey);
  return balance / LAMPORTS_PER_SOL;
}

async function getTokenBalance(owner, mint) {
  try {
    const ata = await getAssociatedTokenAddress(mint, owner);
    const account = await getAccount(connection, ata);
    return Number(account.amount);
  } catch (e) {
    return 0;
  }
}

// ============================================================================
// Test Functions
// ============================================================================

async function airdropSol(pubkey, amount = 2) {
  console.log(`\n💰 Airdropping ${amount} SOL to ${pubkey.toBase58()}...`);
  
  try {
    const signature = await connection.requestAirdrop(
      pubkey,
      amount * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(signature);
    console.log(` Airdrop successful! Signature: ${signature}`);
    
    const balance = await getBalance(pubkey);
    console.log(`   New balance: ${balance} SOL`);
    return signature;
  } catch (e) {
    console.error(` Airdrop failed: ${e.message}`);
    console.log('   Note: Devnet airdrops are rate-limited. Try again in a few seconds.');
    return null;
  }
}

async function checkProgramState() {
  console.log('\n📊 Checking Renewra Program State...\n');
  
  console.log('Program ID:', PROGRAM_ID.toBase58());
  console.log('');
  
  // Check PDAs
  console.log('PDAs:');
  console.log('  Governance:', GOVERNANCE_PDA.toBase58());
  console.log('  NAV Oracle:', NAV_ORACLE_PDA.toBase58());
  console.log('  REIT Mint:', REIT_MINT_PDA.toBase58());
  console.log('  Treasury:', TREASURY_PDA.toBase58());
  console.log('  Redemption Queue:', REDEMPTION_QUEUE_PDA.toBase58());
  console.log('');
  
  // Check NAV Oracle
  try {
    const navAccount = await connection.getAccountInfo(NAV_ORACLE_PDA);
    if (navAccount) {
      const data = navAccount.data;
      // Skip 8-byte discriminator
      const navCents = Number(data.readBigUInt64LE(8));
      const previousNav = Number(data.readBigUInt64LE(16));
      const timestamp = Number(data.readBigInt64LE(24));
      
      console.log('NAV Oracle State:');
      console.log(`  Current NAV: $${(navCents / 100).toFixed(2)} (${navCents} cents)`);
      console.log(`  Previous NAV: $${(previousNav / 100).toFixed(2)}`);
      console.log(`  Last Updated: ${new Date(timestamp * 1000).toLocaleString()}`);
    } else {
      console.log(' NAV Oracle account not found - program may not be initialized');
    }
  } catch (e) {
    console.log(' Error reading NAV Oracle:', e.message);
  }
  console.log('');
  
  // Check REIT Mint Supply
  try {
    const mintInfo = await getMint(connection, REIT_MINT_PDA);
    const supply = Number(mintInfo.supply) / 1e6;
    console.log('REIT Token:');
    console.log(`  Total Supply: ${supply.toLocaleString()} REI`);
    console.log(`  Decimals: ${mintInfo.decimals}`);
  } catch (e) {
    console.log(' Error reading REIT Mint:', e.message);
  }
  console.log('');
  
  // Check Treasury
  try {
    const treasuryAta = await getAssociatedTokenAddress(USDC_MINT, TREASURY_PDA, true);
    const treasuryAccount = await getAccount(connection, treasuryAta);
    const balance = Number(treasuryAccount.amount) / 1e6;
    console.log('Treasury:');
    console.log(`  USDC Balance: $${balance.toLocaleString()}`);
  } catch (e) {
    console.log('Treasury: No USDC balance (ATA may not exist yet)');
  }
  console.log('');
  
  // Check Governance
  try {
    const govAccount = await connection.getAccountInfo(GOVERNANCE_PDA);
    if (govAccount) {
      const data = govAccount.data;
      // Skip 8-byte discriminator
      const admin = new PublicKey(data.slice(8, 40));
      const oracle = new PublicKey(data.slice(40, 72));
      const mintFee = data.readUInt16LE(72);
      const redeemFee = data.readUInt16LE(74);
      const mgmtFee = data.readUInt16LE(76);
      
      console.log('Governance:');
      console.log(`  Admin: ${admin.toBase58()}`);
      console.log(`  Oracle: ${oracle.toBase58()}`);
      console.log(`  Mint Fee: ${mintFee / 100}%`);
      console.log(`  Redeem Fee: ${redeemFee / 100}%`);
      console.log(`  Mgmt Fee: ${mgmtFee / 100}%`);
    }
  } catch (e) {
    console.log(' Error reading Governance:', e.message);
  }
}

async function checkUserBalances(userPubkey) {
  console.log(`\n👤 Checking balances for ${userPubkey.toBase58()}...\n`);
  
  const solBalance = await getBalance(userPubkey);
  console.log(`SOL Balance: ${solBalance.toFixed(4)} SOL`);
  
  const usdcBalance = await getTokenBalance(userPubkey, USDC_MINT);
  console.log(`USDC Balance: ${(usdcBalance / 1e6).toFixed(2)} USDC`);
  
  const reiBalance = await getTokenBalance(userPubkey, REIT_MINT_PDA);
  console.log(`REI Balance: ${(reiBalance / 1e6).toFixed(6)} REI`);
  
  return { solBalance, usdcBalance, reiBalance };
}

async function printTestingChecklist() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    RENEWRA INTEGRATION TESTING CHECKLIST                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

📋 PRE-TEST SETUP:
   □ Program deployed to devnet (ID: ${PROGRAM_ID.toBase58()})
   □ Program initialized (governance, nav_oracle, reit_mint, treasury)
   □ Oracle service running (submitting NAV updates)
   □ Frontend running (npm run dev)
   □ Phantom/Solflare wallet connected to Devnet

💰 FUND YOUR WALLET:
   □ Airdrop 2 SOL for transaction fees
   □ Get devnet USDC from: https://spl-token-faucet.com/?token-name=USDC
   □ Or use Circle's devnet faucet: https://faucet.circle.com/

🧪 TEST SCENARIO 1: Subscribe Flow
   □ Open http://localhost:5175
   □ Verify NAV displays correctly
   □ Connect wallet
   □ Navigate to /subscribe
   □ Enter USDC amount (e.g., 100)
   □ Verify calculation: tokens = (USDC * 0.995) / NAV
   □ Click "Subscribe"
   □ Sign transaction in wallet
   □ Verify transaction confirmed
   □ Check dashboard - REI balance updated
   □ Check treasury - USDC deposited

🧪 TEST SCENARIO 2: NAV Oracle Updates
   □ Start oracle service: cd oracle && python oracle.py
   □ Wait for NAV update (or trigger manually)
   □ Refresh frontend
   □ Verify NAV value updated
   □ Check NAV history chart

🧪 TEST SCENARIO 3: Redemption Request
   □ Navigate to /redeem
   □ Verify REI balance shown
   □ Enter amount to redeem
   □ Click "Request Redemption"
   □ Sign transaction
   □ Verify request appears in queue
   □ Status should be "Pending"

📹 DEMO RECORDING:
   □ Open Loom or screen recorder
   □ Walk through all pages
   □ Show wallet connection
   □ Demonstrate subscribe flow
   □ Show dashboard
   □ Show redemption request
   □ Upload to GitHub

  `);
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('\n🌿 Renewra Test Utilities\n');
  
  switch (command) {
    case 'check':
      await checkProgramState();
      break;
      
    case 'airdrop':
      const pubkeyStr = args[1];
      if (!pubkeyStr) {
        console.log('Usage: node test-utils.js airdrop <pubkey>');
        console.log('Example: node test-utils.js airdrop 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
        break;
      }
      await airdropSol(new PublicKey(pubkeyStr));
      break;
      
    case 'balance':
      const userKey = args[1];
      if (!userKey) {
        console.log('Usage: node test-utils.js balance <pubkey>');
        break;
      }
      await checkUserBalances(new PublicKey(userKey));
      break;
      
    case 'checklist':
      await printTestingChecklist();
      break;
      
    default:
      console.log('Available commands:');
      console.log('  check     - Check program state on devnet');
      console.log('  airdrop   - Airdrop SOL to a wallet');
      console.log('  balance   - Check user balances (SOL, USDC, REI)');
      console.log('  checklist - Print testing checklist');
      console.log('');
      console.log('Examples:');
      console.log('  node test-utils.js check');
      console.log('  node test-utils.js airdrop <your-wallet-pubkey>');
      console.log('  node test-utils.js balance <your-wallet-pubkey>');
      console.log('  node test-utils.js checklist');
  }
}

main().catch(console.error);
