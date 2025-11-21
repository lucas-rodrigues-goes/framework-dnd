[h:currentMap = getCurrentMapName()]

[h:setCurrentMap("Framework")]
[h:js.removeNS("main")]

[h: fileNames = json.append("[]",
	"Entity.js", 
		"Database.js",
		"Creature.js",
			"Humanoid.js",

	"Abilities.js",
		"Common.js",
		"Features.js",
		"Spells.js",
		
		"Barbarian.js",
		"Fighter.js",
		"Wizard.js",
		"Rogue.js",

	"Sound.js",
	"Data.js",
	"Console.js",
	"Initiative.js",
	"helper_functions.js"
)]

[foreach(fileName, fileNames, ""), code: {
    [h: js.evalURI("main", "lib://back/macro/" + fileName)]
    [h: fileName + " loaded successfully! <br>"]
}]


[h:defineFunction("c","console@lib:back")]
[h:defineFunction("console","console@lib:back")]
[h:defineFunction("countMovement","countMovement@lib:back")]
[h:defineFunction("setFacing","setFacing@lib:back")]

[h:setCurrentMap(currentMap)]
[h: c('console.log(`Campaign Loaded Successfully`, "all")') ]