let country = document.getElementById("country_text");
let result = document.getElementById("result");

const weatherApiKey = "04832b48640daf8e16d50a9329536918";
const newsApiKey = "7f16931598bf4f559d8cb615fa5a8c8e";

// ✅ Retrieve last searched country
window.onload = () => {
    const savedCountry = localStorage.getItem("lastCountry");
    if (savedCountry) {
        country.value = savedCountry;
        country.dispatchEvent(new KeyboardEvent("keypress", { key: "Enter" }));
    }
};

country.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        result.innerHTML = '';

        let countryName = country.value.trim();
        if (countryName === '') {
            result.innerHTML = `<p class="center validity">Field can't be empty</p>`;
            return;
        }

        // ✅ Save country name
        localStorage.setItem("lastCountry", countryName);

        let countryUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

        fetch(countryUrl)
            .then(response => {
                if (!response.ok) throw new Error("Country not found");
                return response.json();
            })
            .then(data => {
                console.log("Country Data:", data);

                let countryCode = data[0].cca2.toLowerCase();
                let capitalCity = data[0].capital ? data[0].capital[0] : null;

                // ✅ Save country info
                localStorage.setItem("countryInfo", JSON.stringify(data[0]));

                result.innerHTML = `
                    <img src="https://flagcdn.com/w320/${countryCode}.png" class="flags">
                    <h2 class="center">${data[0].name.common}</h2>
                    <p class="center"><b>Capital</b>: ${data[0].capital ? data[0].capital.join(", ") : 'N/A'}</p>
                    <p class="center"><b>Population</b>: ${data[0].population.toLocaleString()}</p>
                    <p class="center"><b>Currency</b>: ${data[0].currencies ? data[0].currencies[Object.keys(data[0].currencies)].name : 'N/A'}</p>
                    <p class="center"><b>Region</b>: ${data[0].region}</p>
                    <p class="center"><b>Languages</b>: ${Object.values(data[0].languages).join(", ")}</p>
                `;

                if (capitalCity) {
                    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${capitalCity}&appid=${weatherApiKey}&units=metric`;

                    fetch(weatherUrl)
                        .then(response => {
                            if (!response.ok) throw new Error("Weather data unavailable");
                            return response.json();
                        })
                        .then(weatherData => {
                            console.log("Weather Data:", weatherData);

                            // ✅ Save weather data
                            localStorage.setItem("weatherInfo", JSON.stringify(weatherData));

                            result.innerHTML += `
                                <div class="weather-info">
                                    <h3 class="center">Weather in ${capitalCity}</h3>
                                    <p class="center"><b>Temperature</b>: ${weatherData.main.temp}°C</p>
                                    <p class="center"><b>Weather</b>: ${weatherData.weather[0].description}</p>
                                    <p class="center"><b>Humidity</b>: ${weatherData.main.humidity}%</p>
                                    <p class="center"><b>Wind Speed</b>: ${weatherData.wind.speed} m/s</p>
                                </div>
                            `;

                            fetchNews(countryCode);
                        })
                        .catch(error => {
                            console.error("Weather Error:", error);
                            result.innerHTML += `<p class="center validity">${error.message}</p>`;
                            fetchNews(countryCode);
                        });
                } else {
                    fetchNews(countryCode);
                }
            })
            .catch(error => {
                console.error("Country Error:", error);
                result.innerHTML = `<p class="center validity">Please enter a valid Country</p>`;
            });
    }
});

function fetchNews(countryCode) {
    let newsUrl = `https://newsapi.org/v2/top-headlines?country=${countryCode}&apiKey=${newsApiKey}`;

    fetch(newsUrl)
        .then(res => {
            if (!res.ok) return res.json().then(e => { throw new Error(e.message); });
            return res.json();
        })
        .then(newsData => {
            console.log("News Data:", newsData);

            const articles = newsData.articles.slice(0, 5);

            // ✅ Save news
            localStorage.setItem("news", JSON.stringify(articles));

            if (articles.length > 0) {
                let newsHtml = `
                    <div class="news-info">
                        <h3 class="center">Latest News</h3>
                        <ul>
                `;
                articles.forEach(article => {
                    newsHtml += `
                        <li>
                            <a href="${article.url}" target="_blank">${article.title}</a>
                            <p>${article.description || "No description available"}</p>
                        </li>
                    `;
                });
                newsHtml += `</ul></div>`;
                result.innerHTML += newsHtml;
            } else {
                result.innerHTML += `<p class="center">No news available for this country</p>`;
            }
        })
        .catch(error => {
            console.error("News Error:", error);
            result.innerHTML += `<p class="center validity">${error.message}</p>`;
        });
}
