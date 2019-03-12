import { ClassInstance } from '../interfaces/model';
import { Location } from '../models/schemas/location';

export interface LatLng {
  latitude: string | number;
  longitude: string | number;
}

export const latLngToLocation = ({ latitude, longitude }: LatLng) => {
  const lng = typeof longitude === 'number' ? longitude : parseFloat(longitude);
  const lat = typeof latitude === 'number' ? latitude : parseFloat(latitude);
  return {
    type: 'Point' as 'Point',
    coordinates: [lng, lat] as [number, number],
  };
};

export const locationToLatLng = ({ coordinates }: ClassInstance<Location>) => ({
  latitude: coordinates[1],
  longitude: coordinates[0],
});
