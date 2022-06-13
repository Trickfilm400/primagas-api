# primagas-api

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

&copy; 2022 Trickfilm400
