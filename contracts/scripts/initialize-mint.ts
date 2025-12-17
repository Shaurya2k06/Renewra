/**
 * Initialize REIT Mint using the new initialize_mint instruction
 * Run this once after initialize_fund before testing subscriptions
 */

import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Connection, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

const PROGRAM_ID = new PublicKey("5nU2nHv2Pw9bWWL2BsTotX6mDaP1fTj1EZ7JMXAe6T5Z");
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  // Load deployer keypair
  const deployerPath = path.join(process.env.HOME!, ".config/solana/id.json");
  const deployerKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(deployerPath, "utf-8")))
  );
  console.log("Deployer:", deployerKeypair.publicKey.toBase58());
  
  // Setup provider
  const wallet = new Wallet(deployerKeypair);
  const provider = new AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);
  
  // Load the program
  const idl = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../target/idl/contracts.json"), "utf-8")
  );
  const program = new Program(idl, provider);
  
  // Derive PDAs
  const [reitMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("reit_mint")],
    PROGRAM_ID
  );
  console.log("REIT Mint PDA:", reitMint.toBase58());
  
  const [governance] = PublicKey.findProgramAddressSync(
    [Buffer.from("governance")],
    PROGRAM_ID
  );
  console.log("Governance PDA:", governance.toBase58());
  
  const [treasury] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    PROGRAM_ID
  );
  console.log("Treasury PDA:", treasury.toBase58());
  
  // Derive treasury's USDC ATA
  const treasuryUsdcAta = getAssociatedTokenAddressSync(
    USDC_MINT,
    treasury,
    true // allowOwnerOffCurve
  );
  console.log("Treasury USDC ATA:", treasuryUsdcAta.toBase58());
  
  // Check if mint already exists
  const mintAccount = await connection.getAccountInfo(reitMint);
  const treasuryAccount = await connection.getAccountInfo(treasuryUsdcAta);
  
  if (mintAccount && treasuryAccount) {
    console.log("\n✅ REIT Mint and Treasury already initialized!");
    return;
  }
  
  console.log("\n🚀 Initializing REIT Mint and Treasury USDC account...");
  
  // Build instruction manually
  const SystemProgram = anchor.web3.SystemProgram;
  
  // Instruction discriminator for initialize_mint (sha256("global:initialize_mint"))
  const discriminator = Buffer.from([209, 42, 195, 4, 129, 85, 209, 44]);
  
  const keys = [
    { pubkey: deployerKeypair.publicKey, isSigner: true, isWritable: true },
    { pubkey: governance, isSigner: false, isWritable: false },
    { pubkey: reitMint, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];
  
  const tx = new Transaction();
  
  // Add initialize mint instruction if needed
  if (!mintAccount) {
    const initMintIx = new anchor.web3.TransactionInstruction({
      programId: PROGRAM_ID,
      keys,
      data: discriminator,
    });
    tx.add(initMintIx);
    console.log("  ➤ Creating REIT mint...");
  }
  
  // Add create treasury ATA instruction if needed
  if (!treasuryAccount) {
    const createAtaIx = createAssociatedTokenAccountInstruction(
      deployerKeypair.publicKey,
      treasuryUsdcAta,
      treasury,
      USDC_MINT
    );
    tx.add(createAtaIx);
    console.log("  ➤ Creating Treasury USDC account...");
  }
  
  if (tx.instructions.length === 0) {
    console.log("✅ Nothing to initialize - all accounts exist!");
    return;
  }
  
  try {
    const signature = await connection.sendTransaction(tx, [deployerKeypair]);
    await connection.confirmTransaction(signature);
    
    console.log("✅ Initialization successful!");
    console.log("Signature:", signature);
    console.log("Explorer: https://explorer.solana.com/tx/" + signature + "?cluster=devnet");
  } catch (e) {
    console.error("❌ Failed:", e.message);
    if (e.logs) {
      console.log("\nLogs:");
      e.logs.forEach(log => console.log("  ", log));
    }
  }
}

main().catch(console.error);
