import { useState, useEffect } from "react";
import { extraTasks } from "@/data/tasks"; // Import the extra tasks

const Placeholder = ({
  players,
  onBack,
}: {
  players: string[];
  onBack: () => void;
}) => {
  const [drinkAmounts, setDrinkAmounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [assignedTasks, setAssignedTasks] = useState<{ [key: string]: string }>(
    {}
  );

  const generateUniqueValues = () => {
    // Create a shuffled list of numbers 0-5, duplicated if necessary
    const drinkNumbers = Array.from({ length: 6 }, (_, i) => i); // Numbers 0-5
    let extendedNumbers = [...drinkNumbers];

    // If there are more players than unique values, duplicate the numbers
    while (extendedNumbers.length < players.length) {
      extendedNumbers = [...extendedNumbers, ...drinkNumbers];
    }

    // Shuffle the extended list
    const shuffledNumbers = extendedNumbers.sort(() => Math.random() - 0.5);
    const newDrinkAmounts: { [key: string]: number } = {};

    players.forEach((player, index) => {
      newDrinkAmounts[player] = shuffledNumbers[index]; // Assign numbers from shuffled list
    });

    // Shuffle tasks and assign them to players
    const shuffledTasks = [...extraTasks].sort(() => Math.random() - 0.5);
    const newAssignedTasks: { [key: string]: string } = {};

    players.forEach((player, index) => {
      newAssignedTasks[player] = shuffledTasks[index % shuffledTasks.length]; // Ensure unique tasks
    });

    setDrinkAmounts(newDrinkAmounts);
    setAssignedTasks(newAssignedTasks);
  };

  useEffect(() => {
    generateUniqueValues(); // Run on first load and when players change
  }, [players]);

  return (
    <div className="general-container">
      <h2 className="general-title">Placeholder</h2>
      <p className="general-description">
        Juokaa kaikki :D Jos ei pysty tekemään tehtävää niin juo lisää
      </p>

      <h3 className="general-title">Pelaajat & heidän tehtävänsä:</h3>
      <ul className="player-list">
        {players.map((player) => (
          <li key={player} className="player-item">
            {player} - {drinkAmounts[player]} huikkaa 🍻 <br />
            <span className="extra-task">🎲 {assignedTasks[player]}</span>
          </li>
        ))}
      </ul>

      <button
        className="general-button reroll-button"
        onClick={generateUniqueValues}
      >
        🔄 Arvo uudelleen
      </button>

      <button className="general-button back-button" onClick={onBack}>
        Takaisin pelivalintaan
      </button>
    </div>
  );
};

export default Placeholder;
