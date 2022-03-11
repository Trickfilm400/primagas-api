export interface Rechnung<D extends number | string> {
    Rechnungsnummer: number;
    //in €
    Betrag: number;
    Datum: D;
}

export type RechnungsDaten<D extends number | string> = Rechnung<D>[];
