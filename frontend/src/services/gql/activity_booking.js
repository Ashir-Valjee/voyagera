import { gql } from "@apollo/client";

export const SingleActivityBooking = gql`
    query GetSingleActivityBooking($id: Int!) {
        singleActivityBooking(id: $id) {
            id
            dateCreated
            activityDateTime
            numberOfPeople
            category
            activityName
            activityUrl
            totalPrice
        }
    }
`;

export const ActivityBookingByFlight = gql`
  query GetActivityBookingsByFlightId($flightBookingId: Int!){
    activityBookingByFlightId(flightBookingId: $flightBookingId){
        id
        dateCreated
        activityDateTime
        numberOfPeople
        category
        activityName
        activityUrl
        totalPrice
    }
  }
`;

export const CreateActivityBooking = gql`
  mutation CreateActivityBooking(
    $activityDateTime: DateTime!
    $locationCityId: ID!
    $numberOfPeople: Int!
    $category: String!
    $activityName: String!
    $activityUrl: String!
    $totalPrice: Decimal!
    $flightBookingId: ID!
  ) {
    createActivityBooking(
      activityDateTime: $activityDateTime
      locationCityId: $locationCityId
      numberOfPeople: $numberOfPeople
      category: $category
      activityName: $activityName
      activityUrl: $activityUrl
      totalPrice: $totalPrice
      flightBookingId: $flightBookingId
    ) {
      activityBooking {
        id
        dateCreated
        activityDateTime
        numberOfPeople
        category
        activityName
        totalPrice
        activityUrl
      }
      success
      errors
    }
  }
`;

export const DeleteActivityBooking = gql`
  mutation DeleteActivityBooking($id: ID!) {
    deleteActivityBooking(id: $id) {
      success
      errors
    }
  }
`;


export const UpdateActivityBooking = gql`
  mutation UpdateActivityBooking(
    $id: ID!
    $numberOfPeople: Int!
    $totalPrice: Decimal!
  ) {
    updateActivityBooking(
      id: $id
      numberOfPeople: $numberOfPeople
      totalPrice: $totalPrice
    ) {
      success
      errors
      activityBooking {
        id
        numberOfPeople
        totalPrice
      }
    }
  }
`;
