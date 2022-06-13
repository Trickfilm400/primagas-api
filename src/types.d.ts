import { AxiosResponse, AxiosResponseHeaders } from "axios";

//region interfaces
//
export interface Rechnung<D extends number | string> {
    Rechnungsnummer: number;
    Betrag: number;
    Datum: D;
}
export declare type RechnungsDaten<D extends number | string> = Rechnung<D>[];
//
export interface StammDaten {
    kundenNr: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumbers: {
        private: string;
        business: string;
        mobile: string;
        fax: string;
    };
    Lieferadresse: {
        salutation: string;
        firstName: string;
        lastName: string;
        street: string;
        zipCode: string;
        city: string;
    };
    Rechnungsadresse: {
        salutation: string;
        firstName: string;
        lastName: string;
        street: string;
        zipCode: string;
        city: string;
    };
    contractdate: string | number;
    contracttype: string;
}
//
export interface TankDaten {
    tankSize_KG: number;
    currentFillLevel: number;
    tankColor: string;
    calculated_currentFillLevel_KG: number;
    calculated_maxFillLevel_KG: number;
    AufstellungsPruefung: string | number;
    AeusserePruefung: {
        last: string | number;
        next: string | number;
    };
    InnerePruefung: {
        last: string | number;
        next: string | number;
    };
}
//
//endregion


declare type DateFormatType = "timestamp" | "string";
declare type DateType<B> = B extends 'timestamp' ? number : string;
export default class PrimaGasClient<B extends DateFormatType> {
    private readonly username;
    private readonly password;
    private readonly dateFormat;
    /**
     *
     * @param username - Username for Web-Portal
     * @param password - Password for Web-Portal
     * @param dateFormat - dates as string ("14.03.2022") or as UTC timestamp: (1366848000)
     */
    constructor(username: string, password: string, dateFormat: B);
    private round;
    private params;
    private static dateToTimestamp;
    /**
     * fetch cookies
     */
    private login;
    private fetchUrlAfterLogin;
    tankDaten(): Promise<TankDaten>;
    rechnungsDaten(): Promise<RechnungsDaten<DateType<B>>>;
    stammDaten(): Promise<StammDaten>;
}
export {};

