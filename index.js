const { program } = require('commander');
const { exec } = require('child_process');
const { promisify } = require('util');
const { initLogger } = require('./lib/logger');
const {
    checkFolder, getConfig, createFolder, deleteFolder, writeFile,
} = require('./lib/utils');

// ffmpeg examples:
// ffmpeg -i source-file.foo -ss 0 -t 600 first-10-min.m4v
// ffmpeg -i source.m4v -ss 0 -t 593.3 -c copy part1.m4v

// chunk config example:
// {
//     start: 0,
//     duration: 10,
//     keep: true/false,
// }

program
    .option('-c, --config <config>', 'json config')
    .option('-o, --output <name>', 'output file name')
    .option('-i, --input <inputfile>', 'input file name')
    .option('-d, --debug', 'debug');

program.parse(process.argv);

const options = program.opts();
const logger = initLogger(options);
const execAsync = promisify(exec);

// executes cmds sequentially
const executor = async (...commands) => {
    if (commands.length === 0) {
        return 0;
    }

    const cmd = commands.shift();

    logger.info(`>>> executing ${cmd}`);
    const { stderr } = await execAsync(cmd);

    if (stderr) {
        logger.err(stderr);
    }

    return executor(...commands);
};

// fs functuion to load and parse json config
const loadConfig = (filename) => {
    logger.info('### loadconfig');
    const config = getConfig(filename);

    logger.info(`>>> loaded: \n ${JSON.stringify(config, null, 2)}`);

    return config;
};

// given a chunk and a folder it returns a cmd for splitting
// a video file starting from a timestamp (in second) with a
// specific duration
const ffmpegCut = (chunk, folder) => {
    logger.info('### create ffmpeg cmd');

    const durationParam = chunk.duration === -1 ? '' : `-t ${chunk.duration}`;
    const cmd = `ffmpeg -i ${chunk.inputName} -ss ${chunk.start} ${durationParam} -c copy ${folder}/${chunk.outputName}`;

    return cmd;
};

const ffmpegStitch = (vidList, output) => {
    const cmd = `ffmpeg -f concat -safe 0 -i ${vidList} -c copy ${output}`;
    return cmd;
};

const createVidList = (chunks, folder) => {
    const vidList = chunks.map((chunk) => {
        const path = `${chunk.outputName}`;
        const entry = `file '${path}'`;
        return entry;
    });

    const vidListString = vidList.join('\n');
    const fileName = `${folder}/vidlist.txt`;

    writeFile(fileName, vidListString);

    return fileName;
};

// enrich the chunks with service data
const parseConfig = (config) => {
    logger.info('### parseconfig');

    const parsed = config.map((chunk, index) => {
        if (!chunk.keep) return false;

        const parsedChunk = {
            ...chunk,
            inputName: options.input,
            outputName: `${options.output}_${index}.mp4`,
        };

        return parsedChunk;
    });

    return parsed.filter((el) => !!el);
};

// use it to add cmds you want to execute first
const createPreJobs = () => {
    const cmds = [
    // array of commands
    ];

    return cmds;
};

// use it to add cmds you want to execute at the end
const createPostJobs = (project) => {
    const cmds = [
    // array of commands
    ];

    const stitchCmd = ffmpegStitch(project.vidList, project.output);
    cmds.push(stitchCmd);

    return cmds;
};

// this returns the list of all cmds to execute
const createJobList = (project) => {
    logger.info('### create job list');

    const { chunks, folder } = project;
    const preJobs = createPreJobs(project);
    const postJobs = createPostJobs(project);

    const jobList = chunks.map((chunk) => {
        const cmd = ffmpegCut(chunk, folder);
        return cmd;
    });

    return [...preJobs, ...jobList, ...postJobs];
};

// this creates the project folder and data structures
const prepareProject = (config) => {
    logger.info('### preparing project');

    const projectName = options.output;
    const folderName = `./PRJ.${projectName}`;

    logger.info('>>> check if folder exist');
    const isThere = checkFolder(folderName);

    if (isThere) {
        logger.info('>>>> removing folder');
        deleteFolder(folderName);
    }

    logger.info('>>> making folder');
    createFolder(folderName);
    const vidList = createVidList(config, folderName);
    logger.err(vidList);
    const project = {
        name: projectName,
        folder: folderName,
        output: `${folderName}/${projectName}.mp4`,
        chunks: config,
        vidList,
    };

    return project;
};

const init = () => {
    logger.info('### init');
    const configRaw = loadConfig(options.config);
    const config = parseConfig(configRaw);

    return config;
};

const main = async () => {
    logger.info('## hello.');
    const config = init();

    const project = prepareProject(config);
    const jobs = createJobList(project);

    jobs.forEach((job) => logger.info(job));

    await executor(...jobs);
};

(async () => {
    await main();
})();
