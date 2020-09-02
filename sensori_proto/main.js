
// Global variables for timestamp and count of sensors
var timestamp = '';
var sensorCount = 5;

// Global round variable that is only used when reading from the file for the first time
var round = 0;

// Global variable that holds information on the sensors. Their name indicates the location, type indicates the messaging technology and flag indicates if wheather the table is occupied or not and time indicates the time that the table became occupied.
var sensors = [{
    "name": "LoRaWAN PushButton",
    "flag": false,
    "type": "LoRa",
    "time": "2019-06-14T08:15:04.091",
    "devEUI": 'PUT THE CORRECT devEUI'
},
{
    "name": "Sigfox värinä",
    "flag": false,
    "type": "Sigfox",
    "time": "2019-06-14T08:15:04.091",
    "devEUI": 'PUT THE CORRECT devEUI'
},
{
    "name": "LoRaWAN PIR",
    "flag": false,
    "type": "LoRa",
    "time": "2019-06-14T08:15:04.091",
    "devEUI": 'PUT THE CORRECT devEUI'
},
{
    "name": "Sigfox PIR ",
    "flag": false,
    "type": "Sigfox",
    "time": "2019-06-14T08:15:04.091",
    "devEUI": 'PUT THE CORRECT devEUI'
},
{
    "name": "Coming Later",
    "flag": false,
    "time": "2019-06-14T08:15:04.091",
    "devEUI": 'NOT AVAILABLE'
}
];

/**
 *  Main class in the application that handels the basic things such as creating the state and sensorlist as well as passing information via state.
 */
class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "sensors": { ...sensors }
        };

        this.newState = this.newState.bind(this);
    }

    // After the component has mounted, the current state of the sensor is read from the file and the state is updated accordingly.
    componentDidMount() {
        // Put the correct URL in to use the code.
        let URL = '';
        for (let i = 0; i < sensorCount; i++) {
            let add = URL + sensors[i].devEUI + '_latest.json';
            if (sensors[i].name !== "Coming Later") {
                axios.get(add)
                    .then(res => {
                        timestamp = res.data.timestamp;
                        sensors[i]['time'] = timestamp;
                        let val = TableReserved(sensors[i]);
                        this.newState(sensors[i].name, val);
                    });
            }

        }
    }

    // Function that allows the state of the app to be changed.
    newState(name, val) {
        let tables = { ...this.state.sensors };
        for (let i = 0; i < sensorCount; i++) {
            if (tables[i].name === name) {
                tables[i].flag = val;
                tables[i].time = timestamp;
            }
        }
        this.setState({ sensors: tables });
    }

    render() {
        return (
            <Wrapper>
                <h2 id='beta'>This is still a <strong>PROPTYPE</strong> that is <strong>under development</strong>. The page updates every 30 seconds.</h2>
                <h1>Check if the table is reserved or free </h1>
                <DisplaySensors sensors={this.state.sensors} changed={this.state.changed} newState={this.newState} />
                <h2 id='notice'>More sensors will be added in <strong>autumn 2019.</strong></h2>
            </Wrapper>
        );
    }
}


/**
 *  An element that is used to eliminate extra divs that could mess the formatting.
 * @param {*} props props
 */
const Wrapper = (props) => {
    return props.children;
};

/**
 * A class that checks the value of the sensors flag property. If the property is true, the function returns a red object, otherwise the object is green.
 */
class CheckFlag extends React.Component {
    render() {

        if (this.props.sensor.flag === true) {
            return (<p id={this.props.sensor.name} key={this.props.id}>{this.props.sensor.name}  <span className="ind" style={{ backgroundColor: 'red' }}></span></p>);
        }
        else return (<p id={this.props.sensor.name} key={this.props.id}>{this.props.sensor.name}  <span className="ind" style={{ backgroundColor: 'green' }}></span></p>);
    }
}

/**
 * A class that displays a sensor list on the webpage.
 */
