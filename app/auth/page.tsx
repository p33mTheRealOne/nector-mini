'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';

type Mode = 'signup' | 'signin' | 'forgot';

export default function AuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = (params.get('mode') as Mode) || 'signup';

  const supabase = useMemo(() => supabaseBrowser(), []);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';

  const setMode = (m: Mode) => router.push(`/auth?mode=${m}`);

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const u = username.trim().toLowerCase();
    const em = email.trim();

    if (!agree) return setMsg("Please agree to Terms of Service & Privacy Policy.");
    if (!u) return setMsg("Please enter a username.");
    if (!em) return setMsg("Please enter an email.");
    if (!password) return setMsg("Please enter a password.");

    const origin = typeof window !== "undefined" ? window.location.origin : "";

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: em,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: { username: u },
        },
      });

      if (error) return setMsg(error.message);

      setMsg("Check your email to confirm your account.");
      
    } finally {
      setLoading(false);
    }
  }

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return setMsg(error.message);

      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/reset`,
      });

      if (error) return setMsg(error.message);

      setMsg('Password reset link sent. Please check your email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* soft vignette / glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[920px] h-[920px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black" />
      </div>

      {/* back arrow*/}
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) router.back();
          else router.push('/');
        }}
        aria-label="Back"
        className="fixed left-6 top-6 z-[9999] text-white/90 hover:text-white transition"
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
        {/* CARD*/}
        <div className="w-full max-w-[520px] sm:max-w-[560px] rounded-[18px] bg-black/60 border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04),_0_18px_70px_rgba(0,0,0,0.75)] backdrop-blur-md px-10 sm:px-12 py-10 sm:py-11">
          {mode === 'signup' && (
            <>
              <h1 className="text-center text-white text-[40px] sm:text-[44px] font-medium leading-tight">
                Sign up
              </h1>
              <p className="mt-2 text-center text-white/80 text-[14px]">
                Create an account or{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-[#2FE4E4] hover:opacity-90"
                >
                  Sign in
                </button>
              </p>

              <form onSubmit={onSignUp} className="mt-8 space-y-6">
                <Field label="Username">
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    className="w-full h-[46px] rounded-[8px] bg-[#222222] text-white px-4 outline-none focus:ring-2 focus:ring-[#2FE4E4]/40"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </Field>

                <Field label="Email Address">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full h-[46px] rounded-[8px] bg-[#222222] text-white px-4 outline-none focus:ring-2 focus:ring-[#2FE4E4]/40"
                    placeholder=""
                  />
                </Field>

                <Field label="Password">
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPw ? 'text' : 'password'}
                      className="w-full h-[46px] rounded-[8px] bg-[#222222] text-white px-4 pr-12 outline-none focus:ring-2 focus:ring-[#2FE4E4]/40"
                      placeholder=""
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
                </Field>

                <label className="flex items-center gap-2 text-[12px] text-white/40 select-none">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                  I agree to Terms of Service &amp; Privacy Policy
                </label>

                {msg && (
                  <div className="text-center text-[13px] text-white/80">
                    {msg}
                  </div>
                )}

                <button
                  disabled={loading}
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
                  {loading ? 'Loading…' : 'Sign up'}
                </button>

              </form>
            </>
          )}

          {mode === 'signin' && (
            <>
              <h1 className="text-center text-white text-[40px] sm:text-[44px] font-medium leading-tight">
                Sign in
              </h1>
              <p className="mt-2 text-center text-white/80 text-[14px]">
                Login to your account or{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-[#2FE4E4] hover:opacity-90"
                >
                  Sign up
                </button>
              </p>

              <form onSubmit={onSignIn} className="mt-10 space-y-7">
                <Field label="Email Address">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full h-[46px] rounded-[8px] bg-[#222222] text-white px-4 outline-none focus:ring-2 focus:ring-[#2FE4E4]/40"
                  />
                </Field>

                <div className="space-y-2">
                  <Field label="Password">
                    <div className="relative">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPw ? 'text' : 'password'}
                        className="w-full h-[46px] rounded-[8px] bg-[#222222] text-white px-4 pr-12 outline-none focus:ring-2 focus:ring-[#2FE4E4]/40"
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
                  </Field>

                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-left text-[12px] text-white/30 hover:text-white/50 transition"
                  >
                    Forgot your password?
                  </button>
                </div>

                {msg && (
                  <div className="text-center text-[13px] text-white/80">
                    {msg}
                  </div>
                )}

                <button
                  disabled={loading}
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
                  {loading ? 'Loading…' : 'Sign in'}
                </button>

              </form>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h1 className="text-center text-white text-[42px] sm:text-[46px] font-medium leading-tight">
                Forgot password
              </h1>
              <p className="mt-2 text-center text-white/80 text-[14px]">
                We&apos;ll send a link to reset your password
              </p>

              <form onSubmit={onForgot} className="mt-10 space-y-7">
                <Field label="Email Address">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full h-[46px] rounded-[8px] bg-[#222222] text-white px-4 outline-none focus:ring-2 focus:ring-[#2FE4E4]/40"
                  />
                </Field>

                {msg && (
                  <div className="text-center text-[13px] text-white/80">
                    {msg}
                  </div>
                )}

                <button
                  disabled={loading}
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
                  {loading ? 'Loading…' : 'Send me a link'}
                </button>

                <div className="text-center text-[14px] text-white/70">
                  Back to{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-[#2FE4E4] hover:opacity-90"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-white text-[14px] font-medium">{label}</div>
      {children}
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