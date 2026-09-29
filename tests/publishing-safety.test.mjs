import test from 'node:test';
import assert from 'node:assert/strict';
import {descriptionWithoutLinks,buildPublicationPlan,dispatchPublicationQueue} from '../lib/publishing.mjs';

test('publication removes web links while keeping source names',()=>{
 const description=descriptionWithoutLinks('Story\n\n📚 SOURCES:\nhttps://vertexaisearch.cloud.google.com/redirect/abc\nhttps://www.bbc.com/news/example\nwww.nhk.or.jp/news/example\n\n#Japan');
 assert.equal(/https?:\/\/|www\./.test(description),false);
 assert.match(description,/Sources: bbc\.com/);
 assert.match(description,/nhk\.or\.jp/);
 assert.doesNotMatch(description,/vertexaisearch/);
});

test('queue refuses public mode for scheduled uploads',async()=>{
 const settings={publishingEnabled:true,publishingYouTube:true,publishingFacebook:false,youtubePublishMode:'public'};
 const store={settings:()=>settings,list:()=>[],put:()=>{}};
 await assert.rejects(dispatchPublicationQueue({store,scheduleSettings:{timezone:'America/New_York'}}),/modo agendado/);
});

test('unknown upload error is not retried blindly',async()=>{
 const settings={publishingEnabled:true,publishingYouTube:true,publishingFacebook:false,youtubePublishMode:'scheduled'};
 const job={id:'x',title:'x',scheduled:{longVideo:{date:'2026-10-01',time:'13:00'}},renders:[{url:'/a.mp4'}],publications:{'youtube:long':{status:'error',error:'Network timed out after upload',attempts:1,attemptedAt:'2026-09-28T00:00:00Z'}}};
 const store={settings:()=>settings,list:()=>[job],put:()=>{}};let calls=0;
 const result=await dispatchPublicationQueue({store,scheduleSettings:{timezone:'America/New_York'},fetchImpl:()=>{calls++;}});
 assert.equal(result.attempted,0);assert.equal(calls,0);
});
