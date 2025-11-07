

var MonsterAbilities = class extends Abilities {

    static check_action_requirements(ability) {
        const creature = impersonated();
        const targets = allSelected();
        const target = selected();

        if (!this.has_resources_available(ability.resources)) {
            return { valid: false };
        }

        if (!selected()) {
            public_log(`${creature.name_color} needs to select a target for this action.`);
            return { valid: false };
        }

        // Validate Visibility
        if (creature.target_visibility() == 0) {
            public_log(`${creature.name_color} needs to see their target.`);
            return { valid: false };
        }

        return { valid: true, creature, target, targets };
    }

    static use(ability) {
        switch (ability.type) {
            case "Attack":
                this.attack(ability)
                break
            case "Special":
                this.special(ability)
                break
        }
    }

    static attack(ability) {
        const target = selected()

        // Requirements
        const { valid, creature } = this.check_action_requirements(ability);
        if (!valid || !target) return;

        // Make attack
        let advantage_weight = 0

        // Range Validation
        const range_valid = (calculate_distance(creature, target) * 5) <= ability.range
        if (!range_valid) {
            console.log(`${creature.name_color} tried to attack ${target.name_color} using their ${weapon?.name || "fists"} but they are out of range.`, "public")
        }

        // Release Sound
        Sound.play("swing", 0.1)

        // Calculate Hit
        const hit_bonus = ability.hit_bonus
        const hit_result = this.attack_hit_result({hit_bonus, creature, target, advantage_weight})

        // Deal damage
        const damage_result = (hit_result.success 
            ? ` dealing ${this.spell_damage(creature, target, hit_result.message, ability.damage)} damage.`
            : `.`
        )

        // Make stealth tests and others
        this.attack_roll_advantage_modifiers({creature, target})

        // Output
        const attack_result = {
            success: true,
            hit_result: hit_result,
            damage_result: damage_result,
            message: `${creature.name_color} attacks ${target.name_color} (AC ${target.armor_class}) with ${ability.name} and ${hit_result.message} (${hit_result.dice_roll.text_color})${damage_result}`
        }

        // Consume resources
        this.use_resources(ability.resources)
        Initiative.set_recovery(ability.recovery, creature)

        // Logging
        public_log(attack_result.message)
    }

    static special(ability) {

    }
}
