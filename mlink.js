#!/usr/bin/env node

'use strict';

const program = require('commander');
const fs = require('fs');
const paths = require('global-paths');

const NPM_GLOBAL_PATH = "/usr/lib/node_modules";


function readConfigFile() {
    return JSON.parse(fs.readFileSync('mlink.config.json', 'utf8'));
}

function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}


program
    .version('1.0.0')
    .description("An automatic npm module linker to quickly test & develop multiple modules in a project")

program
    .command("start")
    .alias("s")
    .description("Read the config file and perform the linking")
    .action(() => {
        const uid = parseInt(process.env.SUDO_UID);
        if (uid) linkModules(readConfigFile());
        else console.error("ERROR: Run mlink as root");
    })

program
    .command("reset")
    .alias("r")
    .description("Remove all the links created by mlink and reinstall packages using npm")
    .action(() => {
        const uid = parseInt(process.env.SUDO_UID);
        if (uid) removeLinks(readConfigFile());
        else console.error("ERROR: Run mlink as root");
    })

program.parse(process.argv);


function removeLinks(modules={}) {

}

function linkModules(modules={}) {
    if (isEmptyObject(modules)) {
        throw new Error("The mlink.config.json file is empty")
    }
    else {
        if (paths().indexOf(NPM_GLOBAL_PATH) != -1) {
            Object.keys(modules).forEach((module) => {
                fs.symlinkSync(modules[module].path, `${NPM_GLOBAL_PATH}/${module}`);
            });
        }
        else throw new Error("/usr/lib/node_modules does not exist");
    }
}