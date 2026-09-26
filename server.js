const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", function(req, res) {
    res.send("Lobby backend is running!");
});


app.get("/api/roblox-games", async function(req, res) {

    const sessionId = crypto.randomUUID();

    const url =
        "https://apis.roblox.com/explore-api/v1/get-sort-content" +
        "?sessionId=" + sessionId +
        "&sortId=top-playing-now";

    try {

        const response = await fetch(url);
        const data = await response.json();

        const games = data.games.map(function(game) {

            return {
                name: game.name,
                players: game.playerCount,
                genre: game.genre1,
                universeId: game.universeId,
                placeId: game.rootPlaceId
            };

        });

        res.json(games);

    } catch (error) {

        console.error("Roblox API error:", error);

        res.status(500).json({
            error: "Could not get Roblox games"
        });

    }

});

app.listen(3000, function() {

    console.log(
        "Lobby server running on http://localhost:3000"
    );

});