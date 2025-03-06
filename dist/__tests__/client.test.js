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
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid'),
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
                    adStrategy: 'NONE',
                    userSearchToken: 'mock-uuid',
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
                    adStrategy: 'NONE',
                    userSearchToken: 'mock-uuid',
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
                adStrategy: 'NONE',
            };
            await client.searchRentals(params);
            expect(mockClient.request).toHaveBeenCalledWith(queries_1.SEARCH_RENTALS_QUERY, {
                input: {
                    ...params,
                    userSearchToken: 'mock-uuid',
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
                userSearchToken: 'custom-token',
            };
            await client.searchRentals(params);
            expect(mockClient.request).toHaveBeenCalledWith(queries_1.SEARCH_RENTALS_QUERY, {
                input: {
                    ...params,
                    adStrategy: 'NONE',
                },
            });
        });
    });
});
