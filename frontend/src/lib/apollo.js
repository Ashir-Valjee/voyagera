// src/lib/apollo.js
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { apiUrl } from "./config";

const httpLink = new HttpLink({
  uri: apiUrl("/graphql/"),
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
