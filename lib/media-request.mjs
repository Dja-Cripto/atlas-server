import {setTimeout as sleep} from 'node:timers/promises';

// Bounded retries respect the provider's cooldown; never rotate hosts to evade limits.
export async function mediaRequest(url,options={},deps={}){
 const request=deps.fetch||fetch,wait=deps.sleep||sleep,now=deps.now||Date.now;
 for(let attempt=0;attempt<4;attempt++){
  const response=await request(url,{...options,signal:AbortSignal.timeout(90000)});
  if(![429,502,503,504].includes(response.status))return response;
  const retry=response.headers.get('retry-after');
  const requested=retry===null?0:/^\d+$/.test(retry)?Number(retry)*1000:Math.max(0,Date.parse(retry)-now())||0;
  const delay=Math.max(requested,5000*2**attempt);
  await response.body?.cancel();
  if(attempt===3||delay>60000){const error=new Error(`A fonte ${new URL(url).hostname} está temporariamente limitada (HTTP ${response.status}). Aguarde ${Math.ceil(delay/1000)} segundos e retome; os materiais salvos foram preservados.`);error.code='MEDIA_TEMPORARY';throw error;}
  await wait(delay);
 }
}
