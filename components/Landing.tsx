import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      <div className="flex flex-1 justify-center items-center mt-75 gap-[23.1px]">
        <Link href="/auth?mode=signin" className="text-white text-[16.8px] hover:text-gray-300">
          Sign in
        </Link>

        <Link
          href="/auth"
          className="bg-[#2FE4E4] text-black text-[16.8px]
                      w-[77px] h-[32.9px] rounded-[7px]
                      flex items-center justify-center
                      hover:bg-[#29d0d0] transition"
        >
          Sign up
        </Link>
      </div>
    </>
  );
}
