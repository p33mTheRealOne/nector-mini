// app/page.tsx
'use client';

import * as React from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProgram } from "@/lib/anchorClient"
import * as anchor from "@coral-xyz/anchor"
import { getSellerPDA, getOrderPDA } from "@/lib/pda"
import { PublicKey } from "@solana/web3.js"

function getAnchorWallet() {
  const provider = (window as any).solana;

  if (!provider?.isPhantom) throw new Error("Phantom not found")

  return {
    publicKey: provider.publicKey,
    signTransaction: provider.signTransaction,
    signAllTransactions: provider.signAllTransactions,
  };
}

function usdToSol(numStr: string) {
  const [solPrice, setSolPrice] = React.useState<number>(0);

  React.useEffect(() => {
    async function loadPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        const data = await res.json();
        setSolPrice(data.solana.usd);
      } catch (err) {
        console.error(err);
      }
    }

    loadPrice();
  }, []);
  const usd = Number(numStr || 0);
  const sol = usd / solPrice;
  return `${sol.toFixed(2)} SOL`;
}

function formatUsdShort(numStr: string) {
  const n = Number(numStr || 0);

  if (n >= 1_000_000_000)
    return `$${(n / 1_000_000_000).toFixed(1)}B`;

  if (n >= 1_000_000)
    return `$${(n / 1_000_000).toFixed(1)}M`;

  if (n >= 1_000)
    return `$${(n / 1_000).toFixed(1)}K`;

  return `$${n.toFixed(1)}`;
}

function extractEscrowId(body:string){
  const parts = body.split(":")
  return parts[1]
}

