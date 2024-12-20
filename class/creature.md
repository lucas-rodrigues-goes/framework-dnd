# Documentation for the Creature Class

## Overview

The `Creature` class is designed to represent creatures in a game-like environment. It handles attributes, resources, resistances, features, equipment, inventory, and interactions with external game elements via MapTool. The class provides functionality to initialize, modify, and interact with creature data.

## Properties

### Public Properties

- **id**: Identifier of the creature's token.
- **name**: _(Getter/Setter)_ The name of the creature.
- **type**: _(Getter/Setter)_ The type (e.g., "Humanoid", "Undead") of the creature.
- **race**: _(Getter/Setter)_ The race (e.g., "Human", "Elf") of the creature.
- **attributes**: _(Getter)_ Object containing six core attributes: strength, dexterity, constitution, wisdom, intelligence, and charisma.
- **attr_bonus**: _(Getter)_ Object containing bonus values for each attribute based on standard RPG calculations.
- **armor_class**: _(Getter)_ Calculated as 10 + dexterity bonus.
- **resources**: _(Getter)_ Object containing resource data, such as health (current and maximum).
- **resistances**: _(Getter)_ Object defining resistances (e.g., fire, slashing) and their values.
- **features**: _(Getter)_ Object categorizing features (e.g., racial, feat).
- **spells**: _(Getter)_ Object organizing known and prepared spells by class and level.
- **equipment**: _(Getter)_ Object storing equipped items.
- **inventory**: _(Getter)_ Array representing the inventory items.

## Methods

### Constructor

#### `constructor(id, reset)`

- **Parameters**:
  - `id` (string): The token ID associated with the creature.
  - `reset` (boolean): If `true`, resets the creature's data to default values.

Initializes the creature using token properties or resets it if data is missing or invalid.

### Getters

- `name`, `type`, `race`, `attributes`, `attr_bonus`, `armor_class`, `resources`, `resistances`, `features`, `spells`, `equipment`, `inventory`.

### Setters

- `name` (string): Updates the creature's name and saves it.
- `type` (string): Sets the creature's type.
- `race` (string): Sets the creature's race.
- `set_attribute(attribute, value)`:
  - **Parameters**:
    - `attribute` (string): One of the six core attributes.
    - `value` (number): Value to set (1 to 30).
  - Updates the specified attribute.

### Features Management

- `add_feature(type, name)`:
  - **Parameters**:
    - `type` (string): Category of the feature (e.g., racial, feat).
    - `name` (string): Name of the feature.
  - Adds the feature to the creature's feature list.
  
- `remove_feature(type, name)`:
  - **Parameters**:
    - `type` (string): Category of the feature.
    - `name` (string): Name of the feature.
  - Removes the feature from the creature's feature list.
  
- `has_feature(name)`:
  - **Parameters**:
    - `name` (string): Name of the feature to check.
  - **Returns**: `true` if the feature is present; otherwise, `false`.

### Sync Methods

- `load()`: Loads data from the token's properties.
- `save()`: Saves the current creature state to the token's properties.

### Utility Methods

- `create(name, type, race, str, dex, con, wis, int, cha)`:
  - **Parameters**:
    - `name` (string): Creature's name.
    - `type` (string): Creature's type.
    - `race` (string): Creature's race.
    - `str`, `dex`, `con`, `wis`, `int`, `cha` (numbers): Initial attribute values.
  - Initializes the creature and adjusts attributes based on race.
  
- `receive_damage(value, type)`:
  - **Parameters**:
    - `value` (number): Damage amount.
    - `type` (string): Damage type (e.g., fire, slashing).
  - Applies damage, considering resistances.
  
- `receive_healing(value)`:
  - **Parameters**:
    - `value` (number): Healing amount.
  - Restores health, capped by maximum health.

## Notes

- The `Creature` class relies on MapTool's API for token interaction.
- Resistances can have special values (immunity, vulnerability, heals) or numeric reductions.
- Race-specific bonuses are automatically applied during creation.