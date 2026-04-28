import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import {
  UiUsersThree, UiUsersThreePlus, UiUsersThreeMinus, UiUsersThreeCheck, UiUsersThreeCross,
  UiUserCircle, UiUserCirclePlus, UiUserCircleMinus, UiUserCircleCheck,
  UiOrganization, UiOrganizationPlus, UiOrganizationMinus, UiOrganizationCheck, UiOrganizationCross,
} from "../dist/index.mjs";

for (const [name, Comp] of [
  ["UiUsersThree", UiUsersThree],
  ["UiUsersThreePlus", UiUsersThreePlus],
  ["UiUsersThreeMinus", UiUsersThreeMinus],
  ["UiUsersThreeCheck", UiUsersThreeCheck],
  ["UiUsersThreeCross", UiUsersThreeCross],
  ["UiUserCircle", UiUserCircle],
  ["UiUserCirclePlus", UiUserCirclePlus],
  ["UiUserCircleMinus", UiUserCircleMinus],
  ["UiUserCircleCheck", UiUserCircleCheck],
  ["UiOrganization", UiOrganization],
  ["UiOrganizationPlus", UiOrganizationPlus],
  ["UiOrganizationMinus", UiOrganizationMinus],
  ["UiOrganizationCheck", UiOrganizationCheck],
  ["UiOrganizationCross", UiOrganizationCross],
]) {
  const html = renderToStaticMarkup(createElement(Comp, { size: 32, title: name }));
  const hasMarker = html.includes("<g transform=");
  console.log(`${name.padEnd(26)} ${html.length.toString().padStart(4)} bytes  marker=${hasMarker ? "✓" : "—"}`);
}
