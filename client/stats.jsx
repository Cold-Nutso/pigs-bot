const helper = require('./helper.js');

const loadPlayerFromServer = async (discordID) => {
    let id = "------default-----"; // Set default param
    if (discordID) { id = discordID; }

    const response = await fetch(`/getPlayer/discordID=${id}`);
    const data = await response.json();

    if (data.error) {
        ReactDOM.render(
            <p>{ data.error }</p>,
            document.getElementById('input')
        ); 
    }
    if (data.player) {
        ReactDOM.render(
            <PlayerStats stats={ data.player }/>,
            document.getElementById('playerStats')
        ); 
    } else {
        ReactDOM.render(
            <p>No Stats Found!</p>,
            document.getElementById('playerStats')
        );
    }
};

const handleStats = (e) => {
    e.preventDefault();
    helper.hideError();

    const discordID = e.target.querySelector('#discordID').value;

    loadPlayerFromServer(discordID);

    return false;
};

const StatsForm = (props) => {
    return (
        <form id="statsForm"
            onSubmit={handleStats}
            name="statsForm"
            action="/getPlayer"
            method="GET"
            className="statsForm"
        >
            <label htmlFor="discordID">Name: </label>
            <input id="discordID" type="text" name="discordID" placeholder="915117668451901461" />
            <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
            <input className="getStatsSubmit" type="submit" value="Search for Stats" />
        </form>
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
    const response = await fetch('/getToken');
    const data = await response.json();

    ReactDOM.render(
        <StatsForm csrf={data.csrfToken} />,
        document.getElementById('input')
    );

    loadPlayerFromServer();
};

window.onload = init;