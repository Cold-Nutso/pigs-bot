const loadPlayerFromServer = async () => {
    const response = await fetch('/getPlayer');
    const data = await response.json();

    ReactDOM.render(
        <PlayerStats stats={ data.player }/>,
        document.getElementById('playerStats')
    );
};

const PlayerStats = (props) => {
    const stats = props.stats;

    return (
        <div id="stats">
            <h1>{stats.name}'s Statistics</h1>
            <ul>
                <li>Games: {stats.games}</li>
                <li>Wins: {stats.wins}</li>
                <li>Losses: {stats.losses}</li>
                <li>Rolls:
                    <ul>
                        <li>Total: {stats.rolls[0]}</li>
                        <li>1's: {stats.rolls[1]}</li>
                        <li>2's: {stats.rolls[2]}</li>
                        <li>3's: {stats.rolls[3]}</li>
                        <li>4's: {stats.rolls[4]}</li>
                        <li>5's: {stats.rolls[5]}</li>
                        <li>6's: {stats.rolls[6]}</li>
                    </ul>
                </li>
                <li>Turns: {stats.turns}</li>
                <li>Profit: {stats.profit}</li>
                <li>Busts: {stats.busts}</li>
                <li>Bros: {stats.bros}</li>
            </ul>
        </div>
    );
};

const init = async () => {
    loadPlayerFromServer();
};

window.onload = init;