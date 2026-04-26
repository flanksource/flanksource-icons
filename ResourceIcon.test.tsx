import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { ResourceIcon } from "./ResourceIcon";
import { iconifyLogos, iconifyDevicon } from "./iconifyAllowlist";
import type { IconType } from "./iconBase";

const fakeSvg = (label: string): IconType =>
  (() => React.createElement("svg", { "data-icon": label })) as IconType;

const bundled: Record<string, IconType> = {
  "k8s-pod": fakeSvg("k8s-pod"),
  "aws-ec2": fakeSvg("aws-ec2"),
};

type RenderResult = ReturnType<typeof ResourceIcon>;

function render(props: Parameters<typeof ResourceIcon>[0]): RenderResult {
  return ResourceIcon({ iconMap: bundled, ...props });
}

function isFunctionComponent(el: RenderResult): el is React.ReactElement {
  return !!el && typeof el === "object" && "type" in el;
}

describe("ResourceIcon — bundled lookup", () => {
  it("renders bundled SVG when primary hits the map", () => {
    const el = render({ primary: "Kubernetes::Pod" });
    assert.ok(isFunctionComponent(el));
    // The bundled icon is rendered as a React component instance whose `type`
    // is the IconType function returned by findByName.
    assert.equal(typeof (el as React.ReactElement).type, "function");
  });

  it("falls back to secondary when primary misses bundled", () => {
    const el = render({ primary: "no-such-thing", secondary: "aws-ec2" });
    assert.ok(isFunctionComponent(el));
    assert.equal(typeof (el as React.ReactElement).type, "function");
  });

  it("renders <img> for http(s) primary", () => {
    const el = render({ primary: "https://example.com/foo.png" });
    assert.ok(isFunctionComponent(el));
    assert.equal((el as React.ReactElement).type, "img");
    assert.equal(
      (el as React.ReactElement).props.src,
      "https://example.com/foo.png",
    );
  });
});

describe("ResourceIcon — iconify fallback", () => {
  it("falls back to logos when slug is in the logos allowlist", () => {
    // Sanity-check the fixture before relying on it.
    assert.ok(iconifyLogos.has("postgresql"));
    const el = render({ primary: "postgresql" });
    assert.ok(isFunctionComponent(el));
    assert.equal((el as React.ReactElement).type, IconifyIcon);
    assert.equal(
      (el as React.ReactElement).props.icon,
      "logos:postgresql",
    );
  });

  it("uses devicon when logos misses but devicon has the slug", () => {
    // 'aarch64' exists in devicon but not in logos (verified at fixture time).
    assert.equal(iconifyLogos.has("aarch64"), false);
    assert.ok(iconifyDevicon.has("aarch64"));
    const el = render({ primary: "aarch64" });
    assert.ok(isFunctionComponent(el));
    assert.equal((el as React.ReactElement).type, IconifyIcon);
    assert.equal((el as React.ReactElement).props.icon, "devicon:aarch64");
  });

  it("normalizes :: and case before allowlist check", () => {
    const el = render({ primary: "LOGOS::Postgresql" });
    // processIconNameSearch turns 'LOGOS::Postgresql' into 'logos-postgresql',
    // which is NOT in either allowlist — confirms we are not stripping prefixes.
    assert.equal(el, null);
  });

  it("returns null when slug is in no allowlist", () => {
    assert.equal(iconifyLogos.has("totally-fake-icon-zzz"), false);
    assert.equal(iconifyDevicon.has("totally-fake-icon-zzz"), false);
    const el = render({ primary: "totally-fake-icon-zzz" });
    assert.equal(el, null);
  });

  it("respects iconifyFallback=false even when the slug is in an allowlist", () => {
    const el = render({ primary: "postgresql", iconifyFallback: false });
    assert.equal(el, null);
  });

  it("respects per-call iconifyCollections override", () => {
    // 'aarch64' is devicon-only; restricting to logos should miss.
    const el = render({ primary: "aarch64", iconifyCollections: ["logos"] });
    assert.equal(el, null);
  });

  it("prefers primary over secondary for iconify fallback", () => {
    const el = render({ primary: "postgresql", secondary: "kubernetes" });
    assert.ok(isFunctionComponent(el));
    assert.equal(
      (el as React.ReactElement).props.icon,
      "logos:postgresql",
    );
  });
});

describe("ResourceIcon — bundled wins over iconify", () => {
  it("does not consult iconify when bundled lookup succeeds", () => {
    // 'aws-ec2' is in our bundled map AND would also be in the logos
    // allowlist as 'aws' after stripping — but we never strip, and we never
    // reach iconify because bundled hit first.
    const el = render({ primary: "aws-ec2" });
    assert.ok(isFunctionComponent(el));
    assert.notEqual((el as React.ReactElement).type, IconifyIcon);
  });
});

describe("ResourceIcon — square / aspect ratio", () => {
  const wideSvg = (() =>
    React.createElement("svg", { "data-icon": "wide" })) as IconType;
  wideSvg.viewBox = "0 0 148.128998 32";

  const squareSvg = (() =>
    React.createElement("svg", { "data-icon": "square" })) as IconType;
  squareSvg.viewBox = "0 0 32 32";

  const wideMap: Record<string, IconType> = {
    "mission-control-logo": wideSvg,
    "aws-ec2": squareSvg,
  };

  it("auto-detects wide viewBox and drops max-w-6 default class", () => {
    const el = ResourceIcon({ iconMap: wideMap, primary: "mission-control-logo" });
    assert.ok(el && typeof el === "object" && "props" in el);
    const cls = (el as React.ReactElement).props.className as string;
    assert.match(cls, /\bh-6\b/);
    assert.doesNotMatch(cls, /max-w-6/);
    assert.equal((el as React.ReactElement).props.square, false);
  });

  it("keeps max-w-6 default for square icons", () => {
    const el = ResourceIcon({ iconMap: wideMap, primary: "aws-ec2" });
    assert.ok(el && typeof el === "object" && "props" in el);
    const cls = (el as React.ReactElement).props.className as string;
    assert.match(cls, /max-w-6/);
    assert.equal((el as React.ReactElement).props.square, true);
  });

  it("respects explicit square=true override on a wide icon", () => {
    const el = ResourceIcon({
      iconMap: wideMap,
      primary: "mission-control-logo",
      square: true,
    });
    assert.ok(el && typeof el === "object" && "props" in el);
    const cls = (el as React.ReactElement).props.className as string;
    assert.match(cls, /max-w-6/);
    assert.equal((el as React.ReactElement).props.square, true);
  });

  it("respects explicit square=false override on a square icon", () => {
    const el = ResourceIcon({
      iconMap: wideMap,
      primary: "aws-ec2",
      square: false,
    });
    assert.ok(el && typeof el === "object" && "props" in el);
    const cls = (el as React.ReactElement).props.className as string;
    assert.doesNotMatch(cls, /max-w-6/);
    assert.equal((el as React.ReactElement).props.square, false);
  });

  it("preserves explicit className regardless of aspect detection", () => {
    const el = ResourceIcon({
      iconMap: wideMap,
      primary: "mission-control-logo",
      className: "custom-class",
    });
    assert.ok(el && typeof el === "object" && "props" in el);
    const cls = (el as React.ReactElement).props.className as string;
    assert.match(cls, /custom-class/);
  });
});
