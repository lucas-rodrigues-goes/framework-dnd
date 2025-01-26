`[r:'`

//=====================================================================================================
// Components
//=====================================================================================================

function element({
    content="", id="", tag="", classes="", style="", placeholder="", onclick="", value="", src="", 
    tooltip="", additional=""
}={}) {
    id = id ? `id="`+id+`"` : ""
    style = style ? `style="`+style+`"` : ""
    placeholder = placeholder ? `placeholder="`+placeholder+`"` : ""
    onclick = onclick ? `onclick="`+onclick+`"` : ""
    value = value ? `value="`+value+`"` : ""
    src = src ? `src="`+src+`"` : ""

    tooltip = tooltip ? `tooltip="`+tooltip+`"` : ""
    classes += tooltip ? " tooltip " : ""

    classes = classes ? `class="`+classes+`"` : ""

    return `
        <`+tag+` `+id+` `+classes+` `+style+` `+placeholder+` `+onclick+` `+value+` `+src+` `+tooltip+` `+additional+`>`+
            ``+content+``+
        `</`+tag+`>`.trim()
}

function div({content, id, classes, style, onclick, additional, tooltip}={}) {
    return element({content, id, classes, style, onclick, additional, tooltip, tag:"div"})
}

function span({content, id, classes, style, tooltip}={}) {
    return element({content, id, classes, style, tooltip, tag:"span"})
}

function paragraph({content, id, classes, style, tooltip}={}) {
    return element({content, id, classes, style, tooltip, tag:"p"})
}

function pre({content, id, classes, style, tooltip}={}) {
    return element({content, id, classes, style, tooltip, tag:"pre"})
}

function option({content, value}={}) {
    let additional = ""

    return element({content, value, additional, tag:"option"})
}

function options_from_array(array) {
    let content = ""

    for (const value of array) {
        content += option({content:capitalize(value), value:value})
    }

    return content
}

function select({content, style, content_type="array", id, placeholder=""}={}) {

    switch(content_type) {
        case "array":
            content = 
                option({content:" ", value:""}) +
                options_from_array(content).trim()
            break
    }

    let return_content = (
        div({classes:"input-container", style, id:id+"-container", content:(
            element({tag:"select", id, additional:`required`, content}) +
            element({tag:"label", content:placeholder, additional:`for="`+id+`"`})
        )})
    )

    return return_content
}

function input({id, style, placeholder}={}) {
    let return_content = (
        div({classes:"input-container", style, id:id+"-container", content:(
            element({tag:"input", id, placeholder:" ", additional:`type="text" required`}) +
            element({tag:"label", content:placeholder, additional:`for="`+id+`"`})
        )})
    )

    return return_content
}

function textarea({id, style, placeholder}={}) {
    let return_content = (
        div({classes:"input-container", id:id+"-container", content:(
            element({tag:"textarea", style, id, placeholder:" ", additional:`
                type="text" rows="1" required oninput="
                    this.style.height = &quot;&quot;
                    this.style.height = &quot;calc(&quot; + this.scrollHeight + &quot;px + 1em)&quot;"
            `}) +
            element({tag:"label", content:placeholder, additional:`for="`+id+`"`})
        )})
    )

    return return_content
}

function img({id, style, classes, src, tooltip, additional, onclick}={}) {
    return span({classes:"tooltip-img", tooltip, content:(
        element({id, style, classes, src, onclick, additional, tag:"img"})
    )})
}

function button({content, id, classes, style, onclick}={}) {
    return element({content, id, classes, style, onclick, tag:"button"})
}

function container({content, id="", title, style, content_style="",max_height=""}={}) {
    let container_content_style = max_height ? "overflow-y:scroll; padding-left:1vh; padding-right:1vh; max-height:"+max_height+"vh" : ""
    container_content_style = content_style ? content_style : container_content_style

    return div({id, classes:"container", style, content:(
        div({id: id+`-content`, content, style:container_content_style}) +
        element({tag:"h4", content:title, classes:"container-title"})
    )})
}

function checkbox({title, id, style}={}) {

    return div({classes:"checkbox-container", style, content:(
        span({content:title, classes:"checkbox-text", style:"width: 4vh"}) +
        div({classes:"checkbox", id, additional:`data-checked="false"`})
    )})
}

function grid({content, id, classes, style="", columns = 3, row_height = "auto", gap = "1vh", additional}={}) {
    style = `
        display: grid;
        grid-template-columns: repeat(`+columns+`, 1fr);
        grid-auto-rows: `+row_height+`;
        gap: `+gap+`;
        `+style+`
    `.trim()

    return div({content, id, classes, style, additional});
}

