// @ts-ignore
import axios from "axios";

// Function to get latitude, longitude, and English name using OpenStreetMap API
export const getGeocodeData = async (locationName) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    locationName
  )}&format=json&limit=1`;
  try {
    const response = await axios.get(url, {
      headers: {
        "Accept-Language": "en",
      },
    });
    if (response.status === 200 && response.data.length > 0) {
      const data = response.data[0];
      // Extract English name from `display_name` or use the location name if `display_name` is not in English
      const englishName = data.display_name.split(",")[0] || locationName;
      return {
        latitude: data.lat,
        longitude: data.lon,
        englishName: englishName,
      };
    }
    console.log(`No data found for location: ${locationName}`);
  } catch (error) {
    console.error(
      `Error fetching data for location: ${locationName}`,
      error.message
    );
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  }
  return null;
};
