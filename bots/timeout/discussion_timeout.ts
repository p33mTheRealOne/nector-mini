import "dotenv/config";
import * as anchor from "@coral-xyz/anchor";
import idl from "../idl/nector.json";
import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase ENV");
}

const FEE_WALLET =
  new anchor.web3.PublicKey(
    "GCcZkwkhGhzqBt6Eoc2nJCZFvgYdFAnh1hWuuARi774Z"
  );

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scan(program: anchor.Program) {
  console.log("Scanning orders...\n");

  const orders = await program.account.order.all();

  const respondedOrders =
    orders.filter((o) => o.account.state === 10);

  console.log(
    "SellerResponded Orders:",
    respondedOrders.length,
    "\n"
  );

  const txPromises: Promise<any>[] = [];

  for (const order of respondedOrders) {
    const acc = order.account;

    const respondedAt = Number(acc.sellerRespondAt);
    const deadline = respondedAt + 24 * 3600;
    const now = Math.floor(Date.now() / 1000);
    const expired = now >= deadline;

    console.log("Order:", order.publicKey.toBase58());
    console.log("Order Index:", acc.orderIndex.toString());
    console.log("Expired:", expired);

    if (!expired) continue;

    const orderIndex = new anchor.BN(acc.orderIndex);
    const orderPda = order.publicKey;

    const [escrowPda] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("escrow"),
          orderPda.toBuffer()
        ],
        program.programId
      );

    console.log("Trigger draw:", orderPda.toBase58());

    const txPromise = program.methods
      .draw(orderIndex)
      .accounts({
        order: orderPda,
        escrow: escrowPda,
        buyer: acc.buyerWallet,
        seller: acc.sellerWallet,
        feeWallet: FEE_WALLET
      })
      .rpc()
      .then(async (tx) => {
        console.log("Draw TX:", tx);

        const txOrder = order.publicKey.toBase58();

        // หา order ใน supabase
        const { data, error } = await supabase
          .from("escrow_orders")
          .select("*")
          .eq("escrow_pda", txOrder)
          .single();

        if (error || !data) {
          console.log("not found on supabase:", txOrder);
          return;
        }

        // update status
        const { error: updateError } = await supabase
          .from("escrow_orders")
          .update({
            status: "Cancelled"
          })
          .eq("escrow_pda", txOrder);

        if (updateError) {
          console.log("supabase update failed:", updateError.message);
          return;
        }

        console.log("supabase updated: Cancelled", txOrder);

        // insert message
        const { error: msgError } = await supabase
          .from("messages")
          .insert({
            conversation_id: data.conversation_id,
            sender_id: data.seller_id, // หรือจะใช้ system id ก็ได้
            receiver_id: data.buyer_id,
            body: `escrow_update:${txOrder}:draw`,
            message_type: "escrow_update",
          });

        if (msgError) {
          console.log("message insert failed:", msgError.message);
        } else {
          console.log("message inserted");
        }
      })
      .catch(err => {
        console.log("Draw failed:", err.message);
      });

    txPromises.push(txPromise);
  }

  await Promise.allSettled(txPromises);
}

async function main() {
  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  const wallet = anchor.Wallet.local();

  const provider =
    new anchor.AnchorProvider(
      connection,
      wallet,
      {}
    );

  anchor.setProvider(provider);

  const program =
    new anchor.Program(
      idl as anchor.Idl,
      provider
    );

  console.log("Keeper bot started...\n");

  while (true) {
    try {
      await scan(program);
    } catch (err) {
      console.log("Keeper error:", err);
    }

    console.log("Sleeping 10 seconds...\n");
    await sleep(10000);
  }
}

main();