function getAndDisplayUVIndex(lon, lat){
    let queryURL = "http://api.openweathermap.org/data/2.5/uvi?appid=18bc71d7f6e0c92a913dd1a6fd41b1da&lat="+lat+"&lon="+lon;
    
    $.ajax({
        url: queryURL,
        method:"GET"
    }).then(function(response){
        let uvIndex = response.value
        let currentUV = $("<div></div>")
        let spanEl = $("<span></span>").text("UV Index: "+ uvIndex);

        let uvBackground = (uvIndex<=2) ? "uvLow": 
        (uvIndex<=5 && uvIndex>2)? "uvModerate": 
        (uvIndex<=7 && uvIndex>5)? "uvHigh": 
        (uvIndex<=10 &&uvIndex>7)? "uvVeryHigh": "uvExtreme";

        spanEl.attr("class", uvBackground);

        currentUV.append(spanEl);
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
    
    getAndDisplayUVIndex(currentData.coord.lon, currentData.coord.lat)

    $("#currentCard-cityName").text(currentData.name);
    $("#currentCard-img").append(currentImg);
    $("#currentCard-img").css("text-align", "center");
    $("#currentCard-stats").append(currentTemp);
    $("#currentCard-stats").append(currentHumidity);
    $("#currentCard-stats").append(currentWind);
    
}

function statecheck(str){
    let count = 0;
    let index;
    let isState= false;    

    for(let i = 0; i<str.length; i++){
        if(str[i]===","){
            ++count;
        }
    }
    if (count===1){
        index = str.search(",")+1;
        let subStr = str.substr(index);
        for (let i = 0; i<stateAbbreviations.length; i++){
            subStr = subStr.toUpperCase(subStr);
            if(stateAbbreviations[i]=== subStr){
                str = str.substr(0,index)+""+subStr+",us"
            }
        }
    };
    return str;
}

function formatDate(dateStr){
    const d = new Date(dateStr)
    const year = d.getFullYear();
    const day = d.getDate();
    const month = d.getMonth()+1;

    let date = month+"/"+day+"/"+year;

    return date
}

function formatCityStr(str){
    let cityName = str;

    cityName=cityName.split(" ").join("");
    cityName=cityName.toLowerCase();
    cityName= statecheck(cityName);

    return cityName
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

        j++;
    }

}

function displaySearchHistory(){
    $("#pastCityList").empty();
    if("weatherSearchHistory" in localStorage){
        let jsonStr = localStorage.getItem("weatherSearchHistory");
        let cityArr = JSON.parse(jsonStr);

        for (const city in cityArr){
          let liEl = $("<li></li>").text(cityArr[city].name);

          liEl.attr("style", "list-style: none;")
          
          $("#pastCityList").append(liEl);
        }
    } else{
        $("#pastCityList").text("Use the Search function to get started")
    }
}

function updateSearchHistory(city){
    let cityArr = [];
    let isSearchedBefore = false;
    let cityObj = {name:city}

    if("weatherSearchHistory" in localStorage){
        let jsonStr = localStorage.getItem("weatherSearchHistory");
        cityArr = JSON.parse(jsonStr);

        for (let i = 0; i<cityArr.length; i++){
            if(cityArr[i].name===city){
                isSearchedBefore =true;
            }
        }

        if(isSearchedBefore === false){
            cityArr.unshift(cityObj);
        }

        if(cityArr.length>10){
            cityArr.length=10;
        }

        localStorage.setItem("weatherSearchHistory", JSON.stringify(cityArr));
    }

    if(localStorage.getItem("weatherSearchHistory")===null){
        cityArr.push(cityObj);
        localStorage.setItem("weatherSearchHistory", JSON.stringify(cityArr));
    }
    
    displaySearchHistory();
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

function renderRecentCitySearch(){
    if("weatherSearchHistory" in localStorage){
        let jsonStr = localStorage.getItem("weatherSearchHistory");
        let cityArr = JSON.parse(jsonStr);
        let city = cityArr[0].name;
        city = formatCityStr(city);
        getWeatherData(city);
    }
}

function renderWeatherCards(){
    
    let flexContainerEl = $("<div></div>").attr("class", "flex-container");

    let weatherSectionEl = $("<section></section>").attr("class", "cityCurrentWeather");
    let weatherCardEl = $("<div></div>").attr("class", "currentWeatherCard");
    let citySpanEl = $("<span></span>").attr("id", "currentCard-cityName");
    let innerFlex1El = $("<div></div>").attr("class", "flex-container");
    let weatherImgDivEl= $("<div></div>").attr("id", "currentCard-img").attr("class", "flex-child");
    let weatherStatsDivEl = $("<div></div>").attr("id","currentCard-stats").attr("class", "flex-child");

    innerFlex1El.append(weatherImgDivEl);
    innerFlex1El.append(weatherStatsDivEl);
    weatherCardEl.append(citySpanEl);
    weatherCardEl.append(innerFlex1El);
    weatherSectionEl.append(weatherCardEl);
    flexContainerEl.append(weatherSectionEl);

    let forecastSectionEl = $("<section></section").attr("class", "cityForcastWeather");
    let forecastCardEl = $("<div></div>").attr("class", "forcastWeatherCard");
    let forecastDivEl = $("<div></div>").text("5 Day Forecast").attr("class", "forcastBanner");
    let innerFlexEl2 = $("<div></div>").attr("class", "flex-container");
    let forecastChild1El = $("<div></div>").attr("id", "forcast-0").attr("class", "forcast-child flex-child");
    let forecastChild2El = $("<div></div>").attr("id", "forcast-1").attr("class", "forcast-child flex-child");
    let forecastChild3El = $("<div></div>").attr("id", "forcast-2").attr("class", "forcast-child flex-child");
    let forecastChild4El = $("<div></div>").attr("id", "forcast-3").attr("class", "forcast-child flex-child");
    let forecastChild5El = $("<div></div>").attr("id", "forcast-4").attr("class", "forcast-child flex-child");

    innerFlexEl2.append(forecastChild1El);
    innerFlexEl2.append(forecastChild2El);
    innerFlexEl2.append(forecastChild3El);
    innerFlexEl2.append(forecastChild4El);
    innerFlexEl2.append(forecastChild5El);
    forecastCardEl.append(forecastDivEl).append(innerFlexEl2);
    forecastSectionEl.append(forecastCardEl);
    flexContainerEl.append(forecastSectionEl)

    $("main").append(flexContainerEl)

}

displaySearchHistory();
renderWeatherCards();
renderRecentCitySearch();

$("#citySearchbtn").click(function(event){
    event.preventDefault();

    
    let city = $("#cityName").val();
    updateSearchHistory(city);

    city = formatCityStr(city);
    getWeatherData(city);
    
})