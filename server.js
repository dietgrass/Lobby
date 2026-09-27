const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Home
app.get("/", function(req, res) {
    res.send("Lobby backend is running!");
});

app.get("/api/steam-game/:appId", async function (req, res) {
  const appId = req.params.appId;

  const url =
    "https://store.steampowered.com/api/appdetails" +
    "?appids=" +
    appId +
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
        error: "Steam game not found",
      });
    }

    if (!gameData.success || !gameData.data) {
      return res.status(404).json({
        error: "Steam game data unavailable",
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
          : "N/A",
    };
    console.log("STEAM GAME:");
    console.log(game.name);

    res.json(steamGame);
  } catch (error) {
    console.error("Steam API error:", error);

    res.status(500).json({
      error: "Could not get Steam game",
    });
  }
});

// =========================
// STEAM GAMES
// =========================

// =========================
// POPULAR STEAM GAMES
// =========================

app.get("/api/steam-games", async function (req, res) {
  try {
    const response = await fetch(
      "https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/",
    );

    const data = await response.json();

    const ranks = data.response.ranks;

    console.log("STEAM RANK COUNT:", ranks.length);

    const games = [];

    // Get details for the popular games
    let rankIndex = 0;

    while (games.length < 20 && rankIndex < ranks.length) {
      const rank = ranks[rankIndex];

      rankIndex++;

      const appId = rank.appid;

      const detailsResponse = await fetch(
        "https://store.steampowered.com/api/appdetails" +
          "?appids=" +
          appId +
          "&cc=us" +
          "&l=english",
      );

      const detailsData = await detailsResponse.json();

      const gameData = detailsData[appId];

      if (!gameData || !gameData.success || !gameData.data) {
        continue;
      }

      const game = gameData.data;

      if (game.type !== "game") {
        continue;
      }

      games.push({
        name: game.name,

        appId: game.steam_appid,

        description: game.short_description || "",

        thumbnail: game.header_image || "",

        genre:
          game.genres && game.genres.length > 0
            ? game.genres[0].description
            : "Game",

        releaseDate: game.release_date ? game.release_date.date : "N/A",

        price: game.is_free
          ? "Free"
          : game.price_overview
            ? game.price_overview.final_formatted
            : "N/A",
      });
    }

    console.log("POPULAR STEAM GAMES FOUND:");
    console.log(games);

    res.json(games);
  } catch (error) {
    console.error("Steam popular games error:", error);

    res.status(500).json({
      error: "Could not get popular Steam games",
    });
  }
});

app.get("/api/steam-search", async function (req, res) {
  const search = req.query.q;

  if (!search) {
    return res.status(400).json({
      error: "Missing search query",
    });
  }

  try {
    const response = await fetch(
      "https://store.steampowered.com/api/storesearch/" +
        "?term=" +
        encodeURIComponent(search) +
        "&cc=us" +
        "&l=english",
    );

    const data = await response.json();

    console.log("STEAM SEARCH:", search);

    if (!data.items || data.items.length === 0) {
      return res.json({
        game: null,
      });
    }

    let game = null;

    // Check Steam results until we find an actual game
    for (const item of data.items) {
      if (item.type !== "app") {
        continue;
      }

      const appId = item.id;

      const detailsResponse = await fetch(
        "https://store.steampowered.com/api/appdetails" +
          "?appids=" +
          appId +
          "&cc=us" +
          "&l=english",
      );

      const detailsData = await detailsResponse.json();

      const gameData = detailsData[appId];

      if (!gameData || !gameData.success || !gameData.data) {
        continue;
      }

      if (gameData.data.type !== "game") {
        continue;
      }

      game = gameData.data;

      break;
    }

    if (!game) {
      return res.json({
        game: null,
      });
    }

    const steamGame = {
      name: game.name,

      appId: game.steam_appid,

      description: game.short_description || "",

      thumbnail: game.header_image || "",

      genre:
        game.genres && game.genres.length > 0
          ? game.genres[0].description
          : "Game",

      releaseDate: game.release_date ? game.release_date.date : "N/A",

      price: game.is_free
        ? "Free"
        : game.price_overview
          ? game.price_overview.final_formatted
          : "N/A",
    };

    console.log("STEAM GAME FOUND:");
    console.log(game.name);

    res.json({
      game: steamGame,
    });
  } catch (error) {
    console.error("Steam search error:", error);

    res.status(500).json({
      error: "Could not search Steam",
    });
  }
});

