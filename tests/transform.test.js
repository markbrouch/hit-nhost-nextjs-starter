// tests/transform.test.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';

import g_indi_i1 from "./data/gedcom_ast_indi_i1.json" assert {type: 'json'};
import c_indi_i1 from "./data/compact_indi_i1.json" assert {type: 'json'};

test('gedcom json to person I1', () => {
  assert.ok(g_indi_i1);
  assert.is(g_indi_i1.type, 'INDI');
  assert.is(g_indi_i1.data.xref_id, '@I1@');
  assert.is(g_indi_i1.children.find(x => x.type === 'NAME').value, "/Kumuhonua (Kumuhonua-a-Palipalihia)/");
});

test('compact json to person I1', () => {
  assert.ok(c_indi_i1);
  assert.is(c_indi_i1.type, 'INDI');
  assert.is(c_indi_i1.data.xref_id, '@I1@');
  assert.is(c_indi_i1.data.NAME, "/Kumuhonua (Kumuhonua-a-Palipalihia)/");
});


test.run();
