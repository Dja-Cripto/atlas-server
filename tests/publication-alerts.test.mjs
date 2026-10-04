import test from 'node:test';
import assert from 'node:assert/strict';
import {publicationAlerts} from '../lib/publishing.mjs';
test('posting alerts identify platform and content, and disappear after reconciliation',()=>{
 const job={id:'job',title:'Ocean',publications:{'youtube:short:2':{status:'error',error:'fetch failed'},'facebook:long':{status:'needs-reschedule'},'youtube:long':{status:'accepted'}}};
 const alerts=publicationAlerts([job]);assert.equal(alerts.length,2);assert.match(alerts[0].message,/Short 2.*YouTube/);assert.match(alerts[1].title,/Facebook/);assert.equal(alerts[0].persistent,true);
 job.publications['youtube:short:2'].status='accepted';job.publications['facebook:long'].status='accepted';assert.deepEqual(publicationAlerts([job]),[]);
});