function EscrowSuccess({
  tx,
  onClose,
}: {
  tx: string
  onClose: () => void
}) {
  return (
    <div className="h-full flex flex-col">

      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">
          Create Escrow order
        </div>

        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        <div className="w-[120px] h-[120px] rounded-full bg-green-500 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path
              d="M5 13l4 4L19 7"
              stroke="black"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="text-white text-3xl">
          Order Created
        </div>

        <a
          href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#FFFFFF] transition cursor-pointer"
        >
          <Image
            src="/share-2-svgrepo-com (1).svg"
            width={18}
            height={18}
            alt="solscan"
          />

          <span>
            {tx.slice(0, 6)}...{tx.slice(-4)}
          </span>
        </a>

        <button
          onClick={onClose}
          className="w-[320px] h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function BuyerFundedScreen({
  tx,
  onClose,
}: {
  tx: string
  onClose: () => void
}) {
  return (
    <div className="h-full flex flex-col">

      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">
          Buyer Fund Escrow
        </div>

        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        <div className="w-[120px] h-[120px] rounded-full bg-green-500 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path
              d="M5 13l4 4L19 7"
              stroke="black"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="text-white text-3xl">
          Escrow Funded
        </div>

        <a
          href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#FFFFFF] transition cursor-pointer"
        >
          <Image
            src="/share-2-svgrepo-com (1).svg"
            width={18}
            height={18}
            alt="solscan"
          />

          <span>
            {tx.slice(0, 6)}...{tx.slice(-4)}
          </span>
        </a>

        <button
          onClick={onClose}
          className="w-[320px] h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function PaidSellerScreen({
  tx,
  onClose,
}: {
  tx: string
  onClose: () => void
}) {
  return (
    <div className="h-full flex flex-col">

      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">
          Pay Seller During Discuss
        </div>

        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        <div className="w-[120px] h-[120px] rounded-full bg-green-500 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path
              d="M5 13l4 4L19 7"
              stroke="black"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="text-white text-3xl">
          Paid Seller
        </div>

        <a
          href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#FFFFFF] transition cursor-pointer"
        >
          <Image
            src="/share-2-svgrepo-com (1).svg"
            width={18}
            height={18}
            alt="solscan"
          />

          <span>
            {tx.slice(0, 6)}...{tx.slice(-4)}
          </span>
        </a>

        <button
          onClick={onClose}
          className="w-[320px] h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function OpenedDispute({
  tx,
  onClose,
}: {
  tx: string
  onClose: () => void
}) {
  return (
    <div className="h-full flex flex-col">

      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">
          Review
        </div>

        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        <div className="w-[120px] h-[120px] rounded-full bg-green-500 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path
              d="M5 13l4 4L19 7"
              stroke="black"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="text-white text-3xl">
          Opened Dispute
        </div>

        <a
          href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#FFFFFF] transition cursor-pointer"
        >
          <Image
            src="/share-2-svgrepo-com (1).svg"
            width={18}
            height={18}
            alt="solscan"
          />

          <span>
            {tx.slice(0, 6)}...{tx.slice(-4)}
          </span>
        </a>

        <button
          onClick={onClose}
          className="w-[320px] h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function ConfirmSuccess({
  tx,
  onClose,
}: {
  tx: string
  onClose: () => void
}) {
  return (
    <div className="h-full flex flex-col">

      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">
          Review
        </div>

        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        <div className="w-[120px] h-[120px] rounded-full bg-green-500 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path
              d="M5 13l4 4L19 7"
              stroke="black"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="text-white text-3xl">
          Confirmed
        </div>

        <a
          href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#FFFFFF] transition cursor-pointer"
        >
          <Image
            src="/share-2-svgrepo-com (1).svg"
            width={18}
            height={18}
            alt="solscan"
          />

          <span>
            {tx.slice(0, 6)}...{tx.slice(-4)}
          </span>
        </a>

        <button
          onClick={onClose}
          className="w-[320px] h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function getProfileUrl(supabase:any, uid:string){

  const { data } = supabase
    .storage
    .from("profiles")
    .getPublicUrl(`${uid}.jpg`)

  return data.publicUrl
}

function statusColor(status:string){

  if(status === "BuyerFunded")
    return "bg-[#033617] text-[#1FC431]"

  if(status === "onchain_created")
    return "bg-[#3b3b00] text-yellow-400"

  if(status === "Shipping")
    return "bg-[#113f3f] text-[#26D9D9]"

  if(status === "Cancelled")
    return "bg-[#510000] text-[#FF0000]"

  if(status === "Completed")
    return "bg-[#033617] text-[#1FC431]"

  return "bg-[#262626] text-white"
}

function EscrowOrders({
  onClose,
  conversationId,
  supabase,
  loadEscrow,
  viewerId,
  onBuy,
  onSellerFund,
  onMarkShipped,
  onReview,
  onRefund,
  onCancel,
  onRespond,
  onDisputeRefund,
  onRefundDiscuss,
  onPaySeller,
  onSendDigitalFile,
}:any){
  const [PaySellerOrder, setPaySellerOrder] = React.useState<any | null>(null)

  const [uploadOrder, setUploadOrder] = React.useState<any | null>(null)

  const [refundDiscussOrder, setRefundDiscussOrder] = React.useState<any | null>(null)

  const [refundDisputeOrder, setRefundDisputeOrder] = React.useState<any | null>(null)

  const [orders,setOrders] = React.useState<any[]>([])
  const [loading,setLoading] = React.useState(true)

  const [downloadOrder, setDownloadOrder] = React.useState<any | null>(null)

  React.useEffect(()=>{

    async function load(){

      const {data,error} = await supabase
        .from("escrow_orders")
        .select(`
          escrow_pda,
          seller_id,
          buyer_id,
          seller_name,
          buyer_name,
          status,
          created_at
        `)
        .eq("conversation_id",conversationId)
        .order("created_at",{ascending:false})

      if(error){
        console.error(error)
        return
      }

      setOrders(data ?? [])
      setLoading(false)
    }

    load()

  },[conversationId])

  const [refundOrder, setRefundOrder] = React.useState<any>(null)

  const [cancelOrder, setCancelOrder] = React.useState<any>(null)

  if (refundOrder) {
    return (
      <BuyerRefundScreen
        order={refundOrder}
        supabase={supabase}
        onClose={() => setRefundOrder(null)}
        onRefund={() => onRefund(refundOrder)}
      />
    )
  }

  if (cancelOrder) {
    return (
      <SellerCancelScreen
        order={cancelOrder}
        supabase={supabase}
        onClose={()=>setCancelOrder(null)}
        onRefund={() => onCancel(cancelOrder)}
      />
    )
  }

  if (refundDisputeOrder) {
    return (
      <RefundScreen
        order={refundDisputeOrder}
        supabase={supabase}
        onClose={() => setRefundDisputeOrder(null)}
        onNext={() => {
          onDisputeRefund(refundDisputeOrder)
          setRefundDisputeOrder(null)
        }}
      />
    )
  }

  if (refundDiscussOrder) {
    return (
      <RefundBuyerDiscussScreen
        order={refundDiscussOrder}
        supabase={supabase}
        onClose={() => setRefundDiscussOrder(null)}
        onNext={() => onRefundDiscuss(refundDiscussOrder)}
      />
    )
  }

  if (PaySellerOrder) {
    return (
      <PaySellerDiscussScreen
        order={PaySellerOrder}
        supabase={supabase}
        onClose={() => setPaySellerOrder(null)}
        onNext={() => onPaySeller(PaySellerOrder)}
      />
    )
  }

  if (uploadOrder) {
    return (
      <UploadFileScreen
        order={uploadOrder}
        supabase={supabase}
        onClose={()=>setUploadOrder(null)}
        onSendFile={async (order, file) => {
          await onSendDigitalFile(order, file);
          setUploadOrder(null);
        }}
      />
    )
  }

  if (downloadOrder) {
    return (
      <DownloadScreen
        order={downloadOrder}
        supabase={supabase}
        onClose={() => setDownloadOrder(null)}
      />
    )
  }

  return (
    <div className="h-full flex flex-col">

      {/* top bar */}
      <div className="h-[80px] md:h-[91px] border-b border-white/10 flex items-center justify-between px-6">

        <div className="text-white md:text-[18px] text-[16px] font-medium">
          All Escrow Order
        </div>

        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X"/>
        </button>

      </div>

      {/* list */}

      <div className="mt-4 flex-1 overflow-y-auto px-6 pb-6 space-y-4 flex flex-col items-center scrollbar-hide">

        {loading && (
          <div className="text-white/40">
            Loading orders...
          </div>
        )}

        {!loading && orders.map((o:any)=>(
          <div key={o.escrow_pda} className="w-full">
            {/* ================= MOBILE ONLY ================= */}
            <div className="md:hidden flex flex-col items-center gap-4">
              {/* top objects above card */}
              <div className="w-full max-w-[320px] flex items-start justify-between">
                {/* status */}
                <div className="w-[110px] flex flex-col items-center text-center">
                  <div className="text-white text-[15px] font-medium">
                    Status
                  </div>

                  <div
                    className={`mt-2 px-4 py-1 rounded-full text-[13px] font-medium w-full max-w-[110px] ${statusColor(o.status)}`}
                  >
                    {o.status}
                  </div>

                  <div className="text-white text-[15px] font-medium mt-3">
                    Created at
                  </div>

                  <div className="text-white/40 text-[13px] mt-1">
                    {new Date(o.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* seller / buyer */}
                <div className="flex flex-row gap-5">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-[#0a2626] flex items-center justify-center overflow-hidden">
                      <Image
                        src="/cat.png"
                        width={12}
                        height={12}
                        className="h-12 w-12 rounded-full object-cover"
                        alt="profile"
                      />
                    </div>
                    <div className="text-white text-sm font-medium">Seller</div>
                    <div className="px-4 py-1 rounded-full bg-[#3d0a0a] text-[#ff4d4d] text-xs font-medium">
                      {o.seller_name}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-[#0a2626] flex items-center justify-center overflow-hidden">
                      <Image
                        src="/cat.png"
                        width={12}
                        height={12}
                        className="h-12 w-12 rounded-full object-cover"
                        alt="profile"
                      />
                    </div>
                    <div className="text-white text-sm font-medium">Buyer</div>
                    <div className="bg-[#033617] text-[#1FC431] px-4 py-1 rounded-full text-xs font-medium">
                      {o.buyer_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* card stays below */}
              <EscrowCard
                orderId={o.escrow_pda}
                loadEscrow={loadEscrow}
                supabase={supabase}
                viewerId={viewerId}
                onBuy={onBuy}
                onFundEscrow={onSellerFund}
                onMarkShipped={onMarkShipped}
                onReview={onReview}
                onRefund={(order)=>setRefundOrder(order)}
                onCancel={(order)=>setCancelOrder(order)}
                onRespond={onRespond}
                onDisputeRefund={(order)=>setRefundDisputeOrder(order)}
                onRefundDiscuss={(order)=>setRefundDiscussOrder(order)}
                onPaySeller={(order)=>setPaySellerOrder(order)}
                onUploadFile={(order)=>setUploadOrder(order)}
                onDownload={(order)=>setDownloadOrder(order)}
              />
            </div>

            {/* ================= DESKTOP ONLY ================= */}
            <div className="flex flex-1 justify-center items-center hidden md:flex gap-6 items-start">
              {/* status column */}
              <div className="mt-8 w-[150px] flex flex-col items-center text-center">
                <div className="text-white text-[17px] font-medium">
                  Status
                </div>

                <div className={`mt-2 px-5 py-1 rounded-full text-[15px] font-medium w-full max-w-[140px] ${statusColor(o.status)}`}>
                  {o.status}
                </div>

                <div className="text-white text-[17px] font-medium mt-4">
                  Created at
                </div>

                <div className="text-white/40 text-[15px] mt-1">
                  {new Date(o.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* card */}
              <EscrowCard
                orderId={o.escrow_pda}
                loadEscrow={loadEscrow}
                supabase={supabase}
                viewerId={viewerId}
                onBuy={onBuy}
                onFundEscrow={onSellerFund}
                onMarkShipped={onMarkShipped}
                onReview={onReview}
                onRefund={(order)=>setRefundOrder(order)}
                onCancel={(order)=>setCancelOrder(order)}
                onRespond={onRespond}
                onDisputeRefund={(order)=>setRefundDisputeOrder(order)}
                onRefundDiscuss={(order)=>setRefundDiscussOrder(order)}
                onPaySeller={(order)=>setPaySellerOrder(order)}
                onUploadFile={(order)=>setUploadOrder(order)}
                onDownload={(order)=>setDownloadOrder(order)}
              />

              {/* seller buyer column */}
              <div className="mt-10 flex flex-row gap-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-[#0a2626] flex items-center justify-center">
                    <img
                      src={getProfileUrl(supabase, o.seller_id)}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="text-white text-sm font-medium">Seller</div>
                  <div className="px-4 py-1 rounded-full bg-[#3d0a0a] text-[#ff4d4d] text-xs font-medium">
                    {o.seller_name}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-[#0a2626] flex items-center justify-center">
                    <img
                      src={getProfileUrl(supabase, o.buyer_id)}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="text-white text-sm font-medium">Buyer</div>
                  <div className="bg-[#033617] text-[#1FC431] px-4 py-1 rounded-full text-xs font-medium">
                    {o.buyer_name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>

    </div>
  )
}

function EscrowItemInfo({
  type,
  mode,
  draft,
  setDraft,
  onNext,
  onBack,
  onClose,
}: {
  mode: any;
  type: 'physical' | 'digital';
  draft: any;
  setDraft: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  // track preview URL we created so we can revoke the old one when replacing
  const lastPreviewRef = React.useRef<string | null>(null);

  function onPickFile(f?: File) {
    if (!f) return;

    // revoke previous preview we created (if any)
    if (lastPreviewRef.current) {
      try { URL.revokeObjectURL(lastPreviewRef.current); } catch {}
      lastPreviewRef.current = null;
    }

    const url = URL.createObjectURL(f);
    lastPreviewRef.current = url;

    setDraft((d:any) => ({
      ...d,
      imageFile: f,
      imagePreview: url,
    }));
  }

  const canNext =
    draft.imagePreview &&
    draft.description?.trim() &&
    draft.price &&
    (type === 'physical'
      ? !!draft.shipDate
      : draft.shipTime > 0);

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const max = new Date();
  max.setMonth(max.getMonth() + 1);
  const maxDate = max.toISOString().split("T")[0];

  const dateRef = React.useRef<HTMLInputElement | null>(null);

  const [showInfo, setShowInfo] = React.useState(false);
  const infoRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (type === "digital") {
      setDraft((d:any) => ({
        ...d,
        disputeMode: "BTR",
      }))
    }
  }, [type])

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Back"
          >
            <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
          </button>

          <div className="text-white text-[18px] font-medium truncate">
            Create Escrow order
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>
      {/* body */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[720px]">
          {/* title */}
          <div className="text-center text-white text-[27px] font-medium mb-1 md:mb-8">
            Insert item info
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-8 md:gap-10 items-start">
            {/* left: picture */}
            <div className="mt-5 flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative w-[138px] h-[138px] rounded-[18px] bg-[#262626] hover:bg-[#303030] transition overflow-hidden"
                title="Upload"
              >
                {draft.imagePreview ? (
                  <img
                    src={draft.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center">
                    <Image
                      src="/image-square-svgrepo-com.svg"
                      width={50}
                      height={50}
                      alt="Item’s Picture"
                    />
                  </div>
                )}
              </button>

              {/* hidden input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickFile(e.target.files?.[0])}
              />

              <div className="mt-3 text-[#A6A6A6] text-[14px]">Item’s Picture</div>
            </div>

            {/* right: inputs */}
            <div>
              <label className="block text-white text-[14px] font-medium mb-2">
                Item’s Description
              </label>

              <div className="relative">
                <Image
                  src="/document-ui-description-svgrepo-com.svg"
                  width={17}
                  height={17}
                  alt="document"
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                />

                <input
                  value={draft.description}
                  maxLength={50} // Stops the user from typing more
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value.length <= 50) {
                      setDraft((d: any) => ({ ...d, description: value }));
                    }
                  }}
                  placeholder="Describe your Item..."
                  className="w-full h-[46px] rounded-[8px] bg-[#222222]
                            text-white/90 outline-none
                            pl-11 pr-4
                            focus:ring-2 focus:ring-[#2FE4E4]/40"
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-6">
                <div>
                  {type === "physical" ? (
                    // ================= PHYSICAL =================
                    <div>
                      <div className="flex items-center gap-2 mb-2 relative">
                        <label className="text-white text-[14px] font-medium">
                          Shipping date
                        </label>

                        <div
                          ref={infoRef}
                          className="relative"
                          onMouseEnter={() => setShowInfo(true)}
                          onMouseLeave={() => setShowInfo(false)}
                        >
                          <Image
                            src="/question-circle-svgrepo-com.svg"
                            width={18}
                            height={18}
                            alt="info"
                            onClick={() => setShowInfo((prev) => !prev)}
                            className="cursor-pointer opacity-70 hover:opacity-100"
                          />

                          {showInfo && (
                            <div
                              className="absolute z-50
                                        left-1/2 -translate-x-1/2
                                        top-7
                                        w-[260px] p-3
                                        rounded-[8px]
                                        bg-[#1A1A1A]
                                        text-white text-[12px]
                                        shadow-xl
                                        border border-white/10"
                            >
                              You must ship the item before this date. Otherwise, the buyer will be refunded and you will lose your bond.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="relative">
                        <Image
                          src="/calender-svgrepo-com.svg"
                          width={18}
                          height={18}
                          alt="calendar"
                          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        />

                        <input
                          ref={dateRef}
                          type="date"
                          min={minDate}
                          max={maxDate}
                          value={draft.shipDate}
                          onChange={(e)=>
                            setDraft((d:any)=>({...d, shipDate:e.target.value}))
                          }
                          onKeyDown={(e) => e.preventDefault()}
                          onPaste={(e) => e.preventDefault()}
                          onClick={() => dateRef.current?.showPicker?.()}
                          className="w-full h-[46px] rounded-[8px] bg-[#222222]
                                    text-white/90 outline-none
                                    pl-11 pr-4
                                    focus:ring-2 focus:ring-[#2FE4E4]/40
                                    appearance-none"
                        />
                      </div>
                    </div>
                  ) : (
                    // ================= DIGITAL =================
                    <div>
                      <div className="flex items-center gap-2 mb-2 relative">
                        <label className="text-white text-[14px] font-medium">
                          Shipping time (hours)
                        </label>

                        <div
                          ref={infoRef}
                          className="relative"
                          onMouseEnter={() => setShowInfo(true)}
                          onMouseLeave={() => setShowInfo(false)}
                        >
                          <Image
                            src="/question-circle-svgrepo-com.svg"
                            width={18}
                            height={18}
                            alt="info"
                            onClick={() => setShowInfo((prev) => !prev)}
                            className="cursor-pointer opacity-70 hover:opacity-100"
                          />

                          {showInfo && (
                            <div
                              className="absolute z-50
                                        left-1/2 -translate-x-1/2
                                        top-7
                                        w-[260px] p-3
                                        rounded-[8px]
                                        bg-[#1A1A1A]
                                        text-white text-[12px]
                                        shadow-xl
                                        border border-white/10"
                            >
                              You must deliver the item within this many hours.
                              If not, the buyer will be refunded automatically and you will lose your bond
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative flex items-center">
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d: any) => {
                              const current = Number(d.shipTime || 1);
                              const next = Math.max(1, current - 1);
                              return { ...d, shipTime: String(next) };
                            })
                          }
                          className="absolute left-2 text-white text-lg px-2"
                        >
                          −
                        </button>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={draft.shipTime}
                          onChange={(e)=>{
                            let v = e.target.value.replace(/\D/g,"");
                            if(!v){ setDraft((d:any)=>({...d, shipTime:''})); return;}
                            let n = Math.max(1, Math.min(48, Number(v)));
                            setDraft((d:any)=>({...d, shipTime:String(n)}));
                          }}
                          onKeyDown={(e) => {
                            if (e.key.length === 1 && !/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className="w-full h-[46px] rounded-[8px] bg-[#222222]
                                    text-white/90 outline-none
                                    text-center
                                    pl-10 pr-10
                                    focus:ring-2 focus:ring-[#2FE4E4]/40"
                          placeholder="1-48"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d: any) => {
                              const current = Number(d.shipTime || 0);
                              const next = Math.min(48, current + 1);
                              return { ...d, shipTime: String(next) };
                            })
                          }
                          className="absolute right-2 text-white text-lg px-2"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white text-[14px] font-medium mb-2">
                    Item’s Price
                  </label>

                  <div className="relative">
                    {/* dollar icon */}
                    <Image
                      src="/dollar-svgrepo-com.svg"
                      width={24}
                      height={24}
                      alt="dollar"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    />

                    <input
                      type="text"
                      inputMode="numeric"
                      value={draft.price}
                      onChange={(e)=>{
                        const onlyNumbers = e.target.value.replace(/\D/g,"");
                        setDraft((d:any)=>({...d, price:onlyNumbers}))
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key.length === 1 &&
                          !/[0-9]/.test(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full h-[46px] rounded-[8px] bg-[#222222]
                                text-white/90 outline-none
                                pl-11 pr-4
                                focus:ring-2 focus:ring-[#2FE4E4]/40"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* next button */}
          <button
            disabled={!canNext}
            onClick={onNext}
            className={`mt-8 w-full h-[46px] rounded-[10px] font-semibold
            ${canNext ? "bg-[#2FE4E4] text-black" : "bg-[#136262] text-black cursor-not-allowed"}`}
          >
            Next
          </button>

          {type === "physical" && (
            <div className="mt-3 text-center text-white/30 text-[12px]">Type: {type}, Mode: {mode}</div>
          )}

          {type === "digital" && (
            <div className="mt-3 text-center text-white/30 text-[12px]">Type: {type}</div>
          )}

        </div>
      </div>
    </div>
  );
}

function EscrowNameOrder({
  draft,
  setDraft,
  onBack,
  onClose,
  onNext,
}: any) {
  const canNext = draft.orderName?.trim().length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Back"
          >
            <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
          </button>

          <div className="text-white text-[18px] font-medium truncate">
            Create Escrow order
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
        <img
          src={draft.imagePreview || "/image-square-svgrepo-com.svg"}
          className="w-[150px] h-[150px] rounded-xl object-cover"
        />

        <div className="text-white text-3xl">Name this Order</div>

        <input
          value={draft.orderName}
          maxLength={20} // This prevents further typing at 20 chars
          onChange={(e) => {
            const val = e.target.value;
            // Safety check: only update state if length is <= 20
            if (val.length <= 20) {
              setDraft((d: any) => ({ ...d, orderName: val }));
            }
          }}
          className="w-full max-w-[420px] h-[46px] rounded-[10px] bg-[#222222] text-white/90 outline-none px-4 focus-within:ring-2 focus-within:ring-[#2FE4E4]/40"
        />

        <button
          disabled={!canNext}
          onClick={onNext}
          className={`h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] transition
            ${canNext 
              ? "bg-[#26D9D9] text-black hover:opacity-90" 
              : "bg-[#136262] text-black cursor-not-allowed"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function EscrowPreview({
  draft,
  type,
  mode,
  time,
  date,
  onBack,
  onClose,
  onCreate,
}: any) {
  const isPhysical = type === 'physical';
  const isDigital = type === 'digital';

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Back"
          >
            <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
          </button>

          <div className="text-white text-[18px] font-medium truncate">
            Create Escrow order
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 mb-20 md:mb-0">
        <div className="text-white text-3xl">Preview</div>
        {/* CARD */}
        <div className="w-full max-w-xl rounded-2xl bg-[#0e0e0e] border border-white/10 p-4 sm:p-5 md:p-6">

          {/* TAG ROW */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Image src="/cpu-svgrepo-com.svg" width={20} height={20} alt="Digital" />

            <div className="px-2 sm:px-3 py-1 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {type === 'digital' ? 'Digital product' : 'Physical product'}
            </div>

            {isPhysical && mode &&(
              <div className="px-2 sm:px-3 py-1 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {mode === 'BTR' ? 'BTR' : 'STR'}
              </div>
            )}

            {isPhysical && date &&(
              <div className="px-2 sm:px-3 py-1 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {date}
              </div>
            )}

            {isDigital && time && (
              <div className="px-2 sm:px-3 py-1 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {time} hours
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="flex gap-3 sm:gap-4">

            <img
              src={draft.imagePreview}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-[110px] md:h-[110px] rounded-xl object-cover"
            />

            <div className="flex flex-col justify-center min-w-0">

              {/* Order Name */}
              <div className="text-[#26D9D9] text-lg sm:text-xl md:text-2xl font-bold truncate">
                {draft.orderName}
              </div>

              {/* USD + SOL */}
              <div className="text-white text-xl sm:text-2xl md:text-3xl font-medium">
                {formatUsdShort(draft.price)}
                <span className="text-white/50 text-sm sm:text-base ml-2">
                  {usdToSol(draft.price)}
                </span>
              </div>

              {/* Description */}
              <div className="text-white/50 mt-1 sm:mt-2 text-sm sm:text-base line-clamp-2">
                {draft.description}
              </div>

            </div>
          </div>

          {/* STATUS BUTTON */}
          <div className="mt-4 sm:mt-6 w-full h-10 sm:h-11 md:h-[46px] rounded-xl bg-[#7b7b7b] flex items-center justify-center text-black text-sm sm:text-base font-medium gap-2">
            <Image src="/dollar-sign-svgrepo-black-com.svg" width={18} height={18} alt="Dollar" />
            Waiting for buyer to fund...
          </div>

        </div>
        <div className="w-full max-w-xl">
          <button
            onClick={onCreate}
            className="w-full h-[46px] rounded-[10px] bg-[#26D9D9] text-black font-semibold text-base md:text-lg transition hover:opacity-90"
          >
            Create Escrow Order
          </button>
        </div>
      </div>
    </div>
  );
}

function EscrowScreen({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (type: 'physical' | 'digital') => void;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Create Escrow order</div>

        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* body */}
      <div className="mb-5 flex-1 flex items-center justify-center">
        <div className="w-full max-w-[720px] px-6 text-center">
          <div className="text-white text-[27px] font-medium mb-10">
            Is your item Physical or Digital?
          </div>
          <div className="flex items-center justify-center gap-10">
            {/* Physical */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  console.log("picked:", "physical")
                  onPick("physical")
                }}
                className="w-[138px] h-[138px] rounded-[18px] bg-[#262626] hover:bg-[#303030] transition grid place-items-center"
              >
                <Image src="/box-1-svgrepo-com.svg" width={65} height={65} alt="Physical" />
              </button>

              <div className="text-[#A6A6A6] text-[18px]">Physical</div>
            </div>

            {/* Digital */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  console.log("picked:", "digital")
                  onPick("digital")
                }}
                className="w-[138px] h-[138px] rounded-[18px] bg-[#262626] hover:bg-[#303030] transition grid place-items-center"
              >
                <Image src="/cpu-svgrepo-com.svg" width={50} height={50} alt="Digital" />
              </button>

              <div className="text-[#A6A6A6] text-[18px]">Digital</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatImage({
  path,
  getUrl,
  className = '',
  onLoaded,
}: {
  path: string;
  getUrl: (p: string) => Promise<string>;
  className?: string;
  onLoaded?: () => void;
}) {
  const [url, setUrl] = React.useState('');

  React.useEffect(() => {
    let alive = true;
    getUrl(path).then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [path, getUrl]);

  if (!url) return <div className="text-white/50 text-[14px]">Loading image...</div>;

  return (
    <img
      src={url}
      alt="sent"
      className={`block ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onLoad={() => onLoaded?.()}
    />
  );
}

function EscrowCard({
  orderId,
  loadEscrow,
  supabase,
  viewerId,
  onBuy,
  onFundEscrow,
  onMarkShipped,
  onReview,
  onRefund,
  onCancel,
  onRespond,
  onDisputeRefund,
  onRefundDiscuss,
  onPaySeller,
  onUploadFile,
  onDownload
}: {
  orderId: string
  loadEscrow: (id: string) => Promise<any>
  supabase: any
  viewerId: string | null
  onBuy: (order:any) => void
  onFundEscrow?: (order:any) => void
  onMarkShipped?: (order:any)=>void
  onReview?: (order:any)=>void
  onRefund?: (order:any)=>void
  onCancel?: (order:any)=>void
  onRespond?: (order:any)=>void
  onDisputeRefund: (order:any)=>void
  onRefundDiscuss: (order:any)=>void
  onPaySeller: (order:any)=>void
  onUploadFile: (order:any)=>void
  onDownload: (order:any) => void
}) {

  const [order, setOrder] = React.useState<any>(null);
  const [imageUrl, setImageUrl] = React.useState<string>("");

  const isSeller = order?.seller_id === viewerId
  const isBuyer = order?.buyer_id === viewerId
  const type = order?.type

  React.useEffect(() => {
    loadEscrow(orderId).then(setOrder);
  }, [orderId, loadEscrow]);

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  if (!order)
    return <div className="text-white/50">Loading order...</div>;

  const status = order?.status

  return (
    <div className="w-[275px] md:w-[360px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
      <div className="flex gap-2 mb-3">
        <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
          {order.type === "digital" ? "Digital" : "Physical"}
        </div>

        {type === "physical" && (
          <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
            {order.dispute_mode === "BTR" ? "BTR" : "STR"}
          </div>
        )}

        <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
          {order.type === "digital"
            ? `${order.ship_time_hours}h`
            : order.ship_date}
        </div>
      </div>

      <div className="flex gap-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            className="w-[64px] h-[64px] md:w-[80px] md:h-[80px] rounded-xl object-cover"
          />
        ) : (
          <div className="ww-[64px] h-[64px] md:w-[80px] md:h-[80px] rounded-xl bg-white/10 animate-pulse" />
        )}

        <div>
          <div className="text-[#26D9D9] text-[16px] md:text-[20px] font-bold">
            {order.order_name}
          </div>

          <div className="text-white text-[19px] md:text-[24px]">
            ${order.price_usd}
          </div>

          <div className="text-white/50 text-[12px] md:text-[14px]">
            {order.description}
          </div>
        </div>
      </div>
      {isBuyer && status === "onchain_created" && (
        <button
          onClick={() => onBuy(order)}
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/dollar-sign-svgrepo-black-com.svg" width={16} height={16} alt="Dollar"/>
          Buy
        </button>
      )}

      {isBuyer && status === "BuyerFunded" && (
        <button
          onClick={() => onRefund?.(order)}
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/refund-forward-svgrepo-com (1).svg" width={22} height={22} alt="Refund"/>
          Refund
        </button>
      )}

      {isBuyer && status === "Shipping" && (
        <button
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-[#7b7b7b] text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/truck-speed-svgrepo-com.svg" width={24} height={24} alt="Dollar"/>
          Seller Shipping item...
        </button>
      )}

      {isBuyer && status === "Shipped" && order.type === "physical" && (
        <button
          onClick={() => onReview?.(order)}
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/eye-show-svgrepo-com.svg" width={24} height={24} alt="review"/>
          Review
        </button>
      )}

      {isBuyer && status === "Shipped" && order.type === "digital" && (
        <div>
          <button
            onClick={() => onDownload(order)}
            className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
          >
            <Image src="/download-svgrepo-com.svg" width={20} height={20} alt="download" className='mb-0.5'/>
            Download Item
          </button>

          <button
            onClick={() => onReview?.(order)}
            className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
          >
            <Image src="/eye-show-svgrepo-com.svg" width={24} height={24} alt="review"/>
            Review
          </button>
        </div>
      )}

      {isSeller && status === "onchain_created" && (
        <button
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-[#7b7b7b] text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/dollar-sign-svgrepo-black-com.svg" width={16} height={16} alt="Dollar"/>
          Waiting for buyer to fund...
        </button>
      )}

      {isSeller && status === "BuyerFunded" && (
        <button
          onClick={() => onFundEscrow?.(order)}
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/dollar-sign-svgrepo-black-com.svg" width={16} height={16} alt="Dollar"/>
          Fund Escrow
        </button>
      )}

      {isBuyer && status === "Discuss" && (
        <button
          onClick={() => onPaySeller?.(order)}
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/dollar-sign-svgrepo-black-com.svg" width={16} height={16} alt="Dollar"/>
          Pay Seller
        </button>
      )}


      {isSeller && status === "Discuss" && (
        <button
          onClick={() => onRefundDiscuss?.(order)}
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/reply-svgrepo-com (1).svg" width={17} height={17} alt="respond"/>
          Refund Buyer {/*During discuss time*/}
        </button>
      )}

      {isSeller && status === "Shipping" && order.type === "physical" && (
        <div>
          <button
            onClick={() => onMarkShipped?.(order)}
            className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
          >
            <Image src="/check-svgrepo-com.svg" width={22} height={22} alt="mark"/>
            Mark as Shipped
          </button>

          <button
            onClick={() => onCancel?.(order)}
            className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-[#510000] text-[#FF0000] font-medium flex items-center justify-center gap-2"
          >
            <Image src="/cancel-red-svgrepo-com.svg" width={12} height={12} alt="Cancel"/>
            Cancel
          </button>
        </div>
      )}

      {isSeller && status === "Shipping" && order.type === "digital" && (
        <div>
          <button
            onClick={() => onUploadFile?.(order)}
            className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
          >
            <Image src="/upload-svgrepo-com (1).svg" width={17} height={17} alt="upload"/>
            Upload file
          </button>

          <button
            onClick={() => onCancel?.(order)}
            className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-[#510000] text-[#FF0000] font-medium flex items-center justify-center gap-2"
          >
            <Image src="/cancel-red-svgrepo-com.svg" width={12} height={12} alt="Cancel"/>
            Cancel
          </button>
        </div>
      )}

      {isSeller && status === "Shipped" && (
        <button
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-[#7b7b7b] text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/eye-show-svgrepo-com.svg" width={24} height={24} alt="review"/>
          Waiting for buyer to review...
        </button>
      )}

      {isSeller && status === "Dispute" && (
        <div>
          <button
            onClick={() => onRespond?.(order)}
            className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
          >
            <Image src="/reply-svgrepo-com (1).svg" width={17} height={17} alt="respond"/>
            Respond
          </button>
          <button
            onClick={()=>onDisputeRefund(order)}
            className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
          >
            <Image src="/refund-forward-svgrepo-com (1).svg" width={20} height={20} alt="refund"/>
            Refund
          </button>
        </div>
      )}

      {isBuyer && status === "Dispute" && (
        <button
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-[#7b7b7b] text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/reply-svgrepo-com (1).svg" width={17} height={17} alt="respond"/>
          Waiting for seller to respond...
        </button>
      )}

      {status === "Cancelled" && (
        <button
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-[#7b7b7b] text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/cancel-black-svgrepo-com.svg" width={12} height={12} alt="Cancelled"/>
          Cancelled
        </button>
      )}

      {status === "Completed" && (
        <button
          className="mt-4 h-[37px] md:h-[40px] w-full rounded-xl bg-[#7b7b7b] text-black font-medium flex items-center justify-center gap-2"
        >
          <Image src="/check-svgrepo-com.svg" width={20} height={20} alt="Completed"/>
          Completed
        </button>
      )}

    </div>
  );
}

function OpenDisputeScreen({
  order,
  supabase,
  onNext
}: {
  order: any
  supabase: any
  onNext:()=>void
}) {
  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="text-white text-[32px] text-center max-w-[420px]">
          Open Dispute
        </div>
        <div className="text-white/50 text-[17px] text-center max-w-[420px]">
          Before you open dispute you have to read all the information in the next page carefully
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>

            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
          >
            <Image src="/eye-show-svgrepo-com.svg" width={22} height={22} alt="refund" className='mb-0.5 mr-1.5'/>
            Review
          </button>
        </div>
          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    </div>
  )
}

function BuyerRefundScreen({
  order,
  onClose,
  supabase,
  onRefund
}: {
  order: any
  onClose: () => void
  supabase: any
  onRefund: (order:any) => void
}) {
  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Refund</div>

        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="text-white text-[32px] text-center max-w-[420px]">
          Refund
        </div>
        <div className="text-white/50 text-[17px] text-center max-w-[420px]">
          You will got your funded money back.
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>

            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
          >
            <Image src="/refund-forward-svgrepo-com (1).svg" width={22} height={22} alt="refund" className='mb-0.5 mr-1.5'/>
            Refund
          </button>
        </div>
          <button
            onClick={()=>onRefund(order)}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Refund
          </button>
      </div>
    </div>
  )
}

function SellerCancelScreen({
  order,
  onClose,
  supabase,
  onRefund
}: {
  order: any
  onClose: () => void
  supabase: any
  onRefund: (order:any) => void
}) {
  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Cancel</div>

        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="text-white text-[32px] text-center max-w-[420px]">
          Cancel
        </div>
        <div className="text-white/50 text-[17px] text-center max-w-[420px]">
          After you click Cancel you and buyer will get all the money back and this order will be cancel
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>

            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-[#510000] text-[#FF0000] flex items-center justify-center font-medium"
          >
            <Image src="/cancel-red-svgrepo-com.svg" width={12} height={12} alt="cancel" className='mb-0.5 mr-1.5'/>
            Cancel
          </button>
        </div>
          <button
            onClick={()=>onRefund(order)}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Cancel
          </button>
      </div>
    </div>
  )
}

function WYNTKRespondScreen({
  order,
  onClose,
  supabase,
  onBack,
  onNext,
  step
}: {
  order: any
  onClose: () => void
  supabase: any
  onBack:()=>void
  onNext: () => void
  step: number
}) {

  type Step = "wyntk" | "1" | "2" | "3" | "respond" 

  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
    {/* top bar */}
    <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
      {/* LEFT */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Back"
        >
          <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
        </button>

        <div className="text-white text-[18px] font-medium truncate">
          Respond Dispute
        </div>
      </div>

      {/* RIGHT */}
      <button
        type="button"
        onClick={onClose}
        className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
        title="Close"
      >
        <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
      </button>
    </div>
    {/* BODY */}
    {step === 0 && (
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="w-20 h-20 rounded-full bg-[#402F11] flex items-center justify-center mb-2">
          <Image src="/info-svgrepo-com.svg" width={40} height={40} alt="info" />
        </div>
        <div className="text-white text-[32px] text-center max-w-[420px]">
          What you need to know before respond dispute
        </div>

          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    )}
    {step === 1 && (
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="flex items-center justify-center mb-2">
          <Image src="/discuss-svgrepo-com (2).svg" width={70} height={70} alt="discuss" />
        </div>
        <div className="text-white text-[24px] text-center max-w-[420px]">
          After you respond dispute you will have 24 hours to discuss with the buyer
        </div>

          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    )}
    {step === 2 && (
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="flex items-center justify-center mb-2">
          <Image src="/reply-svgrepo-com (2).svg" width={70} height={70} alt="return" />
        </div>
        <div className="text-white text-[22px] text-center max-w-[420px]">
          During the discussion you can return money to the buyer and you will get all your money back
        </div>

          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    )}
    {step === 3 && (
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="flex items-center justify-center mb-2">
          <Image src="/time-svgrepo-com (2).svg" width={70} height={70} alt="time" />
        </div>
        <div className="text-white text-[22px] text-center max-w-[420px]">
          If discussion time ends but buyer or seller didn’t do anything this dispute will ends in draw and both seller and buyer will lose all their money
        </div>

          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    )}
    </div>
  )
}

function RespondDisputeWyntkScreen({
  order,
  onClose,
  supabase,
  onBack,
  onNext
}: {
  order: any
  onClose: () => void
  supabase: any
  onBack: () => void
  onNext: () => void
}) {
  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
    {/* top bar */}
    <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
      {/* LEFT */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Back"
        >
          <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
        </button>

        <div className="text-white text-[18px] font-medium truncate">
          Respond Dispute
        </div>
      </div>

      {/* RIGHT */}
      <button
        type="button"
        onClick={onClose}
        className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
        title="Close"
      >
        <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
      </button>
    </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="text-white text-[32px] text-center max-w-[420px]">
          Respond Dispute
        </div>
        <div className="text-white/50 text-[17px] text-center max-w-[420px]">
          After you respond dispute you have 24 hours to discuss with the buyer
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>

            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
          >
            <Image src="/reply-svgrepo-com (1).svg" width={17} height={17} alt="Respond" className='mb-0.5 mr-1.5'/>
            Respond
          </button>
        </div>
          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Respond Dispute
          </button>
      </div>
    </div>
  )
}

function RespondDisputeScreen({
  order,
  onClose,
  supabase,
  onNext
}: {
  order: any
  onClose: () => void
  supabase: any
  onNext: () => void
}) {
  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Respond Dispute</div>

        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="text-white text-[32px] text-center max-w-[420px]">
          Respond Dispute
        </div>
        <div className="text-white/50 text-[17px] text-center max-w-[420px]">
          Before you respond to this dispute you have to read all the information in the next page carefully
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>

            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
          >
            <Image src="/reply-svgrepo-com (1).svg" width={17} height={17} alt="Respond" className='mb-0.5 mr-1.5'/>
            Respond
          </button>
        </div>
          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    </div>
  )
}

function PaySellerDiscussScreen({
  order,
  onClose,
  supabase,
  onNext
}: {
  order: any
  onClose: () => void
  supabase: any
  onNext: () => void
}) {
  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Pay Seller During Discuss</div>

        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="text-white text-[32px] text-center max-w-[420px]">
          Pay Seller
        </div>
        <div className="text-white/50 text-[17px] text-center max-w-[420px]">
          After you click Pay Seller will get paid and you will get your bond money back
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>

            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
          >
            <Image src="/dollar-sign-svgrepo-black-com.svg" width={17} height={17} alt="Dollar" className='mb-0.5 mr-1.5'/>
            Pay Seller
          </button>
        </div>
          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Pay Seller
          </button>
      </div>
    </div>
  )
}

function RefundBuyerDiscussScreen({
  order,
  onClose,
  supabase,
  onNext
}: {
  order: any
  onClose: () => void
  supabase: any
  onNext: () => void
}) {
  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Refund During Discuss</div>

        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="text-white text-[32px] text-center max-w-[420px]">
          Refund
        </div>
        <div className="text-white/50 text-[17px] text-center max-w-[420px]">
          After you click refund everyone will get all their money back
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>

            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
          >
            <Image src="/dollar-sign-svgrepo-black-com.svg" width={17} height={17} alt="Dollar" className='mb-0.5 mr-1.5'/>
            Refund Buyer
          </button>
        </div>
          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Refund
          </button>
      </div>
    </div>
  )
}

function RefundScreen({
  order,
  onClose,
  supabase,
  onNext
}: {
  order: any
  onClose: () => void
  supabase: any
  onNext: () => void
}) {
  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Refund</div>

        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="text-white text-[32px] text-center max-w-[420px]">
          Refund
        </div>
        <div className="text-white/50 text-[17px] text-center max-w-[420px]">
          After you click refund everyone will get all their money back
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>

            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
          >
            <Image src="/reply-svgrepo-com (1).svg" width={17} height={17} alt="Respond" className='mb-0.5 mr-1.5'/>
            Respond
          </button>
        </div>
          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Refund
          </button>
      </div>
    </div>
  )
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();

  return "/file-svgrepo-com (3).svg";
}

function UploadFileScreen({
  order,
  onClose,
  supabase,
  onSendFile
}: {
  order: any
  onClose: () => void
  supabase: any
  onSendFile: (order: any, file: File) => Promise<void>
}) {
  const [step, setStep] = React.useState<"upload" | "confirm">("upload");
  const [imageUrl, setImageUrl] = React.useState<string>("");

  const [sending, setSending] = React.useState(false);

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
      {step === "upload" && (
        <>
          <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
            <div className="text-white text-[18px] font-medium">Upload File</div>

            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
            >
              <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
            </button>
          </div>
        </>
      )}

      {step === "confirm" && (
        <>
          <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
                title="Back"
              >
                <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
              </button>

              <div className="text-white text-[18px] font-medium truncate">
                Upload File
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
              title="Close"
            >
              <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
            </button>
          </div>
        </>
      )}

      {step === "upload" && (
        <>
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="text-white text-[32px] text-center max-w-[420px]">
              Upload file
            </div>

            <div className="text-white/50 text-[17px] text-center max-w-[420px]">
              Since this is a digital product, just upload the file and click send to deliver it to the buyer.
            </div>

            <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
              <div className="flex gap-2 mb-3">
                <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                  {order.type === "digital" ? "Digital" : "Physical"}
                </div>

                {order.type === "physical" && (
                  <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                    {order.dispute_mode === "BTR" ? "BTR" : "STR"}
                  </div>
                )}

                <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                  {order.type === "digital"
                    ? `${order.ship_time_hours}h`
                    : order.ship_date}
                </div>
              </div>

              <div className="flex gap-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    className="w-[80px] h-[80px] rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
                )}

                <div>
                  <div className="text-[#26D9D9] text-xl font-bold">
                    {order.order_name}
                  </div>

                  <div className="text-white text-2xl">
                    ${order.price_usd}
                  </div>

                  <div className="text-white/50 text-sm">
                    {order.description}
                  </div>
                </div>
              </div>

              <button
                className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
              >
                <Image src="/upload-svgrepo-com (1).svg" width={16} height={16} alt="upload" className='mb-0.5 mr-1.5'/>
                Upload file
              </button>
            </div>

            <button
              onClick={() => setStep("confirm")}
              className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === "confirm" && (
        <>
          <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
            <div className="text-white text-[26px] text-center">
              Upload file
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setSelectedFile(file);
              }}
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-[340px] h-[180px] rounded-2xl bg-[#222222] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#2a2a2a] transition"
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#26D9D9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>

                <div className="text-white/40 text-[13px]">
                  Upload file here
                </div>
              </button>
            ) : (
              <div className="w-full max-w-[340px] rounded-xl bg-[#222222] px-3 py-2 flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <img
                    src={getFileIcon(selectedFile.name)}
                    alt="file"
                    className="w-10 h-10 object-contain shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/document-ui-description-svgrepo-com.svg";
                    }}
                  />

                  <div className="min-w-0">
                    <div className="text-[#d9d9d9] text-[14px] truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-[#666] text-[12px]">
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-[#d9d9d9] text-[18px] leading-none shrink-0"
                >
                  ×
                </button>
              </div>
            )}

            <button
              disabled={!selectedFile || sending}
              onClick={async () => {
                if (!selectedFile) return;

                try {
                  setSending(true);
                  await onSendFile(order, selectedFile);
                  onClose();
                } catch (err: any) {
                  console.error(err);
                  alert(err.message || "Upload failed");
                } finally {
                  setSending(false);
                }
              }}
              className={`h-[48px] rounded-xl font-bold text-[16px] w-full max-w-[340px] transition mt-[-8px]
                ${
                  selectedFile && !sending
                    ? "bg-[#26D9D9] text-black hover:opacity-90"
                    : "bg-[#136262] text-black cursor-not-allowed"
                }`}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DownloadScreen({
  order,
  onClose,
  supabase,
}: {
  order: any
  onClose: () => void
  supabase: any
}) {
  const [step, setStep] = React.useState<"intro" | "download">("intro");
  const [imageUrl, setImageUrl] = React.useState<string>("");
  const [downloadUrl, setDownloadUrl] = React.useState<string>("");
  const [loadingFile, setLoadingFile] = React.useState(false);

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  async function goToDownloadStep() {
    try {
      setLoadingFile(true);

      if (!order?.delivery_file_path) {
        alert("No delivery file found");
        return;
      }

      const { data, error } = await supabase.storage
        .from("digital-delivery")
        .createSignedUrl(order.delivery_file_path, 60 * 60);

      if (error) {
        console.error("digital delivery signed url error:", error);
        alert(error.message);
        return;
      }

      setDownloadUrl(data.signedUrl);
      setStep("download");
    } finally {
      setLoadingFile(false);
    }
  }

  function handleDownload() {
    if (!downloadUrl) return;

    window.open(downloadUrl, "_blank");
  }

  const fileName =
    order?.delivery_file_name ||
    order?.delivery_file_path?.split("/").pop() ||
    "download-file";

  const fileSizeText = formatFileSize(Number(order?.delivery_file_size || 0));

  return (
    <div className="h-full w-full flex flex-col self-stretch">
      {step === "intro" && (
        <div className="w-full h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-white text-[18px] font-medium truncate">
              Download Item
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Close"
          >
            <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
          </button>
        </div>
      )}

      {step === "download" && (
        <div className="w-full h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setStep("intro")}
              className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
              title="Back"
            >
              <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
            </button>

            <div className="text-white text-[18px] font-medium truncate">
              Download File
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Close"
          >
            <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
          </button>
        </div>
      )}

      {step === "intro" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-white text-[32px] text-center max-w-[420px]">
            Download Item
          </div>

          <div className="text-white/50 text-[17px] text-center max-w-[420px]">
            You can get the item file by clicking download on the next page.
          </div>

          <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
            <div className="flex gap-2 mb-3">
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.type === "digital" ? "Digital" : "Physical"}
              </div>

              {order.type === "physical" && (
                <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                  {order.dispute_mode === "BTR" ? "BTR" : "STR"}
                </div>
              )}

              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.type === "digital"
                  ? `${order.ship_time_hours}h`
                  : order.ship_date}
              </div>
            </div>

            <div className="flex gap-4">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  className="w-[80px] h-[80px] rounded-xl object-cover"
                />
              ) : (
                <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
              )}

              <div>
                <div className="text-[#26D9D9] text-xl font-bold">
                  {order.order_name}
                </div>

                <div className="text-white text-2xl">
                  ${order.price_usd}
                </div>

                <div className="text-white/50 text-sm">
                  {order.description}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
            >
              <Image
                src="/download-svgrepo-com.svg"
                width={20}
                height={20}
                alt="download"
                className="mb-0.5 mr-1.5"
              />
              Download
            </button>
          </div>

          <button
            onClick={goToDownloadStep}
            disabled={loadingFile}
            className={`h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] transition
              ${
                loadingFile
                  ? "bg-[#136262] text-black cursor-not-allowed"
                  : "bg-[#26D9D9] text-black hover:opacity-90"
              }`}
          >
            {loadingFile ? "Loading..." : "Next"}
          </button>
        </div>
      )}

      {step === "download" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
          <div className="text-white text-[32px] text-center">
            Dowload File
          </div>

          <div className="text-white/50 text-[17px] text-center max-w-[340px]">
            Review this order after downloading, although the seller is paid automatically.
          </div>

          <div className="w-full max-w-[340px] rounded-xl bg-[#222222] px-3 py-2 flex items-start justify-between gap-3">
            <div className="flex gap-3 min-w-0">
              <img
                src={getFileIcon(fileName)}
                alt="file"
                className="w-10 h-10 object-contain shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/document-ui-description-svgrepo-com.svg";
                }}
              />

              <div className="min-w-0">
                <div className="text-[#d9d9d9] text-[14px] truncate max-w-[220px]">
                  {fileName}
                </div>
                <div className="text-[#666] text-[12px]">
                  {fileSizeText}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={!downloadUrl}
            className={`h-[48px] rounded-xl font-bold text-[16px] w-full max-w-[340px] transition
              ${
                downloadUrl
                  ? "bg-[#26D9D9] text-black hover:opacity-90"
                  : "bg-[#136262] text-black cursor-not-allowed"
              }`}
          >
            Download File
          </button>
        </div>
      )}
    </div>
  );
}

function FundEscrowScreen({
  order,
  onClose,
  supabase,
  onNext
}: {
  order: any
  onClose: () => void
  supabase: any
  onNext: () => void
}) {
  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Buyer Fund Escrow</div>

        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="text-white text-[32px] text-center max-w-[420px]">
          Fund Escrow
        </div>
        <div className="text-white/50 text-[17px] text-center max-w-[420px]">
          Deposit money to Escrow before buying this item.
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>


            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
          >
            <Image src="/dollar-sign-svgrepo-black-com.svg" width={16} height={16} alt="Dollar" className='mb-0.5 mr-1.5'/>
            Fund Escrow
          </button>
        </div>
          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    </div>
  )
}

function SellerFundEscrowScreen({ 
  order,
  onClose,
  supabase,
  onNext
}: {
  order: any
  onClose: () => void
  supabase: any
  onNext: () => void
}) {
  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Seller Fund Escrow</div>

        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="text-white text-[32px] text-center max-w-[420px]">
          Fund Escrow
        </div>
        <div className="text-white/50 text-[17px] text-center max-w-[420px]">
          Pay the bond to start selling. Shipping time starts immediately after payment. If you miss the delivery deadline, you will lose your bond.
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>

            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
          >
            <Image src="/dollar-sign-svgrepo-black-com.svg" width={16} height={16} alt="Dollar" className='mb-0.5 mr-1.5'/>
            Fund Escrow
          </button>
        </div>
          <button
            onClick={onNext}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    </div>
  )
}

function ReadTicks({ read }: { read: boolean }) {
  return (
    <Image
      src={read ? '/read.svg' : '/unread.svg'}
      alt={read ? 'read' : 'unread'}
      width={16}
      height={16}
      className="block shrink-0"
      priority
    />
  );
}

function DisputMode({
  onClose,
  onPick,
  onBack,
}: {
  onClose: () => void;
  onBack: () => void;
  onPick: (type: 'BTR' | 'STR') => void;
}) {
  const [ModeInfo, setModeInfo] = React.useState(false);
  const [ModeInfo1, setModeInfo1] = React.useState(false);
  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Back"
          >
            <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
          </button>

          <div className="text-white text-[18px] font-medium truncate">
            Create Escrow order
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* body */}
      <div className="mb-5 flex-1 flex items-center justify-center">
        <div className="w-full max-w-[720px] px-6 text-center">
          <div className="text-white text-[27px] font-medium mb-10">
            Select Draw Dispute mode
          </div>
          <div className="flex items-center justify-center gap-10">
            {/* Physical */}
            <div className="flex flex-col items-center gap-4">

              <button
                type="button"
                onClick={() => onPick('BTR')}
                className="w-[138px] h-[138px] rounded-[18px] bg-[#262626] hover:bg-[#303030] transition grid place-items-center"
              >
                <span className="text-[#26D9D9] text-[60px] font-bold whitespace-nowrap">
                  B
                </span>

              </button>

              <div className="flex flex-1 justify-center">
                <div
                  className="relative flex items-center group"
                  onMouseEnter={() => setModeInfo1(true)}
                  onMouseLeave={() => setModeInfo1(false)}
                >
                  <div className="text-[#A6A6A6] text-[18px]">BTR</div>
                  <Image
                    src="/question-circle-svgrepo-com.svg"
                    width={18}
                    height={18}
                    alt="info"
                    onClick={() => setModeInfo1((prev) => !prev)}
                    className="mb-0.5 ml-3 cursor-pointer opacity-70 hover:opacity-100"
                  />

                  {ModeInfo1 && (
                    <div
                      className="absolute z-50 mt-8
                                left-1/2 -translate-x-1/2
                                top-0
                                w-[260px] p-3
                                rounded-[8px]
                                bg-[#1A1A1A]
                                text-white text-[12px]
                                shadow-xl
                                border border-white/10"
                    >
                      When a Dispute end in draw buyer will lose the most amount of money.
                    </div>
                      )}
                  </div>
                </div>
              </div>

            {/* Digital */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => onPick('STR')}
                className="w-[138px] h-[138px] rounded-[18px] bg-[#262626] hover:bg-[#303030] transition grid place-items-center"
              >
                <span className="text-[#26D9D9] text-[60px] font-bold whitespace-nowrap">
                  S
                </span>
              </button>

              <div className="flex flex-1 justify-center">
                <div
                  className="relative flex items-center group"
                  onMouseEnter={() => setModeInfo(true)}
                  onMouseLeave={() => setModeInfo(false)}
                >
                  <div className="text-[#A6A6A6] text-[18px]">STR</div>
                  <Image
                    src="/question-circle-svgrepo-com.svg"
                    width={18}
                    height={18}
                    alt="info"
                    onClick={() => setModeInfo((prev) => !prev)}
                    className="mb-0.5 ml-3 cursor-pointer opacity-70 hover:opacity-100"
                  />

                  {ModeInfo && (
                    <div
                      className="absolute z-50 mt-8
                                left-1/2 -translate-x-1/2
                                top-0
                                w-[260px] p-3
                                rounded-[8px]
                                bg-[#1A1A1A]
                                text-white text-[12px]
                                shadow-xl
                                border border-white/10"
                    >
                      When a Dispute end in draw seller will lose the most amount of money. and seller have to deposit more bond than BTR mode.
                    </div>
                      )}
                  </div>
                </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarkShippedScreen({
  order,
  onClose,
  supabase,
  onConfirm
}:{
  order:any
  onClose:()=>void
  supabase:any
  onConfirm:(order:any)=>void
}){

  const [imageUrl,setImageUrl] = React.useState("")

  React.useEffect(()=>{
    if(!order?.image_path) return

    async function load(){
      const {data} = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path,60*60)

      if(data) setImageUrl(data.signedUrl)
    }

    load()
  },[order])

  return (
    <div className="h-full flex flex-col">

      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">
          Mark as Shipped
        </div>

        <button onClick={onClose}>
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X"/>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <Image src="/warn-triangle-filled-svgrepo-com (1).svg" width={45} height={45} alt="warn"/>

        <div className="text-orange-500 text-center max-w-[420px] text-[16px]">
          If you lie that you shipped this item buyer will open dispute
          and you possibly will lose your bond
        </div>

        <div className="w-[360px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>

            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2"
          >
            <Image src="/check-svgrepo-com.svg" width={22} height={22} alt="Dollar"/>
            Mark as Shipped
          </button>
        </div>

        <button
          onClick={()=>onConfirm(order)}
          className="h-[46px] w-full max-w-[420px] rounded-[10px] bg-[#26D9D9] text-black font-semibold"
        >
          Mark this order as Shipped
        </button>

      </div>
    </div>
  )
}

function FundModeWarning({
  mode,
  onContinue,
  onClose
}:{
  mode:"BTR"|"STR"
  onContinue:()=>void
  onClose:()=>void
}){

  const text =
    mode === "BTR"
      ? "This order uses BTR Mode. If a dispute ends in a draw, the buyer loses more money."
      : "This order uses STR Mode. If a dispute ends in a draw, the seller loses more money."

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Buyer Fund Escrow</div>

        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-[340px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-5 flex gap-4">
          {/* Info Icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#3D3216] flex items-center justify-center">
              <Image src="/info-svgrepo-com.svg" width={18} height={18} alt="i"/>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-col gap-1">
            <div className="text-[#F8EDC2] font-semibold text-base">
              {mode} Mode Enable
            </div>
            <div className="text-white/80 text-sm leading-relaxed">
              {text}
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-[337px] h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold"
        >
          Continue
        </button>

      </div>
    </div>
  )
}

function SellerEscrowFundedScreen({
  tx,
  shippingDeadline,
  onClose,
  order,
  supabase
}:{
  tx:string
  shippingDeadline:number
  onClose:()=>void
  order: any
  supabase: any
}){

  const [imageUrl,setImageUrl] = React.useState("")

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Seller Fund Escrow</div>
        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* Main Content */}
      <div className="mb-4 flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Warning Section */}
        <div className="mb-2 flex flex-col items-center gap-2">
          <Image src="/warn-triangle-filled-svgrepo-com (1).svg" width={45} height={45} alt="Warn" />

          {order.type === "physical" && (
            <div className="text-orange-500 text-center text-[16px] font-bold max-w-[420px]">
              You have to ship this item before{" "}
              {new Date(shippingDeadline * 1000).toISOString().slice(0, 10)}
            </div>
          )}

          {order.type === "digital" && (
            <div className="text-orange-500 text-center text-[16px] font-bold max-w-[420px]">
              You have to ship this item in{" "}
              {order.ship_time_hours} hours
            </div>
          )}

          <div className="text-white/50 text-sm font-medium">
            Although You will lose your bond
          </div>
        </div>

        {/* Success Icon */}
        <div className="w-[120px] h-[120px] rounded-full bg-green-500 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path
              d="M5 13l4 4L19 7"
              stroke="black"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="text-white text-3xl">Escrow Funded</div>

        {/* Tx Link */}
        <a
          href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#FFFFFF] transition cursor-pointer"
        >
          <Image
            src="/share-2-svgrepo-com (1).svg"
            width={18}
            height={18}
            alt="solscan"
          />
          <span>{tx.slice(0, 6)}...{tx.slice(-4)}</span>
        </a>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-[320px] h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold mt-4"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function BuyerReFundedScreen({
  tx,
  onClose
}:{
  tx:string
  onClose:()=>void
}){

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Refund</div>
        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* Main Content */}
      <div className="mb-4 flex-1 flex flex-col items-center justify-center p-6 gap-6">

        {/* Success Icon */}
        <div className="w-[120px] h-[120px] rounded-full bg-green-500 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path
              d="M5 13l4 4L19 7"
              stroke="black"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="text-white text-3xl">Refunded</div>

        {/* Tx Link */}
        <a
          href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#FFFFFF] transition cursor-pointer"
        >
          <Image
            src="/share-2-svgrepo-com (1).svg"
            width={18}
            height={18}
            alt="solscan"
          />
          <span>{tx.slice(0, 6)}...{tx.slice(-4)}</span>
        </a>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-[320px] h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold mt-4"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function SellerRespondedDisputeScreen({
  tx,
  onClose,
}:{
  tx:string
  onClose:()=>void
}){

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Respond Dispute</div>
        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* Main Content */}
      <div className="mb-4 flex-1 flex flex-col items-center justify-center p-6 gap-6">

        {/* Success Icon */}
        <div className="w-[120px] h-[120px] rounded-full bg-green-500 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path
              d="M5 13l4 4L19 7"
              stroke="black"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="text-white text-3xl">Responded Dispute</div>

        {/* Tx Link */}
        <a
          href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#FFFFFF] transition cursor-pointer"
        >
          <Image
            src="/share-2-svgrepo-com (1).svg"
            width={18}
            height={18}
            alt="solscan"
          />
          <span>{tx.slice(0, 6)}...{tx.slice(-4)}</span>
        </a>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-[320px] h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold mt-4"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function SellerCancelledScreen({
  tx,
  onClose
}:{
  tx:string
  onClose:()=>void
}){

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Cancel</div>
        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* Main Content */}
      <div className="mb-4 flex-1 flex flex-col items-center justify-center p-6 gap-6">

        {/* Success Icon */}
        <div className="w-[120px] h-[120px] rounded-full bg-green-500 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path
              d="M5 13l4 4L19 7"
              stroke="black"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="text-white text-3xl">Cancelled</div>

        {/* Tx Link */}
        <a
          href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#FFFFFF] transition cursor-pointer"
        >
          <Image
            src="/share-2-svgrepo-com (1).svg"
            width={18}
            height={18}
            alt="solscan"
          />
          <span>{tx.slice(0, 6)}...{tx.slice(-4)}</span>
        </a>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-[320px] h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold mt-4"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function SellerMarkShippedScreen({ 
  tx,
  onClose
}:{
  tx:string
  onClose:()=>void
}){

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
        <div className="text-white text-[18px] font-medium">Mark as Shipped</div> 
        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      {/* Main Content */}
      <div className="mb-4 flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Warning Section */}
        <div className="mb-2 flex flex-col items-center gap-2">
          <Image src="/warn-triangle-filled-svgrepo-com (1).svg" width={45} height={45} alt="Warn" />
          <div className="text-orange-500 text-center text-[16px] max-w-[420px]">
            The buyer has 24 hours to confirm or dispute. If they take no action, you'll be paid automatically.
          </div>
        </div>

        {/* Success Icon */}
        <div className="w-[120px] h-[120px] rounded-full bg-green-500 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path
              d="M5 13l4 4L19 7"
              stroke="black"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="text-white text-3xl">Marked as Shipped</div>

        {/* Tx Link */}
        <a
          href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 text-sm hover:text-[#FFFFFF] transition cursor-pointer"
        >
          <Image
            src="/share-2-svgrepo-com (1).svg"
            width={18}
            height={18}
            alt="solscan"
          />
          <span>{tx.slice(0, 6)}...{tx.slice(-4)}</span>
        </a>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-[320px] h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold mt-4"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function FundEscrowConfirm({
  order,
  onBack,
  onFund,
  supabase,
  onClose
}:{
  order: any
  onBack: any
  onFund: any
  supabase: any
  onClose:()=>void
}){

  const bond = order.price_usd * 0.2
  const fee = order.price_usd * 0.01
  const total = order.price_usd + bond + fee

  const [imageUrl, setImageUrl] = React.useState<string>("");


  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  const [solPrice, setSolPrice] = React.useState<number>(0);

  React.useEffect(() => {
    async function loadPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        const data = await res.json();
        setSolPrice(data.solana.usd);
      } catch (err) {
        console.error(err);
      }
    }

    loadPrice();
  }, []);

  return (
    <div className="h-full flex flex-col">

      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Back"
          >
            <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
          </button>

          <div className="text-white text-[18px] font-medium truncate">
            Buyer Fund Escrow
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        <div className="text-white text-2xl">
          You have to pay
        </div>
        {imageUrl ? (
          <img
            src={imageUrl}
            className="w-[140px] h-[140px] rounded-xl object-cover"
          />
        ) : (
          <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
        )}
        {/* card */}
        <div className="w-full max-w-[300px] border-t border-white/10 pt-4 space-y-3">

          <div className="flex justify-between text-white/70 text-[15px]">
            <span>Item’s Price:</span>
            <span className='text-[11px] mt-1'>
              {(order.price_usd / solPrice).toFixed(5)} SOL
            </span>
            <span>${order.price_usd}</span>
          </div>

          <div className="flex justify-between text-white/70 text-[15px]">
            <span>Bond (20%):</span>
            <span className='text-[11px] mt-1'>
              {(bond / solPrice).toFixed(5)} SOL
            </span>
            <span>${bond}</span>
          </div>

          <div className="flex justify-between text-white/70 text-[15px]">
            <span>Fee (%1):</span>
            <span className='text-[11px] mt-1'>
              {(fee / solPrice).toFixed(5)} SOL
            </span>
            <span>${fee}</span>
          </div>

          <div className="border-t border-white/10 pt-3 mt-3 flex justify-between text-white text-[18px] font-semibold">
            <span>Total</span>
            <span className='text-[14px] mt-1'>
              {(total / solPrice).toFixed(5)} SOL
            </span>
            <span>${total}</span>
          </div>

        </div>

        <button
          onClick={onFund}
          className="h-[46px] rounded-[10px] font-semibold w-full max-w-[320px] bg-[#26D9D9] text-black hover:opacity-90 transition"
        >
          Fund Escrow
        </button>

      </div>
    </div>
  )
}

