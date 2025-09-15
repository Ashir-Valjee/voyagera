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

export const UpdateProfile = gql`
  mutation UpdateProfile(
    $id: ID!
    $firstName: String!
    $lastName: String!
    $profilePicUrl: String!
    $homeCityId: ID!
    $likesMusic: Boolean!
    $likesSports: Boolean!
    $likesArts: Boolean!
    $likesFilm: Boolean!
    $likesFamily: Boolean!
  ) {
    updateProfile(
      id: $id
      firstName: $firstName
      lastName: $lastName
      profilePicUrl: $profilePicUrl
      homeCityId: $homeCityId
      likesMusic: $likesMusic
      likesSports: $likesSports
      likesArts: $likesArts
      likesFilm: $likesFilm
      likesFamily: $likesFamily
    ) {
      success
      errors
      profile {
        id
        likesMusic
        likesSports
        likesArts
        likesFilm
        likesFamily
        firstName
        lastName
        profilePicUrl
      }
    }
  }
`;


