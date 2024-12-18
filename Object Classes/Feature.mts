@@ @onCampaignLoad
@PROPS@ fontColor=black ; autoExecute=true ; fontSize=1.00em ; sortBy= ; color=white ; playerEditable=false ; applyToSelected=false ; group=9.onCampaignLoad ; tooltip= ; minWidth=150
    [h:functions="[]"]

    [h:functions=json.append(functions,
    "setFeatureToLibrary",
    "removeFeatureFromLibrary",
    "sortFeatureLibrary",
    "addFeature",
    "getFeatureDescription",
    "getFeatureLevel",
    "getFeatureOrigin")]

    [h,foreach(function,functions):defineFunction(function,function+"@Lib:Feature")]
    [r:"Feature Functions Loaded Successfully"]

!!


@@ @addFeature
@PROPS@ fontColor=black ; autoExecute=true ; fontSize=1.00em ; sortBy=1 ; color=gray75 ; playerEditable=false ; applyToSelected=true ; group=1.Function ; tooltip= ; minWidth=150
    [h:library=getLibProperty("FeatureLibrary","Lib:Campaign")]

    [h,if(argCount()>0),code:{
        [h:name=arg(0)]
        [h:tokenId=arg(1)]
    };{
        [h:name_list="[]"][h,foreach(name, library):name_list=json.sort(json.append(name_list,name))]
        [h:status=input(
            "name|"+name_list+"|Choose which to set|LIST|VALUE=STRING DELIMITER=JSON")]
        [h:abort(status)]
        [h:tokenId=getImpersonated()]
    }]

    [h:tokenFeatures=getProperty("Features",tokenId)]
    [h,if(!json.contains(tokenFeatures,name)):tokenFeatures=json.append(tokenFeatures,name)]

    [h:setProperty("Features",tokenFeatures,tokenId)]
    [h:updateCS()]
!!


@@ @removeFeature
@PROPS@ fontColor=black ; autoExecute=true ; fontSize=1.00em ; sortBy=1 ; color=gray75 ; playerEditable=false ; applyToSelected=true ; group=1.Function ; tooltip= ; minWidth=150
    [h,if(argCount()>1),code:{
        [h:name=arg(0)]
        [h:tokenId=arg(1)]
        [h:tokenFeatures=getProperty("Features",tokenId)]
    };{
        [h,if(argCount()>0):tokenId=arg(0);tokenId=getImpersonated()]
        [h:tokenFeatures=getProperty("Features",tokenId)]
        [h:name_list="[]"][h,foreach(name, tokenFeatures):name_list=json.sort(json.append(name_list,name))]
        [h:status=input(
            "name|"+name_list+"|Choose which to remove|LIST|VALUE=STRING DELIMITER=JSON")]
        [h:abort(status)]
    }]

    [h:setProperty("Features",json.remove(tokenFeatures,json.indexOf(tokenFeatures,name)),tokenId)]
    [h:updateCS()]
!!


@@ @getFeatureDescription
@PROPS@ fontColor=default ; autoExecute=true ; fontSize=1.00em ; sortBy=2 ; color=default ; playerEditable=false ; applyToSelected=true ; group=2.Getter ; tooltip= ; minWidth=150
    [h:library=getLibProperty("FeatureLibrary","Lib:Campaign")]

    [h,if(argCount()>0),code:{
        [h:name=arg(0)]
    };{
        [h:name_list="[]"][h,foreach(name, library):name_list=json.sort(json.append(name_list,name))]
        [h:status=input(
            "name|"+name_list+"|Choose which to set|LIST|VALUE=STRING DELIMITER=JSON")]
        [h:abort(status)]
    }]

    [h:info="description"]
    [h:defaultValue="None"]

    [h:hasInfo=json.contains(json.get(library,name),info)]
    [h,if(!hasInfo),code:{
        [h:macro.return=defaultValue]
    };{
        [h:macro.return=json.get(json.get(library,name),info)]
    }]
!!


@@ @getFeatureLevel
@PROPS@ fontColor=default ; autoExecute=true ; fontSize=1.00em ; sortBy=2 ; color=default ; playerEditable=false ; applyToSelected=true ; group=2.Getter ; tooltip= ; minWidth=150
    [h:library=getLibProperty("FeatureLibrary","Lib:Campaign")]

    [h,if(argCount()>0),code:{
        [h:name=arg(0)]
    };{
        [h:name_list="[]"][h,foreach(name, library):name_list=json.sort(json.append(name_list,name))]
        [h:status=input(
            "name|"+name_list+"|Choose which to set|LIST|VALUE=STRING DELIMITER=JSON")]
        [h:abort(status)]
    }]

    [h:info="level"]
    [h:defaultValue=0]

    [h:hasInfo=json.contains(json.get(library,name),info)]
    [h,if(!hasInfo),code:{
        [h:macro.return=defaultValue]
    };{
        [h:macro.return=json.get(json.get(library,name),info)]
    }]
!!


