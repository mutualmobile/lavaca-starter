Lavaca-starter 2.3.0

[![Build Status](https://travis-ci.org/mutualmobile/lavaca.png?branch=master)](https://travis-ci.org/mutualmobile/lavaca-starter)

This project is a seed for creating a new Lavaca app. It includes a build system and opional integration with Cordova.

[Startup guide](http://getlavaca.com/#/guide#@3)

## Getting Started

__Get the code__
[Download source](https://github.com/mutualmobile/lavaca-starter/archive/master.zip)

__Install Node Packages__
```bash
$ npm install
```
    
__Set Your Path__
```bash
$ source ./set_path.sh
```

4. __Install dev dependencies__
```bash
$ npm install
```

```bash
$ grunt server
```

## Grunt Tasks

Below is a list of grunt tasks to aid development and facilitate deployment. [More on Build Configuration](http://getlavaca.com/#/guide/Build-Configuration#@1)

### Server

A task that simply runs a static server for local development and testing. Defaults to run on `localhost:8080` with `src` being the root directory.

- __Run the default static server__

```bash
$ grunt server
```

### Build

Precompiles LESS and Dust templates, concats and minifies all CSS and JavaScript files, and builds all related files to `www`, `android/assets/www` and `ios/www` directories. 

- __Build with local config__

```bash
$ grunt build
```

- __Build with staging config__ (a copy of the build will be available in `www` folder)

```bash
$ grunt build:staging
```

- __Build with production config__ (a copy of the build will be available in `www` folder)

```bash
$ grunt build:production
```

### Test

Runs unit tests defined in `test/unit` directory with [Jasmine](http://pivotal.github.com/jasmine/) in a headless instance of Webkit using [PhantomJS](http://phantomjs.org/).

- __Run unit tests from `test/unit`__

```bash
$ grunt test
```

### Docs

Generates JavaScript documentation using [yuidoc](https://github.com/gruntjs/grunt-contrib-yuidoc). The resulting documentation is outputed to the `doc` folder.

- __Generate JavaScript Documentation__

```bash
$ grunt yuidoc
```
