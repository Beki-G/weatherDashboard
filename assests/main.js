function getUVIndex(lon, lat){
    let queryURL = "http://api.openweathermap.org/data/2.5/uvi?appid=18bc71d7f6e0c92a913dd1a6fd41b1da&lat="+lat+"&lon="+lon;
    
    $.ajax({
        url: queryURL,
        method:"GET"
    }).then(function(response){
        let uvIndex = response.value
        let currentUV = $("<div></div>").text("UV Index: "+ uvIndex);
        $("#currentCard-stats").append(currentUV);
    })

}

function displayCurrentWeather(currentData){
    $("#currentCard-img").empty();
    $("#currentCard-stats").empty();

    let imgSrc = "http://openweathermap.org/img/wn/"+currentData.weather[0].icon+"@2x.png"

    let currentImg = $("<img id='currentIcon'>");
    currentImg.attr("src", imgSrc);

    let currentTemp = $("<div></div>").text("Temperature: "+currentData.main.temp);
    
    let currentHumidity = $("<div></div>").text("Humidity: "+currentData.main.humidity);

    let currentWind = $("<div></div>").text("Wind Speed: "+currentData.wind.speed)
    
    getUVIndex(currentData.coord.lon, currentData.coord.lat)

    $("#currentCard-cityName").text(currentData.name);
    $("#currentCard-img").append(currentImg);
    $("#currentCard-img").css("text-align", "center");
    $("#currentCard-stats").append(currentTemp);
    $("#currentCard-stats").append(currentHumidity);
    $("#currentCard-stats").append(currentWind);
    
}

function formatDate(dateStr){
    const d = new Date(dateStr)
    const year = d.getFullYear();
    const day = d.getDate();
    const month = d.getMonth()+1;

    let date = month+"/"+day+"/"+year;

    return date
}

function displayForecastWeather(forecastData){
    
    let forecastArr = forecastData.list
    let j = 0

    for (let i =0; i<40; i+=8){
        let imgSrc = "http://openweathermap.org/img/wn/"+forecastArr[i].weather[0].icon+"@2x.png";

        let forecastImg = $("<img>");

        forecastImg.attr("src", imgSrc);
        forecastImg.css("margin", "0 auto");
        forecastImg.css("display", "block");

        let formattedDate = formatDate(forecastArr[i].dt_txt);

        let forecastTemp = $("<div></div>").text("Temp: "+ forecastArr[i].main.temp)

        let forecastHumidity =$("<div></div>").text("Humidity: "+ forecastArr[i].main.humidity);

        let forecastChild = "#forcast-"+j;

        $(forecastChild).text(formattedDate);
        $(forecastChild).append(forecastImg);
        $(forecastChild).append(forecastTemp);
        $(forecastChild).append(forecastHumidity);
        $(forecastChild).css("text-align", "center");
        $(forecastChild).css("margin-bottom", "10px");

        j++
    }

}

function getWeatherData(cityStr){
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q="+cityStr+"&appid=18bc71d7f6e0c92a913dd1a6fd41b1da&units=imperial"

    $.ajax({
        url:queryURL,
        method: "GET"        
    }).then(function(response){
        displayCurrentWeather(response);
    })

    let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q="+cityStr+"&appid=18bc71d7f6e0c92a913dd1a6fd41b1da&units=imperial"

    $.ajax({
        url:forecastQueryURL,
        method:"GET"
    }).then(function(response){
        displayForecastWeather(response);
    })

}

$("#citySearchbtn").click(function(event){
    event.preventDefault();
    let city = $("#cityName").val();
    getWeatherData(city);

})