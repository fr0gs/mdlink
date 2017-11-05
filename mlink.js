#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');

program
    .version('1.0.0')
    .description("An automatic npm module linker to quickly test & develop multiple modules in a project")
    .parse(process.argv);


function main() {
    fs.readFile('mlink.config.json', 'utf8', (err, data) => {
        if (err) {
            throw new Error("There is no local mlink.json configuration file");    
        } 
        else {
            console.log(data);
        }
    });
}


main()