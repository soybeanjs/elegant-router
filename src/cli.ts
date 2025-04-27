#!/usr/bin/env node
import cac from 'cac';
import { loadConfig } from 'unconfig';
import { version } from '../package.json';
import type { AutoRouterOptions, CliOptions } from './types';
import { AutoRouter } from './core';
import { addRouter, removeRouter } from './commands';

type Command = 'gen' | 'add' | 'rm';

type CommandAction<A extends object> = (args?: A) => Promise<void> | void;

type CommandWithAction<A extends object = object> = Record<Command, { desc: string; action: CommandAction<A> }>;

async function setupCli() {
  const { config } = await loadConfig<CliOptions>({
    sources: [
      {
        files: 'elegant-router.config'
      }
    ]
  });

  const options: AutoRouterOptions = {
    ...config,
    watchFile: false
  };

  const cli = cac('elegant-router');

  cli
    .version(version)
    .option('-g, --gen', 'generate router 【生成路由】')
    .option('-a, --add', 'add router 【新增路由】')
    .option('-r, --rm', 'remove router 【删除路由】')
    .help();
  // .option('-u, --update', 'update router 【更新路由】')
  // .option('-s, --restore', 'restore router 【恢复路由】')

  const commands: CommandWithAction = {
    gen: {
      desc: 'generate router 【生成路由】',
      action: async () => {
        const autoRouter = new AutoRouter(options);

        await autoRouter.generate();
      }
    },
    add: {
      desc: 'add router 【新增路由】',
      action: async () => {
        await addRouter(options);
      }
    },
    rm: {
      desc: 'remove router 【删除路由】',
      action: async () => {
        await removeRouter(options);
      }
    }
    // update: {
    //   desc: 'update router 【更新路由】',
    //   action: async () => {
    //     await updateRouter(config);
    //   }
    // },
    // restore: {
    //   desc: 'restore router 【恢复路由】',
    //   action: async () => {
    //     await restoreRouter(config);
    //   }
    // }
  };

  for (const [command, { desc, action }] of Object.entries(commands)) {
    cli.command(command, desc).action(action);
  }

  cli.parse();
}

setupCli();
