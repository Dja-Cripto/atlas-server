export function stageTracker(state,log,now=Date.now){
 let current=null,started=0;
 return name=>{
  const timestamp=now();
  if(current){
   const stateValue=typeof state==='function'?state():state;
   state=typeof state==='function'?state:()=>stateValue;
   stateValue.stageTimings=stateValue.stageTimings||{};
   const seconds=Math.round((timestamp-started)/100)/10;
   stateValue.stageTimings[current]=Math.round(((stateValue.stageTimings[current]||0)+seconds)*10)/10;
   log(`Tempo da etapa ${current}: ${seconds}s.`);
  }
  current=name;started=timestamp;
 };
}