function SellerFundEscrowConfirm({
  order,
  onBack,
  onFund,
  supabase,
  onClose
}:{
  order: any
  onBack: any
  onFund: any
  supabase: any
  onClose:()=>void
}){

  const price = order.price_usd
  const bond = order.dispute_mode === "STR"
    ? price * 1.2
    : price * 0.2
  const fee = order.price_usd * 0.01
  const total = bond + fee

  const [imageUrl, setImageUrl] = React.useState<string>("");


  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  const [solPrice, setSolPrice] = React.useState<number>(0);

  React.useEffect(() => {
    async function loadPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        const data = await res.json();
        setSolPrice(data.solana.usd);
      } catch (err) {
        console.error(err);
      }
    }

    loadPrice();
  }, []);

  return (
    <div className="h-full flex flex-col">

      {/* top bar */}
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Back"
          >
            <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
          </button>

          <div className="text-white text-[18px] font-medium truncate">
            Seller Fund Escrow
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        <div className="text-white text-2xl">
          You have to pay
        </div>
        {imageUrl ? (
          <img
            src={imageUrl}
            className="w-[140px] h-[140px] rounded-xl object-cover"
          />
        ) : (
          <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
        )}
        {/* card */}
        <div className="w-full max-w-[300px] border-t border-white/10 pt-4 space-y-3">
          {order.dispute_mode === "BTR" && (
            <div className="flex justify-between text-white/70 text-[15px]">
              <span>Bond (20%):</span>
              <span className='text-[11px] mt-1'>
                {(bond / solPrice).toFixed(5)} SOL
              </span>
              <span>${bond}</span>
            </div>
          )}

          {order.dispute_mode === "STR" && (
            <div className="flex justify-between text-white/70 text-[15px]">
              <span>Bond (120%):</span>
              <span className='text-[11px] mt-1'>
                {(bond / solPrice).toFixed(5)} SOL
              </span>
              <span>${bond}</span>
            </div>
          )}

          <div className="flex justify-between text-white/70 text-[15px]">
            <span>Fee (%1):</span>
            <span className='text-[11px] mt-1'>
              {(fee / solPrice).toFixed(5)} SOL
            </span>
            <span>${fee}</span>
          </div>

          <div className="border-t border-white/10 pt-3 mt-3 flex justify-between text-white text-[18px] font-semibold">
            <span>Total</span>
            <span className='text-[14px] mt-1'>
              {(total / solPrice).toFixed(5)} SOL
            </span>
            <span>${total}</span>
          </div>

        </div>

        <button
          onClick={onFund}
          className="h-[46px] rounded-[10px] font-semibold w-full max-w-[320px] bg-[#26D9D9] text-black hover:opacity-90 transition"
        >
          Fund Escrow
        </button>

      </div>
    </div>
  )
}

function BuyerConfirmedMessage({
  order,
}:{
  order:any
}){

  return (
    <div className="w-full max-w-[680px]">

      <div className="w-full max-w-[400px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2 text-[#26D9D9] text-sm font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>

          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            })}
          </div>

        </div>

        <div className="text-white text-[18px] mb-2">
          {order.buyer_name} has confirmed the escrow “{order.order_name}”
        </div>

        <div className="flex items-center gap-2 text-[#50D926] text-sm mb-4">
          <span className="w-2 h-2 rounded-full bg-[#50D926]"></span>
          Deal done
        </div>

        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <div className="text-white/50 text-sm">
            Seller got paid and Buyer got all bonds money back
          </div>

        </div>

        <div>
        </div>
      </div>

    </div>
  )
}

function PaidSellerMessage({
  order,
}:{
  order:any
}){

  return (
    <div className="w-full max-w-[680px]">

      <div className="w-full max-w-[400px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2 text-[#26D9D9] text-sm font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>

          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            })}
          </div>

        </div>

        <div className="text-white text-[16px] md:text-[18px] mb-2">
          {order.buyer_name} has paid seller for the order “{order.order_name}”
        </div>

        <div className="flex items-center gap-2 text-[#50D926] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#50D926]"></span>
          Deal done
        </div>

        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <div className="text-white/50 text-[12px] md:text-[14px]">
            Seller got paid and Buyer got all bonds money back
          </div>

        </div>

        <div>
        </div>
      </div>

    </div>
  )
}

function SellerRefundedMessage({
  order,
}:{
  order:any
}){

  return (
    <div className="w-full max-w-[680px]">

      <div className="w-full max-w-[400px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2 text-[#26D9D9] text-sm font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>

          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            })}
          </div>

        </div>

        <div className="text-white text-[16px] md:text-[18px] mb-2">
          {order.seller_name} refunded the order “{order.order_name}”
        </div>

        <div className="flex items-center gap-2 text-[#50D926] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#50D926]"></span>
          Deal done.
        </div>

        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <div className="text-white/50 text-[12px] md:text-[14px]">
            Everyone got all their money back
          </div>

        </div>

        <div>
        </div>
      </div>

    </div>
  )
}

function ShippingTimeoutMessage({
  order,
}:{
  order:any
}){

  return (
    <div className="w-full max-w-[445px]">

      <div className="w-full max-w-[680px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2 text-[#26D9D9] text-sm font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>

          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            })}
          </div>

        </div>

        <div className="text-white text-[16px] md:text-[18px] mb-2">
          Shipping time has expired.
        </div>

        <div className="flex items-center gap-2 text-[#50D926] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#50D926]"></span>
          Deal done.
        </div>
    
        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <div className="text-white/50 text-[12px] md:text-[14px]">
            {order.seller_name} loses 20% of the item's price half of that goes to {order.buyer} and other half goes to treasury
          </div>
        </div>
      </div>

    </div>
  )
}

function ConfirmTimeoutMessage({
  order,
}:{
  order:any
}){

  return (
    <div className="w-full max-w-[445px]">

      <div className="w-full max-w-[680px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2 text-[#26D9D9] text-sm font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>

          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            })}
          </div>

        </div>

        <div className="text-white text-[16px] md:text-[18px] mb-2">
          Confirm time has expired.
        </div>

        <div className="flex items-center gap-2 text-[#50D926] text-[12px] md:text-[14px]mb-4">
          <span className="w-2 h-2 rounded-full bg-[#50D926]"></span>
          Deal done.
        </div>
    
        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <div className="text-white/50 text-[12px] md:text-[14px]">
            {order.seller_name} has been paid and has received all bond money back and {order.buyer_name} has also received all of their bond money back.
          </div>
        </div>
      </div>

    </div>
  )
}

function DiscussTimeoutMessage({
  order,
}:{
  order:any
}){

  return (
    <div className="w-full max-w-[445px]">

      <div className="w-full max-w-[680px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2 text-[#26D9D9] text-sm font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>

          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            })}
          </div>

        </div>

        <div className="text-white text-[16px] md:text-[18px] mb-2">
          Discuss time has expired.
        </div>

        <div className="flex items-center gap-2 text-[#50D926] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#50D926]"></span>
          Deal done.
        </div>
    
        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <div className="text-white/50 text-[12px] md:text-[14px]">
            Everyone lost all their money.
          </div>
        </div>
      </div>

    </div>
  )
}

