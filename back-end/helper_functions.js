

//---------------------------------------------------------------------------------------------------
// Token Instancing
//---------------------------------------------------------------------------------------------------

// Instances a token by its ID
const instances = {}
var instance = function (id) {
    try {
        const maptool_token = MapTool?.tokens?.getTokenByID(id);
        const token = {
            instance: undefined,
            object: maptool_token.getProperty("object"),
            classes: maptool_token.getProperty("class")
        }

        // Validation
        if (token.classes == null || token.classes == "[]") return undefined

        // Cached instance present
        if (instances[id] != undefined) {
            const cache_token = instances[id]
            token.instance = cache_token.instance
            
            if (JSON.stringify(token) == JSON.stringify(cache_token)) {
                //console.log(`Successfully loaded token ${token.instance.name}`, "debug")
            }
            else {
                // Attempt to instance using class array
                try {
                    const parsedClass = JSON.parse(token.classes);
                    if (Array.isArray(parsedClass) && parsedClass.length > 0) {
                        const player_class = eval(parsedClass[0]);
                        if (!player_class) return undefined
                        token.instance = new player_class(id);
                    } else {
                        throw new Error("Not a valid class array");
                    }
                }
                // Attempt to instance by string
                catch (e) {
                    try {
                        const player_class = eval(token.classes);
                        token.instance = new player_class(id);
                    } catch (innerError) {
                        console.log(`Failed to instance class: ${innerError.message}`, "debug");
                        return undefined;
                    }
                }
                console.log(`Successfully updated token ${token.instance.name}`, "debug")
            }
        }

        // No caching
        else {
            // Attempt to instance using class array
            try {
                const parsedClass = JSON.parse(token.classes);
                if (Array.isArray(parsedClass) && parsedClass.length > 0) {
                    const player_class = eval(parsedClass[0]);
                    token.instance = new player_class(id);
                } else {
                    throw new Error("Not a valid class array");
                }
            }
            // Attempt to instance by string
            catch (e) {
                try {
                    const player_class = eval(token.classes);
                    token.instance = new player_class(id);
                } catch (innerError) {
                    console.log(`Failed to instance class: ${innerError.message}`, "debug");
                    return undefined;
                }
            }

            console.log(`Successfully instanced token ${token.instance.name}`, "debug")
        }

        // Store
        instances[id] = token

        // Output
        return token.instance
    }
    catch (error) {
        try {
            const maptool_token = MapTool?.tokens?.getTokenByID(id);
            console.log(`Attempt to instance ${maptool_token.getName()} failed: ${error.message}`, "debug");
            return undefined;
        }
        catch (innerError) {
            console.log(`Attempt to instance invalid ID (${id}): ${innerError.message}`, "debug");
            return undefined;
        }
    }
}

// Cleanup cache to prevent memory leaks
var cleanupInstanceCache = function(maxCacheSize = 100) {
    const ids = Object.keys(instances);
    if (ids.length > maxCacheSize) {
        // Remove oldest entries (first 20% of cache)
        const removeCount = Math.floor(ids.length * 0.2);
        for (let i = 0; i < removeCount; i++) {
            delete instances[ids[i]];
        }
        console.log(`Cleaned up ${removeCount} instances from cache`, "debug");
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
    delete instances[impersonated().id]
    MTScript.evalMacro(`[r:resetProperty("object", getImpersonated())]`)
    MTScript.evalMacro(`[r:resetProperty("class", getImpersonated())]`)
}

var mapCreatures = function (map_name) {
    const creatures = []
    let tokens; {
        if (map_name) tokens = MapTool.tokens.getMapTokens(map_name)
        else tokens = MapTool.tokens.getMapTokens()
    }

    for (const token of tokens) {
        const creature = instance(token.getId())

        // Validate
        if (creature instanceof Creature) creatures.push(creature)
    }
    return creatures
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
    const mt_getSelected = MTScript.evalMacro(`[r:getSelected()]`) || ""
    return mt_getSelected != "" ? mt_getSelected.split(",") : []
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
    let distance = Math.round(Math.sqrt(delta_x * delta_x + delta_y * delta_y))

    // Size modifiers
    switch (source.size) {
        case "Large":
            distance -= 1
            break
        case "Huge":
            distance -= 1
            break
        case "Gargantuan":
            distance -= 2
            break
        case "Colossal":
            distance -= 3
            break
    }
    switch (target.size) {
        case "Large":
            distance -= 1
            break
        case "Huge":
            distance -= 1
            break
        case "Gargantuan":
            distance -= 2
            break
        case "Colossal":
            distance -= 3
            break
    }

    return distance;
}

// Calculate direction from source to target
var calculate_direction = function(source, target) {
    const delta_x = target.x - source.x;
    const delta_y = source.y - target.y;
    
    // If same position
    if (delta_x === 0 && delta_y === 0) {
        return "none"; // or could return current facing if you prefer
    }
    
    // Calculate angle in degrees (0 = right, 90 = up, etc.)
    const angle = Math.atan2(delta_y, delta_x) * (180 / Math.PI);
    
    // Normalize angle to be between -180 and 180
    const normalizedAngle = ((angle + 180) % 360) - 180;
    
    // Determine direction based on angle ranges
    if (normalizedAngle >= 67.5 && normalizedAngle <= 112.5) {
        return "up";
    } else if (normalizedAngle >= -112.5 && normalizedAngle <= -67.5) {
        return "down";
    } else if (Math.abs(normalizedAngle) <= 22.5) {
        return "right";
    } else if (Math.abs(normalizedAngle) >= 157.5) {
        return "left";
    } else if (normalizedAngle > 22.5 && normalizedAngle < 67.5) {
        return "right-up";
    } else if (normalizedAngle > -67.5 && normalizedAngle < -22.5) {
        return "right-down";
    } else if (normalizedAngle > 112.5 && normalizedAngle < 157.5) {
        return "left-up";
    } else if (normalizedAngle > -157.5 && normalizedAngle < -112.5) {
        return "left-down";
    }
    
    return "none"; // fallback
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
