// tests/transform.test.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';

import c_indi_i1 from "./data/gedcom_indi_i1.json" assert {type: 'json'};

test('gedcom json to person I1', () => {

  assert.ok(c_indi_i1);

  assert.is(c_indi_i1.type, 'INDI');
  assert.is(c_indi_i1.data.xref_id, '@I1@');

});


test.run();
