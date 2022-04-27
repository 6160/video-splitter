const initLogger = (options) => {
    const info = (message) => {
        if (options.debug) {
            process.stdout.write(`${message}\n`);
        }
    };

    const err = (message) => {
        process.stderr.write(`${message}\n`);
    };

    return { info, err };
};

module.exports = { initLogger };
