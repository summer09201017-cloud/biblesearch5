import { resolveKeywordPayload } from "../../server.js";

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({ status: "error", message: "Method not allowed." })
    };
  }

  const params = event.queryStringParameters || {};
  const version = String(params.version || "").toLowerCase();
  const query = String(params.q || "").trim();
  const limitParam = String(params.limit || "all").trim().toLowerCase();
  const offset = Math.max(Number(params.offset || 0), 0);
  const { statusCode, payload } = await resolveKeywordPayload(version, query, limitParam, offset);

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  };
}
