import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reviewMediaPlan,reviewAuthoredBlocks,isSplitScreenLayout,detectVisualRedundancy} from '../lib/editorial-review.mjs';
import {detectConsecutiveFootage,detectExhaustedSegments,composeContinuity} from '../lib/visual-continuity.mjs';
import {validateDirection,audioSlots} from '../lib/auto-plan.mjs';

test('detectConsecutiveFootage identifies repeated source media in adjacent video scenes',()=>{
 const scenes=[
  {id:'s1',index:0,asset:{kind:'video',sourceId:'yt-123',src:'a.mp4'}},
  {id:'s2',index:1,asset:{kind:'video',sourceId:'yt-123',src:'a.mp4'}},
  {id:'s3',index:2,asset:{kind:'video',sourceId:'other-clip',src:'b.mp4'}}
 ];
 const duplicates=detectConsecutiveFootage(scenes);
 assert.equal(duplicates.length,1);
 assert.equal(duplicates[0].sceneId,'s2');
 assert.equal(duplicates[0].prevSceneId,'s1');
 assert.equal(duplicates[0].sourceId,'yt-123');
});

test('detectExhaustedSegments identifies footage where advance exceeds source length',()=>{
 const scenes=[
  {id:'s1',index:0,start:0,end:5,asset:{kind:'video',sourceId:'clip1',src:'c.mp4',duration:6,trimStart:0}},
  {id:'s2',index:1,start:5,end:10,asset:{kind:'video',sourceId:'clip1',src:'c.mp4',duration:6,trimStart:5}} // 5 + 5 = 10s > 6s duration
 ];
 const exhausted=detectExhaustedSegments(scenes);
 assert.equal(exhausted.length,1);
 assert.equal(exhausted[0].id,'s2');
});

test('composeContinuity marks consecutive reuse and exhausted segments on assets',()=>{
 const videoAsset={kind:'video',sourceId:'same-clip',src:'c.mp4',duration:6,trimStart:0};
 const scenes=[
  {id:'s1',start:0,end:4,asset:{...videoAsset}},
  {id:'s2',start:4,end:8,asset:{...videoAsset}}
 ];
 const composed=composeContinuity(scenes);
 assert.equal(composed[1].asset.consecutiveReuse,true);
 assert.equal(composed[1].asset.segmentExhausted,true);
});

test('reviewMediaPlan fails valid gate on consecutive footage and warns on exhausted segments',()=>{
 const scenes=[
  {id:'s1',index:0,start:0,end:4,asset:{kind:'video',sourceId:'same-clip',src:'c.mp4',duration:5,trimStart:0}},
  {id:'s2',index:1,start:4,end:8,asset:{kind:'video',sourceId:'same-clip',src:'c.mp4',duration:5,trimStart:4}}
 ];
 const review=reviewMediaPlan(scenes,{duration:8,isShort:false});
 assert.equal(review.valid,false);
 assert.ok(review.issues.some(i=>i.type==='consecutive-footage'&&i.severity==='error'));
 assert.ok(review.issues.some(i=>i.type==='exhausted-segment'&&i.severity==='warning'));
});

test('reviewMediaPlan warns when evidence narrative role receives generic contextual stock',()=>{
 const scenes=[
  {
   id:'s1',
   index:0,
   start:0,
   end:5,
   narrativeRole:'evidence',
   requiredSubject:'Submarino San Juan naufragado',
   asset:{kind:'image',sourceId:'stock-1',representationRole:'contextual',credit:{source:'Pexels'}}
  }
 ];
 const review=reviewMediaPlan(scenes,{duration:5,isShort:false});
 assert.ok(review.issues.some(i=>i.type==='evidence-mismatch'&&i.severity==='warning'));
});

test('reviewAuthoredBlocks catches monotonous photo zoom/pan streaks and approves varied techniques',()=>{
 const monotonousScenes=[
  {index:0,kind:'photo',asset:{kind:'image',src:'1.jpg'}},
  {index:1,kind:'photo',asset:{kind:'image',src:'2.jpg'}},
  {index:2,kind:'photo',asset:{kind:'image',src:'3.jpg'}}
 ];
 const repetitiveCode=`const pan=interpolate(frame,[0,duration],[1.04,1.08]); return <div style={{transform:\`translateX(\${pan})\`}}><Img src={src}/></div>;`;
 const codesMonotonous=new Map([
  [0,repetitiveCode],
  [1,repetitiveCode],
  [2,repetitiveCode]
 ]);
 const reviewMonotonous=reviewAuthoredBlocks(monotonousScenes,codesMonotonous);
 assert.ok(reviewMonotonous.issues.some(i=>i.type==='photo-monotony'));

 const variedCode=`const scale=interpolate(frame,[0,duration],[1,1.05]); return <div style={{clipPath:'inset(5%)'}}><svg><rect/></svg><Img src={src}/></div>;`;
 const codesVaried=new Map([
  [0,repetitiveCode],
  [1,variedCode],
  [2,repetitiveCode]
 ]);
 const reviewVaried=reviewAuthoredBlocks(monotonousScenes,codesVaried);
 assert.equal(reviewVaried.issues.some(i=>i.type==='photo-monotony'),false);
});

