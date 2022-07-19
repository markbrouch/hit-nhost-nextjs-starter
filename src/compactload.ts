
console.log("gedcomloader");

let inputfile = process.argv[2] || '';
let outputfile = process.argv[3] || '';

console.log(`npm run load '${inputfile}'`);

const RECORD_LIMIT = parseInt(process.env.RECORD_LIMIT || '999999999');
if(RECORD_LIMIT) {
  console.log(`RECORD_LIMIT: ${RECORD_LIMIT}`);
}

// mutation mode
// const mutationMode = process.env.MUTATION_MODE === 'graphql' ? 'graphql' : 'neo4j';
const mutationMode = process.env.MUTATION_MODE || '';

import * as Fs from "fs";
import { parse, compact } from 'parse-gedcom';
import { transform } from "./lib/astadapter.js";

(async () => {
  const infile = inputfile || '';
  const outfile = outputfile || '';
  const inputStr = Fs.readFileSync(infile, "utf8");

  const parsed = parse(inputStr);
  const compacted = compact(parsed);

  let output: string = "";
  output = JSON.stringify(compacted, null, 2);

  if (outfile) {
    Fs.writeFileSync(outfile, output, "utf8");
  } else {
    // process.stdout.write(output);
    
    transform(parsed, mutationMode, RECORD_LIMIT, infile, undefined);

  }
})();
