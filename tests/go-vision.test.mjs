import test from 'node:test';import assert from 'node:assert/strict';import {goVision} from '../lib/go-vision.mjs';
test('visual Go sends image payloads and rejects failure without paid fallback',async()=>{
 let body;const r=await goVision({goKey:'test'},[{text:'judge'},{inlineData:{mimeType:'image/png',data:'AA=='}}],{fetchImpl:async(u,o)=>{body=JSON.parse(o.body);return {ok:true,json:async()=>({choices:[{message:{content:'{"verdicts":[]}'}}],usage:{prompt_tokens:23,completion_tokens:8}})}}});assert.equal(body.messages[0].content[1].type,'image_url');assert.equal(r.usage.promptTokenCount,23);await assert.rejects(goVision({goKey:'test'},[],{fetchImpl:async()=>({ok:false,status:429})}),/429/);
});
