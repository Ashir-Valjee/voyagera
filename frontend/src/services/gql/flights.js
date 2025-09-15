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
    }
  }
`;
