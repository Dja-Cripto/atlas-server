import {AbsoluteFill,Img,OffthreadVideo,interpolate,staticFile,useCurrentFrame} from 'remotion';
import type {FC} from 'react';
import {ContextMap} from './ContextMap';

type Asset={src:string;kind:string;trimStart?:number};
type Scene={map?:any;asset?:Asset;durationInFrames?:number};

export const SceneBackdrop:FC<{scene:Scene;backgroundScene?:Scene|null;duration:number}>=({scene,backgroundScene,duration})=>{
 const frame=useCurrentFrame();
 if(scene.map)return <ContextMap map={scene.map} duration={duration}/>;
 const asset=backgroundScene?.asset || scene?.asset;
 if(!asset || !asset.src || asset.kind==='video'){
  const drift=interpolate(frame,[0,Math.max(1,duration)],[-3,3],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <AbsoluteFill
    style={{
      overflow: "hidden",
      background: "linear-gradient(135deg,#163d3a 0%,#31584d 48%,#b88a50 140%)",
    }}
  >
   <AbsoluteFill
     style={{
       opacity: 0.22,
       transform: `translateX(${drift}%) scale(1.08)`,

       backgroundImage:
         "radial-gradient(circle at 25% 35%,rgba(255,255,255,.3) 0 1px,transparent 2px), radial-gradient(circle at 72% 66%,rgba(255,255,255,.18) 0 1px,transparent 2px)",

       backgroundSize: "68px 68px, 92px 92px",
       translate: "-27.1px 0px",
     }}
   />
  </AbsoluteFill>;
 }
 const scale=interpolate(frame,[0,Math.max(1,duration)],[1.04,1.1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const style={width:'100%',height:'100%',objectFit:'cover' as const,filter:'blur(12px) brightness(.48) saturate(.78)',scale};
 return <AbsoluteFill style={{overflow:'hidden',backgroundColor:'#17221f'}}>
  <Img src={staticFile(asset.src)} style={style}/> 
  <AbsoluteFill style={{background:'linear-gradient(120deg,rgba(5,16,14,.30),rgba(8,18,17,.62))'}}/>
 </AbsoluteFill>;
};
