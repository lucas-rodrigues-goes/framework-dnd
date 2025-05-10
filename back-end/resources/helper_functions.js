
//---------------------------------------------------------------------------------------------------
// Token Instancing
//---------------------------------------------------------------------------------------------------

// Instances a token by its ID
const instances = {}
var instance = function (id) {
    const maptool_token = MapTool?.tokens?.getTokenByID(id);
    try {
        const token = {
            instance: undefined,
            object: maptool_token.getProperty("object"),
            classes: maptool_token.getProperty("class")
        }
        
        // Validation
        if (token.classes == null) return undefined

        // Cached instance present
        if (instances[id] != undefined) {
            const cache_token = instances[id]
            token.instance = cache_token.instance
            
            if (JSON.stringify(token) == JSON.stringify(cache_token)) {
                //console.log(`Successfully loaded token ${token.instance.name}`, "debug")
            }
            else {
                token.instance.load()
                console.log(`Successfully updated token ${token.instance.name}`, "debug")
            }
        }

        // No caching
        else {
            // Attempt to instance using class array
            try {
                const player_class = eval(JSON.parse(token.classes)[0])
                token.instance = new player_class(id)
            }

            // Attempt to instance by string
            catch {
                const player_class = eval(token.classes)
                token.instance = new player_class(id)
            }

            console.log(`Successfully instanced token ${token.instance.name}`, "debug")
        }

        // Store
        instances[id] = token

        // Output
        return token.instance
    }
    catch {
        console.log(`Attempt to instance ${maptool_token.getName()} failed.`, "debug")
        return undefined
    }
}

// Returns currently selected character as an instance
var selected = function () {
    const selected_tokens = getSelected()

    // Validate
    if (selected_tokens.length != 1) return
    const selected_id = selected_tokens[0]

    // If token_id exists returns an instance of that token
    if (selected_id) {
        return instance(selected_id)
    }
}

// All selected tokens
var allSelected = function () {
    const return_array = []
    const mt_getSelected = MTScript.evalMacro(`[r:getSelected()]`) || ""
    const id_array = mt_getSelected != "" ? mt_getSelected.split(",") : []

    for (let i = 0; i < id_array.length; i++) {
        const creature = instance(id_array[i])
        if (creature) return_array.push(creature)
    }

    return return_array
}

// Returns current character as an instance
var impersonated = function () {
    const impersonated_id = getImpersonated()

    // If token_id exists returns an instance of that token
    if (impersonated_id) {
        return instance(impersonated_id)
    }
}

// Resets currently impersonated token
var resetImpersonated = function () {
    MTScript.evalMacro(`[r:resetProperty("object", getImpersonated())]`)
    MTScript.evalMacro(`[r:resetProperty("class", getImpersonated())]`)
}

//---------------------------------------------------------------------------------------------------
// HUD Helpers
//---------------------------------------------------------------------------------------------------

// Receives simple party information for HUD display
var party_info = function () {
    // Maps all map tokens
    const tokens = MapTool.tokens.getMapTokens()
    const party_info = []

    // Goes through all map tokens
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]

        // If current token is a party character
        if(token.isPC()) {
            const party_member = instance(token.getId())

            // Push token information
            if (party_member) {
                const object = [party_member.health, party_member.max_health, party_member.portrait, token.getId()]
                party_info.push(object)
            }
        }
    }

    return party_info
}

//---------------------------------------------------------------------------------------------------
// From MTScript
//---------------------------------------------------------------------------------------------------

// Returns current characters tokenID
var getImpersonated = function () {
    return MTScript.evalMacro(`[r:getImpersonated()]`)
}

// Returns currently selected characters token ID
var getSelected = function () {
    const return_array = MTScript.evalMacro(`[r:getSelected()]`).split(",")

    return return_array
}

// Returns currently selected characters portrait
var getSelectedImage = function() {
    return MTScript.evalMacro(`[r:getTokenImage("","`+getSelected()+`")]`)
}

// Set player movement lock
var moveLock = function (lock=true) {
    const value = lock ? 1 : 0

    MTScript.evalMacro(`[r:setMoveLock(`+value+`)]`)
}

//---------------------------------------------------------------------------------------------------
// Others
//---------------------------------------------------------------------------------------------------

// Calculate distance between entities
var calculate_distance = function (source, target) {
    const delta_x = target.x - source.x; // Difference in X-coordinates
    const delta_y = target.y - source.y; // Difference in Y-coordinates
    const distance = Math.round(Math.sqrt(delta_x * delta_x + delta_y * delta_y))
    return distance;
}

// Dice Rolling
var roll = (sides) => Math.ceil(Math.random() * sides)
var roll_dice = function (amount, sides, type) {
    let total = 0

    // Roll each die
    for (let i = 0; i < amount; i++) {
        switch (type) {
            // Lowest
            case "Lowest":
                total += Math.min(roll(sides), roll(sides))
                break

            // Highest
            case "Highest":
                total += Math.max(roll(sides), roll(sides))
                break

            // Regular Roll
            default: 
                total += roll(sides)
                break
        }
    }

    // Output
    return total
}
var roll_20 = function (advantage_weight = 0) {
    const rolls = [roll(20), roll(20)]
    let advantage ; {
        if (advantage_weight > 0) advantage = "Advantage"
        else if (advantage_weight < 0) advantage = "Disadvantage"
        else advantage = "None"
    }

    // Calculation
    let result, color; {
        switch (advantage) {
            case "Advantage": 
                color = "#7ED321"
                result = Math.max(rolls[0], rolls[1])
                break
            case "Disadvantage":
                color = "#C82E42"
                result = Math.min(rolls[0], rolls[1])
                break
            default:
                color = "#F5A623"
                result = rolls[0]
                break
        }
    }

    // Text
    const DEFAULT_COLOR = "#777"
    let text = "", text_color = ""; {
        if (advantage == "None") {
            text += `${result}`
            text_color += `<span style="color: ${color}">${result}</span>`
        }
        else {
            text += `${rolls[0]}|${rolls[1]}`
            text_color += `<span style="color: ${rolls[0] == result ? color : DEFAULT_COLOR}">${rolls[0]}</span>|`
            text_color += `<span style="color: ${rolls[1] == result ? color : DEFAULT_COLOR}">${rolls[1]}</span>`
        }
    }

    // Result
    return {
        result: result,
        text: text,
        text_color: text_color,
        dice: rolls,
    }
}