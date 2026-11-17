export const ANIMATIONS = [
  { key: "dance", label: "Dance" },
  { key: "jump", label: "Jump" },
  { key: "spin", label: "Spin" },
  { key: "wave", label: "Wave" },
  { key: "bounce", label: "Bounce" },
];

export const POSITIONS = [
  { key: "bottom-left", label: "Bottom left" },
  { key: "bottom-right", label: "Bottom right" },
  { key: "center", label: "Center" },
  { key: "random", label: "Random safe spot" },
];

export const CHARACTERS = [
  {
    slug: "banana",
    name: "Disco Banana",
    tagline: "A banana with something to prove.",
    accent: "#FFC53D",
    animations: ["dance", "jump", "spin", "wave", "bounce"],
  },
  {
    slug: "chicken",
    name: "Funky Chicken",
    tagline: "No rhythm. All confidence.",
    accent: "#FFF3D6",
    animations: ["dance", "jump", "bounce", "wave"],
  },
  {
    slug: "robot",
    name: "Boogie Bot",
    tagline: "Factory calibrated for grooving.",
    accent: "#C9D2DC",
    animations: ["dance", "spin", "jump", "wave"],
  },
  {
    slug: "monster",
    name: "Silly Monster",
    tagline: "One eye. Zero shame.",
    accent: "#B69CFF",
    animations: ["bounce", "dance", "jump", "wave"],
  },
  {
    slug: "potato",
    name: "Dancing Potato",
    tagline: "Couch potato, stage legend.",
    accent: "#D9A15B",
    animations: ["dance", "bounce", "jump", "spin"],
  },
  {
    slug: "bibi",
    name: "Bibi",
    tagline: "Coalition talks, now with choreography.",
    accent: "#22262E",
    animations: ["dance", "wave", "bounce", "jump"],
    photo:
      "https://media.base44.com/images/public/6afc05b2e05cb78ddc781d5f/fb16bcd1b_bibi-portrait.jpg",
    music:
      "https://base44.app/api/apps/6afc05b2e05cb78ddc781d5f/files/mp/public/6afc05b2e05cb78ddc781d5f/4ddf3bb22_bibi-theme.mp3",
    credit: "Photo: Avi Ohayon, Government Press Office · CC BY-SA 3.0",
  },
];

export function characterBySlug(slug) {
  return CHARACTERS.find((c) => c.slug === slug) || CHARACTERS[0];
}

export function animationLabel(key) {
  return ANIMATIONS.find((a) => a.key === key)?.label || "Dance";
}

export function positionLabel(key) {
  return POSITIONS.find((p) => p.key === key)?.label || "Bottom right";
}