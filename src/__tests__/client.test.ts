import { GraphQLClient } from "graphql-request";
import { StreetEasyClient } from "../index";
import { Areas, Amenities } from "../constants";
import { SEARCH_RENTALS_QUERY } from "../queries";
import type { SearchRentalsInput } from "../types";

// Create a ClientError class for testing
class ClientError extends Error {
  response: {
    errors: Array<{ message: string; extensions?: any }>;
    status: number;
    headers: any;
  };
  request: {
    query: string;
    variables: any;
  };

  constructor(message: string, response: any, request: any) {
    super(message);
    this.name = "ClientError";
    this.response = response;
    this.request = request;
  }
}

// Mock GraphQLClient
jest.mock("graphql-request");

describe("StreetEasyClient", () => {
  let client: StreetEasyClient;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock successful response
    (GraphQLClient as jest.Mock).mockImplementation(() => ({
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
      client = new StreetEasyClient();
      expect(GraphQLClient).toHaveBeenCalledWith(
        "https://api-v6.streeteasy.com/",
        expect.any(Object),
      );
    });

    it("should create client with custom endpoint", () => {
      const customEndpoint = "https://custom.endpoint/graphql";
      client = new StreetEasyClient({ endpoint: customEndpoint });
      expect(GraphQLClient).toHaveBeenCalledWith(
        customEndpoint,
        expect.any(Object),
      );
    });

    it("should handle empty config object", () => {
      client = new StreetEasyClient({});
      expect(GraphQLClient).toHaveBeenCalledWith(
        "https://api-v6.streeteasy.com/",
        expect.any(Object),
      );
    });

    it("should handle undefined config", () => {
      client = new StreetEasyClient(undefined);
      expect(GraphQLClient).toHaveBeenCalledWith(
        "https://api-v6.streeteasy.com/",
        expect.any(Object),
      );
    });
  });

  describe("request", () => {
    beforeEach(() => {
      client = new StreetEasyClient();
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

      (GraphQLClient as jest.Mock).mockImplementation(() => mockClient);

      client = new StreetEasyClient();
      const response = await client.request(SEARCH_RENTALS_QUERY, {
        filters: {},
      });

      expect(response).toEqual(mockResponse);
      expect(mockClient.request).toHaveBeenCalledWith(SEARCH_RENTALS_QUERY, {
        filters: {},
      });
    });

    it("should handle Error objects", async () => {
      const mockClient = {
        request: jest.fn().mockRejectedValue(new Error("API Error")),
      };

      (GraphQLClient as jest.Mock).mockImplementation(() => mockClient);

      client = new StreetEasyClient();
      await expect(
        client.request(SEARCH_RENTALS_QUERY, { filters: {} }),
      ).rejects.toThrow("StreetEasy GraphQL Error: API Error");
    });

    it("should handle string errors", async () => {
      const mockClient = {
        request: jest.fn().mockRejectedValue("String error message"),
      };

      (GraphQLClient as jest.Mock).mockImplementation(() => mockClient);

      client = new StreetEasyClient();
      await expect(client.request(SEARCH_RENTALS_QUERY)).rejects.toThrow(
        "StreetEasy GraphQL Error: String error message",
      );
    });

    it("should handle null/undefined errors", async () => {
      const mockClient = {
        request: jest.fn().mockRejectedValue(null),
      };

      (GraphQLClient as jest.Mock).mockImplementation(() => mockClient);

      client = new StreetEasyClient();
      await expect(client.request(SEARCH_RENTALS_QUERY)).rejects.toThrow(
        "StreetEasy GraphQL Error: null",
      );
    });

    it("should handle ClientError with validation errors", async () => {
      const validationError = new ClientError(
        "invalid type for variable: 'input'",
        {
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
        },
        {
          query: SEARCH_RENTALS_QUERY,
          variables: {
            input: {
              /* invalid data */
            },
          },
        },
      );

      const mockClient = {
        request: jest.fn().mockRejectedValue(validationError),
      };

      (GraphQLClient as jest.Mock).mockImplementation(() => mockClient);

      client = new StreetEasyClient();
      await expect(
        client.request(SEARCH_RENTALS_QUERY, {
          input: {
            /* invalid data */
          },
        }),
      ).rejects.toThrow(
        "StreetEasy GraphQL Error: invalid type for variable: 'input'",
      );
    });
  });

  describe("searchRentals", () => {
    beforeEach(() => {
      client = new StreetEasyClient();
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

      (GraphQLClient as jest.Mock).mockImplementation(() => mockClient);

      client = new StreetEasyClient();
      const params = {
        filters: {},
      };

      const response = await client.searchRentals(params);

      expect(response.searchRentals).toBeDefined();
      expect(mockClient.request).toHaveBeenCalledWith(SEARCH_RENTALS_QUERY, {
        input: params,
      });
    });

    it("should handle search errors", async () => {
      const mockClient = {
        request: jest.fn().mockRejectedValue(new Error("API Error")),
      };

      (GraphQLClient as jest.Mock).mockImplementation(() => mockClient);

      client = new StreetEasyClient();
      const params = {
        filters: {},
      };

      await expect(client.searchRentals(params)).rejects.toThrow(
        "StreetEasy GraphQL Error: API Error",
      );
    });
  });
});
