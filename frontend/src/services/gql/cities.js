import { gql } from "@apollo/client";

export const CITIES = gql`
  query Cities {
    cities {
      id
      country
      city
      iataCode
    }
  }
`;
