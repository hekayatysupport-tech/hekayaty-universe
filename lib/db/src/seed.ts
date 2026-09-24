/**
 * Hekayaty World — Database Seed Script
 * 
 * Populates the entire universe with realistic interconnected data.
 * Run: npx tsx src/seed.ts
 * 
 * Requires: DATABASE_URL environment variable
 */
import fs from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../../../artifacts/api-server/.env");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...valParts] = trimmed.split("=");
      const val = valParts.join("=").trim();
      if (key && val && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set to run the seed script.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌍 Seeding Hekayaty World universe...\n");

  // ========================================================================
  // 1. MEDIA (Cloudinary placeholder entries)
  // ========================================================================
  console.log("📷 Seeding media...");
  const [mediaTarek] = await db.insert(schema.media).values({
    publicId: "hekayaty/characters/tarek_portrait",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/tarek_portrait.jpg",
    category: "portrait", altText: "طارق - وارث النور",
  }).returning();

  const [mediaKamos] = await db.insert(schema.media).values({
    publicId: "hekayaty/characters/kamos_portrait",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/kamos_portrait.jpg",
    category: "portrait", altText: "كاموس - حارس البوابة",
  }).returning();

  const [mediaLayan] = await db.insert(schema.media).values({
    publicId: "hekayaty/characters/layan_portrait",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/layan_portrait.jpg",
    category: "portrait", altText: "ليان - صاحبة الرؤى",
  }).returning();

  const [mediaRa] = await db.insert(schema.media).values({
    publicId: "hekayaty/characters/ra_portrait",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/ra_portrait.jpg",
    category: "portrait", altText: "رع - إله الشمس",
  }).returning();

  const [mediaAnubis] = await db.insert(schema.media).values({
    publicId: "hekayaty/characters/anubis_portrait",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/anubis_portrait.jpg",
    category: "portrait", altText: "أنوبيس - حارس الموتى",
  }).returning();

  const [mediaSet] = await db.insert(schema.media).values({
    publicId: "hekayaty/characters/set_portrait",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/set_portrait.jpg",
    category: "portrait", altText: "ست - إله الفوضى",
  }).returning();

  const [mediaHorus] = await db.insert(schema.media).values({
    publicId: "hekayaty/characters/horus_portrait",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/horus_portrait.jpg",
    category: "portrait", altText: "حورس - عين السماء",
  }).returning();

  const [mediaLaylAlZaman] = await db.insert(schema.media).values({
    publicId: "hekayaty/characters/layl_al_zaman_portrait",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/layl_al_zaman_portrait.jpg",
    category: "portrait", altText: "لايل الزمن - سيد الظلال",
  }).returning();

  // World / Comic covers
  const [mediaWorldEgypt] = await db.insert(schema.media).values({
    publicId: "hekayaty/worlds/egypt_cover",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/worlds/egypt_cover.jpg",
    category: "cover", altText: "العالم المصري القديم",
  }).returning();

  const [mediaWorldGates] = await db.insert(schema.media).values({
    publicId: "hekayaty/worlds/gates_cover",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/worlds/gates_cover.jpg",
    category: "cover", altText: "عالم البوابات",
  }).returning();

  const [mediaWorldShadow] = await db.insert(schema.media).values({
    publicId: "hekayaty/worlds/shadow_cover",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/worlds/shadow_cover.jpg",
    category: "cover", altText: "عالم الظلال",
  }).returning();

  const [mediaSeriesTravelers] = await db.insert(schema.media).values({
    publicId: "hekayaty/comics/travelers_cover",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/comics/travelers_cover.jpg",
    category: "cover", altText: "العابرون",
  }).returning();

  const [mediaSeriesFallOfRa] = await db.insert(schema.media).values({
    publicId: "hekayaty/comics/fall_of_ra_cover",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/comics/fall_of_ra_cover.jpg",
    category: "cover", altText: "سقوط رع",
  }).returning();

  const [mediaSeriesWarOfStones] = await db.insert(schema.media).values({
    publicId: "hekayaty/comics/war_of_stones_cover",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/comics/war_of_stones_cover.jpg",
    category: "cover", altText: "حرب الأحجار",
  }).returning();

  // Gallery images
  const [mediaGallery1] = await db.insert(schema.media).values({
    publicId: "hekayaty/gallery/tarek_battle",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/gallery/tarek_battle.jpg",
    category: "landscape", altText: "طارق في المعركة",
  }).returning();

  const [mediaGallery2] = await db.insert(schema.media).values({
    publicId: "hekayaty/gallery/temple_of_ra",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/gallery/temple_of_ra.jpg",
    category: "landscape", altText: "معبد رع",
  }).returning();

  // Encyclopedia covers
  const [mediaSwordOfLight] = await db.insert(schema.media).values({
    publicId: "hekayaty/encyclopedia/sword_of_light",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/encyclopedia/sword_of_light.jpg",
    category: "icon", altText: "سيف النور",
  }).returning();

  const [mediaEyeOfRa] = await db.insert(schema.media).values({
    publicId: "hekayaty/encyclopedia/eye_of_ra",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/encyclopedia/eye_of_ra.jpg",
    category: "icon", altText: "عين رع",
  }).returning();

  // ========================================================================
  // 2. CHARACTERS
  // ========================================================================
  console.log("🦸 Seeding characters...");
  const [charTarek] = await db.insert(schema.characters).values({
    name: "Tarek", arabicName: "طارق", alias: "Al-Saqr", title: "وارث النور\nHEIR OF LIGHT",
    quote: "النور لا يُمنح... بل يُكتسب",
    alignment: "Hero", characterStatus: "Active", status: "published", powerCategory: "Enhanced Combat",
    organization: "The Sky Vanguard",
    shortBio: "شاب من قرية أطير يحمل قدراً عظيماً.",
    fullBio: "طارق، شاب نشأ في قرية أطير النائية يحمل قلباً نقياً وروحاً لا تعرف الخوف. منذ طفولته وهو يرى نوراً خفياً في أحلامه، حاملاً رسالة عن عالم مجهول وسرّ ينتظره.",
    aboutText: "طارق، شاب نشأ في قرية أطير النائية يحمل قلباً نقياً وروحاً لا تعرف الخوف. منذ طفولته وهو يرى نوراً خفياً في ليلة... حاملاً عن عالم مجهول... سر ينتظره.\n\nلم يكن يعلم أن هذا الحلم هو جزء من قدره. ولم يكن يدري أن النور الذي يبحث عنه... يسكنه هو.",
    portraitMediaId: mediaTarek.id,
  }).returning();

  const [charKamos] = await db.insert(schema.characters).values({
    name: "Kamos", arabicName: "كاموس", alias: "حارس البوابة", title: "حارس البوابات",
    quote: "البوابات لا تُفتح إلا لمن يستحق",
    alignment: "Antihero", characterStatus: "Active", status: "published", powerCategory: "Dimensional Magic",
    organization: "حراس البوابات",
    shortBio: "حارس البوابات الأسطوري الذي يقف بين العوالم.",
    fullBio: "كاموس هو آخر حراس البوابات القدامى، يقف وحيداً بين العوالم يمنع أي كائن من العبور دون إذنه. قوته مستمدة من الفراغ بين الأبعاد.",
    aboutText: "كاموس هو آخر حراس البوابات القدامى. يقف وحيداً بين العوالم.",
    portraitMediaId: mediaKamos.id,
  }).returning();

  const [charLayan] = await db.insert(schema.characters).values({
    name: "Layan", arabicName: "ليان", alias: "صاحبة الرؤى", title: "صاحبة الرؤى",
    quote: "أرى ما لا ترونه... وأسمع ما لا تسمعونه",
    alignment: "Hero", characterStatus: "Active", status: "published", powerCategory: "Divination",
    organization: "مجلس الحكماء",
    shortBio: "فتاة تمتلك قدرة رؤية المستقبل والماضي.",
    fullBio: "ليان ولدت بعين ثالثة مخفية تمنحها القدرة على رؤية خيوط الزمن. تحمل عبء المعرفة وحيدة.",
    aboutText: "ليان ولدت بعين ثالثة مخفية تمنحها القدرة على رؤية خيوط الزمن.",
    portraitMediaId: mediaLayan.id,
  }).returning();

  const [charLaylAlZaman] = await db.insert(schema.characters).values({
    name: "Layl al-Zaman", arabicName: "لايل الزمن", alias: "سيد الظلال", title: "سيد الظلال الأبدية",
    quote: "الظلام ليس شراً... بل هو الحقيقة التي يخشاها النور",
    alignment: "Villain", characterStatus: "Active", status: "published", powerCategory: "Shadow Magic",
    organization: "محفل الظلال",
    shortBio: "عدو طارق اللدود وسيد الظلال الأبدية.",
    fullBio: "لايل الزمن كان يوماً حارساً للنور، لكنه سقط في هاوية الظلام بعد أن اكتشف أن النور الذي كان يحميه ليس سوى وهم.",
    aboutText: "لايل الزمن كان يوماً حارساً للنور، لكنه سقط في هاوية الظلام.",
    portraitMediaId: mediaLaylAlZaman.id,
  }).returning();

  const [charRa] = await db.insert(schema.characters).values({
    name: "Ra", arabicName: "رع", alias: "إله الشمس", title: "ملك الآلهة",
    quote: "أنا النور الأول والأخير",
    alignment: "Neutral", characterStatus: "Unknown", status: "published", powerCategory: "Cosmic Power",
    organization: "مجمع الآلهة",
    shortBio: "إله الشمس القديم، مصدر كل نور في الكون.",
    fullBio: "رع هو الإله الأعلى في البانثيون المصري القديم. قوته لا حدود لها لكنه اختفى في ظروف غامضة.",
    aboutText: "رع هو الإله الأعلى، مصدر كل نور.",
    portraitMediaId: mediaRa.id,
  }).returning();

  const [charAnubis] = await db.insert(schema.characters).values({
    name: "Anubis", arabicName: "أنوبيس", alias: "حارس الموتى", title: "سيد العالم السفلي",
    quote: "الموت ليس نهاية... بل بوابة",
    alignment: "Neutral", characterStatus: "Active", status: "published", powerCategory: "Death Magic",
    organization: "محكمة الموتى",
    shortBio: "حارس العالم السفلي وميزان الأرواح.",
    fullBio: "أنوبيس يقف على حدود الحياة والموت، يزن قلوب البشر ويحكم على أرواحهم.",
    aboutText: "أنوبيس يقف على حدود الحياة والموت.",
    portraitMediaId: mediaAnubis.id,
  }).returning();

  const [charSet] = await db.insert(schema.characters).values({
    name: "Set", arabicName: "ست", alias: "إله الفوضى", title: "سيد العواصف",
    quote: "النظام وهم... الفوضى هي الحقيقة الوحيدة",
    alignment: "Villain", characterStatus: "Active", status: "published", powerCategory: "Chaos Magic",
    organization: "جيش الفوضى",
    shortBio: "إله الفوضى والعواصف، عدو حورس الأزلي.",
    fullBio: "ست هو التجسيد الحي للفوضى. يسعى لتدمير كل نظام وإعادة الكون إلى العدم الأول.",
    aboutText: "ست هو التجسيد الحي للفوضى.",
    portraitMediaId: mediaSet.id,
  }).returning();

  const [charHorus] = await db.insert(schema.characters).values({
    name: "Horus", arabicName: "حورس", alias: "عين السماء", title: "الصقر الإلهي",
    quote: "عيني ترى كل شيء... حتى ما يختبئ في الظلام",
    alignment: "Hero", characterStatus: "Active", status: "published", powerCategory: "Divine Combat",
    organization: "حراس النور",
    shortBio: "ابن أوزيريس وإيزيس، المحارب الإلهي.",
    fullBio: "حورس هو ابن أوزيريس وإيزيس، ولد ليثأر لأبيه من عمه ست. يمتلك عين السماء التي ترى كل شيء.",
    aboutText: "حورس هو ابن أوزيريس وإيزيس.",
    portraitMediaId: mediaHorus.id,
  }).returning();

  // Character Stats
  console.log("📊 Seeding character stats...");
  await db.insert(schema.characterStats).values([
    { characterId: charTarek.id, strength: 95, speed: 88, intelligence: 92, wisdom: 97, willpower: 100, magic: 93 },
    { characterId: charKamos.id, strength: 70, speed: 95, intelligence: 88, wisdom: 85, willpower: 90, magic: 98 },
    { characterId: charLayan.id, strength: 30, speed: 60, intelligence: 100, wisdom: 98, willpower: 85, magic: 92 },
    { characterId: charLaylAlZaman.id, strength: 85, speed: 90, intelligence: 95, wisdom: 80, willpower: 100, magic: 100 },
    { characterId: charRa.id, strength: 100, speed: 100, intelligence: 100, wisdom: 100, willpower: 100, magic: 100 },
    { characterId: charAnubis.id, strength: 80, speed: 75, intelligence: 90, wisdom: 95, willpower: 95, magic: 98 },
    { characterId: charSet.id, strength: 95, speed: 85, intelligence: 80, wisdom: 60, willpower: 98, magic: 95 },
    { characterId: charHorus.id, strength: 92, speed: 95, intelligence: 88, wisdom: 90, willpower: 96, magic: 94 },
  ]);

  // Character Abilities
  console.log("⚔️ Seeding abilities...");
  await db.insert(schema.characterAbilities).values([
    { characterId: charTarek.id, name: "إسقاط النور", description: "يطلق شعاعاً من الطاقة الشمسية المركزة" },
    { characterId: charTarek.id, name: "الطيران", description: "القدرة على التحليق بسرعة فائقة" },
    { characterId: charTarek.id, name: "القتال اليدوي المتقدم", description: "إتقان فنون القتال القديمة" },
    { characterId: charTarek.id, name: "الدرع الشمسي", description: "حقل طاقة يحمي من الهجمات" },
    { characterId: charKamos.id, name: "فتح البوابات", description: "القدرة على فتح بوابات بين الأبعاد" },
    { characterId: charKamos.id, name: "المشي بين العوالم", description: "التنقل الفوري عبر الأبعاد" },
    { characterId: charLayan.id, name: "الرؤية", description: "رؤية المستقبل والماضي" },
    { characterId: charLayan.id, name: "القراءة الذهنية", description: "قراءة أفكار الآخرين" },
    { characterId: charLaylAlZaman.id, name: "التحكم بالظلال", description: "تشكيل الظلام كسلاح" },
    { characterId: charLaylAlZaman.id, name: "الاختفاء التام", description: "الذوبان في الظلام بشكل كامل" },
    { characterId: charRa.id, name: "الشمس الخالدة", description: "التحكم الكامل بطاقة الشمس" },
    { characterId: charAnubis.id, name: "ميزان الأرواح", description: "وزن قلوب الموتى والحكم عليها" },
    { characterId: charSet.id, name: "عاصفة الفوضى", description: "إطلاق عواصف مدمرة" },
    { characterId: charHorus.id, name: "عين حورس", description: "الرؤية الكاملة لكل شيء" },
    { characterId: charHorus.id, name: "رمح السماء", description: "سلاح إلهي من نور خالص" },
  ]);

  // Character Relationships
  console.log("🤝 Seeding relationships...");
  await db.insert(schema.characterRelationships).values([
    { characterAId: charTarek.id, characterBId: charLayan.id, relationType: "Ally", description: "حليفة وصديقة مقربة" },
    { characterAId: charTarek.id, characterBId: charKamos.id, relationType: "Mentor", description: "المرشد والمعلم" },
    { characterAId: charTarek.id, characterBId: charLaylAlZaman.id, relationType: "Enemy", description: "العدو اللدود" },
    { characterAId: charHorus.id, characterBId: charSet.id, relationType: "Enemy", description: "الصراع الأزلي" },
    { characterAId: charRa.id, characterBId: charAnubis.id, relationType: "Ally", description: "حليف في مجمع الآلهة" },
    { characterAId: charRa.id, characterBId: charHorus.id, relationType: "Family", description: "الجد الأعلى" },
    { characterAId: charKamos.id, characterBId: charAnubis.id, relationType: "Rival", description: "تنافس على حراسة البوابات" },
  ]);

  // ========================================================================
  // 3. WORLDS, REGIONS, LOCATIONS
  // ========================================================================
  console.log("🌍 Seeding worlds...");
  const [worldEgypt] = await db.insert(schema.worlds).values({
    name: "Ancient Egyptian Realm", arabicName: "العالم المصري القديم",
    description: "عالم الآلهة والفراعنة، حيث يلتقي الماضي بالحاضر وتتنفس الحجارة أسرار الخلود.",
    coverMediaId: mediaWorldEgypt.id,
  }).returning();

  const [worldGates] = await db.insert(schema.worlds).values({
    name: "Realm of Gates", arabicName: "عالم البوابات",
    description: "فراغ لا نهائي بين الأبعاد، تطفو فيه بوابات تقود إلى كل عالم يمكن تخيله.",
    coverMediaId: mediaWorldGates.id,
  }).returning();

  const [worldShadow] = await db.insert(schema.worlds).values({
    name: "Shadow Realm", arabicName: "عالم الظلال",
    description: "عالم موازٍ مصنوع بالكامل من ظلام حي، يتنفس ويتحرك وله إرادة خاصة.",
    coverMediaId: mediaWorldShadow.id,
  }).returning();

  // Regions
  console.log("🗺️ Seeding regions...");
  const [regionNile] = await db.insert(schema.regions).values({
    worldId: worldEgypt.id, name: "Nile Valley", arabicName: "وادي النيل",
    description: "المنطقة الخصبة حول نهر النيل المقدس.",
  }).returning();

  const [regionDesert] = await db.insert(schema.regions).values({
    worldId: worldEgypt.id, name: "Western Desert", arabicName: "الصحراء الغربية",
    description: "صحراء شاسعة تخفي أسراراً قديمة.",
  }).returning();

  // Locations
  console.log("📍 Seeding locations...");
  await db.insert(schema.locations).values([
    { regionId: regionNile.id, name: "معبد رع", arabicName: "معبد رع", locationType: "Temple", description: "المعبد الرئيسي لإله الشمس." },
    { regionId: regionNile.id, name: "الهرم الأكبر", arabicName: "الهرم الأكبر", locationType: "Ruins", description: "أعظم بناء شيده الفراعنة." },
    { regionId: regionNile.id, name: "مدينة طيبة", arabicName: "مدينة طيبة", locationType: "City", description: "عاصمة الفراعنة العظام." },
    { regionId: regionDesert.id, name: "مقابر الفراعنة", arabicName: "مقابر الفراعنة", locationType: "Ruins", description: "مقابر مخفية تحرسها لعنات قديمة." },
  ]);

  // Character-World junctions
  await db.insert(schema.characterWorlds).values([
    { characterId: charTarek.id, worldId: worldEgypt.id, relationship: "Origin" },
    { characterId: charKamos.id, worldId: worldGates.id, relationship: "Residence" },
    { characterId: charLaylAlZaman.id, worldId: worldShadow.id, relationship: "Residence" },
    { characterId: charRa.id, worldId: worldEgypt.id, relationship: "Origin" },
    { characterId: charAnubis.id, worldId: worldEgypt.id, relationship: "Origin" },
    { characterId: charSet.id, worldId: worldEgypt.id, relationship: "Origin" },
    { characterId: charHorus.id, worldId: worldEgypt.id, relationship: "Origin" },
  ]);

  // ========================================================================
  // 4. COMICS
  // ========================================================================
  console.log("📚 Seeding comics...");
  const [seriesTravelers] = await db.insert(schema.comicSeries).values({
    title: "العابرون", arabicTitle: "العابرون",
    description: "السلسلة الرئيسية التي تتبع رحلة طارق عبر العوالم.",
    status: "Ongoing", coverMediaId: mediaSeriesTravelers.id,
  }).returning();

  const [seriesFallOfRa] = await db.insert(schema.comicSeries).values({
    title: "سقوط رع", arabicTitle: "سقوط رع",
    description: "قصة سقوط إله الشمس واختفائه الغامض.",
    status: "Completed", coverMediaId: mediaSeriesFallOfRa.id,
  }).returning();

  const [seriesWarOfStones] = await db.insert(schema.comicSeries).values({
    title: "حرب الأحجار", arabicTitle: "حرب الأحجار",
    description: "حرب ملحمية على أحجار القوة القديمة.",
    status: "Upcoming", coverMediaId: mediaSeriesWarOfStones.id,
  }).returning();

  // Story Arcs
  const [arcAwakening] = await db.insert(schema.storyArcs).values({
    name: "الصحوة", arabicName: "الصحوة",
    description: "القوس الأول: اكتشاف طارق لقدراته.", sortOrder: 1,
  }).returning();

  const [arcGateCrisis] = await db.insert(schema.storyArcs).values({
    name: "أزمة البوابات", arabicName: "أزمة البوابات",
    description: "القوس الثاني: انهيار البوابات بين العوالم.", sortOrder: 2,
  }).returning();

  // Issues with global reading order
  const [issueTr1] = await db.insert(schema.comicIssues).values({
    seriesId: seriesTravelers.id, issueNumber: 1, title: "العابرون #1",
    arabicTitle: "بداية الرحلة", description: "طارق يكتشف قدرته على العبور بين العوالم.",
    releaseDate: "2024-01-15", readingOrderGlobal: 1, coverMediaId: mediaSeriesTravelers.id,
  }).returning();

  const [issueTr2] = await db.insert(schema.comicIssues).values({
    seriesId: seriesTravelers.id, issueNumber: 2, title: "العابرون #2",
    arabicTitle: "حارس البوابة", description: "طارق يلتقي كاموس للمرة الأولى.",
    releaseDate: "2024-02-15", readingOrderGlobal: 2, coverMediaId: mediaSeriesTravelers.id,
  }).returning();

  const [issueFR1] = await db.insert(schema.comicIssues).values({
    seriesId: seriesFallOfRa.id, issueNumber: 1, title: "سقوط رع",
    arabicTitle: "الفصل الأخير", description: "القصة الكاملة لسقوط إله الشمس.",
    releaseDate: "2024-03-01", readingOrderGlobal: 3, coverMediaId: mediaSeriesFallOfRa.id,
  }).returning();

  const [issueWS1] = await db.insert(schema.comicIssues).values({
    seriesId: seriesWarOfStones.id, issueNumber: 1, title: "حرب الأحجار #1",
    arabicTitle: "الحجر الأول", description: "اكتشاف الحجر الأول وبداية الحرب.",
    releaseDate: "2024-06-01", readingOrderGlobal: 4, coverMediaId: mediaSeriesWarOfStones.id,
  }).returning();

  // Issue-Arc junctions
  await db.insert(schema.issueArcs).values([
    { issueId: issueTr1.id, arcId: arcAwakening.id },
    { issueId: issueTr2.id, arcId: arcAwakening.id },
    { issueId: issueFR1.id, arcId: arcGateCrisis.id },
  ]);

  // Character appearances in comics
  await db.insert(schema.characterAppearances).values([
    { characterId: charTarek.id, issueId: issueTr1.id, role: "Main" },
    { characterId: charTarek.id, issueId: issueTr2.id, role: "Main" },
    { characterId: charKamos.id, issueId: issueTr2.id, role: "Main" },
    { characterId: charLayan.id, issueId: issueTr1.id, role: "Supporting" },
    { characterId: charRa.id, issueId: issueFR1.id, role: "Main" },
    { characterId: charAnubis.id, issueId: issueFR1.id, role: "Supporting" },
    { characterId: charTarek.id, issueId: issueWS1.id, role: "Main" },
    { characterId: charLaylAlZaman.id, issueId: issueWS1.id, role: "Main" },
  ]);

  // Character Gallery
  await db.insert(schema.characterGallery).values([
    { characterId: charTarek.id, mediaId: mediaGallery1.id, sortOrder: 1 },
    { characterId: charTarek.id, mediaId: mediaGallery2.id, sortOrder: 2 },
  ]);

  // ========================================================================
  // 5. ENCYCLOPEDIA
  // ========================================================================
  console.log("📖 Seeding encyclopedia...");
  const [entrySwordOfLight] = await db.insert(schema.encyclopediaEntries).values({
    title: "سيف النور", arabicTitle: "سيف النور",
    category: "Artifact",
    content: "سيف أسطوري مصنوع من نور خالص، يُقال إنه صُنع من أول شعاع شمس سقط على الأرض. لا يمكن حمله إلا من قلب نقي.",
    coverMediaId: mediaSwordOfLight.id,
  }).returning();

  const [entryEyeOfRa] = await db.insert(schema.encyclopediaEntries).values({
    title: "عين رع", arabicTitle: "عين رع",
    category: "Artifact",
    content: "عين رع هي مصدر قوة إله الشمس. يُقال إنها تستطيع حرق أي شيء تنظر إليه.",
    coverMediaId: mediaEyeOfRa.id,
  }).returning();

  const [entryGateKeepers] = await db.insert(schema.encyclopediaEntries).values({
    title: "حراس البوابات", arabicTitle: "حراس البوابات",
    category: "Faction",
    content: "تنظيم قديم مسؤول عن حماية البوابات بين العوالم. أعضاؤه يمتلكون قدرة فريدة على التنقل بين الأبعاد.",
  }).returning();

  const [entryShadowMagic] = await db.insert(schema.encyclopediaEntries).values({
    title: "سحر الظلال", arabicTitle: "سحر الظلال",
    category: "MagicSystem",
    content: "نظام سحري قديم يعتمد على التحكم في الظلام والظلال. يمنح مستخدمه القدرة على الاختفاء والتشكل.",
  }).returning();

  // Encyclopedia junctions
  await db.insert(schema.encyclopediaCharacters).values([
    { entryId: entrySwordOfLight.id, characterId: charTarek.id },
    { entryId: entryEyeOfRa.id, characterId: charRa.id },
    { entryId: entryGateKeepers.id, characterId: charKamos.id },
    { entryId: entryShadowMagic.id, characterId: charLaylAlZaman.id },
  ]);

  await db.insert(schema.encyclopediaWorlds).values([
    { entryId: entryGateKeepers.id, worldId: worldGates.id },
    { entryId: entryShadowMagic.id, worldId: worldShadow.id },
  ]);

  // Character Artifacts
  await db.insert(schema.characterArtifacts).values([
    { characterId: charTarek.id, entryId: entrySwordOfLight.id },
    { characterId: charRa.id, entryId: entryEyeOfRa.id },
  ]);

  // ========================================================================
  // 6. TIMELINE
  // ========================================================================
  console.log("⏳ Seeding timeline...");
  const [eraCosmicAge] = await db.insert(schema.timelineEras).values({
    name: "Cosmic Age", arabicName: "العصر الكوني",
    description: "بداية الكون وميلاد الآلهة.", orderIndex: 1,
  }).returning();

  const [eraAncient] = await db.insert(schema.timelineEras).values({
    name: "Ancient Egyptian Era", arabicName: "العصر المصري القديم",
    description: "عصر الفراعنة والآلهة.", orderIndex: 2,
  }).returning();

  const [eraSundering] = await db.insert(schema.timelineEras).values({
    name: "The Great Sundering", arabicName: "الانشقاق العظيم",
    description: "انهيار الحدود بين العوالم.", orderIndex: 3,
  }).returning();

  const [eraGates] = await db.insert(schema.timelineEras).values({
    name: "Age of the Gates", arabicName: "عصر البوابات",
    description: "اكتشاف البوابات بين العوالم.", orderIndex: 4,
  }).returning();

  const [eraTravelers] = await db.insert(schema.timelineEras).values({
    name: "Rise of the Travelers", arabicName: "صعود العابرين",
    description: "ظهور طارق وبداية عصر جديد.", orderIndex: 5,
  }).returning();

  const [event1] = await db.insert(schema.timelineEvents).values({
    eraId: eraCosmicAge.id, yearLabel: "قبل الزمن المعروف", title: "ميلاد رع",
    arabicTitle: "ميلاد رع", subtitle: "ظهور إله الشمس من العدم.",
    orderIndex: 1,
  }).returning();

  const [event2] = await db.insert(schema.timelineEvents).values({
    eraId: eraAncient.id, yearLabel: "العام 0", title: "تأسيس مملكة مصر",
    arabicTitle: "تأسيس مملكة مصر", subtitle: "رع ينزل إلى الأرض ويؤسس حضارة الفراعنة.",
    orderIndex: 2,
  }).returning();

  const [event3] = await db.insert(schema.timelineEvents).values({
    eraId: eraSundering.id, yearLabel: "العام 450", title: "الانشقاق العظيم",
    arabicTitle: "الانشقاق العظيم", subtitle: "الحدود بين العوالم تنهار.",
    orderIndex: 3,
  }).returning();

  const [event4] = await db.insert(schema.timelineEvents).values({
    eraId: eraGates.id, yearLabel: "العام 1200", title: "اكتشاف البوابات",
    arabicTitle: "اكتشاف البوابات", subtitle: "كاموس يكتشف أول بوابة بين العوالم.",
    orderIndex: 4,
  }).returning();

  const [event5] = await db.insert(schema.timelineEvents).values({
    eraId: eraTravelers.id, yearLabel: "العام 1540", title: "ظهور طارق",
    arabicTitle: "ظهور طارق", subtitle: "طارق يُولد في قرية أطير وبداية النبوءة.",
    orderIndex: 5,
  }).returning();

  // Timeline junctions
  await db.insert(schema.timelineEventCharacters).values([
    { eventId: event1.id, characterId: charRa.id },
    { eventId: event2.id, characterId: charRa.id },
    { eventId: event3.id, characterId: charSet.id },
    { eventId: event4.id, characterId: charKamos.id },
    { eventId: event5.id, characterId: charTarek.id },
  ]);

  await db.insert(schema.timelineEventWorlds).values([
    { eventId: event1.id, worldId: worldEgypt.id },
    { eventId: event3.id, worldId: worldGates.id },
    { eventId: event3.id, worldId: worldShadow.id },
    { eventId: event4.id, worldId: worldGates.id },
  ]);

  // ========================================================================
  // 7. NEWS
  // ========================================================================
  console.log("📰 Seeding news...");
  await db.insert(schema.news).values([
    {
      title: "إطلاق العابرون #1 رسمياً", arabicTitle: "إطلاق العابرون #1 رسمياً",
      slug: "travelers-1-launch", category: "Release",
      content: "تم إطلاق العدد الأول من سلسلة العابرون رسمياً! تابعوا رحلة طارق الملحمية.",
      excerpt: "العدد الأول من السلسلة الرئيسية متاح الآن.",
      coverMediaId: mediaSeriesTravelers.id,
    },
    {
      title: "الإعلان عن حرب الأحجار", arabicTitle: "الإعلان عن حرب الأحجار",
      slug: "war-of-stones-announced", category: "Announcement",
      content: "سلسلة جديدة قادمة: حرب الأحجار! أكبر حدث في تاريخ عوالم حكاياتي.",
      excerpt: "سلسلة جديدة ملحمية قادمة قريباً.",
      coverMediaId: mediaSeriesWarOfStones.id,
    },
  ]);

  // ========================================================================
  // 8. HEKAYATY ORIGINALS & SUBSCRIPTION DATA
  // ========================================================================
  console.log("🔥 Seeding Hekayaty Originals...");
  const [genreFantasy] = await db.insert(schema.genres).values({
    name: "Epic Fantasy", arabicName: "فانتازيا ملحمية", slug: "epic-fantasy", description: "عوالـم خيالية ملحمية وصراعات قوى قديمة",
  }).returning();

  const [genreMultiverse] = await db.insert(schema.genres).values({
    name: "Multiverse", arabicName: "تعدد العوالم", slug: "multiverse", description: "رحلات عبر الأبعاد والبوابات النجمية",
  }).returning();

  const [genreMythology] = await db.insert(schema.genres).values({
    name: "Mythology", arabicName: "أساطير قديمة", slug: "mythology", description: "قصص مستوحاة من الحضارات القديمة والآلهة",
  }).returning();

  // Flagship IP: The Crossers / العابرون
  const [originalCrossers] = await db.insert(schema.originals).values({
    title: "The Crossers",
    arabicTitle: "العابرون",
    slug: "the-crossers",
    tagline: "النور لا يُمنح... بل يُكتسب عبر البوابات الأبدية",
    description: "In a multiverse on the brink of collapse, Tarek discovers his destiny as the Heir of Light.",
    arabicDescription: "في كون متعدد الأبعاد يوشك على الانهيار، يكتشف طارق قدره المحتوم كوارث للنور الشمسي القديم. رحلة ملحمية عبر بوابات العوالم للوصول إلى الحقيقة الخفية.",
    contentType: "story",
    accessLevel: "subscriber",
    status: "published",
    isFeatured: true,
    isTrending: true,
    isNew: true,
    creatorName: "Hekayaty Originals Studios",
    coverMediaId: mediaSeriesTravelers.id,
    bannerMediaId: mediaWorldGates.id,
    releaseDate: new Date("2024-01-01T00:00:00Z"),
  }).returning();

  // Story Series
  const [storyCrossers] = await db.insert(schema.stories).values({
    originalId: originalCrossers.id,
    title: "Chronicles of the Crossers",
    arabicTitle: "سيرة العابرين — حكايات البوابة الأولى",
    synopsis: "الرواية الكاملة لرحلة طارق وكاموس عبر البوابات الأبدية.",
    authorName: "فريق حكاياتي",
    coverMediaId: mediaSeriesTravelers.id,
  }).returning();

  // Chapters
  await db.insert(schema.storyChapters).values([
    {
      storyId: storyCrossers.id,
      chapterNumber: 1,
      title: "Chapter 1: The Spark of Oteer",
      arabicTitle: "الفصل الأول: شرارة قرية أطير",
      content: "<p>كانت قرية أطير هادئة في الصباح الباكر، لكن طارق كان يشعر برعشة في أعماق قلبه...</p>",
      arabicContent: "كانت قرية أطير هادئة في الصباح الباكر، لكن طارق كان يشعر برعشة في أعماق قلبه. النور الشمسي الذي ينبعث من كفيه لم يكن مجرد وهم، بل سر قديم يستيقظ بعد آلاف السنين من النوم العميق.",
      readTimeMinutes: 8,
      accessLevel: "public",
      status: "published",
      sortOrder: 1,
    },
    {
      storyId: storyCrossers.id,
      chapterNumber: 2,
      title: "Chapter 2: Gate of the Void",
      arabicTitle: "الفصل الثاني: بوابة الفراغ الأبدي",
      content: "<p>عندما وقف طارق أمام البوابة الأولى، ظهر كاموس كظلال تتشكل من الفراغ...</p>",
      arabicContent: "عندما وقف طارق أمام البوابة الأولى، ظهر كاموس كظلال تتشكل من الفراغ. حارس البوابات لا يبتسم أبداً، وصوته كان كصدى العصور القديمة: 'من يعبر هذه البوابة لا يعود كما كان.'",
      readTimeMinutes: 12,
      accessLevel: "free_preview",
      status: "published",
      sortOrder: 2,
    },
    {
      storyId: storyCrossers.id,
      chapterNumber: 3,
      title: "Chapter 3: The Shadow King Awakens",
      arabicTitle: "الفصل الثالث: صحوة ملك الظلال",
      content: "<p>في أعماق عالم الظلال، يستيقظ لايل الزمن ليعيد كتابة القدر...</p>",
      arabicContent: "في أعماق عالم الظلال، استيقظ لايل الزمن من عرشه الأسود. عين النور التي يحملها طارق هي المفتاح الوحيد لكسر الأغلال الأبدية التي قيدت سحر الظلال لعصور طويلة.",
      readTimeMinutes: 15,
      accessLevel: "subscriber",
      status: "published",
      sortOrder: 3,
    },
  ]);

  // Episodes
  await db.insert(schema.episodes).values([
    {
      originalId: originalCrossers.id,
      seasonNumber: 1,
      episodeNumber: 1,
      title: "Episode 1: The Call of the Sun",
      arabicTitle: "الحلقة 1: نداء الشمس القديمة",
      description: "الحلقة الأولى الشارحة لأصل طارق وقدراته الشمسية.",
      durationMinutes: 24,
      accessLevel: "public",
      status: "published",
      thumbnailMediaId: mediaSeriesTravelers.id,
    },
    {
      originalId: originalCrossers.id,
      seasonNumber: 1,
      episodeNumber: 2,
      title: "Episode 2: Guardians of the Threshold",
      arabicTitle: "الحلقة 2: حراس العتبة المقّدسة",
      description: "صراع طارق وحراس البوابات بين الأبعاد.",
      durationMinutes: 28,
      accessLevel: "subscriber",
      status: "published",
      thumbnailMediaId: mediaWorldGates.id,
    },
  ]);

  // Content Genres
  await db.insert(schema.contentGenres).values([
    { originalId: originalCrossers.id, genreId: genreFantasy.id },
    { originalId: originalCrossers.id, genreId: genreMultiverse.id },
    { originalId: originalCrossers.id, genreId: genreMythology.id },
  ]);

  // Originals Junctions
  await db.insert(schema.originalCharacters).values([
    { originalId: originalCrossers.id, characterId: charTarek.id },
    { originalId: originalCrossers.id, characterId: charKamos.id },
    { originalId: originalCrossers.id, characterId: charLaylAlZaman.id },
  ]);

  await db.insert(schema.originalWorlds).values([
    { originalId: originalCrossers.id, worldId: worldEgypt.id },
    { originalId: originalCrossers.id, worldId: worldGates.id },
  ]);

  // ========================================================================
  // 9. NOVELS, STORE, WRITERS, CARDS & ENTITY RELATIONS
  // ========================================================================
  console.log("📜 Seeding universe novels, store, writers, and TCG cards...");

  // Novels
  await db.insert(schema.novelsTable).values([
    {
      id: "novel-1",
      slug: "crossers-chronicles",
      title: "The Crossers: Chronos Veil",
      arabicTitle: "العابرون: سِفْر الأزمان",
      tagline: "Light is not granted... it is forged in eternal rifts.",
      arabicTagline: "النور لا يُمنح... بل يُكسب عبر البوابات الأبدية",
      summary: "In a collapsing multiverse, Tariq uncovers an ancient solar relic capable of bending physical realities.",
      arabicSummary: "في كون متعدد الأبعاد يوشك على الانهيار، يكتشف طارق قدره المحتوم كوارث للنور الشمسي القديم.",
      coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
      bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600",
      authorId: "writer-1",
      totalChapters: 24,
      rating: "4.9",
      isPremium: true,
      isFeatured: true,
      status: "published",
    },
    {
      id: "novel-2",
      slug: "shadow-veil",
      title: "Shadows of Aetheria",
      arabicTitle: "ظلال أثيريا",
      tagline: "Where light falls, shadows whisper secrets.",
      arabicTagline: "حيث يسقط النور، تهمس الظلال بالأسرار القديمة",
      summary: "Layla must navigate the perilous abyssal rifts to prevent the corruption of the World Tree.",
      arabicSummary: "تخوض ليلى مغامرة خطيرة عبر صدوع الظلال لحماية شجرة العالم الأسطورية.",
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800",
      bannerUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600",
      authorId: "writer-2",
      totalChapters: 18,
      rating: "4.8",
      isPremium: false,
      isFeatured: false,
      status: "published",
    }
  ]).onConflictDoNothing();

  // Store Products
  await db.insert(schema.storeProductsTable).values([
    {
      id: "prod-1",
      slug: "crossers-hardcover-vol1",
      name: "The Crossers: Deluxe Hardcover Vol. 1",
      arabicName: "مجلد العابرون: النسخة المجلدة الفاخرة #1",
      category: "book",
      description: "Full-color 300-page collector's hardcover edition including exclusive world maps and concept sketches.",
      arabicDescription: "نسخة مجلدة فاخرة بالكامل 300 صفحة ملونة تتضمن خرائط العالم الحصرية ورسومات أولية.",
      priceEgp: 450,
      originalPriceEgp: 550,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600",
      inStock: true,
      isExclusive: true,
      rating: "5.0",
    },
    {
      id: "prod-2",
      slug: "tcg-booster-pack-solaris",
      name: "TCG Booster Pack: Solaris Awakening",
      arabicName: "حزمة بطاقات التداول: صحوة السولاريس",
      category: "card_pack",
      description: "Contains 10 digital/physical collectible cards with 1 guaranteed Rare or Legendary character card.",
      arabicDescription: "تتضمن 10 بطاقات تداول أسطورية مع حزمة واحدة مضمونة من الفئة النادرة أو الأسطورية.",
      priceEgp: 120,
      originalPriceEgp: 150,
      imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=600",
      inStock: true,
      isExclusive: false,
      rating: "4.9",
    }
  ]).onConflictDoNothing();

  // Writers
  await db.insert(schema.writersTable).values([
    {
      id: "writer-1",
      slug: "kareem-el-masry",
      name: "Kareem El-Masry",
      arabicName: "كريم المصري",
      role: "Lead Lore Architect & Senior Writer",
      arabicRole: "رئيس مهندسي الكون والكاتب الرئيسي",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
      bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200",
      bio: "Creator of the Crossers universe, weaving mythic Arabic folklore with modern sci-fi superhero epics.",
      arabicBio: "مبتكر عالم العابرون، يدمج بين الأسطورة العربية وأدب الخيال العلمي والأبطال الخارقين.",
      worksCount: 14,
    },
    {
      id: "writer-2",
      slug: "nour-al-huda",
      name: "Nour Al-Huda",
      arabicName: "نور الهدى",
      role: "Master Graphic Novelist & Illustrator",
      arabicRole: "فنانة الرسوم المصورة والروايات المصورة",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400",
      bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200",
      bio: "Award-winning illustrator shaping the visual design language of Aetheria and the Shadow Rift.",
      arabicBio: "رسامة وفنانة حائزة على جوائز، تشكل الهوية البصرية لعالم أثيريا وصدع الظلال.",
      worksCount: 9,
    }
  ]).onConflictDoNothing();

  // Cards
  await db.insert(schema.cardsTable).values([
    {
      id: "card-1",
      cardCode: "HEK-001",
      name: "Tariq - Solar Awakening",
      arabicName: "طارق - الصحوة الشمسية",
      rarity: "Legendary",
      element: "Solar",
      attack: 95,
      defense: 88,
      magic: 92,
      imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=600",
      flavorText: "The solar essence burns brighter than a thousand falling stars.",
      arabicFlavorText: "يتوهج جوهر الشمس بأشد من ضياء ألف نجم هابط.",
    },
    {
      id: "card-2",
      cardCode: "HEK-002",
      name: "Layla - Void Weaver",
      arabicName: "ليلى - نساجة الفراغ",
      rarity: "Epic",
      element: "Void",
      attack: 86,
      defense: 90,
      magic: 98,
      imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600",
      flavorText: "She dances in the dark spaces between ancient dimensions.",
      arabicFlavorText: "تتراقص في المساحات المظلمة الفاصلة بين الأبعاد الأسطورية.",
    }
  ]).onConflictDoNothing();

  // Entity Relations
  await db.insert(schema.entityRelationsTable).values([
    {
      id: "rel-1",
      sourceType: "character",
      sourceId: charTarek.id,
      targetType: "world",
      targetId: worldEgypt.id,
      relationType: "origin_world",
    },
    {
      id: "rel-2",
      sourceType: "character",
      sourceId: charTarek.id,
      targetType: "story",
      targetId: originalCrossers.id,
      relationType: "debut_story",
    }
  ]).onConflictDoNothing();

  console.log("\n✅ Seeding complete! The Hekayaty World & Hekayaty Originals universe is ready.");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
