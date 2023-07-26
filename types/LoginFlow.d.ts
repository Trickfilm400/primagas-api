/**
 * OAuth Access Token Response
 */
export interface TokenResponse {
    access_token: string;
    id_token: string;
    token_type: "Bearer";
    not_before: number;
    expires_in: number;
    expires_on: number;
    resource: string;
    id_token_expires_in: number;
    profile_info: string;
    scope: string;
    refresh_token: string;
    refresh_token_expires_in: number;
}
/**
 * Fake OAuth login flow to automatically send credentials in a authorization code flow
 */
export declare class LoginFlow {
    private csrf;
    private state;
    private authorize_result;
    private postResponse;
    private code;
    debug: boolean;
    /**
     * OAuth PKCE Code Challenge generator
     * @private
     */
    private generateCodeChallenge;
    /**
     * OAuth Authorize Request, first request step in the login flow
     *
     * Response is saved for cookie access and so on
     * @private
     */
    private authorize;
    /**
     * Fake the Login modal: Send the credentials (like if you enter the credentials in the form and click on login)
     * @param username
     * @param password
     * @private
     */
    private selfAsserted;
    /**
     * OAuth default token request with request to obtain auth code for the token endpoint
     * @private
     */
    private token;
    /**
     * Execute Login Flow with all requests in the correct order
     * @param username Username
     * @param password Password
     * @return {TokenResponse} Generated token, if no error occurred
     */
    getAccessToken(username: string, password: string): Promise<TokenResponse>;
    /**
     * @return {boolean} - True if logged in
     */
    static checkAuth(token: TokenResponse): boolean;
    /**
     * Internal logging function to only log with debug flag enabled
     * @param args
     * @private
     */
    private log;
}
