const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Function to get latitude, longitude, and English name using OpenStreetMap API
async function getGeocodeData(locationName) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    locationName
  )}&format=json&limit=1`;
  try {
    const response = await axios.get(url, {
      headers: {
        "Accept-Language": "en", // Request English language
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
}

// Main function to process cities and provinces
async function processCities() {
  try {
    const citiesFilePath = path.join(__dirname, "cities1.json");
    const updatedCitiesFilePath = path.join(__dirname, "updated_cities1.json");

    // Read the JSON file with cities
    const citiesData = JSON.parse(fs.readFileSync(citiesFilePath, "utf-8"));

    for (const province of citiesData) {
      // Process province
      const provinceName = province.name;
      console.log(`Processing province: ${provinceName}`);
      const provinceGeocodeData = await getGeocodeData(provinceName);

      if (provinceGeocodeData) {
        province.latitude = provinceGeocodeData.latitude;
        province.longitude = provinceGeocodeData.longitude;
        province.english_name = provinceGeocodeData.englishName;
      } else {
        console.log(`Could not find data for province: ${provinceName}`);
      }

      // Process each city
      for (const city of province.cities) {
        const cityName = city.name;
        console.log(`Processing city: ${cityName}`);
        const geocodeData = await getGeocodeData(cityName);

        if (geocodeData) {
          city.latitude = geocodeData.latitude;
          city.longitude = geocodeData.longitude;
          city.english_name = geocodeData.englishName;
        } else {
          console.log(`Could not find data for city: ${cityName}`);
        }

        // Respect the OpenStreetMap API rate limit (1 request per second)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Save the updated JSON back to file
    fs.writeFileSync(
      updatedCitiesFilePath,
      JSON.stringify(citiesData, null, 4),
      "utf-8"
    );

    console.log(
      "Cities and provinces updated with latitude, longitude, and English names."
    );
  } catch (error) {
    console.error("Error processing cities:", error.message);
  }
}

processCities();
