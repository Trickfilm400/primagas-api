type DateFormatType = "timestamp" | "object";
export default class PrimaGasClient<B extends DateFormatType> {
    private readonly username;
    private readonly password;
    private readonly dateFormat;
    private readonly customerNumber;
    private api;
    /**
     *
     * @param username - Username for Web-Portal
     * @param password - Password for Web-Portal
     * @param customerNumber
     * @param dateFormat - dates as string ("14.03.2022") or as UTC timestamp: (1366848000)
     */
    constructor(username: string, password: string, customerNumber: string, dateFormat: B);
    private static getCorrectDate;
    tankDaten(): Promise<import("@trickfilm400/shvenergy-api-client").GetAssetsApiV1BusinessUnitsDEPGAccountsCustomerNumberDeliveryPointsCustomerNumberT1AssetsCustomerNumberT1Readings200Response>;
}
export {};
