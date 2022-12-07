const helper = require('./helper.js');

const loadPlayerFromServer = async (discordID) => {
    let id = "------default-----"; // Set default param
    if (discordID) { id = discordID; }

    const response = await fetch(`/getPlayer/discordID=${id}`);
    const data = await response.json();

    if (data.error) {
        ReactDOM.render(
            <p class='error'>{ data.error }</p>,
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
            <p class='error'>No statistics found!</p>,
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
            <div>
                <label htmlFor="discordID">Enter a Discord ID: </label>
                <input id="discordID" type="text" name="discordID" placeholder="915117668451901461" />
                <p>Cold Nutso - 332256896599851008</p>
                <p>Pigs Bot - 915117668451901461</p>
            </div>
            
            <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
            <input className="formSubmit" type="submit" value="Search for Stats" />
        </form>
    );
};

const PlayerStats = (props) => {
    const stats = props.stats;

    return (
        <div id="stats">
            <h1>{stats.name}'s Statistics</h1>
            <div class="numbers">
                <div>
                    <p class='head'><span class='sig'>{stats.games}</span> games played</p>
                    <p><span class='sig'>{stats.wins}</span> wins</p>
                    <p><span class='sig'>{stats.losses}</span> losses</p>
                </div>

                <div>
                    <p class='head'><span class='sig'>{stats.rolls[0]}</span> total rolls</p>
                    <div class='dice'>
                        <p><span class='sig'>{stats.rolls[1]}</span> 1's</p>
                        <p><span class='sig'>{stats.rolls[2]}</span> 2's</p>
                        <p><span class='sig'>{stats.rolls[3]}</span> 3's</p>
                        <p><span class='sig'>{stats.rolls[4]}</span> 4's</p>
                        <p><span class='sig'>{stats.rolls[5]}</span> 5's</p>
                        <p><span class='sig'>{stats.rolls[6]}</span> 6's</p>
                    </div>
                </div>

                <div>
                    <p class='head'><span class='sig'>{stats.turns}</span> turns taken</p>
                    <p><span class='sig'>{stats.profit}</span> points earned</p>
                    <p><span class='sig'>{stats.busts}</span> times busted</p>
                    <p><span class='sig'>{stats.bros}</span> times bro'd</p>
                </div>
            </div>
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