// tests/transform.test.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { parse } from 'parse-gedcom';

test('gedcom json to person I1', async () => {
  const g_indi_i1 = await import("./data/gedcom_ast_indi_i1.json", { assert: { type: "json" } }).then((module) => module.default);

  assert.ok(g_indi_i1);

  assert.ok(g_indi_i1);
  assert.is(g_indi_i1.type, 'root');

  const i_child = g_indi_i1.children.find(x => x.type === 'INDI');

  assert.is(i_child.type, 'INDI');
  assert.is(i_child.data.xref_id, '@I1@');
  assert.is(i_child.children.find(x => x.type === 'NAME').value, "/Kumuhonua (Kumuhonua-a-Palipalihia)/");
});

test('parse() ast straight json to person I1', async () => {
  const g_indi_i1 = await import("./data/gedcom_ast_indi_i1.json", { assert: { type: "json" } }).then((module) => module.default);
  assert.ok(g_indi_i1);
  assert.is(g_indi_i1.type, 'root');

  const i_child = g_indi_i1.children.find(x => x.type === 'INDI' && x.data.xref_id === '@I1@');

  assert.is(i_child?.type, 'INDI');
  assert.is(i_child?.data?.xref_id, '@I1@');
  assert.is(i_child?.children.find(x => x.type === 'NAME')?.value, "/Kumuhonua (Kumuhonua-a-Palipalihia)/");

});

test('parse() ast straight json to person P4', async () => {
  const g_indi_i1 = await import("./data/gedcom_ast_indi_i1.json", { assert: { type: "json" } }).then((module) => module.default);
  assert.ok(g_indi_i1);
  assert.is(g_indi_i1.type, 'root');

  const i_child = g_indi_i1.children.find(x => x.type === 'INDI' && x.data.xref_id === '@P4@');
  console.log(i_child);
  assert.ok(i_child);
  assert.is(i_child?.type, 'INDI');
  assert.is(i_child?.data?.xref_id, '@P4@');
  const name = i_child?.children.find(x => x.type === 'NAME');
  console.log(name);
  assert.is(i_child?.children.find(x => x.type === 'NAME')?.value, "Raul N /Goodness/");

});


test.run();
