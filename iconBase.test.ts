import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isWideViewBox, WIDE_THRESHOLD, GenIcon } from "./iconBase";

describe("isWideViewBox", () => {
  it("returns false for undefined or empty", () => {
    assert.equal(isWideViewBox(undefined), false);
    assert.equal(isWideViewBox(""), false);
  });

  it("returns false for malformed viewBox", () => {
    assert.equal(isWideViewBox("0 0 100"), false);
    assert.equal(isWideViewBox("not a viewbox"), false);
  });

  it("returns false for square viewBox", () => {
    assert.equal(isWideViewBox("0 0 32 32"), false);
    assert.equal(isWideViewBox("0 0 24 24"), false);
  });

  it("returns false for tall narrow viewBox (e.g. minio)", () => {
    assert.equal(isWideViewBox("0 0 16.661394 32"), false);
  });

  it("returns false for slightly-wide viewBox below threshold (e.g. gitea, mariadb)", () => {
    assert.equal(isWideViewBox("0 0 51.948777 32"), false); // 1.62
    assert.equal(isWideViewBox("0 0 48.148109 32"), false); // 1.50
  });

  it("returns true for wide word-mark logos at or above threshold", () => {
    assert.equal(isWideViewBox("0 0 148.128998 32"), true); // mission-control-logo, 4.63
    assert.equal(isWideViewBox("0 0 149.003647 32"), true); // claude_logo, 4.66
    assert.equal(isWideViewBox("0 0 96.5 32"), true); // kong, 3.02
    assert.equal(isWideViewBox("0 0 85.33333 32"), true); // velero, 2.67
    assert.equal(isWideViewBox("0 0 80.929994 32"), true); // keda-logo, 2.53
  });

  it("treats ratio exactly equal to WIDE_THRESHOLD as wide", () => {
    assert.equal(WIDE_THRESHOLD, 2.0);
    assert.equal(isWideViewBox("0 0 64 32"), true);
  });

  it("rejects zero or negative height", () => {
    assert.equal(isWideViewBox("0 0 100 0"), false);
    assert.equal(isWideViewBox("0 0 100 -1"), false);
  });

  it("accepts comma-separated viewBox values", () => {
    assert.equal(isWideViewBox("0,0,148.128998,32"), true);
  });
});

describe("GenIcon viewBox tagging", () => {
  it("exposes viewBox on the returned component for wide-detection", () => {
    const Wide = GenIcon({
      tag: "svg",
      attr: { viewBox: "0 0 148.128998 32" },
      child: [],
    });
    assert.equal(Wide.viewBox, "0 0 148.128998 32");
  });

  it("exposes viewBox for square icons", () => {
    const Square = GenIcon({
      tag: "svg",
      attr: { viewBox: "0 0 32 32" },
      child: [],
    });
    assert.equal(Square.viewBox, "0 0 32 32");
  });
});
