import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

const PING_TIMEOUT_MS = 8_000;

function wsUrlToHttp(wsUrl: string): string {
  return wsUrl.replace(/^wss?:\/\//, (match) =>
    match === "wss://" ? "https://" : "http://"
  );
}

async function ping(
  url: string
): Promise<{ url: string; ok: boolean; status?: number; error?: string }> {
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(PING_TIMEOUT_MS),
    });
    return { url, ok: response.ok, status: response.status };
  } catch (error) {
    return {
      url,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiBase =
    process.env.KEEP_ALIVE_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;
  const wsBase =
    process.env.KEEP_ALIVE_WS_URL ?? process.env.NEXT_PUBLIC_WS_URL;

  const targets: string[] = [];

  if (apiBase) {
    targets.push(`${apiBase.replace(/\/$/, "")}/health`);
  }

  if (wsBase) {
    targets.push(`${wsUrlToHttp(wsBase).replace(/\/$/, "")}/health`);
  }

  if (targets.length === 0) {
    return NextResponse.json(
      { error: "No keep-alive targets configured" },
      { status: 500 }
    );
  }

  const results = await Promise.all(targets.map(ping));
  const allOk = results.every((result) => result.ok);

  return NextResponse.json(
    {
      status: allOk ? "ok" : "partial",
      timestamp: Date.now(),
      results,
    },
    { status: allOk ? 200 : 207 }
  );
}
