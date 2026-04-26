// Smoke test: render a handful of icons and the user's example.
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import {
  UiUpload,
  UiUploadFilled,
  UiCheck,
  UiClass,
  UiSqlTable,
  UiArray,
  UiPackage,
  UiSqlForeignKey,
} from "../dist/index.mjs";

const rows = [
  ["UiUpload", UiUpload],
  ["UiUploadFilled", UiUploadFilled],
  ["UiCheck", UiCheck],
  ["UiClass", UiClass],
  ["UiSqlTable", UiSqlTable],
  ["UiArray", UiArray],
  ["UiPackage", UiPackage],
  ["UiSqlForeignKey", UiSqlForeignKey],
];
for (const [name, Comp] of rows) {
  const html = renderToStaticMarkup(createElement(Comp, { size: 24, title: name, className: "text-blue-500" }));
  console.log(`${name.padEnd(22)} ${html.length.toString().padStart(4)} bytes  ${html.slice(0, 70)}…`);
}
