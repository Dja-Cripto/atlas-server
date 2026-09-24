// Conservative fallback for mechanisms explicitly present in this scene's narration.
// Titles alone are not sufficient evidence for a scientific explanation.
export function diagramFallbackCode(scene){
 const narration=String(scene.narration||'');
 const thermal=/\b(metal|iron|steel)\b/i.test(narration)&&/\b(expand\w*|contract\w*|expansion|contraction)\b/i.test(narration)&&/\b(heat\w*|hot|warm\w*|cold|cool\w*|temperature|thermal)\b/i.test(narration);
 const flow=/\b(surface|upper)\b/i.test(narration)&&/\b(deep|lower|bottom)\b/i.test(narration)&&/\b(opposit\w*|return|inflow|outflow)\b/i.test(narration);
 if(!thermal&&!flow)return null;
 const contracts=thermal&&/\b(contract\w*|contraction)\b/i.test(narration)&&!/\b(expand\w*|expansion)\b/i.test(narration);
 const title=thermal?(contracts?'Cooling contracts metal':'Heating expands metal'):'Opposing water flows';
 // A sentence describing both processes needs authored direction, not a guessed one.
 if(thermal&&/\b(contract\w*|contraction)\b/i.test(narration)&&/\b(expand\w*|expansion)\b/i.test(narration))return null;
 return `import React from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig,interpolate} from 'remotion';
export default function MotionScene({scene}:{scene:any}){
 const frame=useCurrentFrame(),{width,height}=useVideoConfig();
 const portrait=height>width;
 const p=interpolate(frame,[0,Math.max(1,scene.durationInFrames-1)],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const energy=${contracts?'1-p':'p'};
 const spacing=width*(.10+.025*energy);
 return <AbsoluteFill style={{background:'#102735',color:'#f4efe3',fontFamily:'Arial,sans-serif',padding:portrait?'260px 70px':'90px 110px',boxSizing:'border-box'}}>
  <div style={{fontSize:portrait?66:60,fontWeight:800,maxWidth:'95%'}}>${title}</div>
  <div style={{fontSize:portrait?32:26,color:'#d4b87d',marginTop:24}}>SCHEMATIC · NOT TO SCALE</div>
  ${thermal?`<div style={{position:'absolute',left:'18%',top:'38%',width:'70%',height:'40%'}}>{Array.from({length:12},(_,i)=><div key={i} style={{position:'absolute',left:(i%4)*spacing,top:Math.floor(i/4)*spacing,width:portrait?46:42,height:portrait?46:42,borderRadius:'50%',background:'#e9b56a',transform:'translate('+(Math.sin(frame*.12+i)*energy*6)+'px,'+(Math.cos(frame*.13+i)*energy*6)+'px)'}}/>)}</div><div style={{position:'absolute',left:'10%',right:'10%',bottom:portrait?'20%':'12%',fontSize:portrait?42:32}}>${contracts?'Less thermal motion · closer together':'More thermal motion · farther apart'}</div>`:`<div style={{position:'absolute',left:'9%',right:'9%',top:'38%',height:'16%',background:'#176485',borderRadius:18,padding:28,boxSizing:'border-box'}}><div style={{fontSize:portrait?42:32}}>SURFACE FLOW</div><div style={{fontSize:100,transform:'translateX('+(p*width*.32)+'px)'}}>→</div></div><div style={{position:'absolute',left:'9%',right:'9%',top:'58%',height:'16%',background:'#725037',borderRadius:18,padding:28,boxSizing:'border-box'}}><div style={{fontSize:portrait?42:32}}>DEEP RETURN</div><div style={{fontSize:100,textAlign:'right',transform:'translateX('+(-p*width*.32)+'px)'}}>←</div></div>`}
 </AbsoluteFill>;
}`;
}
