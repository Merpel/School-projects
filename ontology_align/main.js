window.onload = function () {
    $('#align').on('click', function () {
        createTable(data);
        console.log(data);
    });

}


// Global variable that contains the own ontology properties
var ownNames = ['bookerName', 'numberOfPeople', 'numberOfBedrooms', 'distanceToLake', 'cityName', 'distanceToNearestCity', 'arrivalDate', 'duration', 'shift'];

// Global variable for descriptions
var descriptions = ['Name of the booker', 'Number of people staying in the cottage', 'Number of bedrooms in the cottage', 'Distance to the Lake', 'Nearest city', 'Distance to the nearest city', 'Date of arrival', 'Duration of the stay', 'Shift in arrival date'];

/**
 * Function that creates a table with the data that it is provided with.
 * @param data Data from the backend or js file (mock data)
 */
function createTable(data) {

    // Show the headline to user and clear any existing tables
    $('#preliminary').css('visibility', 'visible');
    $('#hidden-table').empty();

    //Creating the table
    let div = $('#hidden-table');
    div.append('<table id="align-table"></table>');
    let tblbody = document.createElement('tbody');
    let table = $('#align-table');
    table.append(tblbody);

    // Creating the header row
    let hRow = document.createElement('tr');
    hRow.setAttribute('id', 'headers');
    let thText;
    for (let k = 0; k < 4; k++) {
        let th = document.createElement('th');
        if (k === 0) thText = document.createTextNode('Description');
        if (k === 1) thText = document.createTextNode('Own');
        if (k === 2) thText = document.createTextNode('Remote');
        if (k === 3) thText = document.createTextNode('Confidence');
        th.appendChild(thText);
        hRow.appendChild(th);
    }
    table.append(hRow);

    // Creating the rows of the table
    for (let i = 0; i < descriptions.length; i++) {
        let row;
        if (i === 0) row = createRow(data.bookerName, i);
        if (i === 1) row = createRow(data.numberOfPeople, i);
        if (i === 2) row = createRow(data.numberOfBedrooms, i);
        if (i === 3) row = createRow(data.distanceToLake, i);
        if (i === 4) row = createRow(data.cityName, i);
        if (i === 5) row = createRow(data.distanceToNearestCity, i);
        if (i === 6) row = createRow(data.arrivalDate, i);
        if (i === 7) row = createRow(data.duration, i);
        if (i === 8) row = createRow(data.shift, i);
        row.setAttribute('id', 'row' + (i + 1));
        table.append(row);
    }

    // Creates a button so that user can accept the alignment. To get text replace val() with text()
    let button = document.createElement('button');
    button.setAttribute('id', 'accept');
    button.appendChild(document.createTextNode('Confirm alignment'));
    button.addEventListener('click', function (event) {
        checkValidity();
    });
    div.append(button);
}

/**
 * Function that creates a row to the table with given information.
 */
function createRow(object, index) {
    let confidence = ['0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%'];
    let row = document.createElement('tr');
    for (let i = 0; i < 4; i++) {
        let cell = document.createElement('td');
        let text;
        if (i === 0) text = document.createTextNode([descriptions[index]]);
        if (i === 1) text = document.createTextNode(object.name);
        if (i === 2) {
            if (object.mappedTo !== "") {
                text = document.createTextNode(object.mappedTo.name);
                cell.setAttribute('id', 'value' + (index + 1));
                cell.appendChild(text);
            }
            else {
                text = document.createElement('select');
                getChoices(object).forEach(element => {
                    let option = document.createElement('option');
                    option.setAttribute('value', element);
                    option.appendChild(document.createTextNode(element));
                    text.appendChild(option);
                    text.setAttribute('id', 'select' + (index + 1));
                });
                cell.addEventListener('change', function () {
                    getConfidence(object);
                });
                cell.appendChild(text);
            }
        }
        if (i === 3) {
            if (object.mappedTo !== "") {
                text = document.createTextNode(object.mappedTo.confidence + ' %');
            }
            else {
                text = document.createTextNode(object.mappable[0].confidence + ' %');
                cell.setAttribute('id', 'conf' + (index));
            }
        }
        if (i !== 2) cell.appendChild(text);
        row.appendChild(cell);
    }
    return row;
}

