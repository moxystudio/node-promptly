'use strict';

var readline = require('readline');
var promptly = module.exports;

promptly.prompt = function (message, opts, fn) {
    // Arguments parsing
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
    } else {
        opts = opts || {};
    }

    if (opts.trim === undefined) {
        opts.trim = true;
    }

    // Instantiate node's readline
    var rl = opts.rl;
    if (!rl) {
        rl = opts.rl = readline.createInterface({
            input: opts.input || process.stdin,
            output: opts.output || process.stdout
        });
    }

    // Use readline question
    rl.question(message, function (response) {
        // Trim?
        if (opts.trim) {
            response = response.trim();
        }

        // Mandatory?
        if (opts['default'] === undefined && !response) {
            return promptly.prompt(message, opts, fn);
        } else {
            response = response || opts['default'];
        }

        // Validator verification
        if (opts.validator) {
            if (!Array.isArray(opts.validator)) {
                opts.validator = [opts.validator];
            }

            var x;
            var length = opts.validator.length;

            for (x = 0; x < length; x += 1) {
                try {
                    response = opts.validator[x](response);
                } catch (e) {
                    // Retry automatically if the retry option is enabled
                    if (opts.retry) {
                        return promptly.prompt(message, opts, fn);
                    }

                    rl.close();
                    delete opts.rl;
                    e.retry = promptly.prompt.bind(promptly, message, opts, fn);

                    return fn(e);
                }
            }
        }

        // Everything ok
        rl.close();
        fn(null, response);
    });
};

promptly.password = function () {
    // TODO:
};

promptly.confirm = function (message, opts, fn) {
    // Arguments parsing
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
    } else {
        opts = opts || {};
    }

    opts.validator = opts.validator || [];
    if (!Array.isArray(opts.validator)) {
        opts.validator = [opts.validator];
    }

    // Push the validator that will coerse boolean values
    var validator = function (value) {
        if (typeof value === 'string') {
            value = value.toLowerCase();
        }

        switch (value) {
        case 'y':
        case 'yes':
        case '1':
        case true:
            return true;
        case 'n':
        case 'no':
        case '0':
        case false:
            return false;
        }

        return value;
    };
    opts.validator.push(validator);

    // Use choose with true, false
    promptly.choose(message, [true, false], opts, fn);
};

promptly.choose = function (message, choices, opts, fn) {
    // Arguments parsing
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
    } else {
        opts = opts || {};
    }

    if (opts.retry === undefined) {
        opts.retry = true;
    }
    opts.validator = opts.validator || [];
    if (!Array.isArray(opts.validator)) {
        opts.validator = [opts.validator];
    }

    // Push the choice validator
    var validator = function (value) {
        if (choices.indexOf(value) === -1) {
            throw new Error('Invalid choice: ' + value);
        }

        return value;
    };
    opts.validator.push(validator);

    // Use prompt()
    promptly.prompt(message, opts, fn);
};