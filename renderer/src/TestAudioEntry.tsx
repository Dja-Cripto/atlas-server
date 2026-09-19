
import React from 'react';
import {AbsoluteFill, Audio, Loop, Composition, registerRoot, staticFile} from 'remotion';

const Video = () => (
  <AbsoluteFill style={{background: '#142d32'}}>
    <Audio src={staticFile("auto/595df191-19a1-40d3-b85b-5ade731c856a/voice.mp3")} />
    <Loop durationInFrames={1800}>
      <Audio src={staticFile("audio/bgm-ambient.mp3")} volume={0.22} />
    </Loop>
  </AbsoluteFill>
);

registerRoot(() => (
  <Composition id="TestAudio" component={Video} durationInFrames={150} fps={30} width={1920} height={1080} />
));
