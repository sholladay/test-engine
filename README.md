# test-engine [![Build status for test-engine on Circle CI.](https://img.shields.io/circleci/project/sholladay/test-engine/master.svg "Circle Build Status")](https://circleci.com/gh/sholladay/test-engine "Test Engine Builds")

> Demand a Node or npm version to run your app.

## Why?

 - [Fail fast](https://en.wikipedia.org/wiki/Fail-fast) with a friendly message.
 - Get [semver](http://semver.org "The semantic versioning specification.") satisfaction between the expected and actual versions.
 - Provide expected versions at runtime or via [package.json](https://docs.npmjs.com/files/package.json "Documentation for what the package.json file is all about.").
 - Provide actual versions at runtime, if you know them already.

## Install

```sh
npm install test-engine --save
```

## Usage

Get it into your program.

```js
const testEngine = require('test-engine');
```

Ask whether the current Node and/or npm in use are acceptable based on the [`engines`](https://docs.npmjs.com/files/package.json "Documentation for package.json and its engines field.") in your package.json.

```js
testEngine().then((satisfied) => {
    if (!satisfied) {
        console.error('Hey Jane! Update your Node.');
    }
});
```

If you want to override the expectations of your package.json, you can.

```js
testEngine({ npm : '2.x' }).then((satisfied) => {
    // true if on any version of npm 2
    console.log(satisfied);
});
```

If you happen to know the user's engines, you may provide them. This is particularly
good for npm, because its version must be determined via the filesystem.

```js
testEngine({ npm : '2.x' }, { npm : '3.0.0' })
    .then((satisfied) => {
        console.log(satisfied);  // => false
    });
```

Ask for a more detailed report.

```js
testEngine(null, null, { detail : true })
    .then(console.log);
    // {
    //     allSatisfied : true,
    //     satisfied : {
    //         npm : { actual : '4.0.0', expected : '>=4' }
    //     }
    // }
```

You can register a handler that will only run when the user has compatible engines.
If they do not match according to semver, the promise will be rejected.

```js
testEngine.assert().then(() => {
    // Do anything. User is gauranteed to have compatible engines.
    console.log('Hey Jane! You are good to go.');
});
```

## API

### testEngine(wanted, known, option)

Returns a `Promise` for a report of whether the `known` engines [satisfy](https://github.com/npm/node-semver#ranges) the `wanted` engines.

### testEngine.detail(wanted, known)

Same as `testEngine()` with the `detail` option set to true.

### testEngine.assert(wanted, known)

Returns a `Promise` for a detailed report asserting that the `wanted` engines are satisfied. If they are not, the promise is rejected with an error whose `engine` field has the report.

#### wanted

Type: `string` or `object`<br>
Default: `process.cwd()`

A path to start a [find-up](https://github.com/sindresorhus/find-up) search for a package.json with an `engines` field. Or an explicit object of the same form as the `engines` field.

#### known

Type: `object`

An object of key/value pairs for engine names and their respective versions to compare against `wanted`. Fields for `node` and `npm` will be filled in if necessary according to the engines in `wanted`. However, they can be provided here as overrides.

#### option

Type: `object`

Settings for how to report the result.

##### detail

Type: `boolean`<br>
Default: `false`

Report the result as an object with individual fields for each engine rather than a simple boolean.

Example:

```js
{
    allSatisfied : false,
    satisfied : {
        npm : { actual : '4.0.0', expected : '>=4' }
    },
    notSatisfied : {
        node : { actual : '7.0.0', expected : '>=8' }
    }
}
```

## Contributing

See our [contributing guidelines](https://github.com/sholladay/test-engine/blob/master/CONTRIBUTING.md "The guidelines for participating in this project.") for more details.

1. [Fork it](https://github.com/sholladay/test-engine/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/test-engine/compare "Submit code to this project for review.").

## License

[MPL-2.0](https://github.com/sholladay/test-engine/blob/master/LICENSE "The license for test-engine.") © [Seth Holladay](http://seth-holladay.com "Author of test-engine.")

Go make something, dang it.
