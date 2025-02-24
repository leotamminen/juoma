const Malte = ({
  players,
  onBack,
}: {
  players: string[];
  onBack: () => void;
}) => {
  return (
    <div className="general-container">
      <h2 className="general-title">Malte</h2>
      <p className="general-description">Tervetuloa Malte-peliin!</p>
      <p className="general-description">
        Alla korttipakka, jota painamalla voit aloittaa pelin
      </p>

      <h3 className="general-title">Pelaajat:</h3>
      <ul className="player-list">
        {players.map((player, index) => (
          <li key={index} className="player-item">
            {player}
          </li>
        ))}
      </ul>

      <button className="general-button back-button" onClick={onBack}>
        Takaisin pelivalintaan
      </button>
    </div>
  );
};

export default Malte;
