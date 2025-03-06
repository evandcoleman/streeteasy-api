export const SEARCH_RENTALS_QUERY = `
  query GetListingRental($input: SearchRentalsInput!) {
    searchRentals(input: $input) {
      search {
        criteria
      }
      totalCount
      edges {
        ... on OrganicRentalEdge {
          node {
            id
            areaName
            bedroomCount
            buildingType
            fullBathroomCount
            geoPoint {
              latitude
              longitude
            }
            halfBathroomCount
            noFee
            leadMedia {
              photo {
                key
              }
            }
            price
            sourceGroupLabel
            street
            unit
            urlPath
          }
        }
      }
    }
  }
`; 