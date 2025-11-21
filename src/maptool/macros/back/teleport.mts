[r:abort(isGM())]

[r,if(arg(0)=="selected"),code:{
	[r:id = getSelected()]
	[r:abort(json.length(json.fromList(id)) == 1)]
	
	[r:abort(id!="")]
	
	[r:name_list = json.fromList(getGMName(id),":")]
	[r:abort(json.length(name_list)>1)]
	[r:abort(json.get(name_list,0) == "teleport")]
	
	[r:map_name = json.get(name_list,1)]
};{
	[r:map_name = arg(0)]
}]

[r:oldMap = getCurrentMapName()]
[r:oldZoom = getZoom()]

[r:all_maps = json.fromList(getAllMapNames(), ",")]

[r:abort(json.contains(all_maps,map_name))]

[r:setCurrentMap(map_name)]
[r,if(map_name != "Map"),code:{
	[r:goTo(0,0)]
	[r:setZoom(0.20)]
}]
[r:deselectTokens()]