const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());


// Home
app.get("/", function(req, res) {
    res.send("Lobby backend is running!");
});

app.get("/api/steam-game/:appId", async function(req, res) {

    const appId = req.params.appId;

    const url =
        "https://store.steampowered.com/api/appdetails" +
        "?appids=" + appId +
        "&cc=us" +
        "&l=english";

    try {

        const response = await fetch(url);

        const data = await response.json();
        const gameData = data[appId];

console.log("STEAM APP DATA:");
console.log(gameData);

if (!gameData) {

    return res.status(404).json({
        error: "Steam game not found"
    });

}

if (!gameData.success || !gameData.data) {

    return res.status(404).json({
        error: "Steam game data unavailable"
    });

}

const game = gameData.data;

        const steamGame = {

    name: game.name,

    appId: game.steam_appid,

    description: game.short_description,

    thumbnail: game.header_image,

    genre: game.genres[0].description,

    releaseDate: game.release_date.date,

    price: game.is_free
        ? "Free"
        : game.price_overview
            ? game.price_overview.final_formatted
            : "N/A"

};
        console.log("STEAM GAME:");
        console.log(game.name);
        
        res.json(steamGame);

    } catch (error) {

        console.error("Steam API error:", error);

        res.status(500).json({
            error: "Could not get Steam game"
        });

    }

});

// =========================
// STEAM GAMES
// =========================

// =========================
// POPULAR STEAM GAMES
// =========================

app.get("/api/steam-games", async function(req, res) {
    
    const searches = [
    "Counter-Strike",
    "Dota 2",
    "Lethal Company",
    "Phasmophobia",
    "Among Us",
    "Rust",
    "Terraria",
    "Stardew Valley",
    "Dead by Daylight",
    "Garry's Mod",
    "Hades",
    "Baldur's Gate",
    "Palworld",
    "Valheim",
    "Hollow Knight",
    "Left 4 Dead 2",
    "Portal 2",
    "Cyberpunk",
    "The Witcher 3",
    "Elden Ring"
];

    const games = [];

    try {

        for (const search of searches) {

            const searchResponse = await fetch(
                "https://store.steampowered.com/api/storesearch/" +
                "?term=" + encodeURIComponent(search) +
                "&cc=us" +
                "&l=english"
            );

            const searchData = await searchResponse.json();

console.log("STEAM SEARCH:", search);
console.log(
    "RESULTS:",
    searchData.items ? searchData.items.length : 0
);

if (
    !searchData.items ||
    searchData.items.length === 0
) {
    continue;
}

        let game = null;

for (const item of searchData.items) {

    if (item.type !== "app") {
        continue;
    }

    const appId = item.id;

    const detailsResponse = await fetch(
        "https://store.steampowered.com/api/appdetails" +
        "?appids=" + appId +
        "&cc=us" +
        "&l=english"
    );

    const detailsData =
        await detailsResponse.json();

    const gameData =
        detailsData[appId];

    if (
        !gameData ||
        !gameData.success ||
        !gameData.data
    ) {
        continue;
    }

    // Make sure Steam identifies it as a game
    if (gameData.data.type !== "game") {
        continue;
    }

    game = gameData.data;

    break;
}

if (!game) {
    continue;
}

            games.push({

                name: game.name,

                appId: game.steam_appid,

                description:
                    game.short_description || "",

                thumbnail:
                    game.header_image || "",

                genre:
                    game.genres &&
                    game.genres.length > 0
                        ? game.genres[0].description
                        : "Game",

                releaseDate:
                    game.release_date
                        ? game.release_date.date
                        : "N/A",

                price:
                    game.is_free
                        ? "Free"
                        : game.price_overview
                            ? game.price_overview.final_formatted
                            : "N/A"

            });

        }

        res.json(games);

    } catch (error) {

        console.error(
            "Steam games error:",
            error
        );

        res.status(500).json({
            error: "Could not get Steam games"
        });

    }

});


