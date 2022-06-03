
console.log("gedcomloader");

let inputfile = process.argv[2] || '';
let outputfile = process.argv[3] || '';

console.log(`npm run load '${inputfile}'`);

import * as Fs from "fs";
import { toD3Force, parse, toDot } from 'parse-gedcom';
import { transform } from "./lib/adapter.js";

const EXTENSION_TO_TYPE = {
  ".json": "json",
  ".d3.json": "force",
  ".dot": "dot",
};
type ExtKey = keyof typeof EXTENSION_TO_TYPE;

(async () => {
  const infile = inputfile || '';
  const outfile = outputfile || '';
  const inputStr = Fs.readFileSync(infile, "utf8");

  const parsed = parse(inputStr);

  let type = "json";

  let output: string = "";

  switch (type) {
    case "json": {
      output = JSON.stringify(parsed, null, 2);
      break;
    }
  }

  if (outfile) {
    Fs.writeFileSync(outfile, output, "utf8");
  } else {
    // process.stdout.write(output);

    transform(parsed);

  }
})();
