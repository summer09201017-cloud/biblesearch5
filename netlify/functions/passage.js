import { resolvePassagePayload } from "../../server.js";

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
  const qstr = String(params.qstr || "").trim();
  const { statusCode, payload } = await resolvePassagePayload(version, qstr);

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  };
}
