import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeUsername(input: string) {
  return input.trim();
}

function isValidUsername(u: string) {
  return /^(?![._])[a-zA-Z0-9._]{3,20}$/.test(u);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const usernameRaw = String(body.username ?? "");

    const username = normalizeUsername(usernameRaw);

    if (!email || !password || !username) {
      return NextResponse.json(
        { ok: false, error: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    if (!isValidUsername(username)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_USERNAME" },
        { status: 400 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: username },
    });

    if (createErr || !created?.user) {
      const msg = createErr?.message ?? "CREATE_USER_FAILED";
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }

    const userId = created.user.id;

    const { error: reserveErr } = await admin
      .from("usernames")
      .insert({ user_id: userId, username });

    if (reserveErr) {
      if ((reserveErr as any).code === "23505") {
        await admin.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { ok: false, error: "USERNAME_TAKEN" },
          { status: 409 }
        );
      }

      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { ok: false, error: reserveErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "UNKNOWN_ERROR" },
      { status: 500 }
    );
  }
}
