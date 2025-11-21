

var Events = class {

        static #cache = {
            impersonated
        }

        //=====================================================================================================
        // Timed Events
        //=====================================================================================================

        static every1000ms () {
            try {
                this.updateAll()
            } catch (error) {console.error("every1000ms()", error)}
        }

        static every5000ms () {
            try {
                // Empty function - no operations needed
            } catch (error) {console.error("every5000ms()", error)}
        }

        //=====================================================================================================
        // Events
        //=====================================================================================================

        static onChangeImpersonated () {
            try {
                const id = getImpersonated()

                if (id === this.#cache.impersonated) return this.onChangeImpersonatedData()
                else this.#cache.impersonated = id

                this.updateAll()
            } catch (error) {console.error("onChangeImpersonated()", error)}
        }

        // Avoid using as much as possible, really heavy.
        static onChangeImpersonatedData () {
            try {
                this.updateResources()
            } catch (error) {console.error("onChangeImpersonatedData()", error)}
        }

        static onMouseOver ({args}) {
            try {
                const [id, tempX, tempY, shiftDown, ctrlDown] = args.split(",")
                const [x, y] = [tempX/settings.cellSize, tempY/settings.cellSize]

                if (args.includes("exit")) return this.onMouseOff({id: id})
            } catch (error) {console.error("onMouseOver()", error)}
        }

        static onMouseClick ({x, y}) {
            try {
                console.log(`x: ${x}, y: ${y}`,"all")
            } catch (error) {console.error("onMouseClick()", error)}
        }

        static onMouseOff ({id}) {
            try {
                // Empty function - no operations needed
            } catch (error) {console.error("onMouseOff()", error)}
        }

        static onChangeSelection () {
            try {
                this.updateTarget()
            } catch (error) {console.error("onChangeSelection()", error)}
        }

        static onTokenMove ({id}) {
            try {
                // Empty function - no operations needed
            } catch (error) {console.error("onTokenMove()", error)}
        }

        static onChangeMap({id}) {
            try {
                // Empty function - no operations needed
            } catch (error) {console.error("onChangeMap()", error)}
        }

        static onCampaignLoad() {
            try {
                console.log("Framework Loaded Successfully.", "all")
            } catch (error) {console.error("onCampaignLoad()", error)}
        }

        static onInitiativeUpdate () {
            try {
                this.updateInitiativeCreatures({runOnAllClients: true})
                macro(`execFunction("c", '["Events.updateAll()"]', 0, "all")`)
            } catch (error) {console.error("onInitiativeUpdate()", error)}
        }

        static onTimeAdvancement () {
            try {
                this.updateClock()
            } catch (error) {console.error("onTimeAdvancement()", error)}
        }

        //=====================================================================================================
        // Helpers
        //=====================================================================================================

        // Runs for current client only
        static runJSfunction = ({name, type="Overlay", functionName, args=[], targets, runOnAllClients=false }) => {
            try {
                if (runOnAllClients) return this.runJSfunctionAll({name, type, functionName, args, targets})

                const jsonString = JSON.stringify(args)
                macro(`runJSfunction("${name}", "${type}", "${functionName}", "null", '${jsonString.replace(/'/g, "`")}')`)
            } catch (error) {console.error("runJSfunction()", error)}
        }

        // Runs for all players
        static runJSfunctionAll = ({name, type="Overlay", functionName, args=[], targets="all"}) => {
            try {
                const runJSArgs = [name, type, functionName, "null", args]
                macro(`execFunction("runJSfunction", '${JSON.stringify(runJSArgs)}', ${0}, "${targets}")`)
            } catch (error) {console.error("runJSfunctionAll()", error)}
        }

        //=====================================================================================================
        // Screen Updates
        //=====================================================================================================

        // Update whole screen
        static updateAll () {
            try {
                this.updateAbilitiesBar()
                this.updateAbilitiesBarVisibility()
                this.updateResources()
                this.updateClock()
                this.updateInitiativeEndTurnButton()
                this.updateImpersonatedPortrait()
                this.updateOwnedCharacterPortraits()
                this.updateInitiativeCreatures()
                this.updateTarget()
            } catch (error) {console.error("updateAll()", error)}
        }

        // Abilities Bar
        static updateAbilitiesBarVisibility () {
            try {
                const isImpersonated = !!impersonated()
                Events.runJSfunction({
                    name: "Ability Bar",
                    type: "Overlay",
                    functionName: "updatePage",
                    args: [{visible: isImpersonated}]
                })
            } catch (error) {console.error("updateAbilitiesBarVisibility()", error)}
        }
        
        static updateAbilitiesBar () {
            try {
                if (!impersonated()) return
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
                        // Silent catch for inner spell processing
                    }
                }
                
                // Order
                const order_priority = [
                    "Special",
                    "Attack",
                    "Common",
                    "Cantrip",
                    "Class",
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
            } catch (error) {console.error("updateAbilitiesBar()", error)}
        }
        
        static updateResources() {
            try {
                if (!impersonated()) return;
                
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
            } catch (error) {console.error("updateResources()", error)}
        }
        
        // Clock
        static updateClock () {
            try {
                function ordinal(n) {
                    const s = ["th", "st", "nd", "rd"];
                    const v = n % 100;
                    return n + (s[(v - 20) % 10] || s[v] || s[0]);
                }

                const object = JSON.parse(Time.json)
                const {hour, minute} = object
                const month = [
                    "Hammer", "Alturiak", "Ches", 
                    "Tarsakh", "Mirtul", "Kythorn", 
                    "Flamerule", "Eleasis", "Eleint",
                    "Marpenoth", "Uktar", "Nightal"
                ][object.month]
                const day = ordinal(object.day)

                Events.runJSfunctionAll({
                    name: "Clock",
                    type: "Overlay",
                    functionName: "updateClock",
                    args: [{
                        hour_minute: `${hour < 10 ? "0" + hour : hour}:${minute < 10 ? "0" + minute : minute}`,
                        month_day: `${month} ${day}`,
                    }]
                })
            } catch (error) {console.error("updateClock()", error)}
        }

        // Initiative
        static updateInitiativeCreatures ({runOnAllClients = false} = {}) {
            try {
                Events.runJSfunction({
                    name: "Initiative",
                    type: "Overlay",
                    functionName: "updateInitiativeCreatures",
                    runOnAllClients: runOnAllClients,
                    args: [{
                        creatures: Initiative.creatures_info
                    }]
                })
            } catch (error) {console.error("updateInitiativeCreatures()", error)}
        }
        
        static updateInitiativeEndTurnButton () {
            try {
                this.runJSfunction({
                    name: "Initiative",
                    type: "Overlay",
                    functionName: "updateEndTurnButton",
                    args: [{
                        visible: impersonated()?.id == Initiative.current_creature && Initiative.turn_order.length > 0
                    }]
                })
            } catch (error) {console.error("updateInitiativeEndTurnButton()", error)}
        }
        
        // Portrait
        static updateImpersonatedPortrait() {
            try {
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
            } catch (error) {console.error("updateImpersonatedPortrait()", error)}
        }
        
        static updateOwnedCharacterPortraits() {
            try {
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
            } catch (error) {console.error("updateOwnedCharacterPortraits()", error)}
        }

        // Target
        static updateTarget() {
            try {
                const creature = selected()
                if (!creature) return Events.runJSfunction({name: "Target", type: "Overlay", functionName: "updateCurrentTarget", args: [{visible: false}]})
                
                const {name, type, portrait, attitude, armor_class, health, max_health} = creature
                const conditions = []
                for (const [name, condition] of Object.entries(creature.conditions)) {
                    const data = database.conditions.data[name]
                    if (!data) continue
                    const image = data.image

                    const DEFAULT_NUMBER = creature.get_remaining_duration(name)
                    const number = {
                        Exhaustion: creature.exhaustion,
                        Stoneskin: condition.charges,
                    }[name] || DEFAULT_NUMBER

                    const DEFAULT_DESCRIPTION = number == -1 ? name : `${name} (${number} rounds)`
                    const description = {
                        Exhaustion: `${name} (Level ${number})`,
                        Stoneskin: `${name} (${number} charges)`,
                    }[name] || DEFAULT_DESCRIPTION

                    conditions.push({image, number, description})
                }

                Events.runJSfunction({
                    name: "Target",
                    type: "Overlay",
                    functionName: "updateCurrentTarget",
                    args: [{
                        visible: true,
                        name,
                        type,
                        portrait,
                        attitude,
                        armor_class,
                        health,
                        max_health,
                        conditions
                    }]
                })
            } catch (error) {console.error("updateTarget()", error)}
        }

        //=====================================================================================================
    }

    // Compatibility with events screen
    const onChangeSelection = () => Events.onChangeSelection()
    const onChangeImpersonated = () => Events.onChangeImpersonated()