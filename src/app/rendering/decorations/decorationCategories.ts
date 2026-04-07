export interface DecorationCategorySet {
  trees: string[];
  structures: string[];
  terrain: string[];
  scattered: string[];
}

export function getDecorationCategories(theme: string): DecorationCategorySet {
  switch (theme) {
    case "desert": {
      return {
        scattered: ["skeleton", "bones", "treasure_chest", "sword", "arrow"],
        structures: ["ruins", "torch", "tent", "barrel", "fence", "obelisk"],
        terrain: ["rock", "dune", "sand_pile", "pottery"],
        trees: ["palm", "cactus"],
      };
    }
    case "winter": {
      return {
        scattered: ["frozen_soldier", "snowman", "bones", "sword"],
        structures: [
          "ruins",
          "fence",
          "snow_lantern",
          "ice_spire",
          "frozen_pond",
          "broken_wall",
        ],
        terrain: [
          "aurora_crystal",
          "rock",
          "snow_pile",
          "ice_crystal",
          "icicles",
        ],
        trees: ["pine", "pine_tree"],
      };
    }
    case "volcanic": {
      return {
        scattered: ["skeleton", "bones", "skeleton_pile", "sword", "arrow"],
        structures: [
          "obsidian_spike",
          "fire_pit",
          "torch",
          "fire_crystal",
          "ruins",
        ],
        terrain: ["rock", "lava_pool", "ember_rock", "ember"],
        trees: ["charred_tree"],
      };
    }
    case "swamp": {
      return {
        scattered: ["bones", "tentacle", "skeleton", "skeleton_pile", "torch"],
        structures: [
          "ruins",
          "gravestone",
          "hanging_cage",
          "tombstone",
          "cauldron",
          "glowing_runes",
        ],
        terrain: ["rock", "lily_pad", "poison_pool", "fog_wisp"],
        trees: ["swamp_tree", "mushroom"],
      };
    }
    default: {
      return {
        scattered: [
          "lamppost",
          "signpost",
          "torch",
          "bones",
          "gravestone",
          "statue",
        ],
        structures: [
          "hut",
          "fence",
          "tent",
          "barrel",
          "bench",
          "cart",
          "dock",
          "campfire",
          "ruins",
          // "fountain",
        ],
        terrain: ["rock", "grass", "flowers", "reeds", "fishing_spot"],
        trees: ["tree", "bush", "hedge"],
      };
    }
  }
}
