import { FileStructure } from "../parser/file-structure";

export abstract class BaseConverter {

    constructor() { }

    public abstract convert(fileStructure: FileStructure, getterSetter: boolean, options?: Array<string>): void;

} 
