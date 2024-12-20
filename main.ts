#!/usr/bin/env -S deno run -A --env
/// <reference lib="deno.unstable" />

import { App, fsRoutes, staticFiles } from 'fresh';
import { pushPlugin } from '@/lib/push.ts';
import { autoSendFollowUps } from '@/app/follow-up.ts';
import { State } from '@/app/types.ts';
import { stripePlugin } from '@/lib/stripe-plugin.ts';
import { userPlugin } from '@/lib/user-plugin.tsx';
import { adminPlugin } from '@/lib/admin-plugin.ts';
import { manifestPlugin } from '@/lib/manifest-plugin.ts';
import { setProductionMode } from '@/lib/utils.ts';

export const app = new App<State>();

if (import.meta.main) setProductionMode();

// Plugins
autoSendFollowUps(app);
stripePlugin(app);
pushPlugin(app);
userPlugin(app);
manifestPlugin(app);
adminPlugin(app);

app.use(async (ctx) => {
  const res = await ctx.next();
  if (ctx.config.mode == 'development') res.headers.set('Access-Control-Allow-Origin', '*');
  return res;
});

app.use(staticFiles());

await fsRoutes(app, {
  dir: './',
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
});

if (import.meta.main) await app.listen();