// @ts-nocheck
import heroBg from "@assets/hekayaty/hero-bg.jpg";
import charSaqr from "@assets/hekayaty/char-saqr.jpg";
import charNahr from "@assets/hekayaty/char-nahr.jpg";
import charDhayef from "@assets/hekayaty/char-dhayef.jpg";
import charNar from "@assets/hekayaty/char-nar.jpg";
import charSirius from "@assets/hekayaty/char-sirius.jpg";
import charWraith from "@assets/hekayaty/char-wraith.jpg";
import comic1 from "@assets/hekayaty/comic-1.jpg";
import comic2 from "@assets/hekayaty/comic-2.jpg";
import comic3 from "@assets/hekayaty/comic-3.jpg";
import worldDesert from "@assets/hekayaty/world-desert.jpg";
import worldCitadel from "@assets/hekayaty/world-citadel.jpg";
import worldSky from "@assets/hekayaty/world-sky.jpg";
import worldIron from "@assets/hekayaty/world-iron.jpg";

export const IMAGES: Record<string, string> = {
  'hero-bg.jpg': heroBg,
  'char-saqr.jpg': charSaqr,
  'char-nahr.jpg': charNahr,
  'char-dhayef.jpg': charDhayef,
  'char-nar.jpg': charNar,
  'char-sirius.jpg': charSirius,
  'char-wraith.jpg': charWraith,
  'comic-1.jpg': comic1,
  'comic-2.jpg': comic2,
  'comic-3.jpg': comic3,
  'world-desert.jpg': worldDesert,
  'world-citadel.jpg': worldCitadel,
  'world-sky.jpg': worldSky,
  'world-iron.jpg': worldIron,
};

export const getImageUrl = (key: string) => IMAGES[key] || '';
