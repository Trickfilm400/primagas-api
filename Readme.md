# primagas-api

This NPM package provides a full nodejs-api for the Primagas-Website to fetch data of your account, your gas tank and more.

~~Note: As of July 2023, there is a new customer portal, which is a complete rewrite of the old one. This script will currently not work with the new one and the old one is offline.~~

Some information about the new portal:
- OAuth2 Authorization URL: `https://depgprodaadb2c.b2clogin.com/depgprodaadb2c.onmicrosoft.com/b2c_1a_signinorsignup/oauth2/v2.0/authorize`
- OAuth2 Token URL: `https://depgprodaadb2c.b2clogin.com/depgprodaadb2c.onmicrosoft.com/b2c_1a_signinorsignup/oauth2/v2.0/token`
- OAuth2 Client ID: `15f4b687-8555-413c-bafd-acb38cff6837`
- OAuth2 redirect URL: `https://kunden.primagas.de/api/auth/callback/azureadb2c`
- OAuth2 flow uses PKCE with SHA256
- API Endpoint for tank data: `https://api.shvenergy.com/assets-api/v1/business-units/DE-PG/accounts/<customer-number>/delivery-points/<customer-number>_T_1/assets/<customer-number>_T_1/readings?$filter=`


This NPM package provides a full nodejs-api for the Primagas-Website to fetch data of your account, our gas tank...

**Note:** Currently, not all API functions are implemented which are available of the [shvenergy-api](https://github.com/Trickfilm400/shvenergy-api)

## Usage

- Install NPM package from GitHub.
- Functions return a Promise
- For detailed information about the function return values, view the Typescript interface files in `/src/interfaces`

## Example

```typescript
import PrimaGasClient from "@trickfilm400/primagas-api";

const client = new PrimaGasClient<"timestamp">("<USERNAME>", "<PASSWORD>", "<CUSTOMER-NUMBER>", "timestamp");

client.tankDaten().then(console.log, console.error);
// client.rechnungsDaten().then(console.log, console.error);
// client.stammDaten().then(console.log, console.error);
```

&copy; 2022-2024 Trickfilm400
