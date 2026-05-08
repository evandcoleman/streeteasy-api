import { spawn } from "node:child_process";
import { chmodSync, statSync } from "node:fs";
import path from "node:path";
import { ChromePresets, BINARY_PATH } from "@qnaplus/node-curl-impersonate";

const PRESET_VERSION = "116" as const;

// Resolve the bundled chrome-impersonate binary for the current platform.
// Bypasses the package's resolveBrowser() because its binary name lookup
// table doesn't match the actual filenames shipped on disk.
function resolveBinaryPath(): string {
  const { platform, arch } = process;
  if (platform === "linux") {
    if (arch === "x64") return path.join(BINARY_PATH, "chrome-x64");
    if (arch === "arm64") return path.join(BINARY_PATH, "chrome-aarch64");
  }
  if (platform === "darwin") {
    // Only an x86 build is shipped for darwin; runs under Rosetta on arm64.
    return path.join(BINARY_PATH, "chrome-x86");
  }
  if (platform === "win32") {
    return path.join(BINARY_PATH, "chrome-x64.exe");
  }
  throw new Error(`Unsupported platform for curl-impersonate: ${platform}/${arch}`);
}

// Minimal local typings so this file compiles without "DOM" in tsconfig.lib.
// At runtime Node 18+ provides global Headers/Response.
type HeadersLike = Record<string, string> | Array<[string, string]>;
interface RequestInitLike {
  method?: string;
  headers?: HeadersLike;
  body?: string | null;
}
declare const Response: {
  new (body?: string | null, init?: { status?: number; headers?: Record<string, string> }): unknown;
};

/**
 * A fetch implementation backed by curl-impersonate. Mimics a real Chrome
 * TLS/HTTP2 fingerprint so requests are not blocked by anti-bot protection
 * (e.g. PerimeterX) that fingerprints Node's default TLS handshake.
 *
 * Bypasses @qnaplus/node-curl-impersonate's RequestBuilder.send() because it
 * uses shell `exec` with unescaped string concatenation — unsafe with JSON
 * bodies. We invoke the bundled binary directly via spawn() with argv.
 */
export async function curlImpersonateFetch(
  input: string | { href?: string; url?: string },
  init?: RequestInitLike,
): Promise<unknown> {
  const preset = ChromePresets[PRESET_VERSION];
  const binary = resolveBinaryPath();
  ensureExecutable(binary);

  const url =
    typeof input === "string"
      ? input
      : input.href !== undefined
        ? input.href
        : (input.url ?? "");
  const method = (init?.method ?? "GET").toUpperCase();

  const userHeaders: Record<string, string> = {};
  if (init?.headers) {
    const entries = Array.isArray(init.headers)
      ? init.headers
      : Object.entries(init.headers);
    for (const [name, value] of entries) {
      userHeaders[name] = value;
    }
  }

  // User headers win over preset headers.
  const mergedHeaders: Record<string, string> = { ...preset.headers, ...userHeaders };

  const args: string[] = [];

  // Preset flags arrive as space-separated shell strings — re-split safely.
  for (const flagStr of preset.flags) {
    args.push(...splitFlagString(flagStr));
  }

  args.push("-s", "-w", "\n%{json}", "-X", method);

  for (const [name, value] of Object.entries(mergedHeaders)) {
    args.push("-H", `${name}: ${value}`);
  }

  if (init?.body !== undefined && init.body !== null) {
    const bodyStr = typeof init.body === "string" ? init.body : String(init.body);
    args.push("--data-raw", bodyStr);
  }

  args.push(url);

  const { stdout, exitCode } = await runBinary(binary, args);
  if (exitCode !== 0) {
    throw new Error(`curl-impersonate exited with code ${exitCode}`);
  }

  // The -w "\n%{json}" trailer appends a JSON metadata line after the body.
  const lastNewline = stdout.lastIndexOf("\n");
  const body = lastNewline >= 0 ? stdout.slice(0, lastNewline) : stdout;
  const meta = lastNewline >= 0 ? safeParse(stdout.slice(lastNewline + 1)) : null;
  const status = meta?.http_code ?? 200;
  const contentType = meta?.content_type ?? "application/json";

  return new Response(body, {
    status,
    headers: { "content-type": contentType },
  });
}

interface CurlMeta {
  http_code: number;
  content_type: string | null;
}

function safeParse(s: string): CurlMeta | null {
  try {
    return JSON.parse(s) as CurlMeta;
  } catch {
    return null;
  }
}

function ensureExecutable(file: string): void {
  const mode = statSync(file).mode;
  if ((mode & 0o111) === 0) {
    chmodSync(file, mode | 0o755);
  }
}

function splitFlagString(flagStr: string): string[] {
  return flagStr.split(/\s+/).filter(Boolean);
}

function runBinary(binary: string, args: string[]): Promise<{ stdout: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ["ignore", "pipe", "pipe"] });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => out.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => err.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0 && err.length > 0) {
        reject(new Error(`curl-impersonate stderr: ${Buffer.concat(err).toString("utf8")}`));
        return;
      }
      resolve({ stdout: Buffer.concat(out).toString("utf8"), exitCode: code ?? 0 });
    });
  });
}
