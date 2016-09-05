'use strict';

const binVersion = require('bin-version');
const pkgConf = require('pkg-conf');
const semver = require('semver');

// Given two specifications, one being a package.json (or its engines field)
// that lists compatibility information via a semver pattern, and another
// being what you know already about the actual engines that are in use,
// testEngine will determine whether your package and the environment
// are compatible. It will fill in the blanks where necessary.
const testEngine = (wanted, known, option) => {
    const config = Object.assign({}, option);

    // When it is necessary to look up the user's package.json on disk,
    // this becomes the path that we will use to start the search.
    let pkgPath;

    // If the user happens to already know the path to their package.json
    // or a reasonable starting place, they may provide it.
    if (typeof wanted === 'string') {
        pkgPath = wanted;
    }

    // If no expectations are provided, we will attempt to retrieve them
    // from the user's package.json - to do so, we first need a place to
    // start the search for that file: the current working directory.
    else if (!wanted) {
        pkgPath = process.cwd();
    }

    const namespace = 'engines';

    return (typeof pkgPath === 'string' ?
            pkgConf(namespace, pkgPath) :
            // If the passed in expectations object has an 'engines' field
            // (like package.json does), then use that. Otherwise, assume
            // the expectations object is itself an 'engines' object.
            Promise.resolve(Object.assign(
                {},
                wanted[namespace] && typeof wanted[namespace] === 'object' ?
                    wanted[namespace] :
                    wanted
            ))
        )
            .then((expected) => {
                const actual = Object.assign({}, known);
                const engine = {
                    actual,
                    expected
                };

                // When nothing is expected, there is no need to continue comparing
                // with the actual situation.
                if (Object.keys(expected).length === 0) {
                    return engine;
                }

                if (expected.node && !actual.node) {
                    actual.node = process.versions.node;
                }

                // At this point, if they either don't care about npm versions or
                // they do, but have already provided it, we are done here.
                if (!expected.npm || actual.npm) {
                    return engine;
                }

                // When the user expects an npm version, but doesn't yet know which
                // is actually in use, we must figure it out for them.
                return binVersion('npm').then((version) => {
                    actual.npm = version;

                    return engine;
                });
            })
            .then((engine) => {
                const { actual, expected } = engine;

                // Determine whether or not semver says the actual version of each engine
                // complies with what is expected.
                if (!config.detail) {
                    return Object.keys(expected).every((key) => {
                        return semver.satisfies(actual[key], expected[key]);
                    });
                }

                // When more detailed info than a simple true/false is desired,
                // return an object of the form:
                // {
                //     allSatisfied : false,
                //     satisfied : {
                //         npm : {
                //             expected  : '>=3.3.4',
                //             actual    : '3.3.5',
                //         }
                //     },
                //     notSatisfied : {
                //         node : {
                //             expected  : '^4.1.2',
                //             actual    : '4.0.0',
                //         }
                //     }
                // }

                const result = {};
                let allSatisfied = true;
                Object.keys(expected).forEach((name) => {
                    const actualVersion = actual[name];
                    const expectedVersion = expected[name];
                    const satisfied = semver.satisfies(
                        actualVersion, expectedVersion
                    );
                    const data = {
                        expected : expectedVersion,
                        actual   : actualVersion
                    };

                    if (satisfied) {
                        if (!result.satisfied) {
                            result.satisfied = {};
                        }
                        result.satisfied[name] = data;
                    }
                    else {
                        if (!result.notSatisfied) {
                            result.notSatisfied = {};
                        }
                        result.notSatisfied[name] = data;
                        // If any engine is bad, flip the switch that informs
                        // the user, so that they don't have to loop through
                        // the result themselves in order to determine that,
                        // which would duplicate some effort.
                        allSatisfied = false;
                    }
                });

                result.allSatisfied = allSatisfied;

                return result;
            });
};

// When no expectations are provided, testEngine() tries to figure them out
// based on the caller's package.json. But since we are an intermediary,
// our own module is the caller. So we forward our caller's path
// with the same logic used by testEngine().
testEngine.assert = (wanted, known, option) => {
    const config = Object.assign({}, option, {
        detail : true
    });

    return testEngine(wanted, known, config)
        .then((engine) => {
            if (engine.allSatisfied) {
                return engine;
            }

            let errMessage = 'Your engines are not compatible:\n';
            const { notSatisfied } = engine;
            Object.keys(notSatisfied).forEach((name) => {
                const { actual, expected } = notSatisfied[name];
                errMessage += `  ${name} ${actual} (expected ${expected})\n`;
            });

            const err = new RangeError(errMessage);
            err.engine = engine;

            throw err;
        });
};

module.exports = testEngine;
