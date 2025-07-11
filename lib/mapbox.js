export const reverseGeoCode = async (lat, long) => {
  const accessToken = process.env.MAPBOX_ACCESS_TOKEN;

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${long},${lat}.json?access_token=${accessToken}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch location");
  }

  const data = await res.json();

  const place = data.features.find((f) => f.place_type.includes("place"));

  const city = place?.text;

  return city;
};
