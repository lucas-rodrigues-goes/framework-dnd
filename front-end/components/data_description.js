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
        spell: ({spell, style=DEFAULT_STYLE}) => {
            // Subtitle
            let title; {
                if (spell.level == "cantrip") title = capitalize(spell?.school) + " Cantrip"
                else title = spell.level + " Level " + capitalize(spell?.school) + " Spell"
            }

            // Cast Time
            let cast_time = ""; {
                if (spell.cast_time > 0) cast_time = (spell?.cast_time || 0) / 2 + " Seconds"
                else cast_time = "Instantaneous"
            }

            // Resource
            let resource = ""; {
                if (spell.cast_time >= 0) resource = "Action"
                else if (spell.cast_time == -1) resource = "Bonus Action"
                else if (spell.cast_time == -2) resource = "Reaction"
            }

            // Attributes
            const attributes = []; {
                attributes.push(title_value({title: "Resource", value: resource}))
                attributes.push(title_value({title: "Casting Time", value: capitalize(cast_time)}))
                if (spell.duration) attributes.push(title_value({title: "Duration", value: timeUnit(spell.duration)}))
                if (spell.range) {
                    let range = spell.range + " ft"; {
                        if (spell.range == 5) range = "Touch"
                        else if (spell.range == 0) range = "Self"
                    }
                    attributes.push(title_value({title: "Range", value: range}))
                }
                if (spell.components) attributes.push(title_value({title: "Components", value: capitalize(spell?.components.join(", "))}))
                if (spell.classes) attributes.push(title_value({title: "Classes", value: capitalize(spell?.classes.join(", "))}))
            }

            // Element
            return (
                {tag: "div", style: {...DEFAULT_STYLE, ...style}, children: [
                    // Title
                    {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                        {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: spell?.name},
                        {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: title},
                    ]},
                    // Attributes
                    {tag: "div", style: {textAlign: "left"}, children: attributes},
                    // Description
                    spell.description 
                        && {tag: "pre", style: {color: "#aaa", textAlign: "left", padding: 0, margin: 0, marginTop: "1vh"}, text: spell?.description || ""},
                    spell.description_higher_levels 
                        && {tag: "pre", style: {color: "#aaa", textAlign: "left", padding: 0, margin: 0, marginTop: "1vh"}, children: [
                            {tag: "b", style: {color: "#ddd"}, text: "At Higher Levels: "},
                            {tag: "span", text: spell.description_higher_levels || ""}
                        ]},
                ]}
            )
        },

        resource: async ({resource, style=DEFAULT_STYLE}) => {
            return element(
                {tag: "div", style: {...DEFAULT_STYLE, ...style}, children: [
                    // Title
                    {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                        {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: resource.name},
                        {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: "Resource"},
                    ]},
                    // Description
                    {tag: "pre", style: {color: "#aaa", textAlign: "left", padding: 0, margin: 0, marginTop: "1vh"}, 
                        text: (resource.description || await backend(`database.features.data["`+resource.name+`"].description`))
                    }
                ]}
            )
        },

        item: async ({slot, style=DEFAULT_STYLE}) => {
            // Item from database
            const item = JSON.parse(await backend(`database.get_item("` + slot.name + `")`)) || {}

            // Name
            const name = slot.amount == 1
                ? item.name
                : slot.amount + " " + item.name + "s"

            // Subtitle
            const type = item.subtype || item.type
            const rarity = item.rarity == "common"
                ? ""
                : item.rarity + " "
            const subtitle = capitalizeAll(rarity + type)

            // Weight
            const weight = Math.round(item.weight * slot.amount * 100) / 100 + "lb"

            // Damage
            let damage = ""
            for (let i = 0 ; i < item.damage.length ; i++) {
                const current = item.damage[i]
                damage += current["die_ammount"] + "d" + current["die_size"] + " " + current["damage_type"].toLowerCase()
                damage += i != item.damage.length - 1 ? ", " : "" // -> adds comma if it is not the last element
            }

            // Other Arrays
            const properties = item.properties.length > 0 != "" ? capitalize(item.properties.join(", ")) : ""
            const conditions = item.conditions.length > 0 != "" ? capitalize(item.conditions.join(", ")) : ""

            
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

        ability: async ({ability, style=DEFAULT_STYLE}) => {
            // Attributes
            const attributes = []; {
                attributes.push(title_value({title: "Resources", value: ability.resources.length > 0 ? ability.resources.join(", ") : "Free"}))
                if (ability.duration) attributes.push(title_value({title: "Duration", value: timeUnit(ability.duration)}))
            }

            return element({tag: "div", style: {...DEFAULT_STYLE, ...style}, children: [
                // Title
                {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                    {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: ability.name},
                    {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: ability.origin + " Ability"},
                ]},

                // Attributes
                {tag: "div", style: {textAlign: "left"}, children: attributes},

                // Description
                {tag: "pre", style: {color: "#aaa", textAlign: "justify", padding: 0, margin: 0, marginTop: "1vh"}, 
                    text: (ability.description || await backend(`database.features.data["`+ability.name+`"].description`))
                }
            ]})
        },

        feature: ({feature, style=DEFAULT_STYLE}) => {
            // Subtitle
            const show_type = capitalize(feature.subtype || feature.type)
            const subtitle = (feature.level && feature.level != 0
                ? "Level " + feature.level + " " + show_type + " Feature"
                : show_type + " Feature"
            )

            return element({tag: "div", style: {...DEFAULT_STYLE, ...style, width: "95%"}, children: [
                // Title
                {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                    {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: feature.name},
                    {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: subtitle},
                ]},
                // Description
                {tag: "pre", style: {color: "#aaa", textAlign: "justify", padding: 0, margin: 0, marginTop: "1vh"}, 
                    text: feature.description
                }
            ]})
        },

        proficiency: ({proficiency, level = 3, style=DEFAULT_STYLE}) => {
            // title
            const title = (proficiency.type != "language"
                ? proficiency.name + " " + ["", "Expertise", "Mastery", "Grandmastery"][level]
                : proficiency.name
            )

            return element({tag: "div", style: {...DEFAULT_STYLE, ...style, width: "95%"}, children: [
                // Title
                {tag: "div", style: {marginTop: "0.5vh", marginBottom: "2vh"}, children: [
                    {tag: "div", style: {fontSize: "120%", fontWeight: "bold", margin: 0}, text: title},
                    {tag: "div", style: {color: "#aaa", margin: 0, marginBottom: "1vh"}, text: capitalize(proficiency.type) + " Proficiency"},
                ]},
                // Description
                {tag: "pre", style: {color: "#aaa", textAlign: "justify", padding: 0, margin: 0, marginTop: "1vh"}, 
                    text: proficiency.description[level]
                }
            ]})
        },
    }
}

`']`