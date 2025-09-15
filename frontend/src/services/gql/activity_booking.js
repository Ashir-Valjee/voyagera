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

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      access
      refresh
    }
  }
`;