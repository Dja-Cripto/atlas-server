import React from 'react';
import Scene_1_GLM_Flash from './Scene_1_GLM_Flash';
import Scene_2_GPT_6_Luna from './Scene_2_GPT_6_Luna';
import Scene_3_Kimi_K3 from './Scene_3_Kimi_K3';
import Scene_4_Qwen_Max from './Scene_4_Qwen_Max';

const defaultProps = {
  scene: { fps: 30, durationInFrames: 180 },
  context: {}
};

export const PanamaGLMFlashPreview: React.FC = () => <Scene_1_GLM_Flash {...defaultProps} />;
export const PanamaGPT6LunaPreview: React.FC = () => <Scene_2_GPT_6_Luna {...defaultProps} />;
export const PanamaKimiK3Preview: React.FC = () => <Scene_3_Kimi_K3 {...defaultProps} />;
export const PanamaQwenMaxPreview: React.FC = () => <Scene_4_Qwen_Max {...defaultProps} />;
