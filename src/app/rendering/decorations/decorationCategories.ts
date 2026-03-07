export interface DecorationCategorySet {
  trees: string[];
  structures: string[];
  terrain: string[];
  scattered: string[];
}

export function getDecorationCategories(theme: string): DecorationCategorySet {
  switch (theme) {
    case "desert":
      return {
        trees: ["palm", "cactus"],
        structures: ["ruins", "torch", "tent", "barrel", "fence", "obelisk"],
        terrain: ["rock", "dune", "sand_pile", "pottery"],
        scattered: ["skeleton", "bones", "treasure_chest", "sword", "arrow"],
      };
    case "winter":
      return {
        trees: ["pine", "pine_tree"],
        structures: [
          "ruins",
          "fence",
          "snow_lantern",
          "ice_throne",
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
        scattered: ["frozen_soldier", "snowman", "bones", "sword"],
      };
    case "volcanic":
      return {
        trees: ["charred_tree"],
        structures: ["obsidian_spike", "fire_pit", "torch", "fire_crystal"],
        terrain: ["rock", "lava_pool", "ember_rock", "ember"],
        scattered: ["skeleton", "bones", "skeleton_pile", "sword", "arrow"],
      };
    case "swamp":
      return {
        trees: ["swamp_tree", "mushroom"],
        structures: [
          "ruins",
          "gravestone",
          "hanging_cage",
          "tombstone",
          "cauldron",
          "glowing_runes",
        ],
        terrain: ["rock", "lily_pad", "poison_pool", "fog_wisp"],
        scattered: ["bones", "tentacle", "skeleton", "skeleton_pile", "torch"],
      };
    default:
      return {
        trees: ["tree", "bush", "hedge"],
        structures: [
          "hut",
          "fence",
          "tent",
          "barrel",
          "bench",
          "cart",
          "fountain",
          "dock",
          "campfire",
          "ruins",
        ],
        terrain: ["rock", "grass", "flowers", "reeds", "fishing_spot"],
        scattered: [
          "lamppost",
          "signpost",
          "torch",
          "bones",
          "gravestone",
          "statue",
        ],
      };
  }
}
