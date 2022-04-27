/* eslint-disable no-param-reassign */
const fs = require('fs');

// utility for checking nicely if folder exist
const checkFolder = (folderName) => {
    let isThere;

    try {
        isThere = fs.statSync(folderName);
    } catch (e) {
        isThere = false;
    }

    return isThere;
};
const createFolder = (folderName) => {
    fs.mkdirSync(`./${folderName}`);
};

const deleteFolder = (folderName) => {
    fs.rmdirSync(folderName, { recursive: true });
};

const getConfig = (filename) => {
    const configRaw = fs.readFileSync(`./${filename}`);
    const configJSON = JSON.parse(configRaw);

    return configJSON;
};

const writeFile = (filename, data) => {
    fs.writeFileSync(filename, data);
};

const shuffle = (a) => {
    // const a = [...input];
    let j; let x; let
        i;
    for (i = a.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
};

module.exports = {
    checkFolder, getConfig, createFolder, deleteFolder, writeFile, shuffle,
};
