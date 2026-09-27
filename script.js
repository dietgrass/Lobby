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

const gameModal = document.getElementById("gameModal");
const closeGameModal = document.getElementById("closeGameModal");

const modalGameImage = document.getElementById("modalGameImage");
const modalGameName = document.getElementById("modalGameName");
const modalGameGenre = document.getElementById("modalGameGenre");
const modalGamePlayers = document.getElementById("modalGamePlayers");
const modalGameDescription = document.getElementById("modalGameDescription");
const playGameButton = document.getElementById("playGameButton");

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
const steamGameGrid =
    document.getElementById("steamGameGrid");
const searchInput = document.getElementById("searchInput");

async function loadRobloxGames() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/roblox-games"
        );

        const games = await response.json();

searchInput.addEventListener("input", function() {

    const searchText = searchInput.value.toLowerCase();

    const gameCards = document.querySelectorAll(".game-card");

    gameCards.forEach(function(card, index) {

        const game = games[index];

        const gameName =
            game.name.toLowerCase();

        const gameGenre =
            (game.genre || "").toLowerCase();

        if (
            gameName.includes(searchText) ||
            gameGenre.includes(searchText)
        ) {

            card.style.display = "";

        } 
        else {

            card.style.display = "none";

        }

    });

});


        games.forEach(function(game) {

            const gameCard = document.createElement("div");

            gameCard.classList.add("game-card");


            gameCard.innerHTML = `

                <div class="game-image"
     style="background-image: url('${game.thumbnail}')">

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

             gameCard.addEventListener("click", function() {

    modalGameImage.src = game.thumbnail;

    modalGameName.textContent = game.name;

    modalGameGenre.textContent =
        "🎮 " + game.genre;

    modalGamePlayers.textContent =
        "👥 " + game.players.toLocaleString() + " Players";

    modalGameDescription.textContent =
        game.description || "No description available.";

    playGameButton.href =
        "https://www.roblox.com/games/" + game.placeId;

    gameModal.classList.add("active");

});

        });

        closeGameModal.addEventListener("click", function() {

    gameModal.classList.remove("active");

});

gameModal.addEventListener("click", function(event) {

    if (event.target === gameModal) {
        gameModal.classList.remove("active");
    }

});

    } catch (error) {

        console.error(
            "Could not load Roblox games:",
            error
        );

    }

}


loadRobloxGames();

// =========================
// DISPLAY STEAM GAME
// =========================

function displaySteamGame(game) {

    const gameCard = document.createElement("div");

    gameCard.classList.add("game-card");

    gameCard.innerHTML = `

        <div class="game-image"
             style="background-image: url('${game.thumbnail}')">

            <span class="platform">STEAM</span>

        </div>

        <div class="game-info">

            <h2>${game.name}</h2>

            <div class="game-details">
                <span>📅 ${game.releaseDate}</span>
            </div>

            <div class="game-bottom">
                <span class="price">${game.price}</span>
                <span class="genre">${game.genre || "Game"}</span>
            </div>

        </div>

    `;

    steamGameGrid.appendChild(gameCard);

}

// =========================
// LOAD STEAM GAMES
// =========================

async function loadSteamGames() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/steam-games"
        );

        const games = await response.json();

        games.forEach(function(game) {

            displaySteamGame(game);

        });

    } catch (error) {

        console.error(
            "Could not load Steam games:",
            error
        );

    }

}

loadSteamGames();

// =========================
// STEAM SEARCH
// =========================


searchInput.addEventListener("keydown", async function(event) {

    if (event.key !== "Enter") {
        return;
    }

    const search = searchInput.value.trim();

    if (!search) {
        return;
    }

    try {

        // Search Steam
        const searchResponse = await fetch(
            "http://localhost:3000/api/steam-search?q=" +
            encodeURIComponent(search)
        );

        const searchData = await searchResponse.json();

        console.log("STEAM SEARCH RESULTS:");
        console.log(searchData);


        // Check if Steam found anything
        if (
            !searchData.items ||
            searchData.items.length === 0
        ) {

            console.log("No Steam games found.");

            return;
        }


        // Get first result
        const appId =
            searchData.items[0].id;

        console.log("FOUND STEAM APP ID:", appId);


        // Get game details
        const gameResponse = await fetch(
            "http://localhost:3000/api/steam-game/" +
            appId
        );

        const game = await gameResponse.json();

        console.log("STEAM GAME DETAILS:");
        console.log(game);
        displaySteamGame(game);

    } catch (error) {

        console.error("Steam search error:", error);

    }

});