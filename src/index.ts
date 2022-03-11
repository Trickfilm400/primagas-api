import axios, {AxiosResponse, AxiosResponseHeaders} from "axios";
import {JSDOM} from 'jsdom';
import {TankDaten} from "./interfaces/TankDaten";
import {RechnungsDaten} from "./interfaces/RechnungsDaten";
import {StammDaten} from "./interfaces/StammDaten";

type DateFormatType = "timestamp" | "string";
type DateType<B> = B  extends 'timestamp' ? number : string;

export default class PrimaGasClient<B extends DateFormatType> {
    private readonly username: string;
    private readonly password: string;
    private dateFormat: DateFormatType;

    /**
     *
     * @param username - Username for Web-Portal
     * @param password - Password for Web-Portal
     * @param dateFormat - dates as string ("14.03.2022") or as UTC timestamp: (1366848000)
     */
    constructor(username: string, password: string, dateFormat: B) {
        this.username = username;
        this.password = password;
        this.dateFormat = dateFormat || "string";
    }

    private round = (r: number) => Math.round((r + Number.EPSILON) * 100) / 100;

    private params(ref: string) {
        return new URLSearchParams({
            "rememberme": "0",
            ref: ref,
            login: this.username,
            password: this.password
        });
    }

    private static dateToTimestamp(date: string) {
        const dateObj = new Date();
        dateObj.setUTCHours(0, 0, 0, 0);
        //check if "14.03.2022" or just "2023"
        if (date.indexOf(".") !== -1) {
            const [day, month, year] = date.split(".");
            return Math.floor(dateObj.setUTCFullYear(parseInt(year), parseInt(month), parseInt(day)) / 1000);
        }
        return Math.floor(dateObj.setUTCFullYear(parseInt(date), 0, 1) / 1000);
    }

    /**
     * fetch cookies
     */
    login(ref: string): Promise<AxiosResponseHeaders> {
        return new Promise((resolve, reject) => {
            axios({
                method: "POST",
                url: "https://kunden.primagas.de/login.cfm?eventExtranetLIN=extranetLogin.ValidateLoginFormInput",
                data: this.params(ref),
                maxRedirects: 0,
                validateStatus: (status) => status >= 200 && status < 303
            }).then(res => {
                if (res?.status === 302) {
                    resolve(res.headers);
                } else if (res.status === 200) {
                    //parse string into DOM object
                    const doc = new JSDOM(res.data);
                    //search elements in document
                    const x = doc.window.document.querySelector("#wrapperContent div.SubLine>p");
                    if (x.innerHTML.indexOf("Das angegebene Login und das angegebene Passwort sind uns nicht bekannt"))
                        return reject(new Error("Unauthorized. Invalid Credentials."));
                    if (x.innerHTML.indexOf("Anmeldung fehlgeschlagen")) {
                        return reject(new Error("Unauthorized"));
                    }
                } else reject(new Error("Unexpected Page behavior. (No 302 redirect on login request)"));
            }).catch(reject);
        });
    }

    fetchUrlAfterLogin(ref: string): Promise<AxiosResponse<string>> {
        return new Promise((resolve, reject) => {
            this.login(ref).then(result => {
                return (axios.request<string>({
                    headers: {
                        "cookie": result["set-cookie"].join(";")
                    },
                    //method: "GET",
                    url: result.location,
                    baseURL: "https://kunden.primagas.de"
                }));
            }).then(resolve, reject);
        });
    }

    tankDaten(): Promise<TankDaten> {
        return new Promise((resolve, reject) => {
            //console.time("tankDaten");
            this.fetchUrlAfterLogin("/b2b/meine_daten/tankdaten.cfm").then(res => {
                //parse string into DOM object
                const doc = new JSDOM(res.data);
                //search elements in document
                const x = doc.window.document.querySelectorAll("#wrapperContent div.con30>ul span.output");
                //save data in json
                const u = <TankDaten>{
                    tankSize_KG: parseInt(x.item(0).innerHTML),
                    currentFillLevel: parseInt(x.item(1).innerHTML) / 100,
                    tankColor: x.item(2).innerHTML
                };
                //only 85% of the tank volume will be filled up
                u.calculated_maxFillLevel_KG = u.tankSize_KG * 0.85;
                u.calculated_currentFillLevel_KG = this.round(u.calculated_maxFillLevel_KG * u.currentFillLevel);

                //TANK PRÜFUNGEN
                const y = doc.window.document.querySelectorAll("#wrapperContent div.con>div.element .dl30 .red");
                //Aufstellungsprüfung
                u.AufstellungsPruefung = y.item(0).innerHTML.trim();
                //Äußere Prüfung
                u.AeusserePruefung = {
                    last: y.item(1).innerHTML.trim(),
                    next: y.item(2).innerHTML.trim()
                };
                //Innere Prüfung
                u.InnerePruefung = {
                    last: y.item(3).innerHTML.trim(),
                    next: y.item(4).innerHTML.trim()
                };
                if (this.dateFormat === "timestamp") {
                    u.AufstellungsPruefung = PrimaGasClient.dateToTimestamp(u.AufstellungsPruefung as string);
                    u.AeusserePruefung.last = PrimaGasClient.dateToTimestamp(u.AeusserePruefung.last as string);
                    u.AeusserePruefung.next = PrimaGasClient.dateToTimestamp(u.AeusserePruefung.next as string);
                    u.InnerePruefung.last = PrimaGasClient.dateToTimestamp(u.InnerePruefung.last as string);
                    u.InnerePruefung.next = PrimaGasClient.dateToTimestamp(u.InnerePruefung.next as string);
                }

                //return data
                resolve(u);
                //console.timeEnd("tankDaten");
            }).catch(reject);
        });
    }

