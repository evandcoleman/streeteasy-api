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

export const RENTAL_LISTING_DETAILS_QUERY = `
  query RentalListingDetailsFederated($listingID: ID!) {
    rentalByListingId(id: $listingID) {
      __typename
      id
      offMarketAt
      availableAt
      buildingId
      status
      statusChanges {
        __typename
        status
        changedAt
      }
      createdAt
      updatedAt
      interestingChangeAt
      description
      media {
        __typename
        ...MediaInfo
      }
      propertyDetails {
        __typename
        ...PropertyInfo
      }
      mlsNumber
      backOffice {
        __typename
        brokerageListingId
      }
      pricing {
        __typename
        leaseTermMonths
        monthsFree
        noFee
        price
        priceDelta
        priceChanges {
          __typename
          changedAt
        }
      }
      recentListingsPriceStats {
        __typename
        rentalPriceStats {
          __typename
          medianPrice
        }
        salePriceStats {
          __typename
          medianPrice
        }
      }
      upcomingOpenHouses {
        __typename
        ...FederatedOpenHouseInfo
      }
      listingSource {
        __typename
        ...ListingSourceInfo
      }
      propertyHistory {
        __typename
        ...RentalPropertyHistory
      }
    }
    buildingByRentalListingId(id: $listingID) {
      __typename
      ...ListingBuildingInfo
    }
    getBuildingExpressByRentalListingId(id: $listingID) {
      __typename
      ...NearbySchools
    }
    getRelloRentalById(id: $listingID) {
      __typename
      ...RelloInfo
    }
    getRentalListingExpressById(id: $listingID) {
      __typename
      hasActiveBuildingShowcase
    }
  }
  fragment FederatedOpenHouseInfo on OpenHouse {
    __typename
    id
    startTime
    endTime
    appointmentOnly
  }
  fragment ListingBuildingInfo on Building {
    __typename
    id
    name
    type
    residentialUnitCount
    yearBuilt
    status
    additionalDetails {
      __typename
      leasingStartDate
      salesStartDate
    }
    address {
      __typename
      street
      city
      state
      zipCode
    }
    heroImage {
      __typename
      key
    }
    media {
      __typename
      photos {
        __typename
        key
      }
    }
    complex {
      __typename
      id
      name
    }
    area {
      __typename
      name
    }
    media {
      __typename
      photos {
        __typename
        key
      }
    }
    saleInventorySummary {
      __typename
      availableListingDigests {
        __typename
        id
      }
    }
    rentalInventorySummary {
      __typename
      availableListingDigests {
        __typename
        id
      }
    }
    isLandLease
    policies {
      __typename
      list
      petPolicy {
        __typename
        catsAllowed
        dogsAllowed
        maxDogWeight
        restrictedDogBreeds
      }
    }
    nearby {
      __typename
      transitStations {
        __typename
        name
        distance
        routes
        geo {
          __typename
          latitude
          longitude
        }
      }
    }
  }
  fragment ListingSourceInfo on ListingSource {
    __typename
    sourceType
  }
  fragment MediaInfo on Media {
    __typename
    photos {
      __typename
      key
    }
    floorPlans {
      __typename
      key
    }
    videos {
      __typename
      imageUrl
      id
      provider
    }
    tour3dUrl
    assetCount
  }
  fragment NearbySchools on BuildingExpress {
    __typename
    nearbySchools {
      __typename
      name
      district
      grades
      id
      idstr
      geoCenter {
        __typename
        latitude
        longitude
      }
    }
  }
  fragment PriceChangePercent on PriceChangeOfInterest {
    __typename
    pricePercentChange
  }
  fragment PropertyInfo on PropertyDetails {
    __typename
    address {
      __typename
      street
      houseNumber
      streetName
      city
      state
      zipCode
      unit
    }
    roomCount
    bedroomCount
    fullBathroomCount
    halfBathroomCount
    livingAreaSize
    amenities {
      __typename
      list
      doormanTypes
      parkingTypes
      sharedOutdoorSpaceTypes
      storageSpaceTypes
    }
    features {
      __typename
      list
      fireplaceTypes
      privateOutdoorSpaceTypes
      views
    }
  }
  fragment RelloInfo on RelloExpress {
    __typename
    rentalId
    ctaEnabled
    link
  }
  fragment RentalPropertyHistory on RentalListingChangesOfInterest {
    __typename
    listingId
    sourceGroupLabel
    photos {
      __typename
      key
    }
    offMarketAt
    rentalEventsOfInterest {
      __typename
      date
      price
      ...PriceChangePercent
      ... on RentalStatusChangeOfInterest {
        status
      }
    }
  }
`;
