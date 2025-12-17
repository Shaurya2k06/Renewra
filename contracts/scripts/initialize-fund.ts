/**
 * Initialize the Renewra Fund on devnet
 * 
 * This script initializes the Governance, NavOracle, and RedemptionQueue PDAs.
 * Run this once before starting the oracle service.
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Connection, SystemProgram } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

// Program ID from Anchor.toml
const PROGRAM_ID = new PublicKey("5nU2nHv2Pw9bWWL2BsTotX6mDaP1fTj1EZ7JMXAe6T5Z");

// PDA seeds
const GOVERNANCE_SEED = "governance";
const NAV_ORACLE_SEED = "nav_oracle";
const REDEMPTION_QUEUE_SEED = "redemption_queue";

async function main() {
    // Connect to devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    // Load the deployer keypair (same as program authority)
    const deployerPath = path.join(process.env.HOME!, ".config/solana/id.json");
    const deployerKeypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(deployerPath, "utf-8")))
    );
    console.log("Deployer:", deployerKeypair.publicKey.toBase58());
    
    // Load the oracle keypair (in parent directory)
    const oraclePath = path.join(__dirname, "..", "..", "oracle", "oracle-keypair.json");
    const oracleKeypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(oraclePath, "utf-8")))
    );
    console.log("Oracle:", oracleKeypair.publicKey.toBase58());
    
    // Derive PDAs
    const [governancePda, govBump] = PublicKey.findProgramAddressSync(
        [Buffer.from(GOVERNANCE_SEED)],
        PROGRAM_ID
    );
    console.log("Governance PDA:", governancePda.toBase58());
    
    const [navOraclePda, navBump] = PublicKey.findProgramAddressSync(
        [Buffer.from(NAV_ORACLE_SEED)],
        PROGRAM_ID
    );
    console.log("NAV Oracle PDA:", navOraclePda.toBase58());
    
    const [redemptionQueuePda, redeemBump] = PublicKey.findProgramAddressSync(
        [Buffer.from(REDEMPTION_QUEUE_SEED)],
        PROGRAM_ID
    );
    console.log("Redemption Queue PDA:", redemptionQueuePda.toBase58());
    
    // Create provider
    const wallet = new Wallet(deployerKeypair);
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    
    // Build initialize_fund instruction manually
    // Anchor discriminator for initialize_fund: sha256("global:initialize_fund")[0:8]
    const discriminator = Buffer.from([212, 42, 24, 245, 146, 141, 78, 198]);
    
    // Build the transaction
    const tx = new anchor.web3.Transaction();
    
    // InitializeFundParams:
    // oracle_signer: Pubkey (32 bytes)
    // management_fee_bps: u16 (2 bytes)
    // mint_fee_bps: u16 (2 bytes)
    // redemption_fee_bps: u16 (2 bytes)
    // initial_nav: u64 (8 bytes)
    const managementFee = 200; // 2%
    const mintFee = 50; // 0.5%
    const redeemFee = 100; // 1%
    const initialNav = BigInt(5000); // $50.00 = 5000 cents
    
    // Instruction data: discriminator (8) + params
    const data = Buffer.alloc(8 + 32 + 2 + 2 + 2 + 8);
    discriminator.copy(data, 0);
    oracleKeypair.publicKey.toBuffer().copy(data, 8); // oracle_signer pubkey
    data.writeUInt16LE(managementFee, 40);
    data.writeUInt16LE(mintFee, 42);
    data.writeUInt16LE(redeemFee, 44);
    data.writeBigUInt64LE(initialNav, 46);
    
    // Build instruction
    // Accounts: authority, governance, nav_oracle, redemption_queue, system_program
    const initializeIx = new anchor.web3.TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
            { pubkey: deployerKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: governancePda, isSigner: false, isWritable: true },
            { pubkey: navOraclePda, isSigner: false, isWritable: true },
            { pubkey: redemptionQueuePda, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data,
    });
    
    tx.add(initializeIx);
    
    // Check if already initialized
    const govAccount = await connection.getAccountInfo(governancePda);
    if (govAccount) {
        console.log("\n⚠️  Fund already initialized!");
        console.log("Governance account exists at:", governancePda.toBase58());
        
        // Read and display current state
        const data = govAccount.data;
        // Skip 8-byte discriminator
        const admin = new PublicKey(data.slice(8, 40));
        const oracle = new PublicKey(data.slice(40, 72));
        const subFeeBps = data.readUInt16LE(72);
        const redeemFeeBps = data.readUInt16LE(74);
        const paused = data[76] === 1;
        
        console.log("\nCurrent Governance State:");
        console.log("  Admin:", admin.toBase58());
        console.log("  Oracle:", oracle.toBase58());
        console.log("  Subscribe Fee:", subFeeBps, "bps");
        console.log("  Redeem Fee:", redeemFeeBps, "bps");
        console.log("  Paused:", paused);
        return;
    }
    
    console.log("\n🚀 Initializing fund...");
    
    try {
        const signature = await provider.sendAndConfirm(tx, [deployerKeypair]);
        console.log("✅ Fund initialized!");
        console.log("Signature:", signature);
        console.log("Explorer: https://explorer.solana.com/tx/" + signature + "?cluster=devnet");
        
        // Verify initialization
        console.log("\n📊 Verifying state...");
        const newGovAccount = await connection.getAccountInfo(governancePda);
        if (newGovAccount) {
            const data = newGovAccount.data;
            const admin = new PublicKey(data.slice(8, 40));
            const oracle = new PublicKey(data.slice(40, 72));
            console.log("  Admin:", admin.toBase58());
            console.log("  Oracle:", oracle.toBase58());
        }
        
    } catch (e: any) {
        console.error("❌ Initialization failed:", e.message);
        if (e.logs) {
            console.log("\nProgram logs:");
            e.logs.forEach((log: string) => console.log("  ", log));
        }
    }
}

main().catch(console.error);