function RespondTimeoutMessage({
  order,
}:{
  order:any
}){
  return (
    <div className="w-full max-w-[445px]">

      <div className="w-full max-w-[680px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2 text-[#26D9D9] text-sm font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>

          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            })}
          </div>

        </div>

        <div className="text-white text-[16px] md:text-[18px] mb-2">
          Respond time has expired. {order.buyer_name} won this dispute
        </div>

        <div className="flex items-center gap-2 text-[#50D926] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#50D926]"></span>
          Deal done.
        </div>
    
        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <div className="text-white/50 text-[12px] md:text-[14px]">
            {order.seller_name} loses 20% of the item's price half of that goes to {order.buyer_name} and other half goes to treasury. {order.buyer_name} gets a full refund.
          </div>
        </div>
      </div>

    </div>
  )
}

function EscrowUpdateMessage({
  order,
  viewerId,
  onFundEscrow,
  onRefund
}:{
  order:any
  viewerId:string | null
  onFundEscrow?: (order:any) => void
  onRefund?: (order:any)=>void
}){

  const isBuyer = order?.buyer_id === viewerId
  const isSeller = order?.seller_id === viewerId

  return (
    <div className="w-full max-w-[680px]">

      <div className="w-full max-w-[680px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2 text-[#26D9D9] text-[14px] font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>

          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            })}
          </div>

        </div>

        <div className="text-white text-[16px] md:text-[18px] mb-2">
          {order.buyer_name} has funded the escrow for “{order.order_name}”
        </div>

        <div className="flex items-center gap-2 text-[#F4B400] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F4B400]"></span>
          Waiting for {order.seller_name} to fund and continue...
        </div>
    
        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
        {isBuyer && (  
          <div className="text-white/50 text-[12px] md:text-[14px]">
            You can get funded money back
          </div>
          )}
          {isBuyer && (  
            <button onClick={() => onRefund?.(order)} className="px-4 py-1 rounded-full bg-white text-black md:text-[16px] text-[14px] font-medium">
              Refund
            </button>
          )}

        {isSeller && (  
          <div className="text-white/50 text-[12px] md:text-[14px]">
            Click here to
          </div>
          )}
          {isSeller && (  
            <button 
              onClick={() => onFundEscrow?.(order)}
              className="px-4 py-1 rounded-full bg-white text-black md:text-[16px] text-[14px] font-medium">
              Fund Escrow
            </button>
          )}
        </div>
      </div>

    </div>
  )
}

function BuyerRefundedMessage({
  order,
}:{
  order:any
}){
  return (
    <div className="w-full max-w-[680px]">

      <div className="w-full max-w-[680px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2 text-[#26D9D9] text-sm font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>

          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            })}
          </div>

        </div>

        <div className="text-white text-[16px] md:text-[18px] mb-2">
          {order.buyer_name} has cancel the order “{order.order_name}”
        </div>

        <div className="flex items-center gap-2 text-[#50D926] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#50D926]"></span>
          Deal done
        </div>
    
        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <div className="text-white/50 text-[12px] md:text-[14px]">
            Everyone got all their money back
          </div>

        </div>
      </div>

    </div>
  )
}

function SellerCancelledMessage({
  order,
}:{
  order:any
}){
  return (
    <div className="w-full max-w-[680px]">

      <div className="w-full max-w-[680px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2 text-[#26D9D9] text-sm font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>

          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            })}
          </div>

        </div>

        <div className="text-white text-[16px] md:text-[18px] mb-2">
          {order.seller_name} has cancel the order “{order.order_name}”
        </div>

        <div className="flex items-center gap-2 text-[#50D926] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#50D926]"></span>
          Deal done
        </div>
    
        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <div className="text-white/50 text-[12px] md:text-[14px]">
            Everyone got all their money back
          </div>

        </div>
      </div>

    </div>
  )
}

function makeConversationId(a: string, b: string) {
  return [a, b].sort().join('__');
}

function pickDisplayName(user: any) {
  const d = user?.user_metadata?.display_name;
  if (typeof d === 'string' && d.trim()) return d.trim();

  const g =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.preferred_username;

  if (typeof g === 'string' && g.trim()) return g.trim();

  const email = user?.email;
  if (typeof email === 'string' && email.includes('@')) return email.split('@')[0];

  return 'User';
}

function formatBadge(n: number) {
  if (n <= 0) return '';
  return n > 9 ? '+9' : String(n);
}

function pickAvatarUrl(user: any) {
  const um = user?.user_metadata;

  const direct =
    um?.avatar_url ||
    um?.picture ||
    um?.avatar ||
    um?.photo_url;

  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  const id0 = Array.isArray(user?.identities) ? user.identities[0] : null;
  const idData = id0?.identity_data;

  const fromIdentity =
    idData?.avatar_url ||
    idData?.picture ||
    idData?.photo_url;

  if (typeof fromIdentity === 'string' && fromIdentity.trim()) return fromIdentity.trim();

  return '/profile.jpg';
}

type ContactListItem = {
  id: string;
  username: string;
  avatar: string;
  subtitle?: string;
  lastAt?: string;
  lastSenderId?: string;
  lastReadAt?: string | null; 
  unreadCount?: number;
};

type DbMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

function isImagePathMessage(body: string) {
  return typeof body === 'string' && body.startsWith('imgpath:');
}

function isEscrowMessage(body: string) {
  return typeof body === 'string' && body.startsWith('escrow:');
}

function lastPreviewText(body: string, isMine: boolean) {
  if (isImagePathMessage(body)) {
    return `${isMine ? 'You: ' : ''}Sent an Image`;
  }
  return `${isMine ? 'You: ' : ''}${body}`;
}

async function compressImage(file: File, maxW = 1280, quality = 0.75): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bmp.width);
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');
  ctx.drawImage(bmp, 0, 0, w, h);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      quality
    );
  });

  return blob;
}

function useCountdown(deadlineSeconds: number) {
  const [remaining, setRemaining] = React.useState(
    Math.max(0, deadlineSeconds - Math.floor(Date.now() / 1000))
  );

  React.useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, deadlineSeconds - Math.floor(Date.now() / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [deadlineSeconds]);

  return remaining;
}

