import { gql } from "@apollo/client";

export const AMADEUS_FLIGHT_OFFERS = gql`
  query AmadeusFlightOffers(
    $origin: String!
    $destination: String!
    $departureDate: String!
    $returnDate: String
    $adults: Int = 1
    $nonStop: Boolean = false
    $maxResults: Int = 20
    $currency: String = "GBP"
  ) {
    amadeusFlightOffers(
      origin: $origin
      destination: $destination
      departureDate: $departureDate
      returnDate: $returnDate
      adults: $adults
      nonStop: $nonStop
      maxResults: $maxResults
      currency: $currency
    ) {
      id
      priceTotal
      priceCurrency
      outDepartureIata
      outDepartureAt
      outArrivalIata
      outArrivalAt
      retDepartureIata
      retDepartureAt
      retArrivalIata
      retArrivalAt
      outCarrierCode
      outFlightNumber
      outStops
      retCarrierCode
      retFlightNumber
      retStops
      outDurationIso
      outDurationMinutes
      outDurationHours
      retDurationIso
      retDurationMinutes
      retDurationHours
      totalDurationMinutes
      totalDurationHours
    }
  }
`;

export const FlightBooking = gql`
  query GetFlightBookingForSingleUser {
    flightBookings {
      id
      departureAirport
      destinationAirport
      dateCreated
      departureDateTime
      arrivalDateTime
      flightDuration
      numberOfStops
      numberOfPassengers
      totalPrice
    }
  }
`;

export const FlightBookingById = gql`
  query GetFlightBookingById($flightId: Int!) {
    flightBookingById(flightId: $flightId) {
      id
      departureAirport
      destinationAirport
      dateCreated
      departureDateTime
      arrivalDateTime
      flightDuration
      numberOfStops
      numberOfPassengers
      totalPrice
    }
  }
`;

export const CreateFlightBooking = gql`
  mutation CreateFlightBooking(
    $arrivalDateTime: DateTime!
    $departureAirport: String!
    $departureCityId: ID!
    $departureDateTime: DateTime!
    $destinationAirport: String!
    $destinationCityId: ID!
    $flightDuration: Decimal!
    $numberOfPassengers: Int!
    $numberOfStops: Int!
    $totalPrice: Decimal!
  ) {
    createFlightBooking(
      arrivalDateTime: $arrivalDateTime
      departureAirport: $departureAirport
      departureCityId: $departureCityId
      departureDateTime: $departureDateTime
      destinationAirport: $destinationAirport
      destinationCityId: $destinationCityId
      flightDuration: $flightDuration
      numberOfPassengers: $numberOfPassengers
      numberOfStops: $numberOfStops
      totalPrice: $totalPrice
    ) {
      success
      errors
    }
  }
`;

export const DeleteFlightBooking = gql`
  mutation DeleteFlightBooking($id: ID!) {
    deleteFlightBooking(id: $id) {
      success
      errors
    }
  }
`;

export const UpdateFlightBooking = gql`
  mutation UpdateFlightBooking(
    $id: ID!
    $numberOfPassengers: Int!
    $totalPrice: Decimal!
  ) {
    updateFlightBooking(
      id: $id
      numberOfPassengers: $numberOfPassengers
      totalPrice: $totalPrice
    ) {
      success
      errors
      flightBooking {
        id
        numberOfPassengers
        totalPrice
      }
    }
  }
`;
