import { registerPlugin } from '@capacitor/core';

import type { OpenRouterPlugin } from './definitions';

const OpenRouter = registerPlugin<OpenRouterPlugin>('OpenRouter', {
  web: () => import('./web').then((m) => new m.OpenRouterWeb()),
});

export * from './definitions';
export { OpenRouter };