function row({content, columns=["Image","Name", "Type", "Actions"], config="3vh 1fr 1fr 10vh"}={}) {
    
    let div_columns = ""
    for (const i in columns) {
        const text = columns[i]
        const style = i == columns.length - 1 ? "text-align:right" : ""

        div_columns += div({content: text, style: style})
    }

    const row_style = `grid-template-columns:`+config+`;`

    return div({classes:"table-row", style:row_style, content:div_columns}) +
        div({classes:"collapsible-content", content})
}

function table({content, id, headers=["", "Name", "Type", "Actions"], config="3vh 1fr 1fr 10vh", header_style=""}={}) {

    let div_headers = ""
    for (const i in headers) {
        const title = headers[i]
        let style = i == headers.length - 1  ? "text-align:right" : ""
        style = header_style ? header_style : style

        div_headers += div({content:title, style:style})
    }

    const table_style = `grid-template-columns:`+config+`;`

    return div({classes:"table-container", id, content:(
        div({classes:"table-header", style:table_style, content:div_headers}) +
        div({classes:"table-rows", content})
    )})
}

function tabs({content=[]}={}) {
    let tab_switches = ""
    for (const i in content) {
        const tab = content[i]
        const button_classes = i == 0 ? "tab-switch active" : "tab-switch"
        tab_switches += button({classes:button_classes, id:tab+"-switch", content:capitalize(tab)})
    }

    let tabs = ""
    for (const i in content) {
        const tab = content[i]
        const tab_style = i == 0 ? "" : "display:none"
        tabs += div({classes:"outer tab", id:tab+"-tab", style:tab_style})
    }


    return div({classes:"tab-switch-div", content:tab_switches}) + tabs
}

function pointBuyCalculator() {

    function ability_score_box(score) {
        return div({classes:"score", content:(
            div({classes:"score-label", content:capitalize(score)}) +
            div({classes:"score-value", id:score, content:10}) +
            div({classes:"score-bonus", id:"bonus_"+score, content:0}) +
            button({classes:"decrease", id:"reduce_"+score, content:"-"}) +
            button({classes:"increase", id:"increase_"+score, content:"+"})
        )})
    }

    content = ""
    for (const score of ["strength", "dexterity", "constitution", "wisdom", "intelligence", "charisma"]) { 
        content += ability_score_box(score) 
    }

    return div({id:"point-buy-calculator", content:(
                element({tag:"h4", content:(
                    span({content:`Available Points: `}) + 
                    span({id:"points"}) //+
                    //span({content:" / 27"})
                )}) +
                div({classes:"spacer"}) +
                div({classes:"score-container", content})
            )})
}

function context_menu({content=[], id}) {

    let options = ""
    for (const value of content) {
        options += element({tag:"li", id:id+"-"+value, content:capitalize(value)})
    }


    return element({tag:"ul", classes:"context-menu", id, content:options})
}

//=====================================================================================================
// Functionality
//=====================================================================================================

function loadPointBuyCalculator() {

    const ability_score_list = [
        getId("strength"), getId("dexterity"), getId("constitution"),
        getId("wisdom"), getId("intelligence"), getId("charisma")
    ]

    function updateAttributeBonus() {
        ability_score_list.forEach((ability_score) => {
            let attribute_bonus = getId("bonus_" + ability_score.id)

            attribute_bonus.innerHTML = Math.abs(Math.floor((Number(ability_score.innerHTML)-10)/2))
            if(Number(ability_score.innerHTML) >= 10) {
                attribute_bonus.innerHTML = "+ " + attribute_bonus.innerHTML
            }
            else if(Number(ability_score.innerHTML) < 10) {
                attribute_bonus.innerHTML = "- " + attribute_bonus.innerHTML
            }
        })
    }

    function availablePoints() {
        let total_points = 27
        
        ability_score_list.forEach((ability_score) => {
            let value = 0
            value = ability_score.getAttribute("value")

            let additional_cost = Math.max(value - 13, 0)
            let cost = Math.max(value - 8, 0)

            total_points = total_points - cost - additional_cost
        })

        return total_points 
    }

    function updatePoints() {
        getId("points").innerHTML = availablePoints()
    }

    // Add ability score value to scores, and behavior to increase/decrease buttons
    ability_score_list.forEach((ability_score) => {
        ability_score.setAttribute("value", ability_score.innerHTML)
        let decrease_button = getId("reduce_" + ability_score.id)
        let increase_button = getId("increase_" + ability_score.id)
        
        decrease_button.addEventListener("click", () => {
            let value = Number(ability_score.getAttribute("value"))

            if (value > 8) {
                ability_score.setAttribute("value", value - 1)
                ability_score.innerHTML = Number(ability_score.innerHTML) - 1
            }

            updateAttributeBonus()
            updatePoints()
        })
        increase_button.addEventListener("click", () => {
            let value = Number(ability_score.getAttribute("value"))

            if (value < 15) {
                let cost = 0
                if (value >= 13) {cost = 2}
                else {cost = 1}

                if (availablePoints() - cost < 0) {return}

                ability_score.setAttribute("value", value + 1)
                ability_score.innerHTML = Number(ability_score.innerHTML) + 1
            }

            updateAttributeBonus()
            updatePoints()
        })
    })

    updateAttributeBonus()
    updatePoints()
}

