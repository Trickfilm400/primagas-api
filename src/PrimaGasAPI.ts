import {LoginFlow, TokenResponse} from "./LoginFlow.js";
import {ApiApi, Configuration} from "@trickfilm400/shvenergy-api-client";

export class PrimaGasAPI {
    public token: TokenResponse;
    private apiConfiguration: Configuration;
    private api: ApiApi;

    constructor(public username: string, public password: string, public customerNumber: string) {
    }

    ensureLoggedIn() {
        return (LoginFlow.checkAuth(this.token))
    }

    async getNewToken() {
        const result = await new LoginFlow().getAccessToken(this.username, this.password)
        this.token = result;
        this.apiConfiguration = new Configuration({
            accessToken: this.token.access_token
        });
        this.api = new ApiApi(this.apiConfiguration);
        return result;
    }

    async prepareRequestToken() {
        if (!this.token || !this.ensureLoggedIn())
            return this.getNewToken();
        return true;
    }

    public async tankReadings() {
        await this.prepareRequestToken();
        const res = await this.api.getAssetsApiV1BusinessUnitsDEPGAccountsCustomerNumberDeliveryPointsCustomerNumberT1AssetsCustomerNumberT1Readings({
            customerNumber: this.customerNumber,
            assetId: this.customerNumber + "_T_1",
            deliveryId: this.customerNumber + "_T_1",
            assetType: "Tank",
            $filter: undefined,
            ocpApimSubscriptionKey: "127cab3c995c46debf6ede4612576c26"
        })
        //console.log(res)
        return res.data
    }
}