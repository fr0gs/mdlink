'use strict';

const fs = require('fs');

/**
 * Reads the mlink configuration file from disk
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */
function readConfigFile() {
    return JSON.parse(fs.readFileSync('mlink.config.json', 'utf8'));
}

/**
 * Check if the object is empty.
 * @param {object} object - The object.
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



module.exports = {
    readConfigFile: readConfigFile,
    isEmptyObject: isEmptyObject,
    deleteFolderRecursive: deleteFolderRecursive
}