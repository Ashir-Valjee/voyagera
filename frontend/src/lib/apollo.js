// src/lib/apollo.js
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";

const API_URL = import.meta.env.VITE_API_URL || '/graphql/';

const httpLink = new HttpLink({ 
  uri: API_URL,
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("access");
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }));
  return forward(operation);
});

export const apollo = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
