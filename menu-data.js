/* ==========================================================================
   Olive & Ember — menu-data.js
   Sample menu content for this layout demo. Loaded as a plain script
   (no modules) BEFORE js/script.js so the globals below are available.
   ========================================================================== */

const CURRENCY = "Rs.";

const MENU = [
  { id: "whipped-feta", name: "Whipped feta, honey, pistachio", description: "Sheep's milk feta whipped with olive oil, thyme honey and Aleppo pepper.", price: 950, category: "starters", tags: ["V", "GF"], chefsPick: true },
  { id: "muhammara", name: "Muhammara", description: "Roasted red pepper and walnut dip with pomegranate molasses and cumin.", price: 900, category: "starters", tags: ["VG", "GF", "SPICY"], chefsPick: false },
  { id: "grilled-halloumi", name: "Grilled halloumi, preserved lemon", description: "Thick-cut halloumi from the charcoal grill with preserved lemon and mint oil.", price: 1150, category: "starters", tags: ["V", "GF"], chefsPick: false },
  { id: "marinated-olives", name: "Marinated olives & warm flatbread", description: "Cracked olives with orange peel and oregano, warm flatbread on the side.", price: 650, category: "starters", tags: ["VG"], chefsPick: false },
  { id: "charred-octopus", name: "Charred octopus, chickpea purée", description: "Slow-braised then grilled, over warm chickpea purée with paprika oil.", price: 1650, category: "starters", tags: ["GF"], chefsPick: false },

  { id: "whole-sea-bass", name: "Whole sea bass, charred lemon", description: "Grilled whole over olive wood, with a herb and caper salsa.", price: 4200, category: "mains", tags: ["GF"], chefsPick: true },
  { id: "lamb-kofta", name: "Lamb kofta, sumac onion", description: "Hand-minced lamb with parsley and onion, sumac onions and flatbread.", price: 2450, category: "mains", tags: ["SPICY"], chefsPick: false },
  { id: "charcoal-chicken", name: "Charcoal chicken, garlic toum", description: "Half chicken marinated in yoghurt and paprika, with whipped garlic sauce.", price: 2100, category: "mains", tags: ["GF"], chefsPick: false },
  { id: "tagliatelle", name: "Hand-cut tagliatelle, brown butter, sage", description: "Rolled and cut each morning, finished in brown butter with crisp sage.", price: 1850, category: "mains", tags: ["V"], chefsPick: false },
  { id: "freekeh-pilaf", name: "Freekeh pilaf, roasted squash, labneh", description: "Smoked green wheat with roasted squash, toasted almonds and labneh.", price: 1600, category: "mains", tags: ["V"], chefsPick: false },

  { id: "olive-oil-cake", name: "Olive oil cake, orange, crème fraîche", description: "Dense citrus cake baked with our own oil, served with cold crème fraîche.", price: 1100, category: "desserts", tags: ["V"], chefsPick: false },
  { id: "pistachio-baklava", name: "Pistachio baklava, clotted cream", description: "Layered filo, ground pistachio and orange blossom syrup with clotted cream.", price: 1250, category: "desserts", tags: ["V"], chefsPick: true },
  { id: "burnt-honey-ice-cream", name: "Burnt honey ice cream, sesame brittle", description: "Honey cooked until it darkens, churned the same day, with sesame brittle.", price: 900, category: "desserts", tags: ["V", "GF"], chefsPick: false },
  { id: "chocolate-tart", name: "Dark chocolate tart, olive oil, sea salt", description: "Thin pastry, bitter chocolate ganache, a thread of olive oil and sea salt.", price: 1050, category: "desserts", tags: ["V"], chefsPick: false },
  { id: "semolina-cake", name: "Semolina cake, orange syrup", description: "Warm semolina cake soaked in orange syrup, with a spoon of thick yoghurt.", price: 950, category: "desserts", tags: ["V"], chefsPick: false },

  { id: "mint-lemonade", name: "Mint lemonade", description: "Cold-pressed lemon, muddled mint and a little orange blossom water.", price: 450, category: "drinks", tags: ["VG", "GF"], chefsPick: false },
  { id: "pomegranate-spritz", name: "Pomegranate spritz", description: "Pomegranate molasses, soda and orange peel over ice.", price: 550, category: "drinks", tags: ["VG", "GF"], chefsPick: true },
  { id: "turkish-coffee", name: "Turkish coffee", description: "Finely ground coffee brewed on hot sand, served with Turkish delight.", price: 400, category: "drinks", tags: ["VG", "GF"], chefsPick: false },
  { id: "cardamom-tea", name: "Cardamom tea", description: "Black tea steeped with green cardamom pods and a slice of lemon.", price: 350, category: "drinks", tags: ["VG", "GF"], chefsPick: false },
  { id: "house-red", name: "House red, glass", description: "A dry, earthy red from the Bekaa Valley — ask for the bottle list.", price: 900, category: "drinks", tags: ["VG", "GF"], chefsPick: false }
];