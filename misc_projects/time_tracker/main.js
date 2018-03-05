var entries;
var storageObj;

window.onload = function() {
    load();
    regenerateList();
};


function addEntry() {
    var str = document.getElementById("inputField").value;
    var d = new Date();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    entries.push({
        text: str,
        time: d.getTime(),
        timeStr: hours + ":" + minutes,
    });

    save();
    regenerateList();
}

function load() {
    var str = localStorage.time_tracker || "{}";
    try {
        storageObj = JSON.parse(str);
    } catch (SyntaxError) {
        storageObj = {};
    }

    entries = storageObj.entries || [];
}

function save() {
    saveAs("time_tracker");
}

function saveBackup() {
    saveAs("time_tracker_backup");
}

function saveAs(key) {
    storageObj.entries = entries;
    localStorage[key] = JSON.stringify(storageObj);
}

function regenerateList() {
    var table = document.getElementById("entryTable");
    table.innerHTML = "";

    for(var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var tr = document.createElement("tr");

        var td;

        // keep for later
        var inp = null;
        if (entry.editable) {
            inp = document.createElement("input");
            inp.type = "text";
            inp.value = entry.text;
        }
        
        td = document.createElement("td");
        td.appendChild(createDeleteButton(i));
        tr.appendChild(td);
        
        td = document.createElement("td");
        td.appendChild(createEditButton(i, inp));
        tr.appendChild(td);
        
        td = document.createElement("td");
        var prevTime = i > 0? entries[i-1].time : entry.time;
        td.innerHTML = formatMilliseconds(entry.time - prevTime);
        tr.appendChild(td);
        
        td = document.createElement("td");
        td.innerHTML = entry.timeStr;
        tr.appendChild(td);
        
        td = document.createElement("td");
        if (inp) {
            td.appendChild(inp);
        } else {
            td.innerHTML = entry.text;
        }
        tr.appendChild(td);

        table.appendChild(tr);
    }
}

function createDeleteButton(lineIndex) {
    var but = document.createElement("button");
    but.innerHTML = "Del";
    but.onclick = getDeleteFunction(lineIndex);
    return but;
}

function createEditButton(lineIndex, inputField) {
    var but = document.createElement("button");
    but.innerHTML = "Edit";
    but.onclick = getEditFunction(lineIndex, inputField);
    return but;
}

function getDeleteFunction(index) {
    return function() {
        entries.splice(index, 1);
        save(); 
        regenerateList();
    };
}

function getEditFunction(index, inputField) {
    return function() {
        if(entries[index].editable && inputField) {
            entries[index].text = inputField.value;
        }

        entries[index].editable = !entries[index].editable;
        save(); 
        regenerateList();
    };
}

function formatMilliseconds(mills) {
    var seconds = Math.floor(mills / 1000);
    var hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    return fillZero(hours) + ":" + fillZero(minutes) + ":" + fillZero(seconds);
}

function fillZero(int) {
    return (int < 10 ? "0" : "") + int; 
}