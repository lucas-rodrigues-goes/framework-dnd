`[r:'`

//=====================================================================================================
// Components
//=====================================================================================================

function element({content="", id="", tag="", classes="", style="", placeholder="", onclick="", value="", additional=""}={}) {
    return `
        <`+tag+` id="`+id+`" class="`+classes+`" 
            style="`+style+`" 
            placeholder="`+placeholder+`" 
            onclick="`+onclick+`" 
            value="`+value+`"
            `+additional+`
        >
            `+content+`
        </`+tag+`>`.trim()
}

function div({content, id, classes, style, onclick}={}) {
    return element({content, id, classes, style, onclick, tag:"div"})
}

function input({value, id, classes, style, placeholder}={}) {
    return element({value, id, classes, style, placeholder, tag:"input"})
}

function textarea({value, id, classes, style, rows="10", placeholder}={}) {
    additional = `rows="`+rows+`"`

    return element({value, id, classes, style, placeholder, additional, tag:"textarea"})
}

function option({content, value, disabled=false, selected=false}={}) {
    let additional = ""

    additional = disabled ? "disabled " : "";
    additional += selected ? "selected " : "";

    return element({content, value, additional, tag:"option"})
}

function options_from_array(array) {
    let content = ""

    for (const value of array) {
        content += option({content:capitalize(value), value:value})
    }

    return content
}

function select({content, id, classes, style, content_type="array", placeholder="", required=false}={}) {

    switch(content_type) {
        case "array":
            content = option({content:placeholder, value:"", selected:true, disabled:required})
            content += options_from_array(content)
            break
    }

    return element({content, id, classes, style, tag:"select", additional:"required"})
}

function checkbox(id = "", title = "", min_width = "40") {
    if (id == "" && title == "") {
        style = `style="display:none"`
    } else {style = ""}

    return `
    <div class="checkbox-container">
        <span class="checkbox-text" style="min-width: `+min_width+`px;">`+title+`</span>
        <div class="checkbox" id="`+id+`" `+style+` data-checked="`+"false"+`"></div>
    </div>
    `
}

function checkbox_grid(checkboxes = [["","Title"]], rows="3", min_width="40") {
    let checkboxes_string = ""
    for (const box of checkboxes) {
        checkboxes_string += checkbox(box[0], box[1], min_width)
    }

    return `
    <div class="checkbox-grid" style = "grid-template-columns: repeat(`+rows+`, 1fr)">
        `+checkboxes_string+`
    </div>
    `
}

function container(title="", children="", id="", style="") {

    return `
    <div id="`+id+`" class="container center-horizontal" style="`+style+`">
        <h3 class="container-title">`+title+`</h3>
        <div id="`+id+`-content">`+children+`</div>
    </div>
    `
}

function button(id="", label="", classes="", style="") {
    return `
    <button id=`+id+` class="`+classes+`" style="`+style+`">`+label+`</button>
    `
}

function pointBuyCalculator() {
    const scores_list = ["strength", "dexterity", "constitution", "wisdom", "intelligence", "charisma"]
    content = ""
    
    for (const score of scores_list) {
        content += `
        <div class="score">
            <div class="label">`+capitalize(score)+`</div>
            <div class="score-value" id="`+score+`">10</div>
            <div class="score-bonus" id="bonus_`+score+`">0</div>
            <button class="decrease" id="reduce_`+score+`">-</button>
            <button class="increase" id="increase_`+score+`">+</button>
        </div>
        `
    }

    return `
    <h4>Available Points: <span id="points"></span> / 27</h4>
    <div class="spacer"></div>
    <div class="score-container">
        `+content+`
    </div>
    `
}

//=====================================================================================================
// Functionality
//=====================================================================================================

function addPointBuyFunctionality() {

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

//=====================================================================================================

`']`