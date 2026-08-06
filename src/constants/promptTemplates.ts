import { PromptTemplate } from '../types';

// Each template only holds an id + icon + i18n keys. The actual
// title/prompt text lives in constants/i18n/{en,ar}.ts under
// `promptTemplates.<id>` so every template is fully bilingual with
// no string duplicated between files.
export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'explain',
    icon: 'bulb-outline',
    titleKey: 'promptTemplates.explain.title',
    promptKey: 'promptTemplates.explain.prompt',
  },
  {
    id: 'debug',
    icon: 'bug-outline',
    titleKey: 'promptTemplates.debug.title',
    promptKey: 'promptTemplates.debug.prompt',
  },
  {
    id: 'write',
    icon: 'create-outline',
    titleKey: 'promptTemplates.write.title',
    promptKey: 'promptTemplates.write.prompt',
  },
  {
    id: 'summarize',
    icon: 'reader-outline',
    titleKey: 'promptTemplates.summarize.title',
    promptKey: 'promptTemplates.summarize.prompt',
  },
  {
    id: 'brainstorm',
    icon: 'sparkles-outline',
    titleKey: 'promptTemplates.brainstorm.title',
    promptKey: 'promptTemplates.brainstorm.prompt',
  },
  {
    id: 'translate',
    icon: 'language-outline',
    titleKey: 'promptTemplates.translate.title',
    promptKey: 'promptTemplates.translate.prompt',
  },
];
