import { gql } from "graphql-request";

export const GET_SHIPPING_METHODS = gql`
query getShippingMethods{
    shippings(filters:{isActive:{eq:true}}) {
    data {
      id
      attributes {
        name
        payments(filters:{isActive:{eq:true}}){
          data{
            id
            attributes{
              name
              price
              range{
                minimum
                maximum
              }
              isActive
              installments{
                max_installments
                free_rate_months
                annual_rate
              }
            }
          }
        }
      }
    }
  }
}`

export const GET_PAYMENT_METHODS = gql`
query getPaymentMethods{
    payments(filters:{isActive:{eq:true}}){
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
        installments {
          max_installments
          free_rate_months
          annual_rate
        }
      }
    }
  }
}`

export const GET_ORDER = gql`
query getOrder($id:ID!){
    order(id:$id) {
    data {
      id
      attributes {
        products
        total
        status
        billing_address
        different_shipping
        shipping_address
        installments
        payment {
          name
          cost
        }
        shipping{
          name
          cost
        }       
      }
    }
  }
}`