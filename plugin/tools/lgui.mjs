#!/usr/bin/env node
// LGUI 命令行入口：node <插件目录>/tools/lgui.mjs <命令> [参数] [--json]。全部命令见 lib/cli.mjs。
import {main} from './lib/cli.mjs';

process.exitCode = await main(process.argv.slice(2));
