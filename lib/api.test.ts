import { afterEach, describe, expect, test } from "bun:test";
import { transformSubmission } from "./transforms";
import type { ApiSubmissionDetail } from "./types";

const API_BASE = "https://api.pinchbench.com/api";

function makeSubmission(id: string) {
  return {
    id,
    timestamp: "2026-01-01T00:00:00Z",
    openclaw_version: "1.0.0",
    benchmark_version: "abc123",
    model: `model-${id}`,
    provider: "openrouter",
    tasks: Array.from({ length: 23 }, (_, index) => ({
      task_id: `task-${index + 1}`,
      score: index % 3 === 0 ? 0 : 1,
      max_score: 1,
      breakdown: { pass: index % 3 === 0 ? 0 : 1 },
      grading_type: "automated" as const,
      timed_out: false,
      execution_time_seconds: 2 + index,
      frontmatter: {
        name: `Task ${index + 1}`,
        category: index % 2 === 0 ? "coding" : "api",
        grading_type: "automated" as const,
      },
    })),
    total_score: 15,
    max_score: 23,
    metadata: {
      run_timestamp: 1767225600,
      task_count: 23,
      system: {
        os: "linux",
        architecture: "x64",
        cpu_count: 8,
      },
    },
    usage_summary: {
      total_input_tokens: 1000,
      total_output_tokens: 500,
      total_requests: 23,
      total_cost_usd: 0.42,
    },
    official: true,
  };
}

async function importFreshApi() {
  return import(`./api?test=${Date.now()}-${Math.random()}`);
}

afterEach(() => {
  globalThis.fetch = fetch;
});

describe("fetchTransformedBestSubmissions", () => {
  test("returns the same transformed shape while reusing cached detail payloads", async () => {
    const api = await importFreshApi();
    const ids = ["sub-1", "sub-2", "sub-1"];
    const calls: string[] = [];
    const payloads = new Map(ids.map((id) => [id, { submission: makeSubmission(id) }]));

    globalThis.fetch = Object.assign(
      async (input: RequestInfo | URL) => {
        const url = String(input);
        calls.push(url);
        const id = decodeURIComponent(url.slice(`${API_BASE}/submissions/`.length));
        return Response.json(payloads.get(id));
      },
      fetch,
    );

    const before = await Promise.all(ids.slice(0, 2).map((id) => api.fetchSubmission(id)));
    calls.length = 0;
    const after = await api.fetchTransformedBestSubmissions(ids);

    expect(after).toEqual(before.map((response) => transformSubmission(response.submission)));
    expect(calls).toEqual([
      `${API_BASE}/submissions/sub-1`,
      `${API_BASE}/submissions/sub-2`,
    ]);
  });

  test("dedupes in-flight and cached homepage enrichment requests", async () => {
    const api = await importFreshApi();
    const calls: string[] = [];

    globalThis.fetch = Object.assign(
      async (input: RequestInfo | URL) => {
        const url = String(input);
        calls.push(url);
        const id = decodeURIComponent(url.slice(`${API_BASE}/submissions/`.length));
        await new Promise((resolve) => setTimeout(resolve, 1));
        return Response.json({ submission: makeSubmission(id) });
      },
      fetch,
    );

    await Promise.all([
      api.fetchBestSubmissionDetails(["sub-1", "sub-2", "sub-1"]),
      api.fetchBestSubmissionDetails(["sub-2", "sub-3"]),
    ]);
    await api.fetchBestSubmissionDetails(["sub-1", "sub-2", "sub-3"]);

    expect(calls).toEqual([
      `${API_BASE}/submissions/sub-1`,
      `${API_BASE}/submissions/sub-2`,
      `${API_BASE}/submissions/sub-3`,
    ]);
  });

  test("drops failed detail requests so later renders can retry", async () => {
    const api = await importFreshApi();
    let attempts = 0;

    globalThis.fetch = Object.assign(
      async (input: RequestInfo | URL) => {
        attempts += 1;
        if (attempts === 1) {
          return new Response("server error", { status: 500, statusText: "Server Error" });
        }
        const id = decodeURIComponent(String(input).slice(`${API_BASE}/submissions/`.length));
        return Response.json({ submission: makeSubmission(id) });
      },
      fetch,
    );

    expect(await api.fetchBestSubmissionDetails(["sub-1"])).toEqual([]);
    expect((await api.fetchBestSubmissionDetails(["sub-1"])).map((submission: ApiSubmissionDetail) => submission.id)).toEqual(["sub-1"]);
    expect(attempts).toBe(2);
  });

  test("caps homepage detail API calls to unique submissions across repeated renders", async () => {
    const api = await importFreshApi();
    const ids = Array.from({ length: 40 }, (_, index) => `sub-${index % 10}`);
    let requestCount = 0;

    globalThis.fetch = Object.assign(
      async (input: RequestInfo | URL) => {
        requestCount += 1;
        const id = decodeURIComponent(String(input).slice(`${API_BASE}/submissions/`.length));
        return Response.json({ submission: makeSubmission(id) });
      },
      fetch,
    );

    await api.fetchBestSubmissionDetails(ids);
    await api.fetchBestSubmissionDetails(ids);

    // Before this cache, two homepage renders could issue 80 detail requests;
    // now the backend sees one request per unique submission during ISR freshness.
    expect(requestCount).toBe(10);
  });
});
