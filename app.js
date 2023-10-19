const express = require("express"); //starting express js server.
const path = require("path"); //importing path
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json()); //json types into js objects and also known as middleware.

const dbPath = path.join(__dirname, "cricketTeam.db"); //giving the path

let db = null;

const initializeDbAndServer = async () => {
  //connection initialing with  database
  try {
    // while initializing we will get some exceptions so we have to keep try catch.
    db = await open({
      //sqlite open() method return a promise object so we have keep await,async
      filename: dbPath,
      driver: sqlite3.Database, // result we will get is bd connection object
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersNames = `
    SELECT 
       player_id AS playerId,
       player_name AS playerName,
       jersey_number AS jerseyNumber,
       role
    FROM cricket_team`;

  const playersList = await db.all(getPlayersNames);
  response.send(playersList);
});

//API 2:

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const newPlayer = `
    INSERT INTO cricket_team(player_name, jersey_number, role)
    VALUES (
        '${playerName}' ,
         ${jerseyNumber}, 
         '${role}');`;

  const addPlayer = await db.run(newPlayer);

  response.send("Player Added to Team");
});

//API3
app.get("/players/:playersId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM player_team 
    WHERE 
    player_id = ${playerId};`;

  const playerSingleName = await db.get(getPlayerQuery);
  response.send(convertDbObjectResponseObject(playerSingleName));
});

module.exports = app;

//API 4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyName, role } = playerDetails;
  const updatePlayerDetails = `
    UPDATE cricket_team 
    SET 
    player_name = ${playerName},
    jersey_name = ${jerseyName},
    role = ${role}
    WHERE player_id = ${playerId}`;

  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});
