#!/usr/bin/env node

'use strict';

const program = require('commander');
const fs = require('fs');
const process = require('process');
const exec = require('child_process').exec;
const linker = require('./linker.js');
const util = require('./mdlink-util.js');


const PROJECT_PATH = process.cwd();

program
    .version('1.3.5')
    .description("An automatic npm module linker to quickly test & develop multiple modules in a project");

program
    .command("init")
    .alias("i")
    .description("Create the a mdlink.config.json skeleton file")
    .action(() => linker.createInitConfig());

program
    .command("start")
    .alias("s")
    .description("Read the config file and perform the linking")
    .action(() => {
        exec("npm config get prefix", (error, stdout, stderr) => {
            let npm_global_prefix = stdout.trim();
            linker.linkModulesAlt(util.readConfigFile(), npm_global_prefix, PROJECT_PATH);
        });
    });

program
    .command("reset")
    .alias("r")
    .description("Remove all the links created by mdlink and reinstall packages using npm")
    .action(() => {
        exec("npm config get prefix", (error, stdout, stderr) => {
            let npm_global_prefix = stdout.trim();
            linker.removeLinksAlt(util.readConfigFile(), npm_global_prefix, PROJECT_PATH);
        });
    });

program.parse(process.argv);
