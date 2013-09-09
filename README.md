# grunt-klei-migrate

> A gruntplugin for [klei-migrate](http://github.com/klei-dev/migrate)

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-klei-migrate --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-klei-migrate');
```

## The "klei_migrate" task

### Overview
In your project's Gruntfile, add a section named `klei_migrate` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  klei_migrate: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific options go here.
    },
  },
})
```

### Options

#### options.command
Type: `String`
Default value: `run` or target name (if valid command name)

The `klei-migrate` command to run, valid commands are: `run`, `dry` and `create` (see [klei-migrate](http://github.com/klei-dev/migrate) for more information)

#### options.env
Type: `String`
Default value: process.env.NODE_ENV or `development`

Sets the current environment name.
Can also be provided with `--env` parameter on execution.

#### options.down
Type: `Boolean`
Default value: `false`

Specifies that the migration direction should be `down`.
Can also be provided with `--down` parameter on execution.

#### options.up
Type: `Boolean`
Default value: `true`

Specifies that the migration direction should be `up`.
Can also be provided with `--up` parameter on execution.

#### options.template
Type: `String`
Default value: `NULL`

If provided sets the template path for the template to use when creating new migrations.
Can also be provided with `--template` parameter on execution.

#### options.limit
Type: `Number`
Default value: `0`

Limit the number of migrations to run.
Can also be provided with `--limit` parameter on execution.

#### options.timeout
Type: `Number`
Default value: `30`

Limit max execution time, for each migration, in seconds.
Can also be provided with `--timeout` parameter on execution.

### Usage Examples

#### Simple configuration

With the following task configuration you can use the klei-migrate commands: `run`, `dry` and `create`.

```js
grunt.initConfig({
  klei_migrate: {
    run: "",
    create: "",
    dry: ""
  },
})
```

**To run all migrations:**

```bash
$ grunt klei_migrate:run

# or

$ grunt klei_migrate:run --down  # to migrate down
```

**To create a new migration:**

```bash
$ grunt klei_migrate:create

# or

$ grunt klei_migrate:create:"My new migration"  # to name the migration "My new migration"
```

**To show what can be migrated:**

```bash
$ grunt klei_migrate:dry

# or

$ grunt klei_migrate:dry --down  # to show what can be migrated down
```

#### Another example configuration

This configuration:

```js
grunt.initConfig({
  klei_migrate: {
    run: "",
    create: {
      options: {
        template: '<your template dir>/<your migration template>'
      }
    },
    dry: "",
    next: {
      options: {
        command: 'run',
        limit: 1
      }
    },
    revert: {
      options: {
        command: 'run',
        limit: 1,
        down: true
      }
    }
  },
})
```

Gives you two handy commands `next` and `revert` which migrates the next migration and reverts the previously run migration, respectively. Usage:

```bash
$ grunt klei_migrate:next

# and

$ grunt klei_migrate:revert
```
