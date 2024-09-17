const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const breakpointsPath = path.join(__dirname, '../styles/breakpoints.css');
const breakpointsCode = fs.readFileSync(breakpointsPath, 'utf8');
const args = process.argv.slice(2);

const injectBreakpointsIntoFile = (file) => {
    try {
        const fileContent = fs.readFileSync(file, 'utf8');

        if (fileContent.includes(breakpointsCode.trim())) {
            console.log(`Skipped: Breakpoints already exist in ${file}`);
        } else {
            fs.appendFileSync(file, `\n\n/* Breakpoints */\n${breakpointsCode}`);
            console.log(`Injected breakpoints into ${file}`);
        }
    } catch (error) {
        if (error.code === 'EACCES') {
            console.error(`Permission denied: Cannot access ${file}`);
        } else {
            console.error(`Error processing file ${file}:`, error);
        }
    }
};

const processPath = (inputPath) => {
    try {
        if (fs.lstatSync(inputPath).isDirectory()) {
            glob(path.join(inputPath, '**/*.css'), (err, files) => {
                if (err) {
                    console.error(`Error finding CSS files in ${inputPath}:`, err);
                    return;
                }

                if (files.length === 0) {
                    console.log(`No CSS files found in the directory ${inputPath}`);
                    return;
                }

                files.forEach(injectBreakpointsIntoFile);
            });
        } else if (path.extname(inputPath) === '.css') {
            injectBreakpointsIntoFile(inputPath);
        } else {
            console.log(`${inputPath} is not a valid CSS file or directory`);
        }
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log(`No such file or directory: ${inputPath}`);
        } else if (e.code === 'EACCES') {
            console.log(`Permission denied: Cannot access ${inputPath}`);
        } else {
            console.error(`Error processing path ${inputPath}:`, e);
        }
    }
};

if (args.length === 0) {
    console.log("Please provide a file or directory as an argument.");
    process.exit(1);
}

args.forEach(processPath);