test('validateDirection preserves narrativeRole, requiredSubject, and contextIntent',()=>{
 const slot={id:'s1',narration:'USS Nimitz anchored off the coast.'};
 const rawDirection={
  id:'s1',
  kind:'photo',
  heading:'USS Nimitz',
  narrativeRole:'evidence',
  requiredSubject:'USS Nimitz flight deck',
  contextIntent:'specific incident evidence',
  visualPurpose:'documentary archival proof'
 };
 const validated=validateDirection(slot,rawDirection,{});
 assert.equal(validated.narrativeRole,'evidence');
 assert.equal(validated.requiredSubject,'USS Nimitz flight deck');
 assert.equal(validated.contextIntent,'specific incident evidence');
 assert.equal(validated.visualPurpose,'documentary archival proof');

 const slotContext={id:'s2',narration:'General sea traffic.'};
 const rawContext={
  id:'s2',
  kind:'footage',
  heading:'Sea Traffic',
  narrativeRole:'context',
  contextIntent:'general maritime atmosphere'
 };
 const validatedContext=validateDirection(slotContext,rawContext,{});
 assert.equal(validatedContext.narrativeRole,'context');
 assert.equal(validatedContext.contextIntent,'general maritime atmosphere');
});

test('audioSlots aligns slot narration with script tokens to correct Whisper misspellings',()=>{
 const script="Em 1888, o explorador Fridtjof Nansen cruzou a Groelândia.";
 const transcriptionWords=[
  {word:'Em',start:0,end:0.3},
  {word:'1888,',start:0.3,end:0.8},
  {word:'o',start:0.8,end:1.0},
  {word:'explorador',start:1.0,end:1.5},
  {word:'Fritjof',start:1.5,end:2.0}, // Whisper misspelled Fritjof
  {word:'Nanzen',start:2.0,end:2.5},  // Whisper misspelled Nanzen
  {word:'cruzou',start:2.5,end:3.0},
  {word:'a',start:3.0,end:3.2},
  {word:'Groelandia.',start:3.2,end:4.0}
 ];
 const slots=audioSlots([{words:transcriptionWords}],4.0,{script});
 assert.equal(slots.length,1);
 assert.equal(slots[0].narration,'Em 1888, o explorador Fridtjof Nansen cruzou a Groelândia.');
});

test('isSplitScreenLayout detects unnecessary split-screen photo boxes and approves full-bleed with overlays',()=>{
 const splitCode=`
  return (
   <AbsoluteFill>
    <div style={{position:'absolute',left:80,top:180,width:1280,height:720}}>
     <Img src={src} style={{width:'100%',height:'100%',objectFit:'cover'}} />
    </div>
    <div style={{position:'absolute',left:1370,top:155,width:470,height:770,backgroundColor:'#17272a'}}>
     <svg><rect/></svg>
    </div>
   </AbsoluteFill>
  );
 `;
 assert.equal(isSplitScreenLayout(splitCode),true);

 const fullBleedOverlayCode=`
  return (
   <AbsoluteFill>
    <Img src={src} style={{width:'100%',height:'100%',objectFit:'cover',transform:\`scale(\${scale})\`}} />
    <div style={{position:'absolute',right:80,top:80,width:480,backgroundColor:'rgba(10,20,30,0.85)'}}>
     <svg><rect/></svg>
    </div>
   </AbsoluteFill>
  );
 `;
 assert.equal(isSplitScreenLayout(fullBleedOverlayCode),false);
});

test('reviewAuthoredBlocks detects unnecessary split-screen and visual redundancy across adjacent scenes',()=>{
 const scenes=[
  {index:0,kind:'photo',asset:{kind:'image',src:'a.jpg'}},
  {index:1,kind:'photo',asset:{kind:'image',src:'a.jpg'}}
 ];
 const splitCode=`
  return (
   <AbsoluteFill>
    <div style={{width:900}}>
     <Img src={src}/>
    </div>
    <div style={{left:960,backgroundColor:'#111'}}>
     <svg/>
    </div>
   </AbsoluteFill>
  );
 `;
 const codesMap=new Map([
  [0,splitCode],
  [1,splitCode]
 ]);
 const review=reviewAuthoredBlocks(scenes,codesMap);
 assert.ok(review.issues.some(i=>i.type==='unnecessary-split-screen'));
 assert.ok(review.issues.some(i=>i.type==='visual-redundancy'));
});
