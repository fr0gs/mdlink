#!/usr/bin/env node

'use strict';

const program = require('commander');
const fs = require('fs');
const process = require('process');
const paths = require('global-paths');

const NPM_GLOBAL_PATH = "/usr/lib/node_modules";
const PROJECT_PATH = process.cwd();


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
    if (isEmptyObject(modules)) {
        throw new Error("The mlink.config.json file is empty")
    }
    if (paths().indexOf(NPM_GLOBAL_PATH) != -1) {
        Object.keys(modules).forEach((module) => {
            const global_module_path = `${NPM_GLOBAL_PATH}/${module}`;
            const local_module_path = `${PROJECT_PATH}/node_modules/${module}`;
            const repo_module_path = `${modules[module].path}`

            if (fs.existsSync(local_module_path)) {
                const stats = fs.lstatSync(local_module_path);
                if (stats.isSymbolicLink()) {
                    console.log(`[+] Remove local link from ${local_module_path} -> ${global_module_path}`);
                    fs.unlinkSync(local_module_path);
                }
            }

            if (fs.existsSync(global_module_path)) {
                console.log(`[+] Remove global link from ${global_module_path} -> ${repo_module_path}`);
                fs.unlink(global_module_path);
            }
        });
    }
    else throw new Error("/usr/lib/node_modules does not exist");    
}

function linkModules(modules={}) {
    if (isEmptyObject(modules)) {
        throw new Error("The mlink.config.json file is empty")
    }
    else {
        if (paths().indexOf(NPM_GLOBAL_PATH) != -1) {
            Object.keys(modules).forEach((module) => {
                const global_module_path = `${NPM_GLOBAL_PATH}/${module}`;
                const local_module_path = `${PROJECT_PATH }/node_modules/${module}`;
                const repo_module_path = `${modules[module].path}`;

                if (fs.existsSync(local_module_path)) {
                    console.log(`[+] Path ${local_module_path} already exists, removing it.`);
                    fs.unlink(local_module_path);
                }
                console.log(`[+] Create link from ${global_module_path} -> ${repo_module_path}`);
                fs.symlinkSync(repo_module_path, global_module_path);
                console.log(`[+] Create link from ${local_module_path} -> ${global_module_path}`);
                fs.symlinkSync(global_module_path, local_module_path);
            });
        }
        else throw new Error("/usr/lib/node_modules does not exist");
    }
}