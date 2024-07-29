
import { GraphQLClient, request } from "graphql-request";
import { cache } from 'react'

interface requestProps {
    query: string
    variables?: { [key: string]: string | number | string[] | object }
}

export const requestSSR = cache(async ({ query, variables }: requestProps) => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/graphql`;
    const client = new GraphQLClient(endpoint, {
        // headers: {
        //     authorization: `Bearer ${process.env.STRAPI_CUSTOM_TOKEN}`
        // }
    });
    try {
        const data = client.request(query, variables);

        return data
    } catch (error) {
        console.log(error)
    }

})

export const fetcher = (props: { query: string, variables: { [key: string]: string | number | Date | object } }) => request(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, props.query, props.variables)
// export const fetcher = async (query: string, variables: { [key: string]: string | number | Date }) => request(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, query, variables)

