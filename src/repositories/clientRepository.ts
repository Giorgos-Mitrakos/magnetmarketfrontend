"use client"

import useSWR from 'swr'
import { GraphQLClient, request } from 'graphql-request'

interface requestProps {
    api?: string
    query?: string
    variables?: { [key: string]: string | number | string[] }
    jwt: string
}

interface requestApiProps {
    method: string
    api?: string
    query?: string
    variables?: object//{ [key: string]: string | number | string[] | object[] }
    jwt: string
}

interface requestPublicProps {
    api?: string
    query?: string
    variables?: { [key: string]: string | number | string[] }
}

export function useQuery({ query, variables, jwt }: requestProps) {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/graphql`;
    const client = new GraphQLClient(endpoint, {
        headers: {
            authorization: `Bearer ${jwt}`
        }
    });

    const fetcher = ([query, variables]: any) => client.request(query, variables);

    const { data, isLoading, error } = useSWR(
        [query, variables]
        , fetcher)

    return {
        data: data,
        loading: isLoading,
        error: error
    }
}


export function useNoRevalideteQuery({ query, variables, jwt }: requestProps) {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/graphql`;
    const client = new GraphQLClient(endpoint, {
        headers: {
            authorization: `Bearer ${jwt}`
        }
    });

    const fetcher = ([query, variables]: any) => client.request(query, variables);

    const { data, isLoading, error } = useSWR(
        [query, variables]
        , fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        })
    // const response= {data:await data, error:await error}


    return {
        data: data,
        loading: isLoading,
        error: error
    }
}

export function useApiRequest({ method, api, variables, jwt }: requestApiProps) {
    const myHeaders = new Headers();
    myHeaders.append("authorization", `Bearer ${jwt}`);
    myHeaders.append('Content-Type', 'application/json')

    const myInit = {
        method: `${method}`,
        headers: myHeaders,
        // mode: "cors",
        // cache: "default",
        body: JSON.stringify(variables)
    };

    const fetcher = ([url, variables]: any) =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`,
            myInit
        ).then(r => r.json())

    const { data, isLoading, error } = useSWR(
        [api, variables]
        , fetcher)
    // const response= {data:await data, error:await error}

    return {
        data: data,
        loading: isLoading,
        error: error
    }
}

export const fetcher = ([query, variables]: any) => request('/api/graphql', query, variables)