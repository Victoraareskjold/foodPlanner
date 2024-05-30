const categories = {
  "🥩 Kjøtt": [
    "kylling",
    "biff",
    "skinke",
    "kjøttdeig",
    "pølse",
    "svinekjøtt",
    "lam",
    "kyllingvinger",
  ],
  "🥛 Meieri": ["melk", "ost", "smør", "yoghurt", "fløte", "rømme", "egg"],
  "🥐 Bakevarer": [
    "brød",
    "muffins",
    "baguette",
    "pasta",
    "ris",
    "potet",
    "grøt",
  ],
  "🧂 Krydder": [
    "salt",
    "pepper",
    "paprika",
    "kanel",
    "koriander",
    "ingefær",
    "oregano",
  ],
  "🥕 Grønnsaker": [
    "gulrot",
    "brokkoli",
    "salat",
    "tomat",
    "agurk",
    "potet",
    "løk",
    "asparges",
  ],
  "🍏 Frukt": ["eple", "banan", "appelsin", "kiwi", "drue", "melon", "jordbær"],
  "🍝 Ferdigmat": [
    "pølse",
    "pizza",
    "lasagne",
    "taco",
    "burrito",
    "hamburger",
    "kebab",
  ],
  "🍲 Hermetikk": ["tomatsaus", "hermetiske grønnsaker", "bønner", "suppe"],
  "🍞 Brødvarer": [
    "brød",
    "rundstykke",
    "rundstykker",
    "baguette",
    "croissant",
    "pølsebrød",
    "knekkebrød",
    "loff",
  ],
  "🧀 Pålegg": [
    "skinke",
    "ost",
    "leverpostei",
    "makrell i tomat",
    "påleggssalami",
    "kyllingpålegg",
    "chilikreps",
    "siliana",
    "brunost",
  ],
  "🧊 Frysevarer": [
    "frosne grønnsaker",
    "frossenpizza",
    "fiskepinner",
    "isenkrem",
    "frossen dessert",
    "frossen frukt",
    "frossen mat",
  ],
  "🍫 Godteri": ["sjokolade", "godteripose", "godteri"],
  "🍾 Brus/Alkohol": [
    "cola",
    "brus",
    "øl",
    "vin",
    "cider",
    "energy drink",
    "sider",
  ],
  "🌮 Tex-Mex": [
    "tortilla",
    "taco",
    "nachochips",
    "nachos",
    "tacokrydder",
    "jalapeños",
    "guacamole",
    "salsa",
  ],
};

export const getCategoryForIngredient = (ingredient) => {
  const lowerCaseIngredient = ingredient.toLowerCase();
  for (const [category, ingredients] of Object.entries(categories)) {
    if (ingredients.includes(lowerCaseIngredient)) {
      return category;
    }
  }
  return "Annet";
};
