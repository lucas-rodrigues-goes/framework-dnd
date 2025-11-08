`[r:'`

let data_description; {
    const title_value = ({title, value}) => {
        return element( 
            {tag: "p", style: {margin: "0.3vh", padding: "0"}, children: [
                {tag: "span", style: {fontWeight: "bold"}, text: title + ": "},
                {tag: "span", style: {color: "#aaa"}, text: value},
            ]}
        )
    }
    
    const DEFAULT_STYLE = {padding: "0.5vh 1.5vh", fontSize: "105%", textAlign: "center", width: "100%"}

    data_description = {
        spell: ({object, style=DEFAULT_STYLE}) => {
            // Subtitle
            let title; {
                if (object.level == "cantrip") title = capitalize(object?.school) + " Cantrip"
                else title = object.level + " Level " + capitalize(object?.school) + " Spell"
            }

            // Cast Time
            let cast_time = ""; {
                if (object.cast_time > 0) cast_time = (object?.cast_time || 0) + ""
                else cast_time = "Instantaneous"
            }

            // Resource
            let resource = ""; {
                if (object.cast_time >= 0) resource = "Action"
                else if (object.cast_time == -1) resource = "Bonus Action"
                else if (object.cast_time == -2) resource = "Reaction"
            }

            // Attributes
            const attributes = []; {
                attributes.push(title_value({title: "Resource", value: resource}))
                attributes.push(title_value({title: "Casting Time", value: capitalize(cast_time)}))
                if (object.duration) attributes.push(title_value({title: "Duration", value: timeUnit(object.duration)}))
                if (object.range) {
                    let range = object.range + " ft"; {
                        if (object.range == 5) range = "Touch"
                        else if (object.range == 0) range = "Self"
                    }
                    attributes.push(title_value({title: "Range", value: range}))
                }
                if (object.components) attributes.push(title_value({title: "Components", value: capitalize(object?.components.join(", "))}))
                if (object.classes) attributes.push(title_value({title: "Classes", value: capitalize(object?.classes.join(", "))}))
            }

            // Element
            return (
                {tag: "div", style: {...DEFAULT_STYLE, ...style}, children: [
                    // Title
                    {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                        {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: object?.name},
                        {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: title},
                    ]},
                    // Attributes
                    {tag: "div", style: {textAlign: "left"}, children: attributes},
                    // Description
                    object.description
                        && {tag: "pre", style: {color: "#aaa", textAlign: "left", padding: 0, margin: 0, marginTop: "1vh"}, text: object?.description || ""},
                    object.description_higher_levels 
                        && {tag: "pre", style: {color: "#aaa", textAlign: "left", padding: 0, margin: 0, marginTop: "1vh"}, children: [
                            {tag: "b", style: {color: "#ddd"}, text: "At Higher Levels: "},
                            {tag: "span", text: object.description_higher_levels || ""}
                        ]},
                ]}
            )
        },

        resource: async ({resource, style=DEFAULT_STYLE}) => {
            console.log(resource)

            return element(
                {tag: "div", style: {...DEFAULT_STYLE, ...style}, children: [
                    // Title
                    {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                        {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: resource.name},
                        {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: "Resource"},
                    ]},
                    // Description
                    {tag: "pre", style: {color: "#aaa", textAlign: "left", padding: 0, margin: 0, marginTop: "1vh"}, 
                        text: (resource.description || await backend(`database?.features?.data?.["`+resource.name+`"]?.description`))
                    }
                ]}
            )
        },

        item: async ({object, style=DEFAULT_STYLE}) => {
            // Item from database
            const item = JSON.parse(await backend(`database.get_item("` + object.name + `")`)) || {}

            // Name
            const name = object.amount == 1
                ? item.name
                : object.amount + " " + item.name + "s"

            // Subtitle
            const type = item.subtype || item.type
            const rarity = item.rarity == "common"
                ? ""
                : item.rarity + " "
            const subtitle = capitalizeAll(rarity + type)

            // Weight
            const weight = Math.round(item.weight * object.amount * 100) / 100 + "lb"

            // Damage
            let damage = ""
            for (let i = 0 ; i < item.damage.length ; i++) {
                const current = item.damage[i]
                damage += current["die_ammount"] + "d" + current["die_size"] + " " + current["damage_type"].toLowerCase()
                damage += i != item.damage.length - 1 ? ", " : "" // -> adds comma if it is not the last element
            }

            // Other Arrays
            const properties = item.properties ? capitalize(item.properties.join(", ")) : ""
            const conditions = item.conditions ? capitalize(item.conditions.join(", ")) : ""
            
            return element(
                {tag: "div", style: {...DEFAULT_STYLE, ...style}, children: [
                    {tag: "div", 
                        style: {textAlign: "center", margin: "1vh", padding: 0, position: "relative", margin: "auto", marginBottom: "2vh", width: "fit-content"}, 
                        children: [
                            {tag: "span", style: {fontWeight: "bold", fontSize: "110%"}, text: name},
                            {tag: "br"},
                            {tag: "span", style: {color: "#aaa"}, text: subtitle},
                            {tag: "img", attributes: {src: item.image}, style: {position: "absolute", left: "-5.5vh", top: 0, height: "4vh"}}
                        ]
                    },
                    {tag: "div", style: {textAlign: "left"}, children: [
                        damage ? title_value({title: "Damage", value: damage}) : null,
                        item.recovery ? title_value({title: "Recovery Speed", value: String(item.recovery)}) : null,
                        item.base_armor_class ? title_value({title: "Armor Class", value: item.base_armor_class}) : null,
                        weight ? title_value({title: "Weight", value: weight}) : null,
                        properties ? title_value({title: "Properties", value: properties}) : null,
                        conditions ? title_value({title: "Conditions", value: conditions}) : null,
                    ]},
                    item.description ? {tag: "pre", style: {color: "#aaa", textAlign: "left"}, text: item.description} : null
                ]}
            )
        },

        ability: async ({object, style=DEFAULT_STYLE}) => {
            // Attributes
            const attributes = []; {
                attributes.push(title_value({title: "Resources", value: object.resources.length > 0 ? object.resources.join(", ") : "Free"}))
                if (object.duration) attributes.push(title_value({title: "Duration", value: timeUnit(object.duration)}))
            }

            return element({tag: "div", style: {...DEFAULT_STYLE, ...style}, children: [
                // Title
                {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                    {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: object.name},
                    {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: (object.type || object.origin) + " Ability"},
                ]},

                // Attributes
                {tag: "div", style: {textAlign: "left"}, children: attributes},

                // Description
                {tag: "pre", style: {color: "#aaa", textAlign: "left", padding: 0, margin: 0, marginTop: "1vh"}, 
                    text: (object.description || await backend(`database.features.data["`+object.name+`"].description`))
                }
            ]})
        },

        monster_ability: async ({object, style=DEFAULT_STYLE}) => {
            // Validation
            if (!object.damage_on_save_fail) object.damage_on_save_fail = []

            // Subtitle
            let title; {
                title = (object.type || object.origin) + " Ability"
                if (object.type == "Monster Ability") title = object.type
            }

            // Resource
            let resource = ""; {
                if (object.resources.length > 0) resource = object.resources.join(", ")
                else resource = "Free"
            }

            // Range
            let range = ""; {
                range = object.range + " ft"
            }

            // Attributes
            const attributes = []; {
                // Resources
                attributes.push(title_value({title: "Resource", value: resource}))

                // Damage
                if (object.damage && object.damage.length > 0) {
                    const damage_text = object.damage.map(dmg => {
                        const bonus = dmg.damage_bonus ? (dmg.damage_bonus.startsWith("-") ? dmg.damage_bonus : "+" + dmg.damage_bonus) : ""
                        return dmg.die_amount + "d" + dmg.die_size + bonus + " " + dmg.damage_type
                    }).join(", ")
                    attributes.push(title_value({title: "Damage", value: damage_text}))
                }
                
                // Type-specific attributes
                if (object.type === "Attack") {
                    attributes.push(title_value({title: "Hit Bonus", value: "+" + object.hit_bonus}))
                    attributes.push(title_value({title: "Recovery", value: object.recovery}))
                } else if (object.type === "Monster Ability") {
                    attributes.push(title_value({title: "Casting Time", value: object.cast_time}))
                }

                // Damage on Save Fail
                if (object.damage_on_save_fail && object.damage_on_save_fail.length > 0) {
                    const damage_on_fail_text = object.damage_on_save_fail.map(dmg => {
                        const bonus = dmg.damage_bonus ? (dmg.damage_bonus.startsWith("-") ? dmg.damage_bonus : "+" + dmg.damage_bonus) : ""
                        return dmg.die_amount + "d" + dmg.die_size + bonus + " " + dmg.damage_type
                    }).join(", ")
                    attributes.push(title_value({title: "Damage on Save Fail", value: damage_on_fail_text}))
                }

                // Conditions
                if (object.conditions && object.conditions.length > 0) {
                    const conditions_text = object.conditions.map(cond => {
                        const duration = cond.duration === -1 ? "Permanent" : cond.duration + " round(s)"
                        return cond.name + " (" + duration + ")"
                    }).join(", ")
                    attributes.push(title_value({title: "Conditions", value: conditions_text}))
                }
                
                // Difficulty Class
                if (object.difficulty_class > 0) {
                    const save_text = "DC " + object.difficulty_class + " " + 
                    (object.save_attribute ? object.save_attribute.charAt(0).toUpperCase() + object.save_attribute.slice(1) : "")
                    attributes.push(title_value({title: "Saving Throw", value: save_text}))
                }

                // Half Damage on Save
                if (object.half_damage_on_save !== undefined && object.damage_on_save_fail.length > 0) {
                    attributes.push(title_value({title: "Half Damage on Save", value: object.half_damage_on_save ? "Yes" : "No"}))
                }

                attributes.push(title_value({title: "Range", value: range}))
                attributes.push(title_value({title: "Max Targets", value: object.max_targets}))
            }

            return element({tag: "div", style: {...DEFAULT_STYLE, ...style}, children: [
                // Title
                {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                    {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: object.name},
                    {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: title},
                ]},

                // Attributes
                {tag: "div", style: {textAlign: "left"}, children: attributes},

                // Description
                {tag: "pre", style: {color: "#aaa", textAlign: "left", padding: 0, margin: 0, marginTop: "1vh"}, 
                    text: (object.description || "")
                }
            ]})
        },

        ability: async ({object, style=DEFAULT_STYLE}) => {
            // Subtitle
            let title; {
                title = (object.type || object.origin) + " Ability"
            }

            // Resource
            let resource = ""; {
                if (object.resources.length > 0) resource = object.resources.join(", ")
                else resource = "Free"
            }

            // Attributes
            const attributes = []; {
                attributes.push(title_value({title: "Resource", value: resource}))
                if (object.duration) attributes.push(title_value({title: "Duration", value: timeUnit(object.duration)}))
            }

            return element({tag: "div", style: {...DEFAULT_STYLE, ...style}, children: [
                // Title
                {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                    {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: object.name},
                    {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: title},
                ]},

                // Attributes
                {tag: "div", style: {textAlign: "left"}, children: attributes},

                // Description
                {tag: "pre", style: {color: "#aaa", textAlign: "left", padding: 0, margin: 0, marginTop: "1vh"}, 
                    text: (object.description || await backend(`database.features.data["`+object.name+`"].description`))
                }
            ]})
        },

        feature: ({object, style=DEFAULT_STYLE}) => {
            // Subtitle
            const show_type = capitalize(object.subtype || object.type)
            const subtitle = (object.level && object.level != 0
                ? "Level " + object.level + " " + show_type + " Feature"
                : show_type + " Feature"
            )

            return element({tag: "div", style: {...DEFAULT_STYLE, ...style, width: "95%"}, children: [
                // Title
                {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                    {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: object.name},
                    {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: subtitle},
                ]},
                // Description
                {tag: "pre", style: {color: "#aaa", textAlign: "left", padding: 0, margin: 0, marginTop: "1vh"}, 
                    text: object.description
                }
            ]})
        },

        proficiency: ({object, level = 3, style=DEFAULT_STYLE}) => {
            // Title
            const title = (object.type != "language"
                ? object.name + " " + ["", "Expertise", "Mastery", "Grandmastery"][level]
                : object.name
            )

            // Description
            const description = []; {
                const level_names = ["Proficiency", "Expertise", "Mastery", "Grandmastery"]
                for (let i = 0 ; i <= level; i++) {
                    const elem = object.description[i]
                    if (elem != "") description.push(`<b style="color: #ddd">` + level_names[i] + ":</b> " + object.description[i])
                }
            }


            return element({tag: "div", style: {...DEFAULT_STYLE, ...style, width: "95%"}, children: [
                // Title
                {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                    {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: title},
                    {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: capitalize(object.type) + " Proficiency"},
                ]},
                // Description
                {tag: "pre", style: {color: "#aaa", textAlign: "left", padding: 0, margin: 0, marginTop: "1vh"}, 
                    textHTML: description.join("<br><br>")
                }
            ]})
        },
    }
}

`']`