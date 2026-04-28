// Smoke-test the new composite icons.
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import {
  UiDatabase,
  UiDatabasePlus,
  UiDatabaseMinus,
  UiDatabaseCheck,
  UiDatabaseCross,
  UiDatabaseTrash,
  UiDatabasePending,
  UiUser,
  UiUserPlus,
  UiUserMinus,
  UiUserCheck,
  UiShield,
  UiShieldPlus,
  UiShieldMinus,
  UiShieldCross,
  UiShieldPending,
} from "../dist/index.mjs";

const rows = [
  ["UiDatabase", UiDatabase],
  ["UiDatabasePlus", UiDatabasePlus],
  ["UiDatabaseMinus", UiDatabaseMinus],
  ["UiDatabaseCheck", UiDatabaseCheck],
  ["UiDatabaseCross", UiDatabaseCross],
  ["UiDatabaseTrash", UiDatabaseTrash],
  ["UiDatabasePending", UiDatabasePending],
  ["UiUser", UiUser],
  ["UiUserPlus", UiUserPlus],
  ["UiUserMinus", UiUserMinus],
  ["UiUserCheck", UiUserCheck],
  ["UiShield", UiShield],
  ["UiShieldPlus", UiShieldPlus],
  ["UiShieldMinus", UiShieldMinus],
  ["UiShieldCross", UiShieldCross],
  ["UiShieldPending", UiShieldPending],
];
for (const [name, Comp] of rows) {
  const html = renderToStaticMarkup(createElement(Comp, { size: 32, title: name }));
  // Confirm the marker overlay exists for composites.
  const hasMarker = name === "UiDatabase" || name === "UiUser" || name === "UiShield"
    ? true // base icons have no marker
    : html.includes("<g transform=");
  console.log(`${name.padEnd(22)} ${html.length.toString().padStart(4)} bytes  marker=${hasMarker ? "✓" : "✗"}`);
}
