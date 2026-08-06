import { AiModelOption } from '../types';
import { DEFAULT_SETTINGS_MODEL } from './config';

// Curated list for the model picker. The GREX API's /api/ai/nvidia
// route proxies to whatever models your backend deployment exposes —
// "z-ai/glm-5.2" is the one confirmed by the app spec, the rest are
// common NVIDIA-catalog-style identifiers included as a starting
// point. Add, remove, or rename entries here to match what your own
// backend actually supports; nothing else in the app needs to change.
// The settings screen also lets a person type any model string
// directly, so an out-of-date list here is never a hard blocker.
export const AI_MODELS: AiModelOption[] = [
  {
    id: 'z-ai/glm-5.2',
    label: 'GLM 5.2',
    description: 'Z.ai — general purpose, the app default',
  },
  {
    id: 'meta/llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B',
    description: 'Meta — strong all-round reasoning',
  },
  {
    id: 'qwen/qwen2.5-72b-instruct',
    label: 'Qwen 2.5 72B',
    description: 'Alibaba — multilingual, strong at Arabic',
  },
  {
    id: 'deepseek-ai/deepseek-r1',
    label: 'DeepSeek R1',
    description: 'DeepSeek — deep step-by-step reasoning',
  },
  {
    id: 'mistralai/mixtral-8x22b-instruct-v0.1',
    label: 'Mixtral 8x22B',
    description: 'Mistral AI — fast mixture-of-experts model',
  },
  {
    id: 'google/gemma-3-27b-it',
    label: 'Gemma 3 27B',
    description: 'Google — compact and efficient',
  },
];

export const DEFAULT_MODEL: AiModelOption =
  AI_MODELS.find((m) => m.id === DEFAULT_SETTINGS_MODEL) ?? AI_MODELS[0];

export function findModel(id: string): AiModelOption {
  return (
    AI_MODELS.find((m) => m.id === id) ?? {
      id,
      label: id,
      description: 'Custom model',
    }
  );
}
