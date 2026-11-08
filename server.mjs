import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  schemas,
  systemPrompt,
  validateRequest,
  validateResult,
} from "./src/api-contract.mjs";
const root = path.dirname(fileURLToPath(import.meta.url));
const production = process.argv.includes("--production");
const apiKey = process.env.GEMINI_API_KEY?.trim();
const port = Number(process.env.PORT || 5173);
const vite =
  production || process.env.NODE_ENV === "test"
    ? null
    : await (
        await import("vite")
      ).createServer({
        root,
        server: { middlewareMode: true },
        appType: "spa",
      });
const rates = new Map();
function json(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}
export async function tutorRequest(data, key = apiKey, fetcher = fetch) {
  if (!validateRequest(data))
    return {
      status: 400,
      body: { error: "Invalid lesson request. Refresh and try again." },
    };
  if (!key)
    return {
      status: 503,
      body: {
        error:
          "AI is not configured. Built-in practice is available; add GEMINI_API_KEY to the server’s .env file to enable AI.",
      },
    };
  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await fetcher(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        signal: AbortSignal.timeout(45000),
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt(data.action, data.profile) }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: data.input || "Create a fresh exercise." }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schemas[data.action],
            temperature:
              data.action === "feedback" || data.action === "diagnostic"
                ? 0.3
                : 0.85,
          },
        }),
      },
    );
    if (!response.ok)
      return {
        status: 502,
        body: {
          error:
            response.status === 429
              ? "The AI service is busy. Wait a moment and try again."
              : "The AI service could not complete this request. Check the server’s API key and model, or retry.",
        },
      };
    const result = await response.json();
    const raw = result.candidates?.[0]?.content?.parts
      ?.filter((p) => !p.thought)
      .map((p) => p.text || "")
      .join("");
    const parsed = JSON.parse(raw);
    if (!validateResult(data.action, parsed))
      throw new Error("Invalid AI response");
    return { status: 200, body: parsed };
  } catch {
    return {
      status: 502,
      body: {
        error:
          "The AI response was incomplete or timed out. Your work is still here; please try again.",
      },
    };
  }
}
const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  let url;
  try {
    url = new URL(req.url, "http://localhost");
  } catch {
    return json(res, 400, { error: "Invalid URL." });
  }
  if (url.pathname === "/api/status") return json(res, 200, { ai: !!apiKey });
  if (url.pathname === "/api/tutor") {
    if (req.method !== "POST") return json(res, 405, { error: "Use POST." });
    if (
      req.headers.origin &&
      req.headers.origin !== `http://${req.headers.host}` &&
      req.headers.origin !== `https://${req.headers.host}`
    )
      return json(res, 403, {
        error: "Cross-origin requests are not allowed.",
      });
    if (!req.headers["content-type"]?.startsWith("application/json"))
      return json(res, 415, { error: "Send JSON." });
    const now = Date.now();
    for (const [key, rate] of rates)
      if (now - rate.start > 60000) rates.delete(key);
    const address = req.socket.remoteAddress;
    const rate = rates.get(address) || { start: now, count: 0 };
    rate.count++;
    rates.set(address, rate);
    if (rate.count > 12)
      return json(res, 429, {
        error: "Please wait a minute before requesting another AI lesson.",
      });
    let body = "";
    try {
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 24000)
          return json(res, 413, {
            error:
              "This response is too long. Please keep it under 16,000 characters.",
          });
      }
      const result = await tutorRequest(JSON.parse(body));
      return json(res, result.status, result.body);
    } catch {
      return json(res, 400, { error: "Could not read this request." });
    }
  }
  if (url.pathname.startsWith("/api/"))
    return json(res, 404, { error: "Not found." });
  if (vite) return vite.middlewares(req, res);
  try {
    const decoded =
      url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    if (decoded.split("/").some((segment) => segment.startsWith(".")))
      throw new Error("Hidden file");
    const file = path.resolve(root, "dist", `.${decoded}`);
    if (!file.startsWith(path.join(root, "dist") + path.sep))
      throw new Error("Not a file");
    let content;
    let ext = path.extname(file);
    try {
      content = await readFile(file);
    } catch {
      if (ext) {
        res.writeHead(404);
        return res.end("Not found");
      }
      content = await readFile(path.join(root, "dist/index.html"));
      ext = ".html";
    }
    const types = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".woff2": "font/woff2",
    };
    res.writeHead(200, {
      "Content-Type": types[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
if (process.env.NODE_ENV !== "test")
  server.listen(port, process.env.HOST || "127.0.0.1", () =>
    console.log(
      `Engly is ready at http://localhost:${port} (${apiKey ? "AI connected" : "built-in practice"})`,
    ),
  );
export { server };