    rechnungsDaten(): Promise<RechnungsDaten<DateType<B>>> {
        return new Promise((resolve, reject) => {
            //console.time("rechnungsDaten");
            this.fetchUrlAfterLogin("/b2b/meine_daten/rechnungen.cfm").then(res => {
                //parse string into DOM object
                const doc = new JSDOM(res.data);
                //search elements in document
                const x = doc.window.document.querySelectorAll("#wrapperContent div.con > div.elemente > div.accordion > div.accContent > div.con > ol");
                //save data in json
                let data: RechnungsDaten<DateType<B>> = [];
                x.forEach(el => {
                    const Rechnungsnummer = parseInt(el.children.item(0).innerHTML.split(":")[1]);
                    const Betrag = parseFloat(el.children.item(1).innerHTML.split(":")[1].replace(/,/g, "."));
                    let Datum = el.children.item(2).innerHTML.split(":")[1].trim();
                    let result: DateType<B> = (this.dateFormat === 'timestamp' ? PrimaGasClient.dateToTimestamp(Datum) : Datum) as DateType<B>

                    data.push({
                        Rechnungsnummer,
                        Betrag,
                        Datum: result
                    });
                });
                //return data
                resolve(data);
                //console.timeEnd("rechnungsDaten");
            }).catch(reject);
        });
    }

    stammDaten(): Promise<StammDaten> {
        return new Promise((resolve, reject) => {
            //console.time("stammDaten");
            this.fetchUrlAfterLogin("/b2b/meine_daten/stammdaten.cfm").then(res => {
                //parse string into DOM object
                const doc = new JSDOM(res.data);
                //search elements in document
                const KundenNr = doc.window.document.getElementById("kunden_nr");
                const email = doc.window.document.getElementById("email");
                const firstname = doc.window.document.getElementById("firstname");
                const surname = doc.window.document.getElementById("surname");
                const phonenumber_private = doc.window.document.getElementById("phonenumber_private");
                const phonenumber_business = doc.window.document.getElementById("phonenumber_business");
                const phonenumber_mobile = doc.window.document.getElementById("phonenumber_mobile");
                const phonenumber_fax = doc.window.document.getElementById("phonenumber_fax");
                //
                const bill_salutation = doc.window.document.querySelector("label [name=bill_salutation][checked]");
                const bill_firstname = doc.window.document.getElementById("bill_firstname");
                const bill_surname = doc.window.document.getElementById("bill_surname");
                const bill_street = doc.window.document.getElementById("bill_street");
                const bill_zipcode = doc.window.document.getElementById("bill_zipcode");
                const bill_city = doc.window.document.getElementById("bill_city");
                //
                const delivery_salutation =
                    doc.window.document.querySelector("label [name=delivery_salutation][checked]");
                const delivery_firstname = doc.window.document.getElementById("delivery_firstname");
                const delivery_surname = doc.window.document.getElementById("delivery_surname");
                const delivery_street = doc.window.document.getElementById("delivery_street");
                const delivery_zipcode = doc.window.document.getElementById("delivery_zipcode");
                const delivery_city = doc.window.document.getElementById("delivery_city");
                //
                const contractdate = doc.window.document.getElementById("contractdate");
                const contracttype = doc.window.document.getElementById("contracttype");
                //save data in json
                let data = <StammDaten>{
                    kundenNr: parseInt(KundenNr.getAttribute("value")),
                    email: email.getAttribute("value"),
                    firstName: firstname.getAttribute("value"),
                    lastName: surname.getAttribute("value"),
                    phoneNumbers: {
                        private: phonenumber_private.getAttribute("value"),
                        business: phonenumber_business.getAttribute("value"),
                        mobile: phonenumber_mobile.getAttribute("value"),
                        fax: phonenumber_fax.getAttribute("value")
                    },
                    //
                    Lieferadresse: {
                        salutation: delivery_salutation.getAttribute("value"),
                        firstName: delivery_firstname.getAttribute("value"),
                        lastName: delivery_surname.getAttribute("value"),
                        street: delivery_street.getAttribute("value"),
                        zipCode: delivery_zipcode.getAttribute("value"),
                        city: delivery_city.getAttribute("value")
                    },
                    //
                    Rechnungsadresse: {
                        salutation: bill_salutation.getAttribute("value"),
                        firstName: bill_firstname.getAttribute("value"),
                        lastName: bill_surname.getAttribute("value"),
                        street: bill_street.getAttribute("value"),
                        zipCode: bill_zipcode.getAttribute("value"),
                        city: bill_city.getAttribute("value")
                    },
                    //,
                    contractdate: contractdate.getAttribute("value"),
                    contracttype: contracttype.getAttribute("value")
                };
                if (this.dateFormat === "timestamp") data.contractdate = PrimaGasClient.dateToTimestamp(data.contractdate as string);
                //return data
                resolve(data);
                //console.timeEnd("stammDaten");
            }).catch(reject);
        });
    }
}
