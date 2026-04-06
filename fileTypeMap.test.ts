import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveFileTypeIcon } from "./fileTypeMap";

describe("resolveFileTypeIcon", () => {
  describe("extension resolution", () => {
    const cases: [string, string][] = [
      ["main.go", "go"],
      ["app.py", "python"],
      ["lib.rs", "rust"],
      ["App.java", "java"],
      ["main.kt", "kotlin"],
      ["hello.scala", "scala"],
      ["main.swift", "swift"],
      ["main.c", "c"],
      ["main.cpp", "cpp"],
      ["Program.cs", "csharp"],
      ["script.pl", "perl"],
      ["init.lua", "lua"],
      ["analysis.r", "r"],
      ["Main.hs", "haskell"],
      ["main.dart", "dart"],
      ["app.ex", "elixir"],
      ["server.erl", "erlang"],
      ["index.ts", "ts"],
      ["index.tsx", "ts"],
      ["app.js", "js"],
      ["app.jsx", "js"],
      ["config.yaml", "yaml"],
      ["config.yml", "yaml"],
      ["data.json", "json"],
      ["config.toml", "toml"],
      ["settings.ini", "ini"],
      ["main.tf", "terraform"],
      ["vars.tfvars", "terraform"],
      ["index.html", "html"],
      ["style.css", "css"],
      ["style.scss", "css"],
      ["App.vue", "vue"],
      ["App.svelte", "svelte"],
      ["query.sql", "sql"],
      ["data.csv", "csv"],
      ["schema.proto", "protobuf"],
      ["schema.graphql", "graphql"],
      ["README.md", "markdown"],
      ["report.pdf", "pdf"],
      ["doc.docx", "docx"],
      ["data.xlsx", "xlsx"],
      ["notes.txt", "txt"],
      ["output.log", "log"],
      ["deploy.sh", "shell"],
      ["script.ps1", "powershell"],
      ["archive.zip", "zip"],
      ["backup.tar", "gz"],
      ["package.deb", "deb"],
      ["app.jar", "jar"],
      ["photo.png", "png"],
      ["photo.jpg", "png"],
      ["icon.gif", "gif"],
      ["cert.pem", "pem"],
      ["ca.crt", "certificate"],
      ["changes.diff", "diff"],
      ["yarn.lock", "lock"],
      ["site.xml", "xml"],
    ];

    for (const [input, expected] of cases) {
      it(`"${input}" -> "${expected}"`, () => {
        assert.equal(resolveFileTypeIcon(input), expected);
      });
    }
  });

  describe("special filenames", () => {
    const cases: [string, string][] = [
      ["Dockerfile", "docker"],
      ["dockerfile", "docker"],
      ["DOCKERFILE", "docker"],
      ["docker-compose.yml", "docker"],
      ["docker-compose.yaml", "docker"],
      ["Makefile", "makefile-icon"],
      ["makefile", "makefile-icon"],
      ["CMakeLists.txt", "cmake"],
      ["Jenkinsfile", "jenkins"],
      ["Vagrantfile", "vagrant"],
      ["Cargo.toml", "rust"],
      ["go.mod", "go"],
      ["go.sum", "go"],
      ["Gemfile", "ruby"],
      ["helmfile.yaml", "helm"],
      ["Chart.yaml", "helm"],
      ["values.yaml", "helm"],
      ["kustomization.yaml", "kustomize"],
      [".gitignore", "git"],
      [".dockerignore", "docker"],
      [".env", "dotenv"],
      [".env.local", "dotenv"],
      [".env.production", "dotenv"],
      ["LICENSE", "certificate"],
      ["pom.xml", "maven"],
      ["nginx.conf", "nginx"],
    ];

    for (const [input, expected] of cases) {
      it(`"${input}" -> "${expected}"`, () => {
        assert.equal(resolveFileTypeIcon(input), expected);
      });
    }
  });

  describe("path stripping", () => {
    it("strips directory path", () => {
      assert.equal(resolveFileTypeIcon("src/lib/config.yaml"), "yaml");
    });
    it("strips nested path for special file", () => {
      assert.equal(resolveFileTypeIcon("deploy/Dockerfile"), "docker");
    });
  });

  describe("fallback", () => {
    it("returns default-file for unknown extension", () => {
      assert.equal(resolveFileTypeIcon("data.xyz"), "default-file");
    });
    it("returns default-file for empty string", () => {
      assert.equal(resolveFileTypeIcon(""), "default-file");
    });
    it("returns default-file for extensionless file", () => {
      assert.equal(resolveFileTypeIcon("README"), "default-file");
    });
  });
});
