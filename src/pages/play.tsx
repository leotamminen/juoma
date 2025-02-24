import { useState } from "react";
import "../app/globals.css";
import Viinapiru from "@/components/games/Viinapiru";
import Malte from "@/components/games/Malte";
import Hitler from "@/components/games/Hitler";
import Placeholder from "@/components/games/Placeholder";
import PullonPyoritys from "@/components/games/PullonPyoritys";

export default function Play() {
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [gameSelection, setGameSelection] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const addPlayer = () => {
    if (newPlayer.trim() === "") return; // Prevent adding empty names
    setPlayers([...players, newPlayer.trim()]);
    setNewPlayer(""); // Clear input after adding
  };

  const removePlayer = (playerToRemove: string) => {
    setPlayers(players.filter((player) => player !== playerToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addPlayer();
    }
  };

  // Function to reset game selection and return to player adding
  const goBackToAddingPlayers = () => {
    setGameSelection(false);
    setSelectedGame(null);
  };

  // Function to reset game selection only
  const goBackToSelection = () => {
    setSelectedGame(null);
  };

  return (
    <div className="general-container">
      {/* If a game is selected, render the corresponding game component */}
      {selectedGame ? (
        selectedGame === "Piiskapeli" ? (
          <Viinapiru players={players} onBack={goBackToSelection} />
        ) : selectedGame === "Malte" ? (
          <Malte players={players} onBack={goBackToSelection} />
        ) : selectedGame === "Hitlter" ? (
          <Hitler players={players} onBack={goBackToSelection} />
        ) : selectedGame === "Placeholder" ? (
          <Placeholder players={players} onBack={goBackToSelection} />
        ) : selectedGame === "Pullon Pyöritys" ? (
          <PullonPyoritys players={players} onBack={goBackToSelection} />
        ) : null
      ) : gameSelection ? (
        <>
          <h2 className="general-title">Pelaajat</h2>
          <ul className="player-list">
            {players.map((player, index) => (
              <li key={index} className="player-item">
                {player}
              </li>
            ))}
          </ul>

          <h2 className="general-title">Valitse peli:</h2>
          <p className="general-description">
            (Huom. ainoastaan Piiskapeli ja pullonpöritys on kunnolla toteutettu
            tällä hetkellä.)
          </p>
          <div className="game-selection-container">
            {[
              "Piiskapeli",
              "Malte",
              "Hitlter",
              "Placeholder",
              "Pullon Pyöritys",
            ].map((game) => (
              <button
                key={game}
                className="general-button game-button"
                onClick={() => setSelectedGame(game)}
              >
                {game}
              </button>
            ))}
          </div>

          {/* Go Back to Adding Players Button */}
          <button
            className="general-button back-button"
            onClick={goBackToAddingPlayers}
          >
            Takaisin pelaajien lisäämiseen
          </button>
        </>
      ) : (
        <>
          <h1 className="general-title">Lisää pelaajia</h1>
          <p className="general-description">
            Tässä pelissä pääset juomaan himoos
          </p>

          {/* Player Input and Add Button */}
          <div className="player-input-container">
            <input
              type="text"
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              onKeyDown={handleKeyDown} // Pressing Enter adds player
              placeholder="Pelaajan nimi"
              className="player-input"
            />
            <button onClick={addPlayer} className="general-button">
              Lisää pelaaja
            </button>
          </div>

          {/* Display Players List */}
          <ul className="player-list">
            {players.map((player, index) => (
              <li key={index} className="player-item">
                {player}
                <button
                  className="remove-button"
                  onClick={() => removePlayer(player)}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>

          {/* Start Button (Only Show if Players Exist) */}
          {players.length > 0 && (
            <button
              className="general-button start-button"
              onClick={() => setGameSelection(true)}
            >
              Valitse peli!
            </button>
          )}
        </>
      )}
    </div>
  );
}
