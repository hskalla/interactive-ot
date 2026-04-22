import { reloadAnalysis } from './dynamic.js';

export function initializePopups() {
  /* --- add constraint --- */
  fetch('/ot-constraints', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  .then(response => response.json())
  .then(json => {
    let name = "Add Constraint";
    let id = "add_constraint";
    let constraints = json.constraints;
    let constraints_html = "";
    constraints.forEach(constraint => {
      constraints_html += "<option>" + constraint + "</option>"
    });
    let content = "<select id='add_constraint_select'>" + constraints_html + "</select><div id='add_constraint_error'></div>"
    let button = "<button id='add_constraint_button'> Add </button>"
    let popup = makePopup(name, id, content, [button]);
    document.getElementById("add_constraint_button").addEventListener('click', () => {
      let constraint_choice = document.getElementById("add_constraint_select").value;
      if (window.constraints.includes(constraint_choice)) {
        console.log("includes constraint")
        document.getElementById("add_constraint_error").innerHTML = "Constraint is already included in the tableau.";
      } else {
        console.log("doesnt include constraint")
        document.getElementById("add_constraint_error").innerHTML = "";
        window.constraints.push(constraint_choice);
        closePopup("add_constraint")
      }
      reloadAnalysis();
    });
    dragElement(popup);
  });


  /* --- constraint info --- */
  fetch('/ot-descriptions', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  .then(response => response.json())
  .then(json => {
    let name = "Constraint Info";
    let id = "constraint_info";
    let descriptions = json.descriptions;
    console.log(descriptions);
    let content = "";
    let button = "<button id='remove_constraint_button'> Remove </button>"
    let popup = makePopup(name, id, content, [button]);
    document.getElementById("popup_constraint_info").descriptions = descriptions;
    document.getElementById("popup_constraint_info").active_constraint = null;
    document.getElementById("remove_constraint_button").addEventListener('click', () => {
      let constraint_choice = document.getElementById("popup_constraint_info").active_constraint;
      if (window.constraints.includes(constraint_choice)) {
        window.constraints = window.constraints.filter(item => item !== constraint_choice);
        closePopup("constraint_info")
      } else {
        console.log("Trying to remove a constraint that doesn't exist! This shouldn't happen!")
      }
      reloadAnalysis();
    });
    dragElement(popup);
  });

}

export function setInfoPopup(constraint) {
  document.getElementById("popup_constraint_info").active_constraint = constraint;
  document.querySelector("#popup_constraint_info .popup_title").innerHTML = "<b>"+constraint+"</b> (Constraint)";
  document.getElementById("popup_constraint_info_content").innerHTML = popup_constraint_info.descriptions[constraint];

}

export function openPopup(id) {
  if (document.getElementById("popup_" + id)) {
    document.getElementById("popup_" + id).style.display = "flex";
  }
}

export function closePopup(id) {
  if (document.getElementById("popup_" + id)) {
    document.getElementById("popup_" + id).style.display = "none"
  }
}

function makePopup(name, id, content, buttons=[]) {
  if (document.getElementById("popup_" + id)) {
    return
  }
  let popup = document.createElement("div");
  popup.className = "popup";
  popup.id = "popup_" + id;
  let close_html = `
    <button class="popup_close" id="` + popup.id + `_close"> X </button>
  `;
  let html = `
    <div class="popup_header" id="` + popup.id + `_header"> <span class="popup_title">` + name + `</span>` + close_html + `</div>
  `;
  html += `
    <div class="popup_content" id="` + popup.id + `_content">` + content + `</div>
  `;
  let buttons_html = "";
  buttons.forEach(button => {
    console.log("added button")
    buttons_html += button
  });
  html += `
    <div class="popup_buttons" id="` + popup.id + `_buttons">` + buttons_html + `</div>
  `;
  popup.innerHTML = html;
  popup.style.display = "none";
  document.body.appendChild(popup);
  document.getElementById(popup.id+"_close").addEventListener('click', () => {
    closePopup(id);
  });
  return popup;
}

export function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "_header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "_header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    console.log("mousedown")
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}