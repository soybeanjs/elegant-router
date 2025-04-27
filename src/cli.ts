#!/usr/bin/env node
import cac from 'cac';
import { loadConfig } from 'unconfig';
import { version } from '../package.json';
import type { AutoRouterOptions, CliOptions } from './types';
import { AutoRouter } from './core';
import { addRouter, removeRouter } from './commands';

type CommandType = 'gen' | 'add' | 'rm';

type CommandAction<A extends object> = (args?: A) => Promise<void> | void;

type Command<A extends object = object> = Record<
  CommandType,
  { shortcut: string; desc: string; action: CommandAction<A> }
>;

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

  const cli = cac('er');

  const commands: Command = {
    gen: {
      shortcut: '-g, --gen',
      desc: 'generate router 【生成路由】',
      action: async () => {
        const autoRouter = new AutoRouter(options);
        await autoRouter.generate();
      }
    },
    add: {
      shortcut: '-a, --add',
      desc: 'add router 【新增路由】',
      action: async () => {
        await addRouter(options);
      }
    },
    rm: {
      shortcut: '-r, --rm',
      desc: 'remove router 【删除路由】',
      action: async () => {
        await removeRouter(options);
      }
    }
    // update: {
    //   shortcut: '-u, --up',
    //   desc: 'update router 【更新路由】',
    //   action: async () => {
    //     await updateRouter(config);
    //   }
    // },
    // restore: {
    //   shortcut: '-s, --re',
    //   desc: 'restore router 【恢复路由】',
    //   action: async () => {
    //     await restoreRouter(config);
    //   }
    // }
  };

  for (const [command, { desc, action }] of Object.entries(commands)) {
    cli.command(command, desc).action(action);
  }

  Object.values(commands).forEach(({ shortcut, desc }) => {
    cli.option(shortcut, desc);
  });

  cli.version(version).help();

  const parsed = cli.parse();

  if (!parsed.args.length) {
    const { options: parsedOptions } = parsed;

    const matchedCommand = Object.keys(commands).find(key => parsedOptions[key]) as CommandType | undefined;

    if (matchedCommand) {
      await commands[matchedCommand].action();
    }
  }
}

setupCli();
