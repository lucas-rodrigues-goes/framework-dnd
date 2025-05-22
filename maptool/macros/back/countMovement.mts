[h:path=getLastPath(0)]
[r,if(json.length(path)>=2),code:{
	[h:secondLastIndex=json.length(path)-2]
	[h:secondLastPosition=json.get(path,secondLastIndex)]
	
	[h:lastIndex=json.length(path)-1]
	[h:lastPosition=json.get(path,lastIndex)]
	
	[h:arguments=json.set("","mode","positions","firstPosition",secondLastPosition,"lastPosition",lastPosition)]
	[h:firstPosition=json.get(path,0)]
	[h:firstPositionX=json.get(firstPosition,"x")]
	[h:firstPositionY=json.get(firstPosition,"y")]

	[h: distance = getMoveCount(0, 1)]
	
	[h: return_value = !c('
	{
	    const isGM = '+isGM()+' == 1
	    const id = "'+currentToken()+'"
	    const distance = '+ distance +'
	    const creature = instance(id)
	
	    const isInCombat = Initiative.turn_order.includes(id)
	    const isPlaying = Initiative.current_creature == id
	
	    function validateMovement () {
	        const visibility = creature.has_condition("Hidden") && !creature.player ? "gm" : "all"
	
	        // Ilegal movement
	        if (distance == 0) {
	            if (isGM) return true
	            else return false
	        }
	
	        // Not in combat
	        if (!isInCombat) return true
	        
	        // Is in combat
	        if (isPlaying) {
	            const movement = creature.resources["Movement"].value
	            if (movement < distance) console.log(creature.name_color + " does not have enough movement for that move.", visibility)
	
	            creature.set_resource_value("Movement", movement - distance)
	            console.log(creature.name_color + " moved " + distance + "ft", visibility)
	            return true
	        }
	        else {
	            if (!isGM) {
	                console.log(creature.name_color + " does not have enough movement for that move.", visibility)
	                return false
	            }
	            else {
	                console.log("GM forced " + creature.name + " to move "+ distance +"ft.", "gm")
	                return true
	            }
	        }
	    }
	    const validMovement = validateMovement()
	    if (validMovement) {
	        if (isPlaying) creature.go_to()
	        creature.onMove()
	    }
	    (validMovement ? 1 : 0)
	}
	')]
	[h, if(!return_value):setFacing(arguments)]
	[r: return_value ]
}]