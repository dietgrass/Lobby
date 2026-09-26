// =========================
// FILTER PANEL
// =========================

const filterButton = document.getElementById("filterButton");
const filterOverlay = document.getElementById("filterOverlay");
const closeFilter = document.getElementById("closeFilter");
const applyFilters = document.getElementById("applyFilters");


filterButton.addEventListener("click", function() {
    filterOverlay.classList.add("active");
});


closeFilter.addEventListener("click", function() {
    filterOverlay.classList.remove("active");
});


applyFilters.addEventListener("click", function() {
    filterOverlay.classList.remove("active");
});


// =========================
// PRICE SLIDER
// =========================

const minSlider = document.getElementById("minSlider");
const maxSlider = document.getElementById("maxSlider");

const priceDisplay = document.getElementById("priceDisplay");
const sliderRange = document.getElementById("sliderRange");
const priceSliderContainer = document.getElementById("priceSliderContainer");


function updatePriceSlider() {

    let minValue = Number(minSlider.value);
    let maxValue = Number(maxSlider.value);

    // Keep minimum below maximum
    if (minValue > maxValue) {

        if (document.activeElement === minSlider) {
            minSlider.value = maxValue;
            minValue = maxValue;
        } 
        else {
            maxSlider.value = minValue;
            maxValue = minValue;
        }
    }


    // Update price text
    priceDisplay.textContent =
        "$" + minValue + " – $" + maxValue;


    // Calculate positions
    const minPercent = (minValue / 60) * 100;
    const maxPercent = (maxValue / 60) * 100;


    // Update highlighted range
    sliderRange.style.left = minPercent + "%";

    sliderRange.style.width =
        (maxPercent - minPercent) + "%";
}


// Update when dragging
minSlider.addEventListener("input", updatePriceSlider);
maxSlider.addEventListener("input", updatePriceSlider);


// Update when page loads
updatePriceSlider();


// Click anywhere on slider
priceSliderContainer.addEventListener("click", function(event) {

    // Don't interfere when clicking directly on a handle
    if (event.target.tagName === "INPUT") {
        return;
    }


    const rect =
        priceSliderContainer.getBoundingClientRect();


    const clickPosition =
        event.clientX - rect.left;


    const percentage =
        clickPosition / rect.width;


    const clickedValue =
        Math.round(percentage * 60);


    const minValue =
        Number(minSlider.value);

    const maxValue =
        Number(maxSlider.value);


    // Move whichever handle is closer
    const distanceToMin =
        Math.abs(clickedValue - minValue);

    const distanceToMax =
        Math.abs(clickedValue - maxValue);


    if (distanceToMin <= distanceToMax) {

        minSlider.value = clickedValue;

    } 
    else {

        maxSlider.value = clickedValue;

    }


    updatePriceSlider();

});


// =========================
// PLATFORM
// =========================

const platformOptions =
    document.querySelectorAll(".platform-option");


platformOptions.forEach(function(option) {

    option.addEventListener("click", function() {

        option.classList.toggle("selected");

    });

});


// =========================
// PLAYERS
// =========================

const playerOptions =
    document.querySelectorAll(".player-option");


playerOptions.forEach(function(option) {

    option.addEventListener("click", function() {

        // Remove selection from all players
        playerOptions.forEach(function(otherOption) {

            otherOption.classList.remove("selected");

        });


        // Select clicked option
        option.classList.add("selected");

    });

});


// =========================
// GENRES
// =========================

const genreOptions =
    document.querySelectorAll(".genre-option");


genreOptions.forEach(function(option) {

    option.addEventListener("click", function() {

        // Multiple genres can be selected
        option.classList.toggle("selected");

    });

});


// =========================
// RELEASE DATE
// =========================

const dateOptions =
    document.querySelectorAll(".date-option");

const releaseDate =
    document.getElementById("releaseDate");

const dateInputButton =
    document.getElementById("dateInputButton");

const dateButtonText =
    document.getElementById("dateButtonText");


// Preset date buttons
dateOptions.forEach(function(option) {

    option.addEventListener("click", function() {

        // Remove selected from all presets
        dateOptions.forEach(function(otherOption) {

            otherOption.classList.remove("selected");

        });


        // Select clicked preset
        option.classList.add("selected");


        // Clear specific date
        releaseDate.value = "";


        // Reset button text
        dateButtonText.textContent =
            "Pick a date";

        dateButtonText.style.color =
            "#7895ad";

    });

});


// Specific date button
dateInputButton.addEventListener("click", function() {

    releaseDate.showPicker();

});


// When a specific date is selected
releaseDate.addEventListener("change", function() {

    if (releaseDate.value) {

        // Remove preset selections
        dateOptions.forEach(function(option) {

            option.classList.remove("selected");

        });


        // Convert date
        const selectedDate =
            new Date(releaseDate.value + "T00:00:00");


        // Format date
        const formattedDate =
            selectedDate.toLocaleDateString("en-US", {

                month: "short",
                day: "numeric",
                year: "numeric"

            });


        // Update button
        dateButtonText.textContent =
            formattedDate;

        dateButtonText.style.color =
            "white";

    }

});

async function getRobloxGames() {

    const sessionId = crypto.randomUUID();

    const url =
        "https://apis.roblox.com/explore-api/v1/get-sort-content" +
        "?sessionId=" + sessionId +
        "&sortId=top-playing-now";

    try {

        const response = await fetch(url);

        const data = await response.json();

        console.log(data);

    } catch (error) {

        console.error("Roblox API error:", error);

    }
}

getRobloxGames();

// =========================
// LOAD ROBLOX GAMES
// =========================

const gameGrid = document.getElementById("gameGrid");


async function loadRobloxGames() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/roblox-games"
        );

        const games = await response.json();


        games.forEach(function(game) {

            const gameCard = document.createElement("div");

            gameCard.classList.add("game-card");


            gameCard.innerHTML = `

                <div class="game-image">
                    <span class="platform">ROBLOX</span>
                </div>

                <div class="game-info">

                    <h2>${game.name}</h2>

                    <div class="game-details">
                        <span>👥 ${game.players.toLocaleString()} Playing</span>
                    </div>

                    <div class="game-bottom">
                        <span class="price">Free</span>
                        <span class="genre">${game.genre || "Game"}</span>
                    </div>

                </div>

            `;


            gameGrid.appendChild(gameCard);

        });


    } catch (error) {

        console.error(
            "Could not load Roblox games:",
            error
        );

    }

}


loadRobloxGames();