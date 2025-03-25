// Function to randomly assign users to A/B test groups
function assignGroup() {
  // 50% chance to be assigned A or B
  const group = Math.random() < 0.5 ? "A" : "B";
  sessionStorage.setItem("ABTestGroup", group); // Save the group in sessionStorage called ABTestGroup (which means it will presist unless user closes page)
  return group;
}

// Get the current assigned group from sessionStorage or assign it if not already set
let group = sessionStorage.getItem("ABTestGroup");
if (!group) {
  group = assignGroup();
}

// Check if the user is assigned to Group A or B
if (group === "B") {
  // Select the 'Important Notice' div using the class
  const importantNotice = document.querySelector(
    ".NoticeBannerstyle__Wrapper-sc-a13t1y-0.dxrxFz.Placestyle__EmergencyNoticeBanner-sc-7yy3d-5.iftmDB.emergency-notice-banner"
  );

  // Create a new div element and assign it a class
  const newDiv = document.createElement("div");
  newDiv.classList.add("weather-forecast");

  // Insert the new div underneath the 'Important Notice' div
  importantNotice.insertAdjacentElement("afterend", newDiv);

  // Style the div
  newDiv.style.backgroundColor = "#ADD8E6";
  newDiv.style.padding = "20px";
  newDiv.style.border = "1px solid #D3D3D3";

  // Fetch data from mock weather API
  async function fetchWeather() {
    try {
      // Get the current time, hour and date
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentDateString = currentTime.toISOString().split("T")[0]; // gives date in YYYY-MM-DD format

      // Fetch the weather data
      const url =
        "https://europe-west1-amigo-actions.cloudfunctions.net/recruitment-mock-weather-endpoint/forecast?appid=a2ef86c41a&lat=27.987850&lon=86.925026";
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      let forecastData;
      let titleText;

      // Determine whether to display today's or tomorrow's data

      // If it's after 17:00 (closing time), display tomorrow's weather
      if (currentHour >= 17) {
        // time currently hardcoded but should be dynamic based on opening time from the page, to be implemented in future iteration
        forecastData = data.list.filter((entry) => {
          const entryDate = entry.dt_txt.split(" ")[0];
          return entryDate === getTomorrowDate();
        });
        titleText = "Tomorrow's Weather Forecast";

        // If it's before 17:00, display today's weather
      } else {
        forecastData = data.list.filter((entry) => {
          const entryDate = entry.dt_txt.split(" ")[0];
          return entryDate === currentDateString;
        });
        titleText = "Today's Weather Forecast";
      }

      // Create the title element and append it
      const title = document.createElement("h4");
      title.textContent = titleText;
      newDiv.appendChild(title);

      // Display the weather forecast data for the selected day, for times between 9:00 and 17:00 (opening times), also hardcoded, should be dynamic
      if (forecastData.length > 0) {
        // Create new weather container to hold each forecasat item (flex so that they are side by side)
        const weatherContainer = document.createElement("div");
        weatherContainer.style.display = "flex";
        weatherContainer.style.flexWrap = "wrap";
        weatherContainer.style.gap = "20px";

        forecastData
          .filter((entry) => {
            // Get the hour from each forecast entry
            const entryTime = new Date(entry.dt_txt).getHours();

            // Only show entries between 09:00 and 17:00
            return entryTime >= 9 && entryTime <= 17;
          })
          .forEach((entry) => {
            const time = entry.dt_txt.split(" ")[1].slice(0, 5);
            const temperature = entry.main.temp.toFixed(1); // temp to 1 decimal place
            const weather = entry.weather[0].main;

            // Create a div to hold each forecast
            const forecastItem = document.createElement("div");
            forecastItem.style.backgroundColor = "#f0f0f0";
            forecastItem.style.padding = "10px";
            forecastItem.style.borderRadius = "5px";
            forecastItem.style.width = "150px";

            // Create and append time, weather, and temperature paragraphs
            const timePara = document.createElement("p");
            timePara.textContent = `Time: ${time}`;

            const weatherPara = document.createElement("p");
            weatherPara.textContent = `Weather: ${weather}`;

            const tempPara = document.createElement("p");
            tempPara.textContent = `Temperature: ${temperature}°C`;

            forecastItem.appendChild(timePara);
            forecastItem.appendChild(weatherPara);
            forecastItem.appendChild(tempPara);

            // Append the forecast item to the weather container
            weatherContainer.appendChild(forecastItem);
          });

        // Append the weather container to the main div
        newDiv.appendChild(weatherContainer);
      } else {
        newDiv.textContent = "Weather data currently unavailable";
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      newDiv.textContent = "Failed to load weather data";
    }
  }

  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  fetchWeather();
}

// Next iteration to implement:
// dynamic handling of opening/closing times
// ARIA labels for accessibility
// unit testing e.g. testing that A/B is being correctly assigned at random

//A/B Testing
// Site owner (National Trust) to review Google Analytics data after a set period of time to detemine whether the added weather feature (test group B) correlates with increased ticket purchases.
