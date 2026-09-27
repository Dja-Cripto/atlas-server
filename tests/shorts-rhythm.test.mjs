import {test} from 'node:test';
import assert from 'node:assert/strict';
import {enforceShortVisualRhythm,enforceVisualBreathing,validateDirection} from '../lib/auto-plan.mjs';
import {validateShortMotionCode,shortsSceneContract} from '../lib/motion-author.mjs';
import {v3DirectionPrompt} from '../lib/v3-direction.mjs';

test('Short rhythm animates all kinds of media without changing long-form breathing',()=>{
 const scenes=[
  {id:'a',kind:'footage',start:0,end:5,treatment:'clean',asset:{kind:'video'}},
  {id:'b',kind:'footage',start:5,end:10,treatment:'clean',asset:{kind:'video'}},
  {id:'c',kind:'photo',start:10,end:15,treatment:'clean',asset:{kind:'image'}},
  {id:'d',kind:'diagram',start:15,end:20,treatment:'composed',diagramIntent:'Show a verified water-level mechanism'},
  {id:'e',kind:'footage',start:20,end:25,treatment:'clean',asset:{kind:'video'}}
 ];
 const short=enforceShortVisualRhythm(scenes);
 assert.deepEqual(short.map(x=>x.treatment),['composed','clean','composed','composed','composed']);
 assert.ok(short.every(x=>x.motionStyle==='auto'&&x.shortMotion==='active'));
 assert.equal(enforceVisualBreathing(scenes,25,{version:'v3'})[1].treatment,'clean');
});

test('Short code cannot be only footage and a static caption',()=>{
 assert.throws(()=>validateShortMotionCode("import {OffthreadVideo} from 'remotion';export default function S(){return <><OffthreadVideo src='a.mp4'/><div>Tokyo</div></>}") ,/quadro a quadro/);
 assert.doesNotThrow(()=>validateShortMotionCode("const frame=useCurrentFrame();const x=interpolate(frame,[0,20],[1,1.04]);return <div style={{transform:`scale(${x})`}}/>") );
 assert.match(shortsSceneContract,/every scene must visibly develop/i);
});

test('Short direction permits a researched diagram and keeps photographs animated',()=>{
 const slot={id:'s1',start:0,end:4,narration:'The water rises inside the chamber.'};
 const scene=validateDirection(slot,{kind:'diagram',heading:'Water rises',diagramIntent:'Show the narrated water rising inside the chamber'},{text:slot.narration});
 assert.equal(scene.diagramIntent,'Show the narrated water rising inside the chamber');
 const shortPrompt=v3DirectionPrompt({title:'How does a lock work?',script:slot.narration,research:{},previous:[],batch:[slot],isShort:true});
 const longPrompt=v3DirectionPrompt({title:'How does a lock work?',script:slot.narration,research:{},previous:[],batch:[slot],isShort:false});
 assert.match(shortPrompt,/SHORT-ONLY OVERRIDE/);
 assert.match(shortPrompt,/Photos are welcome/);
 assert.doesNotMatch(longPrompt,/SHORT-ONLY OVERRIDE/);
});
