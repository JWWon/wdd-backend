interface LatLng {
  latitude: number;
  longitude: number;
}

export const queryLocation = (
  coordinates: [number, number],
  range?: string
) => ({
  $near: {
    $maxDistance: range ? parseFloat(range) * 1000 : 1000, // 1km
    $geometry: { coordinates, type: 'Point' },
  },
});

export function calcDistance(posX: number[], posY: number[]) {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 -
    c((posY[1] - posX[1]) * p) / 2 +
    (c(posX[1] * p) * c(posY[1] * p) * (1 - c((posY[0] - posX[0]) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
