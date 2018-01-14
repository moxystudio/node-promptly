'use strict';

const { EOL } = require('os');
const pSeries = require('p-series');
const promptly = require('../index');
const sendLine = require('./util/sendLine');
const { writeIndexOf, writeLastIndexOf } = require('./util/writeIndexOf');

jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

afterEach(jest.clearAllMocks);

it('should be ok on valid choices', async () => {
    const tasks = [
        'YES', 'yes', 'Y', 'y', '1',
        'NO', 'no', 'N', 'n', '0',
    ].map((value) => () => {
        sendLine(value);

        return promptly.confirm('are you ok? ');
    });

    const values = await pSeries(tasks);

    expect(values).toEqual([
        true, true, true, true, true,
        false, false, false, false, false,
    ]);
});

it('should keep asking on invalid choice based on options.retry', async () => {
    // Test if it works correctly if retry is enabled by default
    sendLine('bleh');
    sendLine('yes', 10);

    let value = await promptly.confirm('are you ok? ');

    expect(value).toBe(true);

    expect(process.stdout.write).toHaveBeenCalledWith('are you ok? ');
    expect(process.stdout.write).toHaveBeenCalledWith(`Invalid choice: bleh${EOL}`);
    expect(writeIndexOf('are you ok? ')).not.toBe(writeLastIndexOf('are you ok? '));

    // Test if it works correctly if retry is enabled explicitly
    sendLine('bleh');
    sendLine('yes', 10);

    value = await promptly.confirm('are you ok? ');

    expect(value).toBe(true);

    expect(process.stdout.write).toHaveBeenCalledWith('are you ok? ');
    expect(process.stdout.write).toHaveBeenCalledWith(`Invalid choice: bleh${EOL}`);
    expect(writeIndexOf('are you ok? ')).not.toBe(writeLastIndexOf('are you ok? '));

    // Test if it works correctly if retry is disabled
    sendLine('bleh');

    await expect(promptly.confirm('are you ok? ', { retry: false }))
    .rejects.toMatchObject(new Error('Invalid choice: bleh'));
});

it('should not trim input by default', async () => {
    // Test if it works correctly if trim is disabled by default
    sendLine('yes ');

    await expect(promptly.confirm('are you ok? ', { retry: false }))
    .rejects.toMatchObject(new Error('Invalid choice: yes '));

    // Test if it works correctly if trim is disabled explicitly
    sendLine('yes ');

    await expect(promptly.confirm('are you ok? ', { retry: false, trim: false }))
    .rejects.toMatchObject(new Error('Invalid choice: yes '));

    // Test if it works correctly if trim is enabled
    sendLine('yes ');

    await expect(promptly.confirm('are you ok? ', { trim: true })).resolves.toBe(true);
});

it('should run any additional validators defined in the options.validator', async () => {
    const validator = jest.fn((value) => value);

    sendLine('no');

    const value = await promptly.confirm('are you ok? ', { validator });

    expect(value).toBe(false);
    expect(validator).toHaveBeenCalledTimes(1);
    expect(validator).toHaveBeenCalledWith(false);
});
