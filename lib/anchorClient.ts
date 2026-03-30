import * as anchor from "@coral-xyz/anchor"
import { Connection, PublicKey } from "@solana/web3.js"
import idl from "@/idl/nector.json"

export const PROGRAM_ID = new PublicKey(
  "9buv2Wao6udvrauoot3JuGGJ8cB3ULfX2r1BzVNw1h64"
)

export function getProgram(wallet:any) {
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  )

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: "confirmed" }
  )

  return new anchor.Program(idl as any, provider) as any
}