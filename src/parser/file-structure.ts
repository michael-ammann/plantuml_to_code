import { StructureObject } from "./structure-object";

export class FileStructure {

    structure: Map<string, StructureObject>;

    constructor() {
        this.structure = new Map<string, StructureObject>();
    }

    addObject(object: StructureObject): void {
        this.structure.set(object.identifier, object);
    }
    
    getObjectByIdentifier(identifier: string): StructureObject | undefined{
        return this.structure.get(identifier);
    }

}