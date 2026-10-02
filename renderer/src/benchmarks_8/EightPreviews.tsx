import React from 'react';
import Scene_1_Artico_GLM from './Scene_1_Artico_GLM';
import Scene_2_Artico_KimiCode from './Scene_2_Artico_KimiCode';
import Scene_3_Artico_QwenPlus from './Scene_3_Artico_QwenPlus';
import Scene_4_Artico_DeepSeek from './Scene_4_Artico_DeepSeek';
import Scene_5_Gargantas_GLM from './Scene_5_Gargantas_GLM';
import Scene_6_Gargantas_KimiCode from './Scene_6_Gargantas_KimiCode';
import Scene_7_Gargantas_QwenPlus from './Scene_7_Gargantas_QwenPlus';
import Scene_8_Gargantas_DeepSeek from './Scene_8_Gargantas_DeepSeek';

const defaultProps = {
  scene: { fps: 30, durationInFrames: 180 },
  context: {}
};

export const ArticoGLMPreview: React.FC = () => <Scene_1_Artico_GLM {...defaultProps} />;
export const ArticoKimiCodePreview: React.FC = () => <Scene_2_Artico_KimiCode {...defaultProps} />;
export const ArticoQwenPlusPreview: React.FC = () => <Scene_3_Artico_QwenPlus {...defaultProps} />;
export const ArticoDeepSeekPreview: React.FC = () => <Scene_4_Artico_DeepSeek {...defaultProps} />;

export const GargantasGLMPreview: React.FC = () => <Scene_5_Gargantas_GLM {...defaultProps} />;
export const GargantasKimiCodePreview: React.FC = () => <Scene_6_Gargantas_KimiCode {...defaultProps} />;
export const GargantasQwenPlusPreview: React.FC = () => <Scene_7_Gargantas_QwenPlus {...defaultProps} />;
export const GargantasDeepSeekPreview: React.FC = () => <Scene_8_Gargantas_DeepSeek {...defaultProps} />;
