import { SpecialLocationType, SPECIAL_LOCATION_SURCHARGES } from "./ohioRules";

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface TravelZone {
  code: string;
  label: string;
  minMiles: number;
  maxMiles: number | null;
  fee: number;
}

export interface TravelQuote {
  miles: number;
  zone: TravelZone;
  baseTravelFee: number;
  specialLocationSurcharge: number;
  totalTravelFee: number;
}

export const COLUMBUS_OHIO_COORDINATES: Coordinate = {
  lat: 39.9612,
  lng: -82.9988,
};

export const DEFAULT_TRAVEL_ZONES: TravelZone[] = [
  { code: "local", label: "Columbus core (0-10 miles)", minMiles: 0, maxMiles: 10, fee: 30 },
  {
    code: "metro",
    label: "Franklin County metro (10-20 miles)",
    minMiles: 10.01,
    maxMiles: 20,
    fee: 35,
  },
  {
    code: "extended",
    label: "Extended service area (20-30 miles)",
    minMiles: 20.01,
    maxMiles: 30,
    fee: 50,
  },
  {
    code: "custom",
    label: "Custom quote (30+ miles)",
    minMiles: 30.01,
    maxMiles: null,
    fee: 65,
  },
];

export const DEFAULT_AFTER_HOURS_SURCHARGE = 25;

export function determineTravelZone(
  miles: number,
  zones: TravelZone[] = DEFAULT_TRAVEL_ZONES,
): TravelZone {
  const matchedZone = zones.find((zone) => {
    if (zone.maxMiles === null) {
      return miles >= zone.minMiles;
    }

    return miles >= zone.minMiles && miles <= zone.maxMiles;
  });

  return matchedZone ?? zones[zones.length - 1];
}

export function calculateTravelFeeByMiles(
  miles: number,
  specialLocationType: SpecialLocationType = "standard",
  zones: TravelZone[] = DEFAULT_TRAVEL_ZONES,
): TravelQuote {
  const zone = determineTravelZone(miles, zones);
  const specialLocationSurcharge = SPECIAL_LOCATION_SURCHARGES[specialLocationType];

  return {
    miles,
    zone,
    baseTravelFee: zone.fee,
    specialLocationSurcharge,
    totalTravelFee: zone.fee + specialLocationSurcharge,
  };
}

export function calculateDistanceMiles(origin: Coordinate, destination: Coordinate): number {
  const earthRadiusMiles = 3958.8;
  const latDelta = degreesToRadians(destination.lat - origin.lat);
  const lngDelta = degreesToRadians(destination.lng - origin.lng);
  const originLat = degreesToRadians(origin.lat);
  const destinationLat = degreesToRadians(destination.lat);

  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(originLat) *
      Math.cos(destinationLat) *
      Math.sin(lngDelta / 2) *
      Math.sin(lngDelta / 2);

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Number((earthRadiusMiles * angularDistance).toFixed(1));
}

export function isAfterHours(appointmentIso: string): boolean {
  const appointmentDate = new Date(appointmentIso);

  if (Number.isNaN(appointmentDate.getTime())) {
    return false;
  }

  const hour = appointmentDate.getHours();
  return hour < 9 || hour >= 17;
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}
