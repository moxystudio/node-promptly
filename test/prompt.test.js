'use strict';

const promptly = require('../index');
const sendLine = require('./util/sendLine');
const { writeIndexOf, writeLastIndexOf } = require('./util/writeIndexOf');

jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

afterEach(jest.clearAllMocks);

it('should prompt the user', async () => {
    sendLine('yeaa');

    const value = await promptly.prompt('prompt: ');

    expect(value).toBe('yeaa');

    expect(process.stdout.write).toHaveBeenCalledWith('prompt: ');
});

it('should keep asking if no value is passed and no default was defined', async () => {
    sendLine(' ');
    sendLine('yeaa', 10);

    const value = await promptly.prompt('prompt: ');

    expect(value).toBe('yeaa');

    expect(process.stdout.write).toHaveBeenCalledWith('prompt: ');
    expect(writeIndexOf('prompt: ')).not.toBe(writeLastIndexOf('prompt: '));
});

it('should assume default value if nothing is passed', async () => {
    sendLine('');

    const value = await promptly.prompt('prompt: ', { default: 'foo' });

    expect(value).toBe('foo');
});

it('should assume default value if a string with spaces is passed', async () => {
    sendLine(' ');

    const value = await promptly.prompt('prompt: ', { default: 'foo' });

    expect(value).toBe('foo');
});

it('should throw if default value is not a string', () => {
    expect(() => promptly.prompt('prompt: ', { default: 1 })).toThrow('The default option value must be a string');
});

it('should trim the user input based on options.trim', async () => {
    // Test if trim is enabled by default
    sendLine(' foo ');

    const value1 = await promptly.prompt('prompt: ');

    // Test if it works correctly when enabled explicitly
    sendLine(' foo ');

    const value2 = await promptly.prompt('prompt: ', { trim: true });

    // Test if it works correctly when disabled
    sendLine(' foo ');

    const value3 = await promptly.prompt('prompt: ', { trim: false });

    expect(value1).toBe('foo');
    expect(value2).toBe('foo');
    expect(value3).toBe(' foo ');
});

it('should call validators (one or multiple)', async () => {
    const validator1 = jest.fn((value) => value);
    const validator2 = jest.fn((value) => value);

    sendLine('yeaa');
    sendLine('foo', 10);

    const value1 = await promptly.prompt('prompt: ', { validator: validator1 });
    const value2 = await promptly.prompt('prompt: ', { validator: [validator1, validator2] });

    expect(value1).toBe('yeaa');
    expect(value2).toBe('foo');
    expect(validator1).toHaveBeenCalledTimes(2);
    expect(validator2).toHaveBeenCalledTimes(1);
});

it('should use validators return value', async () => {
    const validator = jest.fn((value) => Number(value));

    sendLine('1');

    const value = await promptly.prompt('prompt: ', { validator });

    expect(value).toBe(1);
});

it('should automatically prompt again when a validator fails based on options.retry', async () => {
    const validator = jest.fn((value) => {
        if (value !== 'yeaa') {
            throw new Error('bla');
        }

        return value;
    });

    // Test if it works correctly if retry is enabled by default
    sendLine('wtf');
    sendLine('yeaa', 10);

    let value = await promptly.prompt('prompt: ', { validator });

    expect(value).toBe('yeaa');
    expect(validator).toHaveBeenCalledTimes(2);
    expect(writeIndexOf('prompt: ')).not.toBe(writeLastIndexOf('prompt: '));

    // Test if it works correctly when enabled explicitly
    validator.mockClear();
    process.stdout.write.mockClear();
    sendLine('wtf');
    sendLine('yeaa', 10);

    value = await promptly.prompt('prompt: ', { validator, retry: true });

    expect(value).toBe('yeaa');
    expect(validator).toHaveBeenCalledTimes(2);
    expect(writeIndexOf('prompt: ')).not.toBe(writeLastIndexOf('prompt: '));

    // Test if it works correctly when disabled
    validator.mockClear();
    process.stdout.write.mockClear();
    sendLine('wtf');

    await expect(promptly.prompt('prompt: ', { validator, retry: false })).rejects.toMatchObject(new Error('bla'));

    expect(validator).toHaveBeenCalledTimes(1);
    expect(writeIndexOf('prompt: ')).toBe(writeLastIndexOf('prompt: '));
});

it('should call validators only after trimming', async () => {
    const validator = jest.fn((value) => {
        // Test if trimming is done before running validators
        if (value !== 'yeaa') {
            throw new Error('bla');
        }

        return value;
    });

    sendLine(' yeaa ');

    const value = await promptly.prompt('prompt: ', { validator });

    expect(value).toBe('yeaa');
});

it('should write input to stdout based on options.silent', async () => {
    // Test if it works correctly if silent is disabled by default
    sendLine('z');

    await promptly.prompt('prompt: ');

    expect(process.stdout.write).toHaveBeenCalledWith('z');

    process.stdout.write.mockClear();
    sendLine('z');

    // Test if it works correctly if silent is disabled explicitly
    await promptly.prompt('prompt: ', { silent: false });

    expect(process.stdout.write).toHaveBeenCalledWith('z');

    process.stdout.write.mockClear();
    sendLine('zz');

    // Test if it works correctly if silent is enabled
    await promptly.prompt('prompt: ', { silent: true });

    expect(process.stdout.write).not.toHaveBeenCalledWith('z');
});

it('should write input using options.replace to stdout if silent is enabled', async () => {
    // Test if it works correctly if silent is disabled by default
    sendLine('z');

    await promptly.prompt('prompt: ', { silent: true, replace: 'a' });

    expect(process.stdout.write).toHaveBeenCalledWith('a');
    expect(process.stdout.write).not.toHaveBeenCalledWith('z');
});

it('should timeout if user is not fast enough', async () => {
    await expect(promptly.prompt('prompt: ', { timeout: 10 })).rejects.toEqual(new Error('timed out'));
});

it('should take default value if timed out with timeoutToDefault', async () => {
    expect(await promptly.prompt('prompt: ', { timeout: 10, default: 'plop', useDefaultOnTimeout: true })).toEqual('plop');
    expect(await promptly.prompt('prompt: ', { timeout: 10, default: '', useDefaultOnTimeout: true })).toEqual('');
});

it('should take default value if timed out', async () => {
    await expect(promptly.prompt('prompt: ', { timeout: 10, default: 'plop' })).rejects.toEqual(new Error('timed out'));
});

it('should take input value if not timed out', async () => {
    sendLine('plop2', 10);
    expect(await promptly.prompt('prompt: ', { timeout: 20, default: 'plop' })).toEqual('plop2');
});

it('should allow async validator', async () => {
    sendLine('plop');
    expect(await promptly.prompt('prompt: ', { validator: async () => 'fixed' })).toEqual('fixed');
});

it('should allow async validator error', async () => {
    let called = false;
    const validator = async (val) => {
        if (!called) {
            called = true;
            throw new Error('Not valid');
        }

        return val;
    };

    sendLine('plop');
    expect(await promptly.prompt('prompt: ', { default: 'fixed', timeout: 10, useDefaultOnTimeout: true, validator })).toEqual('fixed');
});
