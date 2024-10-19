"use client";

import { ApolloClient, ApolloLink, HttpLink, } from "@apollo/client";
import { ApolloNextAppProvider, NextSSRInMemoryCache, SSRMultipartLink, NextSSRApolloClient } from "@apollo/experimental-nextjs-app-support/ssr";
const GraphQL_PORT = process.env.GraphQL_PORT

function makeClient() {
    const httpLink = new HttpLink({uri: GraphQL_PORT});

    return new NextSSRApolloClient({
        cache: new NextSSRInMemoryCache(),
        link:
            typeof window === "undefined"
                ? ApolloLink.from([new SSRMultipartLink({stripDefer: true}), httpLink])
                : httpLink,
    });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            {children}
        </ApolloNextAppProvider>
    );
}