/**
 * Function that gets confidence from an obkect.
 * @param  object Object where the confidences are taken.
 */
function getConfidence(object) {
    let conf;
    let index = 2;
    if (object.name === "numberOfBedrooms") index = 3;
    if (object.name === "distanceToLake") index = 4;
    if (object.name === "cityName") index = 5;
    if (object.name === "distanceToNearestCity") index = 6;
    if (object.name === "arrivalDate") index = 7;
    if (object.name === "shift") index = 9;
    let name = $('#select' + index + ' option:selected').val();
    object.mappable.forEach(element => {
        if (element.name === name) conf = element.confidence;
    });
    $('#conf' + (index - 1)).text(conf + ' %');
}

/**
 * Function that gets mappable table from the object.
 * @param  object Object where the confidences are taken.
 */
function getChoices(object) {
    let choices = [];
    object.mappable.forEach(element => {
        choices.push(element.name);
    });
    return choices;
}

/**
 * Function that creates an area where information is shown. 
 * This information is taken from the table after users confirmation.
 */
function createFinal() {

    // Show the headline to user and fetch the div for information
    $('#final').css('visibility', 'visible');
    let area = $('#hidden-results');

    // If there is already a message and table, they will be removed
    $('#hidden-results').empty();

    area.append('<p id="message">You have confirmed the alignment shown belonw and it has been saved to a file for later use.</p>');

    //Creating the table
    area.append('<table id="final-table"></table>');
    let tblbody = document.createElement('tbody');
    let table = $('#final-table');
    table.append(tblbody);

    // Creating the header row
    let hRow = document.createElement('tr');
    hRow.setAttribute('id', 'ontHeaders');
    let thText;
    for (let i = 0; i < 2; i++) {
        let th = document.createElement('th');
        if (i === 0) thText = document.createTextNode('Ontology 1');
        if (i === 1) thText = document.createTextNode('Ontology 2');
        th.appendChild(thText);
        hRow.appendChild(th);
    }
    table.append(hRow);

    for (let i = 0; i < 9; i++) {
        let row = document.createElement('tr');
        row.setAttribute('id', 'row' + (i + 1));
        for (let j = 0; j < 2; j++) {
            let cell = document.createElement('td');
            let text;
            if (j === 0) text = document.createTextNode([ownNames[i]]);
            if (j === 1) {
                if (document.getElementById('value' + (i + 1)) === null) {
                    let value = '#select' + (i + 1) + ' option:selected';
                    text = document.createTextNode($(value).val());
                }
                else {
                    let value = '#value' + (i + 1);
                    text = document.createTextNode($(value).text());
                }
            }
            cell.appendChild(text);
            row.appendChild(cell);
        }
        table.append(row);
    }
}

/**
 * Function that checks the validity of alignment(no duplicate properties).
 */
function checkValidity() {
    let selectedValues = [];
    for (let i = 1; i <= 9; i++) {
        let insert;
        if (document.getElementById('value' + i) === null) {
            let value = '#select' + (i);
            insert = ($(value + ' option:selected').val());
        }
        else {
            insert = ($('#value' + i).text());
        }
        if (selectedValues.includes(insert) && i !== 1 && i < 9) {
            $('#final').css('visibility', 'visible');
            $('#hidden-results').empty();
            $('#hidden-results').append('<p id="message">Alignment cannot contain duplicate properties. All properties have ONLY ONE property that they map to.</p>');
            console.log(selectedValues);
            return;
        }
        if (i === 9 && !selectedValues.includes(insert)) {
            selectedValues[i - 1] = insert;
            createFinal();
        }
        else {
            selectedValues[i - 1] = insert;
        }
    }
}