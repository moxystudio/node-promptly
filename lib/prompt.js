'use strict';

const { EOL } = require('os');
const { promisify } = require('util');
const read = promisify(require('read'));

async function prompt(message, options) {
    let value;

    // Read input
    // Manage timeout
    if (options.timeout) {
        let timeout = options.timeout;

        do {
            try {
                // Use read with 1s timeout to be able to update prompt with remaining time if needed
                value = await read({
                    prompt: message.replace(/\{timeout\}/g, timeout),
                    silent: options.silent,
                    replace: options.replace,
                    input: options.input,
                    output: options.output,
                    timeout: 1000,
                });
                timeout = 0;
            } catch (err) {
                if (err.message !== 'timed out') {
                    throw err;
                }
                timeout = timeout - 1;
                if (timeout <= 0) {
                    if (options.default === undefined) {
                        throw new Error('timed out');
                    }
                    value = options.default;
                }
            }
        } while (timeout);
    } else {
        value = await read({
            prompt: message,
            silent: options.silent,
            replace: options.replace,
            input: options.input,
            output: options.output,
        });
    }

    // Trim?
    if (options.trim) {
        value = value.trim();
    }

    // Prompt again if there's no data or use the default value
    if (!value) {
        if (options.default === undefined) {
            return prompt(message, options);
        }

        value = options.default;
    }

    // Validator verification
    try {
        value = options.validator.reduce((value, validator) => validator(value), value);
    } catch (err) {
        // Retry automatically if the retry option is enabled
        if (options.retry) {
            err.message && options.output.write(err.message + EOL);

            return prompt(message, options);
        }

        throw err;
    }

    return value;
}

module.exports = prompt;
