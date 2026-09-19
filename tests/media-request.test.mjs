import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mediaRequest} from '../lib/media-request.mjs';
test('rate limits respect Retry-After then return success without real waiting or network',async()=>{
 let calls=0;const waits=[];
 const r=await mediaRequest('https://upload.wikimedia.org/image',{}, {fetch:async()=>++calls===1?new Response('',{status:429,headers:{'Retry-After':'12'}}):new Response('ok'),sleep:async ms=>waits.push(ms)});
 assert.equal(await r.text(),'ok');assert.equal(calls,2);assert.deepEqual(waits,[12000]);
});
test('long cooldown and repeated rate limits stop instead of retrying indefinitely',async()=>{
 let calls=0;const wait=async()=>{};
 await assert.rejects(mediaRequest('https://videos.pexels.com/x',{}, {fetch:async()=>{calls++;return new Response('',{status:429,headers:{'Retry-After':'120'}});},sleep:wait}),/120 segundos/);assert.equal(calls,1);
 calls=0;await assert.rejects(mediaRequest('https://videos.pexels.com/x',{}, {fetch:async()=>{calls++;return new Response('',{status:429});},sleep:wait}),e=>e.code==='MEDIA_TEMPORARY');assert.equal(calls,4);
});
