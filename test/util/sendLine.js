'use strict';

// Function to send a line to stdin
function sendLine(line, delay = 0) {
    if (!delay) {
        setImmediate(() => process.stdin.emit('data', `${line}\n`));
    } else {
        setTimeout(() => process.stdin.emit('data', `${line}\n`), delay);
    }
}

module.exports = sendLine;
