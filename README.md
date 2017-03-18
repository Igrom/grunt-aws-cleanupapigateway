# grunt-aws-cleanupapigateway

> Grunt plugin to remove deprecated stages from API Gateway.

## Features
  - Removes deprecated stages and deployments.
  - Very simple to configure and execute.

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-aws-cleanupapigateway --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-aws-cleanupapigateway');
```

## The "cleanup_api" task

### Overview
In your project's Gruntfile, add a section named `cleanup_api` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  cleanup_api: {
    your_target: {
      restApiId: "555-a1b2c3d4",
      validStages: ["master", "v0"]
    },
  },
})
```

### Target parameters

#### target.restApiId
Type: `String`

Required. Specifies the id of the API to be cleaned.

#### target.validStages
Type: `Object`

Required. Lists stages which should be preserved in API Gateway. All other stages will be removed, whereas the list of deployments will be trimmed to include only the active ones.

## Case study

Suppose that the development of a project consists of forking the master branch, modifying code and launching a test AWS environment to assert functionality, then merging back into master.

After several such rounds, the REST API will accumulate a number of stages and deployments, many of which have no further use.

In order to automate cleanups, one could transform a list of repository branches into a list of valid stages, invoke a grunt task with it passed as a command-line parameter and configure the "cleanup_api" task with it.

```bash
STAGES=`git branch -a | grep remote | sed 's/ //g' | sed 's/->.*//g' | sed 's/^.*\///g'`
grunt clean-up-my-api --stages="$STAGES"
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

### 1.0.2

Added README.md.

### 1.0.0

Initial release.

## License
Copyright (c) 2016 Igor Sowiński. Licensed under the MIT license.
