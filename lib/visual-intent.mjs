// Decide whether the spoken sentence needs an explanation, never from planning headings.
export function narrationNeedsExplanation(scene){
 const narration=String(scene?.narration||'');
 return /\d|\b(?:hundred|thousand|million|billion|percent|percentage|met(?:er|re)s?|kilomet(?:er|re)s?|feet|inches|miles?|height|taller|tallest|built|constructed|construction|founded|century|centuries|decade|decades|years? old|age|width|length|weighs?|tons?|tonnes?|density|pressure|evaporation|gravity|currents?|mechanism|border crossing|locks?|water level|rises?|lowers?|lifting|diverts?|reroutes?|requires?|forces?|because|therefore|works? by)\b/i.test(narration)||Boolean(scene?.explanationEvidence&&narration.includes(scene.explanationEvidence));
}

export function factualCaption(scene){
 const narration=String(scene?.narration||'').replace(/\s+/g,' ').trim();
 if(scene?.explanationEvidence&&narration.includes(scene.explanationEvidence))return scene.explanationEvidence;
 const sentences=narration.match(/[^.!?]+(?:[.!?]|$)/g)||[];
 return (sentences.find(sentence=>narrationNeedsExplanation({narration:sentence}))||narration).trim();
}
