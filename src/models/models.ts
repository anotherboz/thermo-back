export interface Therm {
    node: string;
    date: Date;
    value: number;
}

export interface Node {
    id: number;
    nom: string;
    createdAt: Date;
    temperatures: Temperature[];
}

export interface Temperature {
    date: Date;
    value: number;
}

