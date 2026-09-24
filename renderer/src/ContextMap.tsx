import React,{useEffect,useMemo,useState} from 'react';
import {AbsoluteFill,continueRender,delayRender,cancelRender,staticFile,useCurrentFrame,useVideoConfig,interpolate,Easing} from 'remotion';
import {geoMercator,geoPath,geoCentroid,geoBounds} from 'd3-geo';
import type {FeatureCollection} from 'geojson';
export const ContextMap:React.FC<{map:FeatureCollection & {atlasRoute?:{from:number;to:number}|null};duration:number}>=({map,duration})=>{
 const f=useCurrentFrame();const {width,height}=useVideoConfig();const portrait=height>width;const [world,setWorld]=useState<FeatureCollection|null>(null);const [handle]=useState(()=>delayRender('Loading geographic basemap'));
 useEffect(()=>{let live=true;fetch(staticFile('auto/world-background.json')).then(r=>{if(!r.ok)throw Error('Geographic basemap unavailable');return r.json();}).then(data=>{if(live){setWorld(data);continueRender(handle);}}).catch(cancelRender);return()=>{live=false;};},[handle]);
  const geometry=useMemo(()=>{
   const fit=geoMercator().fitExtent([[portrait?100:240,portrait?420:190],[width-(portrait?100:240),height-(portrait?400:200)]],map),center=fit.invert!([width/2,height/2])!,scale=Math.min(30000,fit.scale()),projection=geoMercator().center(center).scale(scale).translate([width/2,height/2]),path=geoPath(projection);
   const focus=map.features.map(feature=>({path:path(feature)||'',point:projection(geoCentroid(feature))!,name:String(feature.properties?.name||''),focal:Boolean(feature.properties?.focal)}));
   let route=null;
   if(map.atlasRoute&&focus[map.atlasRoute.from]&&focus[map.atlasRoute.to]){
    const p1=focus[map.atlasRoute.from].point,p2=focus[map.atlasRoute.to].point;
    const mx=(p1[0]+p2[0])/2,my=Math.min(p1[1],p2[1])-Math.abs(p2[0]-p1[0])*.22-30;
    route={d:`M ${p1[0]} ${p1[1]} Q ${mx} ${my} ${p2[0]} ${p2[1]}`,p1,p2,mx,my};
   }
   const [[west,south],[east,north]]=geoBounds(map);
   const canCrop=Number.isFinite(west)&&Number.isFinite(east)&&east>=west;
   const lonPad=Math.max(8,(east-west)*.8),latPad=Math.max(6,(north-south)*.8);
   const nearby=(world?.features||[]).filter(feature=>{
    if(!canCrop)return true;
    const [[w,s],[e,n]]=geoBounds(feature);
    return e>=west-lonPad&&w<=east+lonPad&&n>=south-latPad&&s<=north+latPad;
   });
   return {worldPaths:nearby.map(feature=>path(feature)||''),focus,route};
  },[map,world,width,height,portrait]);
  const p=interpolate(f,[0,Math.max(45,duration*.8)],[0,1],{extrapolateRight:'clamp',easing:Easing.out(Easing.quad)}),zoom=.94+.06*p;
  return <AbsoluteFill style={{background:'#0c1922',overflow:'hidden'}}>
   <svg width={width} height={height}>
    <defs>
     <pattern id="map-grid" width="96" height="96" patternUnits="userSpaceOnUse">
      <path d="M96 0H0V96" fill="none" stroke="#68938a" strokeWidth={1} opacity=".07"/>
     </pattern>
    </defs>
    <rect width={width} height={height} fill="url(#map-grid)"/>
    <g transform={`translate(${width/2} ${height/2}) scale(${zoom}) translate(${-width/2} ${-height/2})`}>
     {geometry.worldPaths.map((d,i)=><path key={`w-${i}`} d={d} fill="#182b35" stroke="#2a424e" strokeWidth={1}/>)}
     {geometry.focus.map((feature,i)=><path key={'country-'+i} d={feature.path} fill={feature.focal?'#d49a42':'#2a5a54'} fillOpacity={.8} stroke={feature.focal?'#ffd485':'#52b2a4'} strokeWidth={2}/>)}
     {geometry.route&&(()=>{
      const rProgress=interpolate(f,[0,Math.max(1,Math.min(65,duration*.75))],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
      const t=rProgress;
      const px=(1-t)*(1-t)*geometry.route.p1[0]+2*(1-t)*t*geometry.route.mx+t*t*geometry.route.p2[0];
      const py=(1-t)*(1-t)*geometry.route.p1[1]+2*(1-t)*t*geometry.route.my+t*t*geometry.route.p2[1];
      return <g opacity={rProgress>0?1:0}>
       <path d={geometry.route.d} fill="none" stroke="rgba(212,154,66,0.3)" strokeWidth={3} strokeDasharray="6 6"/>
       <path d={geometry.route.d} fill="none" stroke="#ffd485" strokeWidth={3.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1-rProgress} strokeLinecap="round"/>
       <circle cx={px} cy={py} r={6} fill="#ffd485"/>
       <circle cx={px} cy={py} r={14} fill="#ffd485" fillOpacity={.25}/>
      </g>;
     })()}
     {geometry.focus.map((feature,i)=>{
      const pt=feature.point,fade=interpolate(f,[10+i*6,28+i*6],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
      return <g key={`f-${i}`}>

       <g opacity={fade}>
        <circle cx={pt[0]} cy={pt[1]} r={8} fill={feature.focal?'#ffd485':'#52b2a4'} fillOpacity={.35}/>
        <circle cx={pt[0]} cy={pt[1]} r={3.5} fill="#fff"/>
        <text x={pt[0]} y={pt[1]-18} fill="#ffffff" stroke="#0c1922" strokeWidth={5} paintOrder="stroke" textAnchor="middle" fontSize={portrait?42:26} fontWeight={700} letterSpacing={2} style={{fontFamily:'"Helvetica Neue", Arial, sans-serif'}}>{feature.name.toUpperCase()}</text>
       </g>
      </g>;
     })}
    </g>
   </svg>
   <div style={{position:'absolute',left:portrait?65:80,bottom:portrait?240:35,color:'rgba(217,238,228,0.7)',fontSize:portrait?23:17,letterSpacing:1}}>Natural Earth · {geometry.route ? 'Schematic connection, not an actual travel path' : 'Geographic boundaries'}</div>
  </AbsoluteFill>;
};
