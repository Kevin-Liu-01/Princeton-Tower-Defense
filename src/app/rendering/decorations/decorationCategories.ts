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
        structures: ["ruins", "torch", "obelisk"],
        terrain: ["rock", "dune", "sand_pile"],
        scattered: ["skeleton", "bones", "skull", "pottery"],
      };
    case "winter":
      return {
        trees: ["pine_tree", "pine"],
        structures: ["ruins", "fence", "broken_wall"],
        terrain: ["rock", "snow_pile", "ice_crystal", "icicles"],
        scattered: ["aurora_crystal", "frozen_soldier", "snowman"],
      };
    case "volcanic":
      return {
        trees: ["charred_tree"],
        structures: ["obsidian_spike", "fire_pit", "torch"],
        terrain: ["rock", "lava_pool", "ember_rock"],
        scattered: ["skeleton", "bones", "ember", "skull"],
      };
    case "swamp":
      return {
        trees: ["swamp_tree", "mushroom"],
        structures: ["ruins", "gravestone", "tombstone", "broken_bridge"],
        terrain: ["rock", "lily_pad", "fog_patch"],
        scattered: ["bones", "tentacle"],
      };
    default:
      return {
        trees: ["tree", "bush"],
        structures: ["hut", "fence", "tent", "barrel", "bench", "cart"],
        terrain: ["rock", "grass", "flowers"],
        scattered: ["lamppost", "signpost"],
      };
  }
}
