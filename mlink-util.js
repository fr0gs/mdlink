'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Reads the mlink configuration file from disk
 * @returns {object} - the parsed object.
 */
function readConfigFile() {
    return JSON.parse(fs.readFileSync('mlink.config.json', 'utf8'));
}

/**
 * Check if the object is empty.
 * @param {object} obj - The object.
 * @returns {boolean}
 */
function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}

/**
 * Delete recursively the folder in path and 
 * its subfolders.
 * @param {string} path 
 */
function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            let curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


/**
 * Creates a directory in the specified path with the
 * intermediate folders if necessary.
 * @param {string} dir the directory path to create. 
 */
function mkdirWithParentsSync(dir) {
    const sep = path.sep;
    const initDir = path.isAbsolute(dir) ? sep : '';
    dir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(parentDir, childDir);
        console.log(`Dir Name: ${curDir}`);
        if (!fs.existsSync(curDir)) {
          console.log('Created');
          fs.mkdirSync(curDir);
        }
        return curDir;
      }, initDir);
}




module.exports = {
    readConfigFile,
    isEmptyObject,
    deleteFolderRecursive,
    mkdirWithParentsSync
}