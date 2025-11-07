

var MonsterAbilities = class extends Abilities {

    static check_action_requirements(ability) {
        const creature = impersonated();
        const targets = allSelected();
        const target = selected();

        if (!this.has_resources_available(ability.resources)) {
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

        // Requirements
        const { valid, creature, targets } = this.check_action_requirements(ability);
        if (!valid || !creature) return;

        // Validate target selection count
        if (targets.length === 0) {
            console.log(`${creature.name_color} must select at least 1 target.`, "all");
            return;
        }
        if (targets.length > ability.max_targets) {
            console.log(`${creature.name_color} can only target up to ${ability.max_targets} creature(s) with ${ability.name}.`, "all");
            return;
        }
        if (targets.length > 3) {
            console.log(`${creature.name_color} cannot target more than 3 creatures with any attack.`, "all");
            return;
        }

        // Validate adjacency if more than 1 target
        if (targets.length > 1) {
            for (const t1 of targets) {
                let adjacent = false;
                for (const t2 of targets) {
                    if (t1.id === t2.id) continue;
                    if (calculate_distance(t1, t2) <= 1) {
                        adjacent = true;
                        break;
                    }
                }
                if (!adjacent) {
                    console.log(`${creature.name_color} must select adjacent targets for this attack.`, "all");
                    return;
                }
            }
        }

        // Attack each target
        let i = 0;
        for (const target of targets) {
            // Range Validation
            const in_range = (calculate_distance(creature, target) * 5) <= ability.range;
            if (!in_range) {
                console.log(`${creature.name_color} tried to attack ${target.name_color} using ${ability.name} but they are out of range.`, "all");
                continue;
            }

            // Release sound only on first strike
            if (i === 0) Sound.play("swing", 0.1);

            // Calculate hit
            const hit_bonus = ability.hit_bonus;
            const hit_result = this.attack_hit_result({
                hit_bonus,
                creature,
                target,
                advantage_weight: 0
            });

            // Damage result
            const damage_result = hit_result.success
                ? ` dealing ${this.spell_damage(creature, target, hit_result.message, ability.damage)} damage.`
                : `.`

            // Output
            const message =
                `${creature.name_color} attacks ${target.name_color} (AC ${target.armor_class}) with ${ability.name} and ${hit_result.message} (${hit_result.dice_roll.text_color})${damage_result}`;

            public_log(message);
            i++;
        }

        // Consume resources only once
        this.use_resources(ability.resources);
        Initiative.set_recovery(ability.recovery, creature);
    }

    static special(ability) {

    }
}
