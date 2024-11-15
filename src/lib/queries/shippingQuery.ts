import { gql } from "graphql-request";

export const GET_SHIPPING_METHODS = gql`
query getShippingMethods{
    shippings {
    data {
      id
      attributes {
        name        
      }
    }
  }
}`

export const GET_PAYMENT_METHODS = gql`
query getPaymentMethods{
    payments{
    data{
      id
      attributes{
        name
        price
        icon{
          data{
            attributes{
              name
              alternativeText
              formats
            }
          }
        }
        range{
          minimum
          maximum
        }
      }
    }
  }
}`