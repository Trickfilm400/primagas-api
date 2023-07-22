import {TankDaten} from "./interfaces/TankDaten.js";
import {RechnungsDaten} from "./interfaces/RechnungsDaten.js";
import {StammDaten} from "./interfaces/StammDaten.js";
import {LoginFlow, TokenResponse} from "./LoginFlow.js";
import {PrimaGasAPI} from "./PrimaGasAPI.js";

type DateFormatType = "timestamp" | "object";
type DateType<B> = B extends 'timestamp' ? number : Date;

export default class PrimaGasClient<B extends DateFormatType> {
    private readonly username: string;
    private readonly password: string;
    private readonly dateFormat: DateFormatType;
    private readonly customerNumber: string;
    private api: PrimaGasAPI;

    /**
     *
     * @param username - Username for Web-Portal
     * @param password - Password for Web-Portal
     * @param customerNumber
     * @param dateFormat - dates as string ("14.03.2022") or as UTC timestamp: (1366848000)
     */
    constructor(username: string, password: string, customerNumber: string, dateFormat: B) {
        this.username = username;
        this.password = password;
        this.customerNumber = customerNumber;
        this.dateFormat = dateFormat || "object";
        this.api = new PrimaGasAPI(this.username, this.password, this.customerNumber);
    }

    // private round = (r: number) => Math.round((r + Number.EPSILON) * 100) / 100;

    private static getCorrectDate(date: string, dateFormat: DateFormatType) {
        const dateObj = new Date(date);
        // dateObj.setUTCHours(0, 0, 0, 0);
        //check if "14.03.2022" or just "2023"
        // if (date.indexOf(".") !== -1) {
        //     const [day, month, year] = date.split(".");
        //     return Math.floor(dateObj.setUTCFullYear(parseInt(year), parseInt(month), parseInt(day)) / 1000);
        // }
        if (dateFormat === "timestamp") return dateObj.getTime();
        return dateObj
    }

    public tankDaten() {
        return this.api.tankReadings();
        // return new Promise(async (resolve, reject) => {
        //     const data = await this.api.tankReadings();
        //     // data.results = data.results.map(e => {
        //     //     return {
        //     //         ...e,
        //     //         readingDateTime: PrimaGasClient.getCorrectDate(e.readingDateTime, this.dateFormat),
        //     //     }
        //     // })
        //     //console.time("tankDaten");
        //     //return data
        //     resolve(data);
        //     //console.timeEnd("tankDaten");
        // })

    }

    //
    // public rechnungsDaten(): Promise<RechnungsDaten<DateType<B>>> {
    //     return new Promise(async (resolve, reject) => {
    //         await this.checkLoggedInOrCreateToken();
    //         //console.time("rechnungsDaten");
    //         //return data
    //         resolve(void 0);
    //         //console.timeEnd("rechnungsDaten");
    //     })
    // }

    // public stammDaten(): Promise<StammDaten> {
    //     return new Promise(async (resolve, reject) => {
    //         await this.checkLoggedInOrCreateToken();
    //         //console.time("stammDaten");
    //         //parse string into DOM object
    //         // if (this.dateFormat === "timestamp") data.contractdate = PrimaGasClient.dateToTimestamp(data.contractdate as string);
    //         // //return data
    //         // resolve(data);
    //         // //console.timeEnd("stammDaten");
    //     })
    // }
}
