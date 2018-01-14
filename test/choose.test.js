'use strict';

const { EOL } = require('os');
const promptly = require('../index');
const sendLine = require('./util/sendLine');
const { writeIndexOf, writeLastIndexOf } = require('./util/writeIndexOf');

jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

afterEach(jest.clearAllMocks);

it('should be ok on valid choice', async () => {
    sendLine('apple');

    const value = await promptly.choose('apple or orange? ', ['apple', 'orange']);

    expect(value).toBe('apple');
});

it('should keep asking on invalid choice based on options.retry', async () => {
    // Test if it works correctly if retry is enabled by default
    sendLine('bleh');
    sendLine('orange', 10);

    let value = await promptly.choose('apple or orange? ', ['apple', 'orange']);

    expect(value).toBe('orange');

    expect(process.stdout.write).toHaveBeenCalledWith('apple or orange? ');
    expect(process.stdout.write).toHaveBeenCalledWith(`Invalid choice: bleh${EOL}`);
    expect(writeIndexOf('apple or orange? ')).not.toBe(writeLastIndexOf('apple or orange? '));

    // Test if it works correctly if retry is enabled explicitly
    sendLine('bleh');
    sendLine('orange', 10);

    value = await promptly.choose('apple or orange? ', ['apple', 'orange'], { retry: true });

    expect(value).toBe('orange');

    expect(process.stdout.write).toHaveBeenCalledWith('apple or orange? ');
    expect(process.stdout.write).toHaveBeenCalledWith(`Invalid choice: bleh${EOL}`);
    expect(writeIndexOf('apple or orange? ')).not.toBe(writeLastIndexOf('apple or orange? '));

    // Test if it works correctly if retry is disabled
    sendLine('bleh');

    await expect(promptly.choose('apple or orange? ', ['apple', 'orange'], { retry: false }))
    .rejects.toMatchObject(new Error('Invalid choice: bleh'));
});

it('should not trim input by default', async () => {
    // Test if it works correctly if trim is disabled by default
    sendLine('apple ');

    await expect(promptly.choose('apple or orange? ', ['apple', 'orange'], { retry: false }))
    .rejects.toMatchObject(new Error('Invalid choice: apple '));

    // Test if it works correctly if trim is disabled explicitly
    sendLine('apple ');

    await expect(promptly.choose('apple or orange? ', ['apple', 'orange'], { retry: false, trim: false }))
    .rejects.toMatchObject(new Error('Invalid choice: apple '));

    // Test if it works correctly if trim is enabled
    sendLine('apple ');

    await expect(promptly.choose('apple or orange? ', ['apple', 'orange'], { trim: true })).resolves.toBe('apple');
});

it('should loosely compare values when matching against valid choices', async () => {
    sendLine('1');

    const value = await promptly.choose('choices: ', [1, 2, 3]);

    expect(value).toBe(1);
});

it('should run any additional validators defined in the options.validator', async () => {
    const validator = jest.fn((value) => value);

    sendLine('apple');

    const value = await promptly.choose('apple or orange? ', ['apple', 'orange'], { validator });

    expect(value).toBe('apple');
    expect(validator).toHaveBeenCalledTimes(1);
    expect(validator).toHaveBeenCalledWith('apple');
});
