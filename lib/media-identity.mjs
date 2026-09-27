const display=new Intl.DisplayNames(['en'],{type:'region'});
const countries=[];
for(let a=65;a<=90;a++)for(let b=65;b<=90;b++){
 const code=String.fromCharCode(a,b),name=display.of(code);
 if(name&&name!==code&&!name.startsWith('Unknown Region'))countries.push(name);
}
countries.sort((a,b)=>b.length-a.length);
const aliases={japanese:'Japan',indian:'India',brazilian:'Brazil',french:'France',mongolian:'Mongolia',icelandic:'Iceland',american:'United States',british:'United Kingdom'};
const placeAliases={Japan:['Tokyo','Kyoto','Osaka','Sendai','Shibuya','Shinjuku','Fuji','Hokkaido','Honshu','Tohoku'],Brazil:['São Paulo','Sao Paulo','Rio de Janeiro','Brasília','Brasilia'],France:['Paris','Eiffel','Lyon','Marseille'],Mongolia:['Ulaanbaatar','Ulan Bator'],Iceland:['Reykjavik'],Netherlands:['Maeslantkering','Oosterscheldekering','Rotterdam','Zeeland']};
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const contains=(text,word)=>new RegExp('(^|[^a-z])'+norm(word).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^a-z])').test(norm(text));
export function countryFromTopic(title=''){
 for(const [adjective,country] of Object.entries(aliases))if(contains(title,adjective))return country;
 return countries.find(name=>contains(title,name))||Object.entries(placeAliases).find(([,places])=>places.some(place=>contains(title,place)))?.[0]||'';
}
export function candidateEvidence(candidate){return [candidate.title,candidate.url,candidate.locationEvidence].filter(Boolean).join(' ');}
export function hasCountryEvidence(candidate,country){
 if(!country)return false;
 const evidence=candidateEvidence(candidate);
 return [country,...(placeAliases[country]||[])].some(name=>contains(evidence,name));
}
export function namedPlaceInScene(scene,country){
 const words=[scene.location,scene.heading,scene.narration].filter(Boolean).join(' ');
 return (placeAliases[country]||[]).find(name=>contains(words,name))||'';
}
export function hasEventEvidence(candidate,event){
 if(!event)return true;
 const evidence=candidateEvidence(candidate);
 if(event==='earthquake')return /\b(earthquakes?|quakes?|seismic|tohoku|tsunami)\b/i.test(norm(evidence));
 return contains(evidence,event);
}
export function mediaIdentity(scene,title=''){
 const country=countryFromTopic(title);
 const spoken=[scene.narration,scene.heading,scene.location].filter(Boolean).join(' ');
 const event=/earthquake|quake|seismic/i.test(title)?'earthquake':'';
 const eventRequired=Boolean(event&&/\b(earthquakes?|quakes?|seismic|tohoku|tsunami|2011)\b/i.test(spoken));
 const identityRequired=Boolean(country&&(scene.openingVideoRequired||contains(spoken,country)||scene.location||eventRequired));
 return {topicCountry:country,topicEvent:event,identityRequired,eventRequired,namedPlace:namedPlaceInScene(scene,country),eventYear:eventRequired?spoken.match(/\b(?:19|20)\d{2}\b/)?.[0]||'':''};
}
