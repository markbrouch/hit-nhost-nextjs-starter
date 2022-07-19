
console.log("gedcomloader");

console.log(`npm run queue`);

const RECORD_LIMIT = parseInt(process.env.RECORD_LIMIT || '999999999');
if(RECORD_LIMIT) {
  console.log(`RECORD_LIMIT: ${RECORD_LIMIT}`);
}

// mutation mode
const mutationMode = process.env.MUTATION_MODE || '';

import * as Fs from "fs";
import { parse, compact } from 'parse-gedcom';
import { transform } from "./lib/astadapter.js";
import { get_mookuauhau_queueload_list, set_mookuauhau_loadstatus } from "./lib/mutations/graphql-mutations.js";
import fetch from 'node-fetch';
import { nhost, NHOST_BACKEND_URL } from "./lib/nhost.js";

const downloadFile = (async (url: string, path: string) => {
  const res = await fetch(url);
  const fileStream = Fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
      res?.body?.pipe(fileStream);
      res?.body?.on("error", reject);
      fileStream.on("finish", resolve);
    });
});

(async () => {

    // pull queue to process from graphql endpoint
    const [ role, token ] = ['admin', '']; // dummy
    const mqueue = await get_mookuauhau_queueload_list(role, token);
    console.log("mqueue: ", mqueue);

    // pull one input file to process from graphql endpoint
    // and storage endpoint
    if(mqueue?.mookuauhau && mqueue.mookuauhau.length > 0) {
      // pop one off
      const mitem = mqueue.mookuauhau[0];
      const filename = mitem.filename;
      const file_id = mitem.file_id;

      // const publicFileUrl = await nhost.storage.getPublicUrl({
      //   fileId: file_id,
      // });
      const publicFileUrl = `${NHOST_BACKEND_URL}/v1/storage/files/${file_id}`;
      console.log("publicFileUrl: ", publicFileUrl);

      // const { presignedUrl, error } = await nhost.storage.getPresignedUrl({
      //   fileId: file_id
      // });
      // if (error) {
      //   throw error
      // }
      // console.log('url: ', presignedUrl.url)
      // console.log('expiration: ', presignedUrl.expiration)

      // save local
      const tmpgedcomfile = `/tmp/${filename}`;
      await downloadFile(publicFileUrl, tmpgedcomfile);
      console.log(`saved ${tmpgedcomfile}`);

      //  parse gedcom file to json

      // load json, transform, and load to graphql endpoint
      await set_mookuauhau_loadstatus(mitem.mookuauhau_id, 'loading', role, token);

      console.log(`readFileSync ${tmpgedcomfile}`);
      const inputStr = Fs.readFileSync(tmpgedcomfile, "utf8");

      console.log(`parse`);
      const ast = parse(inputStr);
      const compacted = compact(ast);

      console.log(`process`);
      await transform(ast, mutationMode, RECORD_LIMIT, filename, mitem.mookuauhau_id);

      await set_mookuauhau_loadstatus(mitem.mookuauhau_id, 'done', role, token);

    }
    else {
      console.log("mqueue.mookuauhau empty");
    }
    

})();

