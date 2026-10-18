import { useEffect, useState } from 'react';
import { faceService, type FaceServiceState } from '../face/faceService';

/** 订阅人脸服务状态（摄像头 / 模型 / 识别循环） */
export function useFaceState(): FaceServiceState {
  const [state, setState] = useState<FaceServiceState>(() => faceService.getState());
  useEffect(() => faceService.subscribe(setState), []);
  return state;
}
