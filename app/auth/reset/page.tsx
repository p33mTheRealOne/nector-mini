'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      setReady(true);

      if (!data.session) {
      }
    };
    run();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (password.length < 6) return setMsg('Password must be at least 6 characters.');
    if (password !== confirm) return setMsg('Passwords do not match.');

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return setMsg(error.message);

      setMsg('Password updated. Redirecting…');
      setTimeout(() => router.push('/auth?mode=signin'), 800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* glow/vignette */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[920px] h-[920px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black" />
      </div>

      {/* back arrow */}
      <button
        onClick={() => router.back()}
        aria-label="Back"
        className="absolute left-6 top-6 z-10 text-white/90 hover:text-white transition"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div
          className="
            w-full
            max-w-[520px]
            sm:max-w-[560px]
            rounded-[18px]
            bg-black/60
            border border-white/10
            shadow-[0_0_0_1px_rgba(255,255,255,0.04),_0_18px_70px_rgba(0,0,0,0.75)]
            backdrop-blur-md
            px-10
            sm:px-12
            py-10
            sm:py-11
          "
        >
          <h1 className="text-center text-white text-[42px] sm:text-[46px] font-medium leading-tight">
            Reset password
          </h1>
          <p className="mt-2 text-center text-white/80 text-[14px]">
            Set a new password for your account
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-7">
            <div className="space-y-2">
              <div className="text-white text-[14px] font-medium">New Password</div>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? 'text' : 'password'}
                  className="w-full h-[46px] rounded-[8px] bg-[#3A3A3A] text-white px-4 pr-12 outline-none focus:ring-2 focus:ring-[#2FE4E4]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                  aria-label="Toggle password"
                >
                  <EyeIcon />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-white text-[14px] font-medium">Confirm Password</div>
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type={showPw ? 'text' : 'password'}
                className="w-full h-[46px] rounded-[8px] bg-[#3A3A3A] text-white px-4 outline-none focus:ring-2 focus:ring-[#2FE4E4]/40"
              />
            </div>

            {msg && (
              <div className="text-center text-[13px] text-white/80">
                {msg}
              </div>
            )}

            <button
              disabled={loading || !ready}
              className="
                w-full
                h-[52px]
                rounded-[8px]
                bg-[#2FE4E4]
                text-black
                font-semibold
                text-[16px]
                hover:bg-[#29d0d0]
                transition
                disabled:opacity-70
              "
            >
              {loading ? 'Loading…' : 'Update password'}
            </button>

            <div className="text-center text-[14px] text-white/70">
              Back to{' '}
              <a href="/auth?mode=signin" className="text-[#2FE4E4] hover:opacity-90">
                Sign in
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M2.2 12s3.6-7 9.8-7 9.8 7 9.8 7-3.6 7-9.8 7-9.8-7-9.8-7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
