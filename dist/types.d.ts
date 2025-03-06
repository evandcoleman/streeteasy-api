import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { AreaCode, Amenity } from "./constants";
export interface ApiResponse<T> {
    status: number;
    data: T;
}
export interface ApiError {
    status: number;
    message: string;
    errors?: string[];
}
export interface GraphQLErrorLocation {
    line: number;
    column: number;
}
export type GraphQLErrorExtensions = Record<string, unknown>;
export interface GraphQLError {
    message: string;
    locations?: GraphQLErrorLocation[];
    path?: string[];
    extensions?: GraphQLErrorExtensions;
}
export type QueryResponse<T> = {
    data: T;
    errors?: GraphQLError[];
};
export type Variables = Record<string, unknown>;
export type BuildingType = "CO_OP" | "CONDO" | "MULTI_FAMILY" | "RENTAL" | "TOWNHOUSE";
export interface GeoPoint {
    latitude: number;
    longitude: number;
}
export interface LeadMedia {
    photo: {
        key: string;
    };
}
export interface RentalListing {
    id: string;
    areaName: string;
    bedroomCount: number;
    buildingType: BuildingType;
    fullBathroomCount: number;
    geoPoint: GeoPoint;
    halfBathroomCount: number;
    noFee: boolean;
    leadMedia: LeadMedia;
    price: number;
    sourceGroupLabel: string;
    street: string;
    unit: string;
    urlPath: string;
}
export interface RentalEdge {
    node: RentalListing;
}
export interface SearchRentalsResponse {
    searchRentals: {
        search: {
            criteria: string;
        };
        totalCount: number;
        edges: RentalEdge[];
    };
}
export interface NumberRange {
    lowerBound: number | null;
    upperBound: number | null;
}
export interface SearchFilters {
    areas?: AreaCode[];
    rentalStatus?: "ACTIVE";
    price?: NumberRange;
    bedrooms?: NumberRange;
    bathrooms?: NumberRange;
    amenities?: Amenity[];
    petsAllowed?: boolean;
}
export interface Sorting {
    attribute: "RECOMMENDED" | "PRICE" | "DATE_LISTED";
    direction: "ASCENDING" | "DESCENDING";
}
export interface SearchRentalsInput {
    sorting?: Sorting;
    adStrategy?: "NONE";
    filters: SearchFilters;
    perPage?: number;
    page?: number;
    userSearchToken?: string;
}
export interface RentalSearchVariables {
    input: SearchRentalsInput;
}
export type { TypedDocumentNode };
