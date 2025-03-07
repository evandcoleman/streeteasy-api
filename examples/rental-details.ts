import { StreetEasyClient } from '../src';

async function main() {
  // Create a new client
  const client = new StreetEasyClient();

  try {
    // Example listing ID - replace with a real listing ID
    const listingID = '4652509';

    // Fetch rental listing details
    const response = await client.getRentalListingDetails(listingID);

    // Get the rental listing data
    const listing = response.rentalByListingId;
    const building = response.buildingByRentalListingId;
    const nearbySchools = response.getBuildingExpressByRentalListingId.nearbySchools;

    // Log basic listing information
    console.log('\nLISTING DETAILS:');
    console.log('----------------');
    console.log(`ID: ${listing.id}`);
    console.log(`Status: ${listing.status}`);
    console.log(`Price: $${listing.pricing.price} ${listing.pricing.noFee ? '(NO FEE)' : ''}`);
    console.log(`Address: ${listing.propertyDetails.address.street} ${listing.propertyDetails.address.unit}`);
    console.log(`Area: ${building.area.name}`);
    console.log(`Size: ${listing.propertyDetails.livingAreaSize} sq ft`);
    console.log(`Bedrooms: ${listing.propertyDetails.bedroomCount}`);
    console.log(`Bathrooms: ${listing.propertyDetails.fullBathroomCount} full, ${listing.propertyDetails.halfBathroomCount} half`);
    console.log(`Available: ${listing.availableAt}`);
    
    // Log amenities
    console.log('\nAMENITIES:');
    console.log('----------');
    listing.propertyDetails.amenities.list.forEach(amenity => {
      console.log(`- ${amenity.replace(/_/g, ' ').toLowerCase()}`);
    });
    
    // Log features
    console.log('\nFEATURES:');
    console.log('---------');
    listing.propertyDetails.features.list.forEach(feature => {
      console.log(`- ${feature.replace(/_/g, ' ').toLowerCase()}`);
    });
    
    // Log building information
    console.log('\nBUILDING INFORMATION:');
    console.log('--------------------');
    console.log(`Name: ${building.name}`);
    console.log(`Type: ${building.type}`);
    console.log(`Year Built: ${building.yearBuilt}`);
    console.log(`Units: ${building.residentialUnitCount}`);
    
    // Log nearby transit
    console.log('\nNEARBY TRANSIT:');
    console.log('--------------');
    building.nearby.transitStations.forEach(station => {
      console.log(`- ${station.name} (${station.distance.toFixed(2)} miles): ${station.routes.join(', ')}`);
    });
    
    // Log nearby schools
    console.log('\nNEARBY SCHOOLS:');
    console.log('--------------');
    nearbySchools.forEach(school => {
      console.log(`- ${school.name} (District ${school.district}): Grades ${school.grades.join(', ')}`);
    });
    
    // Log description
    console.log('\nDESCRIPTION:');
    console.log('------------');
    console.log(listing.description);
    
  } catch (error) {
    // Debug: Log the full error
    console.error('Error details:', error);
    console.error('Error fetching rental details:', error instanceof Error ? error.message : String(error));
  }
}

main().catch(console.error); 