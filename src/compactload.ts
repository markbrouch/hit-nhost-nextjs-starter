
console.log("gedcomloader");

let inputfile = process.argv[2] || '';
let outputfile = process.argv[3] || '';

console.log(`npm run load '${inputfile}'`);

const RECORD_LIMIT = parseInt(process.env.RECORD_LIMIT || '999999999');
if(RECORD_LIMIT) {
  console.log(`RECORD_LIMIT: ${RECORD_LIMIT}`);
}

// console.log(`process.env.INSERT_MODE: '${process.env.INSERT_MODE}'`);
const insertMode = process.env.INSERT_MODE === 'true' ? true : false;

import * as Fs from "fs";
import { toD3Force, parse, toDot, compact } from 'parse-gedcom';
import { transform } from "./lib/astadapter.js";

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
  const compacted = compact(parsed);

  let type = "json";

  let output: string = "";

  switch (type) {
    case "json": {
      output = JSON.stringify(compacted, null, 2);
      break;
    }
  }

  if (outfile) {
    Fs.writeFileSync(outfile, output, "utf8");
  } else {
    // process.stdout.write(output);
    
    transform(parsed, insertMode, RECORD_LIMIT);

  }
})();
