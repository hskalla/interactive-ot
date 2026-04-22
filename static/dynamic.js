import { openPopup, closePopup, initializePopups } from "./popup.js";

export function reloadAnalysis() {
    fetch('/ot-analysis', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                input: window.inputs[window.input_index], 
                forms: window.forms[window.input_index], 
                constraints: window.constraints})
        })
        .then(response => response.json()) // Parse the response body as JSON
        .then(json => {
            let table = [];
            table.push([]);
            for (const constraint of window.constraints) {
                table[0].push(constraint);
            }
            for (let i=0; i<json.tableau.length; i++) {
                table.push([]);
                for (const violations of json.tableau[i][1]) {
                    table[i+1].push(violations);
                }
            }
            $(".input_selector").html(formatInputSelector());
            document.getElementById("input_selector").selectedIndex = window.input_index;
            $(".constraint_table").html(formatConstraints(table));
            $(".candidate_table").html(formatForms(json.tableau));
            let header_height = $('.const_header').height();
            $("#form_header").height(header_height);
            bindEvents();
        }) // Use the parsed data
        .catch(err => console.log(err)); // Handle network or request errors
}

function formatConstraints(arr) {
    let html = "";
    for (const c of arr[0]) {
        html += ("<th class='const_header' draggable='true'>" + c + "</th>");
    }
    let add_const_button = "<th><button class='add_const'>+</button></th>";
    html += add_const_button;
    html = "<tr>" + html + "</tr>";
    for (let i=1; i<arr.length; i++) {
        let row = "";
        let exc = false;
        for (const c of arr[i]) {
            if (exc) {
                row += ("<td class='grayed'>" + c.replaceAll("?","") + "</td>");
            } else {
                row += ("<td>" + c.replaceAll("?","") + "</td>");
            }
            if (!exc && (c.includes("?") || c.includes("!"))) {
                exc = true;
            }
        }
        row = "<tr>" + row + "</tr>";
        html += row;
    }
    return html;
}

function formatForms(arr) {
    let html = "<tr id='form_header'><th>Forms:</th></tr>";
    for (const c of arr) {
        html += ("<tr><td>" + c[0] + "</td></tr>");
    }
    console.log(html)
    return html
}

function formatInputSelector() {
    let html = "";
    for (const i of window.inputs) {
        html += "<option value=" + i + ">" + i + "</option>";
    }
    return html;
}

function listenerDragStart(e) {
    e.target.style.opacity = '0.4';  // e.target = this
    e.dataTransfer.effectAllowed = 'move';
    var srcTxt = $(this).text();
    e.dataTransfer.setData('text', $(this).text());
}
function listenerDragEnd(e) {
    e.target.style.opacity = '1.0';  // e.target = this
}
function listenerDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    return false;
}
function listenerDragEnter(e) {
    e.target.classList.add('dropZone');
}
function listenerDragLeave(e) {
    e.target.classList.remove('dropZone');
}
function listenerDrop(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    var srcText = e.dataTransfer.getData('text'); 
    var destText = $(this).text();
    if (srcText == destText) {
        return; // Cancels the action if user drags a constraint onto itself.
    }
    window.constraints = []
    $('.constraint_table tr:first th').each(function(index) {
        var cellText = $(this).text();
        if (cellText == "+") {
            return true; // Acts like a continue statement.
        }
        if (cellText !== srcText) {
            if (cellText === destText) {
                window.constraints.push(srcText)
                window.constraints.push(destText)
            } else {
                window.constraints.push(cellText)
            }
        }
    });
    console.log(constraints);
    reloadAnalysis();
}

function bindEvents() {
    var cols = document.querySelectorAll('th');
    [].forEach.call(cols, function(col) {
        col.addEventListener('dragstart', listenerDragStart, false);
        col.addEventListener('dragend', listenerDragEnd, false);
        col.addEventListener('dragover', listenerDragOver, false);
        col.addEventListener('dragenter', listenerDragEnter, false);
        col.addEventListener('dragleave', listenerDragLeave, false);
        col.addEventListener('drop', listenerDrop, false);
    });
    document.querySelector(".add_const").addEventListener("click", () => {
        openPopup("add_constraint")
    });
    console.log(document.querySelectorAll(".const_header"))
    document.querySelectorAll(".const_header").forEach(e => {
        e.addEventListener("click", () => {
            if (window.constraints.length > 1) {
                window.constraints = window.constraints.filter(item => item !== e.textContent);
                console.log(e.textContent);
                reloadAnalysis();
            }
        });
    });
    document.getElementById("input_selector").addEventListener("input", e => {
        console.log("selected index: " + e.target.selectedIndex);
        window.input_index = e.target.selectedIndex;
        reloadAnalysis();
    });
    console.log("binding events")
}