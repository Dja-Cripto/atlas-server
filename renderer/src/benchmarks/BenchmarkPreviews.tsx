import React from 'react';
import SceneGLMFlash from './Scene_1_GLM_Flash';
import SceneGPT6Luna from './Scene_2_GPT_6_Luna';
import SceneKimiCode from './Scene_3_Kimi_Code';

const defaultSceneProps = {
  scene: { fps: 30, durationInFrames: 180 },
  context: {}
};

export const BenchmarkGLMFlashPreview: React.FC = () => {
  return <SceneGLMFlash {...defaultSceneProps} />;
};

export const BenchmarkGPT6LunaPreview: React.FC = () => {
  return <SceneGPT6Luna {...defaultSceneProps} />;
};

export const BenchmarkKimiCodePreview: React.FC = () => {
  return <SceneKimiCode {...defaultSceneProps} />;
};
