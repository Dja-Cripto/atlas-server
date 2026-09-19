import "./index.css";
import { Composition } from "remotion";
import { Pilot } from "./Pilot";
import {AutomaticVideo,emptyManifest} from './AutomaticVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="LuxembourgPilot" component={Pilot} durationInFrames={990} fps={30} width={1920} height={1080}/>
      <Composition id="AutomaticVideo" component={AutomaticVideo} defaultProps={{manifest:emptyManifest}} durationInFrames={30} fps={30} width={1920} height={1080} calculateMetadata={({props})=>({durationInFrames:Math.max(1,Math.ceil(props.manifest.duration*30))})}/>
    </>
  );
};
