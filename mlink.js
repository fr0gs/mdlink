#!/usr/bin/env node

'use strict';

const program = require('commander');
const path = require('path');
const fs = require('fs');
const process = require('process');
const paths = require('global-paths');
const clone = require('git-clone');
const sudo = require('sudo-prompt');
const exec = require('child_process').exec;

const PROJECT_PATH = process.cwd();

let BASE_MODULES_PATH;
let NPM_GLOBAL_PREFIX;

program
    .version('1.0.0')
    .description("An automatic npm module linker to quickly test & develop multiple modules in a project");

program
    .command("init")
    .alias("i")
    .description("Create the a mlink.config.json skeleton file")
    .action(() => createInitConfig());

program
    .command("start")
    .alias("s")
    .description("Read the config file and perform the linking")
    .action(() => {
        exec("npm config get prefix", (error, stdout, stderr) => {
            NPM_GLOBAL_PREFIX = stdout.trim();
            linkModules(readConfigFile(), NPM_GLOBAL_PREFIX);
        });
    });

program
    .command("reset")
    .alias("r")
    .description("Remove all the links created by mlink and reinstall packages using npm")
    .action(() => {
        exec("npm config get prefix", (error, stdout, stderr) => {
            NPM_GLOBAL_PREFIX = stdout.trim();
            removeLinks(readConfigFile(), NPM_GLOBAL_PREFIX);
        });
    });

program.parse(process.argv);


function readConfigFile() {
    return JSON.parse(fs.readFileSync('mlink.config.json', 'utf8'));
}

function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function createInitConfig() {
    let sampleObject = {
        "base_modules_path": "~/gits/test",
        "modules": [
            {
                "mlink": {
                    "url": "https://github.com/fr0gs/mlink",
                    "path": "~/gits/test/mlink"
                }
            }
        ]
    }
    let json = JSON.stringify(sampleObject, null, 2); 
    return fs.writeFileSync('mlink.config.json', json); 
}


function removeLinks(config={}, npm_global_prefix) {
    if (isEmptyObject(config)) {
      throw new Error("The mlink.config.json file is empty");
    }
    const NPM_GLOBAL_PATH = `${npm_global_prefix}/lib/node_modules`;
    BASE_MODULES_PATH = config['base_modules_path'];

    if (paths().indexOf(NPM_GLOBAL_PATH) != -1) {
        const modules = config['modules'];
        Object.keys(modules).forEach((module) => {
            const global_module_path = `${NPM_GLOBAL_PATH}/${module}`;
            const local_module_path = `${PROJECT_PATH}/node_modules/${module}`;
            const repo_module_path = `${modules[module].path}`;

            if (fs.existsSync(local_module_path)) {
                const stats = fs.lstatSync(local_module_path);
                if (stats.isSymbolicLink()) {
                    console.log(`[+] Remove local link from ${local_module_path} -> ${global_module_path}`);
                    fs.unlinkSync(local_module_path);
                }
            }

            if (fs.existsSync(global_module_path)) {
                console.log(`[+] Remove global link from ${global_module_path} -> ${repo_module_path}`);
                sudo.exec(`rm -rf ${global_module_path}`, {}, (err, stdo, stdedd) => { if (err) throw err});
            }
        });
        exec("npm install", (error, stdout, stderr) => {
            if (error) throw new Error('Could not execute npm install')
        });
    }
    else throw new Error(`${npm_global_prefix}/lib/node_modules does not exist`);    
}

function createLink(global, repo, local) {
    console.log(`[+] Create link from ${global} -> ${repo}`);

    // Create the global module -> local repository link.
    // This needs sudo since we are copying files in a
    // sensitive directory.
    sudo.exec(`npm link ${repo}`, {}, (error, stdout, stderr) => {
            if (error) throw error;
        }
    );

    // Create the local node_modules/module -> global module linkModules.
    console.log(`[+] Create link from ${local} -> ${global}`);
    fs.symlinkSync(global, local);
}

function linkModules(config={}, npm_global_prefix) {
    if (isEmptyObject(config)) {
      throw new Error("The mlink.config.json file is empty");
    }
    else {
        const NPM_GLOBAL_PATH = `${npm_global_prefix}/lib/node_modules`;
        BASE_MODULES_PATH = config['base_modules_path'];

        if (paths().indexOf(NPM_GLOBAL_PATH) != -1) {
            const modules = config['modules'];
            Object.keys(modules).forEach((module) => {
                const global_module_path = `${NPM_GLOBAL_PATH}/${module}`;
                const local_module_path = `${PROJECT_PATH }/node_modules/${module}`;
                const repo_module_path = `${modules[module].path}` || undefined;
                const repo_module_url = `${modules[module].url}` || undefined;

                // If ./node_modules/module exists, either normal or symlink, remove it.
                if (fs.existsSync(local_module_path)) {
                    console.log(`[+] Path ${local_module_path} already exists, removing it.`);
                    deleteFolderRecursive(local_module_path);
                }

                // If there is a url specified.
                if (repo_module_url !== null) {
                    // if there is path, clone the url in paths.
                    if (repo_module_path !== null) {
                        //Clone the url in the path.
                        clone(repo_module_url, repo_module_path, () => {
                            console.log(`[+] Successfully cloned ${repo_module_url} in path: ${repo_module_path}`);
                            createLink(global_module_path, repo_module_path, local_module_path);
                            console.log("-------------------------");
                        })
                    }
                    else {
                        if (!fs.existsSync(BASE_MODULES_PATH)) fs.mkdirSync(dir);
                        clone(repo_module_url, path.join(BASE_MODULES_PATH, module), () => {
                            console.log(`[+] Successfully cloned ${repo_module_url}`);
                            createLink(global_module_path, repo_module_path, local_module_path);
                            console.log("-------------------------");
                        })
                    }
                }
                else {
                    if (fs.existsSync(repo_module_path)) {
                        createLink(global_module_path, repo_module_path, local_module_path);
                        console.log("-------------------------");
                    }
                    else throw new Error(`${repo_module_path} does not exist`);
                }
            });
        }
        else throw new Error(`${npm_global_prefix}/lib/node_modules does not exist`);
    }
}
