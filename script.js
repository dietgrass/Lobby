// =========================
// FILTER PANEL
// =========================

const filterButton = document.getElementById("filterButton");
const filterOverlay = document.getElementById("filterOverlay");
const closeFilter = document.getElementById("closeFilter");
const applyFilters = document.getElementById("applyFilters");

const logo = document.querySelector(".logo");

const loadingScreen =
    document.getElementById("loadingScreen");

logo.addEventListener("click", function() {
    window.location.href = "/";
});

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




        games.slice(0, 12).forEach(function(game) {

            const gameCard = document.createElement("div");

            gameCard.classList.add("game-card");


            gameCard.innerHTML = `

                <div class="game-image"
     style="background-image: url('${game.thumbnail}')">

    <span class="platform">ROBLOX</span>

</div>

                <h2>${game.name || "Unknown Game"}</h2>

<div class="game-details">
    <span>📅 ${game.releaseDate || "N/A"}</span>
</div>

<div class="game-bottom">
    <span class="price">${game.price || "Free"}</span>
    <span class="genre">${game.genre || "Game"}</span>
</div>

            `;


            gameGrid.appendChild(gameCard);

             gameCard.addEventListener("click", function() {

    openGameModal(game, "ROBLOX");

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

let robloxDisplayCount = 12;

if (games.length > 12) {

    const viewMoreButton =
        document.createElement("button");

    viewMoreButton.textContent = "View More";

    viewMoreButton.classList.add("view-more-button");

    gameGrid.appendChild(viewMoreButton);

    viewMoreButton.addEventListener("click", function() {

    const oldCount = robloxDisplayCount;

    robloxDisplayCount += 12;

    games.slice(oldCount, robloxDisplayCount).forEach(function(game) {

        const gameCard = document.createElement("div");

        gameCard.classList.add("game-card");

        gameCard.innerHTML = `

            <div class="game-image"
                 style="background-image: url('${game.thumbnail}')">

                <span class="platform">ROBLOX</span>

            </div>

            <h2>${game.name || "Unknown Game"}</h2>

            <div class="game-details">
                <span>📅 ${game.releaseDate || "N/A"}</span>
            </div>

            <div class="game-bottom">
                <span class="price">${game.price || "Free"}</span>
                <span class="genre">${game.genre || "Game"}</span>
            </div>

        `;

        gameGrid.insertBefore(gameCard, viewMoreButton);

    });

    // Remove button when there are no more games
    if (robloxDisplayCount >= games.length) {
        viewMoreButton.remove();
    }

});

}

    } catch (error) {

        console.error(
            "Could not load Roblox games:",
            error
        );

    }

}


loadRobloxGames();


async function searchRoblox(search) {

    try {

        const response = await fetch(
            "http://localhost:3000/api/roblox-search?q=" +
            encodeURIComponent(search)
        );

        const games = await response.json();

        console.log("ROBLOX SEARCH GAMES:");
        console.log(games);

        return games;

    } catch (error) {

        console.error(
            "Roblox search error:",
            error
        );

        return [];

    }

}

function displayRobloxGame(game, container = gameGrid) {

    const gameCard = document.createElement("div");

    gameCard.classList.add("game-card");

    gameCard.innerHTML = `

        <div class="game-image"
             style="background-image: url('${game.thumbnail}')">

            <span class="platform">ROBLOX</span>

        </div>

        <h2>${game.name || "Unknown Game"}</h2>

        <div class="game-details">
            <span>👥 ${game.players?.toLocaleString() || 0} Players</span>
        </div>

        <div class="game-bottom">
            <span class="price">Free</span>
            <span class="genre">ROBLOX</span>
        </div>

    `;

    container.appendChild(gameCard);


    gameCard.addEventListener("click", function() {

        openGameModal(game, "ROBLOX");

    });

}

// =========================
// DISPLAY STEAM GAME
// =========================


function openGameModal(game, platform) {

    modalGameImage.src = game.thumbnail;

    modalGameName.textContent =
        game.name || "Unknown Game";

    modalGameGenre.textContent =
        "🎮 " + (game.genre || "Game");


    if (platform === "ROBLOX") {

        modalGamePlayers.textContent =
            "👥 " +
            (game.players
                ? game.players.toLocaleString()
                : "0") +
            " Players";

        playGameButton.href =
            "https://www.roblox.com/games/" +
            game.placeId;

    }

    else if (platform === "STEAM") {

        modalGamePlayers.textContent =
            "🎮 Steam";

        playGameButton.href =
            "https://store.steampowered.com/app/" +
            game.appId;

    }


    playGameButton.textContent = "Game Link";


    modalGameDescription.textContent =
        game.description ||
        "No description available.";

    gameModal.classList.add("active");

}



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


    // Open modal when Steam game is clicked
    gameCard.addEventListener("click", function() {

        openGameModal(game, "STEAM");

    });

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
// SEARCH ALL GAMES
// =========================

searchInput.addEventListener("keydown", async function(event) {

    if (event.key !== "Enter") {
        return;
    }

    const search = searchInput.value.trim();

    if (!search) {
        return;
    }

    console.log("SEARCHING FOR:", search);

    // Clear current games
    gameGrid.innerHTML = "";
    steamGameGrid.innerHTML = "";

    try {

        // Search Steam and Roblox at the same time
        const steamPromise = fetch(
            "http://localhost:3000/api/steam-search?q=" +
            encodeURIComponent(search)
        );

        const robloxPromise = searchRoblox(search);

        const [steamResponse, robloxGames] =
            await Promise.all([
                steamPromise,
                robloxPromise
            ]);


        // =========================
        // STEAM RESULTS
        // =========================

        const steamData =
            await steamResponse.json();

        console.log("STEAM SEARCH RESULTS:");
        console.log(steamData);


        if (steamData.game) {

            displaySteamGame(steamData.game);

        }


        // =========================
        // ROBLOX RESULTS
        // =========================

        if (robloxGames.length > 0) {

    const initialRobloxGames = robloxGames.slice(0, 5);

    initialRobloxGames.forEach(function(game) {

        displayRobloxGame(game);

    });


    // =========================
    // VIEW MORE ROBLOX
    // =========================

    if (robloxGames.length > 5) {

        const viewMoreButton =
            document.createElement("button");

        viewMoreButton.textContent =
            "View More";

        viewMoreButton.classList.add(
            "view-more-button"
        );

        gameGrid.appendChild(viewMoreButton);


        let robloxDisplayCount = 5;


        viewMoreButton.addEventListener(
            "click",
            function() {

                const oldCount =
                    robloxDisplayCount;

                robloxDisplayCount += 5;


                robloxGames
                    .slice(
                        oldCount,
                        robloxDisplayCount
                    )
                    .forEach(function(game) {

                        displayRobloxGame(game);

                    });


                // Move View More button
                // back to the bottom
                gameGrid.appendChild(
                    viewMoreButton
                );


                if (
                    robloxDisplayCount >=
                    robloxGames.length
                ) {

                    viewMoreButton.remove();

                }

            }
        );

    }

}


        console.log(
            "Search complete:",
            steamData.game ? 1 : 0,
            "Steam result(s),",
            robloxGames.length,
            "Roblox result(s)"
        );

    } catch (error) {

        console.error(
            "Search error:",
            error
        );

    }

});
