"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Amenities = exports.Areas = void 0;
exports.Areas = Object.freeze({
    // Regions
    ALL_NYC_AND_NJ: 1,
    // Boroughs
    MANHATTAN: 100,
    BRONX: 200,
    BROOKLYN: 300,
    QUEENS: 400,
    STATEN_ISLAND: 500,
});
exports.Amenities = Object.freeze({
    // Unit Amenities
    WASHER_DRYER: "WASHER_DRYER",
    DISHWASHER: "DISHWASHER",
    PRIVATE_OUTDOOR_SPACE: "PRIVATE_OUTDOOR_SPACE",
    CENTRAL_AC: "CENTRAL_AC",
    FURNISHED: "FURNISHED",
    FIREPLACE: "FIREPLACE",
    LOFT: "LOFT",
    // Views
    CITY_VIEW: "CITY_VIEW",
    GARDEN_VIEW: "GARDEN_VIEW",
    PARK_VIEW: "PARK_VIEW",
    SKYLINE_VIEW: "SKYLINE_VIEW",
    WATER_VIEW: "WATER_VIEW",
    // Building Amenities
    DOORMAN: "DOORMAN",
    LAUNDRY: "LAUNDRY",
    ELEVATOR: "ELEVATOR",
    GYM: "GYM",
    PARKING: "PARKING",
    SHARED_OUTDOOR_SPACE: "SHARED_OUTDOOR_SPACE",
    POOL: "POOL",
    PIED_A_TERRE_ALLOWED: "PIED_A_TERRE_ALLOWED",
    CHILDRENS_PLAYROOM: "CHILDRENS_PLAYROOM",
    SMOKE_FREE: "SMOKE_FREE",
    STORAGE_SPACE: "STORAGE_SPACE",
    GUARANTORS_ACCEPTED: "GUARANTORS_ACCEPTED",
});
// Example usage:
// filters: {
//   areas: [Areas.MANHATTAN, Areas.BROOKLYN] // Search in multiple boroughs
// }