class DisplaySensors extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let sensorData = [];
        for (let i = 0; i < sensorCount; i++) {
            let key = Math.random();
            sensorData.push(<CheckChanges key={key} sensor={this.props.sensors[i]} sensors={this.props.sensors} flag={this.props.sensors[i].flag} id={this.props.sensors[i].name} newState={this.props.newState} />);
        }

        return (

            <div>
                <div id='instructions'>
                    <h4>Green coloured ball indicates that the table in question is free and red indicates that the table is occupied. Sensors are named after the space that they are located in. If one space has more than one self-study table, then the names include numbers to indicate a specific table. </h4>
                </div>
                <h2>Self-study tables:</h2>
                <div id='list'>
                    {sensorData}
                </div>
            </div>
        );

    }
}


/**
 * A class that is responsible for calling the class that checks if there are changes in timestamps and also calling the class that is responsible for creating a single sensor 
 */
class CheckChanges extends React.Component {
    constructor(props) {
        super(props);
    }

    // Function that is triggered via clock and reads the current state of the sensor from a file and then calls a function that updates the state of the app.
    tick(URL) {
        if (this.props.sensor.name !== "Coming Later") {
            let add = URL + this.props.sensor.devEUI + '_latest.json';
            axios.get(add)
                .then(res => {
                    timestamp = res.data.timestamp;
                    let check = TableReserved(this.props.sensor);
                    if (check === true) this.props.newState(this.props.sensor.name, true);
                    if (check === false) this.props.newState(this.props.sensor.name, false);
                });
        }

    }

    // Function that is triggered after component mounts that sets the interval for the triggering of tick function.
    componentDidMount() {
        // This needs to be just the actual base of the URL.
        this.interval = setInterval(() => this.tick(''), 30000);
    }

    // Function that is triggered when the component unmounts. It clears the interval.
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <CheckFlag sensor={this.props.sensor} id={this.props.sensor.name} newState={this.props.newState} />
        );
    }
}

/**
 *  A function that reads from a file and checks if the timestamps differ more than the chosen amount of minutes from the current time.
 */
const TableReserved = (sensor) => {

    // This has to be removed when there are more sensors, this is just here because currently the other sensors aren't actual sensors
    if (sensor.name === "Coming Later") return;

    // Creation of date objects, times and dates from the timestamps that will be used later.
    let current = new Date();
    let currentDate = current.toISOString().substring(0, 10);
    let currentTime = current.getTime();
    let oldStamp = AddHours(new Date(sensor.time));
    let oldTime = oldStamp.getTime();

    // The time in milliseconds that is used to differentiate between an occupied table and a free one. If the difference in time is greater than or equal to this number,then the table free.
    let offset = 1200000;

    // DATA EXAMPLE: 2019-06-17T08:15:04.091
    if (sensor.type === "Sigfox") {
        timestamp = AddHours(new Date(timestamp * 1000),2).toISOString().slice(0, 23);
    }
    if (sensor.type === "LoRa") {
        timestamp = AddHours(new Date(timestamp), 1);
    }

    let filedStamp = new Date(timestamp);
    let filedDate = filedStamp.toISOString().substring(0, 10);
    let filedTime = filedStamp.getTime();
    let time = currentTime - filedTime;


    // The actual checks that are performed to determine if the table is ocuupied or not by using timestamps.
    if (filedDate !== currentDate) return false;
    if (filedDate === currentDate) {
        if (filedTime === currentTime) return;
        if (round !== 0 && filedTime === oldTime) return;
        if (time < offset) return true;
        if (time > offset) return false;
    }

}


/**
 * Function that adds hours to the date. This is done because the date is not received correctly due to the change in timezones. Also summer and winter time modify the time differences, so the code has to be modified to fit those changes.
 */
const AddHours = (current, amount) => {
    current.setHours(current.getHours() + amount);
    return current;
}


ReactDOM.render(
    <App />,
    document.getElementById('app')
);