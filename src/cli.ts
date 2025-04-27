#!/usr/bin/env node
import cac from 'cac';
import { loadConfig } from 'unconfig';
import { version } from '../package.json';

const cli = cac('elegant-router');

cli.version(version);

cli.parse();

async function setupCli() {
  const { config } = await loadConfig({
    sources: [
      {
        files: 'elegant-router.config'
      }
    ]
  });

  console.log(config);
}

setupCli();
