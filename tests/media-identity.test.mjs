import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mediaIdentity,hasCountryEvidence,hasEventEvidence} from '../lib/media-identity.mjs';
import {candidatePool,mediaSearchVariants} from '../lib/auto-media.mjs';
const title='Why Does Japan Have So Many Earthquakes?';
const candidate=(id,title,source='Pexels')=>({id,title,source,url:`https://example.org/${id}`,width:1920,height:1080});
test('opening with missing location searches Japan and rejects generic stock coast',()=>{
 const scene={heading:'Pacific coast',narration:'Off Japan’s Pacific coast, the seafloor moves.',openingVideoRequired:true,kind:'footage'};
 const identity=mediaIdentity(scene,title);
 assert.equal(identity.topicCountry,'Japan');
 assert.equal(identity.identityRequired,true);
 assert.match(mediaSearchVariants({...scene,...identity})[0],/Japan/);
 const pool=candidatePool({...scene,...identity},[candidate(1,'Beautiful beach'),candidate(2,'Tokyo skyline at sunset')]);
 assert.deepEqual(pool.map(item=>item.id),[2]);
 assert.equal(pool[0].representationRole,'exact-location');
});
test('an earthquake claim needs event evidence, and named Sendai stays specific',()=>{
 const scene={heading:'Sendai',narration:'The 2011 Tohoku earthquake struck north past Sendai.',kind:'footage'};
 const identity=mediaIdentity(scene,title);
 assert.equal(identity.eventRequired,true);
 assert.equal(identity.namedPlace,'Sendai');
 const pool=candidatePool({...scene,...identity},[
  candidate(1,'Japan coast'),candidate(2,'2011 Tohoku earthquake damage in Japan','Wikimedia Commons'),
  candidate(3,'2011 Sendai earthquake aftermath in Japan','Wikimedia Commons')
 ]);
 assert.deepEqual(pool.map(item=>item.id),[3]);
 assert.match(mediaSearchVariants({...scene,...identity})[0],/Japan 2011 Tohoku earthquake/);
});
test('generic scenery may use contextual video, while search query alone cannot establish Japan',()=>{
 const scene={heading:'The ocean moves',narration:'Waves travel across the open ocean.',kind:'footage'};
 const identity=mediaIdentity(scene,title);
 const pool=candidatePool({...scene,...identity},[candidate(1,'Open ocean'),candidate(2,'Kyoto streets')]);
 assert.deepEqual(pool.map(item=>item.id),[2]);
 const generic=candidatePool({...scene,...identity},[candidate(1,'Open ocean')]);
 assert.equal(generic[0].representationRole,'contextual');
 assert.equal(hasCountryEvidence({...candidate(3,'Open ocean'),queries:['Japan coastline']},'Japan'),false);
 assert.equal(hasEventEvidence(candidate(4,'2011 Tohoku earthquake aftermath'),'earthquake'),true);
});
