import {test} from 'node:test';
import assert from 'node:assert/strict';
import {audioSlots,validateDirection,safeDirection,hasLocation,diversifyVisualPlan,normalizeDirectionKind,enforceVisualBreathing,normalizeVisualTreatment} from '../lib/auto-plan.mjs';
import {cleanPromptSequence,normalizeBeats,normalizeMotionCode,normalizeMotionResult,validateMotionCode,sceneUnits,normalizeVisualBible,validateVisualBible,shortsSceneContract,shortsDirectorContract,generateCleanMediaSceneCode} from '../lib/motion-author.mjs';
import {candidatePool} from '../lib/auto-media.mjs';
import {parseRelaxedJSON,splitScriptIntoTTSChunks} from '../lib/providers.mjs';
test('normalizeMotionCode injects muted on OffthreadVideo and Video to prevent audio bleed',()=>{
 const videoCode="import {OffthreadVideo,Video,useCurrentFrame} from 'remotion';export default function Scene(){return <AbsoluteFill><OffthreadVideo src='a.mp4' /><Video style={{width:'100%'}} /></AbsoluteFill>;}";
 const normalized=normalizeMotionCode(videoCode);
 assert.match(normalized,/<OffthreadVideo muted /);
 assert.match(normalized,/<Video muted /);
 const alreadyMuted="import {OffthreadVideo} from 'remotion';\n<OffthreadVideo muted src='a.mp4' />";
 assert.equal(normalizeMotionCode(alreadyMuted),alreadyMuted);
 assert.doesNotMatch(normalizeMotionCode(alreadyMuted),/<OffthreadVideo muted muted/);
});
test('splitScriptIntoTTSChunks divides long narration by sentences without pitch drift or cutting mid-sentence',()=>{
 const longScript="Panama Canal is a vital maritime corridor connecting two oceans. It handles around five percent of global trade every single year. However, recent severe droughts have reduced water levels in Lake Gatún significantly. To solve this challenge, engineers proposed the Rio Indio reservoir project. This will guarantee water security for decades to come.";
 const chunks=splitScriptIntoTTSChunks(longScript,140);
 assert.ok(chunks.length>=3);
 chunks.forEach(c=>{
  assert.ok(c.length<=160);
  assert.match(c,/[.!?]$/);
 });
 assert.equal(splitScriptIntoTTSChunks("Short script.",300).length,1);
});
test('automatic timeline follows spoken timestamps and covers pauses without gaps',()=>{
 const words=Array.from({length:30},(_,i)=>({word:' word'+i,start:i*.4,end:i*.4+.3}));const slots=audioSlots([{words}],12);
 assert.equal(slots[0].start,0);assert.equal(slots.at(-1).end,12);assert.ok(slots.length>=2);
 slots.slice(1).forEach((s,i)=>assert.equal(s.start,slots[i].end));assert.equal(slots.map(s=>s.narration).join(' ').split(' ').length,30);
 assert.throws(()=>audioSlots([{words:words.slice(0,5)}],12),/incompleta/);
});
test('automatic charts reject invented values or sources and model code is discarded',()=>{
 const slot={id:'shot-1',start:0,end:5};const research='47 percent in 2025. Source: https://example.org/data';
 const d={id:'shot-1',kind:'chart',heading:'Cross-border workforce',chart:{quote:'47 percent in 2025.',source:'https://example.org/data',unit:'%',values:[{label:'Cross-border',value:47}]},code:'malicious()'};
 assert.equal(validateDirection(slot,d,research).chart.values[0].value,47);assert.equal(validateDirection(slot,d,research).code,undefined);
 assert.throws(()=>validateDirection(slot,{...d,chart:{...d.chart,values:[{label:'Invented',value:80}]}},research),/respaldo/);
 assert.throws(()=>validateDirection(slot,{...d,chart:{...d.chart,source:'https://invented.example'}},research),/evidência/);
});
test('generic visual similarity cannot substitute for a named country',()=>{
 assert.equal(hasLocation({url:'https://www.pexels.com/video/new-york-train-123/'},'Luxembourg'),false);
 assert.equal(hasLocation({url:'https://www.pexels.com/video/luxembourg-city-123/'},'Luxembourg'),true);
 assert.equal(hasLocation({url:'https://www.pexels.com/video/train-123/'},''),true);
 assert.equal(hasLocation({title:'Swiss Guard ceremony',locationEvidence:'Photographed in Vatican City'},'Vatican City'),true);
});
test('stock footage can support a named place contextually without claiming exact identity',()=>{
 const scene={location:'Alaska',query:'Alaska snow mountains aerial'};
 const pool=candidatePool(scene,[
  {id:1,source:'Pexels',url:'https://pexels.com/video/snowy-mountains'},
  {id:2,source:'Pixabay',url:'https://pixabay.com/videos/alaska-glacier',locationEvidence:'Alaska glacier'},
  {id:3,source:'Wikimedia Commons',url:'https://commons.wikimedia.org/wrong-place'}
 ]);
 assert.equal(pool[0].id,2);assert.equal(pool[0].representationRole,'exact-location');
 assert.equal(pool[1].id,1);assert.equal(pool[1].representationRole,'contextual');
 assert.equal(pool.some(candidate=>candidate.id===3),false);
});
test('repeated maps are routed to media search before motion authoring',()=>{
 const plan=[
  {id:'a',kind:'map',start:0,end:5,countries:['Italy'],heading:'Italy located'},
  {id:'b',kind:'footage',start:5,end:10,countries:['Italy'],heading:'Street life'},
  {id:'c',kind:'map',start:10,end:15,countries:['Italy'],heading:'Italy again'},
  {id:'d',kind:'map',start:15,end:20,countries:['France'],heading:'France located'},
 ];
 const diversified=diversifyVisualPlan(plan,60);
 assert.equal(diversified[0].kind,'map');
 assert.equal(diversified[2].kind,'footage');
 assert.equal(diversified[2].mapDiversified,true);
 assert.equal(diversified[3].kind,'footage');
 assert.match(diversified[2].query,/documentary footage/);
});
test('map scenes must preserve the real backdrop and cannot invent geography',()=>{
 const transparent="import {AbsoluteFill,useCurrentFrame} from 'remotion';export default function Scene(){const frame=useCurrentFrame();return <AbsoluteFill><span>{frame}</span></AbsoluteFill>}";
 const opaque="import {AbsoluteFill,useCurrentFrame} from 'remotion';export default function Scene(){const frame=useCurrentFrame();return <AbsoluteFill style={{backgroundColor:'#000'}}><span>{frame}</span></AbsoluteFill>}";
 const invented="import {AbsoluteFill,useCurrentFrame} from 'remotion';import {geoPath} from 'd3-geo';export default function Scene(){const frame=useCurrentFrame();return <AbsoluteFill><span>{frame+String(geoPath)}</span></AbsoluteFill>}";
 assert.doesNotThrow(()=>validateMotionCode(transparent,{map:{type:'FeatureCollection'}}));
 assert.throws(()=>validateMotionCode(opaque,{map:{type:'FeatureCollection'}}),/transparente/);
 assert.throws(()=>validateMotionCode(invented,{map:{type:'FeatureCollection'}}),/base cartográfica real/);
 assert.throws(()=>validateMotionCode("import {useCurrentFrame} from 'remotion';export default function Scene(){const frame=useCurrentFrame();return <video>{frame}</video>}"),/OffthreadVideo/);
});
test('known easing aliases are normalized before rendering',()=>{
 assert.equal(normalizeMotionCode('Easing.out(Easing.quart)'), 'Easing.out(Easing.poly(4))');
 assert.equal(normalizeMotionCode('Easing.out(Easing.back)'), 'Easing.out(Easing.back())');
 assert.equal(normalizeMotionCode('Easing.out(Easing.quad())'), 'Easing.out(Easing.quad)');
 assert.equal(normalizeMotionCode('Easing.inOut(Easing.cubic( ))'), 'Easing.inOut(Easing.cubic)');
 assert.equal(normalizeMotionCode('Easing.quad(Easing.Out)'), 'Easing.out(Easing.quad)');
 assert.equal(normalizeMotionCode('Easing.cubic(Easing.InOut)'), 'Easing.inOut(Easing.cubic)');
 assert.equal(normalizeMotionCode('Easing.sin(Easing.In)'), 'Easing.in(Easing.sin)');
});
test('video assets cannot be sent to the image component',()=>{
 const code="import {Img,useCurrentFrame} from 'remotion';export default function Scene(){const frame=useCurrentFrame();return <Img src={String(frame)}/>}";
 const normalized=normalizeMotionCode(code,{asset:{kind:'video'}});
 assert.match(normalized,/OffthreadVideo/);assert.doesNotMatch(normalized,/\bImg\b/);
});
test('missing Remotion component imports are inserted before validation',()=>{
 const code="import {useCurrentFrame,staticFile} from 'remotion';export default function Scene({scene}){const frame=useCurrentFrame();return <Video src={staticFile(scene.asset.src)} startFrom={frame}/>}";
 const normalized=normalizeMotionCode(code,{asset:{kind:'video'}});
 assert.match(normalized,/\{\s*Video,/);assert.doesNotThrow(()=>validateMotionCode(normalized,{asset:{kind:'video'}}));
});
test('motion beats expressed in frames are normalized to seconds',()=>{
 const beats=normalizeBeats([{start:0,end:40,action:'open'},{start:40,end:139,action:'continue'}],139/30,30);
 assert.equal(beats[0].end,40/30);assert.equal(beats[1].end,139/30);
 const seconds=normalizeBeats([{start:0,end:2,action:'open'},{start:2,end:4.6,action:'continue'}],4.6,30);
 assert.equal(seconds[1].end,4.6);
});
test('motion metadata aliases and omissions do not discard valid code',()=>{
 const aliased=normalizeMotionResult({intent:'animate map',beholds:[{start:0,end:120,action:'draw'}]},4,30);
 assert.equal(aliased.beats[0].end,4);assert.equal('beholds' in aliased,false);
 const omitted=normalizeMotionResult({intent:'keep footage moving'},4,30);
 assert.deepEqual(omitted.beats,[{start:0,end:4,action:'keep footage moving'}]);
});
test('chart evidence uses actual research strings, not JSON-escaped text',()=>{
 const slot={id:'shot-10',start:40,end:45};const quote='The "share" is 47 percent.\nMeasured in 2025.';
 const d={id:slot.id,kind:'chart',heading:'Share',chart:{quote,source:'https://example.org',unit:'%',values:[{label:'Share',value:47}]}};
 assert.equal(validateDirection(slot,d,{text:quote,sources:[{uri:'https://example.org'}]}).chart.values[0].value,47);
 const fallback=safeDirection(slot,{...d,location:'Luxembourg',caption:'Unsupported 99%',chart:{...d.chart,quote:'Invented 99 percent'}},{text:quote});
 assert.equal(fallback.scene.kind,'footage');assert.equal(fallback.scene.chart,undefined);assert.equal(fallback.scene.caption,'');assert.match(fallback.warning,/descartado/);
 assert.throws(()=>safeDirection(slot,{id:'wrong',kind:'map'},{}),/inválida/);
});
test('motion authoring prompt strips heavy raw polygon coordinates while preserving country metadata',()=>{
 const seq={index:0,durationInFrames:300,fps:30,scenes:[{id:'shot-1',kind:'footage'},{id:'shot-2',kind:'map',countries:['Luxembourg'],map:{type:'FeatureCollection',features:[{geometry:{type:'Polygon',coordinates:[[[6.1,49.6],[6.2,49.7],[6.3,49.6]]]},properties:{name:'Luxembourg',focal:true}}]}}]};
 const cleaned=cleanPromptSequence(seq);
 assert.equal(cleaned.scenes[0].kind,'footage');
 assert.equal(cleaned.scenes[1].map.type,'FeatureCollection');
 assert.deepEqual(cleaned.scenes[1].map.countries,['Luxembourg']);
 assert.equal(cleaned.scenes[1].map.features[0].geometry,undefined);
 assert.equal(cleaned.scenes[1].map.features[0].properties.name,'Luxembourg');
 assert.equal(JSON.stringify(cleaned).includes('coordinates'),false);
});
test('variable declarations without initializers pass motion validation without error',()=>{
 const code="import {AbsoluteFill,useCurrentFrame} from 'remotion';export default function Scene(){const frame=useCurrentFrame();let x:number,y:number,o=1;return <AbsoluteFill><span>{frame}</span></AbsoluteFill>}";
 assert.doesNotThrow(()=>validateMotionCode(code));
});
test('sceneUnits computes frame intervals and background indices for validation',()=>{
 const manifest={title:'Test',duration:10,scenes:[{id:'s1',start:0,end:5,kind:'footage',asset:{src:'a.mp4',kind:'video'}},{id:'s2',start:5,end:10,kind:'title'}]};
 const units=sceneUnits(manifest);
 assert.equal(units.length,2);
 assert.equal(units[0].from,0);
 assert.equal(units[0].durationInFrames,150);
 assert.equal(units[1].from,150);
 assert.equal(units[1].backgroundIndex,0);
});
test('audioSlots splits along sentence boundaries and pauses with comfortable duration',()=>{
 const words=[
  {word:'In',start:0,end:0.4},{word:' Singapore,',start:0.4,end:1.0},{word:' maritime',start:1.0,end:1.6},{word:' trade',start:1.6,end:2.2},{word:' is',start:2.2,end:2.5},{word:' massive.',start:2.5,end:3.2},
  {word:' Over',start:3.8,end:4.2},{word:' 100,000',start:4.2,end:4.9},{word:' vessels',start:4.9,end:5.5},{word:' arrive',start:5.5,end:6.0},{word:' each',start:6.0,end:6.4},{word:' year.',start:6.4,end:7.0},
  {word:' This',start:7.6,end:8.0},{word:' connects',start:8.0,end:8.6},{word:' two',start:8.6,end:9.0},{word:' major',start:9.0,end:9.4},{word:' oceans.',start:9.4,end:10.0}
 ];
 const slots=audioSlots([{words}],10.0);
 assert.equal(slots.length,2);
 assert.equal(slots[0].start,0);
 assert.equal(slots[0].end,7.6);
 assert.match(slots[0].narration,/each year\.$/);
 assert.equal(slots[1].start,7.6);
 assert.equal(slots[1].end,10.0);
 assert.match(slots[1].narration,/two major oceans\.$/);
});
test('scene.location and location variables pass validation without banned API error',()=>{
 const code="import {AbsoluteFill,useCurrentFrame} from 'remotion';export default function Scene({scene}){const frame=useCurrentFrame();const location=scene.location||'Singapore';return <AbsoluteFill><span>{location} {frame}</span></AbsoluteFill>}";
 assert.doesNotThrow(()=>validateMotionCode(code));
});
test('parseRelaxedJSON handles comments, trailing commas, TSX code newlines, arrays, and truncation',()=>{
 const withComments='```json\n{\n  // A visual note\n  "title": "World Economy",\n  /* multi\n  line */\n  "shots": [1, 2, 3,],\n}\n```';
 assert.deepEqual(parseRelaxedJSON(withComments),{title:'World Economy',shots:[1,2,3]});

 const withRawNewlines='{\n  "code": "import React from \'react\';\nconst Scene = () => <div />;\nexport default Scene;"\n}';
 assert.equal(parseRelaxedJSON(withRawNewlines).code,"import React from 'react';\nconst Scene = () => <div />;\nexport default Scene;");

 const arrayPreamble='Here is the batch plan:\n[{"id": "shot-1", "kind": "footage"}, {"id": "shot-2", "kind": "photo"},]\nHope this helps!';
 assert.deepEqual(parseRelaxedJSON(arrayPreamble),[{id:'shot-1',kind:'footage'},{id:'shot-2',kind:'photo'}]);

 const truncated='{"vision": "Wide panorama", "sceneDirectives": [{"id": "shot-1", "intent": "explain"';
 assert.equal(parseRelaxedJSON(truncated).vision,'Wide panorama');
 assert.equal(parseRelaxedJSON(truncated).sceneDirectives[0].id,'shot-1');
});
test('normalizeVisualBible supplies missing scene directives for long multi-scene productions',()=>{
 const scenes=Array.from({length:35},(_,i)=>({id:`shot-${i+1}`,heading:`Heading ${i+1}`,countries:['Country '+i]}));
 const incompleteBible={
  vision:'Epic documentary',
  rhythm:'Balanced',
  visualLanguage:['Cinematic'],
  continuityPrinciples:['Logical flow'],
  sceneDirectives:[{id:'shot-1',intent:'Opening overview',mustShow:['Country 0'],opportunities:[],connection:'Start'}]
 };
 const normalized=normalizeVisualBible(incompleteBible,scenes);
 assert.equal(normalized.sceneDirectives.length,35);
 assert.equal(normalized.sceneDirectives[0].intent,'Opening overview');
 assert.equal(normalized.sceneDirectives[34].id,'shot-35');
 assert.equal(normalized.sceneDirectives[34].intent,'Heading 35');
 assert.doesNotThrow(()=>validateVisualBible(normalized,scenes));
});
test('validateDirection normalizes alias kinds and autocompletes headings',()=>{
 const slot={id:'shot-1',narration:'Singapore has a massive deepwater harbor.'};
 const directionWithAliases={id:'shot-1',kind:'video',heading:''};
 const validated=validateDirection(slot,directionWithAliases,'');
 assert.equal(validated.kind,'footage');
 assert.equal(validated.heading,'Singapore has a massive deepwater harbor.');
});
test('normalizeMotionCode splits concatenated keywords and identifiers',()=>{
 assert.equal(normalizeMotionCode("constPORT_TICKS = ['PORT 01', 'PORT 02'];"), "const PORT_TICKS = ['PORT 01', 'PORT 02'];");
 assert.equal(normalizeMotionCode("constAMBER = '#ffb84d';\nletCAM_SCALE = 1.05;"), "const AMBER = '#ffb84d';\nlet CAM_SCALE = 1.05;");
 assert.match(normalizeMotionCode("return<AbsoluteFill><span>hi</span></AbsoluteFill>"), /return <AbsoluteFill>/);
 assert.equal(normalizeMotionCode("export defaultfunction Scene() {}"), "export default function Scene() {}");
 assert.equal(normalizeMotionCode("export default MotionScene = Mechanism1;"), "export default Mechanism1;");
 assert.equal(normalizeMotionCode("export default const MotionScene = () => {};"), "const MotionScene = () => {};\nexport default MotionScene;\n");
 assert.equal(normalizeMotionCode("typography: any = null;\nconst a = 1;"), "const a = 1;");
});
test('validateMotionCode flags undeclared top-level assignments and labeled statements',()=>{
 const invalidCode="import {AbsoluteFill,useCurrentFrame} from 'remotion';\nPORT_TICKS = ['A', 'B'];\nexport default function Scene(){const f=useCurrentFrame();return <AbsoluteFill>{f}</AbsoluteFill>;}";
 assert.throws(()=>validateMotionCode(invalidCode),/sem palavra-chave/);
 const invalidExport="import {AbsoluteFill,useCurrentFrame} from 'remotion';\nconst S=()=>{const f=useCurrentFrame();return <AbsoluteFill>{f}</AbsoluteFill>;};\nexport default MotionScene = S;";
 assert.throws(()=>validateMotionCode(invalidExport),/Atribuição inválida/);
 const labeledCode="import {AbsoluteFill,useCurrentFrame} from 'remotion';\ntypography: any = null;\nexport default function Scene(){const f=useCurrentFrame();return <AbsoluteFill>{f}</AbsoluteFill>;}";
 assert.throws(()=>validateMotionCode(labeledCode),/labeled statement/);
});

test('shortsSceneContract specifies 1080x1920 vertical canvas and mobile-safe zones',()=>{
 assert.match(shortsSceneContract,/1080x1920/);
 assert.match(shortsSceneContract,/9:16/);
 assert.match(shortsSceneContract,/X between 60px and 1020px/);
 assert.match(shortsSceneContract,/Y between 200px and 1720px/);
 assert.match(shortsSceneContract,/52px/);
 assert.match(shortsSceneContract,/objectFit cover/);
});

test('shortsDirectorContract specifies Short-specific pacing and vertical format',()=>{
 assert.match(shortsDirectorContract,/1080x1920/);
 assert.match(shortsDirectorContract,/50 seconds/);
 assert.match(shortsDirectorContract,/hook/i);
 assert.match(shortsDirectorContract,/mobile/i);
});

test('extractCuriosities, shortScript and shortVoice are exported from providers',async()=>{
 const mod=await import('../lib/providers.mjs');
 assert.equal(typeof mod.extractCuriosities,'function');
 assert.equal(typeof mod.shortScript,'function');
 assert.equal(typeof mod.shortVoice,'function');
});

test('shorts module exports automaticShorts function',async()=>{
 const mod=await import('../lib/shorts.mjs');
 assert.equal(typeof mod.automaticShorts,'function');
});

test('normalizeMotionCode fixes duplicate and non-increasing inputRange for interpolate and interpolateColors',()=>{
 const code = `const c = interpolateColors(1, [1, 1], ['#000', '#000']);
 const s = interpolate(frame, [0, 0], [0, 1]);
 const crawl = interpolate(frame, [45, D], [1.0, 1.1]);
 const multi = interpolate(frame, [0, 50, 50, 100], [0, 0.5, 0.5, 1]);
 const inverted = interpolate(1.2, 2.2, Math.min(frame/fps, 2.2), [0, 0.8]);`;
 const normalized = normalizeMotionCode(code);
 assert.match(normalized, /\[1, 2\]/);
 assert.match(normalized, /\[0, 1\]/);
 assert.match(normalized, /\[45, Math\.max\(46, D\)\]/);
 assert.match(normalized, /\[0, 50, 51, 100\]/);
 assert.match(normalized, /interpolate\(Math\.min\(frame\/fps, 2\.2\), \[1\.2, 2\.2\], \[0, 0\.8\]\)/);
});

test('normalizeMotionCode fixes mismatched default export and validateMotionCode validates declaration',()=>{
 const mismatchedCode = `import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
const SuezFlowImpact: React.FC<{scene: any; context: any}> = ({scene}) => {
 const f = useCurrentFrame();
 return <AbsoluteFill>{f}</AbsoluteFill>;
};
export default MotionScene;`;
 const normalized = normalizeMotionCode(mismatchedCode);
 assert.match(normalized, /export default SuezFlowImpact;/);
 assert.doesNotThrow(() => validateMotionCode(normalized));

 const undeclaredExport = `import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
const NW = 80;
export default MotionScene;`;
 assert.throws(() => validateMotionCode(undeclaredExport), /não foi declarado/);
});

test('normalizeMotionCode unpacks bracketed [outRange, options] in interpolate calls',()=>{
 const code = `const cl = (f: number, r: number[], o: number[], easing: any = out) =>
  interpolate(f, r, [o, {easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}]);`;
 const normalized = normalizeMotionCode(code);
 assert.match(normalized, /interpolate\(f, r, o, \{easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'\}\)/);
});

test('generateFallbackSceneCode produces valid Remotion component for long videos and shorts',async()=>{
 const mod = await import('../lib/motion-author.mjs');
 assert.equal(typeof mod.generateFallbackSceneCode, 'function');
 const longCode = mod.generateFallbackSceneCode({heading:'Strait of Malacca',durationInFrames:120,asset:{src:'auto/test/footage.mp4',kind:'video'}}, false);
 assert.match(longCode, /OffthreadVideo/);
 assert.match(longCode, /Strait of Malacca/);
 const shortCode = mod.generateFallbackSceneCode({heading:'Curiosity 1',durationInFrames:90,asset:null}, true);
 assert.match(shortCode, /Curiosity 1/);
});

test('diversifyVisualPlan limits vertical shorts to at most 1 map and converts excess to footage', () => {
 const shortPlan = [
  { id: 's1', kind: 'map', start: 0, end: 5, countries: ['Singapore'], heading: 'Singapore Strait' },
  { id: 's2', kind: 'map', start: 5, end: 10, countries: ['Malaysia'], heading: 'Malaysia Coast' },
  { id: 's3', kind: 'footage', start: 10, end: 15, countries: ['Indonesia'], heading: 'Traffic' },
  { id: 's4', kind: 'map', start: 15, end: 20, countries: ['Thailand'], heading: 'Kra Canal' }
 ];
 const diversified = diversifyVisualPlan(shortPlan, 50);
 const mapCount = diversified.filter(s => s.kind === 'map').length;
 assert.equal(mapCount, 1);
 assert.equal(diversified[0].kind, 'map');
 assert.equal(diversified[1].kind, 'footage');
 assert.equal(diversified[3].kind, 'footage');
});

test('shortsSceneContract forbids small circular globes and requires full-bleed vertical macro zoom for maps', () => {
 assert.match(shortsSceneContract, /NEVER draw a small circular globe/);
 assert.match(shortsSceneContract, /macro zoom/i);
 assert.match(shortsDirectorContract, /MAP DISCIPLINE/);
});




test('visual treatment defaults real media to clean and reserves composed treatment for graphics',()=>{
 assert.equal(normalizeVisualTreatment(undefined,'footage'),'clean');
 assert.equal(normalizeVisualTreatment('label','photo'),'label');
 assert.equal(normalizeVisualTreatment('clean','map'),'composed');
 const slot={id:'shot-1',start:0,end:5,narration:'People cross the harbor every morning.'};
 const scene=validateDirection(slot,{id:'shot-1',kind:'video',heading:'Busy harbor',caption:'This must not cover the footage',query:'harbor workers'},'');
 assert.equal(scene.treatment,'clean');
 assert.equal(scene.caption,'');
});

test('visual breathing prevents consecutive composed media and caps decorative overlays',()=>{
 const plan=Array.from({length:10},(_,index)=>({id:`s${index}`,kind:'footage',treatment:'composed',start:index*5,end:index*5+5,heading:'Detail',caption:'More information',location:'Alaska'}));
 const balanced=enforceVisualBreathing(plan,50);
 assert.ok(balanced.filter(scene=>scene.treatment==='clean').length>=7);
 assert.equal(balanced.some((scene,index)=>scene.treatment==='composed'&&balanced[index-1]?.treatment==='composed'),false);
});

test('clean media scene is full bleed and contains no heading or caption',()=>{
 const code=generateCleanMediaSceneCode({treatment:'clean',heading:'Large unnecessary title',caption:'Unnecessary caption',durationInFrames:150,asset:{src:'auto/test/coast.mp4',kind:'video',trimStart:2}});
 assert.match(code,/OffthreadVideo muted/);
 assert.match(code,/objectFit:'cover'/);
 assert.doesNotMatch(code,/Large unnecessary title|Unnecessary caption/);
 assert.doesNotThrow(()=>validateMotionCode(code,{asset:{kind:'video'}}));
 const labeled=generateCleanMediaSceneCode({treatment:'label',location:'Anchorage',durationInFrames:150,asset:{src:'auto/test/coast.jpg',kind:'image'}});
 assert.match(labeled,/Anchorage/);
 assert.doesNotMatch(labeled,/<p|<h[1-6]/);
});


test('label media scene prefers its editorial label and animates it',()=>{
 const code=generateCleanMediaSceneCode({id:'s1',kind:'photo',treatment:'label',label:'Moscow - 1991',heading:'Long planning heading',location:'Moscow',asset:{kind:'image',src:'auto/test.jpg'},start:0,end:5});
 assert.match(code,/Moscow - 1991/);
 assert.doesNotMatch(code,/Long planning heading/);
 assert.match(code,/opacity:interpolate/);
});

test('opening media and every still image receive one concise editorial identification',()=>{
 const plan=[
  {id:'s1',kind:'footage',treatment:'clean',start:0,end:6,heading:'Kaliningrad',location:'Kaliningrad, Russia'},
  {id:'s2',kind:'footage',treatment:'clean',start:6,end:12,heading:'Supporting streets'},
  {id:'s3',kind:'photo',treatment:'clean',start:12,end:18,heading:'Potsdam Conference',location:'Potsdam, 1945'},
  {id:'s4',kind:'footage',treatment:'composed',start:18,end:24,heading:'New statistic'},
  {id:'s5',kind:'footage',treatment:'composed',start:24,end:30,heading:'Explanation continues'}
 ];
 const balanced=enforceVisualBreathing(plan,30);
 assert.equal(balanced[0].treatment,'label');
 assert.equal(balanced[0].label,'Kaliningrad, Russia');
 assert.equal(balanced[1].treatment,'clean');
 assert.equal(balanced[2].treatment,'label');
 assert.equal(balanced[2].label,'Potsdam, 1945');
 assert.equal(balanced[3].treatment,'composed');
 assert.equal(balanced[4].treatment,'clean');
});
