export async function goVision(s, parts, {fetchImpl = fetch} = {}) {
  if (!s.goKey) throw Error('Configure OpenCode para revisão visual.');
  const content = parts.map(p => p.inlineData ? {type:'image_url',image_url:{url:`data:${p.inlineData.mimeType};base64,${p.inlineData.data}`}} : {type:'text',text:p.text || ''});
  const r = await fetchImpl('https://opencode.ai/zen/go/v1/chat/completions', {method:'POST',headers:{Authorization:'Bearer '+s.goKey,'Content-Type':'application/json','User-Agent':'atlas-media-agent/3.0','x-opencode-session':'atlas-visual-review'},body:JSON.stringify({model:s.visualModel || 'deepseek-v4-flash-vision-exp',messages:[{role:'user',content}],max_tokens:2048,temperature:0.1}),signal:AbortSignal.timeout(90000)});
  if (!r.ok) throw Error('OpenCode visual HTTP '+r.status+'; revisão pausada sem fallback pago.');
  const d=await r.json();if(d.error)throw Error('OpenCode visual retornou erro.');
  const text=d.choices?.[0]?.message?.content;
  if(typeof text!=='string'||!text.trim())throw Error('OpenCode visual retornou resposta vazia.');
  return {text,usage:{promptTokenCount:d.usage?.prompt_tokens||0,candidatesTokenCount:d.usage?.completion_tokens||0},provider:'opencode'};
}
