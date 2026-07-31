import { parseCommand } from "./commandParser.js";

const cases = [
  ["/start", "start"], ["/link 123", "link"], ["/done 3", "done"],
  ["/DONE 3", "done"], ["/nonsense", null], ["hello", null],
  ["/next", "next"], ["/remind", "remind"]
];
let allPass = true;
cases.forEach(([input, expectedCmd]) => {
  const r = parseCommand(input);
  const pass = expectedCmd === null ? (r.type !== "command") : (r.command === expectedCmd);
  if (!pass) allPass = false;
  console.log(pass ? "PASS" : "FAIL", input, "->", JSON.stringify(r));
});
console.log(allPass ? "ALL PASS" : "SOME FAILED");
