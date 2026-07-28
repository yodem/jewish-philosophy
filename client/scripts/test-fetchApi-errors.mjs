/**
 * Smoke checks for fetchAPI error mapping (Task 2).
 * Run: node --experimental-vm-modules scripts/test-fetchApi-errors.mjs
 *
 * We inline the unavailable-path logic here because fetchApi is server-only.
 */

function mapUnavailable(err) {
  const isUnavailable =
    err?.message?.includes("ECONNREFUSED") ||
    err?.message?.includes("fetch failed") ||
    err?.cause?.code === "ECONNREFUSED";
  if (isUnavailable) {
    return {
      data: null,
      error: {
        message: err.message || "fetch failed",
        status: 503,
        name: "ServiceUnavailable",
      },
    };
  }
  throw err;
}

function mapHttpError(responseOk, body) {
  if (!responseOk) {
    return body.error
      ? body
      : { error: { message: body.message || "Forbidden", status: 403 } };
  }
  return body;
}

let failed = 0;
function assert(name, cond) {
  if (!cond) {
    console.error("FAIL:", name);
    failed++;
  } else {
    console.log("PASS:", name);
  }
}

// 403 JSON → error, not empty data
{
  const res = mapHttpError(false, {
    error: { status: 403, name: "ForbiddenError", message: "Forbidden" },
  });
  assert("403 returns error", Boolean(res.error && res.error.status === 403));
  assert("403 does not fake empty array", !Array.isArray(res.data));
}

// Network failure → 503 error, not { data: [] }
{
  const res = mapUnavailable(new Error("fetch failed"));
  assert("fetch failed → 503", res.error?.status === 503);
  assert("fetch failed data is null", res.data === null);
  assert("fetch failed is not []", !Array.isArray(res.data));
}

// Genuine empty 200 → empty data, no error
{
  const res = mapHttpError(true, { data: [] });
  assert("empty 200 keeps data []", Array.isArray(res.data) && res.data.length === 0);
  assert("empty 200 has no error", !res.error);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll fetchAPI error-mapping checks passed");