app.get("/api/steam-search", async function (req, res) {
  const search = req.query.q;

  if (!search) {
    return res.status(400).json({
      error: "Missing search query",
    });
  }

  try {
    const response = await fetch(
      "https://store.steampowered.com/api/storesearch/" +
        "?term=" +
        encodeURIComponent(search) +
        "&cc=us" +
        "&l=english",
    );

    const data = await response.json();
    console.log("STEAM SEARCH RESULT:");
    console.log(JSON.stringify(data, null, 2));

    res.json(data);
  } catch (error) {
    console.error("Steam search error:", error);

    res.status(500).json({
      error: "Could not search Steam",
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
app.get("/api/roblox-games", async function (req, res) {
  const sessionId = crypto.randomUUID();

  const url =
    "https://apis.roblox.com/explore-api/v1/get-sort-content" +
    "?sessionId=" +
    sessionId +
    "&sortId=top-playing-now";

  try {
    // =========================
    // GET POPULAR ROBLOX GAMES
    // =========================

    const response = await fetch(url);
    const data = await response.json();

    const games = data.games.map(function (game) {
      return {
        name: game.name,
        players: game.playerCount,
        universeId: game.universeId,
        placeId: game.rootPlaceId,
        price: "Free",
      };
    });

    // Get game details in batches

    for (let i = 0; i < games.length; i += 10) {
      const batch = games.slice(i, i + 10);

      const batchIds = batch
        .map(function (game) {
          return game.universeId;
        })
        .join(",");

      const detailsUrl =
        "https://games.roblox.com/v1/games?universeIds=" + batchIds;

      const detailsResponse = await fetch(detailsUrl);

      const detailsData = await detailsResponse.json();

      console.log(
        "DETAILS BATCH:",
        i,
        "Games returned:",
        detailsData.data ? detailsData.data.length : 0,
      );

      if (detailsData.data) {
        batch.forEach(function (game) {
          const details = detailsData.data.find(function (item) {
            return item.id === game.universeId;
          });

          if (details) {
            game.genre = mapGenre(details.genre);
            game.description = details.description;
          }
        });
      }
    }

    const genres = [];

    games.forEach(function (game) {
      if (game.genre && !genres.includes(game.genre)) {
        genres.push(game.genre);
      }
    });

    console.log("ROBLOX GENRES:");
    console.log(genres);

    // Get thumbnails

    const universeIds = games
      .map(function (game) {
        return game.universeId;
      })
      .join(",");

    const thumbnailUrl =
      "https://thumbnails.roblox.com/v1/games/multiget/thumbnails" +
      "?universeIds=" +
      universeIds +
      "&countPerUniverse=1" +
      "&defaults=true" +
      "&size=768x432" +
      "&format=Png" +
      "&isCircular=false";

    const thumbnailResponse = await fetch(thumbnailUrl);

    const thumbnailData = await thumbnailResponse.json();

    // Add thumbnails
    games.forEach(function (game) {
      const thumbnailGame = thumbnailData.data.find(function (item) {
        return item.universeId === game.universeId;
      });

      if (
        thumbnailGame &&
        thumbnailGame.thumbnails &&
        thumbnailGame.thumbnails.length > 0
      ) {
        game.thumbnail = thumbnailGame.thumbnails[0].imageUrl;
      }
    });

    // =========================
    // SEND GAMES TO FRONTEND
    // =========================

    res.json(games);
  } catch (error) {
    console.error("Roblox API error:", error);

    res.status(500).json({
      error: "Could not get Roblox games",
    });
  }
});

app.get("/api/roblox-search", async function (req, res) {
  const search = req.query.q;

  if (!search) {
    return res.status(400).json({
      error: "Missing search query",
    });
  }

  const sessionId = crypto.randomUUID();

  try {
    // =========================
    // SEARCH ROBLOX
    // =========================

    const response = await fetch(
      "https://apis.roblox.com/search-api/omni-search" +
        "?searchQuery=" +
        encodeURIComponent(search) +
        "&sessionId=" +
        sessionId +
        "&pageType=all",
    );

    const data = await response.json();

    console.log("ROBLOX SEARCH API:");
    console.log(data);

    // Make sure searchResults exists
    if (!data.searchResults) {
      console.log("No Roblox search results found.");

      return res.json([]);
    }

    const games = [];

    // =========================
    // GET GAME RESULTS
    // =========================

    data.searchResults.forEach(function (result) {
      if (result.contentGroupType !== "Game") {
        return;
      }

      if (!result.contents || result.contents.length === 0) {
        return;
      }

      const game = result.contents[0];

      if (!game.universeId) {
        return;
      }

      games.push({
        name: game.name || "Unknown Game",

        description: game.description || "",

        players: game.playerCount || 0,

        universeId: game.universeId,

        placeId: game.rootPlaceId || 0,

        thumbnail: "",

        genre: "ROBLOX",
      });
    });

    console.log("ROBLOX GAMES FOUND:");
    console.log(games);

    // =========================
    // GET GAME DETAILS
    // =========================

    for (let i = 0; i < games.length; i += 10) {
      const batch = games.slice(i, i + 10);

      const batchIds = batch
        .map(function (game) {
          return game.universeId;
        })
        .join(",");

      const detailsUrl =
        "https://games.roblox.com/v1/games?universeIds=" + batchIds;

      const detailsResponse = await fetch(detailsUrl);

      const detailsData = await detailsResponse.json();

      console.log("ROBLOX DETAILS:");
      console.log(detailsData);

      if (detailsData.data) {
        batch.forEach(function (game) {
          const details = detailsData.data.find(function (item) {
            return item.id === game.universeId;
          });

          if (details) {
            game.description = details.description || "";

            game.genre = mapGenre(details.genre);
          }
        });
      }
    }

    // =========================
    // GET THUMBNAILS
    // =========================

    const universeIds = games
      .map(function (game) {
        return game.universeId;
      })
      .join(",");

    if (universeIds) {
      const thumbnailUrl =
        "https://thumbnails.roblox.com/v1/games/multiget/thumbnails" +
        "?universeIds=" +
        universeIds +
        "&countPerUniverse=1" +
        "&defaults=true" +
        "&size=768x432" +
        "&format=Png" +
        "&isCircular=false";

      const thumbnailResponse = await fetch(thumbnailUrl);

      const thumbnailData = await thumbnailResponse.json();

      console.log("ROBLOX THUMBNAILS:");
      console.log(thumbnailData);

      games.forEach(function (game) {
        const thumbnailGame = thumbnailData.data.find(function (item) {
          return item.universeId === game.universeId;
        });

        if (
          thumbnailGame &&
          thumbnailGame.thumbnails &&
          thumbnailGame.thumbnails.length > 0
        ) {
          game.thumbnail = thumbnailGame.thumbnails[0].imageUrl;
        }
      });
    }

    // =========================
    // SEND RESULTS
    // =========================

    console.log("FINAL ROBLOX SEARCH GAMES:");
    console.log(games);

    res.json(games);
  } catch (error) {
    console.error("Roblox search error:", error);

    res.status(500).json({
      error: "Could not search Roblox",
    });
  }
});

// Start server
app.listen(3000, function() {

    console.log(
        "Lobby server running on http://localhost:3000"
    );

});
