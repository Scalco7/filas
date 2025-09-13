import { EIdentifierType } from "../enums/identifier-type.enum";

export interface Person {
    id: string;
    identifier: string;
    identifierType: EIdentifierType;
    age: number
    name?: string;
    timestamp: Date;
    position: number;
}