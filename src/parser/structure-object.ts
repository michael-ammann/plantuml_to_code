import { ObjectType, Visibility } from "../enum";

export class StructureObject {

    objectType: ObjectType | null = null;

    retType: string = '';

    identifier: string = '';

    params: string = '';

    packagePath: Array<string> = new Array<string>();

    visibility: Visibility | null = null

    objects: Array<StructureObject> = new Array<StructureObject>();

    constructor() { }

}