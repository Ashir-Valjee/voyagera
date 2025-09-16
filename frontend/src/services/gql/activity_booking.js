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
      imageUrl
    }
  }
`;

export const ActivityBookingsByFlight = gql`
  query GetActivityBookingsByFlightId($flightBookingId: Int!) {
    activityBookingsByFlightId(flightBookingId: $flightBookingId) {
      id
      dateCreated
      activityDateTime
      numberOfPeople
      category
      activityName
      activityUrl
      totalPrice
      imageUrl
      flightBooking {
        destinationCity {
          city
        }
      }
    }
  }
`;

export const ActivityBookingsByUser = gql`
  query ActivityBookingsByUser {
    activityBookingsByUser {
      id
      activityDateTime
      numberOfPeople
      category
      activityName
      activityUrl
      totalPrice
      imageUrl
      flightBooking {
        id
        destinationCity {
          id
          country
          city
        }
      }
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
    $imageUrl: String!
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
      imageUrl: $imageUrl
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
        imageUrl
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

export const TICKETMASTER_EVENTS = gql`
  query TicketmasterEvents(
    $city: String
    $countryCode: String
    $startDateTime: String
    $endDateTime: String
    $classificationName: String
    $size: Int = 24
  ) {
    ticketmasterEvents(
      city: $city
      countryCode: $countryCode
      startDateTime: $startDateTime
      endDateTime: $endDateTime
      classificationName: $classificationName
      size: $size
    ) {
      id
      name
      city
      classificationName
      startDateTime
      country
      imageUrl
      eventUrl
    }
  }
`;
