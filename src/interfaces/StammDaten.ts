export interface StammDaten {
    kundenNr: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumbers: {
        private: string;
        business: string;
        mobile: string;
        fax: string
    },
    Lieferadresse: {
        salutation: string;
        firstName: string;
        lastName: string;
        street: string;
        zipCode: string;
        city: string;
    }
    Rechnungsadresse: {
        salutation: string;
        firstName: string;
        lastName: string;
        street: string;
        zipCode: string;
        city: string;
    }
    //
    contractdate: string | number
    contracttype: string
}
