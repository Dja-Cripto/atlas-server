import test from 'node:test';
import assert from 'node:assert/strict';
import {automaticShorts,renderShortMP4,renderAllShortsMP4} from '../lib/shorts.mjs';

test('shorts module exports automaticShorts, renderShortMP4 and renderAllShortsMP4 functions', () => {
 assert.equal(typeof automaticShorts, 'function');
 assert.equal(typeof renderShortMP4, 'function');
 assert.equal(typeof renderAllShortsMP4, 'function');
});
