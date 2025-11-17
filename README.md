# D&D Framework for MapTool

This framework aims to provide an automated D&D experience for **MapTool**, offering a more game-like experience for both players and the DM. Although it is based on **D&D 5e core rules**, it incorporates a lot of ideas from other editions and homebrew systems (mostly combat).

## Main Features

### Automated Combat
- **Action Bar:** Players and monsters will have their abilities automatically shown in the action bar, clicking the respective buttons will cast or use these abilities/features.
- **Resources:** Resources for abilities are shown at the top of the action bar, and are automatically spent.
- **Initiative and Time:** Starting combat is as simple as adding creatures to the initiative and then taking your turns. Initiative, conditions and other time based systems are directly tied to the world's calendar/time tracker, which automatically advances in combat and is manually advanced outside of it. Map lightning is also automatically changed based on the current time.

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0px; align-items: center; justify-content: center">
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Combat%201.png" width="30%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Combat%202.png" width="30%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Combat%203.png" width="30%" />
</div>

### Character Sheet
Screen applicable to both monsters and player characters, shows creature stats as well as management of spells, inventory, and notes.
- **Character:** Basic character attributes, features, and proficiencies.
- **Inventory:**  View current equipment info, resistances, inventory, send/drop/move items.
- **Spells:** See known, memorized, always prepared, and innate spells for all classes, memorize/forget spells.
- **Journal:** Add, edit, and delete notes.

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0px; align-items: center; justify-content: center">
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Character%20Sheet%201.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Character%20Sheet%202.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Character%20Sheet%203.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Character%20Sheet%204.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Character%20Sheet%205.png" width="18%" />
</div>

### Character Creation
An intuitive and automated screen for creating new characters where players can easily read and choose from the available races, classes, and features. Currently classes are safely implemented up to level 5, although most will work fine on higher levels.
- **Races:** *Dwarf, Elf, Half-Elf, Half-Orc, and Human.*
- **Classes:** *Barbarian, Cleric, Fighter, Sorcerer, Wizard, Warlock, Rogue, and Ranger.*

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0px; align-items: center; justify-content: center">
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Character%20Creation%201.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Character%20Creation%202.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Character%20Creation%203.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Character%20Creation%204.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Character%20Creation%205.png" width="18%" />
</div>

### Monster Creation
Unified screen for both creating and updating existing monsters, allows to represent most monster attacks and abilities from 5e, as well as utilize spells and various features from Player Classes and Races.
- **Basic Attributes:** *Name, Type, Race, Size, CR, Ability Scores, Health Archetype, Natural AC, Initiative Modifier, Walking Speed, Features, and Proficiencies.*
- **Spellcasting:** *Spellcasting Level, Known Spells, and Innate Spells.*
- **Abilities:** Creation of custom ***Attacks** (such as bite)* or ***Monster Abilities** (such as breath weapons)*.

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 0px 0px; align-items: center; justify-content: center">
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Monster%20Creation%201.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Monster%20Creation%202.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Monster%20Creation%203.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Monster%20Creation%204.png" width="18%" />
  <img src="https://raw.githubusercontent.com/lucas-rodrigues-goes/framework-dnd/main/screenshots/Monster%20Creation%205.png" width="18%" />
</div>