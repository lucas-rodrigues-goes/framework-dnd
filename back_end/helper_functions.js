"use strict";
try {

    // Instances a target token, loading its properties
    var instance = function (id) {
        try {
            const token = MapTool.tokens.getTokenByID(id)
            const token_class = token.getProperty("class")
            const constructor = eval(token_class)
    
            return new constructor(id)
        } catch {}
    }

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
                const object = [party_member.health, party_member.max_health, party_member.portrait, token.getId()]
                party_info.push(object)
            }
        }

        return party_info
    }

    // Returns current characters tokenID
    var getImpersonated = function () {
        return MTScript.evalMacro(`[r:getImpersonated()]`)
    }

    // Returns current character as an instance
    var impersonated = function () {
        const impersonated_id = getImpersonated()

        // If token_id exists returns an instance of that token
        if (impersonated_id) {
            return instance(impersonated_id)
        }
    }

    // Returns currently selected characters token ID
    var getSelected = function () {
        if (MapTool.tokens.getSelected()) {
            return MapTool.tokens.getSelected().getId()
        }
    }

    // Returns currently selected characters portrait
    var getSelectedImage = function() {
        return MTScript.evalMacro(`[r:getTokenImage("","`+getSelected()+`")]`)
    }

    // Returns currently selected character as an instance
    var selected = function () {
        const selected_id = getSelected()

        // If token_id exists returns an instance of that token
        if (selected_id) {
            return instance(selected_id)
        }
    }

} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}