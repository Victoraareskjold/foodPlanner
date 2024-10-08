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
    "and",
    "kalkun",
    "røkt kjøtt",
    "spekemat",
    "fårikål",
    "hjertekjøtt",
    "lever",
    "tunge",
  ],
  "🥛 Meieri": [
    "melk",
    "ost",
    "smør",
    "yoghurt",
    "fløte",
    "rømme",
    "egg",
    "kefir",
    "cottage cheese",
    "kremost",
    "parmesan",
    "mozarella",
    "gouda",
    "cheddar",
    "blue cheese",
    "camembert",
  ],
  "🥐 Bakevarer": [
    "brød",
    "muffins",
    "baguette",
    "pasta",
    "ris",
    "potet",
    "grøt",
    "knekkebrød",
    "loff",
    "toast",
    "scones",
    "croissant",
    "boller",
    "kringler",
    "ciabatta",
    "tortilla",
    "nanbrød",
  ],
  "🧂 Krydder": [
    "salt",
    "pepper",
    "paprika",
    "kanel",
    "koriander",
    "ingefær",
    "oregano",
    "basilikum",
    "timian",
    "rosmarin",
    "spisskummen",
    "karri",
    "muskat",
    "nellik",
    "chili",
    "hvitløkspulver",
    "løkpulver",
    "laurbærblad",
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
    "blomkål",
    "paprika",
    "squash",
    "aubergine",
    "mais",
    "erter",
    "spinat",
    "rødbeter",
    "selleri",
    "persille",
    "rosenkål",
  ],
  "🍏 Frukt": [
    "eple",
    "banan",
    "appelsin",
    "kiwi",
    "drue",
    "melon",
    "jordbær",
    "pære",
    "fersken",
    "nektarin",
    "plomme",
    "kirsebær",
    "ananas",
    "mango",
    "papaya",
    "granateple",
    "blåbær",
    "bringebær",
    "solbær",
  ],
  "🍝 Ferdigmat": [
    "pølse",
    "pizza",
    "lasagne",
    "taco",
    "burrito",
    "hamburger",
    "kebab",
    "pasta carbonara",
    "pasta bolognese",
    "ramen",
    "sushi",
    "wok",
    "nudler",
    "fiskekaker",
    "koldtbord",
  ],
  "🍲 Hermetikk": [
    "tomatsaus",
    "hermetiske grønnsaker",
    "bønner",
    "suppe",
    "hermetiske tomater",
    "tunfisk",
    "sardiner",
    "ansjos",
    "mais på boks",
    "erter på boks",
    "kokosmelk",
    "syltetøy",
    "honning",
    "peanøttsmør",
  ],
  "🍞 Brødvarer": [
    "brød",
    "rundstykke",
    "rundstykker",
    "baguette",
    "croissant",
    "pølsebrød",
    "knekkebrød",
    "loff",
    "bagels",
    "flatbrød",
    "lefse",
    "nanbrød",
    "pitabrød",
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
    "syltetøy",
    "peanøttsmør",
    "fiskepudding",
    "fiskekaker",
  ],
  "🧊 Frysevarer": [
    "frosne grønnsaker",
    "frossenpizza",
    "fiskepinner",
    "isenkrem",
    "frossen dessert",
    "frossen frukt",
    "frossen mat",
    "frossen kjøttdeig",
    "frossen fisk",
    "frossen kylling",
    "frossen bær",
  ],
  "🍫 Godteri": [
    "sjokolade",
    "godteripose",
    "godteri",
    "karameller",
    "lakris",
    "tyggegummi",
    "marshmallows",
    "pastiller",
    "drops",
    "lakriskonfekt",
  ],
  "🍾 Brus/Alkohol": [
    "cola",
    "brus",
    "øl",
    "vin",
    "cider",
    "energy drink",
    "sider",
    "mineralvann",
    "juice",
    "limonade",
    "smoothie",
    "kaffe",
    "te",
    "vodka",
    "whisky",
  ],
  "🌮 Tex-Mex": [
    "tortilla",
    "taco",
    "taco lefse",
    "taco-lefse",
    "tacolefse",
    "nachochips",
    "nachos",
    "tacokrydder",
    "jalapeños",
    "guacamole",
    "salsa",
    "tortillachips",
    "bønner",
    "quesadilla",
    "enchiladas",
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
