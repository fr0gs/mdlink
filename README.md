# mlink

## Bugs

* Cloning is done asynchronously.
* Look for duplicate modules in config file -> fail. 

## Features

* Support ~ in mlink.config.json
* Add modules one by one. e.g: `mlink a <name> --url <url> --path <path>`. This would modify the mlink.config.json and perform the installing and linking.