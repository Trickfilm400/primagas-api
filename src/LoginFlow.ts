import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import * as crypto from "crypto";
import base64url from "base64url";
import * as randomstring from "randomstring";

/**
 * OAuth Access Token Response
 */
export interface TokenResponse {
    access_token: string,
    id_token: string,
    token_type: "Bearer",
    not_before: number,
    expires_in: number
    expires_on: number,
    resource: string,
    id_token_expires_in: number,
    profile_info: string,
    scope: string,
    refresh_token: string,
    refresh_token_expires_in: number
}

/**
 * Fake OAuth login flow to automatically send credentials in a authorization code flow
 */
export class LoginFlow {
    private csrf: string;
    private state: string;
    private authorize_result: AxiosResponse<string>;
    private postResponse: AxiosResponse<{
        status: string
    }>;
    private code: { challenge?: string, verifier?: string } = {};
    public debug: boolean = false;

    /**
     * OAuth PKCE Code Challenge generator
     * @private
     */
    private generateCodeChallenge() {
        const code_verifier = randomstring.generate(128);
        const base64Digest = crypto
            .createHash("sha256")
            .update(code_verifier)
            .digest("base64");
        // this.log(base64Digest); // +PCBxoCJMdDloUVl1ctjvA6VNbY6fTg1P7PNhymbydM=
        const code_challenge = base64url.fromBase64(base64Digest);
        // this.log(code_challenge); // -PCBxoCJMdDloUVl1ctjvA6VNbY6fTg1P7PNhymbydM
        this.code.challenge = code_challenge;
        this.code.verifier = code_verifier;
    }

