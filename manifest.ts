import path from "path";
import camelcase from "camelcase";
import { type IconDefinition } from "../../scripts/_types";
import { glob } from "../../scripts/glob";

console.log(__dirname)
export const icons: IconDefinition[] = [
  {
    id: "mi",
    name: "Mission Control Icons",
    contents: [
      {
        files: path.resolve(__dirname, "../../../../../svg/*.svg"),
        formatter: (name) => `${name}`.replace(/_/g, "").replace(/&/g, "And"),
        multiColor: true,
      },
    ],
    source: {
      type: "git",
      localName: "Mission-Control",
      remoteDir: "/",
      url: "../../../.git",
      branch: "main",
      hash: 'main'
    },
  }
];
