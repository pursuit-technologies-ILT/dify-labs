#!/usr/bin/env node
/**
 * Synthetic claims / prior-auth API for Dify HTTP tools (Module 3+).
 * No auth — lab network only.
 */
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_CLAIMS_PORT ?? 3860);

const claimsByMember = {
  M1001: {
    member_id: "M1001",
    plan_type: "PPO",
    open_claims: [
      { claim_id: "C-88421", status: "pending_review", amount_usd: 420.0 },
    ],
  },
  M2002: {
    member_id: "M2002",
    plan_type: "HDHP",
    open_claims: [],
  },
};

const priorAuthById = {
  "PA-9001": {
    auth_id: "PA-9001",
    member_id: "M1001",
    procedure_code: "72148",
    status: "approved",
    valid_through: "2026-12-01",
  },
  "PA-9002": {
    auth_id: "PA-9002",
    member_id: "M2002",
    procedure_code: "93306",
    status: "more_info_needed",
    valid_through: null,
  },
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  const { pathname } = url;

  if (req.method === "GET" && pathname === "/health") {
    sendJson(res, 200, { ok: true, service: "mock-claims" });
    return;
  }

  const claimMatch = pathname.match(/^\/v1\/claims\/([^/]+)$/);
  if (req.method === "GET" && claimMatch) {
    const memberId = decodeURIComponent(claimMatch[1]);
    const row = claimsByMember[memberId];
    if (!row) {
      sendJson(res, 404, { error: "member_not_found", member_id: memberId });
      return;
    }
    sendJson(res, 200, row);
    return;
  }

  const paMatch = pathname.match(/^\/v1\/prior-auth\/([^/]+)$/);
  if (req.method === "GET" && paMatch) {
    const authId = decodeURIComponent(paMatch[1]);
    const row = priorAuthById[authId];
    if (!row) {
      sendJson(res, 404, { error: "prior_auth_not_found", auth_id: authId });
      return;
    }
    sendJson(res, 200, row);
    return;
  }

  sendJson(res, 404, { error: "not_found", path: pathname });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`mock-claims listening on :${PORT}`);
});