    /**
     * OAuth Authorize Request, first request step in the login flow
     *
     * Response is saved for cookie access and so on
     * @private
     */
    private async authorize() {
        //create query object with all parameters
        const urlQuery1 = new URLSearchParams();
        urlQuery1.set("redirect_uri", "https://kunden.primagas.de/api/auth/callback/azureadb2c");
        urlQuery1.set("client_id", "15f4b687-8555-413c-bafd-acb38cff6837");
        urlQuery1.set("response_type", "code");
        urlQuery1.set("scope", "offline_access openid profile https://depgprodaadb2c.onmicrosoft.com/customer-portal/customer-portal-api https://depgprodaadb2c.onmicrosoft.com/customer-portal/customer-portal-identity-api https://depgprodaadb2c.onmicrosoft.com/customer-portal/customer-portal-sitecore");
        //urlQuery1.set("state", "sssdfdgfhgfgdfs"); //unused, not needed
        urlQuery1.set("business_unit", "DE-PG");
        urlQuery1.set("ui_locales", "de-DE");
        urlQuery1.set("code_challenge", this.code.challenge);
        urlQuery1.set("code_challenge_method", "S256");
        const query = urlQuery1.toString();
        const authorize_Result = await axios.post<string>(`https://depgprodaadb2c.b2clogin.com/depgprodaadb2c.onmicrosoft.com/b2c_1a_signinorsignup/oauth2/v2.0/authorize?${query}`, undefined, {
            withCredentials: true, //needed for cookies
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
            }
        })
        this.authorize_result = authorize_Result;
        //this.log(authorize_Result)
        const auth_page = await authorize_Result.data
        // STATEPROPERTIES
        const state = /StateProperties([^"]+)/.exec(auth_page);
        //this.log(state[0])
        this.state = state[0];
        // CRSF
        const csrf = /"csrf":.?"(?<csrf>[^"]+)"/.exec(auth_page);
        this.csrf = csrf.groups?.csrf;
        //validate request response to check if maybe an error occurred
        if (!this.state || !this.csrf) throw new Error("Could not find state or csrf in authorize response")
    }

    /**
     * Fake the Login modal: Send the credentials (like if you enter the credentials in the form and click on login)
     * @param username
     * @param password
     * @private
     */
    private async selfAsserted(username: string, password: string) {
        const query = new URLSearchParams({
            tx: this.state,
            p: "B2C_1A_SignInOrSignUp"
        });
        const options: AxiosRequestConfig = {
            withCredentials: true,
            method: "POST",
            headers: {
                "cookie": this.authorize_result.headers["set-cookie"].join(";"),
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-CSRF-TOKEN": this.csrf,
                "X-Requested-With": "XMLHttpRequest",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
                //"Accept": "application/json, text/javascript, */*; q=0.01"
            },
            data: `request_type=RESPONSE&signInName=${username}&password=${password}`
        }

        const postResponse = await axios.post<{
            status: string
        }>(`https://depgprodaadb2c.b2clogin.com/depgprodaadb2c.onmicrosoft.com/B2C_1A_SignInOrSignUp/SelfAsserted?${query.toString()}`, options.data, options)
        //this.log(postResponse)
        this.log(":: SelfAsserted :: data ::", postResponse.data)
        if (postResponse.data.status !== "200") {
            throw new Error("SelfAsserted-Request failed")
        }
        this.postResponse = postResponse;
    }

    /**
     * OAuth default token request with request to obtain auth code for the token endpoint
     * @private
     */
    private async token() {
        this.log("get access token")
        //remove useless data in cookie header data, because it is not used and maybe created errors
        const _authCookies = this.authorize_result.headers["set-cookie"].map((cookie) => cookie.substring(0, cookie.length - "; domain=depgprodaadb2c.b2clogin.com; path=/; SameSite=None; secure; HttpOnly".length));
        const _postCookies = this.postResponse.headers["set-cookie"].map((cookie) => cookie.substring(0, cookie.length - "; domain=depgprodaadb2c.b2clogin.com; path=/; SameSite=None; secure; HttpOnly".length));
        let resultCookies = _postCookies;
        //replace x-ms-cpim-sso cookie
        //find new value
        const index_org_2 = _authCookies.indexOf(_postCookies.find(x => x.includes("x-ms-cpim-sso")))
        //replace
        resultCookies.push(_authCookies[index_org_2]);
        resultCookies.push("x-ms-cpim-csrf="+this.csrf);


        const confirmQuery = new URLSearchParams({
            rememberMe: "true",
            csrf_token: this.csrf,
            tx: this.state,
            p: "B2C_1A_SignInOrSignUp",
        });

        const confirmresponse = await axios.get<string>(`https://depgprodaadb2c.b2clogin.com/depgprodaadb2c.onmicrosoft.com/B2C_1A_SignInOrSignUp/api/CombinedSigninAndSignup/confirmed?${confirmQuery.toString()}`, {
            withCredentials: true,
            headers: {
                // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                // "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
                "cookie": resultCookies.join("; "),
            },
            maxRedirects: 0,
            //overwrite function to allow 302 Redirect responses as valid response
            validateStatus: function (status) {
                return status >= 200 && status <= 302
            }
        })
        this.log("confirmresponse.data", confirmresponse.data)
        // GET AUTH CODE for token endpoint
        //const auth_Code = /code=(?<code>[^"]+)/.exec(confirmresponse.data).groups.code;
        const redirectUrl = new URLSearchParams(confirmresponse.headers.location.split("?")[1]);
        const auth_Code = redirectUrl.get("code")
        //do final token request with the default OAuch 2.0 endpoint
        const request = await axios.post<TokenResponse>("https://depgprodaadb2c.b2clogin.com/depgprodaadb2c.onmicrosoft.com/b2c_1a_signinorsignup/oauth2/v2.0/token", {
            grant_type: "authorization_code",
            code: auth_Code,
            "redirect_uri": "https%3A%2F%2Fkunden.primagas.de%2Fapi%2Fauth%2Fcallback%2Fazureadb2c",
            "code_verifier": this.code.verifier
        }, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Authorization": "Basic MTVmNGI2ODctODU1NS00MTNjLWJhZmQtYWNiMzhjZmY2ODM3Og==" //base 64 of "<client-id>:"
            }
        })

        this.log("token", request.data)
        //return access token object
        return request.data;
    }

    /**
     * Execute Login Flow with all requests in the correct order
     * @param username Username
     * @param password Password
     * @return {TokenResponse} Generated token, if no error occurred
     */
    public async getAccessToken(username: string, password: string) {
        //create new code verifier and challenge for every request
        this.generateCodeChallenge();
        await this.authorize();
        //Username: encodeURIComponent is needed as the request otherwise never ends
        //Password: encodeURIComponent is NOT needed because the response would indicate an incorrect password
        await this.selfAsserted(encodeURIComponent(username), password);
        return await this.token();
    }

    /**
     * @return {boolean} - True if logged in
     */
    public static checkAuth(token: TokenResponse) {
        //if date.now greater: expire is in the past, so not logged in
        if (Math.floor(Date.now() / 1000) > token.expires_on) return false;
        return true;
    }

    /**
     * Internal logging function to only log with debug flag enabled
     * @param args
     * @private
     */
    private log(...args: any[]) {
        if (this.debug) console.log(...args);
    }
}