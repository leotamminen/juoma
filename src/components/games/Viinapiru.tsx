import { useRef, useState, useEffect } from "react";

const Viinapiru = ({
  players,
  onBack,
}: {
  players: string[];
  onBack: () => void;
}) => {
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const [starter, setStarter] = useState<string | null>(null);

  const randomizeStarter = () => {
    if (players.length > 0) {
      setStarter(players[Math.floor(Math.random() * players.length)]); // Select random starter
    }
  };

  useEffect(() => {
    randomizeStarter(); // Set initial starter when the game starts
  }, [players]);

  return (
    <div className="general-container">
      <h2 className="general-title">Anna piiskaa :D</h2>
      <p>(Ja muut biisulit)</p>
      <p className="general-description">Aishaatana nyt ois sitä</p>
      <p className="general-description">
        Paina musiikki päälle kun olet valmis niin juodaan!
      </p>

      {/* Display the randomly chosen starter */}
      {starter && (
        <p className="starter-text">
          🎲 Aloittaja: <strong>{starter}</strong>
        </p>
      )}

      {/* "Arvo uudelleen" Button */}
      <div className="spin-section">
        <button
          className="general-button spin-button"
          onClick={randomizeStarter}
        >
          🔄 Arvo uudelleen
        </button>
      </div>

      {/* Audio Players */}
      <div className="audio-container">
        {[
          { title: "🎵 Piiska (remix)", src: "/audio/song1.mp3" },
          { title: "🎵 Häkkine", src: "/audio/song2.mp3" },
          { title: "🎵 Salamanisku", src: "/audio/song3.mp3" },
        ].map((song, index) => (
          <div className="audio-item" key={index}>
            <p className="audio-title">{song.title}</p>
            <audio
              controls
              ref={(el) => {
                if (el) audioRefs.current[index] = el;
              }}
            >
              <source src={song.src} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ))}
      </div>

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

export default Viinapiru;
