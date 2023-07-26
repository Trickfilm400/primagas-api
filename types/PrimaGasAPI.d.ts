import { TokenResponse } from "./LoginFlow";
export declare class PrimaGasAPI {
    username: string;
    password: string;
    customerNumber: string;
    token: TokenResponse;
    private apiConfiguration;
    private api;
    constructor(username: string, password: string, customerNumber: string);
    ensureLoggedIn(): boolean;
    getNewToken(): Promise<TokenResponse>;
    prepareRequestToken(): Promise<true | TokenResponse>;
    tankReadings(): Promise<import("@trickfilm400/shvenergy-api-client").GetAssetsApiV1BusinessUnitsDEPGAccountsCustomerNumberDeliveryPointsCustomerNumberT1AssetsCustomerNumberT1Readings200Response>;
}
