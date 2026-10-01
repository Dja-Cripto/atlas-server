import {test} from 'node:test';
import assert from 'node:assert/strict';
import {realRecoveryScenes,candidatePool} from '../lib/auto-media.mjs';
test('context recovery searches regional support instead of substitution prose',()=>{
 const original={id:'shot-111',kind:'title',missingVisual:true,query:'Panama Canal rainforest watershed',location:'Gatún Lake watershed, Panama',countries:['Panama'],narrativeRole:'context',allowedSubstitution:'Verified footage of rain falling over the watershed',asset:{src:'bad.jpg'}};
 const alternatives=realRecoveryScenes(original);
 assert.equal(alternatives[0].query,original.query);
 const regional=alternatives.find(x=>x.location==='Panama');
 assert.ok(regional);assert.equal(regional.requiredSubject,'');assert.equal(regional.asset,undefined);
 assert.ok(!alternatives.some(x=>x.query===original.allowedSubstitution));
 assert.equal(candidatePool({...regional,topicCountry:'Panama',identityRequired:true},[{id:1,title:'Gatun Lake forest in Panama',width:2400,height:1600,source:'Pexels'}]).length,1);
 assert.equal(candidatePool({...regional,topicCountry:'Panama',identityRequired:true},[{id:2,title:'Rainforest in Brazil',width:2400,height:1600,source:'Pexels'}]).length,0);
 assert.equal(original.asset.src,'bad.jpg');
});
test('specific factual scenes keep their location and do not broaden to regional support',()=>{
 const alternatives=realRecoveryScenes({query:'specific control room',location:'Panama Canal control room',narrativeRole:'literal'});
 assert.equal(alternatives.length,1);assert.equal(alternatives[0].location,'Panama Canal control room');
});
