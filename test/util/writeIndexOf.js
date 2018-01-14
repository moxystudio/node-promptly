'use strict';

function writeIndexOf(str) {
    return process.stdout.write.mock.calls.findIndex((args) => args[0] === str);
}

function writeLastIndexOf(str) {
    return process.stdout.write.mock.calls.map((args) => args[0]).lastIndexOf(str);
}

module.exports = {
    writeIndexOf,
    writeLastIndexOf,
};
