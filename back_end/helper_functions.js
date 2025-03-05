"use strict";
try {

    // Returns the chain of a class's inheritance
    function getInheritanceChain(cls) {
        let chain = [];
        while (cls && cls !== Object) {
            chain.push(cls.name);
            cls = Object.getPrototypeOf(cls);
        }
        return chain;
    }

    // Instances a token by its ID
    var instance = function (id) {
        const token = MapTool.tokens.getTokenByID(id);
        const token_classes = token.getProperty("class");
    
        // Checks if token_classes is an array
        let isArray = false;
        try { 
            isArray = Array.isArray(JSON.parse(token_classes)); 
        } catch {} //--> No action if JSON is invalid
    
        // Regular case, receives an inheritance array and tries to instance the first available class
        if (isArray) {
            const classes = JSON.parse(token_classes);
            for (let i = 0; i < classes.length; i++) {
                // Transforms string to possible class
                const token_class = eval(classes[i]);
    
                // Verifies if it's an actual class, and instances token if it is
                if (token_class instanceof Entity) {
                    return new token_class(id);
                }
            }
        // Case for older still unupdated cases where it might not return an array, and just one class instead.
        } else {
            let token_class;
            try {
                token_class = eval(token_classes);  //--> Try evaluating the class name
            } catch {
                token_class = undefined;  //--> If eval fails, set token_class to undefined
            }
            
            // If the class is valid, instantiate it; otherwise, fall back to Creature
            return (token_class instanceof Function) ? new token_class(id) : new Creature(id);
        }
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