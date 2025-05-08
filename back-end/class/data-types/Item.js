

var Item = class {
    constructor({
        name,
        image,
        type,
        subtype,
        description = "",
        weight = 1,
        rarity = "common",
        price = 0,
        stackable = true,
        max_stack = 20,
        properties = [],

        // Equipment  
        bonus_armor_class = 0,
        conditions = [],

        // Weapon
        damage = [{
            die_ammount: 1,
            die_size: 4,
            damage_type: "Piercing"
        }],
        recovery = 0,
        range = [5],

        // Armor
        base_armor_class = 0,
    }) {
        // Validate Rarity
        if (!["common", "uncommon", "rare", "very rare", "legendary"].includes(rarity)) {
            throw new Error("Invalid rarity");
        }

        // Equipment-specific logic
        if (type !== "equipment") {
            bonus_armor_class = 0;
            conditions = [];
            damage = [];
            recovery = 0;
            range = [];
            base_armor_class = 0;
        } else {
            stackable = false;
            max_stack = 1;
        }

        // Weapon-specific logic
        if (subtype !== "weapon") {
            damage = [];
            recovery = 0;
            range = [];
        }

        // Armor-specific logic
        if (subtype !== "armor") {
            base_armor_class = 0;
        }

        // Assign properties (without #)
        this.name = name;
        this.image = image;
        this.type = type;
        this.subtype = subtype;
        this.description = description;
        this.weight = weight;
        this.rarity = rarity;
        this.price = price;
        this.stackable = stackable;
        this.max_stack = max_stack;
        this.properties = properties;
        this.bonus_armor_class = bonus_armor_class;
        this.conditions = conditions;
        this.damage = damage;
        this.recovery = recovery;
        this.range = range;
        this.base_armor_class = base_armor_class;
    }

    object() {
        // Simply return `this` or a structured clone
        return {
            name: this.name,
            image: this.image,
            type: this.type,
            subtype: this.subtype,
            description: this.description,
            weight: this.weight,
            rarity: this.rarity,
            price: this.price,
            stackable: this.stackable,
            max_stack: this.max_stack,
            properties: this.properties,
            bonus_armor_class: this.bonus_armor_class,
            conditions: this.conditions,
            damage: this.damage,
            recovery: this.recovery,
            range: this.range,
            base_armor_class: this.base_armor_class,
        };
    }
}