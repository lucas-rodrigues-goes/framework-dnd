[h:arguments=if(argCount()>0,arg(0),"")]

[h:selected=json.get(json.fromList(getSelected()),0)]
[h:abort(json.contains(getProperty("class", selected), "Creature"))]

[h:mode=json.get(arguments,"mode")]
[if(mode=="positions"),code:{
	[h:firstPosition=json.get(arguments,"firstPosition")]
	[h:lastPosition=json.get(arguments,"lastPosition")]
	[h:tokenId1=currentToken()]

	[h:firstPositionX=json.get(firstPosition,"x")]
	[h:firstPositionY=json.get(firstPosition,"y")]
	[h:lastPositionX=json.get(lastPosition,"x")]
	[h:lastPositionY=json.get(lastPosition,"y")]
};{
	[h:tokenId1=json.get(arguments,"tokenId1")]
	[h:tokenId2=json.get(arguments,"tokenId2")]
	
	[h:firstPositionX=getTokenX(1,tokenId1)]
	[h:firstPositionY=getTokenY(1,tokenId1)]
	[h:lastPositionX=getTokenX(1,tokenId2)]
	[h:lastPositionY=getTokenY(1,tokenId2)]
}]

[h,if(firstPositionX<lastPositionX):horizontal="right"]
[h,if(firstPositionX>lastPositionX):horizontal="left"]
[h,if(firstPositionX==lastPositionX):horizontal="none"]
[h,if(firstPositionY<lastPositionY):vertical="down"]
[h,if(firstPositionY>lastPositionY):vertical="up"]
[h,if(firstPositionY==lastPositionY):vertical="none"]

[h, if(horizontal == "none"): direction = vertical]
[h, if(vertical == "none"): direction = horizontal]
[h, if(horizontal != "none" && vertical != "none"): direction = horizontal + "-" + vertical]

[h: c('instance("'+tokenId1+'").facing = "'+direction+'"')]