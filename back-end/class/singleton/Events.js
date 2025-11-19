

    var Events = class {

        //=====================================================================================================
        // Events
        //=====================================================================================================

        static onChangeImpersonated () {
            // This event runs when any data is saved in MapTool or
            // when impersonating another token.
            this.updateScreens()
        }

        static onMouseOver ({args}) {
            // Parameters
            const [id, tempX, tempY, shiftDown, ctrlDown] = args.split(",")
            const [x, y] = [tempX/150, tempY/150]

            // Call Mouse Off
            if (args.includes("exit")) {this.onMouseOff({id: id}); return}

            // Test
            //console.indent({id, x, y, shiftDown, ctrlDown})
        }

        static onMouseOff ({id}) {

        }

        static onChangeSelection () {

        }


        static onTokenMove ({id}) {

        }

        static onChangeMap({id}) {
            try {
                this.updateScreens()
            } catch (error) {console.log(error)}
        }

        static onCampaignLoad() {
            console.log("Framework Loaded Successfully.", "all")
        }

        //=====================================================================================================
        // Helpers
        //=====================================================================================================

        static runJSfunction = ({name, type="Overlay", functionName, args=[]}) => {
            const jsonString = JSON.stringify(args)
            macro(`runJSfunction("${name}", "${type}", "${functionName}", "null", '${jsonString.replace(/'/g, "`")}')`)
        }

        //=====================================================================================================
        // Screen Updates
        //=====================================================================================================

        static updateScreens () {
            this.updateAbilitiesBar()
            this.updatePortrait()
        }

        // Abilities Bar
        static updateAbilitiesBar () {
            // Functions
            function updateVisibility () {
                const isImpersonated = !!impersonated()
                Events.runJSfunction({
                    name: "Ability Bar",
                    type: "Overlay",
                    functionName: "updatePage",
                    args: [{visible: isImpersonated}]
                })
            }
            function updateAbilities () {
                if (!impersonated()) return
                try {
                    const abilities = []

                    // Abilities
                    for (const [key, object] of Object.entries(impersonated().abilities)) {
                        if (!object) continue
                        object.name = object.name || capitalize(key.replace(/_/g, " "), true)
                        abilities.push({
                            key: key, 
                            object: object,
                            type: "Ability",
                            ordered: object.type
                        })
                    }

                    // Spells
                    const spells = impersonated().spells
                    if (spells) {
                        try {
                            for (const [cls, spellList] of Object.entries(spells)) {
                                const evalClass = eval(cls) || {}
                                const spellcasting = evalClass.spellcasting || undefined
                                if (!spellcasting) continue

                                // Create a Set of existing spell keys for faster lookup
                                const existingSpellKeys = new Set(abilities.map(ab => ab.key))

                                // General spells (innate + always_prepared)
                                const generalSpells = [...(spellList.innate || []), ...(spellList.always_prepared || [])]
                                for (const spell of generalSpells) {
                                    if (!existingSpellKeys.has(spell) && database.spells.data[spell]) {
                                        abilities.push({
                                            key: spell,
                                            object: database.spells.data[spell],
                                            type: "Spell",
                                            ordered: "Spells",
                                            player_class: cls
                                        })
                                        existingSpellKeys.add(spell)
                                    }
                                }

                                if (spellcasting.memorization) {
                                    // Cantrips
                                    for (const spell of spellList.known || []) {
                                        const object = database.spells.data[spell]
                                        if (!existingSpellKeys.has(spell) && object && object.level == "cantrip") {
                                            abilities.push({
                                                key: spell,
                                                object: object,
                                                type: "Spell",
                                                ordered: "Cantrip",
                                                class: cls
                                            })
                                            existingSpellKeys.add(spell)
                                        }
                                    }

                                    // Memorized spells
                                    for (const spell of spellList.memorized || []) {
                                        if (!existingSpellKeys.has(spell) && database.spells.data[spell]) {
                                            abilities.push({
                                                key: spell,
                                                object: database.spells.data[spell],
                                                type: "Spell",
                                                ordered: "Spells",
                                                player_class: cls
                                            })
                                            existingSpellKeys.add(spell)
                                        }
                                    }
                                } else {
                                    // Known spells (for non-memorization classes)
                                    for (const spell of spellList.known || []) {
                                        if (!existingSpellKeys.has(spell) && database.spells.data[spell]) {
                                            abilities.push({
                                                key: spell,
                                                object: database.spells.data[spell],
                                                type: "Spell",
                                                ordered: database.spells.data[spell].level == "cantrip" ? "Cantrip" : "Spells",
                                                player_class: cls
                                            })
                                            existingSpellKeys.add(spell)
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                        }
                    }
                    
                    // Order
                    const order_priority = [
                        "Attack",
                        "Common",
                        "Cantrip",
                        "Class",
                        "Special",
                        "Spells",
                    ];

                    // Output List
                    const outputAbilities = abilities
                    .filter(e => e.object)
                    .sort((a, b) => {
                        const pa = order_priority.indexOf(a.ordered);
                        const pb = order_priority.indexOf(b.ordered);
                        if (pa !== pb) return pa - pb;

                        // Se ambos são spells → ordenar pelo nível
                        if (a.ordered === "Spells") {
                            const la = Number(a.object.level[0]);
                            const lb = Number(b.object.level[0]);

                            if (la !== lb) return la - lb; // menor nível primeiro
                        }

                        // Caso contrário  ordenar pelo nome
                        return a.key.localeCompare(b.key);
                    });
                    Events.runJSfunction({
                        name: "Ability Bar",
                        type: "Overlay",
                        functionName: "updateAbilityBar",
                        args: [{abilities: outputAbilities}]
                    })
                } catch (error) {console.log(error)}
            }
            function updateResources() {
                if (!impersonated()) return;
                
                try {
                    const resources = [];
                    const hasInitiative = Initiative.turn_order.includes(impersonated().id);

                    for (const [key, resource] of Object.entries(impersonated().resources)) {
                        const { value, restored_on } = resource;

                        if (key === "Attack Action" && value <= 0) continue;
                        if (restored_on === "turn start" && !hasInitiative) continue;

                        const db_res = database.resources.data[key] || {};

                        resources.push({
                            ...resource,
                            name: key,
                            color: db_res.color ?? "#ffffff",
                            image: db_res.image ?? ""
                        });
                    }

                    const restored_on_priority = [
                        "turn start",
                        "short rest",
                        "long rest"
                    ];

                    const orderedResources = resources.sort((a, b) => {
                        const pa = restored_on_priority.indexOf(a.restored_on);
                        const pb = restored_on_priority.indexOf(b.restored_on);

                        const priA = pa === -1 ? 999 : pa;
                        const priB = pb === -1 ? 999 : pb;

                        if (priA !== priB) return priA - priB;

                        return a.name.localeCompare(b.name);
                    });

                    Events.runJSfunction({
                        name: "Ability Bar",
                        type: "Overlay",
                        functionName: "updateResources",
                        args: [{ resources: orderedResources }]
                    });
                } catch (error) {
                    console.log(error);
                }
            }


            // Run
            updateVisibility()
            updateAbilities()
            updateResources()
        }
        
        // Portrait
        static updatePortrait () {
            // Functions
            function updateImpersonatedPortrait() {
                Events.runJSfunction({
                    name: "Portrait",
                    type: "Overlay",
                    functionName: "updatePage",
                    args: [{
                        visible: getImpersonated(),
                        needsCreate: !["Monster", "Player"].includes(impersonated()?.constructor?.name || ""), 
                        portrait: impersonated()?.portrait || "",
                        attitude: impersonated()?.attitude || "",
                        health: impersonated()?.health || 10,
                        max_health: impersonated()?.max_health || 10,
                    }]
                })
            }
            function updateOwnedCharacterPortraits() {
                // Maps all owned tokens in map
                const tokens = macro("getOwned()").split(",")
                const ownedCharacters = []

                // Goes through all owned tokens
                if (true) {
                    for (let i = 0; i < tokens.length; i++) {
                        const creature = instance(tokens[i])
                        if (!creature) continue
                        if (creature.id == getImpersonated()) continue
                        const {health, max_health, portrait, id, attitude} = creature

                        ownedCharacters.push({health, max_health, attitude, portrait, id})
                    }
                }

                Events.runJSfunction({
                    name: "Portrait",
                    type: "Overlay",
                    functionName: "updateOwnedCharacterPortraits",
                    args: [{
                        characters: ownedCharacters
                    }]
                })
            }

            // Run
            updateImpersonatedPortrait()
            updateOwnedCharacterPortraits()
        }

        //=====================================================================================================
    }

    // Compatibility with events screen
    const onChangeSelection = () => Events.onChangeSelection()
    const onChangeImpersonated = () => Events.onChangeImpersonated()