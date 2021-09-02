import {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js"
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"

import secrets from "./secrets.json"
;(async () => {
  /** Connect to cluster */
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

  /** Retrieve wallet keypair from secret key */
  const fromWallet = Keypair.fromSecretKey(new Uint8Array(secrets[0]))

  console.log(
    "Creating and minting token through the public key " +
      fromWallet.publicKey.toString()
  )
  console.time("Airdrop request")
  /** Request airdrop into the wallet */
  const fromAirdropSignature = await connection.requestAirdrop(
    fromWallet.publicKey,
    LAMPORTS_PER_SOL
  )
  console.timeEnd("Airdrop request")

  /** Wait for airdrop confirmation */
  console.time("connection.confirmTransaction")
  await connection.confirmTransaction(fromAirdropSignature)
  console.timeEnd("connection.confirmTransaction")

  /**
   * This is what creates the actual token
   */
  console.time("Token.createMint")
  const tokenMint = await Token.createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    0,
    TOKEN_PROGRAM_ID
  )
  console.timeEnd("Token.createMint")
  console.log(
    "Created token: https://explorer.solana.com/address/" +
      tokenMint.publicKey.toString() +
      "?cluster=devnet"
  )

  /** Code to retrieve already generated token */
  // const tokenMint = new Token(
  //   connection,
  //   new PublicKey("55LauSKaERCseZXzc3FHRuptCVu782apgHdExdfDGsMx"),
  //   TOKEN_PROGRAM_ID,
  //   fromWallet
  // )

  /**
   * Get or create the account associated to this token through the wallet public key
   */
  console.time("tokenMint.getOrCreateAssociatedAccountInfo")
  const fromTokenAccount = await tokenMint.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
  )
  console.timeEnd("tokenMint.getOrCreateAssociatedAccountInfo")

  /**
   * Mint 1 token to the wallet
   */
  console.time("tokenMint.mintTo")
  await tokenMint.mintTo(fromTokenAccount.address, fromWallet.publicKey, [], 1)

  console.timeEnd("tokenMint.mintTo")

  console.log(
    "Minted 1 token to address: https://explorer.solana.com/address/" +
      fromTokenAccount.address +
      "?cluster=devnet"
  )
})()
