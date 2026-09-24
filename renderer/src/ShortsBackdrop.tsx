import {AbsoluteFill,Img,OffthreadVideo,interpolate,staticFile,useCurrentFrame} from 'remotion';
import type {FC} from 'react';
import {ContextMap} from './ContextMap';

type Asset={src:string;kind:string;trimStart?:number};
type Scene={map?:any;asset?:Asset;durationInFrames?:number};

export const ShortsBackdrop:FC<{scene:Scene;backgroundScene?:Scene|null;duration:number}>=({scene,backgroundScene,duration})=>{
 const frame=useCurrentFrame();
 if(scene.map)return <ContextMap map={scene.map} duration={duration}/>;
 const asset=backgroundScene?.asset || scene?.asset;
 if(scene.map || !asset || !asset.src){
  const drift=interpolate(frame,[0,Math.max(1,duration)],[-3,3],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <AbsoluteFill
    style={{
      overflow: "hidden",
      background: "linear-gradient(160deg,#163d3a 0%,#31584d 48%,#b88a50 140%)",
    }}
  >
   <AbsoluteFill
     style={{
       opacity: 0.25,
       transform: `translateY(${drift}%) scale(1.08)`,
       backgroundImage:
         "radial-gradient(circle at 25% 25%,rgba(255,255,255,.3) 0 1px,transparent 2px), radial-gradient(circle at 65% 75%,rgba(255,255,255,.18) 0 1px,transparent 2px)",
       backgroundSize: "80px 80px, 120px 120px",
     }}
   />
  </AbsoluteFill>;
 }
 const scale=interpolate(frame,[0,Math.max(1,duration)],[1.04,1.1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const style={width:'100%',height:'100%',objectFit:'cover' as const,filter:'blur(16px) brightness(.45) saturate(.85)',scale};
 return <AbsoluteFill style={{overflow:'hidden',backgroundColor:'#17221f'}}>
  {asset.kind==='video'?<OffthreadVideo muted src={staticFile(asset.src)} startFrom={Math.round((asset.trimStart||0)*30)} style={style}/>:<Img src={staticFile(asset.src)} style={style}/>} 
  <AbsoluteFill style={{background:'linear-gradient(160deg,rgba(5,16,14,.30),rgba(8,18,17,.70))'}}/>
 </AbsoluteFill>;
};
