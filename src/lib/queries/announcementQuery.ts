import { gql } from "graphql-request";

export const GET_ANNOUNCEMENT = gql`
{
  announcement{
    data{
      attributes{
        text
        type
        isClosable
      }
    }
  }
}`