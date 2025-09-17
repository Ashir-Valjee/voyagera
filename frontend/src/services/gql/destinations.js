import { gql } from "@apollo/client";

export const GET_TOP_DESTINATIONS = gql`
    query TopDestinations($limit: Int) {
        topDestinations(limit: $limit) {
        name
        count
        }
    }
    `;
