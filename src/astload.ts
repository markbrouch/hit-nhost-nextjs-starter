
console.log("gedcomloader");

let inputfile = process.argv[2] || '';
let outputfile = process.argv[3] || '';

console.log(`npm run load '${inputfile}'`);

const RECORD_LIMIT = parseInt(process.env.RECORD_LIMIT || '999999999');
if(RECORD_LIMIT) {
  console.log(`RECORD_LIMIT: ${RECORD_LIMIT}`);
}

const insertMode = process.env.INSERT_MODE ? true : false;

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

  // mutation mode
  const mutationMode = process.env.MUTATION_MODE === 'graphql' ? 'graphql' : 'neo4j';

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

    transform(parsed, mutationMode, insertMode, RECORD_LIMIT);

  }
})();
