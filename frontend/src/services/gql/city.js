import { gql } from "@apollo/client";

export const Cities = gql`
  query getCities{
    cities {
        id
        country
        city
    }
  }
`;