@@ @getFeatureOrigin
@PROPS@ fontColor=default ; autoExecute=true ; fontSize=1.00em ; sortBy=2 ; color=default ; playerEditable=false ; applyToSelected=true ; group=2.Getter ; tooltip= ; minWidth=150
    [h:library=getLibProperty("FeatureLibrary","Lib:Campaign")]

    [h,if(argCount()>0),code:{
        [h:name=arg(0)]
    };{
        [h:name_list="[]"][h,foreach(name, library):name_list=json.sort(json.append(name_list,name))]
        [h:status=input(
            "name|"+name_list+"|Choose which to set|LIST|VALUE=STRING DELIMITER=JSON")]
        [h:abort(status)]
    }]

    [h:info="origin"]
    [h:defaultValue="None"]

    [h:hasInfo=json.contains(json.get(library,name),info)]
    [h,if(!hasInfo),code:{
        [h:macro.return=defaultValue]
    };{
        [h:macro.return=json.get(json.get(library,name),info)]
    }]
!!


@@ @removeFeatureFromLibrary
@PROPS@ fontColor=black ; autoExecute=true ; fontSize=1.00em ; sortBy=0 ; color=white ; playerEditable=false ; applyToSelected=true ; group=0. Class ; tooltip= ; minWidth=150
    [h:library=getLibProperty("FeatureLibrary","Lib:Campaign")]

    [h,if(argCount()>0),code:{
        [h:choice=arg(0)]
    };{
        [h:key_list="[]"]
        [h,foreach(key, library):key_list=json.sort(json.append(key_list,key))]
        
        [h:status=1]
        [h,if(argCount()>0):choice=lower(arg(0));status=input(
            "choice|"+key_list+"|Choose which to remove|LIST|VALUE=STRING DELIMITER=JSON")]
        [h:abort(status)]
    }]

    [h:setLibProperty("FeatureLibrary",json.remove(library,choice),"Lib:Campaign")]
    [h:sortFeatureLibrary()]
    [h:execFunction("updateCompendium","[3]",0,"all")]
!!


@@ @setFeatureToLibrary
@PROPS@ fontColor=black ; autoExecute=true ; fontSize=1.00em ; sortBy= ; color=White ; playerEditable=false ; applyToSelected=false ; group=0. Class ; tooltip= ; minWidth=150
    [h:library=getLibProperty("FeatureLibrary","Lib:Campaign")]

    [h,if(argCount()>0),code:{
        [h:name=arg(0)]
    };{
        [h:status=input(
        "name")]
        [h:abort(status)]
    }]

    [h:description=""]
    [h:origin=""]
    [h:level=0]

    [h:featureIsInLibrary=json.contains(library,name)]
    [h,if(featureIsInLibrary),code:{
        [h:description=getFeatureDescription(name)]
        [h:origin=getFeatureOrigin(name)]
        [h:level=getFeatureLevel(name)]
    }]

    [h:status=input(
        "name|"+name,
        "description|"+description,
        "origin|"+origin,
        "level|"+level)]
    [h:abort(status)]

    [h:object=json.set("","description",description,"origin",origin,"level",level)]

    [h:setLibProperty("FeatureLibrary",json.set(library,name,object),"Lib:Campaign")]
    [h:sortFeatureLibrary()]
    [h,if(0):execFunction("updateCompendium","[3]",0,"all")]
!!


@@ @sortFeatureLibrary
@PROPS@ fontColor=black ; autoExecute=true ; fontSize=1.00em ; sortBy=0 ; color=white ; playerEditable=false ; applyToSelected=true ; group=0. Class ; tooltip= ; minWidth=150
    [h:library=getLibProperty("featureLibrary","Lib:Campaign")]
    [h,if(argCount()>0):filterType=arg(0);filterType="Origin"]

    [h:originOrder=json.append("","Feat","Racial","Monster"
    ,"Barbarian","Battlerager","Beast","Berserker","Giant","Totem Warrior","Zealot"
    ,"Bard"
    ,"Cleric"
    ,"Druid"
    ,"Fighter","Battle Master","Champion","Eldritch Knight"
    ,"Monk","Open Hand","Shadow"
    ,"Paladin","Conquest","Ancients"
    ,"Ranger","Beastmaster","Hunter"
    ,"Rogue","Arcane Trickster","Assassin","Thief","Scout","Swashbuckler"
    ,"Sorcerer","Wild Magic","Lunar Sorcery","Draconic Bloodline","Storm Sorcery"
    ,"Warlock"
    ,"Wizard","Abjuration","Bladesinging","Conjuration","Divination","Enchantment","Evocation","Illusion","Necromancy","Transmutation"
    )]

    [h:featureNameList='[]']
    [h,foreach(feature,library):featureNameList=json.append(featureNameList,json.set("","name",feature,"origin",json.indexOf(originOrder,getFeatureOrigin(feature)),"level",getFeatureLevel(feature)))]

    [h,switch(filterType):
    case "Origin":featureNameList=json.sort(featureNameList,"a","origin","level","name");
    case "Level":featureNameList=json.sort(featureNameList,"a","level","origin","name");
    case "Name":featureNameList=json.sort(featureNameList,"a","name","origin","level")]

    [h:newLibrary="{}"]
    [h:i=0]
    [h,while(i<json.length(featureNameList)),code:{
        [h:feature=get(featureNameList,i,"name")]
        [h:object=get(library,feature)]
        
        [h:newLibrary=json.set(newLibrary,feature,object)]
        [h:i=i+1]
    }]

    [h:setLibProperty("featureLibrary",newLibrary,"Lib:Campaign")]
    [h:execFunction("updateCompendium","[3]",0,"all")]
!!