import test from "node:test";
import assert from "node:assert/strict";
import { analyzeUrl, extractUrls } from "./urlThreatAnalyzer.js";

test("recognizes a normal HTTPS website as low risk", () => {
  const result = analyzeUrl("https://accounts.google.com/signin");
  assert.equal(result.isValid, true);
  assert.equal(result.riskLevel, "low");
  assert.equal(result.findings.length, 0);
});

test("flags a brand lookalike domain", () => {
  const result = analyzeUrl("http://paypa1-secure-login.com/signin");
  assert.ok(result.findings.some((finding) => finding.code === "brand-lookalike"));
  assert.ok(result.score >= 30);
  assert.ok(result.findings.some((finding) => finding.code === "insecure-http"));
});

test("flags a brand hidden in a subdomain", () => {
  const result = analyzeUrl("https://paypal.example.net/login");
  assert.ok(result.findings.some((finding) => finding.code === "brand-in-subdomain"));
});

test("flags IP hosts, punycode, encoded delimiters and unusual ports", () => {
  assert.ok(analyzeUrl("http://192.0.2.10/login").findings.some((f) => f.code === "ip-host"));
  assert.ok(analyzeUrl("https://xn--pple-43d.com").findings.some((f) => f.code === "punycode"));
  assert.ok(analyzeUrl("https://example.com/%2Fadmin").findings.some((f) => f.code === "encoded-structure"));
  assert.ok(analyzeUrl("https://example.com:8443").findings.some((f) => f.code === "unusual-port"));
});

test("returns a safe validation result for malformed and unsupported input", () => {
  assert.equal(analyzeUrl("http://[broken").isValid, false);
  assert.equal(analyzeUrl("javascript:alert(1)").isValid, false);
  assert.equal(analyzeUrl("").isValid, false);
});

test("extracts unique HTTP(S) links from email text", () => {
  assert.deepEqual(
    extractUrls("Visit https://example.com/a. Then https://example.com/a."),
    ["https://example.com/a"]
  );
});
