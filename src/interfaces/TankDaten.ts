export interface TankDaten {
    //in KG
    tankSize_KG: number;
    //in percent
    currentFillLevel: number;
    //farbe
    tankColor: string;
    //computed:
    calculated_currentFillLevel_KG: number
    calculated_maxFillLevel_KG: number
    //string for date string, number for unix epoch timestamp
    AufstellungsPruefung: string | number;
    AeusserePruefung: {
        last: string | number,
        next: string | number
    }
    InnerePruefung: {
        last: string | number,
        next: string | number
    }
}
