# primagas-api

This NPM package provides a full nodejs-api for the Primagas-Website to fetch data of your account, your gas tank and more.

**Note**: As of July 2023, there is a new customer portal, which is a complete rewrite of the old one. This script will currently not work with the new one and the old one is offline.

I am working on a fix to support the new one, but it's a bit complicated because of the OAuth2 authentication.
I found a way to do this, will be finishing this these days.

Some information about the new portal:
- OAuth2 Authorization URL: `https://depgprodaadb2c.b2clogin.com/depgprodaadb2c.onmicrosoft.com/b2c_1a_signinorsignup/oauth2/v2.0/authorize`
- OAuth2 Token URL: `https://depgprodaadb2c.b2clogin.com/depgprodaadb2c.onmicrosoft.com/b2c_1a_signinorsignup/oauth2/v2.0/token`
- OAuth2 Client ID: `15f4b687-8555-413c-bafd-acb38cff6837`
- OAuth2 redirect URL: `https://kunden.primagas.de/api/auth/callback/azureadb2c`
- OAuth2 flow uses PKCE with SHA256
- API Endpoint for tank data: `https://api.shvenergy.com/assets-api/v1/business-units/DE-PG/accounts/<customer-number>/delivery-points/<customer-number>_T_1/assets/<customer-number>_T_1/readings?$filter=`
- The issue is to log in automatically: the OAuth2 workflow requires the input of username & password and I need to find the way to do this automatically.


This NPM package provides a full nodejs-api for the Primagas-Website to fetch data of your account, our gas tank...

## Usage

- Install NPM package from GitHub.
- Functions return a Promise
- For detailed information about the function return values, view the Typescript interface files in `/src/interfaces`

## Example

```typescript
import PrimaGasClient from "@trickfilm400/primagas-api";

const client = new PrimaGasClient("<USERNAME>", "<PASSWORD>", "timestamp" /* "timestamp" or "string" */);

client.tankDaten().then(console.log, console.error);
client.rechnungsDaten().then(console.log, console.error);
client.stammDaten().then(console.log, console.error);
```

&copy; 2022-2023 Trickfilm400
