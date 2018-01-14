'use strict';

const promptly = require('../index');
const sendLine = require('./util/sendLine');

jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

afterEach(jest.clearAllMocks);

it('should prompt the user silently', async () => {
    sendLine('z');

    const value = await promptly.password('your password: ');

    expect(value).toBe('z');

    expect(process.stdout.write).toHaveBeenCalledWith('your password: ');
    expect(process.stdout.write).not.toHaveBeenCalledWith('*');
    expect(process.stdout.write).not.toHaveBeenCalledWith('z');
});

it('should respect options.replace', async () => {
    sendLine('z');

    const value = await promptly.password('your password: ', { replace: '*' });

    expect(value).toBe('z');

    expect(process.stdout.write).toHaveBeenCalledWith('your password: ');
    expect(process.stdout.write).toHaveBeenCalledWith('*');
    expect(process.stdout.write).not.toHaveBeenCalledWith('z');
});

it('should not trim input by default', async () => {
    // Test if it works correctly if trim is disabled by default
    sendLine('z ');

    await expect(promptly.password('your password: ')).resolves.toBe('z ');

    // Test if it works correctly if trim is disabled explicitly
    sendLine('z ');

    await expect(promptly.password('your password: ', { trim: false })).resolves.toBe('z ');

    // Test if it works correctly if trim is enabled
    sendLine('z ');

    await expect(promptly.password('your password: ', { trim: true })).resolves.toBe('z');
});

it('show allow empty passwords by default', async () => {
    // Test if it works correctly by default
    sendLine('');

    await expect(promptly.password('your password: ')).resolves.toBe('');

    // Test if it works correctly if default is empty explicitly
    sendLine('');

    await expect(promptly.password('your password: ', { default: '' })).resolves.toBe('');

    // Test if it works correctly if empty is undefined
    sendLine('');
    sendLine('z', 10);

    await expect(promptly.password('your password: ', { default: undefined })).resolves.toBe('z');
});
