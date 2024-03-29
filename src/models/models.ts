export interface Therm {
    node: string;
    date: Date;
    value: number;
}

export interface Config {
    min: number;
    max: number;
    redFrom: number;
    redTo: number;
    yellowFrom: number;
    yellowTo: number;
    minorTicks: number
}

export interface Node {
    id: number;
    nom: string;
    createdAt: Date;
    temperatures: Temperature[];
    config: Config
}

export interface Temperature {
    date: Date;
    value: number;
}

export interface User {
    id: number;
    mail: string;
    limit: string;
    nodeIds: number[];
}

