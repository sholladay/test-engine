import os from 'os';
import test from 'ava';
import semver from 'semver';
import testEngine from './';

test('is supported', async (t) => {
    const isSupported = await testEngine();
    t.is(typeof isSupported, 'boolean');
    t.true(isSupported);
    await t.notThrows(testEngine.assert());
});

test('detailed report', async (t) => {
    const engine = await testEngine.detail();
    t.truthy(engine);
    t.is(typeof engine, 'object');
    const ownProps = Object.getOwnPropertyNames(engine);
    t.is(ownProps.length, 2);
    t.true(ownProps.includes('allSatisfied'));
    t.true(ownProps.includes('satisfied'));
    t.deepEqual(ownProps, [
        'allSatisfied',
        'satisfied'
    ]);
    t.true(engine.allSatisfied);
    t.false('notSatisfied' in engine);
    const { satisfied } = engine;
    t.truthy(satisfied);
    t.is(typeof satisfied, 'object');
    t.true(Object.prototype.hasOwnProperty.call(satisfied, 'node'));
    t.truthy(satisfied.node);
    t.is(typeof satisfied.node, 'object');
    t.truthy(satisfied.node.actual);
    t.is(typeof satisfied.node.actual, 'string');
    t.truthy(satisfied.node.expected);
    t.is(typeof satisfied.node.expected, 'string');
    t.true(semver.satisfies(satisfied.node.actual, satisfied.node.expected));
});

test('custom cwd', async (t) => {
    const nonPkgDir = os.tmpdir();
    const isSupported = await testEngine(nonPkgDir, {
        node : '0.0.1',
        npm  : '0.0.1'
    });
    t.true(isSupported);

    const engine = await testEngine.detail(nonPkgDir, {
        node : '0.0.1',
        npm  : '0.0.1'
    });
    t.truthy(engine);
    t.is(typeof engine, 'object');
    t.true(engine.allSatisfied);
    t.deepEqual(engine, {
        allSatisfied : true
    });
});

test('.assert() returns report if supported', async (t) => {
    const engine = await t.notThrows(testEngine.assert());
    t.truthy(engine);
    t.is(typeof engine, 'object');
    t.true(engine.allSatisfied);
    t.false('notSatisfied' in engine);
});

test('.assert() throws if unsupported', async (t) => {
    const err = await t.throws(testEngine.assert(null, { node : '0.10.0' }), RangeError);
    t.truthy(err.engine);
    t.is(typeof err.engine, 'object');
    t.true(Object.prototype.hasOwnProperty.call(err, 'engine'));
    t.false(err.engine.allSatisfied);
    t.false('satisfied' in err.engine);
});