function formatCountdown(seconds: number) {
  if (seconds > 86400) {
    const days = Math.ceil(seconds / 86400);
    return `${days} Day${days !== 1 ? 's' : ''}`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

function SellerShippingMessage({
  order,
  viewerId,
  onMarkShipped,
  onCancel,
  onUploadFile
}: {
  order: any;
  viewerId: string | null;
  onMarkShipped?: (order: any) => void;
  onCancel?: (order: any) => void;
  onUploadFile?: (order: any) => void;
}) {
  const isSeller = order?.seller_id === viewerId;
  const isBuyer  = order?.buyer_id  === viewerId;

  const shippingHours = React.useMemo(() => {
    if (order?.type === 'physical' && order?.ship_date) {
      const deadline = new Date(order.ship_date)
      deadline.setHours(23, 59, 59, 999)
      const fundedAt = order?.seller_funded_at_unix
        ? new Date(order.seller_funded_at_unix * 1000)
        : new Date()
      const diffMs = deadline.getTime() - fundedAt.getTime()
      return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)))
    }
    return Number(order?.ship_time_hours ?? 0)
  }, [order])

  const deadlineSec: number = React.useMemo(() => {
    if (order?.shipping_deadline) return order.shipping_deadline
    if (shippingHours > 0) {
      const fundedAt = order?.seller_funded_at_unix ?? Math.floor(Date.now() / 1000)
      return fundedAt + shippingHours * 3600
    }
    return 0
  }, [order, shippingHours])

  const totalSec = shippingHours * 3600

  const remaining = useCountdown(deadlineSec);

  const progress = totalSec > 0 ? Math.max(0, remaining / totalSec) : 0;

  // SVG ring params
  const R = 70;
  const C = 2 * Math.PI * R;   // circumference
  const dash = progress * C;    // filled arc length
  const gap  = C - dash;

  const deadlineStr = deadlineSec
    ? new Date(deadlineSec * 1000).toISOString().slice(0, 10)
    : '';

  console.log({
    type: order?.type,
    ship_date: order?.ship_date,
    ship_time_hours: order?.ship_time_hours,
    seller_funded_at_unix: order?.seller_funded_at_unix,
    shipping_deadline: order?.shipping_deadline,
    shippingHours,
    deadlineSec,
    totalSec,
    remaining,
    progress,
  })

  return (
    <div className="w-full max-w-[480px]">
      <div className="w-full max-w-[680px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        {/* header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[#26D9D9] text-[14px] font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>
          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* title */}
        <div className="text-white text-[16px] md:text-[18px] mb-1">
          {order.seller_name} has funded the escrow for &ldquo;{order.order_name}&rdquo;
        </div>

        {/* status pill */}
        <div className="flex items-center gap-2 text-[#F4B400] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F4B400]"></span>
          {order.seller_name} is now shipping the item...
        </div>

        {/* ring */}
        <div className="flex flex-col items-center gap-3 py-4">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* track */}
            <circle
              cx="90" cy="90" r={R}
              fill="none"
              stroke="#333"
              strokeWidth="5"
            />

            <circle
              cx="90" cy="90" r={R}
              fill="none"
              stroke="#26D9D9"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={C / 4}
              transform="rotate(-90 90 90)"
            />
            <text
              x="90" y="95"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="22"
              fontWeight="500"
            >
              {formatCountdown(remaining)}
            </text>
          </svg>

          {deadlineStr && isSeller && order.type === "physical" && (
            <div>
              <p className="text-[#ff6b35] text-[12px] md:text-[14px] font-semibold text-center">
                You have to ship this item before the timer ends
              </p>

              <p className="mt-2 text-white/40 text-xs text-center">
                Although you will lose your bond to {order.buyer_name}
              </p>
            </div>
          )}

          {deadlineStr && isSeller && order.type === "digital" && (
            <div>
              <p className="text-[#ff6b35] text-[12px] md:text-[14px] font-semibold text-center">
                You have to ship this item by upload file before the timer ends
              </p>

              <p className="mt-2 text-white/40 text-xs text-center">
                Although you will lose your bond to {order.buyer_name}
              </p>
            </div>
          )}

          {deadlineStr && isBuyer && order.type === "physical" && (
            <div>
              <p className="text-[#ff6b35] text-[12px] md:text-[14px] font-semibold text-center">
                {order.seller_name} have to ship this item before the timer ends.
              </p>

              <p className="mt-2 text-white/40 text-xs text-center">
                Although {order.seller_name} will lose their bond to you
              </p>
            </div>
          )}

          {deadlineStr && isBuyer && order.type === "digital" && (
            <div>
              <p className="text-[#ff6b35] text-[12px] md:text-[14px] font-semibold text-center">
                {order.seller_name} must upload the item's file before the timer ends. After {order.seller_name} uploads it, you can download the file.
              </p>

              <p className="mt-2 text-white/40 text-xs text-center">
                Although {order.seller_name} will lose their bond to you
              </p>
            </div>
          )}

        </div>

        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          {isSeller && order.type === "physical" && (
            <>
              <div className="flex flex-1 gap-5 justify-center items-center">
                <button
                  onClick={() => onMarkShipped?.(order)}
                  className="flex items-center text-[13px] md:text-[16px] gap-1.5 px-4 py-1 rounded-full bg-white text-black font-medium"
                >
                  <Image src="/check-svgrepo-com.svg" width={18} height={18} alt="check"/>
                  Mark as Shipped
                </button>

                <button
                  onClick={() => onCancel?.(order)}
                  className="flex items-center text-[13px] md:text-[16px] gap-1.5 px-4 py-1 rounded-full bg-[#510000] text-[#FF0000] font-medium"
                >
                  <Image src="/cancel-red-svgrepo-com.svg" width={12} height={12} alt="cancel"/>
                  Cancel
                </button>
              </div>
            </>
          )}
          {isSeller && order.type === "digital" && (
            <>
              <div className="flex flex-1 gap-5 justify-center items-center">
                <button
                  onClick={() => onUploadFile?.(order)}
                  className="flex items-center text-[13px] md:text-[16px] gap-1.5 px-4 py-1 rounded-full bg-white text-black font-medium"
                >
                  <Image src="/upload-svgrepo-com (1).svg" width={16} height={16} alt="upload"/>
                  Upload file
                </button>

                <button
                  onClick={() => onCancel?.(order)}
                  className="flex items-center text-[13px] md:text-[16px] gap-1.5 px-4 py-1 rounded-full bg-[#510000] text-[#FF0000] font-medium"
                >
                  <Image src="/cancel-red-svgrepo-com.svg" width={12} height={12} alt="cancel"/>
                  Cancel
                </button>
              </div>
            </>
          )}
          {isBuyer && (
            <div className="text-white/50 text-sm w-full text-center">
              Waiting for seller to ship...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function SellerMarkShippedMessage({
  order,
  viewerId,
  onReview,
  onDownload
}: {
  order: any;
  viewerId: string | null;
  onReview?: (order:any)=>void
  onDownload?: (order:any)=>void;
}) {
  const isSeller = order?.seller_id === viewerId;
  const isBuyer  = order?.buyer_id  === viewerId;

  const CONFIRM_SECONDS = 24 * 3600

  const deadlineSec = React.useMemo(() => {

    if(order?.shipped_at_unix){
      const shipped = Number(order.shipped_at_unix)

      if(Number.isNaN(shipped)) return 0

      return shipped + CONFIRM_SECONDS
    }

    return 0

  },[order])

  const totalSec = CONFIRM_SECONDS

  const remaining = useCountdown(deadlineSec);

  const progress = totalSec > 0 ? Math.max(0, remaining / totalSec) : 0;

  // SVG ring params
  const R = 70;
  const C = 2 * Math.PI * R;   // circumference
  const dash = progress * C;    // filled arc length
  const gap  = C - dash;

  let deadlineStr = ""

  if (deadlineSec && !Number.isNaN(deadlineSec)) {
    deadlineStr = new Date(deadlineSec * 1000)
      .toISOString()
      .slice(0, 10)
  }

  console.log({
    type: order?.type,
    ship_date: order?.ship_date,
    ship_time_hours: order?.ship_time_hours,
    seller_funded_at_unix: order?.seller_funded_at_unix,
    shipping_deadline: order?.shipping_deadline,
    CONFIRM_SECONDS,
    deadlineSec,
    totalSec,
    remaining,
    progress,
  })

  return (
    <div className="w-full max-w-[680px]">
      <div className="w-full max-w-[680px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        {/* header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[#26D9D9] text-[14px] font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>
          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* title */}
        <div className="text-white text-[16px] md:text-[18px] mb-1">
          {order.seller_name} has mark as shipped for &ldquo;{order.order_name}&rdquo;
        </div>

        {/* status pill */}
        <div className="flex items-center gap-2 text-[#F4B400] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F4B400]"></span>
          {order.buyer_name} have to review the item in time...
        </div>

        {/* ring */}
        <div className="flex flex-col items-center gap-3 py-4">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* track */}
            <circle
              cx="90" cy="90" r={R}
              fill="none"
              stroke="#333"
              strokeWidth="5"
            />

            <circle
              cx="90" cy="90" r={R}
              fill="none"
              stroke="#26D9D9"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={C / 4}
              transform="rotate(-90 90 90)"
            />
            <text
              x="90" y="95"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="22"
              fontWeight="500"
            >
              {formatCountdown(remaining)}
            </text>
          </svg>

          {deadlineStr && (
            <div>
              <p className="text-[#ff6b35] text-[12px] md:text-[14px] font-semibold text-center">
                Once the timer ends {order.seller_name} will be automaticlly get paid
              </p>

            </div>
          )}

        </div>

        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          {isBuyer && order.type === "physical" &&(
            <>
              <div className="flex flex-1 justify-center items-center">
                <button
                  onClick={() => onReview?.(order)}
                  className="flex items-center text-[13px] md:text-[16px] gap-1.5 px-4 py-1 rounded-full bg-white text-black font-medium"
                >
                  <Image src="/eye-show-svgrepo-com.svg" width={22} height={22} alt="review"/>
                  Review
                </button>
              </div>
            </>
          )}
          {isBuyer && order.type === "digital" &&(
            <>
              <div className="flex flex-1 justify-center items-center gap-5">
                <button
                  onClick={() => onDownload?.(order)}
                  className="flex items-center text-[13px] md:text-[16px] gap-1.5 px-4 py-1 rounded-full bg-white text-black font-medium"
                >
                  <Image src="/download-svgrepo-com.svg" width={20} height={20} alt="download" className='mb-0.5'/>
                  Download
                </button>

                <button
                  onClick={() => onReview?.(order)}
                  className="flex items-center text-[13px] md:text-[16px] gap-1.5 px-4 py-1 rounded-full bg-white text-black font-medium"
                >
                  <Image src="/eye-show-svgrepo-com.svg" width={22} height={22} alt="review"/>
                  Review
                </button>
              </div>
            </>
          )}
          {isSeller && (
            <div className="text-white/50 text-sm w-full text-center">
              Waiting for buyer action...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function DiscussTimeMessage({
  order,
  viewerId,
  onRefundDiscuss,
  onPaySeller
}: {
  order: any;
  viewerId: string | null;
  onRefundDiscuss?: (order:any)=>void
  onPaySeller?: (order:any)=>void
}) {
  if(!order) return null

  const isSeller = order?.seller_id === viewerId;
  const isBuyer  = order?.buyer_id  === viewerId;

  const CONFIRM_SECONDS = 24 * 3600

  const deadlineSec = React.useMemo(() => {
    if (order?.seller_responded_at_unix) {
      const respondedAt = Number(order.seller_responded_at_unix)

      if (Number.isNaN(respondedAt)) return 0

      return respondedAt + CONFIRM_SECONDS
    }

    return 0
  }, [order])

  const totalSec = CONFIRM_SECONDS

  const remaining = useCountdown(deadlineSec);

  const progress = totalSec > 0 ? Math.max(0, remaining / totalSec) : 0;

  // SVG ring params
  const R = 70;
  const C = 2 * Math.PI * R;   // circumference
  const dash = progress * C;    // filled arc length
  const gap  = C - dash;

  let deadlineStr = ""

  if (deadlineSec && !Number.isNaN(deadlineSec)) {
    deadlineStr = new Date(deadlineSec * 1000)
      .toISOString()
      .slice(0, 10)
  }

  console.log({
    type: order?.type,
    ship_date: order?.ship_date,
    ship_time_hours: order?.ship_time_hours,
    seller_funded_at_unix: order?.seller_funded_at_unix,
    shipping_deadline: order?.shipping_deadline,
    CONFIRM_SECONDS,
    deadlineSec,
    totalSec,
    remaining,
    progress,
  })

  return (
    <div className="w-full max-w-[395px]">
      <div className="w-full max-w-[395px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        {/* header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[#26D9D9] text-[14px] font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>
          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* title */}
        <div className="text-white text-[16px] md:text-[18px] mb-1">
          {order.seller_name} responded dispute for the order &ldquo;{order.order_name}&rdquo;
        </div>

        {/* status pill */}
        <div className="flex items-center gap-2 text-[#FF0000] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#FF0000]"></span>
          Discuss time started
        </div>

        {/* ring */}
        <div className="flex flex-col items-center gap-3 py-4">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* track */}
            <circle
              cx="90" cy="90" r={R}
              fill="none"
              stroke="#333"
              strokeWidth="5"
            />

            <circle
              cx="90" cy="90" r={R}
              fill="none"
              stroke="#26D9D9"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={C / 4}
              transform="rotate(-90 90 90)"
            />
            <text
              x="90" y="95"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="22"
              fontWeight="500"
            >
              {formatCountdown(remaining)}
            </text>
          </svg>

          {deadlineStr && (
            <div>
              <p className="text-[#ff6b35] text-[12px] md:text-[14px] font-semibold text-center">
                Once the timer ends this dispute will ends in draw and everyone will lose all their money
              </p>

            </div>
          )}

        </div>

        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          {isBuyer && (
            <>
              <div className='flex flex-1 justify-center'>
                <button
                  onClick={() => onPaySeller?.(order)}
                  className="flex items-center text-[13px] md:text-[16px] gap-1.5 px-4 py-1 rounded-full bg-white text-black font-medium"
                >
                  <Image src="/dollar-sign-svgrepo-black-com.svg" width={17} height={17} alt="dollar"/>
                  Pay Seller
                </button>
              </div>
            </>
          )}
          {isSeller && (
            <>
              <div className='flex flex-1 justify-center'>
                <button
                  onClick={() => onRefundDiscuss?.(order)}
                  className="flex items-center text-[13px] md:text-[16px] gap-1.5 px-4 py-1 rounded-full bg-white text-black font-medium"
                >
                  <Image src="/reply-svgrepo-com (1).svg" width={17} height={17} alt="respond"/>
                  Refund Buyer {/*During discuss time*/}
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}

function OpenedDisputeMessage({
  order,
  viewerId,
  onRespond,
  onRefund
}: {
  order: any;
  viewerId: string | null;
  onRespond?: (order:any)=>void
  onRefund?: (order:any)=>void
}) {
  if(!order) return null

  const isSeller = order?.seller_id === viewerId;
  const isBuyer  = order?.buyer_id  === viewerId;

  const CONFIRM_SECONDS = 24 * 3600

  const deadlineSec = React.useMemo(() => {
    if (order?.dispute_opened_at_unix) {
      const openedAt = Number(order.dispute_opened_at_unix)

      if (Number.isNaN(openedAt)) return 0

      return openedAt + CONFIRM_SECONDS
    }

    return 0
  }, [order])

  const totalSec = CONFIRM_SECONDS

  const remaining = useCountdown(deadlineSec);

  const progress = totalSec > 0 ? Math.max(0, remaining / totalSec) : 0;

  // SVG ring params
  const R = 70;
  const C = 2 * Math.PI * R;   // circumference
  const dash = progress * C;    // filled arc length
  const gap  = C - dash;

  let deadlineStr = ""

  if (deadlineSec && !Number.isNaN(deadlineSec)) {
    deadlineStr = new Date(deadlineSec * 1000)
      .toISOString()
      .slice(0, 10)
  }

  console.log({
    type: order?.type,
    ship_date: order?.ship_date,
    ship_time_hours: order?.ship_time_hours,
    seller_funded_at_unix: order?.seller_funded_at_unix,
    shipping_deadline: order?.shipping_deadline,
    CONFIRM_SECONDS,
    deadlineSec,
    totalSec,
    remaining,
    progress,
  })

  return (
    <div className="w-full max-w-[300px] md:max-w-[395px]">
      <div className="w-full max-w-[300px] md:max-w-[395px] rounded-2xl bg-[#0E0E0E] border border-white/10 p-4">

        {/* header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[#26D9D9] text-[14px] font-medium">
            <Image src="/shield-exclamation-svgrepo-com (4).svg" width={22} height={22} alt="shield"/>
            ESCROW UPDATE
          </div>
          <div className="text-white/50 text-sm">
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* title */}
        <div className="text-white text-[16px] md:text-[18px] mb-1">
          {order.buyer_name} opened dispute on the order &ldquo;{order.order_name}&rdquo;
        </div>

        {/* status pill */}
        <div className="flex items-center gap-2 text-[#F4B400] text-[12px] md:text-[14px] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F4B400]"></span>
          {order.seller_name} have to respond or refund to this dispute in time...
        </div>

        {/* ring */}
        <div className="flex flex-col items-center gap-3 py-4">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* track */}
            <circle
              cx="90" cy="90" r={R}
              fill="none"
              stroke="#333"
              strokeWidth="5"
            />

            <circle
              cx="90" cy="90" r={R}
              fill="none"
              stroke="#26D9D9"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={C / 4}
              transform="rotate(-90 90 90)"
            />
            <text
              x="90" y="95"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="22"
              fontWeight="500"
            >
              {formatCountdown(remaining)}
            </text>
          </svg>

          {deadlineStr && (
            <div>
              <p className="text-[#ff6b35] text-[12px] md:text-[14px] font-semibold text-center">
                Once the timer ends {order.buyer_name} will win this dispute and {order.seller_name} will lose their bond to buyer
              </p>

            </div>
          )}

        </div>

        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          {isBuyer && (
            <>
              <div className="text-white/50 text-sm w-full text-center">
                Waiting for seller to respond...
              </div>
            </>
          )}
          {isSeller && (
            <div className="flex flex-1 gap-5 justify-center">
              <button
                onClick={() => onRespond?.(order)}
                className="flex items-center text-[13px] md:text-[16px] gap-1.5 px-4 py-1 rounded-full bg-white text-black font-medium"
              >
                <Image src="/reply-svgrepo-com (1).svg" width={17} height={17} alt="respond"/>
                Respond
              </button>

              <button
                onClick={() => onRefund?.(order)}
                className="flex items-center text-[13px] md:text-[16px] gap-1.5 px-4 py-1 rounded-full bg-white text-black font-medium"
              >
                <Image src="/refund-forward-svgrepo-com (1).svg" width={20} height={20} alt="refund"/>
                Refund
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function OpenDisputeWyntkScreen({
  order,
  supabase,
  reason,
  openDisputeOnChain
}: {
  order: any
  supabase: any
  reason: "not_received" | "not_as_described" | null
  openDisputeOnChain:(order:any)=>Promise<void>
}) {
  console.log("REASON:", reason)

  const reasonText = {
    not_received: "Open dispute because you haven’t got the item.",
    not_as_described: "Open dispute because product is not as described.",
  }

  const title =
    reason ? reasonText[reason] :
    "Open dispute to report an issue with this order."


  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  console.log("REASON:", reason)
  console.log("TITLE:", title)

  return (
    <div className="h-full flex flex-col">

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="text-white text-[32px] text-center max-w-[420px]">
          Open Dispute
        </div>
        <div className="text-white/50 text-[17px] text-center max-w-[420px]">
          {title}
        </div>

        <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
          <div className="flex gap-2 mb-3">
            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital" ? "Digital" : "Physical"}
            </div>

            {order.type === "physical" && (
              <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                {order.dispute_mode === "BTR" ? "BTR" : "STR"}
              </div>
            )}

            <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
              {order.type === "digital"
                ? `${order.ship_time_hours}h`
                : order.ship_date}
            </div>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                className="w-[80px] h-[80px] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
            )}

            <div>
              <div className="text-[#26D9D9] text-xl font-bold">
                {order.order_name}
              </div>

              <div className="text-white text-2xl">
                ${order.price_usd}
              </div>

              <div className="text-white/50 text-sm">
                {order.description}
              </div>
            </div>
          </div>
          <button
            className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
          >
            <Image src="/eye-show-svgrepo-com.svg" width={22} height={22} alt="refund" className='mb-0.5 mr-1.5'/>
            Review
          </button>
        </div>
          <button
            onClick={() => openDisputeOnChain(order)}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Open dispute
          </button>
      </div>
    </div>
  )
}

function WYNTKScreen({
  order,
  supabase,
  onBack,
  reason,
  openDisputeOnChain,
  onInternalBack
}: {
  order: any
  supabase: any
  onBack:()=>void
  reason: "not_received" | "not_as_described" | null
  openDisputeOnChain:(order:any)=>Promise<void>
  onInternalBack?: (fn: () => void) => void
}) {

  type WyntkStep = "wyntk" | "1" | "2" | "3" | "4" | "dispute"

  const [step, setStep] = React.useState<WyntkStep>("wyntk")

  const historyRef = React.useRef<WyntkStep[]>([])

  function go(next: WyntkStep) {
    if (step !== next) {
      historyRef.current.push(step)
      setStep(next)
    }
  }

  function goBack() {
    const prev = historyRef.current.pop()

    if (prev) {
      setStep(prev)
    } else {

      if (step === "wyntk") {
        onBack()
      }
    }
  }

  const [imageUrl, setImageUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  React.useEffect(() => {
    onInternalBack?.(goBack)
  }, [step])

  return (
    <div className="h-full flex flex-col">

    {/* BODY */}
    {step === "wyntk" && (
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="w-20 h-20 rounded-full bg-[#402F11] flex items-center justify-center mb-2">
          <Image src="/info-svgrepo-com.svg" width={40} height={40} alt="info" />
        </div>
        <div className="text-white text-[32px] text-center max-w-[420px]">
          What you need to know before open dispute
        </div>

          <button
            onClick={()=>{
              go("1")
            }}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    )}
    {step === "1" && (
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="flex items-center justify-center mb-2">
          <Image src="/warn-triangle-filled-svgrepo-com (1).svg" width={70} height={70} alt="warn" />
        </div>
        <div className="text-white text-[24px] text-center max-w-[420px]">
          Open a dispute only if the item hasn't arrived or isn't as described, as it cannot be canceled once opened.
        </div>

          <button
            onClick={()=>{
              go("2")
            }}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    )}
    {step === "2" && (
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="flex items-center justify-center mb-2">
          <Image src="/reply-svgrepo-com (2).svg" width={70} height={70} alt="reply" />
        </div>
        <div className="text-white text-[22px] text-center max-w-[420px]">
          Once a dispute is opened, Seller has 24 hours to respond or refund. If they refund, you get your money back. If they fail to respond in time, you win the dispute, and the seller’s bond will be forfeited to you.
        </div>

          <button
            onClick={()=>{
              go("3")
            }}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    )}
    {step === "3" && (
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="flex items-center justify-center mb-2">
          <Image src="/discuss-svgrepo-com (2).svg" width={70} height={70} alt="discuss" />
        </div>
        <div className="text-white text-[22px] text-center max-w-[420px]">
          Once the seller responds, both parties have 24 hours to discuss.
        </div>

          <button
            onClick={()=>{
              go("4")
            }}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    )}
    {step === "4" && (
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="flex items-center justify-center mb-2">
          <Image src="/time-svgrepo-com (2).svg" width={70} height={70} alt="info" />
        </div>
        <div className="text-white text-[22px] text-center max-w-[420px]">
          If discussion time ends this dispute will ends in draw and both seller and buyer will lose all their money
        </div>

          <button
            onClick={()=>{
              go("dispute")
            }}
            className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
          >
            Next
          </button>
      </div>
    )}
    {step === "dispute" && (
      <OpenDisputeWyntkScreen
        order={order}
        supabase={supabase}
        reason={reason}
        openDisputeOnChain={openDisputeOnChain}
      />
    )}
    </div>
  )
}

function ReviewScreen({
  order,
  onClose,
  supabase,
  conversationId,
  userId,
  activeContactId,
  openDisputeOnChain
}:{
  order:any
  onClose:()=>void
  supabase: any
  conversationId: string | null
  userId: string | null
  activeContactId: string | null
  openDisputeOnChain:(order:any)=>Promise<void>
}){

  const wyntkBackRef = React.useRef<() => void>(() => {})

  type Step =
    | "intro"
    | "questions"
    | "question2"
    | "pay"
    | "dispute"
    | "success"
    | "wyntk"
    | "download"

  const [disputeReason, setDisputeReason] = React.useState<
    "not_received" | "not_as_described" | null
  >(null)

  const [imageUrl, setImageUrl] = React.useState<string>("");

  const [step, setStep] = React.useState<Step>("intro")

  const [previousStep,setPreviousStep] = React.useState<"questions" | "question2">("questions")

  React.useEffect(() => {
    if (!order?.image_path) return;

    async function loadImage() {
      console.log("🖼 loading escrow image:", order.image_path);

      const { data, error } = await supabase.storage
        .from("escrow")
        .createSignedUrl(order.image_path, 60 * 60);

      if (error) {
        console.error("signed url error:", error);
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();
  }, [order, supabase]);

  const historyRef = React.useRef<Step[]>([])

  function go(next: Step) {
    if (step !== next) {
      historyRef.current.push(step)
      setStep(next)
    }
  }

  function goBack() {
    const prev = historyRef.current.pop()
    if (prev) setStep(prev)
  }

  async function confirmDeliveryOnChain(order:any){
    try{

      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const buyer = wallet.publicKey
      const seller = new anchor.web3.PublicKey(order.seller_wallet)

      const orderIndex = new anchor.BN(order.order_index)

      const [orderPda] = getOrderPDA(seller,orderIndex)

      const [escrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      )

      const tx = await program.methods
        .confirmDelivery(orderIndex)
        .accounts({
          order:orderPda,
          escrow:escrowPda,
          buyer:buyer,
          seller:seller
        })
        .rpc()

      console.log("Confirm TX:",tx)

      await supabase
        .from("escrow_orders")
        .update({
          status:"Completed",
          confirm_tx:tx
        })
        .eq("escrow_pda",order.escrow_pda)

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body: `escrow_update:${order.escrow_pda}:buyer_confirmed`,
        message_type: "escrow_update",
      });

      setTx(tx)
      go("success")

    }catch(err:any){
      console.error(err)
      alert(err.message)
    }
  }

  const [tx,setTx] = React.useState<string>("")

  return (
    <div className="h-full flex flex-col">
    {step === "intro" && (
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">

          <div className="text-white text-[18px] font-medium truncate">
            Review
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>
    )}
    {step === "questions" && (
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={goBack}
            type="button"
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Back"
          >
            <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
          </button>

          <div className="text-white text-[18px] font-medium truncate">
            Review
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>
    )}
    {step === "wyntk" && (
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => {
              if (step === "wyntk") {
                wyntkBackRef.current()
              } else {
                goBack()
              }
            }}
            type="button"
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Back"
          >
            <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
          </button>

          <div className="text-white text-[18px] font-medium truncate">
            Review
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>
    )}
    {step === "question2" && (
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={goBack}
            type="button"
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Back"
          >
            <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
          </button>

          <div className="text-white text-[18px] font-medium truncate">
            Review
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>
    )}
    {step === "pay" && (
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={goBack}
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Back"
          >
            <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
          </button>

          <div className="text-white text-[18px] font-medium truncate">
            Review
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>
    )}
    {step === "dispute" && (
      <div className="h-[91px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={goBack}
            type="button"
            className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
            title="Back"
          >
            <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
          </button>

          <div className="text-white text-[18px] font-medium truncate">
            Review
          </div>
        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80 shrink-0"
          title="Close"
        >
          <Image src="/cancel-svgrepo-com.svg" width={20} height={20} alt="X" />
        </button>
      </div>
    )}
      {step === "success" && (
        <ConfirmSuccess
          tx={tx}
          onClose={onClose}
        />
      )}
      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        {step === "intro" && (
          <>
            <div className="text-white text-[32px] text-center max-w-[420px]">
              Review
            </div>

            <div className="text-white/50 text-[17px] text-center max-w-[420px]">
              Please answer a few questions to review this order. If you haven’t received the item or it is not as described, you can open a dispute.
            </div>

            <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
              <div className="flex gap-2 mb-3">
                <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                  {order.type === "digital" ? "Digital" : "Physical"}
                </div>

                {order.type === "physical" && (
                  <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                    {order.dispute_mode === "BTR" ? "BTR" : "STR"}
                  </div>
                )}

                <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                  {order.type === "digital"
                    ? `${order.ship_time_hours}h`
                    : order.ship_date}
                </div>
              </div>

              <div className="flex gap-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    className="w-[80px] h-[80px] rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
                )}

                <div>
                  <div className="text-[#26D9D9] text-xl font-bold">
                    {order.order_name}
                  </div>

                  <div className="text-white text-2xl">
                    ${order.price_usd}
                  </div>

                  <div className="text-white/50 text-sm">
                    {order.description}
                  </div>
                </div>
              </div>
              <button
                className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
              >
                <Image src="/dollar-sign-svgrepo-black-com.svg" width={16} height={16} alt="Dollar" className='mb-0.5 mr-1.5'/>
                Fund Escrow
              </button>
            </div>

            <button
              onClick={() => go("questions")}
              className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
            >
              Answer Questions
            </button>
          </>
        )}

        {step === "questions" && (
          <>
            <div className="text-white text-[28px]">
              Have you got the item?
            </div>

            <div className="flex gap-16">

              {/* YES */}
              <button onClick={() => go("question2")} className="flex flex-col items-center gap-3">
                <div className="w-[120px] h-[120px] rounded-2xl bg-[#063b1d] flex items-center justify-center">
                  <Image src="/check-svgrepo-com (1).svg" width={50} height={50} alt="yes"/>
                </div>
                <div className="text-white/70">Yes</div>
              </button>

              {/* NO */}
              <button
                onClick={()=>{
                  if (order.type === "digital") {
                    go("download")
                    return
                  }
                  setPreviousStep(step)
                  setDisputeReason("not_received")
                  go("dispute")
                }}
                className="flex flex-col items-center gap-3">
                <div className="w-[120px] h-[120px] rounded-2xl bg-[#3b0606] flex items-center justify-center">
                  <Image src="/cancel-red-svgrepo-com (2).svg" width={32} height={32} alt="no"/>
                </div>
                <div className="text-white/70">No</div>
              </button>

            </div>
          </>
        )}
        {step === "download" && (
          <DownloadScreen
            order={order}
            supabase={supabase}
            onClose={onClose}
          />
        )}
        {step === "question2" && (
          <>
            <div className="text-white text-[28px]">
              Is the product as described?
            </div>

            <div className="flex gap-16">

              {/* YES */}
              <button onClick={() => {go("pay")}} className="flex flex-col items-center gap-3">
                <div className="w-[120px] h-[120px] rounded-2xl bg-[#063b1d] flex items-center justify-center">
                  <Image src="/check-svgrepo-com (1).svg" width={50} height={50} alt="yes"/>
                </div>
                <div className="text-white/70">Yes</div>
              </button>

              {/* NO */}
              <button
                onClick={()=>{
                  setPreviousStep(step)
                  setDisputeReason("not_as_described")
                  go("dispute")
                }}
                className="flex flex-col items-center gap-3">
                <div className="w-[120px] h-[120px] rounded-2xl bg-[#3b0606] flex items-center justify-center">
                  <Image src="/cancel-red-svgrepo-com (2).svg" width={32} height={32} alt="no"/>
                </div>
                <div className="text-white/70">No</div>
              </button>

            </div>
          </>
        )}

        {step === "dispute" && (
          <OpenDisputeScreen
            order={order}
            supabase={supabase}
            onNext={()=>go("wyntk")}
          />
        )}

        {step === "wyntk" && (
          <WYNTKScreen
            order={order}
            supabase={supabase}
            onBack={goBack}
            reason={disputeReason}
            openDisputeOnChain={openDisputeOnChain}
            onInternalBack={(fn) => {
              wyntkBackRef.current = fn
            }}
          />
        )}

        {step === "pay" && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center gap-8">

              <div className="text-white text-[32px] text-center max-w-[420px]">
                Confirm
              </div>
              <div className="text-white/50 text-[17px] text-center max-w-[420px]">
                After you click Confirm Seller will get paid and you will get your bond money back
              </div>

              <div className="w-full max-w-[420px] rounded-2xl bg-[#0e0e0e] border border-white/10 p-4">
                <div className="flex gap-2 mb-3">
                  <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                    {order.type === "digital" ? "Digital" : "Physical"}
                  </div>

                {order.type === "physical" && (
                  <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                    {order.dispute_mode === "BTR" ? "BTR" : "STR"}
                  </div>
                )}

                  <div className="px-3 py-0.5 rounded-full bg-[#113f3f] text-[#26D9D9] font-medium text-xs sm:text-sm">
                    {order.type === "digital"
                      ? `${order.ship_time_hours}h`
                      : order.ship_date}
                  </div>
                </div>

                <div className="flex gap-4">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      className="w-[80px] h-[80px] rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-[80px] h-[80px] rounded-xl bg-white/10 animate-pulse" />
                  )}

                  <div>
                    <div className="text-[#26D9D9] text-xl font-bold">
                      {order.order_name}
                    </div>

                    <div className="text-white text-2xl">
                      ${order.price_usd}
                    </div>

                    <div className="text-white/50 text-sm">
                      {order.description}
                    </div>
                  </div>
                </div>
                <button
                  className="mt-4 h-[40px] w-full rounded-xl bg-white flex items-center justify-center text-black font-medium"
                >
                  <Image src="/dollar-sign-svgrepo-black-com.svg" width={16} height={16} alt="Dollar" className='mb-0.5 mr-1.5'/>
                  Confirm
                </button>
              </div>
                <button
                  onClick={() => confirmDeliveryOnChain(order)}
                  className="h-[46px] rounded-[10px] font-semibold w-full max-w-[420px] bg-[#26D9D9] text-black hover:opacity-90 transition"
                >
                  Confirm
                </button>
            </div>
          </>
        )}

      </div>

    </div>
  )
}

export default function AppHome() {
  const [authReady, setAuthReady] = React.useState(false);
  const [walletChecked, setWalletChecked] = React.useState(false);
  const [mustConnectWallet, setMustConnectWallet] = React.useState(false);
  const [connectingWallet, setConnectingWallet] = React.useState(false);

  const [uploadOrder, setUploadOrder] = React.useState<any | null>(null)

  const [paidSellerTx, setPaidSellerTx] = React.useState<string | null>(null)

  const [downloadOrder, setDownloadOrder] = React.useState<any | null>(null);

  const [refundDiscussOrder, setRefundDiscussOrder] = React.useState<any | null>(null)

  const [PaySellerOrder, setPaySellerOrder] = React.useState<any | null>(null)

  const [respondDisputeSuccessTx, setRespondDisputeSuccessTx] =
    React.useState<string | null>(null)

  const [refundDisputeOrder, setRefundDisputeOrder] = React.useState<any | null>(null)

  const [respondDisputeStep, setRespondDisputeStep] =
    React.useState<"respond" | "wyntk" | "confirm">("respond")

  const [respondDisputeOrder, setRespondDisputeOrder] = React.useState<any | null>(null)

  const [respondDisputeSubStep, setRespondDisputeSubStep] = React.useState(0);

  const [disputeStep,setDisputeStep] = React.useState<"open" | "wyntk" >("open")

  const [openedDisputeTx, setOpenedDisputeTx] = React.useState<string | null>(null)

  const [disputeOrder, setDisputeOrder] = React.useState<any>(null)

  const [sellerCancelSuccessTx, setSellerCancelSuccessTx] = React.useState<string | null>(null)

  const [cancelOrder, setCancelOrder] = React.useState<any>(null)

  const [sellerFundOrder, setSellerFundOrder] = React.useState<any>(null)
  const [sellerStep, setSellerStep] = React.useState<"fund" | "confirm">("fund")
  const [sellerFundSuccess,setSellerFundSuccess] = React.useState<any>(null)
  const [sellerShippedSuccess,setSellerShippedSuccess] = React.useState<any>(null)

  const [refundSuccessTx, setRefundSuccessTx] = React.useState<string | null>(null)

  const [refundOrder, setRefundOrder] = React.useState<any>(null)

  const [shipOrder,setShipOrder] = React.useState<any>(null)

  const [escrowListOpen, setEscrowListOpen] = React.useState(false)

  const [reviewOrder,setReviewOrder] = React.useState<any>(null)

  const [fundSuccessTx, setFundSuccessTx] = React.useState<string | null>(null)

  const [fundOrder, setFundOrder] = React.useState<any>(null)
  const [fundMode, setFundMode] = React.useState<"BTR" | "STR" | null>(null)

  const [fundStep, setFundStep] = React.useState<"screen" | "confirm" >("screen")

  function onReview(order:any){
    setReviewOrder(order)
  }

  function openSellerShippedSuccess(tx:string,deadline:number){
    setSellerShippedSuccess({
      tx,
      deadline
    })
  }

  function isEscrowUpdateMessage(body: string) {
    return body.startsWith("escrow_update:");
  }

  function onMarkShipped(order:any){
    setShipOrder(order)
  }

  function openSellerFundSuccess(tx:string,deadline:number){
    setSellerFundSuccess({
      tx,
      deadline
    })
  }

  function onBuy(order:any){
    setFundMode(order.dispute_mode)
    setFundOrder(order)
  }

  function onSellerFund(order:any){
    setSellerFundOrder(order)
    setSellerStep("fund")
  }

  type ExitTarget = 'chat' | 'pickType';

  const [exitTarget, setExitTarget] = React.useState<ExitTarget>('chat');
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  function exitEscrowFlow() {
    resetEscrowDraft();

    if (exitTarget === 'pickType') {
      setEscrowStep('pickType');
    } else {
      setEscrowOpen(false);
      setEscrowStep('pickType');
    }

    setShowExitConfirm(false);
  }

  function resetEscrowDraft() {
    setEscrowDraft({
      type: '' as 'physical' | 'digital' | '',
      disputeMode: '' as 'BTR' | 'STR' | '',
      imageFile: undefined,
      imagePreview: '',
      description: '',
      price: '',
      shipDate: '',
      shipTime: '',
      orderName: '',
    });
    setEscrowType(null);
  }

  type MobileView = 'contacts' | 'chat';
  const [mobileView, setMobileView] = React.useState<MobileView>('contacts');

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)'); // < md
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  type EscrowType = 'physical' | 'digital';
  type EscrowStep = 'pickType' | 'itemInfo' | 'nameOrder' | 'preview' | 'disputeMode' | 'success';
  type DisputeMode = 'BTR' | 'STR';

  const [escrowOpen, setEscrowOpen] = React.useState(false);
  const [escrowStep, setEscrowStep] = React.useState<EscrowStep>('pickType');
  const [escrowType, setEscrowType] = React.useState<EscrowType | null>(null);
  const [escrowById, setEscrowById] = React.useState<Record<string, any>>({});

  async function loadEscrow(orderId: string) {
    if (escrowById[orderId]) return escrowById[orderId];

    const { data, error } = await supabase
      .from("escrow_orders")
      .select("*")
      .eq("escrow_pda", orderId)
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    setEscrowById(prev => ({ ...prev, [orderId]: data }));
    return data;
  }

  const [escrowDraft, setEscrowDraft] = React.useState({
    type: '' as 'physical' | 'digital' | '',
    disputeMode: '' as 'BTR' | 'STR' | '',
    imageFile: undefined as File | undefined,
    imagePreview: '',
    description: '',
    price: '',
    shipDate: '',
    shipTime: '',
    orderName: '',
  });

  function followBottomFor(
    ms = 700,
    force = false,
    behavior: ScrollBehavior = 'auto'
  ) {
    if (restoringScrollRef.current) return;
    const start = performance.now();
    let first = true;

    const tick = () => {
      if (!force && !isNearBottom()) return;

      scrollToBottomHard(first ? behavior : 'auto');
      first = false;

      if (performance.now() - start < ms) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }

  const chatScrollRef = React.useRef<HTMLDivElement | null>(null);
  const chatScrollPosRef = React.useRef(0);
  const restoringScrollRef = React.useRef(false);

  function clampPan(nextPan: { x: number; y: number }, nextZoom: number) {
    const el = viewerBodyRef.current;
    if (!el) return nextPan;

    const cw = el.clientWidth;
    const ch = el.clientHeight;

    const maxX = Math.max(0, (cw * nextZoom - cw) / 2);
    const maxY = Math.max(0, (ch * nextZoom - ch) / 2);

    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    };
  }

  function isNearBottom(threshold = 80) {
    const el = chatScrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }

  function scrollToBottomHard(behavior: ScrollBehavior = 'auto') {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }

  function calcFitZoom() {
    const el = viewerBodyRef.current;
    const img = imgRef.current;
    if (!el || !img) return 1;

    const cw = el.clientWidth;
    const ch = el.clientHeight;

    const iw = img.naturalWidth || 1;
    const ih = img.naturalHeight || 1;

    return Math.min(cw / iw, ch / ih);
  }

  const dragRef = React.useRef<{ dragging: boolean; sx: number; sy: number; px: number; py: number }>({
    dragging: false, sx: 0, sy: 0, px: 0, py: 0
  });

  function onViewerMouseDown(e: React.MouseEvent) {
    if (zoom <= 1) return;
    dragRef.current = { dragging: true, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
  }

  function onViewerMouseMove(e: React.MouseEvent) {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.sx;
    const dy = e.clientY - dragRef.current.sy;

    const next = { x: dragRef.current.px + dx, y: dragRef.current.py + dy };
    setPan(clampPan(next, zoom));
  }

  function onViewerMouseUp() {
    dragRef.current.dragging = false;
  }

  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const [minZoom, setMinZoom] = React.useState(1);
  React.useEffect(() => {
    setZoom((z) => Math.max(z, minZoom));
    setPan((p) => clampPan(p, Math.max(zoom, minZoom)));
  }, [minZoom]);

  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const viewerBodyRef = React.useRef<HTMLDivElement | null>(null);

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  function resetZoom() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  const [viewer, setViewer] = React.useState<null | {
    url: string;
    createdAt: string;
    title: string;
    avatar?: string;
  }>(null);

  function formatViewerTime(iso: string) {
    const d = new Date(iso);
    const day = d.getDate();
    const mon = MONTH_ABBR[d.getMonth()];
    const yyyy = d.getFullYear();
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${day} ${mon} ${yyyy} ${time}`;
  }
  const [signedUrlByPath, setSignedUrlByPath] = React.useState<Record<string, string>>({});

  async function openImageViewer(m: DbMessage) {
    const el = chatScrollRef.current;
    if (el) chatScrollPosRef.current = el.scrollTop;

    resetZoom();
    if (!activeContact || !userId) return;

    const path = m.body.slice(8);
    const url = await getSignedUrl(path);
    if (!url) return;

    const mine = m.sender_id === userId;

    setViewer({
      url,
      createdAt: m.created_at,
      title: mine ? 'You' : activeContact.username,
      avatar: mine ? avatarSrc : (activeContact.avatar || '/cat.png'),
    });
  }

  React.useEffect(() => {
    if (viewer !== null) return;
    if (!restoringScrollRef.current) return;

    const el = chatScrollRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const prev = el.style.scrollBehavior;
        el.style.scrollBehavior = 'auto';

        el.scrollTop = chatScrollPosRef.current;

        el.style.scrollBehavior = prev;

        restoringScrollRef.current = false;
      });
    });
  }, [viewer]);

  async function getSignedUrl(path: string) {
    if (signedUrlByPath[path]) return signedUrlByPath[path];

    const { data, error } = await supabase.storage
      .from('chat-images')
      .createSignedUrl(path, 60 * 60);

    if (error || !data?.signedUrl) {
      console.error(error);
      return '';
    }

    setSignedUrlByPath((prev) => ({ ...prev, [path]: data.signedUrl }));
    return data.signedUrl;
  }
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  async function sendEscrowMessage(orderId: string) {
    if (!userId || !activeContactId || !conversationId) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      receiver_id: activeContactId,

      body: `escrow:${orderId}`,
      message_type: "escrow",
    });

    if (error) console.error(error);
  }

  function dayKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatContactLastAt(iso?: string) {
    if (!iso) return '';

    const d = new Date(iso);
    const todayKey = dayKey(new Date());
    const dKey = dayKey(d);

    if (dKey === todayKey) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
  }
  
  function formatDayHeader(date: Date) {
    const dd = date.getDate();
    const mon = MONTH_ABBR[date.getMonth()];
    const yyyy = date.getFullYear();

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return `${dd} ${mon} ${yyyy} ${time}`;
  }

  function ellipsize(s: string, max = 13) {
    const t = String(s ?? '').trim();
    if (t.length <= max) return t;
    return t.slice(0, max) + '...';
  }

  const [loadedConvoId, setLoadedConvoId] = React.useState<string | null>(null);

  const msgRefs = React.useRef(new Map<string, HTMLDivElement | null>());
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  const pendingBottomScrollRef = React.useRef(false);
  const lastMsgLenRef = React.useRef(0);
  const pendingConvoRef = React.useRef<string | null>(null);
  const [jumpOnOpen, setJumpOnOpen] = React.useState(false);
  const [scrollToBottomOnNext, setScrollToBottomOnNext] = React.useState(false);

  function scrollToMessage(id: string, behavior: ScrollBehavior = 'auto') {
    const el = msgRefs.current.get(id);
    if (!el) return;
    el.scrollIntoView({ behavior, block: 'center' });
  }

  const [contacts, setContacts] = React.useState<ContactListItem[]>([]);
  const [activeContactId, setActiveContactId] = React.useState<string | null>(null);
  const [loadingContacts, setLoadingContacts] = React.useState(false);
  const [contactsError, setContactsError] = React.useState<string | null>(null);

  const hasContacts = contacts.length > 0;

  const [userId, setUserId] = React.useState<string | null>(null);
  const [dbMessages, setDbMessages] = React.useState<DbMessage[]>([]);
  const router = useRouter();
  const supabase = React.useMemo(() => supabaseBrowser(), []);
  const [q, setQ] = React.useState('');

  const filteredContacts = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return contacts;

    return contacts.filter((c) => {
      const username = (c.username ?? '').toLowerCase();
      const subtitle = (c.subtitle ?? '').toLowerCase();
      return username.includes(t) || subtitle.includes(t);
    });
  }, [q, contacts]);

  const [displayName, setDisplayName] = React.useState('User');
  const [avatarSrc, setAvatarSrc] = React.useState('/profile.jpg');
  const [loadingName, setLoadingName] = React.useState(true);

  // dropdown state
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuWrapRef = React.useRef<HTMLDivElement | null>(null);

  const [addOpen, setAddOpen] = React.useState(false);
  const [addOpenPhone, setAddOpenPhone] = React.useState(false);
  const [addStep, setAddStep] = React.useState<'enter' | 'confirm'>('enter');

  const [addUsername, setAddUsername] = React.useState('');
  const [addError, setAddError] = React.useState<string | null>(null);
  const [searching, setSearching] = React.useState(false);

  const [loadingMsgs, setLoadingMsgs] = React.useState(false);

  const conversationId = React.useMemo(() => {
    if (!userId || !activeContactId) return null;
    return makeConversationId(userId, activeContactId);
  }, [userId, activeContactId]);

  const activeContact = React.useMemo(
    () => contacts.find((c) => c.id === activeContactId) ?? null,
    [contacts, activeContactId]
  );

  const [chatDraft, setChatDraft] = React.useState('');

  const avatarFromUserId = React.useCallback((uid: string) => {
    const filePath = `${uid}.jpg`;
    const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
    return data.publicUrl || '/cat.png';
  }, [supabase]);

  const [found, setFound] = React.useState<null | { userId: string; username: string; avatar?: string }>(null);

  const addInputRef = React.useRef<HTMLInputElement | null>(null);

  // 2) HELPERS
  const openAdd = React.useCallback(() => {
    setAddOpen(true);
    setAddStep('enter');
    setAddUsername('');
    setAddError(null);
    setSearching(false);
    setFound(null);

    setTimeout(() => addInputRef.current?.focus(), 0);
  }, []);

  const openAddPhone = React.useCallback(() => {
    setAddOpenPhone(true);
    setAddStep('enter');
    setAddUsername('');
    setAddError(null);
    setSearching(false);
    setFound(null);

    setTimeout(() => addInputRef.current?.focus(), 0);
  }, []);
  
  const closeAdd = React.useCallback(() => {
    setAddOpen(false);
    setAddStep('enter');
    setAddError(null);
    setSearching(false);
    setFound(null);
  }, []);

  const closeAddPhone = React.useCallback(() => {
    setAddOpenPhone(false);
    setAddStep('enter');
    setAddError(null);
    setSearching(false);
    setFound(null);
  }, []);

  const [adding, setAdding] = React.useState(false);

  type LastMsg = {
    body: string;
    created_at: string;
    sender_id: string;
    read_at: string | null;
  };

  async function fetchLastMessagesForContacts(contactIds: string[]) {
    if (!userId || contactIds.length === 0)
      return new Map<string, LastMsg>();

    const convoIds = contactIds.map((cid) => makeConversationId(userId, cid));

    const { data, error } = await supabase
      .from('messages')
      .select('conversation_id, body, created_at, sender_id, read_at')
      .in('conversation_id', convoIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchLastMessages error:', error);
      return new Map();
    }

    const map = new Map<string, LastMsg>();

    for (const row of (data ?? []) as any[]) {
      if (!map.has(row.conversation_id)) {
        map.set(row.conversation_id, {
          body: row.body ?? '',
          created_at: row.created_at,
          sender_id: row.sender_id,
          read_at: row.read_at ?? null,
        });
      }
    }

    return map;
  }

  async function onAddContact() {
    setAddError(null);

    if (!userId) {
      setAddError('Not logged in.');
      return;
    }
    if (!found?.userId) {
      setAddError('No contact selected.');
      return;
    }
    if (found.userId === userId) {
      setAddError("You can't add yourself.");
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          owner_id: userId,
          contact_id: found.userId,
        });

      if (error) {
        if (String(error.message).toLowerCase().includes('duplicate')) {
          setAddError('Already in your contacts.');
          return;
        }
        setAddError(error.message);
        return;
      }

      await fetchContacts();

      setAddOpen(false);
      setAddStep('enter');
      setFound(null);
      setAddUsername('');
    } finally {
      setAdding(false);
    }
  }

  async function onNext() {
    const uname = addUsername.trim().toLowerCase();
    setAddError(null);

    if (!uname) {
      setAddError('Please enter a username.');
      return;
    }
    if (!userId) {
      setAddError('Not logged in.');
      return;
    }

    setSearching(true);
    try {
      const { data: urow, error: uerr } = await supabase
        .from('usernames')
        .select('user_id, username')
        .eq('username', uname)
        .maybeSingle();

      if (uerr) {
        setAddError(uerr.message);
        return;
      }
      if (!urow?.user_id) {
        setAddError('Username not found.');
        return;
      }
      if (urow.user_id === userId) {
        setAddError("You can't add yourself.");
        return;
      }

      const { data: exists, error: exErr } = await supabase
        .from('contacts')
        .select('owner_id')
        .eq('owner_id', userId)
        .eq('contact_id', urow.user_id)
        .maybeSingle();

      if (exErr) {
        setAddError(exErr.message);
        return;
      }
      if (exists) {
        setAddError('Already in your contacts.');
        return;
      }

      const filePath = `${urow.user_id}.jpg`;
      const { data: pub } = supabase.storage.from('profiles').getPublicUrl(filePath);
      const publicUrl = pub.publicUrl;

      let avatar = '/cat.png';
      try {
        const head = await fetch(publicUrl, { method: 'HEAD', cache: 'no-store' });
        if (head.ok) avatar = publicUrl;
      } catch {}

      setFound({
        userId: urow.user_id,
        username: (urow.username ?? uname).trim(),
        avatar,
      });
      setAddStep('confirm');
    } finally {
      setSearching(false);
    }
  }

  async function connectPhantom() {
    try {
      const provider = (window as any).solana;

      if (!provider?.isPhantom) {
        alert('Please install Phantom Wallet');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      setConnectingWallet(true);

      let publicKey: string;

      if (provider.isConnected && provider.publicKey) {
        publicKey = provider.publicKey.toString();
      } else {
        const resp = await provider.connect({ onlyIfTrusted: false });
        publicKey = resp.publicKey.toString();
      }

      if (!userId) throw new Error('User not logged in');

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            wallet_address: publicKey,
          },
          { onConflict: 'id' }
        );

      if (error) throw error;

      setMustConnectWallet(false);
    } catch (err: any) {
      console.error('connectPhantom error:', err);
      console.error('message:', err?.message);
      console.error('details:', err?.details);
      console.error('hint:', err?.hint);
      console.error('code:', err?.code);
      alert(err?.message || 'Wallet connection failed.');
    } finally {
      setConnectingWallet(false);
    }
  }

  async function onSend() {
    const text = chatDraft.trim();
    if (!text || !userId || !activeContactId || !conversationId) return;

    setChatDraft('');

    pendingBottomScrollRef.current = true;
    pendingConvoRef.current = conversationId;

    followBottomFor(500, true, 'smooth');

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      receiver_id: activeContactId,
      body: text,
    });

    setContacts((prev) => {
      const next = prev.map((c) =>
        c.id === activeContactId
          ? { ...c, subtitle: `You: ${text}`, lastAt: new Date().toISOString(), lastSenderId: userId }
          : c
      );
      next.sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''));
      return next;
    });

    if (error) {

      console.error(error);
    }
  }

  async function getWalletAddress(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("wallet_address")
      .eq("id", userId)
      .single();

    console.log("wallet lookup:", userId, data, error);

    if (error) throw new Error(error.message);

    if (!data?.wallet_address) {
      throw new Error("User has not connected wallet yet");
    }

    return data.wallet_address;
  }

  async function uploadEscrowImage(
    file: File,
    sellerId: string,
    orderPda: string
  ) {

    const compressed = await compressImage(file, 1280, 0.8)

    const path = `${sellerId}/${orderPda}.jpg`

    const { error } = await supabase.storage
      .from("escrow")
      .upload(path, compressed, {
        contentType: "image/jpeg",
        upsert: true,
      })

    if (error) throw error

    return path
  }

  async function uploadDigitalDeliveryFile(
    file: File,
    order: any
  ) {
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");

    const path = `${order.escrow_pda}/${Date.now()}_${safeName}`;

    const { error } = await supabase.storage
      .from("digital-delivery")
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) throw error;

    return path;
  }

  async function fetchUnreadCountsForContacts(contactIds: string[]) {
    if (!userId || contactIds.length === 0) return new Map<string, number>();

    const convoIds = contactIds.map((cid) => makeConversationId(userId, cid));

    const { data, error } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', convoIds)
      .eq('receiver_id', userId)
      .is('read_at', null);

    if (error) {
      console.error('fetchUnreadCounts error:', error);
      return new Map();
    }

    const map = new Map<string, number>();
    for (const row of (data ?? []) as any[]) {
      map.set(row.conversation_id, (map.get(row.conversation_id) ?? 0) + 1);
    }
    return map;
  }

  function closeViewer() {
    restoringScrollRef.current = true;
    setViewer(null);
  }

  const prevLenRef = React.useRef(0);

  React.useEffect(() => {
    if (!conversationId) return;
    if (viewer) return;

    const prevLen = prevLenRef.current;
    const currLen = dbMessages.length;
    prevLenRef.current = currLen;

    if (currLen <= prevLen) return;

    const last = dbMessages[currLen - 1];
    if (!last) return;

    const isIncoming = last.receiver_id === userId;
    const shouldAutoScroll = isNearBottom() || isIncoming;

    if (!shouldAutoScroll) return;

    if (isImagePathMessage(last.body)) {
      pendingBottomScrollRef.current = true;
      pendingConvoRef.current = conversationId;
      return;
    }

    requestAnimationFrame(() => {
      scrollToBottomHard('smooth');
    });
  }, [dbMessages, conversationId, userId, viewer]);

  React.useEffect(()=>{

    dbMessages.forEach(m=>{
      if(isEscrowMessage(m.body)){
        const orderId = m.body.slice(7)

        if(!escrowById[orderId]){
          loadEscrow(orderId)
        }
      }
    })

  },[dbMessages])

  React.useEffect(() => {
    const prevLen = lastMsgLenRef.current;
    const currLen = dbMessages.length;

    if (
      pendingBottomScrollRef.current &&
      pendingConvoRef.current === conversationId &&
      currLen > prevLen
    ) {
      requestAnimationFrame(() => {
        followBottomFor(700, false);
      });
    }

    lastMsgLenRef.current = currLen;
  }, [dbMessages.length, conversationId]);

  React.useEffect(() => {
    if (!isMobile) return;
    if (!activeContactId) setMobileView('contacts');
  }, [isMobile, activeContactId]);

  React.useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      const user = session?.user ?? null;

      if (!mounted) return;

      if (!user) {
        setAuthReady(true);
        return;
      }

      // save user info
      setUserId(user.id);
      setDisplayName(pickDisplayName(user));
      setAvatarSrc(pickAvatarUrl(user));
      setLoadingName(false);

      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', user.id)
        .maybeSingle();

      if (!mounted) return;

      if (!data?.wallet_address) {
        setMustConnectWallet(true);
      } else {
        setMustConnectWallet(false);
      }

      setWalletChecked(true);
      setAuthReady(true);
    }

    bootstrapAuth();

    // listen login/logout realtime
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      bootstrapAuth();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // close dropdown when click outside + Esc
  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!menuOpen) return;
      const el = menuWrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setMenuOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!menuOpen) return;
      if (e.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  async function onLogout() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.refresh();
  }

  React.useEffect(() => {
    if (!conversationId) {
      setDbMessages([]);
      lastMsgLenRef.current = 0;
      pendingBottomScrollRef.current = false;
      pendingConvoRef.current = conversationId;
      setLoadedConvoId(null);
      return;
    }

    let alive = true;

    (async () => {
      setLoadingMsgs(true);
      setLoadedConvoId(null);
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, body, created_at, read_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!alive) return;
      if (!error) setDbMessages(data ?? []);
      setLoadingMsgs(false);
      setLoadedConvoId(conversationId);
    })();

  const channel = supabase
    .channel(`room:${conversationId}`)

    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new as DbMessage;
        setDbMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
      }
    )

    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new as DbMessage;

        setDbMessages((prev) =>
          prev.map((m) => (m.id === row.id ? { ...m, read_at: row.read_at } : m))
        );
      }
    )
    .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, userId]);

  React.useEffect(() => {
    if (!jumpOnOpen) return;
    if (!activeContactId || !userId || !conversationId) return;

    if (loadedConvoId !== conversationId) return;

    const firstUnreadIncoming = dbMessages.find(
      (m) => m.receiver_id === userId && m.read_at === null
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (firstUnreadIncoming) {
          scrollToMessage(firstUnreadIncoming.id, 'auto');
        } else {
          scrollToBottomHard('auto');
        }

        markConversationRead(activeContactId);
        setJumpOnOpen(false);
      });
    });
  }, [
    jumpOnOpen,
    activeContactId,
    userId,
    conversationId,
    loadedConvoId,
    dbMessages,
  ]);

  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`inbox:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const row = payload.new as DbMessage;

          if (row.sender_id !== userId && row.receiver_id !== userId) return;

          const otherId = row.sender_id === userId ? row.receiver_id : row.sender_id;

          const incomingToMe = row.receiver_id === userId;
          const isActiveRoom = otherId === activeContactId;

          setContacts((prev) => {
            if (!prev.some((c) => c.id === otherId)) return prev;

            const next = prev.map((c) => {
              if (c.id !== otherId) return c;

              const base = {
                ...c,
                subtitle: lastPreviewText(row.body ?? '', row.sender_id === userId),
                lastAt: row.created_at,
                lastSenderId: row.sender_id,
                lastReadAt: row.read_at ?? null,
              };

              if (incomingToMe && !isActiveRoom) {
                return { ...base, unreadCount: (c.unreadCount ?? 0) + 1 };
              }

              if (incomingToMe && isActiveRoom) {
                return { ...base, unreadCount: 0 };
              }

              return base;
            });

            next.sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''));
            return next;
          });

          if (incomingToMe && isActiveRoom) {
            setScrollToBottomOnNext(true);
            markConversationRead(otherId);
          }
        }
      )
      .subscribe((status) => {
        console.log('inbox realtime:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, activeContactId]);

  const [solPrice, setSolPrice] = React.useState<number>(0);

  React.useEffect(() => {
    async function loadPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        const data = await res.json();
        setSolPrice(data.solana.usd);
      } catch (err) {
        console.error(err);
      }
    }

    loadPrice();
  }, []);

  const fetchContacts = React.useCallback(async () => {
    if (!userId) return;

    setLoadingContacts(true);
    setContactsError(null);

    try {
      const { data: rows, error: cErr } = await supabase
        .from('contacts')
        .select('contact_id, created_at')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (cErr) throw cErr;

      const ids = (rows ?? [])
        .map((r: any) => r.contact_id as string)
        .filter(Boolean);

      if (ids.length === 0) {
        setContacts([]);
        setActiveContactId(null);
        return;
      }

      const { data: urows, error: uErr } = await supabase
        .from('usernames')
        .select('user_id, username')
        .in('user_id', ids);

      if (uErr) throw uErr;

      const usernameById = new Map<string, string>();
      (urows ?? []).forEach((u: any) => {
        if (u?.user_id) usernameById.set(u.user_id, (u.username ?? '').trim());
      });

      const lastByConvo = await fetchLastMessagesForContacts(ids);

      const unreadByConvo = await fetchUnreadCountsForContacts(ids);

      const list: ContactListItem[] = ids.map((id) => {
        const convoId = makeConversationId(userId, id);
        const last = lastByConvo.get(convoId);

        const body = (last?.body ?? '').trim();
        const senderId = last?.sender_id;

        const subtitle = body ? lastPreviewText(body, senderId === userId) : '';

        return {
          id,
          username: usernameById.get(id) || 'Unknown',
          avatar: avatarFromUserId(id),
          subtitle,
          lastAt: last?.created_at,
          lastSenderId: senderId,
          lastReadAt: last?.read_at ?? null,
          unreadCount: unreadByConvo.get(convoId) ?? 0,
        };
      });

      list.sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''));
      setContacts(list);
    } catch (e: any) {
      setContactsError(e?.message || 'Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  }, [supabase, userId, avatarFromUserId]);

  React.useEffect(() => {
    if (!userId) return;
    fetchContacts();
  }, [userId, fetchContacts]);

  const canSend = chatDraft.trim().length > 0;

  async function markConversationRead(contactId: string) {
    if (!userId) return;
    const convoId = makeConversationId(userId, contactId);

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', convoId)
      .eq('receiver_id', userId)
      .is('read_at', null);

    if (error) console.error('markConversationRead error:', error);

    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId
          ? { ...c, unreadCount: 0, lastReadAt: new Date().toISOString() }
          : c
      )
    );
  }

  const showWalletGate =
    authReady &&
    walletChecked &&
    mustConnectWallet;

  console.log("type:", escrowType)

  const [createdTx, setCreatedTx] = React.useState<string | null>(null)

  async function createEscrowOrderChain() {
    if (!activeContact || !userId) {
      alert("No active chat")
      return
    }
    try {
      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const seller = wallet.publicKey
      const buyer = new PublicKey(
        await getWalletAddress(activeContact.id)
      )

      const [sellerPda] = getSellerPDA(seller)

      let sellerAccount: any
      const sellerAccountClient = program.account.sellerAccount
      try {
        sellerAccount = await sellerAccountClient.fetch(sellerPda)
      } catch {
        await program.methods
          .initSeller()
          .accounts({
            sellerAccount: sellerPda,
            seller: seller,
          })
          .rpc()

        sellerAccount = await sellerAccountClient.fetch(sellerPda)
      }

      const orderIndex = sellerAccount.orderCount as anchor.BN

      const sellerWallet = await getWalletAddress(userId);
      const buyerWallet  = await getWalletAddress(activeContact.id);

      const [orderPda] = getOrderPDA(seller, orderIndex)

      const mode = escrowDraft.disputeMode === "BTR" ? 0 : 1
      const productType = escrowDraft.type === "physical" ? 0 : 1

      if (productType === 1 && mode !== 0) {
        throw new Error("Digital product must use BTR mode")
      }

      let shippingHours: number

      if (escrowDraft.type === "digital") {
        shippingHours = Number(escrowDraft.shipTime || 0)
      } else {
        if (!escrowDraft.shipDate) {
          throw new Error("Shipping date missing")
        }

        const now = new Date()

        // end of selected day
        const deadline = new Date(escrowDraft.shipDate)
        deadline.setHours(23, 59, 59, 999)

        const diffMs = deadline.getTime() - now.getTime()

        shippingHours = Math.ceil(diffMs / (1000 * 60 * 60))

        if (shippingHours <= 0) {
          throw new Error("Shipping date already passed")
        }

        if (shippingHours > 720) {
          throw new Error("Physical shipping must be <= 720 hours")
        }
      }

      if (productType === 1) {
        if (shippingHours <= 0 || shippingHours > 48) {
          throw new Error("Digital shipping must be between 1-48 hours")
        }
      }

      if (productType === 0) {
        if (shippingHours <= 0 || shippingHours > 720) {
          throw new Error("Physical shipping must be between 1-720 hours")
        }
      }

      if (shippingHours > 720) {
        throw new Error("Shipping too long")
      }

      const priceLamports = new anchor.BN(
        Math.round(Number(escrowDraft.price) / solPrice * 1e9)
      )

      const tx =  await program.methods
        .createOrder(
          orderIndex,
          mode,
          productType,
          escrowDraft.orderName,
          buyer,
          priceLamports,
          shippingHours
        )
        .accounts({
          sellerAccount: sellerPda,
          order: orderPda,
          seller: seller,
        })
        .rpc()

      console.log("TX:", tx)

      const updatedSellerAccount = await program.account.sellerAccount.fetch(sellerPda)

      const realOrderIndex = updatedSellerAccount.orderCount.sub(new anchor.BN(1))

      if (!escrowDraft.imageFile)
        throw new Error("Image file missing")

      const imagePath = await uploadEscrowImage(
        escrowDraft.imageFile,
        userId,
        orderPda.toString()
      )

      await supabase.from("escrow_orders").insert({
        escrow_pda: orderPda.toString(),
        tx_signature: tx,
        seller_id: userId,
        buyer_id: activeContact.id,
        type: escrowDraft.type,
        dispute_mode: escrowDraft.disputeMode,
        description: escrowDraft.description,
        price_usd: Number(escrowDraft.price),
        ship_date: escrowDraft.shipDate || null,
        ship_time_hours: escrowDraft.shipTime || null,
        conversation_id: conversationId,
        seller_name: displayName,
        seller_wallet: sellerWallet,
        buyer_name: activeContact.username,
        buyer_wallet: buyerWallet,
        order_name: escrowDraft.orderName,
        order_index: realOrderIndex.toString(),

        image_path: imagePath,

        status: "onchain_created",
      })

      setEscrowStep('success')
      setCreatedTx(tx)

      await loadEscrow(orderPda.toString())

      await sendEscrowMessage(orderPda.toString());

    } catch (err:any) {
      console.error(err)
      alert(err.message)
    }
  }

  async function fundEscrowOnChain(order:any) {
    try {

      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const seller = new PublicKey(order.seller_wallet)
      const buyer = wallet.publicKey

      const orderIndex = new anchor.BN(order.order_index)

      const [orderPda] = getOrderPDA(seller, orderIndex)

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      )

      const tx = await program.methods
        .buyerFundEscrow(orderIndex)
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          buyer: buyer,
          seller: seller,
          feeWallet: new PublicKey(
            "GCcZkwkhGhzqBt6Eoc2nJCZFvgYdFAnh1hWuuARi774Z"
          ),
          systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc()

      console.log("Escrow funded:", tx)

      setFundSuccessTx(tx)

      console.log("order id:", order.escrow_pda)

      const { data, error } = await supabase
        .from("escrow_orders")
        .update({
          status: "BuyerFunded",
          funded_tx: tx
        })
        .eq("escrow_pda", order.escrow_pda)
        .select()

      console.log("supabase result:", data, error)

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body: `escrow_update:${order.escrow_pda}:buyer_funded`,
        message_type: "escrow_update",
      });

      setEscrowById(prev => ({
        ...prev,
        [order.escrow_pda]: {
          ...prev[order.escrow_pda],
          status: "BuyerFunded"
        }
      }))

    } catch(err:any) {
      console.error(err)
      alert(err.message)
    }
  }

  async function sellerFundEscrowOnChain(order:any) {
    try {

      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const seller = wallet.publicKey
      const orderIndex = new anchor.BN(order.order_index)

      const [orderPda] = getOrderPDA(seller, orderIndex)

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      )

      const tx = await program.methods
        .sellerFundEscrow(orderIndex)
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          seller: seller,
          feeWallet: new PublicKey(
            "GCcZkwkhGhzqBt6Eoc2nJCZFvgYdFAnh1hWuuARi774Z"
          ),
          systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc()

      console.log("Seller funded escrow:", tx)

      await program.provider.connection.confirmTransaction(tx, "confirmed")

      const orderAccount = await program.account.order.fetch(orderPda)

      const fundedAt = orderAccount.sellerFundedAt.toNumber()
      const shippingHours = orderAccount.shippingHours

      const deadline = fundedAt + shippingHours * 3600

      openSellerFundSuccess(tx,deadline)
      const { data, error } = await supabase
        .from("escrow_orders")
        .update({
          status: "Shipping",
          seller_funded_tx: tx,
          shipping_deadline: deadline,
          seller_funded_at_unix: fundedAt
        })
        .eq("escrow_pda", order.escrow_pda)
        .select()

      if (error) {
        console.error("Supabase update error:", error)
      }

      console.log("Supabase updated:", data)

      setEscrowById(prev => ({
        ...prev,
        [order.escrow_pda]: {
          ...prev[order.escrow_pda],
          status: "Shipping",
          shipping_deadline: deadline,
          seller_funded_at_unix: fundedAt,
        }
      }))

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body: `escrow_update:${order.escrow_pda}:seller_funded`,
        message_type: "escrow_update",
      });

    } catch(err:any) {
      console.error(err)
      alert(err.message)
    }
  }

  async function markShippedOnChain(order:any){
    try{

      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const seller = wallet.publicKey
      const orderIndex = new anchor.BN(order.order_index)

      const [orderPda] = getOrderPDA(seller,orderIndex)

      const tx = await program.methods
        .markShipped(orderIndex)
        .accounts({
          order:orderPda,
          seller:seller
        })
        .rpc()

      console.log("Shipped TX:",tx)

      await supabase
        .from("escrow_orders")
        .update({
          status:"Shipped",
          shipped_tx:tx,
          shipped_at_unix: Math.floor(Date.now()/1000)
        })
        .eq("escrow_pda",order.escrow_pda)

      openSellerShippedSuccess(tx,order.shipping_deadline)

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body: `escrow_update:${order.escrow_pda}:seller_shipped`,
        message_type: "escrow_update",
      });

      const shippedAt = Math.floor(Date.now()/1000)

      await supabase
        .from("escrow_orders")
        .update({
          status:"Shipped",
          shipped_tx:tx,
          shipped_at_unix: shippedAt
        })
        .eq("escrow_pda",order.escrow_pda)

      setEscrowById(prev => ({
        ...prev,
        [order.escrow_pda]: {
          ...prev[order.escrow_pda],
          status: "Shipped",
          shipped_at_unix: shippedAt
        }
      }))

    }catch(err:any){
      console.error(err)
      alert(err.message)
    }
  }

  async function markShippedDigitalOnChain(order:any, file: File){ 
    try {
      const wallet = getAnchorWallet();
      const program = getProgram(wallet);

      const seller = wallet.publicKey;
      const orderIndex = new anchor.BN(order.order_index);

      const [orderPda] = getOrderPDA(seller, orderIndex);

      const tx = await program.methods
        .markShipped(orderIndex)
        .accounts({
          order: orderPda,
          seller: seller
        })
        .rpc();

      console.log("Shipped TX:", tx);

      const shippedAt = Math.floor(Date.now() / 1000);

      const deliveryPath = await uploadDigitalDeliveryFile(file, order);

      await supabase
        .from("escrow_orders")
        .update({
          status: "Shipped",
          shipped_tx: tx,
          shipped_at_unix: shippedAt,
          delivery_file_path: deliveryPath,
          delivery_file_name: file.name,
          delivery_file_size: file.size,
        })
        .eq("escrow_pda", order.escrow_pda);

      openSellerShippedSuccess(tx, order.shipping_deadline);

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body: `escrow_update:${order.escrow_pda}:seller_shipped`,
        message_type: "escrow_update",
      });

      setEscrowById(prev => ({
        ...prev,
        [order.escrow_pda]: {
          ...prev[order.escrow_pda],
          status: "Shipped",
          shipped_tx: tx,
          shipped_at_unix: shippedAt,
          delivery_file_path: deliveryPath,
          delivery_file_name: file.name,
          delivery_file_size: file.size,
        }
      }));

    } catch (err:any) {
      console.error(err);
      alert(err.message);
    }
  }

  async function refundBuyerOnChain(order:any){
    try{

      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const buyer = wallet.publicKey
      const seller = new PublicKey(order.seller_wallet)

      const orderIndex = new anchor.BN(order.order_index)

      const [orderPda] = getOrderPDA(seller, orderIndex)

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      )

      const tx = await program.methods
        .buyerCancel(orderIndex)
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          buyer: buyer,
          seller: seller
        })
        .rpc()

      setRefundSuccessTx(tx)
      console.log("Cancel TX:", tx)

      // update DB
      await supabase
        .from("escrow_orders")
        .update({
          status: "Cancelled",
          refund_tx: tx
        })
        .eq("escrow_pda", order.escrow_pda)

      // send message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body: `escrow_update:${order.escrow_pda}:buyer_cancelled`,
        message_type: "escrow_update",
      });

      setEscrowById(prev => ({
        ...prev,
        [order.escrow_pda]: {
          ...prev[order.escrow_pda],
          status: "Cancelled"
        }
      }))

    }catch(err:any){
      console.error(err)
      alert(err.message)
    }
  }

  async function sellerCancelOnChain(order:any){
    try{

      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const seller = wallet.publicKey
      const buyer = new PublicKey(order.buyer_wallet)

      const orderIndex = new anchor.BN(order.order_index)

      const [orderPda] = getOrderPDA(seller, orderIndex)

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      )

      const tx = await program.methods
        .sellerCancel(orderIndex)
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          buyer: buyer,
          seller: seller,
          systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc()

      console.log("Seller Cancel TX:", tx)

      // success screen
      setSellerCancelSuccessTx(tx)

      // update DB
      await supabase
        .from("escrow_orders")
        .update({
          status: "Cancelled",
          refund_tx: tx
        })
        .eq("escrow_pda", order.escrow_pda)

      // send chat message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body: `escrow_update:${order.escrow_pda}:seller_cancelled`,
        message_type: "escrow_update",
      });

      // update local state
      setEscrowById(prev => ({
        ...prev,
        [order.escrow_pda]: {
          ...prev[order.escrow_pda],
          status: "Cancelled"
        }
      }))

    }catch(err:any){
      console.error(err)
      alert(err.message)
    }
  }

  async function openDisputeOnChain(order:any){
    try{

      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const buyer = wallet.publicKey
      const seller = new PublicKey(order.seller_wallet)

      const orderIndex = new anchor.BN(order.order_index)

      const [orderPda] = getOrderPDA(seller, orderIndex)

      const tx = await program.methods
        .openDispute(orderIndex)
        .accounts({
          order: orderPda,
          buyer: buyer,
          seller: seller
        })
        .rpc()

      console.log("Dispute TX:", tx)

      setOpenedDisputeTx(tx)

      const disputeOpenedAt = Math.floor(Date.now() / 1000)

      // update DB
      await supabase
        .from("escrow_orders")
        .update({
          status: "Dispute",
          dispute_tx: tx,
          dispute_opened_at_unix: disputeOpenedAt
        })
        .eq("escrow_pda", order.escrow_pda)

      // send chat message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body: `escrow_update:${order.escrow_pda}:dispute_opened`,
        message_type: "escrow_update",
      });

      setEscrowById(prev => ({
        ...prev,
        [order.escrow_pda]: {
          ...prev[order.escrow_pda],
          status: "Dispute",
          dispute_tx: tx,
          dispute_opened_at_unix: disputeOpenedAt
        }
      }))

    }catch(err:any){
      console.error(err)
      alert(err.message)
    }
  }

  async function refundDisputeOnChain(order:any){
    try{

      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const seller = wallet.publicKey
      const buyer = new PublicKey(order.buyer_wallet)

      const orderIndex = new anchor.BN(order.order_index)

      const [orderPda] = getOrderPDA(seller, orderIndex)

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      )

      const tx = await program.methods
        .refundBuyer(orderIndex)
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          seller: seller,
          buyer: buyer
        })
        .rpc()

      console.log("Refund TX:",tx)

      setRefundSuccessTx(tx)

      // update DB
      await supabase
        .from("escrow_orders")
        .update({
          status:"Cancelled",
          seller_refund_tx:tx
        })
        .eq("escrow_pda",order.escrow_pda)

      // send chat message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body: `escrow_update:${order.escrow_pda}:seller_refunded`,
        message_type: "escrow_update"
      })

      setEscrowById(prev=>({
        ...prev,
        [order.escrow_pda]:{
          ...prev[order.escrow_pda],
          status:"Cancelled"
        }
      }))

    }catch(err:any){
      console.error(err)
      alert(err.message)
    }
  }

  async function respondDisputeOnChain(order:any){
    try{

      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const seller = wallet.publicKey
      const orderIndex = new anchor.BN(order.order_index)

      const [orderPda] = getOrderPDA(seller, orderIndex)

      const tx = await program.methods
        .respondDispute(orderIndex)
        .accounts({
          order: orderPda,
          seller: seller
        })
        .rpc()

      console.log("Respond dispute TX:", tx)

      // success screen
      setRespondDisputeSuccessTx(tx)

      const sellerRespondedAt = Math.floor(Date.now() / 1000)

      // update DB
      await supabase
        .from("escrow_orders")
        .update({
          status: "Discuss",
          seller_respond_tx: tx,
          seller_responded_at_unix: sellerRespondedAt
        })
        .eq("escrow_pda", order.escrow_pda)

      // send message to chat
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body: `escrow_update:${order.escrow_pda}:seller_responded_dispute`,
        message_type: "escrow_update"
      })

      setEscrowById(prev => ({
        ...prev,
        [order.escrow_pda]: {
          ...prev[order.escrow_pda],
          status: "Discuss",
          seller_respond_tx: tx,
          seller_responded_at_unix: sellerRespondedAt
        }
      }))

    }catch(err:any){
      console.error(err)
      alert(err.message)
    }
  }

  async function paySellerDuringDiscussOnChain(order:any){
    try{

      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const buyer = wallet.publicKey
      const seller = new PublicKey(order.seller_wallet)

      const orderIndex = new anchor.BN(order.order_index)

      const [orderPda] = getOrderPDA(seller, orderIndex)

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      )

      const tx = await program.methods
        .paySellerDuringDiscuss(orderIndex)
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          buyer: buyer,
          seller: seller,
          systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc()

      console.log("Pay seller TX:",tx)

      setPaidSellerTx(tx)

      // update DB
      await supabase
        .from("escrow_orders")
        .update({
          status:"Completed",
          pay_seller_tx:tx
        })
        .eq("escrow_pda",order.escrow_pda)

      // send chat message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body: `escrow_update:${order.escrow_pda}:seller_paid`,
        message_type: "escrow_update",
      })

      setEscrowById(prev=>({
        ...prev,
        [order.escrow_pda]:{
          ...prev[order.escrow_pda],
          status:"Completed"
        }
      }))

    }catch(err:any){
      console.error(err)
      alert(err.message)
    }
  }

  async function refundDuringDiscussOnChain(order:any){
    try{

      const wallet = getAnchorWallet()
      const program = getProgram(wallet)

      const seller = wallet.publicKey
      const buyer = new PublicKey(order.buyer_wallet)

      const orderIndex = new anchor.BN(order.order_index)

      const [orderPda] = getOrderPDA(seller, orderIndex)

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), orderPda.toBuffer()],
        program.programId
      )

      const tx = await program.methods
        .refundDuringDiscuss(orderIndex)
        .accounts({
          order: orderPda,
          escrow: escrowPda,
          buyer: buyer,
          seller: seller,
          systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc()

      console.log("Refund during discuss TX:",tx)

      setRefundSuccessTx(tx)

      // update DB
      await supabase
        .from("escrow_orders")
        .update({
          status:"Cancelled",
          seller_refund_tx:tx
        })
        .eq("escrow_pda",order.escrow_pda)

      // send chat message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeContactId,
        body:`escrow_update:${order.escrow_pda}:seller_refunded`,
        message_type:"escrow_update"
      })

      setEscrowById(prev=>({
        ...prev,
        [order.escrow_pda]:{
          ...prev[order.escrow_pda],
          status:"Cancelled"
        }
      }))

    }catch(err:any){
      console.error(err)
      alert(err.message)
    }
  }

  return (
    <div className="min-h-dvh h-dvh flex bg-black overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside
        className={[
          'h-full bg-black border-r border-white/10 flex flex-col',
          'w-full md:w-[392.7px]',
          isMobile ? (mobileView === 'contacts' ? 'flex' : 'hidden') : 'flex',
        ].join(' ')}
      >
        <div className="px-4 pt-5 pb-4 flex flex-col min-h-0 flex-1">

          {!hasContacts && (
            <div className="mt-[275px] absolute inset-0 flex flex-col items-center gap-3 pointer-events-none">
              <Image
                className="relative"
                src="/chat-dots-svgrepo-com.svg"
                width={100}
                height={100}
                alt="chat"
              />
              <span className="text-[#A6A6A6] text-[17.5px] whitespace-nowrap">
                Click Add Contact to start Chatting
              </span>
            </div>
          )}
          <div ref={menuWrapRef} className="relative inline-block">
            <div className='flex'>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className={[
                  'w-[180px]',
                  'flex items-center justify-between gap-3',
                  'rounded-[15px]',
                  'bg-[#0F0F0F]',
                  'border-2',
                  'border-[#222222]',
                  'px-4 py-3',
                  'hover:bg-[#121212] transition',
                ].join(' ')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative size-6 shrink-0">
                    <img
                      src={avatarSrc}
                      alt="profile"
                      className="size-6 rounded-full object-cover"
                      onError={() => setAvatarSrc('/cat.png')}
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -right-[2px] -bottom-[2px] size-2 rounded-full bg-emerald-400 ring-2 ring-[#0F0F0F]" />
                  </div>

                  <span className="text-white/90 text-[17.5px] font-medium truncate">
                    {loadingName ? 'Loading…' : displayName}
                  </span>
                </div>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={[
                    'shrink-0 text-white/70 transition-transform duration-200',
                    menuOpen ? 'rotate-180' : '',
                  ].join(' ')}
                >
                  <path
                    d="M7 10l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => (isMobile ? openAddPhone() : openAdd())}
                className="ml-auto mr-2 relative z-[9999] transition grid place-items-center shrink-0 p-2 touch-manipulation"
              >
                <Image
                  src="/person-plus-svgrepo-com.svg"
                  width={30}
                  height={30}
                  alt="Add contact"
                />
              </button>

            </div>

            {addOpenPhone && (
              <div className="h-[calc(100vh-91px)] flex items-center justify-center px-6">
                <div className="w-full max-w-[520px] flex flex-col items-center">
                  {addStep === 'enter' ? (
                    <>
                      <div className="text-white text-[28px] mb-6">Enter Username</div>

                      <input
                        ref={addInputRef}
                        value={addUsername}
                        onLoad={() => {
                          const fit = calcFitZoom();
                          setMinZoom(fit);
                          setZoom(fit);
                          setPan({ x: 0, y: 0 });
                        }}
                        onChange={(e) => setAddUsername(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onNext();
                        }}
                        className="w-full max-w-[430px] h-[46px] rounded-[10px] bg-[#2f2f2f] text-white/90 outline-none px-4 focus-within:ring-2 focus-within:ring-[#2FE4E4]/40"
                      />

                      <button
                        type="button"
                        onClick={onNext}
                        disabled={searching}
                        className="mt-5 w-full max-w-[430px] h-[50px] rounded-[8px] bg-[#26D9D9] text-black font-semibold"
                      >
                        {searching ? 'Searching…' : 'Next'}
                      </button>

                      <button
                        type="button"
                        onClick={closeAddPhone}
                        className="mt-4 text-white/60 hover:text-white/80 text-[14px]"
                      >
                        Close
                      </button>

                      {addError && <div className="mt-4 text-red-400 text-[14px]">{addError}</div>}
                    </>
                  ) : (
                    <>
                      <img
                        src={found?.avatar || '/cat.png'}
                        alt="pfp"
                        className="h-[150px] w-[150px] rounded-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/cat.png';
                        }}
                      />

                      <div className="text-white text-[40px] mb-6">{found?.username}</div>

                      <button
                        type="button"
                        onClick={onAddContact}
                        disabled={adding}
                        className="w-full max-w-[430px] h-[52px] rounded-[8px] bg-[#26D9D9] text-black font-semibold disabled:opacity-70"
                      >
                        {adding ? 'Adding…' : 'Add Contact'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddStep('enter')}
                        className="mt-4 text-white/60 hover:text-white/80 text-[14px]"
                      >
                        Back
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* DROPDOWN */}
            {menuOpen && (
              <div
                className={[
                  'absolute left-0 top-full mt-2 z-50',
                  'w-[180px]',
                  'rounded-[15px]',
                  'bg-[#0F0F0F]',
                  'border-2',
                  'border-[#222222]',
                  'shadow-[0_30px_80px_rgba(0,0,0,0.75)]',
                  'p-5',
                ].join(' ')}
              >
                {/* header */}
                <div className="flex flex-col items-center pt-2">
                  <div className="h-[49px] w-[49px] rounded-full bg-[#0b3b37] flex items-center justify-center overflow-hidden">
                    <img
                      src={avatarSrc}
                      alt="profile"
                      className="h-full w-full object-cover"
                      onError={() => setAvatarSrc('/cat.png')}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="mt-3 text-white text-[17.5px] font-medium">
                    {loadingName ? 'Loading…' : ellipsize(displayName, 13)}
                  </div>
                </div>

                {/* divider */}
                <div className="my-5 h-px bg-white/20" />

                {/* logout */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-4 px-3.5 py-0 text-red-500 hover:text-red-400 transition"
                >
                  <svg width="24.5" height="24.5" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path
                      d="M10 17l-5-5 5-5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 12h9"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M14 7V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-1"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-[17.5px]">Log out</span>
                </button>
              </div>
            )}
          </div>

          {/* search */}
          <div className="mt-4 w-full h-[54.6px] rounded-[15px] bg-[#262626] flex items-center gap-3 px-4 focus-within:ring-2 focus-within:ring-[#2FE4E4]/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 text-white/55">
              <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Paste Username..."
              className="w-full bg-transparent outline-none text-white/80 placeholder:text-white/40 text-[17.5px]"
            />
          </div>
          <div className="mt-4 -mx-4 h-px bg-white/10" />
          {/* contacts list */}
          <div className="mt-0 -mx-4 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
            {contacts.length === 0 ? (
              <div className="text-white/40 text-[14px] px-2 py-4"></div>
            ) : (
              <div className="space-y-0">
                {filteredContacts.map((c) => {
                  const active = c.id === activeContactId;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setActiveContactId(c.id);
                        setJumpOnOpen(true);
                        if (isMobile) setMobileView('chat');
                      }}
                      className={[
                        'h-[91px] w-full flex items-center gap-4 px-4 py-4',
                        'border-b border-white/10',
                        active ? 'bg-white/5' : 'hover:bg-white/5',
                        'transition text-left',
                      ].join(' ')}
                    >
                      <div className="h-[49px] w-[49px] rounded-full bg-[#0b3b37] overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={c.avatar || '/cat.png'}
                          alt="avatar"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/cat.png';
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 w-full min-w-0">
                        <div className="min-w-0">
                          <div className="text-white text-[18px] font-medium truncate">{c.username}</div>

                          <div
                            className={[
                              'text-[16px] truncate',
                              (c.unreadCount ?? 0) > 0 ? 'text-white' : 'text-[#A6A6A6]',
                            ].join(' ')}
                          >
                            {c.subtitle || ''}
                          </div>
                        </div>

                        <div
                          className={[
                            'shrink-0 flex flex-col items-end gap-2',
                            (c.unreadCount ?? 0) === 0 ? 'mt-[0]' : 'mt-[7px]',
                          ].join(' ')}
                        >
                          {!!c.lastAt && (
                            <div
                              className={[
                                'text-[13px] leading-none',
                                (c.unreadCount ?? 0) > 0 ? 'text-[#26D9D9]' : 'text-[#A6A6A6]',
                              ].join(' ')}
                            >
                              {formatContactLastAt(c.lastAt)}
                            </div>
                          )}
                          {(c.unreadCount ?? 0) > 0 && (
                            <div className="min-w-[22px] h-[22px] px-2 rounded-full bg-[#2FE4E4] text-black text-[12px] font-semibold grid place-items-center">
                              {formatBadge(c.unreadCount ?? 0)}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* RIGHT CONTENT */}
      <main
        className={[
          'relative flex-1 bg-black min-h-0 flex flex-col overflow-x-hidden',
          isMobile ? (mobileView === 'chat' ? 'flex' : 'hidden') : 'flex',
        ].join(' ')}
      >
        {viewer ? (
          // ====== VIEWER MODE (right) ======
          <div className="h-full flex flex-col">
            {/* top bar viewer */}
            <div className="h-[91px] border-b border-white/10 flex items-center justify-between px-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-[49px] w-[49px] rounded-full overflow-hidden bg-[#0b3b37] shrink-0">
                  <img
                    src={viewer.avatar || '/cat.png'}
                    alt="avatar"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/cat.png')}
                  />
                </div>

                <div className="min-w-0">
                  <div className="ml-[2px] text-white text-[18px] font-medium truncate">{viewer.title}</div>
                  <div className="ml-[2px] text-white/60 text-[13px] truncate">{formatViewerTime(viewer.createdAt)}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeViewer}
                className="h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
                title="Close"
              >
                <Image
                  src="/cancel-svgrepo-com.svg"
                  width={20}
                  height={20}
                  alt="X"
                />
              </button>
            </div>

            {/* body viewer */}
            <div
              ref={viewerBodyRef}
              onMouseDown={onViewerMouseDown}
              onMouseMove={onViewerMouseMove}
              onMouseUp={onViewerMouseUp}
              onMouseLeave={onViewerMouseUp}
              className="flex-1 overflow-hidden bg-black"
              onDoubleClick={resetZoom}
              onWheel={(e) => {
                e.preventDefault();

                const delta = e.deltaY;
                const factor = Math.exp(-delta * 0.0015);

                const el = viewerBodyRef.current;
                if (!el) return;

                const rect = el.getBoundingClientRect();
                const mx = e.clientX - rect.left - rect.width / 2;
                const my = e.clientY - rect.top - rect.height / 2;

                setZoom((prevZoom) => {
                  const nextZoom = clamp(prevZoom * factor, 1, 6);
                  const zoomRatio = nextZoom / prevZoom;

                  setPan((p) => {
                    const anchored = {
                      x: p.x - mx * (zoomRatio - 1),
                      y: p.y - my * (zoomRatio - 1),
                    };
                    return clampPan(anchored, nextZoom);
                  });

                  return nextZoom;
                });
              }}
              style={{ touchAction: 'none' }}
            >
              <img
                src={viewer.url}
                alt="full"
                referrerPolicy="no-referrer"
                draggable={false}
                className="select-none"
                onLoad={() => {
                  const fit = calcFitZoom();
                  setMinZoom(fit);
                  setZoom(fit);
                  setPan({ x: 0, y: 0 });
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: 0,
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  cursor: zoom > minZoom ? 'grab' : 'zoom-in',
                  transition: 'transform 40ms linear',
                }}
              />
            </div>
          </div>
          ) : openedDisputeTx ? (
            <OpenedDispute
              tx={openedDisputeTx}
              onClose={() => {
                setOpenedDisputeTx(null)
                setReviewOrder(null)
              }}
            />

          ) : sellerCancelSuccessTx ? (

            <SellerCancelledScreen
              tx={sellerCancelSuccessTx}
              onClose={() => {
                setSellerCancelSuccessTx(null)
                setCancelOrder(null)
              }}
            />

          ) : fundSuccessTx ? (

            <BuyerFundedScreen
              tx={fundSuccessTx}
              onClose={()=>{
                setFundSuccessTx(null)
                setFundOrder(null)
                setFundStep("screen")
              }}
            />

          ) : fundMode && fundOrder && fundOrder.type !== "digital" ? (
            <FundModeWarning
              mode={fundMode}
              onContinue={() => setFundMode(null)}
              onClose={() => {
                setFundMode(null)
                setFundOrder(null)
              }}
            />

          ) : paidSellerTx ? (

            <PaidSellerScreen
              tx={paidSellerTx}
              onClose={() => setPaidSellerTx(null)}
            />

          ) : respondDisputeSuccessTx ? (

            <SellerRespondedDisputeScreen
              tx={respondDisputeSuccessTx}
              onClose={() => {
                setRespondDisputeSuccessTx(null)
                setRespondDisputeOrder(null)
                setRespondDisputeStep("respond")
              }}
            />

          ) : refundSuccessTx ? (

            <BuyerReFundedScreen
              tx={refundSuccessTx}
              onClose={() => {
                setRefundSuccessTx(null)
                setFundMode(null)
                setFundOrder(null)
                setDisputeOrder(null)
                setRefundOrder(null)
                setRefundDisputeOrder(null)
              }}
            />

          ) : refundDisputeOrder ? (

            <RefundScreen
              order={refundDisputeOrder}
              supabase={supabase}
              onClose={()=>setRefundDisputeOrder(null)}
              onNext={async ()=>{
                await refundDisputeOnChain(refundDisputeOrder)
              }}
            />

          ) : sellerShippedSuccess ? (

            <SellerMarkShippedScreen
              tx={sellerShippedSuccess.tx}
              onClose={()=>setSellerShippedSuccess(null)}
            />

          ) : cancelOrder ? (

            <SellerCancelScreen
              order={cancelOrder}
              supabase={supabase}
              onClose={()=>setCancelOrder(null)}
              onRefund={sellerCancelOnChain}
            />

          ) : shipOrder ? (

            <MarkShippedScreen
              order={shipOrder}
              supabase={supabase}
              onClose={()=>setShipOrder(null)}
              onConfirm={async (order)=>{
                await markShippedOnChain(order)
                setShipOrder(null)
              }}
            />

          ) : respondDisputeOrder && respondDisputeStep === "respond" ? (

            <RespondDisputeScreen
              order={respondDisputeOrder}
              supabase={supabase}
              onClose={() => {
                setRespondDisputeOrder(null)
                setRespondDisputeStep("respond")
              }}
              onNext={() => {
                setRespondDisputeStep("wyntk")
                setRespondDisputeSubStep(0)
              }}
            />

          ) : respondDisputeOrder && respondDisputeStep === "wyntk" ? (

            <WYNTKRespondScreen
              order={respondDisputeOrder}
              step={respondDisputeSubStep}
              supabase={supabase}
              onClose={() => {
                setRespondDisputeOrder(null)
                setRespondDisputeStep("respond")
                setRespondDisputeSubStep(0)
              }}
              onBack={() => {
                if (respondDisputeSubStep > 0) {
                  setRespondDisputeSubStep(prev => prev - 1)
                } else {
                  setRespondDisputeStep("respond")
                }
              }}
              onNext={() => {
                if (respondDisputeSubStep < 3) {
                  setRespondDisputeSubStep(prev => prev + 1)
                } else {
                  setRespondDisputeStep("confirm")
                }
              }}
            />

          ) : respondDisputeOrder && respondDisputeStep === "confirm" ? (

            <RespondDisputeWyntkScreen
              order={respondDisputeOrder}
              supabase={supabase}
              onBack={() => {
                setRespondDisputeStep("wyntk")
              }}
              onClose={() => {
                setRespondDisputeOrder(null)
                setRespondDisputeStep("respond")
              }}
              onNext={async () => {
                await respondDisputeOnChain(respondDisputeOrder)
              }}
            />

          ) : refundDiscussOrder ? (

            <RefundBuyerDiscussScreen
              order={refundDiscussOrder}
              supabase={supabase}
              onClose={() => setRefundDiscussOrder(null)}
              onNext={async () => {
                await refundDuringDiscussOnChain(refundDiscussOrder)
              }}
            />

          ) : PaySellerOrder ? (

            <PaySellerDiscussScreen
              order={PaySellerOrder}
              supabase={supabase}
              onClose={() => setPaySellerOrder(null)}
              onNext={async () => {
                await paySellerDuringDiscussOnChain(PaySellerOrder)
              }}
            />

          ) : refundOrder ? (

            <BuyerRefundScreen
              order={refundOrder}
              supabase={supabase}
              onClose={() => setRefundOrder(null)}
              onRefund={refundBuyerOnChain}
            />

          ) : sellerFundSuccess ? (

            <SellerEscrowFundedScreen
              tx={sellerFundSuccess.tx}
              order={sellerFundOrder}
              supabase={supabase}
              shippingDeadline={sellerFundSuccess.deadline}
              onClose={() => {
                setSellerFundSuccess(null)
                setSellerFundOrder(null)
              }}
            />

          ) : sellerFundOrder && sellerStep === "fund" ? (

            <SellerFundEscrowScreen
              order={sellerFundOrder}
              supabase={supabase}
              onClose={()=>setSellerFundOrder(null)}
              onNext={()=>setSellerStep("confirm")}
            />

          ) : sellerFundOrder && sellerStep === "confirm" ? (

            <SellerFundEscrowConfirm
              order={sellerFundOrder}
              supabase={supabase}
              onBack={()=>setSellerStep("fund")}
              onFund={()=>sellerFundEscrowOnChain(sellerFundOrder)}
              onClose={()=>setSellerFundOrder(null)}
            />



          ) : fundOrder ? (

            fundStep === "screen" ? (

              <FundEscrowScreen
                order={fundOrder}
                onClose={()=>setFundOrder(null)}
                supabase={supabase}
                onNext={()=>setFundStep("confirm")}
              />

            ) : (

              <FundEscrowConfirm
                order={fundOrder}
                supabase={supabase}
                onBack={()=>setFundStep("screen")}
                onFund={()=>fundEscrowOnChain(fundOrder)}
                onClose={() => {
                  setFundOrder(null)
                  setFundStep("screen")
                }}
              />

            )

        ) : disputeOrder ? (

          <OpenDisputeScreen
            order={disputeOrder}
            supabase={supabase}
            onNext={()=>setDisputeStep("wyntk")}
          />

        ) : uploadOrder ? (

          <UploadFileScreen
            order={uploadOrder}
            supabase={supabase}
            onClose={()=>setUploadOrder(null)}
            onSendFile={async (order, file) => {
              await markShippedDigitalOnChain(order, file);
              setUploadOrder(null);
            }}
          />

        ) : downloadOrder ? (

          <DownloadScreen
            order={downloadOrder}
            supabase={supabase}
            onClose={() => setDownloadOrder(null)}
          />

        ) : reviewOrder ? (

          <ReviewScreen
            order={reviewOrder}
            onClose={()=>setReviewOrder(null)}
            supabase={supabase}
            conversationId={conversationId}
            userId={userId}
            activeContactId={activeContactId}
            openDisputeOnChain={openDisputeOnChain}
          />

        ) : escrowListOpen ? (

          <EscrowOrders
            conversationId={conversationId}
            supabase={supabase}
            loadEscrow={loadEscrow}
            viewerId={userId}
            onBuy={onBuy}
            onSellerFund={onSellerFund}
            onMarkShipped={onMarkShipped}
            onRefund={refundBuyerOnChain}
            onCancel={sellerCancelOnChain}
            onClose={()=>setEscrowListOpen(false)}
            onReview={onReview}
            onRespond={(order: any)=>{
              setRespondDisputeOrder(order)
              setRespondDisputeStep("respond")
              setEscrowListOpen(false)
            }}
            onDisputeRefund={(order: any) => setRefundDisputeOrder(order)}
            onPaySeller={paySellerDuringDiscussOnChain}
            onRefundDiscuss={refundDuringDiscussOnChain}
            onSendDigitalFile={markShippedDigitalOnChain}
          />

        ) : escrowOpen ? (
          escrowStep === 'pickType' ? (
            <EscrowScreen
              onClose={() => setEscrowOpen(false)}
              onPick={(type) => {
                setEscrowDraft(prev => ({
                  ...prev,
                  type: type
                }));

                if (type === 'physical') {
                  setEscrowStep('disputeMode');
                } else {
                  setEscrowStep('itemInfo');
                  setEscrowType('digital');
                }
              }}
            />
          ) : escrowStep === 'itemInfo' ? (
            <EscrowItemInfo
              type={escrowType ?? 'physical'}
              mode={escrowDraft.disputeMode}
              draft={escrowDraft}
              setDraft={setEscrowDraft}
              onNext={() => {setEscrowStep('nameOrder');}}

              onBack={() => {
                setExitTarget('pickType');
                setShowExitConfirm(true);
              }}

              onClose={() => {
                setExitTarget('chat');
                setShowExitConfirm(true);
              }}
            />
          ) : escrowStep === 'disputeMode' ? (
            <DisputMode
              onBack={() => setEscrowStep('pickType')}
              onClose={() => { setExitTarget('chat'); setShowExitConfirm(true);}}
              onPick={(type) => {
                setEscrowDraft(prev => ({
                  ...prev,
                  disputeMode: type
                }));
                setEscrowStep('itemInfo');
              }}
            />
          ) : escrowStep === 'nameOrder' ? (
            <EscrowNameOrder
              draft={escrowDraft}
              setDraft={setEscrowDraft}
              onBack={() => setEscrowStep('itemInfo')}
              onClose={() => { setExitTarget('chat'); setShowExitConfirm(true); }}
              onNext={() => setEscrowStep('preview')}
            />
          ) : escrowStep === 'success' ? (
            <EscrowSuccess
              tx={createdTx!}
              onClose={() => {
                resetEscrowDraft();
                setEscrowOpen(false);
              }}
            />
          ) : (
            <EscrowPreview
              draft={escrowDraft}
              type={escrowDraft.type}
              mode={escrowDraft.disputeMode}
              date={escrowDraft.shipDate}
              time={escrowDraft.shipTime}
              onCreate={async () => {
                await createEscrowOrderChain()
              }}
              onBack={() => setEscrowStep('nameOrder')}
              onClose={() => { setExitTarget('chat'); setShowExitConfirm(true); }}
            />
          )
        ) : (
          // ====== CHAT MODE ======
          <>
          {/* top bar */}
          <div className="md:h-[91px] h-[80px] border-b border-white/10 flex items-center px-4 md:px-6 min-w-0">
            {/* LEFT */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {activeContact ? (
                <>
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileView('contacts');
                        setActiveContactId(null);
                      }}
                      className="mr-2 h-10 w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/80"
                      title="Back"
                    >
                      <Image src="/back-svgrepo-com.svg" width={22} height={22} alt="Back" />
                    </button>
                  )}
                  <div className="h-[32px] w-[32px] md:h-[40px] md:w-[40px] rounded-full bg-[#0b3b37] overflow-hidden shrink-0">
                    <img
                      src={activeContact.avatar || '/cat.png'}
                      alt="avatar"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/cat.png')}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="text-white md:text-[18px] text-[15px] font-medium truncate">{activeContact.username}</div>
                    <div className="text-white/50 md:text-[14px] text-[12px]">Online</div>
                  </div>
                </>
              ) : (
                <div className="text-white/50 text-[16px]"></div>
              )}
            </div>

            {/* RIGHT */}
            {activeContact && !addOpen && (
              <div className="flex items-center gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setEscrowListOpen(true)}
                  className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-white/5 grid place-items-center text-white/70"
                  title="Cube"
                >
                  <Image src="/box.svg" width={37} height={37} alt="box"/>
                </button>

              </div>
            )}
          </div>
          {/* body */}
          <div className="flex-1 min-h-0 flex flex-col">
            {/* messages */}
            <div ref={chatScrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-6 space-y-4 scrollbar-hide">
              {!activeContact ? (
                <div className="h-full flex items-center justify-center">
                  <button type="button" onClick={openAdd} className="group">
                    <div
                      className={[
                        'w-[129.5px] h-[129.5px]',
                        'rounded-[18px]',
                        'bg-[#262626]',
                        'flex items-center justify-center',
                        'group-hover:bg-[#303030] transition',
                      ].join(' ')}
                    >
                      <Image src="/5863.png" width={40} height={40} alt="person_plus" />
                    </div>
                    <div className="mt-[7px] text-[#A6A6A6] text-[16px] tracking-wide">Add contact</div>
                  </button>
                </div>
              ) : dbMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-[#A6A6A6] text-[16px]">
                    Start a conversation by typing a message. Click + to create a new Escrow.
                  </div>
                </div>
              ) : (
                <>
                  {dbMessages.map((m, idx) => {
                    const mine = m.sender_id === userId;
                    const isImg = isImagePathMessage(m.body);
                    const isEscrow = isEscrowMessage(m.body);
                    const isEscrowUpdate = isEscrowUpdateMessage(m.body)
                    const parts  = m.body.split(":");
                    const action = parts[2];
                    const timeText = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const curDate = new Date(m.created_at);
                    const curKey = dayKey(curDate);

                    const prev = idx > 0 ? dbMessages[idx - 1] : null;
                    const prevKey = prev ? dayKey(new Date(prev.created_at)) : null;

                    const isFirstOfDay = idx === 0 || curKey !== prevKey;

                    let orderId = null

                    if(m.body.includes("buyer_confirmed")){
                      const escrowId = extractEscrowId(m.body)

                      const order = escrowById[escrowId]

                      if(!order){
                        return <div key={m.id} className="text-white/50">Loading...</div>
                      }

                      return (
                        <BuyerConfirmedMessage
                          key={m.id}
                          order={order}
                        />
                      )
                    }

                    if (m.body.startsWith("escrow_update:")) { 
                      const parts = m.body.split(":") 
                      const escrowPda = parts[1] 
                      const action = parts[2] 
                      if(action === "dispute_opened"){
                        const order = escrowById[escrowPda]

                        if(!order) return null

                        const mine = m.sender_id === userId

                        return (
                          <div key={m.id} className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}>
                            <OpenedDisputeMessage
                              order={order}
                              viewerId={userId}
                              onRespond={(order)=>setRespondDisputeOrder(order)}
                              onRefund={(order)=>setRefundDisputeOrder(order)}
                            />
                          </div>
                        )
                      }
                    }

                    if (isEscrow) {
                      orderId = m.body.slice(7)
                    }

                    if (isEscrowUpdate) {
                      orderId = m.body.split(":")[1]
                    }
                    const order = orderId ? escrowById[orderId] : null

                    const escrow = orderId ? escrowById[orderId] : null
                    const escrowMine = escrow?.seller_id === userId

                    return (
                      <React.Fragment key={m.id}>
                        {isFirstOfDay && (
                          <div className="flex justify-center my-4">
                            <div className="px-4 py-2 rounded-full bg-white/10 text-white/70 text-[13px]">
                              {formatDayHeader(curDate)}
                            </div>
                          </div>
                        )}

                        <div
                          ref={(el) => {
                            msgRefs.current.set(m.id, el);
                            if (!el) msgRefs.current.delete(m.id);
                          }}
                          className={`flex w-full ${
                            isEscrow
                              ? (escrowMine ? "justify-end" : "justify-start")
                              : mine
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div className="max-w-[82%] md:max-w-[680px] min-w-0">
                            <div
                              className={`flex w-full ${
                                isEscrow
                                  ? (escrowMine ? "justify-end" : "justify-start")
                                  : mine
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div className="min-w-0 max-w-full md:max-w-[680px]">
                                {/* IMAGE MESSAGE */}
                                {isEscrowUpdate ? (
                                  <div className="flex w-full justify-center">
                                    {order ? (
                                      action === "seller_shipped" ? (
                                        <SellerMarkShippedMessage
                                          order={order}
                                          viewerId={userId}
                                          onReview={onReview}
                                          onDownload={(order) => setDownloadOrder(order)}
                                        />

                                      ) : action === "seller_funded" ? (
                                        <SellerShippingMessage
                                          order={order}
                                          viewerId={userId}
                                          onMarkShipped={onMarkShipped}
                                          onCancel={(order)=>setCancelOrder(order)}
                                          onUploadFile={(order)=>setUploadOrder(order)}
                                        />
                                      ) : action === "shipping_timeout" ? (
                                        <ShippingTimeoutMessage
                                          order={order}
                                        />
                                      ) : action === "confirm_timeout" ? (
                                        <ConfirmTimeoutMessage
                                          order={order}
                                        />
                                      ) : action === "respond_timeout" ? (
                                        <RespondTimeoutMessage
                                          order={order}
                                        />
                                      ) : action === "draw" ? (
                                        <DiscussTimeoutMessage
                                          order={order}
                                        />
                                      ) : action === "seller_responded_dispute" ? (

                                        <DiscussTimeMessage
                                          order={order}
                                          viewerId={userId}
                                          onRefundDiscuss={(order)=>setRefundDiscussOrder(order)}
                                          onPaySeller={(order)=>setPaySellerOrder(order)}
                                        />

                                      ) : action === "seller_cancelled" ? (
                                        <SellerCancelledMessage
                                          order={order}
                                        />
                                      ) : action === "seller_refunded" ? (
                                        <SellerRefundedMessage
                                          order={order}
                                        />

                                      ) : action === "seller_paid" ? (

                                        <PaidSellerMessage
                                          order={order}
                                        />

                                      ) : action === "buyer_cancelled" ? (

                                        <BuyerRefundedMessage
                                          order={order}
                                        />

                                      ) : (
                                        <EscrowUpdateMessage
                                          order={order}
                                          viewerId={userId}
                                          onFundEscrow={onSellerFund}
                                          onRefund={(order)=>setRefundOrder(order)}
                                        />
                                      )
                                    ) : (
                                      <div className="text-white/50">Loading...</div>
                                    )}
                                  </div>
                                ) : isEscrow ? (
                                  <EscrowCard
                                    orderId={orderId!}
                                    loadEscrow={loadEscrow}
                                    supabase={supabase}
                                    viewerId={userId}
                                    onBuy={onBuy}
                                    onFundEscrow={onSellerFund}
                                    onMarkShipped={onMarkShipped}
                                    onRefund={(order)=>setRefundOrder(order)}
                                    onCancel={(order)=>setCancelOrder(order)}
                                    onReview={onReview}
                                    onRespond={(order)=>setRespondDisputeOrder(order)}
                                    onDisputeRefund={(order)=>setRefundDisputeOrder(order)}
                                    onRefundDiscuss={(order)=>setRefundDiscussOrder(order)}
                                    onPaySeller={(order)=>setPaySellerOrder(order)}
                                    onUploadFile={(order) => setUploadOrder(order)}
                                    onDownload={(order:any)=>{
                                      setDownloadOrder(order);
                                    }}
                                  />
                                ) : isImg ? (
                                  <div
                                    className={[
                                      'flex items-end gap-2',
                                      mine ? 'flex-row-reverse' : 'flex-row',
                                    ].join(' ')}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => openImageViewer(m)}
                                      className="relative inline-block rounded-[18px] overflow-hidden text-left"
                                      title="Open image"
                                    >
                                      <div className="md:w-auto md:max-w-[320px] md:h-auto">
                                        <ChatImage
                                          path={m.body.slice(8)}
                                          getUrl={getSignedUrl}
                                          className="w-full h-full md:h-auto md:object-cover cursor-zoom-in"
                                          onLoaded={() => {
                                            if (pendingBottomScrollRef.current && pendingConvoRef.current === conversationId) {
                                              followBottomFor(400, true, 'auto');
                                              pendingBottomScrollRef.current = false;
                                            }
                                          }}
                                        />
                                      </div>
                                    </button>
                                    <div className="flex items-center gap-1 shrink-0 text-[12px] leading-none mb-1 text-white/40">
                                      <span>{timeText}</span>
                                      {mine && (
                                        <span className={m.read_at ? 'text-[#26D9D9]' : 'text-white/70'}>
                                          <ReadTicks read={!!m.read_at} />
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className={[
                                      'flex items-end gap-2',
                                      mine ? 'flex-row-reverse' : 'flex-row',
                                    ].join(' ')}
                                  >
                                    {/* bubble */}
                                    <div
                                      className={[
                                        'px-3.5 py-2 md:px-4 md:py-3 rounded-[18px]',
                                        mine ? 'bg-white text-black' : 'bg-[#1f1f1f] text-white',
                                      ].join(' ')}
                                    >
                                      <div className="md:text-[18px] text-[16px] leading-snug break-words whitespace-pre-wrap">
                                        {m.body}
                                      </div>
                                    </div>

                                    {/* time outside bubble */}
                                    <div
                                      className={[
                                        'flex items-center gap-1 shrink-0',
                                        'text-[12px] leading-none mb-1',
                                        mine ? 'text-white/40' : 'text-white/40',
                                      ].join(' ')}
                                    >
                                      <span>{timeText}</span>
                                      {mine && (
                                        <span className={m.read_at ? 'text-[#26D9D9]' : 'text-black/35'}>
                                          <ReadTicks read={!!m.read_at} />
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}

                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* composer */}
            {activeContact && (
              <div className="sticky bottom-0 shrink-0 border-t border-white/10 bg-black 
                            px-3 md:px-6 py-4 md:py-5 
                            pb-[calc(env(safe-area-inset-bottom)+16px)] md:pb-[calc(env(safe-area-inset-bottom)+20px)]">
                
                <div className="flex items-center gap-3 w-full min-w-0 overflow-visible">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    title="Create Escrow"
                    onClick={() => {
                      resetEscrowDraft();
                      setEscrowStep('pickType');
                      setEscrowOpen(true);
                    }}
                    className="shrink-0 h-[42px] w-[42px] md:h-[53px] md:w-[53px] rounded-[14px] border border-[#26D9D9] text-[#26D9D9] hover:bg-white/5 transition grid place-items-center"
                  >
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <div className="relative z-10 flex-1  h-[42px] md:h-[53px] 
                                  rounded-[12px] md:rounded-[14px] rounded-[14px] bg-[#262626] px-4 flex items-center
                                  focus-within:ring-2 focus-within:ring-[#2FE4E4]/40">

                    <input
                      value={chatDraft}
                      onChange={(e) => setChatDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (chatDraft.trim()) onSend();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full bg-transparent text-white/90 outline-none placeholder:text-white/40 text-[15px] md:text-[17px]"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!canSend}
                    className={[
                      'shrink-0 h-[42px] w-[42px] md:h-[53px] md:w-[53px] rounded-[14px] text-black transition grid place-items-center',
                      canSend ? 'bg-white hover:opacity-90' : 'bg-[#9b9b9b] opacity-60 cursor-not-allowed',
                    ].join(' ')}
                    title="Send"
                    onClick={onSend}
                  >
                    <Image src="/send.svg" width={25} height={25} alt="send" className="md:w-[25px] md:h-[25px]"/>
                  </button>
                </div>
              </div>
            )}
          </div>
          {addOpen && (
            <div className="absolute inset-0 z-[999] bg-black">
              {/* top bar */}
              <div className="h-[91px] border-b border-white/10 flex gap-7 px-8">
                <button type="button" onClick={closeAdd} className="text-white/80 hover:text-white">
                  <Image
                    src="/cancel-svgrepo-com.svg"
                    width={20}
                    height={20}
                    alt="X"
                  />
                </button>
                <div className="mt-[32px] text-white text-[18px] font-medium">Add Contact</div>
              </div>

              {/* body */}
              <div className="h-[calc(100vh-91px)] flex items-center justify-center px-6">
                <div className="w-full max-w-[520px] flex flex-col items-center">
                  {addStep === 'enter' ? (
                    <>
                      <div className="text-white text-[28px] mb-6">Enter Username</div>

                      <input
                        ref={addInputRef}
                        value={addUsername}
                        onLoad={() => {
                          const fit = calcFitZoom();
                          setMinZoom(fit);
                          setZoom(fit);
                          setPan({ x: 0, y: 0 });
                        }}
                        onChange={(e) => setAddUsername(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onNext();
                        }}
                        className="w-full max-w-[430px] h-[46px] rounded-[10px] bg-[#2f2f2f] text-white/90 outline-none px-4 focus-within:ring-2 focus-within:ring-[#2FE4E4]/40"
                      />

                      <button
                        type="button"
                        onClick={onNext}
                        disabled={searching}
                        className="mt-5 w-full max-w-[430px] h-[50px] rounded-[8px] bg-[#26D9D9] text-black font-semibold"
                      >
                        {searching ? 'Searching…' : 'Next'}
                      </button>

                      {addError && <div className="mt-4 text-red-400 text-[14px]">{addError}</div>}
                    </>
                  ) : (
                    <>
                      <img
                        src={found?.avatar || '/cat.png'}
                        alt="pfp"
                        className="h-[150px] w-[150px] rounded-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/cat.png';
                        }}
                      />

                      <div className="text-white text-[40px] mb-6">{found?.username}</div>

                      <button
                        type="button"
                        onClick={onAddContact}
                        disabled={adding}
                        className="w-full max-w-[430px] h-[52px] rounded-[8px] bg-[#26D9D9] text-black font-semibold disabled:opacity-70"
                      >
                        {adding ? 'Adding…' : 'Add Contact'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddStep('enter')}
                        className="mt-4 text-white/60 hover:text-white/80 text-[14px]"
                      >
                        Back
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          </>
        )}
        {showExitConfirm && (
          <div className="absolute inset-0 z-[9999] flex items-center justify-center">

            {/* backdrop blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* popup */}
            <div className="relative z-10 w-[420px] rounded-[22px] bg-[#1c1c1c] p-6 text-center shadow-2xl">

              <div className="text-white text-[17px] mb-4">
                If you exit this page the order info will be delete
              </div>

              <div className="flex justify-center gap-10 text-[18px]">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="text-white/80 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={exitEscrowFlow}
                  className="text-red-500 hover:text-red-400 font-medium"
                >
                  Exit
                </button>
              </div>

            </div>
          </div>
        )}
      </main>
      {showWalletGate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* backdrop blur */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* modal */}
          <div className="relative z-10 w-[420px] max-w-[90%] rounded-2xl bg-[#000000] p-8 text-center border border-white/10 shadow-2xl">
            <div className="mb-6 flex justify-center">
              <img
                src="wallet-svgrepo-com.svg"
                alt="" 
                aria-hidden="true"
                className="h-20 w-20 object-contain opacity-90"
              />
            </div>

            <div className="text-white text-[22px] font-semibold mb-3">
              Connect your wallet
            </div>
            <div className="text-white/60 text-[14px] mb-6">
              You must connect a wallet before using the chat.
            </div>

            <button
              onClick={connectPhantom}
              disabled={connectingWallet}
              aria-busy={connectingWallet}
              className="flex items-center justify-center gap-3 w-full h-[46px] rounded-xl bg-[#2FE4E4] text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src="phantom.webp"
                alt="" 
                aria-hidden="true"
                className="h-[18px] w-[21px] object-cover"
              />
              <span>{connectingWallet ? "Connecting..." : "Connect Phantom"}</span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}