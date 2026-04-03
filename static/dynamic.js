import { openPopup, closePopup, initializePopups } from "./popup.js";

export function reloadAnalysis() {
    fetch('/ot-analysis', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({constraints: window.constraints})
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
            $(".constraint_table").html(formatConstraints(table));
            $(".candidate_table").html(formatForms(json.tableau));
            bindEvents();
        }) // Use the parsed data
        .catch(err => console.log(err)); // Handle network or request errors
}

function formatConstraints(arr) {
    let html = "";
    for (const c of arr[0]) {
        html += ("<th draggable='true'>" + c + "</th>");
    }
    let add_const_button = "<td><button class='add_const'>+</button></td>";
    html += add_const_button;
    html = "<tr>" + html + "</tr>";
    for (let i=1; i<arr.length; i++) {
        let row = "";
        for (const c of arr[i]) {
            row += ("<td>" + c + "</td>");
        }
        row = "<tr>" + row + "</tr>";
        html += row;
    }
    return html;
}

function formatForms(arr) {
    let html = "";
    for (const c of arr) {
        html += ("<tr><td>" + c[0] + "</td></tr>");
    }
    console.log(html)
    return html
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
    window.constraints = []
    $('.constraint_table tr:first th').each(function(index) {
        var cellText = $(this).text();
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
    /* document.querySelectorAll('.popup').forEach(elmnt => {
        dragElement(elmnt);
    }); */
    console.log("binding events")
}