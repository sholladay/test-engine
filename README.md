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
    .then((engines) => {
        console.log(engines);
        // {
        //     allSatisfied : false,
        //     satisfied : {
        //         npm : {
        //             expected : '^2.0.0',
        //             actual   : '2.14.2'
        //         }
        //     },
        //     notSatisfied : {
        //         node : {
        //             expected : '>4.2.0',
        //             actual   : '4.0.0'
        //         }
        //     }
        // }
    });
```

You can register a handler that will only run when the user has compatible engines.
If they do not match according to semver, the promise will be rejected.

```js
testEngine.assert().then(() => {
    // Do anything. User is gauranteed to have compatible engines.
    console.log('Hey Jane! You are good to go.');
});
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
