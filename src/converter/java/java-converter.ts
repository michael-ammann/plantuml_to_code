import fs from "fs";
import path from "path";
import { ObjectType } from "../../enum";

import { FileStructure } from "../../parser/file-structure";
import { StructureObject } from "../../parser/structure-object";
import { BaseConverter } from "../baseConverter";

export class JavaConverter implements BaseConverter {
    
    private destPath: string;
    
    private withGs: boolean = false;

    constructor(destPath: string) {
        this.destPath = destPath;
    }
    
    public convert(fileStructure: FileStructure, getterSetter: boolean, options?: Array<string>): void {
        console.log(`Create class files for language "java" to destination path: ${this.destPath}`);
        this.withGs = getterSetter;

        fileStructure.structure.forEach(element => {
            if (element.objectType != ObjectType.ENUM_ENTRY && 
                element.objectType != ObjectType.METHOD && 
                element.objectType != ObjectType.PROPERTY && 
                element.objectType != ObjectType.PACKAGE
            ) {
                this.createClass(element);
            }
        });
    }

    private createClass(classObj: StructureObject): void {
        let fileContent = '';
        let packagePath = classObj.packagePath.join('.');

        fileContent += `package ${packagePath};\n\n`;
        fileContent += `${classObj.visibility} ${classObj.objectType} ${classObj.identifier} {\n`;

        fileContent += this.addContent(classObj);

        fileContent += '}';

        const filename = path.join(this.destPath, classObj.identifier + '.java');

        fs.writeFile(filename, fileContent, function (err) {
            if (err) throw err;
            console.log('Saved!');
        });        

    }

    private addContent(classObj: StructureObject): string {
        
        let propList = '';

        // add properties and methods
        classObj.objects.forEach((element, idx, array) => {

            switch(element.objectType) {
                case ObjectType.METHOD:
                    propList += `\t${element.visibility} ${element.retType} ${element.identifier}(${element.params}) {};\n\n`; 
                    break;
                case ObjectType.PROPERTY:
                    propList += `\t${element.visibility} ${element.retType} ${element.identifier};\n\n`; 
                    break;
                case ObjectType.ENUM_ENTRY:
                    if (idx == 0) {
                        propList += '\t';
                    }
                    
                    propList += element.identifier; 

                    if (idx != array.length -1) {
                        propList += ', ';
                    } else {
                        propList += '\n';
                    }
                    break;
            }
        
        });

        // add getter and setter
        if (this.withGs) {

            classObj.objects.forEach((element) => {

                if(element.objectType == ObjectType.PROPERTY) {

                    // first leter uppercase
                    const methodName = element.identifier.charAt(0).toUpperCase() + element.identifier.slice(1)

                    // create getter
                    propList += `\tpublic ${element.retType} get${methodName}() {\n`; 
                    propList += `\t\treturn ${element.identifier};\n`; 
                    propList += `\t}`; 

                    propList += `\n\n`;

                    // create setter
                    propList += `\tpublic void set${methodName}(${element.retType} ${element.identifier}) {\n`;
                    propList += `\t\tthis.${element.identifier} = ${element.identifier};\n`; 
                    propList += `\t}`;
                    
                    propList += `\n\n`;
                }
                
            });
        }

        return propList;
    }
    
}