app.get("/api/steam-search", async function(req, res) {

    const search = req.query.q;

    if (!search) {
        return res.status(400).json({
            error: "Missing search query"
        });
    }

    try {

        const response = await fetch(
            "https://store.steampowered.com/api/storesearch/" +
            "?term=" + encodeURIComponent(search) +
            "&cc=us" +
            "&l=english"
        );

        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.error("Steam search error:", error);

        res.status(500).json({
            error: "Could not search Steam"
        });

    }

});

function mapGenre(robloxGenre) {

    if (robloxGenre === "FPS") {
        return "Action";
    }

    if (robloxGenre === "Fighting") {
        return "Action";
    }

    if (robloxGenre === "Town and City") {
        return "Custom";
    }

    if (robloxGenre === "All") {
        return "Custom";
    }

    return robloxGenre;
}


// Roblox games
app.get("/api/roblox-games", async function(req, res) {

    const sessionId = crypto.randomUUID();

    const url =
        "https://apis.roblox.com/explore-api/v1/get-sort-content" +
        "?sessionId=" + sessionId +
        "&sortId=top-playing-now";

    try {

        // =========================
        // GET POPULAR ROBLOX GAMES
        // =========================

        const response = await fetch(url);
        const data = await response.json();

        const games = data.games.map(function(game) {
        return {
            name: game.name,
            players: game.playerCount,
            universeId: game.universeId,
            placeId: game.rootPlaceId
        };

    });


        // Get game details in batches

for (let i = 0; i < games.length; i += 10) {

    const batch = games.slice(i, i + 10);

    const batchIds = batch
        .map(function(game) {
            return game.universeId;
        })
        .join(",");


    const detailsUrl =
        "https://games.roblox.com/v1/games?universeIds=" +
        batchIds;


    const detailsResponse =
        await fetch(detailsUrl);

    const detailsData =
        await detailsResponse.json();
    
    console.log(
    "DETAILS BATCH:",
    i,
    "Games returned:",
    detailsData.data ? detailsData.data.length : 0
);

    if (detailsData.data) {

        batch.forEach(function(game) {

            const details = detailsData.data.find(
                function(item) {
                    return item.id === game.universeId;
                }
            );


            if (details) {

                game.genre = mapGenre(details.genre);
                game.description = details.description;

            }

        });

    }

}

    const genres = [];

games.forEach(function(game) {

    if (game.genre && !genres.includes(game.genre)) {
        genres.push(game.genre);
    }

});

console.log("ROBLOX GENRES:");
console.log(genres);


        // Get thumbnails

const universeIds = games
    .map(function(game) {
        return game.universeId;
    })
    .join(",");


const thumbnailUrl =
    "https://thumbnails.roblox.com/v1/games/multiget/thumbnails" +
    "?universeIds=" + universeIds +
    "&countPerUniverse=1" +
    "&defaults=true" +
    "&size=768x432" +
    "&format=Png" +
    "&isCircular=false";


const thumbnailResponse =
    await fetch(thumbnailUrl);


const thumbnailData =
    await thumbnailResponse.json();


// Add thumbnails
games.forEach(function(game) {

    const thumbnailGame =
        thumbnailData.data.find(
            function(item) {
                return item.universeId === game.universeId;
            }
        );


    if (
        thumbnailGame &&
        thumbnailGame.thumbnails &&
        thumbnailGame.thumbnails.length > 0
    ) {

        game.thumbnail =
            thumbnailGame.thumbnails[0].imageUrl;

    }

});

        // =========================
        // SEND GAMES TO FRONTEND
        // =========================

        res.json(games);


    } catch (error) {

        console.error("Roblox API error:", error);

        res.status(500).json({
            error: "Could not get Roblox games"
        });

    }

});


// Start server
app.listen(3000, function() {

    console.log(
        "Lobby server running on http://localhost:3000"
    );

});

