import { useState } from "react";

const PullonPyoritys = ({
  players,
  onBack,
}: {
  players: string[];
  onBack: () => void;
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [sips, setSips] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [previousDrinkers, setPreviousDrinkers] = useState<
    { player: string; sips: number }[]
  >([]);
  const [sipCounter, setSipCounter] = useState<Record<string, number>>(
    players.reduce((acc, player) => ({ ...acc, [player]: 0 }), {})
  );

  const spinBottle = () => {
    if (players.length === 0) return;

    setSpinning(true); // Start animation effect
    setTimeout(() => {
      let newPlayer: string;
      do {
        newPlayer = players[Math.floor(Math.random() * players.length)];
      } while (newPlayer === selectedPlayer && players.length > 1); // Ensure the same player doesn't get picked twice in a row

      const randomSips = Math.floor(Math.random() * 5) + 1; // 1-5 sips

      setSelectedPlayer(newPlayer);
      setSips(randomSips);

      // Update previous drinkers list
      setPreviousDrinkers((prev) => [
        { player: newPlayer, sips: randomSips },
        ...prev,
      ]);

      // Update sip counter
      setSipCounter((prev) => ({
        ...prev,
        [newPlayer]: (prev[newPlayer] || 0) + randomSips,
      }));

      setSpinning(false); // Stop animation
    }, 1500); // Simulate spinning delay
  };

  return (
    <div className="general-container">
      <h2 className="general-title">Pullon Pyöritys</h2>
      <p className="general-description">
        Paina Pyöritä pulloa ja joku pelaajista joutuu juomaan!
      </p>

      <div className="game-layout">
        {/* Player List */}
        <div className="player-section">
          <h3 className="general-title">Pelaajat</h3>
          <ul className="player-list">
            {players.map((player, index) => (
              <li key={index} className="player-item">
                {player} - 🍺 {sipCounter[player]} hörppyä
              </li>
            ))}
          </ul>
        </div>

        {/* Spin Button and Result */}
        <div className="spin-section">
          <button
            className="general-button spin-button"
            onClick={spinBottle}
            disabled={spinning}
          >
            {spinning ? "Pyörittää..." : "Pyöritä pulloa"}
          </button>

          {selectedPlayer && sips !== null && (
            <p className="spin-result">
              🎉 {selectedPlayer} juo {sips} hörppyä! 🍻
            </p>
          )}
        </div>

        {/* Previous Drinkers */}
        <div className="history-section">
          <h3 className="general-title">Edelliset juojat</h3>
          <ul className="history-list">
            {previousDrinkers.map((entry, index) => (
              <li key={index} className="history-item">
                {entry.player} - {entry.sips} hörppyä 🍻
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button className="general-button back-button" onClick={onBack}>
        Takaisin pelivalintaan
      </button>
    </div>
  );
};

export default PullonPyoritys;
