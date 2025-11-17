

var Events = class {

    //=====================================================================================================
    // Helpers
    //=====================================================================================================

    static #runJSfunction = ({name, type="Overlay", functionName, args=[]}) => {
        const jsonString = JSON.stringify(args)
        macro(`runJSfunction("${name}", "${type}", "${functionName}", "null", '${jsonString.replace(/'/g, "`")}')`)
    }

    //=====================================================================================================
    // Events
    //=====================================================================================================

    static onChangeSelection () {

    }

    static onChangeImpersonated () {
        const isImpersonated = !!impersonated()
        this.#runJSfunction({
            name: "Ability Bar",
            type: "Overlay",
            functionName: "updatePage",
            args: [{visible: isImpersonated}]
        })

        this.onUpdateAbilities()
        this.onUpdateResources()
    }

    //=====================================================================================================
    // Screen Updates
    //=====================================================================================================

    static onUpdateAbilities () {
        if (!impersonated()) return

        // Ability Bar Overlay
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
                "Spells",
                "Special"
            ];

            // Output List
            const outputAbilities = abilities
            .filter(e => e.object)
            .sort((a, b) => {
                const pa = order_priority.indexOf(a.ordered);
                const pb = order_priority.indexOf(b.ordered);

                if (pa !== pb) return pa - pb;

                // Same category → sort alphabetically by key
                return a.key.localeCompare(b.key);
            });
            this.#runJSfunction({
                name: "Ability Bar",
                type: "Overlay",
                functionName: "updateAbilityBar",
                args: [{abilities: outputAbilities}]
            })
        } catch (error) {console.log(error)}
    }

    static onUpdateResources () {
        if (!impersonated()) return

        // Ability Bar Overlay
        try {
            const resources = {}
            const hasInitiative = Initiative.turn_order.includes(impersonated().id)

            for (const [key, object] of Object.entries(impersonated().resources)) {
                resources[key] = {
                    ...object,
                    color: database.resources.data[key],
                    image: database.resources.data[key]
                }
            }
            
            this.#runJSfunction({
                name: "Ability Bar",
                type: "Overlay",
                functionName: "updateResources",
                args: [{resources: resources, hasInitiative: hasInitiative}]
            })
        } catch (error) {console.log(error)}
    }

    //=====================================================================================================
}

// Compatibility with events screen
const onChangeSelection = () => Events.onChangeSelection()
const onChangeImpersonated = () => Events.onChangeImpersonated()