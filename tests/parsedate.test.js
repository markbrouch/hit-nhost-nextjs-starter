// tests/transform.test.js
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { parseGedcomDate } from '../dist/lib/utils.js';

test('parse date abt x BC', async () => {

    const dateString = 'ABT 0208 BC';

    const date = parseGedcomDate(dateString);
    console.log("date ", date);

    assert.ok(date);
    assert.is(date.toISOString(), '-000208-01-01T00:00:00.000Z');
});

test('parse date year only', async () => {

    const dateString = '1949';

    const date = parseGedcomDate(dateString);
    console.log("date ", date);

    assert.ok(date);
    assert.is(date.toISOString(), '1949-01-01T00:00:00.000Z');
});

test('parse date 3 parter', async () => {

    const dateString = '11 Oct 1944';

    const date = parseGedcomDate(dateString);
    console.log("date ", date);

    assert.ok(date);
    assert.is(date.toISOString(), '1944-10-11T09:30:00.000Z');
});

test.run();
