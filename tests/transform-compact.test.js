// tests/transform.test.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { compact, parse } from 'parse-gedcom';
import { mutation_fns } from "../dist/lib/mutations/mock-mutations.js";
import { itemToPerson } from "../dist/lib/astadapter.js";

test('compact json to person I1', async () => {
  const c_indi_i1 = await import("./data/compact_indi_i1.json", { assert: { type: "json" } }).then((module) => module.default);

  assert.ok(c_indi_i1);
  assert.is(c_indi_i1.type, 'root');

  const i_child = c_indi_i1.children.find(x => x.type === 'INDI');

  assert.is(i_child.type, 'INDI');
  assert.is(i_child.data.xref_id, '@I1@');
  assert.is(i_child.data.NAME, "/Kumuhonua (Kumuhonua-a-Palipalihia)/");
});

test('parse() ast to compact json to person I1', async () => {
  const g_indi_i1 = await import("./data/gedcom_ast_indi_i1.json", { assert: { type: "json" } }).then((module) => module.default);
  // const ast = parse(JSON.stringify(g_indi_i1));
  // this turns parsed the AST / tree into a more compact version
  const compacted = compact(g_indi_i1);

  assert.ok(compacted);
  assert.is(compacted.type, 'root');

  const i_child = compacted.children.find(x => x.type === 'INDI');

  assert.is(i_child.type, 'INDI');
  assert.is(i_child.data.xref_id, '@I1@');
  assert.is(i_child.data.NAME, "/Kumuhonua (Kumuhonua-a-Palipalihia)/");

});

test('parse() ast to compact json via transform() to person I1', async () => {
  const g_indi_i1 = await import("./data/gedcom_ast_indi_i1.json", { assert: { type: "json" } }).then((module) => module.default);

  // const ast = parse(JSON.stringify(g_indi_i1));
  // this turns parsed the AST / tree into a more compact version
  const compacted = compact(g_indi_i1);

  assert.ok(compacted);
  assert.is(compacted.type, 'root');

  console.log("compacted: ", compacted);

  const i_child = compacted.children.find(x => x.type === 'INDI' && x.data.xref_id === '@I1@');

  assert.is(i_child.type, 'INDI');
  assert.is(i_child.data.xref_id, '@I1@');
  assert.is(i_child.data.NAME, "/Kumuhonua (Kumuhonua-a-Palipalihia)/");

  const person = itemToPerson(i_child);
  assert.ok(person);
  assert.is(person.name, "/Kumuhonua (Kumuhonua-a-Palipalihia)/");
});

// test('parse() ast to compact json via transform() to person P4', async () => {
//   const g_indi_i1 = await import("./data/gedcom_ast_indi_i1.json", { assert: { type: "json" } }).then((module) => module.default);

//   // pre-compact check
//   const pre_child = g_indi_i1.children.find(x => x.type === 'INDI' && x.data.xref_id === '@P4@');
//   console.log("pre_child: ", pre_child);

//   // const ast = parse(JSON.stringify(g_indi_i1));
//   // this turns parsed the AST / tree into a more compact version
//   const compacted = compact(g_indi_i1);

//   assert.ok(compacted);
//   assert.is(compacted.type, 'root');
//   console.log("compacted: ", compacted);

//   compacted.children.forEach(el => {
//     console.log("el.data: ", el.data);
//   });

//   const i_child = compacted.children.find(x => x.type === 'INDI' && x.data.xref_id === '@P4@');

//   console.log("i_child: ", i_child);

//   assert.is(i_child.type, 'INDI');
//   assert.is(i_child.data.xref_id, '@P4@');
//   assert.is(i_child.data.NAME, "Raul N /Goodness/");

//   const person = itemToPerson(i_child);
//   console.log("person: ", person);

//   assert.ok(person);
//   assert.is(person.name, "Raul N /Goodness/");
// });

test.run();
