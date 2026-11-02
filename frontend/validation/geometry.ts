
type Point3D = { x: number; y: number; z: number };
type PointY = { y: number };

/** Angle in degrees at vertex `b` between segments b→a and b→c (x, y and z). */
export function calculateAngle(a: Point3D, b: Point3D, c: Point3D): number {
  const bax = a.x - b.x;
  const bay = a.y - b.y;
  const baz = a.z - b.z;

  const bcx = c.x - b.x;
  const bcy = c.y - b.y;
  const bcz = c.z - b.z;

  const dot = bax * bcx + bay * bcy + baz * bcz;
  const magBA = Math.sqrt(bax * bax + bay * bay + baz * baz);
  const magBC = Math.sqrt(bcx * bcx + bcy * bcy + bcz * bcz);

  if (magBA === 0 || magBC === 0) return 0;

  // Clamp floating-point error: acos(1.0000001) is NaN
  const cos = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Absolute vertical (Y) distance. */
export function distanceY(a: PointY, b: PointY): number {
  return Math.abs(a.y - b.y);
}
