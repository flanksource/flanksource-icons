import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  processIconNameSearch,
  areTwoIconNamesEqual,
  findIconName,
  findByName,
  resolveColor,
  findIcon,
  colorClassMap,
} from "./iconResolver";

const fakeSvg = ((name: string) => () => name) as any;

const mockIconMap: Record<string, any> = {
  "aws-ec2": fakeSvg("aws-ec2"),
  "aws-s3": fakeSvg("aws-s3"),
  k8s: fakeSvg("k8s"),
  "k8s-node": fakeSvg("k8s-node"),
  "k8s-pod": fakeSvg("k8s-pod"),
  check: fakeSvg("check"),
  plus: fakeSvg("plus"),
  trash: fakeSvg("trash"),
  "broken-heart": fakeSvg("broken-heart"),
  hourglass: fakeSvg("hourglass"),
  reload: fakeSvg("reload"),
  error: fakeSvg("error"),
  prometheus: fakeSvg("prometheus"),
  "mission-control": fakeSvg("mission-control"),
  settings: fakeSvg("settings"),
  stop: fakeSvg("stop"),
  console: fakeSvg("console"),
  heart: fakeSvg("heart"),
  "cert-manager": fakeSvg("cert-manager"),
  "azure-vm": fakeSvg("azure-vm"),
};

describe("processIconNameSearch", () => {
  it("normalizes double dashes", () => {
    assert.equal(processIconNameSearch("aws--ec2"), "aws-ec2");
  });
  it("normalizes double colons to dash and kubernetes- to k8s-", () => {
    assert.equal(processIconNameSearch("Kubernetes::Namespace"), "k8s-namespace");
  });
  it("lowercases", () => {
    assert.equal(processIconNameSearch("AWS-EC2"), "aws-ec2");
  });
  it("normalizes k8- to k8s-", () => {
    assert.equal(processIconNameSearch("k8-pod"), "k8s-pod");
  });
  it("normalizes kubernetes- to k8s-", () => {
    assert.equal(processIconNameSearch("kubernetes-node"), "k8s-node");
  });
});

describe("findIconName", () => {
  it("returns undefined for empty name", () => {
    assert.equal(findIconName("", mockIconMap), undefined);
    assert.equal(findIconName(undefined, mockIconMap), undefined);
  });
  it("finds direct match in iconMap", () => {
    assert.equal(findIconName("aws-ec2", mockIconMap), mockIconMap["aws-ec2"]);
  });
  it("resolves alias", () => {
    // "kubernetes" alias -> "k8s"
    assert.equal(findIconName("kubernetes", mockIconMap), mockIconMap["k8s"]);
  });
  it("matches by prefix pattern", () => {
    // "delete" prefix -> "trash"
    assert.equal(findIconName("deletesomething", mockIconMap), mockIconMap["trash"]);
  });
  it("matches by suffix pattern", () => {
    // "failed" suffix -> "error"
    assert.equal(findIconName("somethingfailed", mockIconMap), mockIconMap["error"]);
  });
});

describe("findByName", () => {
  it("returns undefined for empty", () => {
    assert.equal(findByName(undefined, mockIconMap), undefined);
    assert.equal(findByName("", mockIconMap), undefined);
  });
  it("finds direct match after normalization", () => {
    assert.equal(findByName("AWS-EC2", mockIconMap), mockIconMap["aws-ec2"]);
  });
  it("finds k8s icon with kubernetes- prefix", () => {
    assert.equal(findByName("kubernetes-node", mockIconMap), mockIconMap["k8s-node"]);
  });
  it("strips k8s- prefix to find match", () => {
    assert.equal(findByName("k8s-pod", mockIconMap), mockIconMap["k8s-pod"]);
  });
  it("tries aws- prefix", () => {
    assert.equal(findByName("ec2", mockIconMap), mockIconMap["aws-ec2"]);
  });
  it("resolves alias through normalization", () => {
    // "k8s-certificate" alias -> "cert-manager"
    assert.equal(findByName("k8s-certificate", mockIconMap), mockIconMap["cert-manager"]);
  });
});

describe("areTwoIconNamesEqual", () => {
  it("returns false for undefined inputs", () => {
    assert.equal(areTwoIconNamesEqual(undefined, "test"), false);
    assert.equal(areTwoIconNamesEqual("test", undefined), false);
  });
  it("matches identical names", () => {
    assert.equal(areTwoIconNamesEqual("aws-ec2", "aws-ec2"), true);
  });
  it("matches case-insensitive", () => {
    assert.equal(areTwoIconNamesEqual("AWS-EC2", "aws-ec2"), true);
  });
  it("matches k8s vs kubernetes prefix", () => {
    assert.equal(areTwoIconNamesEqual("k8s-node", "kubernetes-node"), true);
  });
  it("matches with k8s- stripped", () => {
    assert.equal(areTwoIconNamesEqual("k8s-prometheus", "prometheus"), true);
  });
  it("matches through shared alias", () => {
    assert.equal(areTwoIconNamesEqual("healthy", "isup"), true);
  });
});

describe("resolveColor", () => {
  it("returns undefined for no color", () => {
    assert.equal(resolveColor(undefined), undefined);
  });
  it("maps semantic name to className", () => {
    assert.deepEqual(resolveColor("error"), { className: "fill-red-500" });
    assert.deepEqual(resolveColor("success"), { className: "fill-green-500" });
  });
  it("passes arbitrary CSS color as style", () => {
    assert.deepEqual(resolveColor("#ff0000"), { style: { color: "#ff0000" } });
    assert.deepEqual(resolveColor("rgb(255,0,0)"), { style: { color: "rgb(255,0,0)" } });
    assert.deepEqual(resolveColor("purple"), { style: { color: "purple" } });
  });
});

describe("findIcon", () => {
  it("returns undefined for empty name and secondary", () => {
    assert.equal(findIcon("", "", mockIconMap), undefined);
  });
  it("finds icon by name", () => {
    const result = findIcon("aws-ec2", "", mockIconMap);
    assert.equal(result?.SVG, mockIconMap["aws-ec2"]);
  });
  it("falls back to secondary", () => {
    const result = findIcon("nonexistent", "aws-s3", mockIconMap);
    assert.equal(result?.SVG, mockIconMap["aws-s3"]);
  });
  it("returns undefined for URL", () => {
    assert.equal(findIcon("https://example.com/icon.svg", "", mockIconMap), undefined);
  });
  it("handles iconWithColor", () => {
    const result = findIcon("", "", mockIconMap, "aws-ec2:error");
    assert.equal(result?.SVG, mockIconMap["aws-ec2"]);
    assert.equal(result?.color, colorClassMap["error"]);
  });
  it("caches results", () => {
    const r1 = findIcon("aws-ec2", "", mockIconMap);
    const r2 = findIcon("aws-ec2", "", mockIconMap);
    assert.equal(r1, r2);
  });
});