function loadCheckboxes() {
    // Select all elements with the class checkbox
    const checkboxes = document.querySelectorAll(".checkbox");

    checkboxes.forEach(checkbox => {
    checkbox.addEventListener("click", () => {
        // Toggle the data-checked attribute
        const isChecked = checkbox.getAttribute("data-checked") === "true";
        checkbox.setAttribute("data-checked", !isChecked);
    });
    });
}

function loadTabs() {
    const node_list = document.querySelectorAll(".tab-switch");

    let tab_list = []
    for (const element of node_list) {
        const tab_id = element.id.split("-switch")[0]

        tab_list.push(tab_id)
    }

    tab_list.forEach((tab_name) => {
        getId(tab_name+"-switch").addEventListener("click", () => {
            tab_list.forEach((value) => {
                let button = getId(value+"-switch")
                let div = getId(value+"-tab")
                if (tab_name == value) {
                    button.setAttribute("class", "tab-switch active")
                    div.setAttribute("style", "")
                } else {
                    button.setAttribute("class", "tab-switch")
                    div.setAttribute("style", "display:none")
                }
            })
        })
    })

}

function updateColapsible() {
    const rows = document.querySelectorAll(".table-row");

    rows.forEach((row) => {
        row.addEventListener("click", function (event) {
            // Check if the click originated from a button
            if (event.target.tagName === "IMG") {
                // Prevent the event from propagating to the parent
                event.stopPropagation();
                return;
            }

            // Find the next sibling expandable content
            const content = this.nextElementSibling;

            if (content && content.classList.contains("collapsible-content")) {
                // Toggle visibility with animation
                if (content.classList.contains("show")) {
                    content.style.maxHeight = null;
                    content.classList.remove("show");
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                    content.classList.add("show");
                }
            }
        });
    });
}

function loadSelect() {
    const updateSelectStates = () => {
      document.querySelectorAll("select").forEach(select => {
        // Check and add "filled" class on initialization
        if (select.value) {
          select.classList.add("filled");
        }
  
        // Add event listener for changes
        if (!select.dataset.listenerAttached) {
          select.addEventListener("change", function () {
            if (this.value) {
              this.classList.add("filled");
            } else {
              this.classList.remove("filled");
            }
          });
          // Mark the select as having a listener attached
          select.dataset.listenerAttached = true;
        }
      });
    };
  
    // Initial call to update all existing <select> elements
    updateSelectStates();
  
    // Observe DOM changes for dynamically added <select> elements
    const observer = new MutationObserver(() => updateSelectStates());
    observer.observe(document.body, { childList: true, subtree: true });
}

function updateInputFields() {

    // Select all input, select, and textarea elements
    const elements = document.querySelectorAll("input, select, textarea");
  
    // Loop through each element and trigger "input" and "change" events
    elements.forEach((element) => {
      // Trigger the "input" event
      element.dispatchEvent(new Event("input"));
  
      // Trigger the "change" event (for select and input elements)
      element.dispatchEvent(new Event("change"));
    });
}

function loadContextMenu({target_id, context_menu_id, onOpen = () => {}}) {
    function hideAllContextMenus() {
        const context_menus = document.querySelectorAll(".context-menu");

        context_menus.forEach(function (menu) {
            menu.style.display = "none";
        });
    }

    const target_div = document.getElementById(target_id);
    const context_menu = document.getElementById(context_menu_id);

    target_div.addEventListener("mousedown", function(event) {
        if (event.button === 2) { // 2 is the right mouse button
            event.preventDefault();

            hideAllContextMenus()

            context_menu.style.display = "block";
            context_menu.style.left = mouse_x + "px";
            context_menu.style.top = mouse_y + "px";

            // Reset event listener for buttons
            context_menu.innerHTML = context_menu.innerHTML

            onOpen()
        }
    });

    context_menu.addEventListener("mouseleave", () => {
        hideAllContextMenus()
    })

    document.addEventListener("click", hideAllContextMenus);
}

//=====================================================================================================

`']`