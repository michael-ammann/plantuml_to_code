import fs from "fs";

import { ObjectType, Visibility } from "../enum";
import { FileStructure } from "./file-structure";
import { StructureObject } from "./structure-object";

export class FileParser {

    private lineNr = 1;

    private fileStructure: FileStructure;

    private packagePath: Array<StructureObject>;

    constructor() {
        this.fileStructure = new FileStructure();
        this.packagePath = new Array<StructureObject>();
    }

    parseFile(path: string): FileStructure | null {

        const fileContent = fs.readFileSync(path, 'utf-8');

        fileContent.split(/\r?\n/).forEach(line =>  {
            line = line.trim();

            // splitt line
            let splitedLine = line.split(' ');
            
            if (splitedLine[0] == '') {
                this.lineNr = this.lineNr + 1;
                return;
            }

            if (splitedLine.length == 1) {
                if (splitedLine[0] == '}' && this.packagePath.length > 0) {
                    this.packagePath.pop();
                }
            }

            // add enum entries to enum object
            if (splitedLine.length == 1) {
                let latest = this.getLatestPackagePatObject();
                if (latest) {
                    this.checkForEnumEntry(latest, splitedLine);
                }
            }
            
            let result: StructureObject | null;
            
            // parse class
            if (splitedLine.length > 2 && (splitedLine[2] == '{' || splitedLine[2] == 'implements' || splitedLine[2] == 'extends')) {
                result = this.parseClass(splitedLine);

                if (result != null) {
                    this.packagePath.push(result);

                    this.fileStructure.structure.set(result.identifier, result);
                    this.lineNr = this.lineNr + 1;
                    return;
                }
            }

            // parse property
            if (splitedLine.length == 2) {
                result = this.parseProperty(splitedLine);
                if (result) {
                    let latest = this.getLatestPackagePatObject();
                    if (latest) {
                        this.fileStructure.structure.get(latest.identifier)?.objects.push(result);
                        this.lineNr = this.lineNr + 1;
                    }
                    return;
                }
            }

            // parse method
            if (splitedLine.length > 1) {
                result = this.parseMethod(splitedLine);
                if (result) {
                    let latest = this.getLatestPackagePatObject();
                    if (latest) {
                        this.fileStructure.structure.get(latest.identifier)?.objects.push(result);
                        this.lineNr = this.lineNr + 1;
                    }
                    return;
                }
            }

            this.lineNr = this.lineNr + 1;
        });

        return this.fileStructure;
    }

    private parseClass(line: Array<string>): StructureObject | null {
        const object = new StructureObject();
        object.identifier = this.setVisibilityAndGetFirstEntry(line, object);

        switch(line[0]) {
            case 'package':
                object.objectType = ObjectType.PACKAGE;
                return object;
            case 'class':
                object.objectType = ObjectType.CLASS;
                object.packagePath = this.getPackagePath();
                return object;
            case 'abstract':
                object.objectType = ObjectType.ABSTRACT;
                return object;
            case 'entity':
                object.objectType = ObjectType.ENTITY;
                return object;
            case 'enum':
                object.objectType = ObjectType.ENUM;
                return object;
            case 'interface':
                object.objectType = ObjectType.INTERFACE;
                return object;
        }

        return null;
    }

    private parseProperty(line: Array<string>): StructureObject | null {

        if (line[0].startsWith('@')) {
            return null;
        }

        if (line[1].endsWith('()')) {
            return null;
        }

        const object = new StructureObject();
        const ident = this.setVisibilityAndGetFirstEntry(line, object);

        object.identifier = ident;
        object.objectType = ObjectType.PROPERTY;
        object.retType = line[0].replace('+', '').replace('-', '').replace('#', '');

        return object;
    }

    private parseMethod(line: Array<string>): StructureObject | null {
        const object = new StructureObject();
        this.setVisibilityAndGetFirstEntry(line, object);

        // check if it is a method
        if (!line[1].includes('(')) {
            return null;
        }

        // fix method if splitting was wrong
        const paramSplit = line[1].split('(');
        const methodName = paramSplit[0];
        let params = paramSplit[1] + ' ';

        for (let i = 0; i < line.length; i++) {
            const element = line[i];
            
            if (i > 1) {
                if (i === line.length - 1) {
                    params += `${element}`;
                } else {
                    params += `${element} `;
                }
            }
        }
        
        object.identifier = methodName;
        object.params = params.replace('(', '').replace(')', '');
        object.objectType = ObjectType.METHOD;
        object.retType = line[0].replace('+', '').replace('-', '').replace('#', '');

        return object;
    }

    private setVisibilityAndGetFirstEntry(line: Array<string>, object: StructureObject): string {
        const visibility = line[0].charAt(0);
        let ident = line[1];

        switch(visibility) {
            case '-': 
                object.visibility = Visibility.PRIVATE;
                break;
            case '#':
                object.visibility = Visibility.PROTECTED;
                break;
            case '#':
                object.visibility = Visibility.PUBLIC;
                break;
            default: 
                object.visibility = Visibility.PUBLIC;
                break;
        }

        return ident;
    }

    private checkForEnumEntry(object: StructureObject, line: Array<string>): void {
        if (line[0].startsWith('@') || line[0] == '}') {
            return;
        }
        
        if (object?.objectType == ObjectType.ENUM) {
            let newEnumObj: StructureObject = new StructureObject();
            
            newEnumObj.identifier = line[0];
            newEnumObj.objectType = ObjectType.ENUM_ENTRY;

            this.fileStructure.structure.get(object.identifier)?.objects.push(newEnumObj);
        }
    }

    private getLatestPackagePatObject(): StructureObject | undefined {
        return this.packagePath.at(this.packagePath.length - 1);
    }

    private getPackagePath(): Array<string> {
        let path = new Array<string>();

        this.packagePath.forEach(element => {
            if (element.objectType == ObjectType.PACKAGE) {
                path.push(element.identifier);
            }
        });

        return path;
    }

}