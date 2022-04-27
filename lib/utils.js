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

module.exports = {
    checkFolder, getConfig, createFolder, deleteFolder, writeFile,
};
