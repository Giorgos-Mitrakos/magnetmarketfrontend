import { gql } from "graphql-request";

export const GET_COUNTRY_LIST = gql`
query getCountries{
    countries(pagination:{limit:-1}){
        data{
            id
            attributes{
                name
            }
        }
    } 
}
`

export const GET_COUNTRY_STATES = gql`
query getCountryState($country:String!){
    countries(filters: { name: { eq: $country } }) {
    data {
      id
      attributes {
        name
        states (sort:"name",pagination:{limit:-1}){
          data {
            id
            attributes {              
              name
            }
          }
        }
      }
    }
  }
}
`

export const GET_STATE_REGIONS = gql`
query getStateRegions($state:String!){
    states(filters: { name: { eq: $state } }) {
    data {
      id
      attributes {
        name
        regions (sort:"name",pagination:{limit:-1}){
          data {
            id
            attributes {              
              name
            }
          }
        }
      }
    }
  }
}
`

export const GET_REGION_POSTALS = gql`
query getRegionPostals($region:String!){
    regions(filters: { name: { eq: $region } }) {
    data {
      id
      attributes {
        name
        postal_codes (sort:"postal",pagination:{limit:-1}){
          data {
            id
            attributes {
              postal
            }
          }
        }
      }
    }
  }
}
`