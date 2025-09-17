#!/usr/bin/env node
import cac from 'cac';
import { loadConfig } from 'unconfig';
import { version } from '../package.json' with { type: 'json' };
import type { AutoRouterOptions, CliOptions } from './types';
import { AutoRouter } from './core';
import { addReuseRoute, addRoute, deleteRoute, manageBackup, recoveryRoute, updateRoute } from './commands';
import { CONFIG_FILE_SOURCE } from './constants';

type CommandType = 'generate' | 'add' | 'reuse' | 'delete' | 'recovery' | 'update' | 'backup';

type CommandAction<A extends object> = (args?: A) => Promise<void> | void;

type Command<A extends object = object> = Record<
  CommandType,
  { shortcut: string; desc: string; action: CommandAction<A> }
>;

async function setupCli() {
  const { config, sources } = await loadConfig<CliOptions>({
    sources: {
      files: CONFIG_FILE_SOURCE
    }
  });

  const options: AutoRouterOptions = {
    ...config,
    watchFile: false
  };

  const cli = cac('er');

  const commands: Command = {
    generate: {
      shortcut: '-g, --generate',
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
        await addRoute(options);
      }
    },
    reuse: {
      shortcut: '-p, --reuse',
      desc: 'add reuse route 【新增复用路由】',
      action: async () => {
        await addReuseRoute(options, sources[0]);
      }
    },
    delete: {
      shortcut: '-d, --delete',
      desc: 'delete router 【删除路由】',
      action: async () => {
        await deleteRoute(options, sources[0]);
      }
    },
    recovery: {
      shortcut: '-r, --recovery',
      desc: 'recovery router 【恢复路由】',
      action: async () => {
        await recoveryRoute(options);
      }
    },
    update: {
      shortcut: '-u, --update',
      desc: 'update router 【更新路由】',
      action: async () => {
        await updateRoute(options);
      }
    },
    backup: {
      shortcut: '-b, --backup',
      desc: 'manage backup 【管理路由备份】',
      action: async () => {
        await manageBackup(options);
      }
    }
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
