
export interface IAddresses {
    different_shipping: boolean,
    deliveryNotes: string,
    billing: {
        isInvoice: boolean,
        email: string,
        firstname: string,
        lastname: string,
        street: string,
        city: string,
        state: string,
        zipCode: string,
        country: string,
        telephone: string,
        mobilePhone: string,
        afm: string,
        doy: string,
        companyName: string,
        businessActivity: string,

    },
    shipping: {
        firstname: string,
        lastname: string,
        street: string,
        city: string,
        state: string,
        zipCode: string,
        country: string,
        telephone: string,
        mobilePhone: string,
    }
}

export interface ICustomerInfo {
    id: number | string
    email: string;
    firstname: string;
    lastname: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    telephone: string;
    mobilePhone: string;
    afm: string;
    doy: string;
    companyName: string;
    businessActivity: string;
    isInvoice: boolean;
    different_shipping: boolean;
    ship_firstname: string;
    ship_lastname: string;
    ship_street: string;
    ship_city: string;
    ship_state: string;
    ship_zipCode: string;
    ship_country: string;
    ship_telephone: string;
    ship_mobilePhone: string;
    deliveryNotes: string
}

export interface ICountries {
    countries: {
        data: {
            id: number | string
            attributes: {
                name: string
            }
        }[]
    }
}

export interface IStates {
    countries: {
        data: {
            id: number | string
            attributes: {
                name: string
                states: {
                    data: {
                        id: number | string
                        attributes: {
                            name: string
                        }
                    }[]
                }
            }
        }[]
    }
}

export interface IRegions {
    states: {
        data: {
            id: number | string
            attributes: {
                name: string
                regions: {
                    data: {
                        id: number | string
                        attributes: {
                            name: string
                        }
                    }[]
                }
            }
        }[]
    }
}

export interface IRegionPostals {
    regions: {
        data: {
            id: number | string
            attributes: {
                name: string
                postal_codes: {
                    data: {
                        id: number | string
                        attributes: {
                            postal: string
                        }
                    }[]
                }
            }
        }[]
    }
}