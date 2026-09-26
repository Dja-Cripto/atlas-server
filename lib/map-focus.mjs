// Curated coordinates from public primary sources. Add a place only after verifying
// its identity and location; an unlocated small place is better shown with footage.
const entries=[{
 aliases:['ilha da queimada grande','queimada grande','snake island','forbidden brazilian island'],
 country:'brazil',
 point:{lon:-46.6868,lat:-24.4611,label:'ILHA DA QUEIMADA GRANDE',source:'https://www.gov.br/icmbio/pt-br/assuntos/biodiversidade/unidade-de-conservacao/unidades-de-biomas/marinho/lista-de-ucs/apa-de-cananeia-iguape-peruibe/arquivos/plano_de_manejo_apa_cananeia_iguape_peruibe.pdf'}
}];
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const smallPlace=/\b(island|islands|ilha|ilhas|islet|lake|lagoon|volcano|mountain|city|town|village|strait)\b/i;
export function needsPreciseMapFocus(scene,title=''){
 return smallPlace.test(normalize([title,scene?.heading,scene?.narration,scene?.location,scene?.mapIntent].join(' ')));
}
export function verifiedMapFocus(scene,title=''){
 const haystack=normalize([title,scene?.heading,scene?.narration,scene?.location].join(' '));
 const countries=(scene?.countries||[]).map(normalize);
 const entry=entries.find(item=>countries.includes(item.country)&&item.aliases.some(alias=>haystack.includes(alias)));
 return entry?{...entry.point}:null;
}
