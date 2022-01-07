import path from 'path';
import fs from 'fs';

import { Command } from 'commander';
import { JavaConverter } from './converter/java/java-converter';
import { FileParser } from './parser/file-parser';

// define commands
const program = new Command();

program
    .option('-p --path <type>', 'path to file to convert')
    .option('-o --out <type>', 'path to the destination folder for code files')
    .option('-gs --gettersetter', 'if set, getter and setter will be crated')
    .option('-l --lang <type>', 'language to be used for the classes');

program.parse(process.argv);
const options = program.opts();

if (!options.path || !options.lang) {
    console.error('Language or file path missing!');
    process.exit(1);
}

const fileParser = new FileParser();
const fileStructure = fileParser.parseFile(options.path);

if (!options.out) {
    // use path from source dir
    options.out = path.dirname(options.path);
} else {
    // create folder if not exist
    if (!fs.existsSync(options.out)){
        fs.mkdirSync(options.out);
    }
}

let gettersetter = false;
if (options.gettersetter) {
    gettersetter = true;
}

if (fileStructure) {

    switch(options.lang) {
        case 'java':
            const javaConverter = new JavaConverter(options.out);
                javaConverter.convert(fileStructure, gettersetter);
            break;
        default:
            break;
    }
} else {
    console.error('Error at parsing file structure!');
}
