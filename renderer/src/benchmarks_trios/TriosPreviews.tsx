import React from 'react';
import Scene_1_Marianas_GLM from './Scene_1_Marianas_GLM';
import Scene_2_Marianas_Luna from './Scene_2_Marianas_Luna';
import Scene_3_Marianas_Qwen from './Scene_3_Marianas_Qwen';
import Scene_4_Malacca_GLM from './Scene_4_Malacca_GLM';
import Scene_5_Malacca_Luna from './Scene_5_Malacca_Luna';
import Scene_6_Malacca_Qwen from './Scene_6_Malacca_Qwen';
import Scene_7_GreenWall_GLM from './Scene_7_GreenWall_GLM';
import Scene_8_GreenWall_Luna from './Scene_8_GreenWall_Luna';
import Scene_9_GreenWall_Qwen from './Scene_9_GreenWall_Qwen';

const defaultProps = {
  scene: { fps: 30, durationInFrames: 180 },
  context: {}
};

export const MarianasGLMPreview: React.FC = () => <Scene_1_Marianas_GLM {...defaultProps} />;
export const MarianasLunaPreview: React.FC = () => <Scene_2_Marianas_Luna {...defaultProps} />;
export const MarianasQwenPreview: React.FC = () => <Scene_3_Marianas_Qwen {...defaultProps} />;

export const MalaccaGLMPreview: React.FC = () => <Scene_4_Malacca_GLM {...defaultProps} />;
export const MalaccaLunaPreview: React.FC = () => <Scene_5_Malacca_Luna {...defaultProps} />;
export const MalaccaQwenPreview: React.FC = () => <Scene_6_Malacca_Qwen {...defaultProps} />;

export const GreenWallGLMPreview: React.FC = () => <Scene_7_GreenWall_GLM {...defaultProps} />;
export const GreenWallLunaPreview: React.FC = () => <Scene_8_GreenWall_Luna {...defaultProps} />;
export const GreenWallQwenPreview: React.FC = () => <Scene_9_GreenWall_Qwen {...defaultProps} />;
