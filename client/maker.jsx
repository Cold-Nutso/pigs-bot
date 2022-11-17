const helper = require('./helper.js');

const loadDomosFromServer = async () => {
    const response = await fetch('/getDomos');
    const data = await response.json();
    ReactDOM.render(
        <DomoList domos={data.domos} />,
        document.getElementById('domos')
    );
};

const handleDomo = (e) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const food = e.target.querySelector('#domoFood').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if (!name && age && food) {
        helper.handleError('Name field is required!');
        return false;
    } else if (name && !age && food) {
        helper.handleError('Age field is required!');
        return false;
    } else if (name && age && !food) {
        helper.handleError('Food field is required!');
        return false;
    }
    else if (!name || !age || !food) {
        helper.handleError('All fields are required!');
        return false;
    }

    helper.sendPostDomo(e.target.action, {name, age, food, _csrf}, loadDomosFromServer);

    return false;
};

const handleDeleteDomo = (e) => {
    e.preventDefault();
    helper.hideError();

    const domoDisplay = e.target.parentNode;
    const _id = domoDisplay.dataset.key;
    const _csrf = document.querySelector('#_csrf').value;

    if (!_id) {
        helper.handleError("Couldn't find the key.");
        return false;
    }

    helper.sendPostDomo(e.target.action, { _id, _csrf }, loadDomosFromServer);

    // This is redundant, but it just wouldn't update properly otherwise
    loadDomosFromServer();

    return false;
};

const DomoForm = (props) => {
    return (
        <form id="domoForm"
            onSubmit={handleDomo}
            name="domoForm"
            action="/maker"
            method="POST"
            className="domoForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo" />
            <label htmlFor="age">Age: </label>
            <input id="domoAge" type="number" min="0" name="age" placeholder="20"/>
            <label htmlFor="food">Favorite Food: </label>
            <input id="domoFood" type="text" name="food" placeholder="nikujaga"/>
            <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
            <input className="makeDomoSubmit" type="submit" value="Make Domo" />
        </form>
    );
};

const DomoList = (props) => {
    if (props.domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Domos Yet!</h3>
            </div>
        );
    }

    const domoNodes = props.domos.map(domo => {
        return (
            <div key={domo._id} data-key={domo._id} className="domo">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="domoName"> Name: {domo.name} </h3>
                <h3 className="domoAge"> Age: {domo.age} </h3>
                <h3 className="domoFood"> Favorite Food: {domo.food} </h3>
                <form
                    onSubmit={handleDeleteDomo}
                    name="deleteForm"
                    action="/delete"
                    method="POST"
                    className="deleteForm"
                >
                    <input className="deleteDomoSubmit" type="submit" value="DELETE" />
                </form>
            </div>
        );
    });

    return (
        <div className="domoList">
            {domoNodes}
        </div>
    );
};

const init = async () => {
    const response = await fetch('/getToken');
    const data = await response.json();

    ReactDOM.render(
        <DomoForm csrf={data.csrfToken} />,
        document.getElementById('makeDomo')
    );

    ReactDOM.render(
        <DomoList domos = {[]} />,
        document.getElementById('domos')
    );

    loadDomosFromServer();
};

window.onload = init;