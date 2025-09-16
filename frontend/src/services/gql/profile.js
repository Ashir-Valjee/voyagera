import { gql } from "@apollo/client";

export const Profile = gql`
  query GetProfile{
    getUserProfile {
      id
      profilePic
      likesMusic
      likesSports
      likesArts
      likesFilm
      likesFamily
      firstName
      lastName
      homeCity {
        id
        city
        country
      }
    }
  }

`;

export const UpdateProfile = gql`
  mutation UpdateProfile(
    $firstName: String
    $lastName: String
    $profilePic: String
    $homeCityId: ID
    $likesMusic: Boolean
    $likesSports: Boolean
    $likesArts: Boolean
    $likesFilm: Boolean
    $likesFamily: Boolean
  ) {
    updateProfile(
      firstName: $firstName
      lastName: $lastName
      profilePic: $profilePic
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
        profilePic
        homeCity {
          id
          city
          country
        }
      }
    }
  }
`;


