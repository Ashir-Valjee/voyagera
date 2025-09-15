// src/lib/apollo.js
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";

// Custom fetch to support file uploads
const customFetch = (uri, options) => {
  // If the body is FormData, don't stringify
  if (options.body instanceof FormData) {
    // Remove content-type so browser sets it (with boundary)
    delete options.headers["content-type"];
  }
  return fetch(uri, options);
};

const httpLink = new HttpLink({ 
  uri: "/graphql/",
  fetch: customFetch,
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
