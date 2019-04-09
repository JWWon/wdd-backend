interface Query {
  coordinates?: string;
  range?: string;
  [x: string]: any;
}

export const pickLocation = (q: Query) => {
  const query: any = {
    $near: {
      $geometry: {
        coordinates: JSON.parse((q.coordinates as any) as string),
        type: 'Point',
      },
    },
  };
  if (q.range) query.$near.$maxDistance = parseFloat(q.range) * 1000;
  return query;
};

export function calcDistance(posX: number[], posY: number[]) {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 -
    c((posY[1] - posX[1]) * p) / 2 +
    (c(posX[1] * p) * c(posY[1] * p) * (1 - c((posY[0] - posX[0]) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
