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
    config: {
        min: number;
        max: number;
        redFrom: number;
        redTo: number;
        yellowFrom: number;
        yellowTo: number;
        minorTicks: number
      }
}

export interface Temperature {
    date: Date;
    value: number;
}

