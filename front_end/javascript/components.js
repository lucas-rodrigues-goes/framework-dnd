`[r:'`

//=====================================================================================================
// Components
//=====================================================================================================

function element({
    content="", id="", tag="", classes="", style="", placeholder="", onclick="", value="", src="",
    additional=""
}={}) {
    id = id ? `id="`+id+`"` : ""
    classes = classes ? `class="`+classes+`"` : ""
    style = style ? `style="`+style+`"` : ""
    placeholder = placeholder ? `placeholder="`+placeholder+`"` : ""
    onclick = onclick ? `onclick="`+onclick+`"` : ""
    value = value ? `value="`+value+`"` : ""
    src = src ? `src="`+src+`"` : ""

    return `
        <`+tag+` `+id+` `+classes+` `+style+` `+placeholder+` `+onclick+` `+value+` `+src+` `+additional+`>`+
            ``+content+``+
        `</`+tag+`>`.trim()
}

function div({content, id, classes, style, onclick, additional}={}) {
    return element({content, id, classes, style, onclick, additional, tag:"div"})
}

function span({content, id, classes, style}={}) {
    return element({content, id, classes, style, tag:"span"})
}

function paragraph({content, id, classes, style}={}) {
    return element({content, id, classes, style, tag:"p"})
}

function pre({content, id, classes, style}={}) {
    return element({content, id, classes, style, tag:"pre"})
}

function input({value, id, classes, style, placeholder}={}) {
    return element({value, id, classes, style, placeholder, tag:"input"})
}

function textarea({value, id, classes, style, rows="10", placeholder}={}) {
    additional = `rows="`+rows+`"`

    return element({value, id, classes, style, placeholder, additional, tag:"textarea"})
}

function image({id, style, classes, src, onclick}={}) {
    return element({id, style, classes, src, onclick, tag:"image"})
}

function button({content, id, classes, style, onclick}={}) {
    return element({content, id, classes, style, onclick, tag:"button"})
}

function option({content, value, placeholder=false, disabled=false}={}) {
    let additional = ""

    additional += placeholder ? ` value="" selected ` : "";
    additional += disabled ? ` disabled ` : "";

    return element({content, value, additional, tag:"option"})
}

function options_from_array(array) {
    let content = ""

    for (const value of array) {
        content += option({content:capitalize(value), value:value})
    }

    return content
}

function select({content, content_type="array", id, classes, style, placeholder="", required=false}={}) {

    switch(content_type) {
        case "array":
            content = 
                option({content:placeholder, placeholder:true, disabled:required}) +
                options_from_array(content).trim()
            break
    }

    return element({content, id, classes, style, tag:"select", additional:"required"})
}

function container({content, id="", title, style, max_height=""}={}) {
    let content_style = max_height ? "overflow-y:scroll; padding-left:1vh; padding-right:1vh; max-height:"+max_height+"vh" : ""

    return div({id, classes:"container", style, content:(
        div({id: id+`-content`, content, style:content_style}) +
        element({tag:"h3", content:title, classes:"container-title"})
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

function row({content, id, columns=["Image","Name", "Type", "Actions"], config="3vh 1fr 1fr 10vh"}={}) {
    
    let div_columns = ""
    for (const i in columns) {
        const text = columns[i]
        const style = i == headers.length - 1 ? "text-align:right" : ""

        div_columns += div({content: text, style: style})
    }

    const row_style = `grid-template-columns:`+config+`;`

    return (
        div({class:"table-row", style:row_style, content:div_columns}) +
        div({class:"collapsible-content", content})
    )
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
        div({classes:"table-rows"}, content)
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

//=====================================================================================================

`']`