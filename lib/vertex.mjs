import {createPrivateKey,sign,createHash} from 'node:crypto';
const tokens=new Map();
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function vertexFetch(url,options,label){
 let last;
 for(let attempt=0;attempt<2;attempt++){
  try{
   const response=await fetch(url,options);
   if(![429,502,503,504].includes(response.status)||attempt===1)return response;
   last=new Error(`HTTP ${response.status}`);
  }catch(error){last=error;if(error?.name==='TimeoutError'||error?.name==='AbortError')break;}
  await wait(1200);
 }
 const cause=last?.cause?.code||last?.code||last?.message||'falha de rede';
 throw new Error(`${label}: não foi possível conectar ao Google (${cause}). Verifique a internet e se o servidor local está ativo.`);
}
export function validateServiceAccount(value){
 let d;try{d=JSON.parse(value);}catch{throw new Error('O arquivo precisa ser um JSON de conta de serviço válido.');}
 if(d.type!=='service_account'||!/^[-a-z0-9:.]+$/.test(d.project_id||'')||!/^.+@.+\.iam\.gserviceaccount\.com$/.test(d.client_email||'')||typeof d.private_key!=='string')throw new Error('Credencial inválida: use um JSON de conta de serviço do Google Cloud.');
 try{if(createPrivateKey(d.private_key).asymmetricKeyType!=='rsa')throw new Error();}catch{throw new Error('A chave privada da conta de serviço é inválida.');}
 return {type:d.type,project_id:d.project_id,client_email:d.client_email,private_key:d.private_key};
}
export function vertexEndpoint(s,model){
 const project=s.vertexProject,location=s.vertexLocation||'global';
 if(!/^[-a-z0-9:.]+$/.test(project||'')||!/^[-a-z0-9]+$/.test(location)||!/^[-a-zA-Z0-9._]+$/.test(model))throw new Error('Projeto, região ou modelo do Vertex inválido.');
 return `https://${location==='global'?'':location+'-'}aiplatform.googleapis.com/v1/projects/${encodeURIComponent(project)}/locations/${location}/publishers/google/models/${model}:generateContent`;
}
export async function vertexToken(s){
 if(!s.vertexCredentials)throw new Error('Importe o arquivo JSON da conta de serviço em Integrações.');
 const credentials=validateServiceAccount(s.vertexCredentials),id=createHash('sha256').update(s.vertexCredentials).digest('hex');
 const cached=tokens.get(id);if(cached&&cached.expires>Date.now()+60000)return cached.token;
 const now=Math.floor(Date.now()/1000),encode=d=>Buffer.from(JSON.stringify(d)).toString('base64url');
 const input=encode({alg:'RS256',typ:'JWT'})+'.'+encode({iss:credentials.client_email,scope:'https://www.googleapis.com/auth/cloud-platform',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
 const assertion=input+'.'+sign('RSA-SHA256',Buffer.from(input),credentials.private_key).toString('base64url');
 const response=await vertexFetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),signal:AbortSignal.timeout(30000)},'Autenticação Vertex');
 if(!response.ok)throw new Error(`Autenticação Vertex falhou (HTTP ${response.status}). Verifique se a conta de serviço e sua chave estão ativas.`);
 const result=await response.json();if(!result.access_token)throw new Error('Google não retornou o token de acesso.');
 tokens.clear();tokens.set(id,{token:result.access_token,expires:Date.now()+Number(result.expires_in||3600)*1000});return result.access_token;
}
export async function vertexRequest(s,model,body,{timeoutMs=180000}={}){
 const response=await vertexFetch(vertexEndpoint(s,model),{method:'POST',headers:{Authorization:'Bearer '+await vertexToken(s),'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(timeoutMs)},'Vertex AI');
 if(!response.ok){let detail='';try{detail=JSON.stringify(await response.json()).toLowerCase();}catch{}
  if(detail.includes('service_disabled')||detail.includes('has not been used'))throw new Error('Vertex AI API não está habilitada no projeto. Ative a API no Google Cloud.');
  if(detail.includes('billing'))throw new Error('Vertex AI: verifique se o faturamento do projeto está ativo.');
  if(response.status===403)throw new Error('Vertex AI: conta de serviço sem permissão de acesso (HTTP 403). Verifique a função Vertex AI User e as permissões do projeto.');
  if(response.status===404)throw new Error('Vertex AI: modelo não encontrado ou indisponível neste projeto/região (HTTP 404).');
  if(response.status===429)throw new Error('Vertex AI: limite de uso ou capacidade temporariamente indisponível (HTTP 429).');
  throw new Error(`Vertex AI respondeu HTTP ${response.status}. Confira modelo, região e configuração do projeto.`);
 }
 return response.json();
}
