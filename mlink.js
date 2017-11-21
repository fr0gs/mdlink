#!/usr/bin/env node

'use strict';

const program = require('commander');
const path = require('path');
const fs = require('fs');
const process = require('process');
const exec = require('child_process').exec;
const linker = require('./linker.js');
const util = require('./mlink-util.js');


const PROJECT_PATH = process.cwd();

program
    .version('1.0.0')
    .description("An automatic npm module linker to quickly test & develop multiple modules in a project");

program
    .command("init")
    .alias("i")
    .description("Create the a mlink.config.json skeleton file")
    .action(() => linker.createInitConfig());

program
    .command("start")
    .alias("s")
    .description("Read the config file and perform the linking")
    .action(() => {
        exec("npm config get prefix", (error, stdout, stderr) => {
            let npm_global_prefix = stdout.trim();
            linker.linkModules(util.readConfigFile(), npm_global_prefix, PROJECT_PATH);
        });
    });

program
    .command("reset")
    .alias("r")
    .description("Remove all the links created by mlink and reinstall packages using npm")
    .action(() => {
        exec("npm config get prefix", (error, stdout, stderr) => {
            let npm_global_prefix = stdout.trim();
            linker.removeLinks(util.readConfigFile(), npm_global_prefix, PROJECT_PATH);
        });
    });

program.parse(process.argv);

