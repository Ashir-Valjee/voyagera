import { gql } from "@apollo/client";

export const Profile = gql`
  query GetProfile{
     getUserProfile {
        id
        likesMusic
        likesSports
        likesArts
        likesFilm
        likesFamily
        firstName
        lastName
    }
  }

`;