# mdlink

# Introduction

**mdlink** is a small utility to allow the user to easily `npm link` multiple node modules in a given project. It was born as the response of my annoyance while I was developing **Ember.js** applications with multiple addons at the same time. Per each module you might need to modify you'd need to clone it and link it. This tool intends to provide an easy way of seamlessly bulk `npm link` and removing those links while not necessary.

Modules are specified in the `mdlink.config.json` configuration file. e.g:

```json
{
  "base_modules_path": "/home/user/gits/test",
  "modules": {
    "commander": {
      "url": "https://github.com/tj/commander.js.git",
      "path": "/home/user/gits/test/commander"
    },
    "git-clone": {
      "url": "https://github.com/jaz303/git-clone"
    }
  }
}
```

* *base_modules_path* is the fallback path when no *path* is specified per each module. It means that per each module that doesn't have a *path*, it will be created under that folder.
* *modules* is an object enumerating each one of the modules the user wishes to link. Per each module you can have both *url* & *path* or only *url*.

# Usage

* `$ mdlink <init | i>`: creates a sample config file. Be sure to change it!
* `$ mdlink <start | s>`: runs the tool and performs the linking.
* `$ mdlink <reset | r>`: removes the symlinks locally & globally, and reruns `npm install`.


# Documentation

Documentation is generated running `npm run doc` in html format. After that just browse the **doc/** folder.


## TODO Bugs

* Look for duplicate modules in config file -> fail.

## TODO Features

* Support ~ in mlink.config.json
* Add modules one by one. e.g: `mlink a <name> --url <url> --path <path>`. This would modify the mlink.config.json and perform the installing and linking.
*
