"use strict";
try {

    var party_info = function () {
        let tokens = MapTool.tokens.getMapTokens()
        let party_info = []

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i]

            if(token.isPC()) {
                let party_member = instance(token.getId())

                let object = [party_member.health, party_member.max_health, party_member.portrait, token.getId()]
                party_info.push(object)
            }
        }

        return party_info
    }

    var instance = function (id) {

        try {
            let token = MapTool.tokens.getTokenByID(id)
            let token_class = token.getProperty("class")
            let constructor = eval(token_class)
    
            return new constructor(id)
        }
        catch {
            MTScript.evalMacro(`[r,if(!isDialogVisible("Character")):creature_set("`+id+`")]`)
            return
        }
    }

    var getImpersonated = function () {
        return MTScript.evalMacro(`[r:getImpersonated()]`)
    }

    var impersonated = function () {
        if(getImpersonated()) {
            return instance(getImpersonated())
        }
    }

    var getSelected = function () {
        if(MapTool.tokens.getSelected()) {
            return MapTool.tokens.getSelected().getId()
        }
    }

    var selected = function () {
        return instance(getSelected())
    }



} catch (e) {
    MapTool.chat.broadcast("" + e + "\n" + e.stack);
}
