"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_request_1 = require("graphql-request");
const index_1 = require("../index");
const queries_1 = require("../queries");
// Create a ClientError class for testing
class ClientError extends Error {
    constructor(message, response, request) {
        super(message);
        this.name = "ClientError";
        this.response = response;
        this.request = request;
    }
}
// Mock GraphQLClient
jest.mock("graphql-request");
// Mock the UUID library
jest.mock("uuid", () => ({
    v4: jest.fn(() => "mock-uuid"),
}));
describe("StreetEasyClient", () => {
    let client;
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Mock successful response
        graphql_request_1.GraphQLClient.mockImplementation(() => ({
            request: jest.fn().mockResolvedValue({
                searchRentals: {
                    search: {
                        criteria: "area:400|price:-10000",
                    },
                    totalCount: 1,
                    edges: [
                        {
                            node: {
                                id: "123",
                                areaName: "Queens",
                                bedroomCount: 2,
                                buildingType: "RENTAL",
                                fullBathroomCount: 1,
                                geoPoint: {
                                    latitude: 40.7128,
                                    longitude: -73.8067,
                                },
                                halfBathroomCount: 0,
                                noFee: true,
                                leadMedia: {
                                    photo: {
                                        key: "photo123",
                                    },
                                },
                                price: 2500,
                                sourceGroupLabel: "Agency",
                                street: "123 Main St",
                                unit: "2B",
                                urlPath: "/rental/123",
                            },
                        },
                    ],
                },
            }),
        }));
    });
    describe("constructor", () => {
        it("should create client with default endpoint", () => {
            client = new index_1.StreetEasyClient();
            expect(graphql_request_1.GraphQLClient).toHaveBeenCalledWith("https://api-v6.streeteasy.com/", expect.any(Object));
        });
        it("should create client with custom endpoint", () => {
            const customEndpoint = "https://custom.endpoint/graphql";
            client = new index_1.StreetEasyClient({ endpoint: customEndpoint });
            expect(graphql_request_1.GraphQLClient).toHaveBeenCalledWith(customEndpoint, expect.any(Object));
        });
        it("should handle empty config object", () => {
            client = new index_1.StreetEasyClient({});
            expect(graphql_request_1.GraphQLClient).toHaveBeenCalledWith("https://api-v6.streeteasy.com/", expect.any(Object));
        });
        it("should handle undefined config", () => {
            client = new index_1.StreetEasyClient(undefined);
            expect(graphql_request_1.GraphQLClient).toHaveBeenCalledWith("https://api-v6.streeteasy.com/", expect.any(Object));
        });
    });
    describe("request", () => {
        beforeEach(() => {
            client = new index_1.StreetEasyClient();
        });
        it("should make successful request", async () => {
            const mockResponse = {
                searchRentals: {
                    totalCount: 1,
                    edges: [],
                },
            };
            const mockClient = {
                request: jest.fn().mockResolvedValue(mockResponse),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            const response = await client.request(queries_1.SEARCH_RENTALS_QUERY, {
                filters: {},
            });
            expect(response).toEqual(mockResponse);
            expect(mockClient.request).toHaveBeenCalledWith(queries_1.SEARCH_RENTALS_QUERY, {
                filters: {},
            });
        });
        it("should handle Error objects", async () => {
            const mockClient = {
                request: jest.fn().mockRejectedValue(new Error("API Error")),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            await expect(client.request(queries_1.SEARCH_RENTALS_QUERY, { filters: {} })).rejects.toThrow("StreetEasy GraphQL Error: API Error");
        });
        it("should handle string errors", async () => {
            const mockClient = {
                request: jest.fn().mockRejectedValue("String error message"),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            await expect(client.request(queries_1.SEARCH_RENTALS_QUERY)).rejects.toThrow("StreetEasy GraphQL Error: String error message");
        });
        it("should handle null/undefined errors", async () => {
            const mockClient = {
                request: jest.fn().mockRejectedValue(null),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            await expect(client.request(queries_1.SEARCH_RENTALS_QUERY)).rejects.toThrow("StreetEasy GraphQL Error: null");
        });
        it("should handle ClientError with validation errors", async () => {
            const validationError = new ClientError("invalid type for variable: 'input'", {
                errors: [
                    {
                        message: "invalid type for variable: 'input'",
                        extensions: {
                            name: "input",
                            code: "VALIDATION_INVALID_TYPE_VARIABLE",
                        },
                    },
                ],
                status: 400,
                headers: {},
            }, {
                query: queries_1.SEARCH_RENTALS_QUERY,
                variables: {
                    input: {
                    /* invalid data */
                    },
                },
            });
            const mockClient = {
                request: jest.fn().mockRejectedValue(validationError),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            await expect(client.request(queries_1.SEARCH_RENTALS_QUERY, {
                input: {
                /* invalid data */
                },
            })).rejects.toThrow("StreetEasy GraphQL Error: invalid type for variable: 'input'");
        });
    });
    describe("searchRentals", () => {
        beforeEach(() => {
            client = new index_1.StreetEasyClient();
        });
        it("should make rental search request", async () => {
            const mockClient = {
                request: jest.fn().mockResolvedValue({
                    searchRentals: {
                        totalCount: 1,
                        edges: [],
                    },
                }),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            const params = {
                filters: {},
            };
            const response = await client.searchRentals(params);
            expect(response.searchRentals).toBeDefined();
            expect(mockClient.request).toHaveBeenCalledWith(queries_1.SEARCH_RENTALS_QUERY, {
                input: {
                    ...params,
                    adStrategy: "NONE",
                    userSearchToken: "mock-uuid",
                },
            });
        });
        it("should handle search errors", async () => {
            const mockClient = {
                request: jest.fn().mockRejectedValue(new Error("API Error")),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            const params = {
                filters: {},
            };
            await expect(client.searchRentals(params)).rejects.toThrow("StreetEasy GraphQL Error: API Error");
        });
        it("should set adStrategy to 'NONE' by default", async () => {
            const mockClient = {
                request: jest.fn().mockResolvedValue({
                    searchRentals: {
                        totalCount: 1,
                        edges: [],
                    },
                }),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            const params = {
                filters: {},
            };
            await client.searchRentals(params);
            expect(mockClient.request).toHaveBeenCalledWith(queries_1.SEARCH_RENTALS_QUERY, {
                input: {
                    ...params,
                    adStrategy: "NONE",
                    userSearchToken: "mock-uuid",
                },
            });
        });
        it("should not override adStrategy if already provided", async () => {
            const mockClient = {
                request: jest.fn().mockResolvedValue({
                    searchRentals: {
                        totalCount: 1,
                        edges: [],
                    },
                }),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            const params = {
                filters: {},
                adStrategy: "NONE",
            };
            await client.searchRentals(params);
            expect(mockClient.request).toHaveBeenCalledWith(queries_1.SEARCH_RENTALS_QUERY, {
                input: {
                    ...params,
                    userSearchToken: "mock-uuid",
                },
            });
        });
        it("should not override userSearchToken if already provided", async () => {
            const mockClient = {
                request: jest.fn().mockResolvedValue({
                    searchRentals: {
                        totalCount: 1,
                        edges: [],
                    },
                }),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            const params = {
                filters: {},
                userSearchToken: "custom-token",
            };
            await client.searchRentals(params);
            expect(mockClient.request).toHaveBeenCalledWith(queries_1.SEARCH_RENTALS_QUERY, {
                input: {
                    ...params,
                    adStrategy: "NONE",
                },
            });
        });
    });
    describe("getRentalListingDetails", () => {
        beforeEach(() => {
            client = new index_1.StreetEasyClient();
        });
        it("should fetch rental listing details", async () => {
            const mockResponse = {
                rentalByListingId: {
                    id: "4652509",
                    status: "ACTIVE",
                    propertyDetails: {
                        address: {
                            street: "123 Main St",
                            unit: "4B",
                        },
                        bedroomCount: 2,
                        fullBathroomCount: 1,
                        halfBathroomCount: 0,
                    },
                    pricing: {
                        price: 3500,
                        noFee: true,
                    },
                },
                buildingByRentalListingId: {
                    name: "Test Building",
                    type: "CONDO",
                    area: {
                        name: "Manhattan",
                    },
                },
            };
            const mockClient = {
                request: jest.fn().mockResolvedValue(mockResponse),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            const listingID = "4652509";
            const response = await client.getRentalListingDetails(listingID);
            expect(response).toEqual(mockResponse);
            expect(mockClient.request).toHaveBeenCalledWith(queries_1.RENTAL_LISTING_DETAILS_QUERY, { listingID });
        });
        it("should handle errors when fetching rental details", async () => {
            const mockClient = {
                request: jest.fn().mockRejectedValue(new Error("API Error")),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            const listingID = "4652509";
            await expect(client.getRentalListingDetails(listingID)).rejects.toThrow("StreetEasy GraphQL Error: API Error");
        });
        it("should handle partial or missing data in the response", async () => {
            // Mock response with some null or missing fields
            const mockResponse = {
                rentalByListingId: {
                    id: "4652509",
                    status: "ACTIVE",
                    offMarketAt: null,
                    availableAt: null,
                    propertyDetails: {
                        address: {
                            street: "123 Main St",
                            unit: null,
                        },
                        bedroomCount: 2,
                        fullBathroomCount: 1,
                        halfBathroomCount: 0,
                    },
                    pricing: {
                        price: 3500,
                        noFee: true,
                    },
                    media: {
                        photos: [],
                        floorPlans: null,
                    },
                },
                buildingByRentalListingId: {
                    name: "Test Building",
                    type: "CONDO",
                    area: {
                        name: "Manhattan",
                    },
                },
                getRelloRentalById: null,
            };
            const mockClient = {
                request: jest.fn().mockResolvedValue(mockResponse),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            const listingID = "4652509";
            const response = await client.getRentalListingDetails(listingID);
            expect(response).toEqual(mockResponse);
            // Verify we can handle null values
            expect(response.rentalByListingId.offMarketAt).toBeNull();
            expect(response.rentalByListingId.propertyDetails.address.unit).toBeNull();
            expect(response.rentalByListingId.media.floorPlans).toBeNull();
            expect(response.getRelloRentalById).toBeNull();
        });
        it("should pass the correct listing ID to the request", async () => {
            const mockResponse = { data: "test" };
            const mockClient = {
                request: jest.fn().mockResolvedValue(mockResponse),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            // Test with a numeric listing ID as string
            await client.getRentalListingDetails("12345");
            expect(mockClient.request).toHaveBeenCalledWith(queries_1.RENTAL_LISTING_DETAILS_QUERY, { listingID: "12345" });
            // Reset the mock and test with another ID
            mockClient.request.mockClear();
            await client.getRentalListingDetails("abc-123");
            expect(mockClient.request).toHaveBeenCalledWith(queries_1.RENTAL_LISTING_DETAILS_QUERY, { listingID: "abc-123" });
        });
        it("should handle a complete response with all nested objects", async () => {
            // Mock a complete response with all nested objects from the schema
            const mockResponse = {
                rentalByListingId: {
                    __typename: "RentalListing",
                    id: "4652509",
                    offMarketAt: null,
                    availableAt: "2024-05-15",
                    buildingId: "12345",
                    status: "ACTIVE",
                    statusChanges: [
                        {
                            __typename: "RentalStatusChange",
                            status: "ACTIVE",
                            changedAt: "2024-04-01T12:00:00Z",
                        },
                    ],
                    createdAt: "2024-04-01T12:00:00Z",
                    updatedAt: "2024-04-01T12:00:00Z",
                    interestingChangeAt: "2024-04-01T12:00:00Z",
                    description: "Nice apartment",
                    media: {
                        __typename: "Media",
                        photos: [
                            {
                                __typename: "Photo",
                                key: "photo1",
                            },
                        ],
                        floorPlans: [
                            {
                                __typename: "FloorPlan",
                                key: "floorplan1",
                            },
                        ],
                        videos: [],
                        tour3dUrl: null,
                        assetCount: 2,
                    },
                    propertyDetails: {
                        __typename: "PropertyDetails",
                        address: {
                            __typename: "Address",
                            street: "123 Main St",
                            houseNumber: "123",
                            streetName: "Main St",
                            city: "New York",
                            state: "NY",
                            zipCode: "10001",
                            unit: "4B",
                        },
                        roomCount: 3,
                        bedroomCount: 1,
                        fullBathroomCount: 1,
                        halfBathroomCount: 0,
                        livingAreaSize: 750,
                        amenities: {
                            __typename: "BuildingAmenities",
                            list: ["DOORMAN", "ELEVATOR"],
                            doormanTypes: [],
                            parkingTypes: [],
                            sharedOutdoorSpaceTypes: [],
                            storageSpaceTypes: [],
                        },
                        features: {
                            __typename: "PropertyFeatures",
                            list: ["HARDWOOD_FLOORS", "DISHWASHER"],
                            fireplaceTypes: [],
                            privateOutdoorSpaceTypes: [],
                            views: [],
                        },
                    },
                    mlsNumber: null,
                    backOffice: {
                        __typename: "RentalBackOffice",
                        brokerageListingId: null,
                    },
                    pricing: {
                        __typename: "RentalPricing",
                        leaseTermMonths: 12,
                        monthsFree: null,
                        noFee: true,
                        price: 3500,
                        priceDelta: null,
                        priceChanges: [],
                    },
                    recentListingsPriceStats: {
                        __typename: "NeighborhoodPriceStats",
                        rentalPriceStats: {
                            __typename: "PriceStats",
                            medianPrice: 3400,
                        },
                        salePriceStats: {
                            __typename: "PriceStats",
                            medianPrice: 750000,
                        },
                    },
                    upcomingOpenHouses: [],
                    listingSource: {
                        __typename: "ListingSource",
                        sourceType: "BROKER",
                    },
                    propertyHistory: [],
                },
                buildingByRentalListingId: {
                    __typename: "Building",
                    id: "12345",
                    name: "The Building",
                    type: "CONDO",
                    residentialUnitCount: 100,
                    yearBuilt: 2000,
                    status: "COMPLETED",
                    additionalDetails: {
                        __typename: "BuildingAdditionalDetails",
                        leasingStartDate: null,
                        salesStartDate: null,
                    },
                    address: {
                        __typename: "Address",
                        street: "123 Main St",
                        city: "New York",
                        state: "NY",
                        zipCode: "10001",
                    },
                    heroImage: null,
                    media: {
                        __typename: "Media",
                        photos: [],
                    },
                    complex: null,
                    area: {
                        __typename: "Area",
                        name: "Manhattan",
                    },
                    saleInventorySummary: {
                        __typename: "SaleInventorySummary",
                        availableListingDigests: [],
                    },
                    rentalInventorySummary: {
                        __typename: "RentalInventorySummary",
                        availableListingDigests: [],
                    },
                    isLandLease: null,
                    policies: null,
                    nearby: {
                        __typename: "Nearby",
                        transitStations: [],
                    },
                },
                getBuildingExpressByRentalListingId: {
                    __typename: "BuildingExpress",
                    nearbySchools: [],
                },
                getRelloRentalById: null,
                getRentalListingExpressById: {
                    __typename: "RentalListingExpress",
                    hasActiveBuildingShowcase: false,
                },
            };
            const mockClient = {
                request: jest.fn().mockResolvedValue(mockResponse),
            };
            graphql_request_1.GraphQLClient.mockImplementation(() => mockClient);
            client = new index_1.StreetEasyClient();
            const listingID = "4652509";
            const response = await client.getRentalListingDetails(listingID);
            expect(response).toEqual(mockResponse);
            // Verify we can access all the nested properties
            expect(response.rentalByListingId.id).toBe("4652509");
            expect(response.rentalByListingId.propertyDetails.address.city).toBe("New York");
            expect(response.rentalByListingId.media.photos[0].key).toBe("photo1");
            expect(response.buildingByRentalListingId.type).toBe("CONDO");
            expect(response.getRentalListingExpressById.hasActiveBuildingShowcase).toBe(false);
        });
    });
});
