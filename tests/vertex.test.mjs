import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,verify} from 'node:crypto';
import {validateServiceAccount,vertexEndpoint,vertexRequest} from '../lib/vertex.mjs';
import {publicSettings,thumbnail} from '../lib/providers.mjs';
test('Vertex signs Google-only credentials, caches tokens, routes generation and hides secrets',async()=>{
 const pair=generateKeyPairSync('rsa',{modulusLength:2048});
 const credentials={type:'service_account',project_id:'test-project',client_email:'worker@test-project.iam.gserviceaccount.com',private_key:pair.privateKey.export({type:'pkcs8',format:'pem'}),token_uri:'https://attacker.invalid'};
 const normalized=validateServiceAccount(JSON.stringify(credentials));assert.equal(normalized.token_uri,undefined);
 const settings={geminiBackend:'vertex',vertexCredentials:JSON.stringify(normalized),vertexProject:'test-project',vertexLocation:'global',imageModel:'gemini-test-image'};
 assert.equal(publicSettings(settings).vertexCredentials,undefined);assert.equal(publicSettings(settings).configured.geminiKey,true);assert.equal(JSON.stringify(publicSettings(settings)).includes('PRIVATE KEY'),false);
 assert.throws(()=>validateServiceAccount('{"type":"authorized_user"}'));
 assert.throws(()=>vertexEndpoint({...settings,vertexLocation:'evil.com/'},'model'));
 assert.match(vertexEndpoint(settings,'model'),/^https:\/\/aiplatform.googleapis.com\/v1\/projects\/test-project\/locations\/global\//);
 const original=globalThis.fetch;let tokenCalls=0,modelCalls=0;
 globalThis.fetch=async(url,options)=>{
  if(url==='https://oauth2.googleapis.com/token'){tokenCalls++;const jwt=options.body.get('assertion'),parts=jwt.split('.');const payload=JSON.parse(Buffer.from(parts[1],'base64url'));assert.equal(payload.aud,'https://oauth2.googleapis.com/token');assert.equal(payload.iss,credentials.client_email);assert.equal(verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),pair.publicKey,Buffer.from(parts[2],'base64url')),true);return Response.json({access_token:'synthetic-token',expires_in:3600});}
  modelCalls++;assert.match(url,/aiplatform.googleapis.com/);assert.equal(options.headers.Authorization,'Bearer synthetic-token');assert.equal(options.headers['x-goog-api-key'],undefined);return Response.json({candidates:[{content:{parts:[{inlineData:{mimeType:'image/png',data:Buffer.from('test-image').toString('base64')}}]}}]});
 };
 try{await vertexRequest(settings,'model',{contents:[]});const image=await thumbnail(settings,{title:'Test'});assert.equal(image.extension,'png');assert.equal(image.buffer.toString(),'test-image');assert.equal(tokenCalls,1);assert.equal(modelCalls,2);}finally{globalThis.fetch=original;}
});
