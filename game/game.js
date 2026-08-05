(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const titleScreen = document.getElementById("titleScreen");
  const introScreen = document.getElementById("introScreen");
  const introVideo = document.getElementById("introVideo");
  const introCast = document.getElementById("introCast");
  const finalScreen = document.getElementById("finalScreen");
  const finalVideo = document.getElementById("finalVideo");
  const finalCaption = document.getElementById("finalCaption");
  const finalCast = document.getElementById("finalCast");
  const creditsScreen = document.getElementById("creditsScreen");
  const creditsContinueButton = document.getElementById("creditsContinueButton");
  const helpScreen = document.getElementById("helpScreen");
  const helpButton = document.getElementById("helpButton");
  const helpCloseButton = document.getElementById("helpCloseButton");
  const introButton = document.getElementById("introButton");
  const skipIntroButton = document.getElementById("skipIntroButton");
  const skipFinalButton = document.getElementById("skipFinalButton");
  const endScreen = document.getElementById("endScreen");
  const startButton = document.getElementById("startButton");
  const resetProgressButton = document.getElementById("resetProgressButton");
  const progressStatus = document.getElementById("progressStatus");
  const againButton = document.getElementById("againButton");
  const endTitle = document.getElementById("endTitle");
  const endCopy = document.getElementById("endCopy");
  const lightFill = document.getElementById("lightFill");
  const levelName = document.getElementById("levelName");
  const scoreText = document.getElementById("scoreText");
  const livesText = document.getElementById("livesText");
  const sprayText = document.getElementById("sprayText");
  const rosaryText = document.getElementById("rosaryText");
  const characterButtons = Array.from(document.querySelectorAll(".character-choice"));
  const difficultyButtons = Array.from(document.querySelectorAll(".difficulty-choice"));
  const worldButtons = Array.from(document.querySelectorAll(".world-choice"));
  const stick = document.getElementById("stick");
  const stickKnob = stick.querySelector("i");
  const prayButton = document.getElementById("prayButton");
  const sprayButton = document.getElementById("sprayButton");
  const rosaryButton = document.getElementById("rosaryButton");
  const pauseButton = document.getElementById("pauseButton");
  const redeemedByHero = {
    angie: "Doña Carmelina",
    nana: "Tan",
    ttitin: "Mr Zuil",
    tata: "Mr Hernandez",
    mrsFavi: "Mr. Domingo",
    mrChuy: "Don Maro",
    abba: "Lady Seferina",
    timmy: "Mr Tío",
    guardian: "Father V",
    michael: "Father M",
    mrTio: "Sr Joe",
    donaCarmelina: "Lord Santy",
    tan: "Doña Nene",
    daroe: "Daroe",
    mamel: "Mamel",
  };
  const surpriseRedeemedCharacterKeys = new Set(["angeliux", "srJoe", "lordSanty", "donaNene"]);
  const redeemedCharacterByHero = {
    angie: "donaCarmelina",
    elayitas: "padrino",
    nana: "tan",
    ttitin: "mrZuil",
    tata: "mrHernandez",
    mrsFavi: "mrDomingo",
    mrChuy: "donMaro",
    abba: "ladySeferina",
    timmy: "mrTio",
    guardian: "fatherV",
    michael: "fatherM",
    mrTio: "srJoe",
    donaCarmelina: "lordSanty",
    tan: "donaNene",
  };
  const comboRedeemedCharacterKeys = new Set(["daroe", "mamel"]);
  const redeemedCharacterKeys = new Set([...Object.values(redeemedCharacterByHero), "padrino", ...surpriseRedeemedCharacterKeys, ...comboRedeemedCharacterKeys]);
  const fallbackRedemptionCandidates = [
    "elayitas",
    "angie",
    "ttitin",
    "tata",
    "abba",
    "nana",
    "mrsFavi",
    "mrChuy",
    "timmy",
    "guardian",
    "michael",
  ];
  const unlockedStorageKey = "cruxSacraUnlockedRedeemed";
  const worldProgressStorageKey = "cruxSacraWorldsPassed";
  const finalWorldKey = "holymountain";
  const bonusWorldKey = "saints";
  const ranchWorldKey = "elrancho";
  const finalWorldRequiredKeys = ["colorado", "juarez", "useast", "elpaso", "guadalajara", "elrancho", "mexicocity", "elcoco"];
  const query = new URLSearchParams(window.location.search);
  const finalWorldOverride = query.get("unlockFinal") === "1";
  const bonusWorldOverride = query.get("unlockBonus") === "1";
  const ranchWorldOverride = query.get("unlockRanch") === "1";
  const redeemedOverrideKeys = (query.get("unlockRedeemed") || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);

  const W = canvas.width;
  const H = canvas.height;
  const ASSET = "../";
  const ASSET_VERSION = "101";
  const images = {};
  const keys = new Set();
  const joy = { active: false, id: null, x: 0, y: 0 };
  const touchMove = { active: false, id: null, x: 0, y: 0 };
  const audio = {
    ctx: null,
    master: null,
    music: null,
    sfx: null,
    enabled: false,
    nextNoteAt: 0,
    step: 0,
    stage: -1,
    world: "",
  };
  let introSpeechTimers = [];
  let introStartsGame = false;

  const sources = {
    bgPark: "video-demo/backgrounds/colorado-v2/bg-colorado-garden-home-park-v2.png",
    bgWinter: "video-demo/backgrounds/colorado-v2/bg-colorado-winter-park-v2.png",
    bgChurch: "video-demo/backgrounds/colorado-v2/bg-colorado-modern-church-v2.png",
    bgNight: "video-demo/backgrounds/colorado-v2/bg-colorado-night-tacalache-v2.png",
    bgJuarezCasa: "video-demo/backgrounds/juarez/review/bg-juarez-colonia-morelos-street-review-toon.png",
    bgJuarezChamizal: "video-demo/backgrounds/juarez/bg-juarez-chamizal-park-toon.png",
    bgJuarezMercado: "video-demo/backgrounds/juarez/review/bg-juarez-mall-review-toon.png",
    bgJuarezDunas: "video-demo/backgrounds/juarez/review/bg-juarez-samalayuca-dunes-review-toon.png",
    bgJuarezIglesia: "video-demo/backgrounds/juarez/review/bg-juarez-catedral-plaza-armas-review-toon.png",
    bgJuarezFrontera: "video-demo/backgrounds/juarez/bg-juarez-noche-frontera-toon.png",
    bgUsEastMobile: "video-demo/backgrounds/us-east/bg-us-east-mobile-government-blvd.png",
    bgUsEastTuscaloosa: "video-demo/backgrounds/us-east/bg-us-east-tuscaloosa-campus-stadium.png",
    bgUsEastAtlanta: "video-demo/backgrounds/us-east/bg-us-east-atlanta-centennial-park.png",
    bgUsEastPensacola: "video-demo/backgrounds/us-east/bg-us-east-pensacola-beach.png",
    bgUsEastNewOrleans: "video-demo/backgrounds/us-east/bg-us-east-new-orleans-night.png",
    bgUsEastBoss: "video-demo/backgrounds/us-east/bg-us-east-mobile-bay-boss.png",
    bgElPaso1: "video-demo/backgrounds/el-paso/playable/bg-el-paso-level-1.png",
    bgElPaso2: "video-demo/backgrounds/el-paso/playable/bg-el-paso-level-2.png",
    bgElPaso3: "video-demo/backgrounds/el-paso/playable/bg-el-paso-level-3.png",
    bgElPaso4: "video-demo/backgrounds/el-paso/playable/bg-el-paso-level-4.png",
    bgElPaso5: "video-demo/backgrounds/el-paso/playable/bg-el-paso-level-5.png",
    bgElPaso6: "video-demo/backgrounds/el-paso/playable/bg-el-paso-level-6.png",
    bgGuadalajara1: "video-demo/backgrounds/guadalajara/playable/bg-guadalajara-level-1.png",
    bgGuadalajara2: "video-demo/backgrounds/guadalajara/playable/bg-guadalajara-level-2.png",
    bgGuadalajara3: "video-demo/backgrounds/guadalajara/playable/bg-guadalajara-level-3.png",
    bgGuadalajara4: "video-demo/backgrounds/guadalajara/playable/bg-guadalajara-level-4.png",
    bgGuadalajara5: "video-demo/backgrounds/guadalajara/playable/bg-guadalajara-level-5.png",
    bgGuadalajara6: "video-demo/backgrounds/guadalajara/playable/bg-guadalajara-level-6.png",
    bgMexicoCity1: "video-demo/backgrounds/mexico-city/playable/bg-mexico-city-level-1.png",
    bgMexicoCity2: "video-demo/backgrounds/mexico-city/playable/bg-mexico-city-level-2.png",
    bgMexicoCity3: "video-demo/backgrounds/mexico-city/playable/bg-mexico-city-level-3.png",
    bgMexicoCity4: "video-demo/backgrounds/mexico-city/playable/bg-mexico-city-level-4.png",
    bgMexicoCity5: "video-demo/backgrounds/mexico-city/playable/bg-mexico-city-level-5.png",
    bgMexicoCity6: "video-demo/backgrounds/mexico-city/playable/bg-mexico-city-level-6.png",
    bgHolyMountain1: "video-demo/backgrounds/holy-mountain/playable/bg-holy-mountain-level-1-holy-road.png",
    bgHolyMountain2: "video-demo/backgrounds/holy-mountain/playable/bg-holy-mountain-level-2-desert-temptation.png",
    bgHolyMountain3: "video-demo/backgrounds/holy-mountain/playable/bg-holy-mountain-level-3-jerusalem-temple.png",
    bgHolyMountain4: "video-demo/backgrounds/holy-mountain/playable/bg-holy-mountain-level-4-storm-bridge.png",
    bgHolyMountain5: "video-demo/backgrounds/holy-mountain/playable/bg-holy-mountain-level-5-gethsemane.png",
    bgHolyMountain6: "video-demo/backgrounds/holy-mountain/playable/bg-holy-mountain-level-6-golgotha.png",
    bgSaints: "character-sprites/saints/saints-bonus-world-contact-sheet.png",
    bgElRancho1: "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-1-ejido.png",
    bgElRancho2: "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-2-highway.png",
    bgElRancho3: "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-3-torreon-stadium.png",
    bgElRancho4: "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-4-lerdo-church.png",
    bgElRancho5: "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-5-cerro-noas.png",
    bgElRancho6: "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-6-parras.png",
    bgElRancho7: "video-demo/backgrounds/el-rancho/playable/bg-el-rancho-level-7-monterrey-boss.png",
    bgElCoco1: "video-demo/backgrounds/el-coco/playable/bg-el-coco-level-1-colorado-bedroom.svg",
    bgElCoco2: "video-demo/backgrounds/el-coco/playable/bg-el-coco-level-2-alabama-bedroom.svg",
    bgElCoco3: "video-demo/backgrounds/el-coco/playable/bg-el-coco-level-3-juarez-infonavit-bedroom.svg",
    bgElCoco4: "video-demo/backgrounds/el-coco/playable/bg-el-coco-level-4-el-paso-bedroom.svg",
    bgElCoco5: "video-demo/backgrounds/el-coco/playable/bg-el-coco-level-5-guadalajara-bedroom.svg",
    bgElCoco6: "video-demo/backgrounds/el-coco/playable/bg-el-coco-level-6-mexico-city-bedroom.svg",
    bgElCoco7: "video-demo/backgrounds/el-coco/playable/bg-el-coco-level-7-closet-boss.svg",
    prairieBoy: "character-sprites/prairie-boy/prairie-boy-cutout.png",
    stMary: "character-sprites/saints/st-mary-reference.png",
    elayitasSheet: "character-sprites/baseball-kid/baseball-kid-sheet-transparent.png",
    elayitasFront: "character-sprites/baseball-kid/baseball-kid-front-reference-from-sheet.png",
    nangieSheet: "character-sprites/toddler-girl/toddler-girl-sheet-transparent.png",
    nangieFront: "character-sprites/toddler-girl/toddler-girl-front-reference.png",
    abbaSheet: "character-sprites/abba/abba-sheet-transparent.png",
    nanaSheet: "character-sprites/nana/nana-sheet-corrected-transparent.png",
    ttitinSheet: "character-sprites/ttitin/ttitin-sheet-transparent.png",
    tataSheet: "character-sprites/tata/tata-sheet-transparent.png",
    mrsFaviSheet: "character-sprites/mrs-favi/mrs-favi-sheet-solid-transparent.png",
    mrChuySheet: "character-sprites/mr-chuy/mr-chuy-sheet-transparent.png",
    guardianSheet: "character-sprites/guardian-angel/guardian-angel-sheet-transparent.png",
    michaelSheet: "character-sprites/saint-michael/saint-michael-sheet-transparent.png",
    ttitin: "character-sprites/ttitin/ttitin-front-reference.png",
    tata: "character-sprites/tata/tata-front-reference.png",
    abba: "character-sprites/abba/abba-front-reference.png",
    nana: "character-sprites/nana/nana-front-corrected-reference.png",
    mrsFavi: "character-sprites/mrs-favi/mrs-favi-front-solid-reference.png",
    mrChuy: "character-sprites/mr-chuy/mr-chuy-pet-front-reference.png",
    timmySheet: "character-sprites/timmy/timmy-sheet-transparent.png",
    timmyFront: "character-sprites/timmy/timmy-front-full-reference.png",
    tacalache: "character-sprites/el-tacalache/el-tacalache-front-reference.png",
    elCucuy: "character-sprites/el-cucuy-del-desierto/el-cucuy-review-transparent.png",
    elChupacabras: "character-sprites/el-chupacabras/el-chupacabras-cutout.png",
    elCharroNegro: "character-sprites/el-charro-negro/el-charro-negro-cutout.png",
    laLlorona: "character-sprites/la-llorona/la-llorona-cutout.png",
    elCoco: "character-sprites/el-coco/el-coco-cutout.svg",
    theDevil: "character-sprites/the-devil/the-devil-cutout.png",
    laAparecidaCarretera: "character-sprites/la-aparecida-carretera/la-aparecida-carretera-cutout.png",
    swampShadow: "character-sprites/swamp-shadow/swamp-shadow-alligator-cutout-v2.png",
    jesus: "character-sprites/jesus/jesus-divine-mercy-transparent.png",
    angel: "character-sprites/guardian-angel/guardian-angel-front-reference.png",
    michael: "character-sprites/saint-michael/saint-michael-front-reference.png",
    tan: "character-sprites/tan/tan-transparent.png",
    tanSheet: "character-sprites/redeemed-cartoon-v1/processed/tan-cartoon-sheet.png",
    mrHernandez: "character-sprites/mr-hernandez/mr-hernandez-transparent.png",
    mrHernandezSheet: "character-sprites/redeemed-cartoon-v1/processed/mr-hernandez-cartoon-sheet.png",
    mrDomingo: "character-sprites/mr-domingo/mr-domingo-transparent.png",
    mrDomingoSheet: "character-sprites/redeemed-cartoon-v1/processed/mr-domingo-cartoon-sheet.png",
    donMaro: "character-sprites/don-maro/don-maro-transparent.png",
    donMaroSheet: "character-sprites/redeemed-cartoon-v1/processed/don-maro-cartoon-sheet.png",
    ladySeferina: "character-sprites/lady-seferina/lady-seferina-transparent.png",
    ladySeferinaSheet: "character-sprites/redeemed-cartoon-v1/processed/lady-seferina-cartoon-sheet.png",
    donaCarmelina: "character-sprites/dona-carmelina/dona-carmelina-transparent.png",
    donaCarmelinaSheet: "character-sprites/redeemed-cartoon-v1/processed/dona-carmelina-cartoon-sheet.png",
    mrZuil: "character-sprites/mr-zuil/mr-zuil-transparent.png",
    mrZuilSheet: "character-sprites/redeemed-cartoon-v1/processed/mr-zuil-cartoon-sheet.png",
    mrTio: "character-sprites/mr-tio/mr-tio-transparent.png",
    mrTioSheet: "character-sprites/redeemed-cartoon-v1/processed/mr-tio-cartoon-sheet.png",
    fatherV: "character-sprites/father-v/father-v-transparent.png",
    fatherVSheet: "character-sprites/redeemed-cartoon-v1/processed/father-v-cartoon-sheet.png",
    fatherM: "character-sprites/father-m/father-m-transparent.png",
    fatherMSheet: "character-sprites/redeemed-cartoon-v1/processed/father-m-cartoon-sheet.png",
    padrino: "character-sprites/tacalache-redeemed/tacalache-redeemed-transparent.png",
    padrinoSheet: "character-sprites/redeemed-cartoon-v1/processed/padrino-cartoon-sheet.png",
    angeliux: "character-sprites/angeliux/angeliux-transparent-clean.png",
    angeliuxSheet: "character-sprites/redeemed-cartoon-v1/processed/angeliux-cartoon-sheet.png",
    srJoe: "character-sprites/sr-joe/sr-joe-transparent.png",
    srJoeSheet: "character-sprites/redeemed-cartoon-v1/processed/sr-joe-cartoon-sheet.png",
    lordSanty: "character-sprites/lord-santy/lord-santy-transparent.png",
    lordSantySheet: "character-sprites/redeemed-cartoon-v1/processed/lord-santy-cartoon-sheet.png",
    donaNene: "character-sprites/dona-nene/dona-nene-transparent.png",
    donaNeneSheet: "character-sprites/redeemed-cartoon-v1/processed/dona-nene-cartoon-sheet.png",
    daroe: "character-sprites/daroe/daroe-front-reference.png",
    daroeSheet: "character-sprites/daroe/daroe-walk-sheet-facing-right.png",
    mamel: "character-sprites/mamel/mamel-front-reference.png",
    mamelSheet: "character-sprites/mamel/mamel-walk-sheet-clean.png",
  };

  const worldSketches = {
    colorado: {
      label: "Colorado Springs",
      villain: "El Tacalache",
      cruxColor: "#f8dc71",
      stages: ["bgPark", "bgWinter", "bgChurch", "bgNight"],
    },
    juarez: {
      label: "Juarez, MX",
      villain: "El Cucuy del Desierto",
      cruxColor: "#36c8ff",
      stages: [
        "bgJuarezCasa",
        "bgJuarezChamizal",
        "bgJuarezMercado",
        "bgJuarezDunas",
        "bgJuarezIglesia",
        "bgJuarezFrontera",
      ],
    },
    useast: {
      label: "US East",
      villain: "The Swamp Shadow",
      cruxColor: "#1fd36b",
      stages: [
        "bgUsEastMobile",
        "bgUsEastTuscaloosa",
        "bgUsEastAtlanta",
        "bgUsEastPensacola",
        "bgUsEastNewOrleans",
        "bgUsEastBoss",
      ],
    },
    elpaso: {
      label: "El Paso, TX",
      villain: "El Chupacabras",
      cruxColor: "#c77eff",
      stages: ["bgElPaso1", "bgElPaso2", "bgElPaso3", "bgElPaso4", "bgElPaso5", "bgElPaso6"],
    },
    guadalajara: {
      label: "Guadalajara, MX",
      villain: "El Charro Negro",
      cruxColor: "#ff4b4f",
      stages: ["bgGuadalajara1", "bgGuadalajara2", "bgGuadalajara3", "bgGuadalajara4", "bgGuadalajara5", "bgGuadalajara6"],
    },
    elrancho: {
      label: "El Rancho",
      villain: "La Aparecida de la Carretera",
      cruxColor: "#f2b86d",
      stages: ["bgElRancho1", "bgElRancho2", "bgElRancho3", "bgElRancho4", "bgElRancho5", "bgElRancho6", "bgElRancho7"],
    },
    mexicocity: {
      label: "Mexico City, MX",
      villain: "La Llorona",
      cruxColor: "#bdefff",
      stages: ["bgMexicoCity1", "bgMexicoCity2", "bgMexicoCity3", "bgMexicoCity4", "bgMexicoCity5", "bgMexicoCity6"],
    },
    elcoco: {
      label: "Bedtime Rooms",
      villain: "El Coco",
      cruxColor: "#b58cff",
      stages: ["bgElCoco1", "bgElCoco2", "bgElCoco3", "bgElCoco4", "bgElCoco5", "bgElCoco6", "bgElCoco7"],
    },
    holymountain: {
      label: "Holy Land (Tierra Santa)",
      villain: "The Devil",
      cruxColor: "#fff4a8",
      stages: ["bgHolyMountain1", "bgHolyMountain2", "bgHolyMountain3", "bgHolyMountain4", "bgHolyMountain5", "bgHolyMountain6"],
    },
    saints: {
      label: "Saints / Santos",
      villain: "The Prairie Boy",
      cruxColor: "#dff7ff",
      stages: ["bgSaints"],
    },
  };

  const frames = {
    elayitasRun: [
      [17, 250, 108, 176],
      [149, 248, 105, 178],
      [285, 248, 100, 177],
      [420, 247, 104, 183],
      [558, 247, 112, 179],
      [695, 247, 108, 179],
      [831, 252, 122, 174],
    ],
    nangieWalk: [
      [43, 280, 129, 211],
      [211, 280, 136, 211],
      [360, 280, 134, 207],
      [533, 280, 135, 206],
      [702, 280, 122, 211],
      [851, 281, 129, 211],
      [1035, 280, 123, 209],
    ],
    timmyRun: [
      [80, 395, 243, 134],
      [384, 400, 238, 130],
      [679, 403, 218, 126],
      [939, 406, 206, 122],
      [1203, 406, 222, 121],
    ],
    abbaWalk: [
      [53, 232, 109, 179],
      [219, 233, 118, 178],
      [390, 233, 113, 178],
      [567, 233, 120, 178],
      [748, 234, 110, 177],
      [919, 233, 134, 176],
    ],
    nanaWalk: [
      [30, 300, 105, 191],
      [163, 301, 107, 190],
      [293, 301, 112, 190],
      [422, 301, 121, 189],
      [559, 301, 116, 190],
      [697, 301, 117, 190],
      [840, 301, 114, 191],
    ],
    ttitinWalk: [
      [43, 253, 104, 177],
      [176, 253, 108, 175],
      [326, 253, 105, 175],
      [459, 254, 123, 174],
      [608, 255, 131, 173],
      [767, 255, 137, 174],
      [930, 255, 127, 175],
    ],
    tataWalk: [
      [47, 273, 109, 196],
      [200, 272, 109, 197],
      [365, 272, 114, 197],
      [551, 272, 130, 197],
      [749, 272, 120, 197],
      [937, 271, 131, 198],
    ],
    mrsFaviWalk: [
      [47, 250, 96, 178],
      [195, 253, 98, 172],
      [355, 253, 94, 175],
      [522, 254, 109, 174],
      [723, 255, 114, 173],
      [936, 259, 116, 168],
      [1148, 259, 119, 168],
      [1342, 260, 117, 172],
    ],
    mrChuyWalk: [
      [32, 278, 112, 191],
      [179, 281, 102, 193],
      [333, 284, 101, 192],
      [487, 287, 121, 189],
      [659, 291, 107, 187],
      [826, 291, 148, 189],
    ],
    guardianMove: [
      [37, 21, 236, 314],
      [359, 26, 233, 307],
      [644, 31, 236, 309],
      [913, 23, 325, 321],
      [39, 358, 329, 302],
    ],
    michaelMove: [
      [500, 15, 204, 419],
      [716, 502, 255, 283],
      [963, 525, 241, 264],
    ],
    redeemedWalk: [
      [0, 0, 220, 320],
      [220, 0, 220, 320],
      [440, 0, 220, 320],
      [660, 0, 220, 320],
      [880, 0, 220, 320],
      [1100, 0, 220, 320],
    ],
    tanWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    mrHernandezWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    mrDomingoWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    donMaroWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    ladySeferinaWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    donaCarmelinaWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    mrZuilWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    mrTioWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    fatherVWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    fatherMWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    padrinoWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    angeliuxWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    srJoeWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    lordSantyWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    donaNeneWalk: [
      [0, 0, 280, 400],
      [280, 0, 280, 400],
      [560, 0, 280, 400],
      [840, 0, 280, 400],
      [1120, 0, 280, 400],
      [1400, 0, 280, 400],
      [1680, 0, 280, 400],
      [1960, 0, 280, 400],
    ],
    daroeWalk: [
      [0, 0, 320, 640],
      [320, 0, 320, 640],
      [640, 0, 320, 640],
      [960, 0, 320, 640],
      [1280, 0, 320, 640],
      [1600, 0, 320, 640],
      [1920, 0, 320, 640],
    ],
    mamelWalk: [
      [0, 0, 320, 560],
      [320, 0, 320, 560],
      [640, 0, 320, 560],
      [960, 0, 320, 560],
      [1280, 0, 320, 560],
      [1600, 0, 320, 560],
      [1920, 0, 320, 560],
    ],
  };

  const characterDefs = {
    elayitas: {
      label: "Elayitas",
      animated: "elayitasRun",
      sheet: "elayitasSheet",
      front: "elayitasFront",
      height: 118,
    },
    angie: {
      label: "Nangie",
      animated: "nangieWalk",
      sheet: "nangieSheet",
      front: "nangieFront",
      height: 106,
    },
    ttitin: {
      label: "Titín",
      animated: "ttitinWalk",
      sheet: "ttitinSheet",
      front: "ttitin",
      height: 136,
    },
    abba: {
      label: "Abba",
      animated: "abbaWalk",
      sheet: "abbaSheet",
      front: "abba",
      height: 130,
    },
    nana: {
      label: "Ñaña",
      animated: "nanaWalk",
      sheet: "nanaSheet",
      front: "nana",
      height: 136,
    },
    mrsFavi: {
      label: "Mrs Favi",
      animated: "mrsFaviWalk",
      sheet: "mrsFaviSheet",
      front: "mrsFavi",
      height: 142,
    },
    mrChuy: {
      label: "Mr Chuy",
      animated: "mrChuyWalk",
      sheet: "mrChuySheet",
      front: "mrChuy",
      height: 136,
    },
    tata: { label: "Tata", animated: "tataWalk", sheet: "tataSheet", front: "tata", height: 130 },
    timmy: { label: "Timmy", animated: "timmyRun", sheet: "timmySheet", front: "timmyFront", height: 96 },
    guardian: {
      label: "Guardian Angel",
      animated: "guardianMove",
      sheet: "guardianSheet",
      front: "angel",
      height: 150,
    },
    michael: {
      label: "St Michael",
      animated: "michaelMove",
      sheet: "michaelSheet",
      front: "michael",
      height: 178,
    },
    tan: { label: "Tan", animated: "tanWalk", sheet: "tanSheet", front: "tan", height: 142 },
    mrHernandez: { label: "Mr Hernandez", animated: "mrHernandezWalk", sheet: "mrHernandezSheet", front: "mrHernandez", height: 144 },
    mrDomingo: { label: "Mr. Domingo", animated: "mrDomingoWalk", sheet: "mrDomingoSheet", front: "mrDomingo", height: 144 },
    donMaro: { label: "Don Maro", animated: "donMaroWalk", sheet: "donMaroSheet", front: "donMaro", height: 146 },
    ladySeferina: { label: "Lady Seferina", animated: "ladySeferinaWalk", sheet: "ladySeferinaSheet", front: "ladySeferina", height: 136 },
    donaCarmelina: { label: "Doña Carmelina", animated: "donaCarmelinaWalk", sheet: "donaCarmelinaSheet", front: "donaCarmelina", height: 136 },
    mrZuil: { label: "Mr Zuil", animated: "mrZuilWalk", sheet: "mrZuilSheet", front: "mrZuil", height: 148 },
    mrTio: { label: "Mr Tío", animated: "mrTioWalk", sheet: "mrTioSheet", front: "mrTio", height: 146 },
    fatherV: { label: "Father V", animated: "fatherVWalk", sheet: "fatherVSheet", front: "fatherV", height: 148 },
    fatherM: { label: "Father M", animated: "fatherMWalk", sheet: "fatherMSheet", front: "fatherM", height: 148 },
    padrino: { label: "Padrino", animated: "padrinoWalk", sheet: "padrinoSheet", front: "padrino", height: 146 },
    angeliux: { label: "Angeliux", animated: "angeliuxWalk", sheet: "angeliuxSheet", front: "angeliux", height: 146 },
    srJoe: { label: "Sr Joe", animated: "srJoeWalk", sheet: "srJoeSheet", front: "srJoe", height: 150 },
    lordSanty: { label: "Lord Santy", animated: "lordSantyWalk", sheet: "lordSantySheet", front: "lordSanty", height: 144 },
    donaNene: { label: "Doña Nene", animated: "donaNeneWalk", sheet: "donaNeneSheet", front: "donaNene", height: 132 },
    daroe: { label: "Daroe", animated: "daroeWalk", sheet: "daroeSheet", front: "daroe", height: 118, idleFrame: 6, previewFrame: 6 },
    mamel: { label: "Mamel", animated: "mamelWalk", sheet: "mamelSheet", front: "mamel", height: 108 },
  };

  const difficultySettings = {
    easy: { label: "Easy / Facil", lives: 5, spray: 5, speed: 0.82, hazards: 1.35, lightning: 1.25, lightningWarning: 1.8, fireBonus: -1, danger: 0.72, crossBonus: -1 },
    regular: { label: "Regular", lives: 3, spray: 4, speed: 1, hazards: 1, lightning: 0.86, lightningWarning: 1.55, fireBonus: 0, danger: 1, crossBonus: 0 },
    hard: { label: "Hard / Dificil", lives: 2, spray: 3, speed: 1.24, hazards: 0.72, lightning: 0.58, lightningWarning: 1.18, fireBonus: 1, danger: 1.32, crossBonus: 1 },
  };

  const worldHazards = {
    colorado: {
      projectiles: ["rat", "roach"],
      lightning: { warning: "#b9d7ff", hot: "#ffdf70", bolt: "#f8fbff", core: "#7db7ff", glow: "#dce9ff", impact: "#fff8d3", ring: "#ffffff", delay: 1, warningTime: 1, radius: 1, message: "Mountain thunder / Trueno de montaña" },
    },
    juarez: {
      projectiles: ["cactusThorn", "sandSkull"],
      lightning: { warning: "#ffd47a", hot: "#ff9c35", bolt: "#fff2b4", core: "#ffb347", glow: "#ffcc6b", impact: "#d7a65b", ring: "#ffe1a3", delay: 1.05, warningTime: 1.08, radius: 0.95, message: "Desert lightning / Rayo del desierto" },
    },
    useast: {
      projectiles: ["mosquito", "swampBubble"],
      lightning: { warning: "#9ee8ff", hot: "#7cffbd", bolt: "#eefcff", core: "#77dfff", glow: "#80fff2", impact: "#99f4d7", ring: "#b9fff0", delay: 0.96, warningTime: 1.02, radius: 1.04, message: "Gulf storm / Tormenta del Golfo" },
    },
    elpaso: {
      projectiles: ["clawSlash", "shriekWave"],
      lightning: { warning: "#c9a2ff", hot: "#ffcf5a", bolt: "#fbf0ff", core: "#b678ff", glow: "#c07cff", impact: "#e4ccff", ring: "#e8d5ff", delay: 0.92, warningTime: 0.98, radius: 1.05, message: "Monsoon lightning / Rayo monzonico" },
    },
    guadalajara: {
      projectiles: ["horseshoe", "lassoRing"],
      lightning: { warning: "#ffd46d", hot: "#ff5b47", bolt: "#fff5c9", core: "#ffbc3d", glow: "#ff9636", impact: "#ffe28a", ring: "#ffd66e", delay: 0.92, warningTime: 0.95, radius: 1.04, message: "Rainy-season lightning / Rayo de temporal" },
    },
    mexicocity: {
      projectiles: ["tearDrop", "ghostHand"],
      lightning: { warning: "#c5f3ff", hot: "#edf8ff", bolt: "#ffffff", core: "#aeefff", glow: "#b5f2ff", impact: "#dffaff", ring: "#d7f6ff", delay: 1.02, warningTime: 1.1, radius: 1, message: "Mist lightning / Rayo entre neblina" },
    },
    elcoco: {
      projectiles: ["shadowSock", "closetWhisper"],
      lightning: { warning: "#d7c2ff", hot: "#fff4a8", bolt: "#fff9d8", core: "#b58cff", glow: "#caa8ff", impact: "#efe2ff", ring: "#fff0a6", delay: 1.05, warningTime: 1.15, radius: 0.98, message: "Night-light flash / Luz de noche" },
    },
    holymountain: {
      projectiles: ["darkChain", "temptationFlame"],
      lightning: { warning: "#fff4a8", hot: "#ffffff", bolt: "#fffdf0", core: "#ffd35a", glow: "#fff4a8", impact: "#fff8d3", ring: "#fff4a8", delay: 1.16, warningTime: 1.22, radius: 1.12, message: "Trial thunder / Trueno de prueba" },
    },
    saints: {
      projectiles: ["ghostMarble", "strawDart"],
      lightning: { warning: "#d5ecff", hot: "#fff4a8", bolt: "#ffffff", core: "#9ed8ff", glow: "#f6e891", impact: "#fffbd8", ring: "#d5ecff", delay: 1.12, warningTime: 1.28, radius: 0.92, message: "Prairie thunder / Trueno de pradera" },
    },
    elrancho: {
      projectiles: ["dustRibbon", "roadLantern"],
      lightning: { warning: "#ffd28a", hot: "#75e8ff", bolt: "#fff2ce", core: "#f6b15f", glow: "#70d6e7", impact: "#ffe2a8", ring: "#ffd28a", delay: 0.98, warningTime: 1.06, radius: 1.03, message: "Highway storm / Tormenta de carretera" },
    },
  };

  const worldStages = {
    colorado: [
    {
      name: "Level 1 - Summer Park / Parque",
      bg: "bgPark",
      start: { x: 150, y: 520 },
      helper: "angel",
      enemy: { x: 1080, y: 500, minX: 850, maxX: 1185, speed: 58, chaseAfter: 4 },
      crossCount: 6,
      message: "Collect all crosses. Junta todas las cruces.",
      complete: "Level 1 complete / Nivel 1 completo",
      crosses: [
        { x: 300, y: 465 },
        { x: 475, y: 395 },
        { x: 642, y: 508 },
        { x: 760, y: 365 },
        { x: 910, y: 482 },
        { x: 1085, y: 390 },
      ],
    },
    {
      name: "Level 2 - Winter Snow / Nieve",
      bg: "bgWinter",
      start: { x: 135, y: 525 },
      helper: "michael",
      enemy: { x: 1110, y: 505, minX: 760, maxX: 1190, speed: 82, chaseAfter: 3 },
      crossCount: 7,
      message: "Find the crosses in the snow. Encuentra las cruces en la nieve.",
      complete: "Winter cleared / Nieve superada",
      crosses: [
        { x: 235, y: 435 },
        { x: 410, y: 500 },
        { x: 575, y: 390 },
        { x: 720, y: 525 },
        { x: 875, y: 420 },
        { x: 1010, y: 510 },
        { x: 1130, y: 380 },
      ],
    },
    {
      name: "Level 3 - Pater Noster / Padre Nuestro",
      bg: "bgChurch",
      start: { x: 160, y: 545 },
      helper: "both",
      enemy: { x: 1110, y: 505, minX: 940, maxX: 1190, speed: 38, chaseAfter: 99 },
      crossCount: 5,
      message: "Gather prayer light. Reune la luz de la oracion.",
      complete: "Church level passed / Nivel Iglesia superado",
      crosses: [
        { x: 335, y: 485 },
        { x: 505, y: 415 },
        { x: 642, y: 350 },
        { x: 780, y: 415 },
        { x: 950, y: 485 },
      ],
    },
    {
      name: "Boss - El Tacalache",
      bg: "bgNight",
      start: { x: 150, y: 535 },
      helper: "both",
      boss: true,
      enemy: { x: 1040, y: 505, minX: 700, maxX: 1185, speed: 120, chaseAfter: 1 },
      crossCount: 5,
      message: "Collect Lux, then pray near El Tacalache.",
      complete: "Crux Sacra Sit Mihi Lux",
      crosses: [
        { x: 260, y: 460 },
        { x: 475, y: 390 },
        { x: 690, y: 505 },
        { x: 910, y: 405 },
      ],
    },
    ],
    juarez: [
      {
        name: "Juarez 1 - Colonia Morelos",
        bg: "bgJuarezCasa",
        start: { x: 150, y: 530 },
        helper: "angel",
        enemy: { x: 1085, y: 510, minX: 830, maxX: 1190, speed: 70, chaseAfter: 4 },
        crossCount: 6,
        message: "Restore the blue Crux Sacras. Restaura las Crux Sacras azules.",
        complete: "Colonia level passed / Nivel Colonia superado",
        crosses: [
          { x: 270, y: 455 },
          { x: 435, y: 515 },
          { x: 610, y: 405 },
          { x: 790, y: 525 },
          { x: 965, y: 440 },
          { x: 1115, y: 500 },
        ],
      },
      {
        name: "Juarez 2 - Parque El Chamizal",
        bg: "bgJuarezChamizal",
        start: { x: 145, y: 525 },
        helper: "michael",
        enemy: { x: 1105, y: 505, minX: 740, maxX: 1190, speed: 92, chaseAfter: 3 },
        crossCount: 7,
        message: "El Cucuy hides in the park shadows.",
        complete: "Chamizal cleared / Chamizal superado",
        crosses: [
          { x: 250, y: 430 },
          { x: 405, y: 505 },
          { x: 565, y: 390 },
          { x: 725, y: 520 },
          { x: 875, y: 420 },
          { x: 1010, y: 515 },
          { x: 1140, y: 385 },
        ],
      },
      {
        name: "Juarez 3 - Plaza Mall",
        bg: "bgJuarezMercado",
        start: { x: 150, y: 535 },
        helper: "both",
        enemy: { x: 1090, y: 505, minX: 720, maxX: 1190, speed: 105, chaseAfter: 3 },
        crossCount: 8,
        message: "Find the Crux Sacras between the mall shadows.",
        complete: "Mall level passed / Nivel Mall superado",
        crosses: [
          { x: 235, y: 470 },
          { x: 385, y: 395 },
          { x: 535, y: 525 },
          { x: 690, y: 420 },
          { x: 830, y: 525 },
          { x: 970, y: 395 },
          { x: 1110, y: 505 },
        ],
      },
      {
        name: "Juarez 4 - Dunas de Samalayuca",
        bg: "bgJuarezDunas",
        start: { x: 140, y: 535 },
        helper: "angel",
        enemy: { x: 1110, y: 505, minX: 680, maxX: 1190, speed: 118, chaseAfter: 2 },
        crossCount: 8,
        message: "Dust and fear move fast in the dunes.",
        complete: "Dunes crossed / Dunas superadas",
        crosses: [
          { x: 250, y: 455 },
          { x: 400, y: 525 },
          { x: 555, y: 405 },
          { x: 710, y: 520 },
          { x: 865, y: 415 },
          { x: 1015, y: 530 },
          { x: 1140, y: 450 },
        ],
      },
      {
        name: "Juarez 5 - Catedral y Plaza de Armas",
        bg: "bgJuarezIglesia",
        start: { x: 155, y: 545 },
        helper: "both",
        enemy: { x: 1115, y: 505, minX: 850, maxX: 1190, speed: 72, chaseAfter: 99 },
        crossCount: 7,
        message: "Pray in the plaza. Reza en la plaza.",
        complete: "Catedral level passed / Nivel Catedral superado",
        crosses: [
          { x: 300, y: 500 },
          { x: 450, y: 420 },
          { x: 600, y: 520 },
          { x: 745, y: 405 },
          { x: 890, y: 520 },
          { x: 1035, y: 455 },
        ],
      },
      {
        name: "Boss - El Cucuy del Desierto",
        bg: "bgJuarezFrontera",
        start: { x: 150, y: 535 },
        helper: "both",
        boss: true,
        enemy: { x: 1040, y: 505, minX: 650, maxX: 1190, speed: 145, chaseAfter: 1 },
        crossCount: 7,
        message: "Collect Lux, then pray near El Cucuy.",
        complete: "Crux Sacra Sit Mihi Lux",
        crosses: [
          { x: 245, y: 465 },
          { x: 420, y: 390 },
          { x: 590, y: 525 },
          { x: 760, y: 410 },
          { x: 930, y: 525 },
          { x: 1110, y: 455 },
        ],
      },
    ],
    useast: [
      {
        name: "US East 1 - Rainy Government Boulevard",
        bg: "bgUsEastMobile",
        start: { x: 145, y: 535 },
        helper: "angel",
        enemy: { x: 1085, y: 510, minX: 830, maxX: 1190, speed: 78, chaseAfter: 4 },
        crossCount: 6,
        message: "Restore the emerald Crux Sacras on the rainy boulevard.",
        complete: "Mobile level passed / Nivel Mobile superado",
        crosses: [
          { x: 260, y: 470 },
          { x: 420, y: 525 },
          { x: 600, y: 410 },
          { x: 780, y: 520 },
          { x: 965, y: 430 },
          { x: 1120, y: 500 },
        ],
      },
      {
        name: "US East 2 - Tuscaloosa Campus",
        bg: "bgUsEastTuscaloosa",
        start: { x: 150, y: 530 },
        helper: "michael",
        enemy: { x: 1105, y: 505, minX: 760, maxX: 1190, speed: 96, chaseAfter: 3 },
        crossCount: 7,
        message: "The Swamp Shadow follows the stadium lights.",
        complete: "Campus level passed / Nivel Campus superado",
        crosses: [
          { x: 250, y: 440 },
          { x: 395, y: 515 },
          { x: 555, y: 400 },
          { x: 720, y: 525 },
          { x: 875, y: 420 },
          { x: 1020, y: 510 },
          { x: 1140, y: 390 },
        ],
      },
      {
        name: "US East 3 - Atlanta Park",
        bg: "bgUsEastAtlanta",
        start: { x: 145, y: 535 },
        helper: "both",
        enemy: { x: 1100, y: 505, minX: 720, maxX: 1190, speed: 108, chaseAfter: 3 },
        crossCount: 8,
        message: "Find the Crux Sacras around the city fountains.",
        complete: "Atlanta level passed / Nivel Atlanta superado",
        crosses: [
          { x: 235, y: 470 },
          { x: 380, y: 390 },
          { x: 535, y: 525 },
          { x: 690, y: 420 },
          { x: 830, y: 525 },
          { x: 975, y: 395 },
          { x: 1115, y: 505 },
        ],
      },
      {
        name: "US East 4 - Sunny Pensacola",
        bg: "bgUsEastPensacola",
        start: { x: 140, y: 535 },
        helper: "angel",
        enemy: { x: 1110, y: 505, minX: 680, maxX: 1190, speed: 122, chaseAfter: 2 },
        crossCount: 8,
        message: "Sun and wind cannot hide the shadows.",
        complete: "Pensacola level passed / Nivel Pensacola superado",
        crosses: [
          { x: 250, y: 455 },
          { x: 400, y: 525 },
          { x: 555, y: 405 },
          { x: 710, y: 520 },
          { x: 865, y: 415 },
          { x: 1015, y: 530 },
          { x: 1140, y: 450 },
        ],
      },
      {
        name: "US East 5 - New Orleans Night",
        bg: "bgUsEastNewOrleans",
        start: { x: 155, y: 545 },
        helper: "both",
        enemy: { x: 1115, y: 505, minX: 760, maxX: 1190, speed: 118, chaseAfter: 2 },
        crossCount: 9,
        message: "Stay in the light through the old streets.",
        complete: "New Orleans level passed / Nivel New Orleans superado",
        crosses: [
          { x: 235, y: 500 },
          { x: 365, y: 420 },
          { x: 510, y: 530 },
          { x: 660, y: 405 },
          { x: 810, y: 520 },
          { x: 960, y: 435 },
          { x: 1110, y: 505 },
        ],
      },
      {
        name: "Boss - The Swamp Shadow",
        bg: "bgUsEastBoss",
        start: { x: 150, y: 535 },
        helper: "both",
        boss: true,
        enemy: { x: 1040, y: 520, minX: 630, maxX: 1190, speed: 152, chaseAfter: 1 },
        crossCount: 8,
        message: "Collect Lux, then pray near The Swamp Shadow.",
        complete: "Crux Sacra Sit Mihi Lux",
        crosses: [
          { x: 245, y: 465 },
          { x: 405, y: 390 },
          { x: 565, y: 525 },
          { x: 725, y: 410 },
          { x: 890, y: 525 },
          { x: 1065, y: 455 },
        ],
      },
    ],
    elpaso: [
      {
        name: "El Paso 1 - Franklin Mountains Street",
        bg: "bgElPaso1",
        start: { x: 145, y: 535 },
        helper: "angel",
        enemy: { x: 1085, y: 510, minX: 830, maxX: 1190, speed: 86, chaseAfter: 4 },
        crossCount: 6,
        message: "Restore the violet Crux Sacras near the mountains.",
        complete: "El Paso neighborhood passed / Nivel vecindario El Paso superado",
        crosses: [
          { x: 250, y: 465 },
          { x: 420, y: 525 },
          { x: 595, y: 410 },
          { x: 770, y: 520 },
          { x: 955, y: 430 },
          { x: 1120, y: 500 },
        ],
      },
      {
        name: "El Paso 2 - San Jacinto Plaza",
        bg: "bgElPaso2",
        start: { x: 150, y: 530 },
        helper: "michael",
        enemy: { x: 1105, y: 505, minX: 760, maxX: 1190, speed: 104, chaseAfter: 3 },
        crossCount: 7,
        message: "El Chupacabras runs through the plaza shadows.",
        complete: "San Jacinto Plaza passed / Plaza San Jacinto superada",
        crosses: [
          { x: 245, y: 440 },
          { x: 395, y: 515 },
          { x: 555, y: 400 },
          { x: 720, y: 525 },
          { x: 880, y: 420 },
          { x: 1025, y: 510 },
          { x: 1140, y: 390 },
        ],
      },
      {
        name: "El Paso 3 - Scenic Drive",
        bg: "bgElPaso3",
        start: { x: 145, y: 535 },
        helper: "both",
        enemy: { x: 1100, y: 505, minX: 715, maxX: 1190, speed: 116, chaseAfter: 3 },
        crossCount: 8,
        message: "Collect the Crux Sacras above the city lights.",
        complete: "Mountain overlook passed / Mirador de la montaña superado",
        crosses: [
          { x: 235, y: 470 },
          { x: 380, y: 390 },
          { x: 535, y: 525 },
          { x: 690, y: 420 },
          { x: 835, y: 525 },
          { x: 975, y: 395 },
          { x: 1115, y: 505 },
        ],
      },
      {
        name: "El Paso 4 - Mission Trail",
        bg: "bgElPaso4",
        start: { x: 155, y: 545 },
        helper: "both",
        enemy: { x: 1115, y: 505, minX: 850, maxX: 1190, speed: 76, chaseAfter: 99 },
        crossCount: 7,
        message: "Pray by the mission and the mountain star.",
        complete: "Mission level passed / Nivel Misión superado",
        crosses: [
          { x: 300, y: 500 },
          { x: 450, y: 420 },
          { x: 600, y: 520 },
          { x: 745, y: 405 },
          { x: 890, y: 520 },
          { x: 1035, y: 455 },
        ],
      },
      {
        name: "El Paso 5 - Rio Grande Bridge Lights",
        bg: "bgElPaso5",
        start: { x: 150, y: 540 },
        helper: "angel",
        enemy: { x: 1110, y: 510, minX: 700, maxX: 1190, speed: 132, chaseAfter: 2 },
        crossCount: 9,
        message: "Stay in the light across the bridge.",
        complete: "Bridge lights passed / Luces del puente superadas",
        crosses: [
          { x: 230, y: 500 },
          { x: 365, y: 420 },
          { x: 510, y: 530 },
          { x: 660, y: 405 },
          { x: 810, y: 520 },
          { x: 960, y: 435 },
          { x: 1110, y: 505 },
        ],
      },
      {
        name: "Boss - El Chupacabras",
        bg: "bgElPaso6",
        start: { x: 150, y: 535 },
        helper: "both",
        boss: true,
        enemy: { x: 1040, y: 515, minX: 630, maxX: 1190, speed: 162, chaseAfter: 1 },
        crossCount: 8,
        message: "Collect Lux, then pray near El Chupacabras.",
        complete: "Crux Sacra Sit Mihi Lux",
        crosses: [
          { x: 245, y: 465 },
          { x: 405, y: 390 },
          { x: 565, y: 525 },
          { x: 725, y: 410 },
          { x: 890, y: 525 },
          { x: 1065, y: 455 },
        ],
      },
    ],
    guadalajara: [
      {
        name: "Guadalajara 1 - Catedral",
        bg: "bgGuadalajara1",
        start: { x: 145, y: 535 },
        helper: "angel",
        enemy: { x: 1085, y: 510, minX: 830, maxX: 1190, speed: 90, chaseAfter: 4 },
        crossCount: 6,
        message: "Restore the ruby Crux Sacras by the cathedral.",
        complete: "Guadalajara plaza passed / Plaza Guadalajara superada",
        crosses: [
          { x: 260, y: 470 },
          { x: 420, y: 525 },
          { x: 600, y: 410 },
          { x: 780, y: 520 },
          { x: 965, y: 430 },
          { x: 1120, y: 500 },
        ],
      },
      {
        name: "Guadalajara 2 - Historic Arches",
        bg: "bgGuadalajara2",
        start: { x: 150, y: 530 },
        helper: "michael",
        enemy: { x: 1105, y: 505, minX: 760, maxX: 1190, speed: 110, chaseAfter: 3 },
        crossCount: 7,
        message: "El Charro Negro moves between the arches.",
        complete: "Historic courtyard passed / Patio histórico superado",
        crosses: [
          { x: 245, y: 440 },
          { x: 395, y: 515 },
          { x: 555, y: 400 },
          { x: 720, y: 525 },
          { x: 875, y: 420 },
          { x: 1020, y: 510 },
          { x: 1140, y: 390 },
        ],
      },
      {
        name: "Guadalajara 3 - Tlaquepaque",
        bg: "bgGuadalajara3",
        start: { x: 145, y: 535 },
        helper: "both",
        enemy: { x: 1100, y: 505, minX: 720, maxX: 1190, speed: 120, chaseAfter: 3 },
        crossCount: 8,
        message: "Follow the light through the colorful streets.",
        complete: "Tlaquepaque level passed / Nivel Tlaquepaque superado",
        crosses: [
          { x: 235, y: 470 },
          { x: 380, y: 390 },
          { x: 535, y: 525 },
          { x: 690, y: 420 },
          { x: 830, y: 525 },
          { x: 975, y: 395 },
          { x: 1115, y: 505 },
        ],
      },
      {
        name: "Guadalajara 4 - Bosque Los Colomos",
        bg: "bgGuadalajara4",
        start: { x: 140, y: 535 },
        helper: "angel",
        enemy: { x: 1110, y: 505, minX: 680, maxX: 1190, speed: 130, chaseAfter: 2 },
        crossCount: 8,
        message: "The rider waits in the forest shadows.",
        complete: "Forest level passed / Nivel bosque superado",
        crosses: [
          { x: 250, y: 455 },
          { x: 400, y: 525 },
          { x: 555, y: 405 },
          { x: 710, y: 520 },
          { x: 865, y: 415 },
          { x: 1015, y: 530 },
          { x: 1140, y: 450 },
        ],
      },
      {
        name: "Guadalajara 5 - Puerto Vallarta Malecón",
        bg: "bgGuadalajara5",
        start: { x: 155, y: 545 },
        helper: "both",
        enemy: { x: 1115, y: 505, minX: 760, maxX: 1190, speed: 126, chaseAfter: 2 },
        crossCount: 9,
        message: "Keep the light bright by the ocean.",
        complete: "Puerto Vallarta level passed / Nivel Puerto Vallarta superado",
        crosses: [
          { x: 235, y: 500 },
          { x: 365, y: 420 },
          { x: 510, y: 530 },
          { x: 660, y: 405 },
          { x: 810, y: 520 },
          { x: 960, y: 435 },
          { x: 1110, y: 505 },
        ],
      },
      {
        name: "Boss - El Jinete Sin Cabeza",
        bg: "bgGuadalajara6",
        start: { x: 150, y: 535 },
        helper: "both",
        boss: true,
        enemy: { x: 1040, y: 520, minX: 630, maxX: 1190, speed: 170, chaseAfter: 1 },
        crossCount: 8,
        message: "Collect Lux, then pray near El Jinete Sin Cabeza.",
        complete: "Crux Sacra Sit Mihi Lux",
        crosses: [
          { x: 245, y: 465 },
          { x: 405, y: 390 },
          { x: 565, y: 525 },
          { x: 725, y: 410 },
          { x: 890, y: 525 },
          { x: 1065, y: 455 },
        ],
      },
    ],
    mexicocity: [
      {
        name: "Mexico City 1 - Zocalo Cathedral",
        bg: "bgMexicoCity1",
        start: { x: 145, y: 535 },
        helper: "angel",
        enemy: { x: 1085, y: 510, minX: 830, maxX: 1190, speed: 94, chaseAfter: 4 },
        crossCount: 6,
        message: "Restore the silver Crux Sacras by the cathedral.",
        complete: "Zocalo level passed / Nivel Zocalo superado",
        crosses: [
          { x: 260, y: 470 },
          { x: 420, y: 525 },
          { x: 600, y: 410 },
          { x: 780, y: 520 },
          { x: 965, y: 430 },
          { x: 1120, y: 500 },
        ],
      },
      {
        name: "Mexico City 2 - Xochimilco Canals",
        bg: "bgMexicoCity2",
        start: { x: 150, y: 530 },
        helper: "michael",
        enemy: { x: 1105, y: 505, minX: 760, maxX: 1190, speed: 112, chaseAfter: 3 },
        crossCount: 7,
        message: "La Llorona drifts through the canal mist.",
        complete: "Xochimilco level passed / Nivel Xochimilco superado",
        crosses: [
          { x: 245, y: 440 },
          { x: 395, y: 515 },
          { x: 555, y: 400 },
          { x: 720, y: 525 },
          { x: 875, y: 420 },
          { x: 1020, y: 510 },
          { x: 1140, y: 390 },
        ],
      },
      {
        name: "Mexico City 3 - Chapultepec",
        bg: "bgMexicoCity3",
        start: { x: 145, y: 535 },
        helper: "both",
        enemy: { x: 1100, y: 505, minX: 720, maxX: 1190, speed: 124, chaseAfter: 3 },
        crossCount: 8,
        message: "Follow the light through Chapultepec park.",
        complete: "Chapultepec level passed / Nivel Chapultepec superado",
        crosses: [
          { x: 235, y: 470 },
          { x: 380, y: 390 },
          { x: 535, y: 525 },
          { x: 690, y: 420 },
          { x: 830, y: 525 },
          { x: 975, y: 395 },
          { x: 1115, y: 505 },
        ],
      },
      {
        name: "Mexico City 4 - Basilica de Guadalupe",
        bg: "bgMexicoCity4",
        start: { x: 140, y: 535 },
        helper: "angel",
        enemy: { x: 1110, y: 505, minX: 680, maxX: 1190, speed: 134, chaseAfter: 2 },
        crossCount: 8,
        message: "Keep the Crux Sacra bright by the Basilica.",
        complete: "Basilica level passed / Nivel Basilica superado",
        crosses: [
          { x: 250, y: 455 },
          { x: 400, y: 525 },
          { x: 555, y: 405 },
          { x: 710, y: 520 },
          { x: 865, y: 415 },
          { x: 1015, y: 530 },
          { x: 1140, y: 450 },
        ],
      },
      {
        name: "Mexico City 5 - Coyoacan Night",
        bg: "bgMexicoCity5",
        start: { x: 155, y: 545 },
        helper: "both",
        enemy: { x: 1115, y: 505, minX: 760, maxX: 1190, speed: 138, chaseAfter: 2 },
        crossCount: 9,
        message: "Stay together through the night streets.",
        complete: "Coyoacan level passed / Nivel Coyoacan superado",
        crosses: [
          { x: 235, y: 500 },
          { x: 365, y: 420 },
          { x: 510, y: 530 },
          { x: 660, y: 405 },
          { x: 810, y: 520 },
          { x: 960, y: 435 },
          { x: 1110, y: 505 },
        ],
      },
      {
        name: "Boss - La Llorona",
        bg: "bgMexicoCity6",
        start: { x: 150, y: 535 },
        helper: "both",
        boss: true,
        enemy: { x: 1040, y: 520, minX: 630, maxX: 1190, speed: 176, chaseAfter: 1 },
        crossCount: 8,
        message: "Collect Lux, then pray near La Llorona.",
        complete: "Crux Sacra Sit Mihi Lux",
        crosses: [
          { x: 245, y: 465 },
          { x: 405, y: 390 },
          { x: 565, y: 525 },
          { x: 725, y: 410 },
          { x: 890, y: 525 },
          { x: 1065, y: 455 },
        ],
      },
    ],
    elcoco: [
      {
        name: "Bedtime Rooms 1 - Colorado Bedroom",
        bg: "bgElCoco1",
        start: { x: 145, y: 535 },
        helper: "angel",
        enemy: { x: 1085, y: 510, minX: 830, maxX: 1190, speed: 98, chaseAfter: 4 },
        crossCount: 7,
        message: "Keep the Crux Sacra bright above the bed.",
        complete: "Colorado bedroom passed / Cuarto de Colorado superado",
        crosses: [
          { x: 250, y: 465 },
          { x: 405, y: 525 },
          { x: 565, y: 410 },
          { x: 730, y: 520 },
          { x: 890, y: 430 },
          { x: 1035, y: 505 },
        ],
      },
      {
        name: "Bedtime Rooms 2 - Alabama Rain Room",
        bg: "bgElCoco2",
        start: { x: 150, y: 535 },
        helper: "michael",
        enemy: { x: 1105, y: 505, minX: 760, maxX: 1190, speed: 118, chaseAfter: 3 },
        crossCount: 8,
        message: "El Coco listens from the rainy window and closet.",
        complete: "Alabama room passed / Cuarto de Alabama superado",
        crosses: [
          { x: 235, y: 500 },
          { x: 380, y: 420 },
          { x: 535, y: 525 },
          { x: 690, y: 405 },
          { x: 830, y: 520 },
          { x: 975, y: 430 },
          { x: 1120, y: 500 },
        ],
      },
      {
        name: "Bedtime Rooms 3 - Juárez Infonavit Room",
        bg: "bgElCoco3",
        start: { x: 145, y: 535 },
        helper: "both",
        enemy: { x: 1100, y: 505, minX: 715, maxX: 1190, speed: 132, chaseAfter: 2 },
        crossCount: 8,
        message: "Save the Crux Sacras in the compact Infonavit room.",
        complete: "Juarez room passed / Cuarto de Juarez superado",
        crosses: [
          { x: 245, y: 455 },
          { x: 395, y: 525 },
          { x: 555, y: 405 },
          { x: 710, y: 520 },
          { x: 865, y: 415 },
          { x: 1015, y: 530 },
          { x: 1140, y: 450 },
        ],
      },
      {
        name: "Bedtime Rooms 4 - El Paso Desert Room",
        bg: "bgElCoco4",
        start: { x: 155, y: 545 },
        helper: "both",
        enemy: { x: 1115, y: 505, minX: 850, maxX: 1190, speed: 86, chaseAfter: 99 },
        crossCount: 7,
        message: "The star in the window helps guide the Crux Sacra.",
        complete: "El Paso room passed / Cuarto de El Paso superado",
        crosses: [
          { x: 300, y: 500 },
          { x: 450, y: 420 },
          { x: 600, y: 520 },
          { x: 745, y: 405 },
          { x: 890, y: 520 },
          { x: 1035, y: 455 },
        ],
      },
      {
        name: "Bedtime Rooms 5 - Guadalajara Ropero",
        bg: "bgElCoco5",
        start: { x: 150, y: 540 },
        helper: "angel",
        enemy: { x: 1110, y: 510, minX: 700, maxX: 1190, speed: 152, chaseAfter: 2 },
        crossCount: 9,
        message: "Pray near the old ropero and warm arches.",
        complete: "Guadalajara room passed / Cuarto de Guadalajara superado",
        crosses: [
          { x: 230, y: 500 },
          { x: 365, y: 420 },
          { x: 510, y: 530 },
          { x: 660, y: 405 },
          { x: 810, y: 520 },
          { x: 960, y: 435 },
          { x: 1110, y: 505 },
        ],
      },
      {
        name: "Bedtime Rooms 6 - Mexico City Night Room",
        bg: "bgElCoco6",
        start: { x: 150, y: 535 },
        helper: "michael",
        enemy: { x: 1120, y: 510, minX: 690, maxX: 1190, speed: 164, chaseAfter: 2 },
        crossCount: 9,
        message: "City lights shine while El Coco hides in the shadows.",
        complete: "Mexico City room passed / Cuarto de Mexico superado",
        crosses: [
          { x: 235, y: 500 },
          { x: 365, y: 420 },
          { x: 510, y: 530 },
          { x: 660, y: 405 },
          { x: 810, y: 520 },
          { x: 960, y: 435 },
          { x: 1110, y: 505 },
        ],
      },
      {
        name: "Boss - El Coco",
        bg: "bgElCoco7",
        start: { x: 150, y: 535 },
        helper: "both",
        boss: true,
        enemy: { x: 1040, y: 520, minX: 610, maxX: 1190, speed: 188, chaseAfter: 1 },
        crossCount: 9,
        message: "Collect Lux, then pray near El Coco.",
        complete: "Crux Sacra Sit Mihi Lux",
        crosses: [
          { x: 230, y: 465 },
          { x: 380, y: 390 },
          { x: 530, y: 525 },
          { x: 680, y: 410 },
          { x: 830, y: 525 },
          { x: 980, y: 455 },
          { x: 1120, y: 500 },
        ],
      },
    ],
    holymountain: [
      {
        name: "Holy Mountain 1 - The Holy Road",
        bg: "bgHolyMountain1",
        start: { x: 145, y: 535 },
        helper: "angel",
        cheering: true,
        enemy: { x: 1085, y: 510, minX: 835, maxX: 1190, speed: 102, chaseAfter: 4 },
        crossCount: 7,
        message: "Begin the final pilgrimage with the Crux Sacra.",
        complete: "Holy Road passed / Camino Santo superado",
        crosses: [
          { x: 250, y: 470 },
          { x: 405, y: 525 },
          { x: 565, y: 410 },
          { x: 730, y: 520 },
          { x: 890, y: 430 },
          { x: 1035, y: 505 },
          { x: 1145, y: 390 },
        ],
      },
      {
        name: "Holy Mountain 2 - Desert of Temptation",
        bg: "bgHolyMountain2",
        start: { x: 150, y: 535 },
        helper: "michael",
        cheering: true,
        enemy: { x: 1105, y: 505, minX: 760, maxX: 1190, speed: 122, chaseAfter: 3 },
        crossCount: 8,
        message: "Resist the desert storm and save the Crux Sacras.",
        complete: "Desert level passed / Desierto superado",
        crosses: [
          { x: 235, y: 500 },
          { x: 380, y: 420 },
          { x: 535, y: 525 },
          { x: 690, y: 405 },
          { x: 830, y: 520 },
          { x: 975, y: 430 },
          { x: 1120, y: 500 },
        ],
      },
      {
        name: "Holy Mountain 3 - Jerusalem Temple",
        bg: "bgHolyMountain3",
        start: { x: 145, y: 535 },
        helper: "both",
        cheering: true,
        enemy: { x: 1100, y: 505, minX: 715, maxX: 1190, speed: 136, chaseAfter: 2 },
        crossCount: 8,
        message: "Pray by the Jerusalem Temple / Reza junto al Templo de Jerusalen.",
        complete: "Jerusalem Temple passed / Templo de Jerusalen superado",
        crosses: [
          { x: 245, y: 455 },
          { x: 395, y: 525 },
          { x: 555, y: 405 },
          { x: 710, y: 520 },
          { x: 865, y: 415 },
          { x: 1015, y: 530 },
          { x: 1140, y: 450 },
        ],
      },
      {
        name: "Holy Mountain 4 - Storm Bridge",
        bg: "bgHolyMountain4",
        start: { x: 150, y: 540 },
        helper: "both",
        cheering: true,
        enemy: { x: 1110, y: 510, minX: 680, maxX: 1190, speed: 150, chaseAfter: 2 },
        crossCount: 9,
        message: "Cross the storm bridge before the darkness closes in.",
        complete: "Storm Bridge passed / Puente de la Tormenta superado",
        crosses: [
          { x: 225, y: 500 },
          { x: 355, y: 420 },
          { x: 500, y: 530 },
          { x: 645, y: 405 },
          { x: 790, y: 520 },
          { x: 930, y: 435 },
          { x: 1070, y: 505 },
        ],
      },
      {
        name: "Holy Mountain 5 - Gethsemane",
        bg: "bgHolyMountain5",
        start: { x: 155, y: 545 },
        helper: "both",
        cheering: true,
        enemy: { x: 1115, y: 510, minX: 715, maxX: 1190, speed: 158, chaseAfter: 1 },
        crossCount: 9,
        message: "Pray in Gethsemane / Reza en Getsemani.",
        complete: "Gethsemane level passed / Nivel Getsemani superado",
        crosses: [
          { x: 235, y: 500 },
          { x: 365, y: 420 },
          { x: 510, y: 530 },
          { x: 660, y: 405 },
          { x: 810, y: 520 },
          { x: 960, y: 435 },
          { x: 1110, y: 505 },
        ],
      },
      {
        name: "Boss - Golgotha Hill",
        bg: "bgHolyMountain6",
        start: { x: 150, y: 535 },
        helper: "both",
        cheering: true,
        boss: true,
        enemy: { x: 1040, y: 520, minX: 610, maxX: 1190, speed: 194, chaseAfter: 1 },
        crossCount: 9,
        message: "Collect Lux, then pray near The Devil.",
        complete: "Crux Sacra Sit Mihi Lux",
        crosses: [
          { x: 230, y: 465 },
          { x: 380, y: 390 },
          { x: 530, y: 525 },
          { x: 680, y: 410 },
          { x: 830, y: 525 },
          { x: 980, y: 455 },
          { x: 1120, y: 500 },
        ],
      },
    ],
    saints: [
      {
        name: "Saints 1 - Padua and Assisi",
        bg: "bgSaints",
        start: { x: 135, y: 540 },
        helper: "angel",
        enemy: { x: 1095, y: 510, minX: 725, maxX: 1190, speed: 112, chaseAfter: 4 },
        crossCount: 7,
        message: "Bonus preview: walk with the saints and save the Crux Sacras.",
        complete: "Saints preview level passed / Nivel Santos superado",
        crosses: [
          { x: 230, y: 505 },
          { x: 390, y: 420 },
          { x: 545, y: 530 },
          { x: 705, y: 410 },
          { x: 865, y: 525 },
          { x: 1030, y: 440 },
        ],
      },
      {
        name: "Saints 2 - Avila, Calcutta, and Loyola",
        bg: "bgSaints",
        start: { x: 140, y: 540 },
        helper: "michael",
        enemy: { x: 1105, y: 510, minX: 680, maxX: 1190, speed: 132, chaseAfter: 3 },
        crossCount: 8,
        message: "St. Mary joins this bonus-world ending as Mother of Jesus.",
        complete: "Saints teaser passed / Avance de Santos superado",
        crosses: [
          { x: 245, y: 465 },
          { x: 405, y: 525 },
          { x: 560, y: 405 },
          { x: 720, y: 520 },
          { x: 880, y: 430 },
          { x: 1040, y: 505 },
          { x: 1150, y: 390 },
        ],
      },
      {
        name: "Bonus Boss - The Prairie Boy",
        bg: "bgSaints",
        start: { x: 145, y: 540 },
        helper: "both",
        boss: true,
        enemy: { x: 1065, y: 510, minX: 620, maxX: 1190, speed: 154, chaseAfter: 2 },
        crossCount: 8,
        message: "Collect Lux, then pray near The Prairie Boy.",
        complete: "Saints bonus intro complete",
        crosses: [
          { x: 230, y: 465 },
          { x: 380, y: 390 },
          { x: 530, y: 525 },
          { x: 680, y: 410 },
          { x: 830, y: 525 },
          { x: 980, y: 455 },
          { x: 1120, y: 500 },
        ],
      },
    ],
    elrancho: [
      {
        name: "El Rancho 1 - El Compás / San Felipe",
        bg: "bgElRancho1",
        start: { x: 145, y: 535 },
        helper: "angel",
        enemy: { x: 1085, y: 510, minX: 830, maxX: 1190, speed: 96, chaseAfter: 4 },
        crossCount: 7,
        message: "Restore the amber Crux Sacras by El Compás and San Felipe.",
        complete: "Ejido level passed / Nivel ejido superado",
        crosses: [
          { x: 250, y: 465 },
          { x: 405, y: 525 },
          { x: 565, y: 410 },
          { x: 730, y: 520 },
          { x: 890, y: 430 },
          { x: 1035, y: 505 },
        ],
      },
      {
        name: "El Rancho 2 - Highway Through La Laguna",
        bg: "bgElRancho2",
        start: { x: 150, y: 535 },
        helper: "michael",
        enemy: { x: 1105, y: 505, minX: 760, maxX: 1190, speed: 118, chaseAfter: 3 },
        crossCount: 8,
        message: "Stay in the light on the La Laguna highway.",
        complete: "Highway level passed / Carretera superada",
        crosses: [
          { x: 235, y: 500 },
          { x: 380, y: 420 },
          { x: 535, y: 525 },
          { x: 690, y: 405 },
          { x: 830, y: 520 },
          { x: 975, y: 430 },
          { x: 1120, y: 500 },
        ],
      },
      {
        name: "El Rancho 3 - Torreón Stadium",
        bg: "bgElRancho3",
        start: { x: 145, y: 535 },
        helper: "both",
        enemy: { x: 1100, y: 505, minX: 715, maxX: 1190, speed: 132, chaseAfter: 2 },
        crossCount: 8,
        message: "Find the Crux Sacras near the Torreón stadium lights.",
        complete: "Torreón level passed / Nivel Torreón superado",
        crosses: [
          { x: 245, y: 455 },
          { x: 395, y: 525 },
          { x: 555, y: 405 },
          { x: 710, y: 520 },
          { x: 865, y: 415 },
          { x: 1015, y: 530 },
          { x: 1140, y: 450 },
        ],
      },
      {
        name: "El Rancho 4 - Lerdo Church",
        bg: "bgElRancho4",
        start: { x: 155, y: 545 },
        helper: "both",
        enemy: { x: 1115, y: 505, minX: 850, maxX: 1190, speed: 84, chaseAfter: 99 },
        crossCount: 7,
        message: "Pray by the church in Lerdo. Reza junto a la iglesia de Lerdo.",
        complete: "Lerdo church passed / Iglesia de Lerdo superada",
        crosses: [
          { x: 300, y: 500 },
          { x: 450, y: 420 },
          { x: 600, y: 520 },
          { x: 745, y: 405 },
          { x: 890, y: 520 },
          { x: 1035, y: 455 },
        ],
      },
      {
        name: "El Rancho 5 - Cerro de las Noas",
        bg: "bgElRancho5",
        start: { x: 150, y: 540 },
        helper: "angel",
        enemy: { x: 1110, y: 510, minX: 700, maxX: 1190, speed: 150, chaseAfter: 2 },
        crossCount: 9,
        message: "Climb in faith under the Cristo de las Noas light.",
        complete: "Cerro de las Noas passed / Cerro de las Noas superado",
        crosses: [
          { x: 230, y: 500 },
          { x: 365, y: 420 },
          { x: 510, y: 530 },
          { x: 660, y: 405 },
          { x: 810, y: 520 },
          { x: 960, y: 435 },
          { x: 1110, y: 505 },
        ],
      },
      {
        name: "El Rancho 6 - Parras de la Fuente",
        bg: "bgElRancho6",
        start: { x: 150, y: 535 },
        helper: "michael",
        enemy: { x: 1120, y: 510, minX: 690, maxX: 1190, speed: 164, chaseAfter: 2 },
        crossCount: 9,
        message: "La Aparecida follows through the Parras night.",
        complete: "Parras level passed / Nivel Parras superado",
        crosses: [
          { x: 235, y: 500 },
          { x: 365, y: 420 },
          { x: 510, y: 530 },
          { x: 660, y: 405 },
          { x: 810, y: 520 },
          { x: 960, y: 435 },
          { x: 1110, y: 505 },
        ],
      },
      {
        name: "Boss - La Aparecida de la Carretera",
        bg: "bgElRancho7",
        start: { x: 150, y: 535 },
        helper: "both",
        boss: true,
        enemy: { x: 1040, y: 520, minX: 610, maxX: 1190, speed: 188, chaseAfter: 1 },
        crossCount: 9,
        message: "Collect Lux, then pray near La Aparecida.",
        complete: "Crux Sacra Sit Mihi Lux",
        crosses: [
          { x: 230, y: 465 },
          { x: 380, y: 390 },
          { x: 530, y: 525 },
          { x: 680, y: 410 },
          { x: 830, y: 525 },
          { x: 980, y: 455 },
          { x: 1120, y: 500 },
        ],
      },
    ],
  };
  let stages = worldStages.colorado;

  const game = {
    mode: "title",
    selectedHero: "elayitas",
    selectedCompanion: "angie",
    world: "colorado",
    difficulty: "easy",
    stageIndex: 0,
    stageClearTimer: 0,
    time: 0,
    last: 0,
    collected: 0,
    lives: 3,
    lux: 0,
    message: "Collect 6 crosses. Junta 6 cruces.",
    prayer: 0,
    shake: 0,
    player: { x: 150, y: 520, vx: 0, vy: 0, w: 78, h: 128, face: 1 },
    companion: { x: 94, y: 535, face: 1 },
    enemy: { x: 1060, y: 490, dir: -1, stun: 0 },
    crosses: [],
    particles: [],
    effects: [],
    projectiles: [],
    fires: [],
    lightnings: [],
    stars: [],
    rosaries: [],
    sprayAmmo: 4,
    rosaryAmmo: 0,
    sprayCooldown: 0,
    rosaryCooldown: 0,
    nextSpitAt: 0,
    nextFireAt: 0,
    nextLightningAt: 0,
    pendingEnd: null,
    travel: null,
    warningSoundAt: 0,
    finalSequencePlayed: false,
    unlockedRedeemed: new Set(),
    passedWorlds: new Set(),
  };

  hydrateUnlockedRedeemed();
  hydrateWorldProgress();
  decorateCharacterChoices();
  applyInitialWorldFromQuery();
  updateWorldLocks();

  function loadImages() {
    return Promise.all(
      Object.entries(sources).map(([key, path]) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            images[key] = img;
            resolve();
          };
          img.onerror = () => reject(new Error(`Could not load ${path}`));
          img.src = `${ASSET}${path}?v=${ASSET_VERSION}`;
        });
      }),
    );
  }

  function decorateCharacterChoices() {
    for (const button of characterButtons) {
      if (button.querySelector(".choice-portrait")) continue;
      const def = characterDefs[button.dataset.character];
      if (!def) continue;
      const label = button.textContent.trim();
      button.textContent = "";

      const portrait = document.createElement("img");
      portrait.className = "choice-portrait";
      portrait.alt = "";
      portrait.src = characterPreviewSrc(def);

      const name = document.createElement("span");
      name.className = "choice-name";
      name.textContent = label;

      button.append(portrait, name);
    }
    updateRedeemedLocks();
  }

  function refreshCharacterChoicePortraits() {
    for (const button of characterButtons) {
      const def = characterDefs[button.dataset.character];
      const portrait = button.querySelector(".choice-portrait");
      if (!def || !portrait) continue;
      portrait.src = characterPreviewSrc(def, 1);
    }
  }

  function characterPreviewSrc(def, frameIndex = 0) {
    if (!def) return "";
    if (!def.animated || !def.sheet || !images[def.sheet]) {
      return ASSET + sources[def.front];
    }
    const cycle = frames[def.animated];
    const preferredFrame = def.previewFrame ?? frameIndex;
    const frame = cycle && cycle.length ? cycle[Math.min(preferredFrame, cycle.length - 1)] : null;
    if (!frame) return ASSET + sources[def.front];

    const img = images[def.sheet];
    const [sx, sy, sw, sh] = frame;
    const preview = document.createElement("canvas");
    preview.width = 96;
    preview.height = 96;
    const pctx = preview.getContext("2d");
    pctx.clearRect(0, 0, preview.width, preview.height);
    const maxW = 82;
    const maxH = 88;
    const scale = Math.min(maxW / sw, maxH / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = (preview.width - dw) / 2;
    const dy = preview.height - dh - 4;
    pctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    return preview.toDataURL("image/png");
  }

  function updateRedeemedLocks() {
    for (const button of characterButtons) {
      const key = button.dataset.character;
      const locked = redeemedCharacterKeys.has(key) && !game.unlockedRedeemed.has(key);
      button.hidden = surpriseRedeemedCharacterKeys.has(key) && locked;
      button.disabled = locked;
      button.classList.toggle("locked", locked);
      button.setAttribute("aria-disabled", locked ? "true" : "false");
      button.title = locked ? "Locked until redeemed / Bloqueado hasta redimirlo" : "";
      if (locked && button.classList.contains("selected")) {
        button.classList.remove("selected");
      }
    }
  }

  function hydrateUnlockedRedeemed() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(unlockedStorageKey) || "[]");
      if (Array.isArray(stored)) {
        stored.forEach((key) => {
          if (redeemedCharacterKeys.has(key)) game.unlockedRedeemed.add(key);
        });
      }
    } catch {
      game.unlockedRedeemed = new Set();
    }
    redeemedOverrideKeys.forEach((key) => {
      if (redeemedCharacterKeys.has(key)) game.unlockedRedeemed.add(key);
    });
    if (redeemedOverrideKeys.length) persistUnlockedRedeemed();
  }

  function persistUnlockedRedeemed() {
    try {
      window.localStorage.setItem(unlockedStorageKey, JSON.stringify([...game.unlockedRedeemed]));
    } catch {
      // Local storage is optional; gameplay still works for this session.
    }
  }

  function hydrateWorldProgress() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(worldProgressStorageKey) || "[]");
      game.passedWorlds = new Set(Array.isArray(stored) ? stored.filter((key) => worldSketches[key]) : []);
    } catch {
      game.passedWorlds = new Set();
    }
  }

  function persistWorldProgress() {
    try {
      window.localStorage.setItem(worldProgressStorageKey, JSON.stringify([...game.passedWorlds]));
    } catch {
      // Local storage is optional; gameplay still works for this session.
    }
  }

  function resetSavedProgress() {
    const ok = window.confirm("Reset all unlocked worlds and redeemed characters on this device? / ¿Reiniciar mundos desbloqueados y personajes redimidos en este dispositivo?");
    if (!ok) return;
    try {
      window.localStorage.removeItem(unlockedStorageKey);
      window.localStorage.removeItem(worldProgressStorageKey);
    } catch {
      // Local storage is optional; still reset the in-memory session.
    }
    game.unlockedRedeemed = new Set();
    game.passedWorlds = new Set();
    game.selectedHero = "elayitas";
    game.selectedCompanion = "angie";
    game.world = "colorado";
    stages = worldStages.colorado;
    for (const choice of worldButtons) choice.classList.toggle("selected", choice.dataset.world === "colorado");
    for (const button of characterButtons) {
      const isHero = button.dataset.role === "hero" && button.dataset.character === game.selectedHero;
      const isCompanion = button.dataset.role === "companion" && button.dataset.character === game.selectedCompanion;
      button.classList.toggle("selected", isHero || isCompanion);
    }
    updateRedeemedLocks();
    updateWorldLocks();
    levelName.textContent = worldSketches.colorado.label;
    if (progressStatus) {
      progressStatus.textContent = "Progress reset on this device / Progreso reiniciado en este dispositivo";
      window.setTimeout(() => {
        if (progressStatus.textContent.startsWith("Progress reset")) progressStatus.textContent = "";
      }, 3600);
    }
  }

  function isFinalWorldUnlocked() {
    return finalWorldOverride || finalWorldRequiredKeys.every((key) => game.passedWorlds.has(key));
  }

  function isBonusWorldUnlocked() {
    return bonusWorldOverride || game.passedWorlds.has(finalWorldKey);
  }

  function isRanchWorldUnlocked() {
    return ranchWorldOverride || Boolean(worldSketches[ranchWorldKey]);
  }

  function updateWorldLocks() {
    const finalUnlocked = isFinalWorldUnlocked();
    const bonusUnlocked = isBonusWorldUnlocked();
    const ranchUnlocked = isRanchWorldUnlocked();
    for (const button of worldButtons) {
      const worldKey = button.dataset.world;
      const locked = (worldKey === finalWorldKey && !finalUnlocked) || (worldKey === bonusWorldKey && !bonusUnlocked) || (worldKey === ranchWorldKey && !ranchUnlocked);
      button.disabled = locked;
      button.classList.toggle("locked", locked);
      button.classList.toggle("unlocked", (worldKey === finalWorldKey && finalUnlocked) || (worldKey === bonusWorldKey && bonusUnlocked) || (worldKey === ranchWorldKey && ranchUnlocked));
      button.setAttribute("aria-disabled", locked ? "true" : "false");
      button.title = locked && worldKey === finalWorldKey
        ? "Locked until the regular worlds are passed / Bloqueado hasta superar los mundos regulares"
        : locked && worldKey === bonusWorldKey
          ? "Locked until Holy Land is passed / Bloqueado hasta superar Tierra Santa"
          : locked && worldKey === ranchWorldKey
            ? "Locked until El Rancho is ready / Bloqueado hasta que El Rancho este listo"
          : "";
    }
  }

  function selectWorld(worldKey) {
    if (worldKey === finalWorldKey && !isFinalWorldUnlocked()) {
      updateWorldLocks();
      return false;
    }
    if (worldKey === bonusWorldKey && !isBonusWorldUnlocked()) {
      updateWorldLocks();
      return false;
    }
    if (worldKey === ranchWorldKey && !isRanchWorldUnlocked()) {
      updateWorldLocks();
      return false;
    }
    game.world = worldSketches[worldKey] ? worldKey : "colorado";
    stages = worldStages[game.world] || worldStages.colorado;
    for (const choice of worldButtons) {
      choice.classList.toggle("selected", choice.dataset.world === game.world);
    }
    levelName.textContent = worldSketches[game.world]?.label || "Colorado Springs";
    updateWorldLocks();
    return true;
  }

  function applyInitialWorldFromQuery() {
    const requestedWorld = query.get("world");
    if (requestedWorld && worldSketches[requestedWorld]) selectWorld(requestedWorld);
  }

  function initAudio() {
    if (audio.enabled) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audio.ctx = new AudioContext();
    audio.master = audio.ctx.createGain();
    audio.music = audio.ctx.createGain();
    audio.sfx = audio.ctx.createGain();
    audio.master.gain.value = 0.55;
    audio.music.gain.value = 0.18;
    audio.sfx.gain.value = 0.42;
    audio.music.connect(audio.master);
    audio.sfx.connect(audio.master);
    audio.master.connect(audio.ctx.destination);
    audio.enabled = true;
  }

  function resumeAudio() {
    if (audio.ctx && audio.ctx.state === "suspended") {
      audio.ctx.resume();
    }
  }

  function startMusic(stageIndex) {
    if (!audio.enabled) return;
    audio.stage = stageIndex;
    audio.world = game.world;
    audio.step = 0;
    audio.nextNoteAt = audio.ctx.currentTime + 0.08;
  }

  function updateMusic() {
    if (!audio.enabled || game.mode !== "playing") return;
    const now = audio.ctx.currentTime;
    if (audio.stage !== game.stageIndex || audio.world !== game.world) startMusic(game.stageIndex);
    while (audio.nextNoteAt < now + 0.18) {
      scheduleMusicNote(audio.nextNoteAt, game.stageIndex, audio.step);
      audio.step += 1;
      audio.nextNoteAt += stages[game.stageIndex].boss ? 0.30 : 0.38;
    }
  }

  function scheduleMusicNote(when, stageIndex, step) {
    const defaultThemes = [
      [261.63, 329.63, 392.0, 523.25, 392.0, 329.63],
      [293.66, 349.23, 440.0, 587.33, 440.0, 349.23],
      [261.63, 392.0, 523.25, 659.25, 523.25, 392.0],
      [196.0, 246.94, 293.66, 392.0, 293.66, 246.94],
      [220.0, 293.66, 349.23, 440.0, 349.23, 293.66],
      [174.61, 261.63, 329.63, 392.0, 329.63, 261.63],
    ];
    const worldThemes = {
      mexicocity: [
        [246.94, 329.63, 392.0, 493.88, 392.0, 329.63],
        [220.0, 293.66, 369.99, 440.0, 369.99, 293.66],
        [261.63, 311.13, 392.0, 523.25, 392.0, 311.13],
        [293.66, 349.23, 440.0, 587.33, 440.0, 349.23],
        [196.0, 261.63, 329.63, 493.88, 329.63, 261.63],
        [164.81, 246.94, 329.63, 392.0, 329.63, 246.94],
      ],
    };
    const themes = worldThemes[game.world] || defaultThemes;
    const theme = themes[stageIndex] || defaultThemes[stageIndex] || defaultThemes[0];
    const note = theme[step % theme.length];
    const octave = step % 8 === 0 ? 0.5 : 1;
    const wave = game.world === "mexicocity" && stageIndex >= 4 ? "sine" : stageIndex === 3 ? "sawtooth" : "triangle";
    tone(note * octave, when, 0.32, wave, 0.18, audio.music);
    if (step % 4 === 0) tone(note * 0.5, when, 0.75, "sine", 0.12, audio.music);
    if (stageIndex === 2 && step % 6 === 0) tone(783.99, when + 0.04, 0.45, "sine", 0.08, audio.music);
    if (game.world === "mexicocity" && step % 8 === 4) tone(note * 1.5, when + 0.06, 0.5, "sine", 0.07, audio.music);
  }

  function tone(freq, when, duration, type, gain, destination) {
    if (!audio.enabled) return;
    const osc = audio.ctx.createOscillator();
    const amp = audio.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    amp.gain.setValueAtTime(0.0001, when);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), when + 0.025);
    amp.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(amp);
    amp.connect(destination);
    osc.start(when);
    osc.stop(when + duration + 0.04);
  }

  function playPickup() {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    tone(659.25, now, 0.12, "sine", 0.38, audio.sfx);
    tone(987.77, now + 0.06, 0.18, "sine", 0.30, audio.sfx);
  }

  function playPrayer() {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    [392.0, 523.25, 659.25, 783.99].forEach((freq, idx) => {
      tone(freq, now + idx * 0.08, 0.45, "triangle", 0.28, audio.sfx);
    });
  }

  function playStageClear(boss = false) {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    const notes = boss ? [392, 523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => tone(freq, now + idx * 0.09, 0.38, "triangle", 0.32, audio.sfx));
  }

  function playVictory() {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => tone(freq, now + idx * 0.12, 0.55, "sine", 0.34, audio.sfx));
  }

  function playDanger() {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    tone(98.0, now, 0.65, "sawtooth", 0.36, audio.sfx);
    tone(146.83, now + 0.08, 0.48, "sawtooth", 0.22, audio.sfx);
  }

  function playWarning() {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    tone(220.0, now, 0.12, "square", 0.16, audio.sfx);
    tone(164.81, now + 0.14, 0.12, "square", 0.13, audio.sfx);
  }

  function playExplosion() {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    tone(82.41, now, 0.75, "sawtooth", 0.42, audio.sfx);
    tone(55.0, now + 0.05, 0.85, "square", 0.20, audio.sfx);
  }

  function playSpit() {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    tone(180.0, now, 0.08, "sawtooth", 0.12, audio.sfx);
    tone(120.0, now + 0.04, 0.10, "square", 0.08, audio.sfx);
  }

  function playFire() {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    tone(130.81, now, 0.18, "sawtooth", 0.08, audio.sfx);
  }

  function playThunder() {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    tone(62.0, now, 0.85, "sawtooth", 0.36, audio.sfx);
    tone(94.0, now + 0.08, 0.55, "square", 0.18, audio.sfx);
    tone(168.0, now + 0.18, 0.22, "triangle", 0.10, audio.sfx);
  }

  function playSpray() {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    tone(740.0, now, 0.12, "sine", 0.16, audio.sfx);
    tone(520.0, now + 0.05, 0.18, "triangle", 0.12, audio.sfx);
  }

  function playRosary() {
    if (!audio.enabled) return;
    const now = audio.ctx.currentTime;
    [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      tone(freq, now + idx * 0.07, 0.58, "sine", 0.26, audio.sfx);
    });
    tone(130.81, now, 1.1, "triangle", 0.12, audio.sfx);
  }

  function reset() {
    initAudio();
    resumeAudio();
    stages = worldStages[game.world] || worldStages.colorado;
    const difficulty = difficultySettings[game.difficulty] || difficultySettings.regular;
    game.mode = "playing";
    game.stageIndex = 0;
    game.time = 0;
    game.last = performance.now();
    game.collected = 0;
    game.lives = difficulty.lives;
    game.lux = 0;
    game.prayer = 0;
    game.shake = 0;
    game.particles = [];
    game.effects = [];
    game.projectiles = [];
    game.fires = [];
    game.lightnings = [];
    game.stars = [];
    game.rosaries = [];
    game.sprayAmmo = difficulty.spray;
    game.rosaryAmmo = 0;
    game.sprayCooldown = 0;
    game.rosaryCooldown = 0;
    game.pendingEnd = null;
    game.travel = null;
    game.finalSequencePlayed = false;
    startStage(0);
    titleScreen.classList.add("hidden");
    endScreen.classList.add("hidden");
    finalScreen.classList.add("hidden");
    helpScreen.classList.add("hidden");
    creditsScreen.classList.add("hidden");
  }

  function startStage(index) {
    initAudio();
    resumeAudio();
    const stage = stages[index];
    const difficulty = difficultySettings[game.difficulty] || difficultySettings.regular;
    const ramp = 1 + index * 0.09;
    game.stageIndex = index;
    game.stageClearTimer = 0;
    game.travel = null;
    game.collected = 0;
    game.message = stage.message;
    game.player = { x: stage.start.x, y: stage.start.y, vx: 0, vy: 0, w: 78, h: 128, face: 1 };
    game.companion = { x: stage.start.x - 95, y: stage.start.y + 16, face: 1 };
    game.enemy = { ...stage.enemy, speed: stage.enemy.speed * difficulty.speed * ramp, dir: -1, stun: 0 };
    game.crosses = generateCrosses(stage, index, difficulty);
    game.projectiles = [];
    game.fires = [];
    game.lightnings = [];
    game.stars = [makeStar(stage)];
    game.rosaries = [makeRosary(stage)];
    game.effects = [];
    game.pendingEnd = null;
    game.nextSpitAt = game.time + 2.5 / ramp;
    game.nextFireAt = game.time + 3.2 / ramp;
    game.nextLightningAt = game.time + nextLightningDelay(stage, difficulty, ramp, true);
    seedFires(Math.max(1, (stage.boss ? 4 : 2 + index) + difficulty.fireBonus));
    levelName.textContent = `${stage.name} · ${difficulty.label}`;
    updateHud();
    startMusic(index);
  }

  function completeStage() {
    if (game.stageClearTimer > 0) return;
    const stage = stages[game.stageIndex];
    game.stageClearTimer = stage.boss ? 3.2 : 2.0;
    game.message = stage.complete;
    game.lux = Math.min(100, game.lux + (stage.boss ? 0 : 18));
    playStageClear(stage.boss);
    burst(game.player.x, game.player.y - 90, stage.boss ? 70 : 34, "#fff4a8");
    if (stage.boss) {
      game.enemy.stun = 4;
      game.shake = 0.45;
    }
  }

  function advanceStage() {
    if (!game.travel) {
      beginTravelTransition();
      return;
    }
    const travelKind = game.travel.kind;
    game.travel = null;
    if (game.stageIndex < stages.length - 1) {
      startStage(game.stageIndex + 1);
      game.mode = "playing";
      return;
    }
    if (travelKind === "world") game.mode = "playing";
    finish(true);
  }

  function beginTravelTransition() {
    const worldDone = game.stageIndex >= stages.length - 1;
    const fromWorld = worldSketches[game.world] || worldSketches.colorado;
    const toWorld = nextWorldSketch();
    const fromStageKey = fromWorld.stages[fromWorld.stages.length - 1];
    const toStageKey = toWorld?.stages?.[0] || fromStageKey;
    game.mode = "travel";
    game.stageClearTimer = 0;
    game.travel = {
      kind: worldDone ? "world" : "level",
      timer: 0,
      duration: worldDone ? 4.6 : 2.45,
      startX: game.player.x,
      startY: game.player.y,
      companionStartY: game.companion.y,
      fromLabel: fromWorld.label,
      toLabel: worldDone ? (toWorld?.label || "the next adventure") : stages[game.stageIndex + 1]?.name || "next level",
      fromStageKey,
      toStageKey,
    };
    game.player.face = 1;
    game.companion.face = 1;
    game.player.vx = 185;
    game.player.vy = 0;
    touchMove.active = false;
    joy.x = 0;
    joy.y = 0;
    stickKnob.style.transform = "translate(0, 0)";
    game.message = worldDone
      ? `Traveling to ${game.travel.toLabel} / Viajando al siguiente mundo`
      : "Walking to the next level / Caminando al siguiente nivel";
  }

  function nextWorldSketch() {
    const keys = Object.keys(worldSketches);
    const index = keys.indexOf(game.world);
    if (index < 0 || index >= keys.length - 1) return null;
    return worldSketches[keys[index + 1]];
  }

  function nextWorldKeyAfter(worldKey) {
    const keys = Object.keys(worldSketches);
    const index = keys.indexOf(worldKey);
    if (index < 0) return null;
    for (let i = index + 1; i < keys.length; i += 1) {
      const candidate = keys[i];
      if (candidate === finalWorldKey && !isFinalWorldUnlocked()) continue;
      if (candidate === bonusWorldKey && !isBonusWorldUnlocked()) continue;
      if (candidate === ranchWorldKey && !isRanchWorldUnlocked()) continue;
      return candidate;
    }
    return null;
  }

  function selectNextWorldAfterCompletion(completedWorld) {
    const nextKey = nextWorldKeyAfter(completedWorld);
    if (nextKey) selectWorld(nextKey);
  }

  function updateTravel(dt) {
    const travel = game.travel;
    if (!travel) {
      game.mode = "playing";
      return;
    }
    travel.timer += dt;
    const t = clamp(travel.timer / travel.duration, 0, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
    const walkEase = travel.kind === "world" ? clamp(t / 0.58, 0, 1) : ease;
    const targetX = travel.kind === "world" ? W + 170 : W + 90;
    const bob = Math.sin(game.time * 11) * 5;
    game.player.x = travel.startX + (targetX - travel.startX) * walkEase;
    game.player.y = travel.startY + bob;
    game.player.vx = 210;
    game.player.vy = 0;
    game.player.face = 1;
    game.companion.x = game.player.x - 100;
    game.companion.y = travel.companionStartY + bob * 0.75;
    game.companion.face = 1;
    if (travel.timer >= travel.duration) advanceStage();
  }

  const defeatMessages = {
    tacalache: "The villain got too close. Use the cross light to push him back.",
    fire: "You stepped into the fire. Use Holy Water to extinguish it.",
    rat: "A rat hit the hero. Use Holy Water before it reaches you.",
    roach: "A cockroach hit the hero. Use Holy Water before it reaches you.",
    cactusThorn: "A cactus thorn hit the hero. Use Holy Water before it reaches you.",
    sandSkull: "A sand skull hit the hero. Use Holy Water before it reaches you.",
    mosquito: "A mosquito swarm hit the hero. Use Holy Water before it reaches you.",
    swampBubble: "A swamp bubble hit the hero. Use Holy Water before it reaches you.",
    clawSlash: "A claw slash hit the hero. Use Holy Water before it reaches you.",
    shriekWave: "A shriek wave hit the hero. Use Holy Water before it reaches you.",
    horseshoe: "A cursed horseshoe hit the hero. Use Holy Water before it reaches you.",
    lassoRing: "A black lasso ring hit the hero. Use Holy Water before it reaches you.",
    tearDrop: "A ghostly tear hit the hero. Use Holy Water before it reaches you.",
    ghostHand: "A ghost hand touched the hero. Use Holy Water before it reaches you.",
    darkChain: "A dark chain hit the hero. Use Holy Water before it reaches you.",
    temptationFlame: "A temptation flame hit the hero. Use Holy Water before it reaches you.",
    ghostMarble: "A ghost marble hit the hero. Use Holy Water before it reaches you.",
    strawDart: "A straw dart hit the hero. Use Holy Water before it reaches you.",
    dustRibbon: "A road dust ribbon hit the hero. Use Holy Water before it reaches you.",
    roadLantern: "A phantom road lantern hit the hero. Use Holy Water before it reaches you.",
    shadowSock: "El Coco threw a shadow sock from under the bed!",
    closetWhisper: "A closet whisper reached the hero!",
    lightning: "Lightning struck the hero. Holy Water and Rosary cannot stop thunder.",
    cross: "A red cross exploded. Reach glowing crosses before the danger meter fills.",
  };

  const projectileNames = {
    rat: "A rat hit the hero!",
    roach: "A cockroach hit the hero!",
    cactusThorn: "Cactus thorns from El Cucuy!",
    sandSkull: "A desert sand skull hit the hero!",
    mosquito: "A mosquito swarm from the swamp!",
    swampBubble: "A swamp bubble burst on the hero!",
    clawSlash: "El Chupacabras sent a claw slash!",
    shriekWave: "A purple shriek wave hit the hero!",
    horseshoe: "A cursed horseshoe from El Charro Negro!",
    lassoRing: "A black lasso ring caught the hero!",
    tearDrop: "La Llorona sent a ghostly tear!",
    ghostHand: "A ghost hand reached the hero!",
    darkChain: "A dark chain struck the hero!",
    temptationFlame: "A temptation flame hit the hero!",
    ghostMarble: "The Prairie Boy threw a ghost marble!",
    strawDart: "A scarecrow straw dart hit the hero!",
    dustRibbon: "La Aparecida sent a road dust ribbon!",
    roadLantern: "A phantom road lantern hit the hero!",
    shadowSock: "El Coco threw a shadow sock!",
    closetWhisper: "A closet whisper hit the hero!",
  };

  function hazardForWorld(world = game.world) {
    return worldHazards[world] || worldHazards.colorado;
  }

  function projectileRadius(kind) {
    if (kind === "sandSkull" || kind === "swampBubble" || kind === "lassoRing" || kind === "shriekWave" || kind === "closetWhisper") return 17;
    if (kind === "horseshoe" || kind === "temptationFlame" || kind === "ghostHand") return 16;
    if (kind === "clawSlash" || kind === "darkChain") return 15;
    if (kind === "cactusThorn" || kind === "strawDart") return 12;
    if (kind === "dustRibbon" || kind === "roadLantern" || kind === "shadowSock") return 15;
    return 13;
  }

  function projectileSpeed(kind, stage) {
    const base = stage.boss ? 192 : 145;
    const multipliers = {
      cactusThorn: 1.14,
      sandSkull: 0.9,
      mosquito: 1.22,
      swampBubble: 0.86,
      clawSlash: 1.2,
      shriekWave: 0.98,
      horseshoe: 1.02,
      lassoRing: 0.88,
      tearDrop: 1.08,
      ghostHand: 0.92,
      shadowSock: 1.06,
      closetWhisper: 0.9,
      darkChain: 0.96,
      temptationFlame: 1.12,
      ghostMarble: 1.04,
      strawDart: 1.16,
      dustRibbon: 1.02,
      roadLantern: 0.88,
    };
    return base * (multipliers[kind] || 1);
  }

  function loseLife(reason = "tacalache") {
    game.lives -= 1;
    if (game.lives <= 0) {
      finish(false, reason);
      return;
    }

    const stage = stages[game.stageIndex];
    game.mode = "playing";
    game.pendingEnd = null;
    game.travel = null;
    game.prayer = 0;
    game.shake = 0;
    game.projectiles = [];
    game.fires = [];
    game.lightnings = [];
    game.effects = [];
    game.particles = [];
    game.sprayCooldown = 0;
    game.crosses.forEach((cross) => {
      cross.danger = 0;
    });
    game.player = { x: stage.start.x, y: stage.start.y, vx: 0, vy: 0, w: 78, h: 128, face: 1 };
    game.companion = { x: stage.start.x - 95, y: stage.start.y + 16, face: 1 };
    game.enemy = { ...stage.enemy, dir: -1, stun: 1.4 };
    game.nextSpitAt = game.time + 2.8;
    game.nextFireAt = game.time + 3.6;
    game.nextLightningAt = game.time + nextLightningDelay(stage, difficultySettings[game.difficulty] || difficultySettings.regular, 1 + game.stageIndex * 0.12, true);
    game.message = `${defeatMessages[reason] || defeatMessages.tacalache} Lives left: ${game.lives}`;
    updateHud();
  }

  function finish(win, reason = "tacalache") {
    game.mode = win ? "won" : "lost";
    if (win) {
      playVictory();
      if (!game.finalSequencePlayed) {
        game.finalSequencePlayed = true;
        playFinalSequence();
        return;
      }
    } else {
      playDanger();
    }
    endTitle.textContent = win ? "Game Complete / Juego Completo" : "Try Again / Intenta Otra Vez";
    if (win) {
      const redeemedName = redeemedNameForHero();
      endCopy.textContent = redemptionMessage(redeemedName);
    } else {
      endCopy.textContent = defeatMessages[reason] || defeatMessages.tacalache;
    }
    endScreen.classList.remove("hidden");
    againButton.focus();
  }

  function finishAfter(win, delay, reason = "tacalache") {
    game.mode = "ending";
    game.pendingEnd = { win, timer: delay, reason };
  }

  function showCharacterSelect() {
    game.mode = "title";
    game.stageClearTimer = 0;
    game.prayer = 0;
    game.shake = 0;
    game.particles = [];
    game.effects = [];
    game.projectiles = [];
    game.fires = [];
    game.lightnings = [];
    game.stars = [];
    game.rosaries = [];
    game.sprayCooldown = 0;
    game.rosaryCooldown = 0;
    game.pendingEnd = null;
    game.travel = null;
    titleScreen.classList.remove("hidden");
    introScreen.classList.add("hidden");
    finalScreen.classList.add("hidden");
    helpScreen.classList.add("hidden");
    creditsScreen.classList.add("hidden");
    endScreen.classList.add("hidden");
    game.message = "Choose hero and companion. Elige heroe y compania.";
    startButton.focus();
  }

  function inputVector() {
    let x = 0;
    let y = 0;
    if (keys.has("ArrowLeft") || keys.has("KeyA")) x -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) x += 1;
    if (keys.has("ArrowUp") || keys.has("KeyW")) y -= 1;
    if (keys.has("ArrowDown") || keys.has("KeyS")) y += 1;
    x += joy.x;
    y += joy.y;
    if (touchMove.active) {
      const dx = touchMove.x - game.player.x;
      const dy = touchMove.y - game.player.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 18) {
        x += dx / distance;
        y += dy / distance;
      }
    }
    const len = Math.hypot(x, y);
    return len > 1 ? { x: x / len, y: y / len } : { x, y };
  }

  function makeStar(stage) {
    let x = 280 + Math.random() * 760;
    let y = 385 + Math.random() * 155;
    for (let i = 0; i < 20; i += 1) {
      x = 220 + Math.random() * 850;
      y = 365 + Math.random() * 190;
      const nearCross = stage.crosses.some((cross) => Math.hypot(cross.x - x, cross.y - y) < 110);
      const nearStart = Math.hypot(stage.start.x - x, stage.start.y - y) < 170;
      if (!nearCross && !nearStart) break;
    }
    return { x, y, got: false, phase: Math.random() * Math.PI * 2 };
  }

  function generateCrosses(stage, index, difficulty) {
    const count = Math.max(3, (stage.crossCount || stage.crosses.length) + difficulty.crossBonus + Math.floor(index / 2));
    const crosses = [];
    const minGap = stage.boss ? 150 : 128;
    for (let i = 0; i < count; i += 1) {
      let chosen = null;
      for (let attempt = 0; attempt < 70; attempt += 1) {
        const x = 220 + Math.random() * 900;
        const y = 360 + Math.random() * 175;
        const nearStart = Math.hypot(stage.start.x - x, stage.start.y - y) < 155;
        const nearEnemy = Math.hypot(stage.enemy.x - x, stage.enemy.y - y) < 130;
        const nearCross = crosses.some((cross) => Math.hypot(cross.x - x, cross.y - y) < minGap);
        if (!nearStart && !nearEnemy && !nearCross) {
          chosen = { x: Math.round(x), y: Math.round(y), got: false, danger: 0 };
          break;
        }
      }
      if (!chosen) {
        const guide = stage.crosses[i % stage.crosses.length];
        chosen = {
          x: clamp(Math.round(guide.x + (Math.random() - 0.5) * 150), 190, 1140),
          y: clamp(Math.round(guide.y + (Math.random() - 0.5) * 90), 350, 555),
          got: false,
          danger: 0,
        };
      }
      crosses.push(chosen);
    }
    return crosses;
  }

  function makeRosary(stage) {
    let x = 300 + Math.random() * 700;
    let y = 370 + Math.random() * 170;
    for (let i = 0; i < 24; i += 1) {
      x = 235 + Math.random() * 820;
      y = 365 + Math.random() * 190;
      const nearCross = stage.crosses.some((cross) => Math.hypot(cross.x - x, cross.y - y) < 120);
      const nearStart = Math.hypot(stage.start.x - x, stage.start.y - y) < 210;
      const nearSpray = game.stars.some((star) => Math.hypot(star.x - x, star.y - y) < 140);
      if (!nearCross && !nearStart && !nearSpray) break;
    }
    return { x, y, got: false, phase: Math.random() * Math.PI * 2 };
  }

  function updateHud() {
    lightFill.style.width = `${game.lux}%`;
    scoreText.textContent = `Crux ${game.collected} / ${game.crosses.length}`;
    livesText.textContent = `Lives ${game.lives}`;
    sprayText.textContent = `Holy Water ${game.sprayAmmo}`;
    rosaryText.textContent = `Rosary ${game.rosaryAmmo}`;
  }

  function pray() {
    if (game.mode !== "playing" || game.lux < 28) return;
    initAudio();
    const stage = stages[game.stageIndex];
    game.prayer = 1.15;
    game.lux = Math.max(0, game.lux - 28);
    game.message = "Crux Sacra Sit Mihi Lux";
    playPrayer();
    burst(game.player.x, game.player.y - 70, 30, "#f8dc71");
    const enemyDistance = Math.hypot(game.enemy.x - game.player.x, game.enemy.y - game.player.y);
    if (enemyDistance < 360) {
      game.enemy.stun = 2.4;
      game.enemy.x += game.enemy.x < game.player.x ? -110 : 110;
      game.shake = 0.25;
    }
    if (stage.boss && game.collected === game.crosses.length && enemyDistance < 430) {
      completeStage();
    }
  }

  function useSpray() {
    if (game.mode !== "playing" || game.sprayAmmo <= 0 || game.sprayCooldown > 0) return;
    initAudio();
    resumeAudio();
    game.sprayAmmo -= 1;
    game.sprayCooldown = 0.42;
    const p = game.player;
    const dir = p.face >= 0 ? 1 : -1;
    const originX = p.x + dir * 38;
    const originY = p.y - 72;
    let cleared = 0;

    game.effects.push({ type: "spray", x: originX, y: originY, dir, life: 0.42, maxLife: 0.42 });
    burst(originX + dir * 120, originY, 18, "#9ee7ff");
    playSpray();

    game.projectiles = game.projectiles.filter((hazard) => {
      const dx = (hazard.x - originX) * dir;
      const dy = Math.abs(hazard.y - originY);
      const hit = dx > -20 && dx < 360 && dy < 115;
      if (hit) {
        cleared += 1;
        burst(hazard.x, hazard.y, 16, "#9ee7ff");
      }
      return !hit;
    });

    game.fires = game.fires.filter((fire) => {
      const dx = (fire.x - originX) * dir;
      const dy = Math.abs(fire.y - (originY + 62));
      const hit = dx > -30 && dx < 330 && dy < 145;
      if (hit) {
        cleared += 1;
        burst(fire.x, fire.y, 24, "#baf3ff");
      }
      return !hit;
    });

    game.message = cleared > 0
      ? "Holy Water protected the family! / El Agua Bendita protegió a la familia!"
      : "Holy Water ready / Agua Bendita lista";
  }

  function useRosary() {
    if (game.mode !== "playing" || game.rosaryAmmo <= 0 || game.rosaryCooldown > 0) return;
    initAudio();
    resumeAudio();
    game.rosaryAmmo -= 1;
    game.rosaryCooldown = 1.25;
    game.prayer = 1.85;
    game.shake = 0.28;
    const cleared = game.projectiles.length + game.fires.length;

    for (const hazard of game.projectiles) burst(hazard.x, hazard.y, 22, "#fff4a8");
    for (const fire of game.fires) burst(fire.x, fire.y, 28, "#fff4a8");
    game.projectiles = [];
    game.fires = [];
    game.crosses.forEach((cross) => {
      cross.danger = Math.max(0, cross.danger - 0.6);
    });
    game.enemy.stun = Math.max(game.enemy.stun, 3.2);
    game.enemy.x = clamp(game.enemy.x + (game.enemy.x < game.player.x ? -160 : 160), stages[game.stageIndex].enemy.minX, stages[game.stageIndex].enemy.maxX);
    game.effects.push({ type: "rosary", x: game.player.x, y: game.player.y - 78, life: 1.85, maxLife: 1.85 });
    burst(game.player.x, game.player.y - 78, 46, "#fff4a8");
    playRosary();
    game.message = cleared > 0
      ? "Pater Noster cleared hazards! / Padre Nuestro limpio peligros!"
      : "Pater Noster, qui es in caelis";
    updateHud();
  }

  function burst(x, y, count, color) {
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 170;
      game.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.45 + Math.random() * 0.55,
        color,
      });
    }
  }

  function explosion(x, y) {
    game.effects.push({ type: "explosion", x, y, life: 1.7, maxLife: 1.7 });
    for (let i = 0; i < 110; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const s = 120 + Math.random() * 320;
      game.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.65 + Math.random() * 0.8,
        color: i % 3 === 0 ? "#fff4a8" : i % 3 === 1 ? "#ff9d36" : "#ff4334",
      });
    }
  }

  function seedFires(count) {
    for (let i = 0; i < count; i += 1) spawnFire();
  }

  function spawnFire() {
    if (game.fires.length >= 6) return;
    const x = 230 + Math.random() * 830;
    const y = 455 + Math.random() * 130;
    if (Math.hypot(x - game.player.x, y - game.player.y) < 180) return;
    game.fires.push({
      x,
      y,
      r: 18 + Math.random() * 10,
      life: 8 + Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
    });
    playFire();
  }

  function update(dt) {
    if (game.mode === "paused") return;
    if (game.mode !== "playing" && game.mode !== "ending" && game.mode !== "travel") return;
    game.time += dt;
    game.prayer = Math.max(0, game.prayer - dt);
    game.shake = Math.max(0, game.shake - dt);
    game.sprayCooldown = Math.max(0, game.sprayCooldown - dt);
    game.rosaryCooldown = Math.max(0, game.rosaryCooldown - dt);
    const stage = stages[game.stageIndex];

    if (game.mode === "travel") {
      updateTravel(dt);
      updateParticles(dt);
      updateEffects(dt);
      updateHud();
      return;
    }

    if (game.mode === "ending") {
      game.pendingEnd.timer -= dt;
      updateParticles(dt);
      updateEffects(dt);
      if (game.pendingEnd.timer <= 0) {
        if (game.pendingEnd.win) finish(true);
        else loseLife(game.pendingEnd.reason);
      }
      return;
    }

    if (game.stageClearTimer > 0) {
      game.stageClearTimer -= dt;
      if (game.stageClearTimer <= 0) advanceStage();
      updateParticles(dt);
      updateEffects(dt);
      updateHud();
      return;
    }

    const p = game.player;
    const v = inputVector();
    const speed = 245;
    p.vx = v.x * speed;
    p.vy = v.y * speed * 0.72;
    if (Math.abs(v.x) > 0.05) p.face = v.x > 0 ? 1 : -1;
    p.x = clamp(p.x + p.vx * dt, 80, 1190);
    p.y = clamp(p.y + p.vy * dt, 340, 620);
    if (touchMove.active && Math.hypot(touchMove.x - p.x, touchMove.y - p.y) < 22) {
      touchMove.active = false;
      touchMove.id = null;
    }

    const companionOffset = p.face >= 0 ? -102 : 102;
    follow(game.companion, p.x + companionOffset, p.y + 14, dt, 4.9);
    game.companion.face = p.face;

    const e = game.enemy;
    if (e.stun > 0) {
      e.stun -= dt;
    } else {
      const chase = game.collected >= stage.enemy.chaseAfter ? Math.sign(p.x - e.x) : e.dir;
      e.x += chase * (stage.enemy.speed + game.collected * 7) * dt;
      if (e.x < stage.enemy.minX) e.dir = 1;
      if (e.x > stage.enemy.maxX) e.dir = -1;
      e.y += Math.sin(game.time * 1.7) * 7 * dt;
    }
    e.x = clamp(e.x, stage.enemy.minX, stage.enemy.maxX);
    e.y = clamp(e.y, 410, 560);

    for (const cross of game.crosses) {
      if (!cross.got && Math.hypot(cross.x - p.x, cross.y - (p.y - 80)) < 54) {
        cross.got = true;
        cross.danger = 0;
        game.collected += 1;
        game.lux = Math.min(100, game.lux + 22);
        playPickup();
        game.message = game.collected < game.crosses.length
          ? "Lux collected / Luz encontrada"
          : stage.boss
            ? `Pray near ${currentVillain()} / Reza cerca de ${currentVillain()}`
            : "Stage clear / Nivel superado";
        burst(cross.x, cross.y, 18, "#fff4a8");
      }
    }

    for (const star of game.stars) {
      if (!star.got && Math.hypot(star.x - p.x, star.y - (p.y - 70)) < 55) {
        star.got = true;
        game.sprayAmmo += 1;
        game.message = "Holy Water +1 / Agua Bendita +1";
        playPickup();
        burst(star.x, star.y, 24, "#9ee7ff");
      }
    }

    for (const rosary of game.rosaries) {
      if (!rosary.got && Math.hypot(rosary.x - p.x, rosary.y - (p.y - 70)) < 58) {
        rosary.got = true;
        game.rosaryAmmo += 1;
        game.message = "Rosary power +1 / Rosario +1";
        playPickup();
        burst(rosary.x, rosary.y, 32, "#fff4a8");
      }
    }

    updateCrossDanger(dt, stage);
    updateHazards(dt, stage);

    if (!stage.boss && game.collected === game.crosses.length) {
      completeStage();
    }

    const danger = Math.hypot(e.x - p.x, e.y - p.y);
    if (danger < 76 && game.prayer <= 0 && e.stun <= 0) {
      loseLife("tacalache");
    }

    updateMusic();
    updateParticles(dt);
    updateEffects(dt);
    updateHud();
  }

  function updateParticles(dt) {
    game.particles = game.particles.filter((part) => {
      part.life -= dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.vy += 90 * dt;
      return part.life > 0;
    });
  }

  function updateEffects(dt) {
    game.effects = game.effects.filter((effect) => {
      effect.life -= dt;
      return effect.life > 0;
    });
  }

  function updateHazards(dt, stage) {
    const difficulty = difficultySettings[game.difficulty] || difficultySettings.regular;
    const ramp = 1 + game.stageIndex * 0.12;
    if (game.time > game.nextSpitAt && game.enemy.stun <= 0) {
      spawnProjectile(stage);
      game.nextSpitAt = game.time + ((stage.boss ? 1.45 : 2.8) + Math.random() * 1.25) * difficulty.hazards / ramp;
    }
    if (game.time > game.nextFireAt) {
      spawnFire();
      game.nextFireAt = game.time + (stage.boss ? 2.4 : 4.8 + Math.random() * 3.6) * difficulty.hazards / ramp;
    }
    if (game.time > game.nextLightningAt) {
      spawnLightning(stage, difficulty);
      game.nextLightningAt = game.time + nextLightningDelay(stage, difficulty, ramp);
    }

    const p = game.player;
    game.projectiles = game.projectiles.filter((hazard) => {
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      hazard.spin += dt * hazard.spinSpeed;
      hazard.life -= dt;
      if (Math.hypot(hazard.x - p.x, hazard.y - (p.y - 55)) < hazard.r + 30) {
        game.message = projectileNames[hazard.kind] || "A projectile hit the hero!";
        playDanger();
        finishAfter(false, 0.55, hazard.kind);
        return false;
      }
      return hazard.life > 0 && hazard.x > -80 && hazard.x < W + 80 && hazard.y > 250 && hazard.y < H + 80;
    });

    game.fires = game.fires.filter((fire) => {
      fire.life -= dt;
      fire.phase += dt * 8;
      if (Math.hypot(fire.x - p.x, fire.y - (p.y - 25)) < fire.r + 22) {
        game.message = "Careful with the fire! Cuidado con el fuego!";
        burst(fire.x, fire.y, 24, "#ff9d36");
        playDanger();
        finishAfter(false, 0.55, "fire");
        return false;
      }
      return fire.life > 0;
    });

    game.lightnings = game.lightnings.filter((bolt) => {
      bolt.warning -= dt;
      bolt.life -= dt;
      if (!bolt.struck && bolt.warning <= 0) {
        bolt.struck = true;
        bolt.flash = 0.24;
        game.shake = Math.max(game.shake, 0.38);
        burst(bolt.x, bolt.y, 34, bolt.profile?.glow || "#dce9ff");
        playThunder();
      }
      if (bolt.flash > 0) bolt.flash -= dt;
      if (bolt.struck && bolt.flash > 0 && !bolt.hit) {
        const hit = Math.abs(p.x - bolt.x) < bolt.r && Math.abs((p.y - 45) - bolt.y) < 105;
        if (hit) {
          bolt.hit = true;
          game.message = "Lightning strike! / Rayo del cielo!";
          playDanger();
          finishAfter(false, 0.55, "lightning");
          return false;
        }
      }
      return bolt.life > 0;
    });
  }

  function nextLightningDelay(stage, difficulty, ramp, opening = false) {
    const profile = hazardForWorld().lightning;
    const base = stage.boss ? 2.25 : 3.25;
    const spread = stage.boss ? 1.25 : 1.9;
    const grace = opening ? 1.2 : 0;
    return grace + (base + Math.random() * spread) * difficulty.lightning * profile.delay / ramp;
  }

  function spawnLightning(stage, difficulty) {
    const profile = hazardForWorld().lightning;
    const warning = difficulty.lightningWarning * profile.warningTime;
    const targetHero = Math.random() < (stage.boss ? 0.58 : 0.42);
    const x = targetHero
      ? clamp(game.player.x + (Math.random() - 0.5) * 210, 135, 1165)
      : 170 + Math.random() * 940;
    const y = clamp(targetHero ? game.player.y - 30 + (Math.random() - 0.5) * 120 : 420 + Math.random() * 155, 365, 585);
    game.lightnings.push({
      x,
      y,
      r: (stage.boss ? 58 : 50) * profile.radius,
      warning,
      maxWarning: warning,
      life: warning + 0.42,
      segments: makeLightningSegments(y),
      profile,
      struck: false,
      hit: false,
      flash: 0,
      phase: Math.random() * Math.PI * 2,
    });
    if (game.lightnings.length > (stage.boss ? 3 : 2)) game.lightnings.shift();
    game.message = profile.message || "Thunder warning / Aviso de trueno";
    playWarning();
  }

  function makeLightningSegments(impactY) {
    const points = [{ x: 0, y: -impactY - 40 }];
    let x = 0;
    let y = -impactY - 40;
    while (y < 0) {
      x += (Math.random() - 0.5) * 42;
      y += 42 + Math.random() * 34;
      points.push({ x, y: Math.min(y, 0) });
    }
    return points;
  }

  function spawnProjectile(stage) {
    const p = game.player;
    const e = game.enemy;
    const targetX = p.x + (Math.random() - 0.5) * 80;
    const targetY = p.y - 60 + (Math.random() - 0.5) * 45;
    const dx = targetX - e.x;
    const dy = targetY - (e.y - 120);
    const len = Math.hypot(dx, dy) || 1;
    const kinds = hazardForWorld().projectiles;
    const kind = kinds[Math.floor(Math.random() * kinds.length)] || "rat";
    const speed = projectileSpeed(kind, stage);
    game.projectiles.push({
      kind,
      x: e.x,
      y: e.y - 120,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed,
      r: projectileRadius(kind),
      spin: 0,
      spinSpeed: (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 4),
      life: 5,
    });
    playSpit();
  }

  function updateCrossDanger(dt, stage) {
    const e = game.enemy;
    const difficulty = difficultySettings[game.difficulty] || difficultySettings.regular;
    const ramp = 1 + game.stageIndex * 0.11;
    for (const cross of game.crosses) {
      if (cross.got) continue;
      const distance = Math.hypot(cross.x - e.x, cross.y - (e.y - 95));
      const near = distance < (stage.boss ? 170 : 145) && e.stun <= 0;
      if (near) {
        cross.danger = Math.min(1, cross.danger + dt * (stage.boss ? 0.115 : 0.095) * difficulty.danger * ramp);
        game.message = "Save the Crux Sacra / Rescata la Crux Sacra";
        if (game.time > game.warningSoundAt) {
          playWarning();
          game.warningSoundAt = game.time + Math.max(0.32, 1.25 - cross.danger * 0.75);
        }
      } else {
        cross.danger = Math.max(0, cross.danger - dt * 0.22);
      }
      if (cross.danger >= 1) {
        explosion(cross.x, cross.y);
        game.shake = 0.65;
        game.message = "A cross exploded / Una cruz exploto";
        playExplosion();
        finishAfter(false, 1.25, "cross");
        return;
      }
    }
  }

  function follow(obj, tx, ty, dt, rate) {
    obj.x += (tx - obj.x) * Math.min(1, rate * dt);
    obj.y += (ty - obj.y) * Math.min(1, rate * dt);
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    if (game.shake > 0) {
      ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5);
    }
    drawBackground();
    drawHazards();
    drawLevelProps();
    drawCharacters();
    drawEffects();
    drawParticles();
    if (game.mode === "travel") drawTravelOverlay();
    drawMessage();
    if (game.mode === "paused") drawPauseOverlay();
    ctx.restore();
  }

  function drawBackground() {
    const stage = stages[game.stageIndex] || stages[0];
    ctx.drawImage(images[stage.bg], 0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(12, 20, 34, 0.08)");
    grad.addColorStop(0.68, "rgba(12, 20, 34, 0.00)");
    grad.addColorStop(1, "rgba(9, 14, 22, 0.30)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(7, 12, 19, 0.22)";
    ctx.fillRect(0, 630, W, 90);
    if (stage.cheering) drawCheeringHelpers(stage);
  }

  function drawCheeringHelpers(stage) {
    const helpers = ["elayitas", "angie", "ttitin", "tata", "abba", "nana", "mrsFavi", "mrChuy", "timmy", "guardian", "michael"];
    const spotsByStage = [
      [[88, 342], [176, 333], [1090, 345], [1180, 330]],
      [[90, 365], [182, 356], [1025, 348], [1132, 360]],
      [[760, 468], [832, 464], [908, 468], [1138, 330]],
      [[92, 380], [174, 372], [1018, 345], [1125, 340]],
      [[96, 420], [180, 412], [1038, 420], [1130, 410]],
      [[86, 402], [178, 392], [1015, 388], [1118, 380]],
    ];
    const spots = spotsByStage[game.stageIndex] || spotsByStage[0];
    ctx.save();
    spots.forEach(([x, y], index) => {
      const key = helpers[(game.stageIndex * 3 + index) % helpers.length];
      if (key === game.selectedHero || key === game.selectedCompanion) return;
      const def = characterDefs[key];
      if (!def) return;
      ctx.globalAlpha = key === "guardian" || key === "michael" ? 0.34 : 0.42;
      const bob = Math.sin(game.time * 1.8 + index) * 3;
      drawTinyHelper(def, x, y + bob, index % 2 === 0 ? 1 : -1);
    });
    ctx.restore();
  }

  function drawTinyHelper(def, x, groundY, face = 1) {
    const height = def.front === "timmyFront" ? 48 : def.front === "michael" || def.front === "angel" ? 70 : 58;
    if (def.animated && def.sheet && images[def.sheet]) {
      const cycle = frames[def.animated];
      const frame = cycle && cycle.length ? cycle[Math.floor(game.time * 2.5) % cycle.length] : null;
      if (frame) {
        drawFrame(images[def.sheet], frame, x, groundY, height, face);
        return;
      }
    }
    drawSprite(images[def.front], x, groundY, height, face);
  }

  function drawLevelProps() {
    const stage = stages[game.stageIndex] || stages[0];
    ctx.save();
    if (stage.helper === "angel" || stage.helper === "both") {
      ctx.globalAlpha = 0.9;
      ctx.drawImage(images.angel, 30, 205, 112, 138);
    }
    if (stage.helper === "michael" || stage.helper === "both") {
      ctx.globalAlpha = 0.82;
      ctx.drawImage(images.michael, 1120, 240, 96, 166);
    }
    ctx.restore();

    for (const cross of game.crosses) {
      if (cross.got) continue;
      drawCross(cross.x, cross.y, 0.7 + Math.sin(game.time * 4 + cross.x) * 0.05, cross.danger || 0);
    }

    for (const star of game.stars) {
      if (!star.got) drawStar(star.x, star.y, 0.9 + Math.sin(game.time * 5 + star.phase) * 0.08);
    }

    for (const rosary of game.rosaries) {
      if (!rosary.got) drawRosary(rosary.x, rosary.y, 0.92 + Math.sin(game.time * 4 + rosary.phase) * 0.07);
    }

    if (game.prayer > 0) {
      const maxPrayer = game.prayer > 1.15 ? 1.85 : 1.15;
      const prayerProgress = clamp(1 - game.prayer / maxPrayer, 0, 1);
      const r = 120 + prayerProgress * 240;
      ctx.save();
      ctx.globalAlpha = clamp(game.prayer / maxPrayer, 0, 1) * 0.55;
      ctx.strokeStyle = "#f8dc71";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(game.player.x, game.player.y - 70, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawHazards() {
    for (const fire of game.fires) {
      drawFire(fire);
    }
    for (const bolt of game.lightnings) {
      drawLightning(bolt);
    }
    for (const hazard of game.projectiles) {
      drawProjectile(hazard);
    }
  }

  function drawCharacters() {
    const stage = stages[game.stageIndex] || stages[0];
    const p = game.player;
    const moving = game.mode === "travel" || Math.hypot(p.vx, p.vy) > 8;
    const hero = characterDefs[game.selectedHero];
    const companion = characterDefs[game.selectedCompanion];
    drawCharacter(hero, p.x, p.y, p.face, moving, false);
    if (game.selectedCompanion !== game.selectedHero) {
      drawCharacter(companion, game.companion.x, game.companion.y, game.companion.face, true, true);
    }

    drawVillain(stage);
  }

  function drawCharacter(def, x, groundY, face = 1, moving = false, companion = false) {
    if (!def) return;
    const height = def.height;
    const useMovementFrames = moving || def.animated === "redeemedWalk";
    if (def.animated && useMovementFrames) {
      const cycle = frames[def.animated];
      const speed = def.animated === "timmyRun" ? 10 : def.animated === "elayitasRun" ? 11 : def.redeemedMotion ? 9 : def.animated === "redeemedWalk" ? 7 : 8;
      const frameIndex = Math.floor(game.time * speed) % cycle.length;
      const frame = cycle[frameIndex];
      drawFrame(images[def.sheet], frame, x, groundY, height, face, def.redeemedMotion ? frameIndex : null);
      return;
    }
    if (def.animated) {
      const cycle = frames[def.animated];
      const idleIndex = Math.min(def.idleFrame || 0, cycle.length - 1);
      drawFrame(images[def.sheet], cycle[idleIndex], x, groundY, height, face);
      return;
    }
    drawSprite(images[def.front], x, groundY, height, face);
  }

  function drawTravelOverlay() {
    const travel = game.travel;
    if (!travel) return;
    const t = clamp(travel.timer / travel.duration, 0, 1);
    ctx.save();
    if (travel.kind === "world") {
      ctx.fillStyle = `rgba(5, 10, 18, ${0.22 + Math.sin(t * Math.PI) * 0.34})`;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(8, 14, 24, 0.88)";
      ctx.strokeStyle = "rgba(248, 220, 113, 0.66)";
      ctx.lineWidth = 3;
      roundRect(116, 82, 1048, 298, 16);
      ctx.fill();
      ctx.stroke();

      drawTravelPostcard(images[travel.fromStageKey], 156, 142, 360, 162, travel.fromLabel, 1 - t * 0.18);
      drawTravelPostcard(images[travel.toStageKey], 764, 142, 360, 162, travel.toLabel, 0.72 + t * 0.28);

      const routeStart = 520;
      const routeEnd = 760;
      const routeY = 220;
      ctx.strokeStyle = "rgba(255, 248, 211, 0.46)";
      ctx.lineWidth = 8;
      ctx.setLineDash([18, 14]);
      ctx.beginPath();
      ctx.moveTo(routeStart, routeY);
      ctx.quadraticCurveTo(W / 2, routeY - 78, routeEnd, routeY);
      ctx.stroke();
      ctx.setLineDash([]);

      const travelerX = routeStart + (routeEnd - routeStart) * t;
      const travelerY = routeY - Math.sin(t * Math.PI) * 60;
      ctx.fillStyle = "#fff4a8";
      ctx.shadowColor = "#fff4a8";
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(travelerX, travelerY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#fff8d3";
      ctx.font = "700 30px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Next World / Siguiente Mundo", W / 2, 124);
      ctx.font = "700 20px Arial, Helvetica, sans-serif";
      ctx.fillStyle = "rgba(255, 248, 211, 0.82)";
      ctx.fillText("A new adventure opens ahead", W / 2, 344);
    } else {
      ctx.fillStyle = "rgba(8, 14, 24, 0.68)";
      ctx.strokeStyle = "rgba(248, 220, 113, 0.5)";
      ctx.lineWidth = 2;
      roundRect(770, 582, 454, 58, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff8d3";
      ctx.font = "700 22px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Next level / Siguiente nivel", 997, 617);
    }
    ctx.restore();
  }

  function drawTravelPostcard(img, x, y, w, h, label, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(6, 11, 18, 0.92)";
    ctx.strokeStyle = "rgba(255, 248, 211, 0.62)";
    ctx.lineWidth = 3;
    roundRect(x - 8, y - 8, w + 16, h + 58, 12);
    ctx.fill();
    ctx.stroke();
    if (img) {
      ctx.save();
      ctx.beginPath();
      roundRect(x, y, w, h, 8);
      ctx.clip();
      drawImageCover(img, x, y, w, h);
      ctx.fillStyle = "rgba(6, 11, 18, 0.16)";
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    }
    ctx.fillStyle = "#fff8d3";
    ctx.font = "700 22px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h + 36);
    ctx.restore();
  }

  function drawImageCover(img, x, y, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function villainImage() {
    if (game.world === "useast") return images.swampShadow;
    if (game.world === "elpaso") return images.elChupacabras;
    if (game.world === "guadalajara") return images.elCharroNegro;
    if (game.world === "mexicocity") return images.laLlorona;
    if (game.world === "elcoco") return images.elCoco;
    if (game.world === "holymountain") return images.theDevil;
    if (game.world === "saints") return images.prairieBoy;
    if (game.world === "elrancho") return images.laAparecidaCarretera;
    return game.world === "juarez" ? images.elCucuy : images.tacalache;
  }

  function villainGlow(stage) {
    if (game.world === "useast") {
      return stage.boss ? "rgba(99, 255, 77, 0.95)" : "rgba(67, 229, 86, 0.78)";
    }
    if (game.world === "elpaso") {
      return stage.boss ? "rgba(199, 126, 255, 0.95)" : "rgba(143, 72, 215, 0.78)";
    }
    if (game.world === "guadalajara") {
      return stage.boss ? "rgba(255, 62, 52, 0.95)" : "rgba(255, 178, 58, 0.75)";
    }
    if (game.world === "mexicocity") {
      return stage.boss ? "rgba(189, 239, 255, 0.95)" : "rgba(119, 220, 255, 0.78)";
    }
    if (game.world === "elcoco") {
      return stage.boss ? "rgba(181, 140, 255, 0.98)" : "rgba(255, 244, 168, 0.75)";
    }
    if (game.world === "holymountain") {
      return stage.boss ? "rgba(255, 244, 168, 0.98)" : "rgba(255, 77, 54, 0.78)";
    }
    if (game.world === "saints") {
      return stage.boss ? "rgba(190, 240, 255, 0.98)" : "rgba(98, 225, 255, 0.78)";
    }
    if (game.world === "elrancho") {
      return stage.boss ? "rgba(242, 184, 109, 0.98)" : "rgba(83, 217, 224, 0.78)";
    }
    if (game.world === "juarez") {
      return stage.boss ? "rgba(22, 10, 45, 0.95)" : "rgba(35, 196, 255, 0.78)";
    }
    return stage.boss ? "rgba(255, 45, 30, 0.92)" : "rgba(190, 20, 25, 0.75)";
  }

  function drawVillain(stage) {
    const e = game.enemy;
    const img = villainImage();
    if (!img) return;
    const bob = Math.sin(game.time * 5) * 4;
    const cucuyBoost = game.world === "juarez" ? 1.12 : 1;
    const artBoost = game.world === "useast" ? 1.38 : game.world === "elpaso" ? 1.22 : game.world === "guadalajara" ? 1.18 : game.world === "mexicocity" ? 1.16 : game.world === "elcoco" ? 1.14 : game.world === "holymountain" ? 1.3 : game.world === "saints" ? 1.08 : game.world === "elrancho" ? 1.14 : 1;
    const h = (stage.boss ? (e.stun > 0 ? 285 : 320) : (e.stun > 0 ? 180 : 205)) * cucuyBoost * artBoost;
    const w = (img.width / img.height) * h;
    ctx.save();
    if (stage.boss && game.world === "juarez") drawCucuyBossAura(e.x, e.y - h + bob, w, h);
    if (stage.boss && (game.world === "useast" || game.world === "elpaso" || game.world === "guadalajara" || game.world === "mexicocity" || game.world === "elcoco" || game.world === "holymountain" || game.world === "elrancho")) {
      const aura = game.world === "useast" ? "#63ff4d" : game.world === "elpaso" ? "#c77eff" : game.world === "guadalajara" ? "#ff4638" : game.world === "mexicocity" ? "#bdefff" : game.world === "elcoco" ? "#b58cff" : game.world === "elrancho" ? "#f2b86d" : "#fff4a8";
      drawWorldBossAura(e.x, e.y - h + bob, w, h, aura);
    }
    ctx.globalAlpha = e.stun > 0 ? 0.55 + Math.sin(game.time * 22) * 0.18 : 1;
    ctx.shadowColor = villainGlow(stage);
    ctx.shadowBlur = e.stun > 0 ? 8 : stage.boss && game.world === "juarez" ? 64 : stage.boss ? 52 : 30;
    ctx.drawImage(img, e.x - w / 2, e.y - h + bob, w, h);
    if (stage.boss && game.world === "juarez") drawCucuyBossEyes(e.x, e.y - h + bob, w, h);
    ctx.restore();
  }

  function drawWorldBossAura(x, top, w, h, color) {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(x, top + h * 0.58, h * (0.34 + i * 0.09), game.time * 0.7 + i, Math.PI * 1.25 + game.time * 0.7 + i);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawChupacabras(stage) {
    const e = game.enemy;
    const boss = Boolean(stage.boss);
    const bob = Math.sin(game.time * (boss ? 5.4 : 6.8)) * (boss ? 5 : 4);
    const scale = boss ? 1.42 : 1;
    const bodyW = 190 * scale;
    const bodyH = 92 * scale;
    const x = e.x;
    const y = e.y - bodyH * 0.35 + bob;
    ctx.save();
    ctx.globalAlpha = e.stun > 0 ? 0.58 + Math.sin(game.time * 20) * 0.16 : 1;
    ctx.shadowColor = boss ? "#c77eff" : "#9d55dd";
    ctx.shadowBlur = e.stun > 0 ? 9 : boss ? 48 : 26;

    const aura = ctx.createRadialGradient(x, y, 20, x, y, bodyW * 0.72);
    aura.addColorStop(0, boss ? "rgba(199,126,255,0.22)" : "rgba(143,72,215,0.16)");
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(x, y + bodyH * 0.24, bodyW * 0.92, bodyH * 0.86, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = boss ? "#21182e" : "#2d2437";
    ctx.strokeStyle = boss ? "#c77eff" : "#7b4aae";
    ctx.lineWidth = boss ? 6 : 4;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x - bodyW * 0.48, y + bodyH * 0.2);
    ctx.quadraticCurveTo(x - bodyW * 0.18, y - bodyH * 0.35, x + bodyW * 0.3, y - bodyH * 0.08);
    ctx.quadraticCurveTo(x + bodyW * 0.62, y + bodyH * 0.02, x + bodyW * 0.56, y + bodyH * 0.28);
    ctx.quadraticCurveTo(x + bodyW * 0.12, y + bodyH * 0.52, x - bodyW * 0.5, y + bodyH * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = boss ? "#b386d8" : "#745a91";
    for (let i = 0; i < (boss ? 9 : 7); i += 1) {
      const px = x - bodyW * 0.26 + i * bodyW * 0.08;
      const py = y - bodyH * (0.16 + (i % 2) * 0.05);
      ctx.beginPath();
      ctx.moveTo(px, py + bodyH * 0.14);
      ctx.lineTo(px + bodyW * 0.035, py - bodyH * (boss ? 0.42 : 0.32));
      ctx.lineTo(px + bodyW * 0.075, py + bodyH * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = boss ? "#2b203c" : "#342943";
    ctx.beginPath();
    ctx.moveTo(x + bodyW * 0.3, y - bodyH * 0.12);
    ctx.lineTo(x + bodyW * 0.42, y - bodyH * 0.58);
    ctx.lineTo(x + bodyW * 0.5, y - bodyH * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + bodyW * 0.16, y - bodyH * 0.12);
    ctx.lineTo(x + bodyW * 0.21, y - bodyH * 0.5);
    ctx.lineTo(x + bodyW * 0.28, y - bodyH * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#251b30";
    ctx.lineWidth = boss ? 13 : 9;
    ctx.lineCap = "round";
    const legBase = y + bodyH * 0.32;
    for (let i = 0; i < 4; i += 1) {
      const lx = x - bodyW * 0.32 + i * bodyW * 0.22;
      const phase = Math.sin(game.time * 7 + i);
      ctx.beginPath();
      ctx.moveTo(lx, legBase);
      ctx.quadraticCurveTo(lx + phase * 14, legBase + bodyH * 0.35, lx + (i % 2 ? 28 : -24), legBase + bodyH * 0.56);
      ctx.stroke();
    }
    ctx.strokeStyle = boss ? "#caa1e9" : "#a984c8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - bodyW * 0.46, y + bodyH * 0.22);
    ctx.quadraticCurveTo(x - bodyW * 0.78, y - bodyH * 0.08, x - bodyW * 0.92, y + bodyH * 0.04);
    ctx.stroke();

    ctx.fillStyle = "#d577ff";
    ctx.shadowColor = "#d577ff";
    ctx.shadowBlur = boss ? 25 : 17;
    ctx.beginPath();
    ctx.ellipse(x + bodyW * 0.34, y + bodyH * 0.02, boss ? 12 : 9, boss ? 7 : 5, -0.12, 0, Math.PI * 2);
    ctx.ellipse(x + bodyW * 0.47, y + bodyH * 0.02, boss ? 12 : 9, boss ? 7 : 5, 0.12, 0, Math.PI * 2);
    ctx.fill();

    if (boss) {
      ctx.strokeStyle = "rgba(199,126,255,0.5)";
      ctx.lineWidth = 5;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(x, y + bodyH * 0.2, bodyW * (0.48 + i * 0.14), game.time * 0.7 + i, Math.PI * 1.2 + game.time * 0.7 + i);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawCharroNegro(stage) {
    const e = game.enemy;
    const boss = Boolean(stage.boss);
    const bob = Math.sin(game.time * 3.2) * (boss ? 5 : 4);
    const x = e.x;
    const y = e.y + bob;
    ctx.save();
    ctx.globalAlpha = e.stun > 0 ? 0.58 + Math.sin(game.time * 20) * 0.16 : 1;
    ctx.shadowColor = boss ? "#ff4638" : "#ffba4a";
    ctx.shadowBlur = e.stun > 0 ? 8 : boss ? 52 : 30;

    if (boss) {
      ctx.fillStyle = "rgba(20, 7, 8, 0.82)";
      ctx.strokeStyle = "#ff4638";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(x, y - 40, 150, 56, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#111015";
      ctx.beginPath();
      ctx.ellipse(x - 25, y - 78, 98, 72, -0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#151319";
      ctx.beginPath();
      ctx.ellipse(x + 58, y - 96, 45, 32, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#b98931";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x - 90, y - 82);
      ctx.quadraticCurveTo(x - 55, y - 128, x + 38, y - 122);
      ctx.stroke();
      ctx.strokeStyle = "#ff4638";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x + 2, y - 210, 48, 0.08, Math.PI * 1.95);
      ctx.stroke();
      ctx.fillStyle = "#1a1315";
      ctx.strokeStyle = "#d9a63d";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(x + 6, y - 214, 62, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#d9a63d";
      ctx.beginPath();
      ctx.arc(x + 6, y - 190, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#161217";
      ctx.strokeStyle = "#d9a63d";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 20, y - 180);
      ctx.lineTo(x + 36, y - 180);
      ctx.lineTo(x + 48, y - 70);
      ctx.lineTo(x - 28, y - 70);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,70,56,0.72)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(x + 15, y - 86, 128, -0.2 + game.time * 0.5, Math.PI * 1.35 + game.time * 0.5);
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(8, 7, 9, 0.8)";
      ctx.beginPath();
      ctx.ellipse(x, y - 26, 55, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111015";
      ctx.strokeStyle = "#d9a63d";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(x, y - 172, 62, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 30, y - 174);
      ctx.quadraticCurveTo(x, y - 214, x + 30, y - 174);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#141217";
      ctx.strokeStyle = "#d9a63d";
      ctx.lineWidth = 4;
      ctx.beginPath();
      roundRect(x - 34, y - 158, 68, 126, 14);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#ff4638";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x + 10, y - 108, 88, -0.2 + game.time * 0.8, Math.PI * 1.3 + game.time * 0.8);
      ctx.stroke();
      ctx.fillStyle = "#ff4838";
      ctx.shadowColor = "#ff4838";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.ellipse(x - 13, y - 160, 7, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 13, y - 160, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#141217";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - 18, y - 36);
      ctx.lineTo(x - 32, y + 8);
      ctx.moveTo(x + 18, y - 36);
      ctx.lineTo(x + 35, y + 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCucuyBossAura(x, top, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    const pulse = 0.78 + Math.sin(game.time * 5) * 0.08;
    const aura = ctx.createRadialGradient(x, top + h * 0.52, 20, x, top + h * 0.52, h * 0.72);
    aura.addColorStop(0, "rgba(35, 10, 62, 0.40)");
    aura.addColorStop(0.45, "rgba(18, 38, 58, 0.28)");
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.globalAlpha = pulse;
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(x, top + h * 0.55, w * 0.95, h * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.33;
    ctx.fillStyle = "#151018";
    for (let i = 0; i < 9; i += 1) {
      const phase = game.time * 1.6 + i * 1.9;
      const px = x + Math.cos(phase) * (w * (0.36 + (i % 3) * 0.1));
      const py = top + h * (0.36 + (i % 4) * 0.12) + Math.sin(phase * 1.2) * 16;
      ctx.beginPath();
      ctx.ellipse(px, py, 22 + (i % 3) * 10, 14 + (i % 2) * 8, phase * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCucuyBossEyes(x, top, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.5 + Math.sin(game.time * 13) * 0.18;
    ctx.shadowColor = "#ff4438";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#ff3f34";
    ctx.beginPath();
    ctx.ellipse(x - w * 0.08, top + h * 0.28, 7, 4, -0.18, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.08, top + h * 0.28, 7, 4, 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBossDevilMarks(x, top, w, h) {
    ctx.save();
    const hornY = top + h * 0.16;
    ctx.fillStyle = "#ff4334";
    ctx.strokeStyle = "#4d0606";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.20, hornY);
    ctx.quadraticCurveTo(x - w * 0.34, hornY - 78, x - w * 0.08, hornY - 36);
    ctx.quadraticCurveTo(x - w * 0.16, hornY - 18, x - w * 0.20, hornY);
    ctx.moveTo(x + w * 0.20, hornY);
    ctx.quadraticCurveTo(x + w * 0.34, hornY - 78, x + w * 0.08, hornY - 36);
    ctx.quadraticCurveTo(x + w * 0.16, hornY - 18, x + w * 0.20, hornY);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 0.35 + Math.sin(game.time * 8) * 0.12;
    ctx.fillStyle = "#ff4334";
    ctx.beginPath();
    ctx.arc(x, top + h * 0.55, 130 + Math.sin(game.time * 5) * 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawFire(fire) {
    const flicker = Math.sin(game.time * 14 + fire.phase) * 4;
    ctx.save();
    ctx.translate(fire.x, fire.y);
    ctx.globalAlpha = Math.min(1, fire.life / 1.2);
    ctx.fillStyle = "rgba(80, 15, 10, 0.35)";
    ctx.beginPath();
    ctx.ellipse(0, 10, fire.r * 1.4, fire.r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff4334";
    ctx.beginPath();
    ctx.moveTo(-fire.r, 8);
    ctx.quadraticCurveTo(-fire.r * 0.45, -fire.r * 0.9 - flicker, 0, 6);
    ctx.quadraticCurveTo(fire.r * 0.45, -fire.r * 1.2 + flicker, fire.r, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffd36a";
    ctx.beginPath();
    ctx.moveTo(-fire.r * 0.42, 8);
    ctx.quadraticCurveTo(0, -fire.r * 0.75 + flicker * 0.4, fire.r * 0.42, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawProjectile(hazard) {
    ctx.save();
    ctx.translate(hazard.x, hazard.y);
    ctx.rotate(hazard.spin);
    if (hazard.kind === "fireball" || hazard.kind === "temptationFlame") {
      const r = hazard.r + Math.sin(game.time * 20) * 3;
      ctx.shadowColor = "#ff4334";
      ctx.shadowBlur = 22;
      ctx.fillStyle = "#ff4334";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd36a";
      ctx.beginPath();
      ctx.arc(-4, -3, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ff9d36";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.quadraticCurveTo(-r * 2.2, -18, -r * 3.2, 5);
      ctx.stroke();
    } else if (hazard.kind === "cactusThorn" || hazard.kind === "strawDart") {
      ctx.shadowColor = hazard.kind === "cactusThorn" ? "#a6d46b" : "#f3d488";
      ctx.shadowBlur = 10;
      ctx.fillStyle = hazard.kind === "cactusThorn" ? "#5f8d45" : "#d6aa55";
      ctx.strokeStyle = hazard.kind === "cactusThorn" ? "#233d22" : "#5d3c18";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(-18, -8);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-18, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (hazard.kind === "cactusThorn") {
        ctx.strokeStyle = "#d9efb0";
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(8, -9);
        ctx.moveTo(2, 1);
        ctx.lineTo(13, 8);
        ctx.stroke();
      }
    } else if (hazard.kind === "sandSkull") {
      ctx.shadowColor = "#f1c77b";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#c99a52";
      ctx.beginPath();
      ctx.arc(0, -1, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7b4d22";
      ctx.beginPath();
      ctx.arc(-6, -4, 3.5, 0, Math.PI * 2);
      ctx.arc(6, -4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-5, 7, 10, 4);
      ctx.strokeStyle = "rgba(244, 204, 130, 0.75)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-16, 8);
      ctx.quadraticCurveTo(-34, 0, -48, 9);
      ctx.stroke();
    } else if (hazard.kind === "mosquito") {
      ctx.shadowColor = "#98ffdf";
      ctx.shadowBlur = 9;
      ctx.fillStyle = "#1f2c27";
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94fff1";
      ctx.globalAlpha = 0.62;
      ctx.beginPath();
      ctx.ellipse(-2, -8, 10, 5, -0.55, 0, Math.PI * 2);
      ctx.ellipse(-2, 8, 10, 5, 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#1f2c27";
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-2 + i * 5, 3);
        ctx.lineTo(-10 + i * 5, 13);
        ctx.moveTo(-2 + i * 5, -3);
        ctx.lineTo(-10 + i * 5, -13);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(28, -3);
      ctx.stroke();
    } else if (hazard.kind === "swampBubble") {
      ctx.shadowColor = "#70ff9a";
      ctx.shadowBlur = 16;
      const grad = ctx.createRadialGradient(-5, -5, 2, 0, 0, 18);
      grad.addColorStop(0, "rgba(225,255,202,0.95)");
      grad.addColorStop(0.45, "rgba(76,185,79,0.72)");
      grad.addColorStop(1, "rgba(31,79,39,0.42)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c6ffd1";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (hazard.kind === "clawSlash") {
      ctx.shadowColor = "#b973ff";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "#e4c1ff";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-18, -12 + i * 12);
        ctx.quadraticCurveTo(0, -2 + i * 8, 20, 10 + i * 6);
        ctx.stroke();
      }
    } else if (hazard.kind === "shriekWave") {
      ctx.shadowColor = "#c063ff";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = "#d9a6ff";
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(0, 0, 8 + i * 7, -0.85, 0.85);
        ctx.stroke();
      }
    } else if (hazard.kind === "horseshoe") {
      ctx.shadowColor = "#ffcf54";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "#d99b29";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, 15, Math.PI * 0.2, Math.PI * 1.8);
      ctx.stroke();
      ctx.fillStyle = "#5b3412";
      ctx.fillRect(-16, 8, 7, 8);
      ctx.fillRect(9, 8, 7, 8);
    } else if (hazard.kind === "lassoRing") {
      ctx.shadowColor = "#c88a30";
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "#d5a44e";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 12, 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-16, 6);
      ctx.quadraticCurveTo(-35, 18, -50, 3);
      ctx.stroke();
    } else if (hazard.kind === "tearDrop") {
      ctx.shadowColor = "#bdf5ff";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#85dfff";
      ctx.beginPath();
      ctx.moveTo(0, -19);
      ctx.bezierCurveTo(14, -2, 13, 16, 0, 18);
      ctx.bezierCurveTo(-13, 16, -14, -2, 0, -19);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.ellipse(-4, -5, 4, 7, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (hazard.kind === "ghostHand") {
      ctx.shadowColor = "#dffaff";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "rgba(220, 250, 255, 0.88)";
      roundRect(-8, -2, 18, 18, 6);
      ctx.fill();
      for (let i = 0; i < 4; i += 1) {
        roundRect(-14 + i * 8, -18, 7, 22, 4);
        ctx.fill();
      }
      ctx.strokeStyle = "#88bdd1";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (hazard.kind === "darkChain") {
      ctx.shadowColor = "#6b1b1b";
      ctx.shadowBlur = 13;
      ctx.strokeStyle = "#321515";
      ctx.lineWidth = 5;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.ellipse(i * 15, 0, 10, 6, i % 2 ? 0.85 : -0.85, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (hazard.kind === "ghostMarble") {
      ctx.shadowColor = "#b6e8ff";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#dff7ff";
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#86caff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 19, 0.1, Math.PI * 1.55);
      ctx.stroke();
    } else if (hazard.kind === "dustRibbon") {
      ctx.shadowColor = "#f2b86d";
      ctx.shadowBlur = 15;
      ctx.strokeStyle = "rgba(231, 177, 112, 0.86)";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-42, 4);
      ctx.bezierCurveTo(-20, -18, 12, 20, 42, -4);
      ctx.stroke();
      ctx.strokeStyle = "rgba(116, 220, 225, 0.58)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-34, -6);
      ctx.bezierCurveTo(-10, 9, 10, -13, 35, 4);
      ctx.stroke();
      ctx.fillStyle = "#f4d59b";
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.arc(-22 + i * 15, Math.sin(game.time * 7 + i) * 7, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (hazard.kind === "roadLantern") {
      ctx.shadowColor = "#73e0e5";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#253135";
      roundRect(-10, -13, 20, 24, 5);
      ctx.fill();
      ctx.fillStyle = "#ffd782";
      roundRect(-5, -6, 10, 13, 4);
      ctx.fill();
      ctx.strokeStyle = "#73e0e5";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -14, 9, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.32;
      ctx.fillStyle = "#73e0e5";
      ctx.beginPath();
      ctx.arc(0, 2, 26, 0, Math.PI * 2);
      ctx.fill();
    } else if (hazard.kind === "shadowSock") {
      ctx.shadowColor = "#b58cff";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#2c2540";
      ctx.strokeStyle = "#f1d577";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-18, -14);
      ctx.lineTo(8, -12);
      ctx.quadraticCurveTo(15, 6, 3, 14);
      ctx.lineTo(-15, 10);
      ctx.quadraticCurveTo(-28, 0, -18, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f1d577";
      ctx.fillRect(-12, -7, 12, 5);
    } else if (hazard.kind === "closetWhisper") {
      ctx.shadowColor = "#d7c2ff";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "rgba(222, 204, 255, 0.9)";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-25, -10 + i * 10);
        ctx.bezierCurveTo(-6, -25 + i * 7, 14, 22 - i * 4, 33, -4 + i * 9);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255, 244, 168, 0.85)";
      ctx.beginPath();
      ctx.arc(-30, 0, 4, 0, Math.PI * 2);
      ctx.arc(38, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (hazard.kind === "rat") {
      const run = Math.sin(game.time * 18 + hazard.spin);
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 5;
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.beginPath();
      ctx.ellipse(-2, 13, 24, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#d4b2a4";
      ctx.lineWidth = 3.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-19, 4);
      ctx.bezierCurveTo(-34, 1 + run * 3, -43, 10 - run * 2, -52, 2);
      ctx.stroke();
      ctx.fillStyle = "#675852";
      ctx.beginPath();
      ctx.ellipse(-3, 1, 23, 12, -0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#887a72";
      ctx.beginPath();
      ctx.ellipse(17, -2, 10, 8, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c79b98";
      ctx.beginPath();
      ctx.arc(18, -10, 5, 0, Math.PI * 2);
      ctx.arc(11, -10, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f0c8c0";
      ctx.beginPath();
      ctx.arc(18, -10, 2.7, 0, Math.PI * 2);
      ctx.arc(11, -10, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#171312";
      ctx.beginPath();
      ctx.arc(22, -4, 1.7, 0, Math.PI * 2);
      ctx.arc(27, -1, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#302623";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-11, 10);
      ctx.lineTo(-18 + run * 4, 18);
      ctx.moveTo(2, 10);
      ctx.lineTo(-2 - run * 4, 18);
      ctx.moveTo(10, 8);
      ctx.lineTo(18 + run * 3, 16);
      ctx.stroke();
      ctx.strokeStyle = "rgba(245, 230, 210, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, -2);
      ctx.lineTo(35, -7);
      ctx.moveTo(24, 0);
      ctx.lineTo(36, 0);
      ctx.moveTo(24, 2);
      ctx.lineTo(34, 7);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#3c2116";
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#21120d";
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * 5, 4);
        ctx.lineTo(i * 5 + 8, 13);
        ctx.moveTo(i * 5, -4);
        ctx.lineTo(i * 5 + 8, -13);
        ctx.stroke();
      }
      ctx.strokeStyle = "#7b4a28";
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(20, -8);
      ctx.moveTo(8, 0);
      ctx.lineTo(20, 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLightning(bolt) {
    const warningProgress = clamp(1 - bolt.warning / bolt.maxWarning, 0, 1);
    const profile = bolt.profile || hazardForWorld().lightning;
    ctx.save();
    ctx.translate(bolt.x, bolt.y);
    if (!bolt.struck) {
      const pulse = 0.65 + Math.sin(game.time * 18 + bolt.phase) * 0.18;
      ctx.globalAlpha = 0.35 + warningProgress * 0.55;
      ctx.strokeStyle = warningProgress > 0.72 ? profile.hot : profile.warning;
      ctx.lineWidth = 5 + warningProgress * 5;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(0, 0, bolt.r * (0.55 + i * 0.34 + warningProgress * 0.25) * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = colorWithAlpha(profile.hot, 0.16);
      ctx.beginPath();
      ctx.arc(0, 0, bolt.r * (0.85 + warningProgress * 0.35), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    const alpha = clamp(bolt.flash / 0.24, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.shadowColor = profile.glow;
    ctx.shadowBlur = 34;
    ctx.strokeStyle = profile.bolt;
    ctx.lineWidth = 9;
    ctx.beginPath();
    for (const [index, point] of bolt.segments.entries()) {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    ctx.strokeStyle = profile.core;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = colorWithAlpha(profile.impact, 0.62);
    ctx.beginPath();
    ctx.arc(0, 0, bolt.r * 0.95, 0, Math.PI * 2);
    ctx.fill();
    drawWorldLightningImpact(profile, bolt.r);
    ctx.restore();
  }

  function colorWithAlpha(hex, alpha) {
    const clean = hex.replace("#", "");
    const value = parseInt(clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function drawWorldLightningImpact(profile, radius) {
    ctx.save();
    ctx.strokeStyle = colorWithAlpha(profile.ring, 0.78);
    ctx.lineWidth = 3;
    for (let i = 0; i < 2; i += 1) {
      ctx.beginPath();
      ctx.ellipse(0, 8, radius * (0.75 + i * 0.28), radius * (0.18 + i * 0.08), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (game.world === "juarez" || game.world === "elpaso") {
      ctx.fillStyle = colorWithAlpha("#d7a65b", 0.55);
      for (let i = 0; i < 9; i += 1) {
        const a = i * 0.7 + game.time;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * radius * 0.65, 12 + Math.sin(a) * radius * 0.18, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (game.world === "useast") {
      ctx.strokeStyle = colorWithAlpha("#99f4d7", 0.72);
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * 18, 6);
        ctx.quadraticCurveTo(i * 18 + 8, 18, i * 18 + 24, 10);
        ctx.stroke();
      }
    } else if (game.world === "mexicocity") {
      ctx.fillStyle = colorWithAlpha("#dffaff", 0.22);
      ctx.beginPath();
      ctx.ellipse(0, 6, radius * 1.15, radius * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (game.world === "guadalajara") {
      ctx.fillStyle = colorWithAlpha("#ffd66e", 0.5);
      for (let i = 0; i < 6; i += 1) {
        ctx.beginPath();
        ctx.rect(-radius * 0.6 + i * radius * 0.24, 10 + (i % 2) * 5, 7, 3);
        ctx.fill();
      }
    } else if (game.world === "holymountain") {
      ctx.strokeStyle = colorWithAlpha("#fff4a8", 0.72);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.35);
      ctx.lineTo(0, radius * 0.4);
      ctx.moveTo(-radius * 0.28, -radius * 0.02);
      ctx.lineTo(radius * 0.28, -radius * 0.02);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEffects() {
    for (const effect of game.effects) {
      if (effect.type === "spray") {
        const p = 1 - effect.life / effect.maxLife;
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.scale(effect.dir, 1);
        ctx.globalAlpha = Math.max(0, 1 - p);
        ctx.fillStyle = "rgba(158, 231, 255, 0.23)";
        for (let i = 0; i < 7; i += 1) {
          ctx.beginPath();
          ctx.ellipse(60 + i * 38 + p * 70, (i - 3) * 18, 34 + p * 38, 18 + p * 14, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = "rgba(210, 250, 255, 0.72)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(120, -44, 320, -72);
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(130, 10, 330, 0);
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(120, 50, 300, 78);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      if (effect.type === "rosary") {
        const p = 1 - effect.life / effect.maxLife;
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.globalAlpha = Math.max(0, 1 - p * 0.65);
        ctx.strokeStyle = "rgba(255, 244, 168, 0.82)";
        ctx.lineWidth = 8;
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath();
          ctx.arc(0, 0, 95 + p * 520 + i * 52, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(255, 248, 211, 0.18)";
        ctx.beginPath();
        ctx.arc(0, 0, 120 + p * 500, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff8d3";
        ctx.font = "700 28px Arial, Helvetica, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Pater Noster", 0, -116 - p * 35);
        ctx.font = "700 18px Arial, Helvetica, sans-serif";
        ctx.fillText("Padre Nuestro", 0, -84 - p * 35);
        ctx.restore();
        continue;
      }
      if (effect.type !== "explosion") continue;
      const p = 1 - effect.life / effect.maxLife;
      ctx.save();
      ctx.translate(effect.x, effect.y);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = Math.max(0, 0.95 - p * 0.75);
      ctx.fillStyle = "rgba(255, 249, 216, 0.92)";
      ctx.beginPath();
      ctx.arc(0, 0, 22 + p * 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 88, 54, 0.66)";
      ctx.beginPath();
      ctx.arc(0, 0, 62 + p * 190, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = Math.max(0, 1 - p * 0.82);
      ctx.strokeStyle = "#ff4334";
      ctx.lineWidth = 18 * (1 - p) + 4;
      ctx.beginPath();
      ctx.arc(0, 0, 38 + p * 260, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#fff4a8";
      ctx.lineWidth = 7;
      for (let i = 0; i < 16; i += 1) {
        const a = (Math.PI * 2 * i) / 16 + p * 1.1;
        const wobble = 1 + Math.sin(game.time * 18 + i) * 0.08;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 24, Math.sin(a) * 24);
        ctx.lineTo(Math.cos(a) * (115 + p * 235) * wobble, Math.sin(a) * (115 + p * 235) * wobble);
        ctx.stroke();
      }
      ctx.globalAlpha = Math.max(0, 0.58 - p * 0.48);
      ctx.fillStyle = "#33261d";
      for (let i = 0; i < 11; i += 1) {
        const a = i * 1.72 + 0.4;
        const r = 44 + p * (95 + i * 9);
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * r, Math.sin(a) * r * 0.55, 20 + i % 3 * 7, 13 + i % 2 * 5, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawFrame(img, frame, x, groundY, targetH, face = 1, walkPhase = null) {
    const [sx, sy, sw, sh] = frame;
    const targetW = (sw / sh) * targetH;
    ctx.save();
    if (walkPhase !== null) {
      const phase = (walkPhase % 6) / 6;
      const stride = Math.sin(phase * Math.PI * 2);
      const lift = Math.abs(stride);
      const lean = stride * 0.045;
      const squash = 1 - lift * 0.025;
      const stretch = 1 + lift * 0.018;
      ctx.translate(x, groundY);
      if (face < 0) ctx.scale(-1, 1);
      ctx.translate(stride * 4, -lift * 5);
      ctx.rotate(lean);
      ctx.scale(stretch, squash);
      ctx.drawImage(img, sx, sy, sw, sh, -targetW / 2, -targetH, targetW, targetH);
      ctx.restore();
      return;
    }
    if (face < 0) {
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, sy, sw, sh, -targetW / 2, groundY - targetH, targetW, targetH);
    } else {
      ctx.drawImage(img, sx, sy, sw, sh, x - targetW / 2, groundY - targetH, targetW, targetH);
    }
    ctx.restore();
  }

  function drawSprite(img, x, groundY, targetH, face = 1) {
    const targetW = (img.width / img.height) * targetH;
    ctx.save();
    if (face < 0) {
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, -targetW / 2, groundY - targetH, targetW, targetH);
    } else {
      ctx.drawImage(img, x - targetW / 2, groundY - targetH, targetW, targetH);
    }
    ctx.restore();
  }

  function drawCross(x, y, scale, danger = 0) {
    ctx.save();
    ctx.translate(x, y);
    const pulse = danger > 0 ? 1 + Math.sin(game.time * 18) * 0.08 * danger : 1;
    ctx.scale(scale * pulse, scale * pulse);
    const world = worldSketches[game.world] || worldSketches.colorado;
    const cruxBase = hexToRgb(world.cruxColor || "#f8dc71");
    const gold = danger < 0.55
      ? mixColor(cruxBase, [255, 157, 54], danger / 0.55)
      : mixColor([255, 157, 54], [255, 52, 48], (danger - 0.55) / 0.45);
    const outline = mixColor([92, 70, 31], [90, 8, 8], danger);
    ctx.shadowColor = danger > 0 ? `rgba(255, 55, 48, ${0.55 + danger * 0.4})` : `rgba(${cruxBase[0]}, ${cruxBase[1]}, ${cruxBase[2]}, 0.9)`;
    ctx.shadowBlur = 18 + danger * 28;
    ctx.fillStyle = "rgba(8, 13, 20, 0.9)";
    ctx.strokeStyle = gold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = danger > 0.6 ? "#fff4a8" : "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.stroke();
    if (danger > 0) {
      ctx.save();
      ctx.globalAlpha = 0.15 + danger * 0.34;
      ctx.fillStyle = "#ff4334";
      ctx.beginPath();
      ctx.arc(0, 0, 58 + danger * 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.92;
      ctx.lineWidth = 8;
      ctx.strokeStyle = danger > 0.72 ? "#ff332b" : "#ff9d36";
      ctx.beginPath();
      ctx.arc(0, 0, 68, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * danger);
      ctx.stroke();
      ctx.globalAlpha = danger > 0.82 ? 0.75 + Math.sin(game.time * 26) * 0.2 : 0.45;
      ctx.strokeStyle = "#fff4a8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 80 + Math.sin(game.time * 12) * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = gold;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3;
    ctx.font = "700 9px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PAX", 0, -28);
    roundRect(-8, -29, 16, 58, 4);
    ctx.fill();
    ctx.stroke();
    roundRect(-28, -8, 56, 16, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff9dc";
    ctx.font = "700 10px Arial, Helvetica, sans-serif";
    ctx.fillText("C S S M L", 0, 37);
    ctx.restore();
  }

  function drawStar(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.shadowColor = "rgba(158, 231, 255, 0.95)";
    ctx.shadowBlur = 24;
    ctx.fillStyle = "#9ee7ff";
    ctx.strokeStyle = "#fff8d3";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? 30 : 13;
      const a = -Math.PI / 2 + (Math.PI * 2 * i) / 10;
      const px = Math.cos(a) * radius;
      const py = Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#101927";
    ctx.font = "700 20px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+1", 0, 2);
    ctx.restore();
  }

  function drawRosary(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.shadowColor = "rgba(255, 244, 168, 0.95)";
    ctx.shadowBlur = 26;
    ctx.strokeStyle = "#fff4a8";
    ctx.fillStyle = "#f8dc71";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 36, 0.18, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 14; i += 1) {
      const a = (Math.PI * 2 * i) / 14 + 0.18;
      const px = Math.cos(a) * 28;
      const py = Math.sin(a) * 36;
      ctx.beginPath();
      ctx.arc(px, py, i % 4 === 0 ? 4.6 : 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 34);
    ctx.lineTo(0, 58);
    ctx.moveTo(-12, 48);
    ctx.lineTo(12, 48);
    ctx.stroke();
    ctx.fillStyle = "#101927";
    ctx.font = "700 17px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("P", 0, 0);
    ctx.restore();
  }

  function mixColor(a, b, t) {
    const clamped = clamp(t, 0, 1);
    return `rgb(${a.map((value, index) => Math.round(value + (b[index] - value) * clamped)).join(",")})`;
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const value = Number.parseInt(clean.length === 3
      ? clean.split("").map((ch) => ch + ch).join("")
      : clean, 16);
    if (Number.isNaN(value)) return [248, 220, 113];
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  function drawParticles() {
    for (const part of game.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, part.life);
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x, part.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawMessage() {
    ctx.save();
    ctx.fillStyle = "rgba(8, 14, 24, 0.74)";
    ctx.strokeStyle = "rgba(246, 220, 117, 0.42)";
    ctx.lineWidth = 2;
    roundRect(34, 594, 650, 62, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff8d3";
    ctx.font = "700 24px Arial, Helvetica, sans-serif";
    ctx.fillText(game.message, 56, 632);
    ctx.restore();
  }

  function drawPauseOverlay() {
    ctx.save();
    ctx.fillStyle = "rgba(4, 9, 18, 0.58)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff8d3";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 64px Arial, Helvetica, sans-serif";
    ctx.fillText("Paused", W / 2, H / 2 - 24);
    ctx.font = "700 25px Arial, Helvetica, sans-serif";
    ctx.fillText("P to resume / Q to quit", W / 2, H / 2 + 42);
    ctx.restore();
  }

  function togglePause() {
    if (game.mode === "playing") {
      game.mode = "paused";
      game.player.vx = 0;
      game.player.vy = 0;
      joy.x = 0;
      joy.y = 0;
      touchMove.active = false;
      stickKnob.style.transform = "translate(0, 0)";
      pauseButton.textContent = "▶";
      return;
    }
    if (game.mode === "paused") {
      game.mode = "playing";
      game.last = performance.now();
      pauseButton.textContent = "Ⅱ";
    }
  }

  function quitToSelection() {
    if (game.mode !== "playing" && game.mode !== "paused" && game.mode !== "ending" && game.mode !== "travel" && game.mode !== "lost" && game.mode !== "won") return;
    keys.clear();
    showCharacterSelect();
    pauseButton.textContent = "Ⅱ";
  }

  function currentVillain() {
    if (game.world === "juarez") return "El Cucuy del Desierto";
    if (game.world === "useast") return "The Swamp Shadow";
    if (game.world === "elpaso") return "El Chupacabras";
    if (game.world === "guadalajara") return game.stageIndex === 5 ? "El Jinete Sin Cabeza" : "El Charro Negro";
    if (game.world === "mexicocity") return "La Llorona";
    if (game.world === "elcoco") return "El Coco";
    if (game.world === "holymountain") return "The Devil";
    if (game.world === "saints") return "The Prairie Boy";
    if (game.world === "elrancho") return "La Aparecida de la Carretera";
    return "El Tacalache";
  }

  function appendCastCard(container, item) {
    const card = document.createElement("div");
    card.className = item.villain ? "intro-cast-card villain" : "intro-cast-card";
    if (item.featured) card.classList.add("featured");
    if (item.jesus) card.classList.add("jesus-card");
    const img = document.createElement("img");
    img.alt = "";
    img.src = ASSET + sources[characterDefs[item.key]?.front || item.key];
    card.append(img);
    const span = document.createElement("span");
    span.textContent = item.label;
    card.append(span);
    container.append(card);
  }

  function renderCast(container, cast) {
    if (!container) return;
    container.textContent = "";
    const seen = new Set();
    for (const item of cast) {
      if (seen.has(item.key)) continue;
      seen.add(item.key);
      appendCastCard(container, item);
    }
  }

  function villainCastItem() {
    if (game.world === "useast") {
      return { key: "swampShadow", label: "The Swamp Shadow", villain: true };
    }
    if (game.world === "elpaso") {
      return { key: "elChupacabras", label: "El Chupacabras", villain: true };
    }
    if (game.world === "guadalajara") {
      return { key: "elCharroNegro", label: "El Charro Negro", villain: true };
    }
    if (game.world === "mexicocity") {
      return { key: "laLlorona", label: "La Llorona", villain: true };
    }
    if (game.world === "elcoco") {
      return { key: "elCoco", label: "El Coco", villain: true };
    }
    if (game.world === "holymountain") {
      return { key: "theDevil", label: "The Devil", villain: true };
    }
    if (game.world === "saints") {
      return { key: "prairieBoy", label: "The Prairie Boy", villain: true };
    }
    if (game.world === "elrancho") {
      return { key: "laAparecidaCarretera", label: "La Aparecida", villain: true };
    }
    return {
      key: game.world === "juarez" ? "elCucuy" : "tacalache",
      label: currentVillain(),
      villain: true,
    };
  }

  function updateIntroCast() {
    if (!introCast) return;
    introCast.classList.toggle("hidden", game.world === "colorado");
    if (game.world === "colorado") {
      introCast.textContent = "";
      return;
    }
    const cast = [
      { key: game.selectedHero, label: characterDefs[game.selectedHero]?.label || "Hero" },
      { key: game.selectedCompanion, label: characterDefs[game.selectedCompanion]?.label || "Companion" },
      { key: "timmy", label: "Timmy" },
      villainCastItem(),
    ];
    if (game.world === bonusWorldKey) {
      cast.push({ key: "stMary", label: "St. Mary" });
    }
    renderCast(introCast, cast);
  }

  function updateFinalCast() {
    if (!finalCast) return;
    finalCast.classList.toggle("hidden", game.world === "colorado");
    finalCast.classList.toggle("edition-finale", game.world === "holymountain");
    if (game.world === "colorado") {
      finalCast.textContent = "";
      return;
    }
    if (game.world === "holymountain") {
      const allGoodKeys = [
        "jesus",
        game.selectedHero,
        game.selectedCompanion,
        "elayitas",
        "angie",
        "ttitin",
        "tata",
        "abba",
        "nana",
        "mrsFavi",
        "mrChuy",
        "timmy",
        "guardian",
        "michael",
        ...redeemedCharacterKeys,
      ];
      renderCast(finalCast, allGoodKeys.map((key) => ({
        key,
        label: key === "jesus" ? "Jesus" : characterDefs[key]?.label || key,
        featured: key === game.selectedHero || key === game.selectedCompanion,
        jesus: key === "jesus",
      })));
      return;
    }
    if (game.world === bonusWorldKey) {
      renderCast(finalCast, [
        { key: game.selectedHero, label: characterDefs[game.selectedHero]?.label || "Hero", featured: true },
        { key: game.selectedCompanion, label: characterDefs[game.selectedCompanion]?.label || "Companion", featured: true },
        { key: "stMary", label: "St. Mary, Mother of Jesus", featured: true },
        { key: "prairieBoy", label: "The Prairie Boy", villain: true },
      ]);
      return;
    }
    const redeemedKey = redeemedKeyForHero();
    renderCast(finalCast, [
      { key: game.selectedHero, label: characterDefs[game.selectedHero]?.label || "Hero" },
      { key: "timmy", label: "Timmy" },
      { key: redeemedKey, label: redeemedNameForHero() },
    ]);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - game.last) / 1000 || 0);
    game.last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function overlayDefaultButton() {
    if (!introScreen.classList.contains("hidden")) return skipIntroButton;
    if (!finalScreen.classList.contains("hidden")) return skipFinalButton;
    if (!creditsScreen.classList.contains("hidden")) return creditsContinueButton;
    if (!helpScreen.classList.contains("hidden")) return helpCloseButton;
    if (!endScreen.classList.contains("hidden")) return againButton;
    if (!titleScreen.classList.contains("hidden")) return startButton;
    return null;
  }

  function activateFocusedOverlayButton(event) {
    if (event.code !== "Space" && event.code !== "Enter") return false;
    const defaultButton = overlayDefaultButton();
    if (!defaultButton) return false;
    const focusedButton = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
    const button = focusedButton || defaultButton;
    event.preventDefault();
    button.click();
    return true;
  }

  window.addEventListener("keydown", (event) => {
    if (activateFocusedOverlayButton(event)) return;
    keys.add(event.code);
    if (event.code === "Space") {
      event.preventDefault();
      pray();
    }
    if (event.code === "KeyF") {
      event.preventDefault();
      useSpray();
    }
    if (event.code === "KeyR") {
      event.preventDefault();
      useRosary();
    }
    if (event.code === "KeyP") {
      event.preventDefault();
      togglePause();
    }
    if (event.code === "KeyQ") {
      event.preventDefault();
      quitToSelection();
    }
    if (event.code === "KeyH") {
      event.preventDefault();
      showHelp();
    }
    if (event.code === "Escape" && !helpScreen.classList.contains("hidden")) {
      event.preventDefault();
      closeHelp();
    }
  });

  window.addEventListener("keyup", (event) => keys.delete(event.code));

  function updateStick(clientX, clientY) {
    const rect = stick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.min(46, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    joy.x = Math.cos(angle) * (dist / 46);
    joy.y = Math.sin(angle) * (dist / 46);
    stickKnob.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
  }

  stick.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    joy.active = true;
    joy.id = event.pointerId;
    if (stick.setPointerCapture) stick.setPointerCapture(event.pointerId);
    updateStick(event.clientX, event.clientY);
  });

  stick.addEventListener("pointermove", (event) => {
    if (joy.active && event.pointerId === joy.id) updateStick(event.clientX, event.clientY);
  });

  function releaseStick() {
    joy.active = false;
    joy.id = null;
    joy.x = 0;
    joy.y = 0;
    stickKnob.style.transform = "translate(0, 0)";
  }

  function clientToGame(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / W, rect.height / H);
    const drawW = W * scale;
    const drawH = H * scale;
    const offsetX = rect.left + (rect.width - drawW) / 2;
    const offsetY = rect.top + (rect.height - drawH) / 2;
    return {
      x: clamp((clientX - offsetX) / scale, 0, W),
      y: clamp((clientY - offsetY) / scale, 0, H),
    };
  }

  function setTouchTarget(event) {
    if (game.mode !== "playing") return;
    const point = clientToGame(event.clientX, event.clientY);
    touchMove.active = true;
    touchMove.id = event.pointerId;
    touchMove.x = point.x;
    touchMove.y = clamp(point.y, 340, 620);
  }

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    initAudio();
    resumeAudio();
    if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
    setTouchTarget(event);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (touchMove.active && event.pointerId === touchMove.id) {
      event.preventDefault();
      setTouchTarget(event);
    }
  });

  function releaseTouchTarget(event) {
    if (event.pointerId !== touchMove.id) return;
    touchMove.active = false;
    touchMove.id = null;
  }

  canvas.addEventListener("pointerup", releaseTouchTarget);
  canvas.addEventListener("pointercancel", releaseTouchTarget);

  stick.addEventListener("pointerup", releaseStick);
  stick.addEventListener("pointercancel", releaseStick);
  prayButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    initAudio();
    resumeAudio();
    pray();
  });
  sprayButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    useSpray();
  });
  rosaryButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    useRosary();
  });
  pauseButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    togglePause();
  });

  characterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const role = button.dataset.role;
      if (role === "hero") {
        game.selectedHero = button.dataset.character;
      } else {
        game.selectedCompanion = button.dataset.character;
      }
      for (const choice of characterButtons) {
        if (choice.dataset.role === role) {
          choice.classList.toggle("selected", choice === button);
        }
      }
    });
  });

  difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      game.difficulty = button.dataset.difficulty || "regular";
      for (const choice of difficultyButtons) {
        choice.classList.toggle("selected", choice === button);
      }
    });
  });

  worldButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectWorld(button.dataset.world || "colorado");
    });
  });

  startButton.addEventListener("click", () => {
    playIntroSequence(true);
  });
  if (resetProgressButton) resetProgressButton.addEventListener("click", resetSavedProgress);
  function showHelp() {
    helpScreen.classList.remove("hidden");
    helpCloseButton.focus();
  }

  function closeHelp() {
    helpScreen.classList.add("hidden");
    if (!titleScreen.classList.contains("hidden")) helpButton.focus();
    else canvas.focus();
  }

  if (helpButton) helpButton.addEventListener("click", showHelp);
  if (helpCloseButton) helpCloseButton.addEventListener("click", closeHelp);
  againButton.addEventListener("click", showCharacterSelect);
  if (introButton) introButton.addEventListener("click", () => {
    playIntroSequence(false);
  });

  function playIntroSequence(startsGame) {
    introStartsGame = startsGame;
    initAudio();
    resumeAudio();
    const introVideoByWorld = {
      colorado: "../video-intro/crux-sacra-game-intro-sora-audio-2-clean-fill.mp4",
      juarez: "../video-intro/world2/crux-sacra-juarez-intro-placeholder.mp4?v=2",
      useast: "../video-intro/world3/crux-sacra-us-east-intro-placeholder.mp4?v=5",
      elpaso: "../video-intro/world4/crux-sacra-el-paso-intro-placeholder.mp4?v=7",
      guadalajara: "../video-intro/world5/crux-sacra-guadalajara-intro-placeholder.mp4?v=8",
      mexicocity: "../video-intro/world6/crux-sacra-mexico-city-intro-placeholder.mp4?v=1",
      elcoco: "../video-intro/world10/crux-sacra-el-coco-intro.mp4?v=1",
      holymountain: "../video-intro/world7/crux-sacra-holy-mountain-intro-placeholder.mp4?v=1",
      saints: "../video-intro/world8/crux-sacra-saints-bonus-intro.mp4?v=1",
      elrancho: "../video-intro/world9/crux-sacra-el-rancho-intro.mp4?v=1",
    };
    const nextIntroVideo = introVideoByWorld[game.world] || introVideoByWorld.colorado;
    if (!introVideo.src.endsWith(nextIntroVideo)) {
      introVideo.src = nextIntroVideo;
      introVideo.load();
    }
    updateIntroCast();
    introScreen.classList.remove("hidden");
    skipIntroButton.focus();
    introVideo.currentTime = 0;
    introVideo.play().catch(() => {});
  }

  function closeIntro() {
    stopIntroSpeech();
    introVideo.pause();
    introScreen.classList.add("hidden");
    if (introStartsGame) {
      introStartsGame = false;
      reset();
    }
  }
  skipIntroButton.addEventListener("click", closeIntro);
  introVideo.addEventListener("ended", closeIntro);

  function playFinalSequence() {
    const finalVideoByHero = {
      angie: "../video-intro/crux-sacra-final-redemption-dona-carmelina.mp4?v=1",
      nana: "../video-intro/crux-sacra-final-redemption-tan.mp4?v=1",
      ttitin: "../video-intro/crux-sacra-final-redemption-mr-zuil.mp4?v=1",
      tata: "../video-intro/crux-sacra-final-redemption-mr-hernandez.mp4?v=1",
      mrsFavi: "../video-intro/crux-sacra-final-redemption-mr-domingo.mp4?v=1",
      mrChuy: "../video-intro/crux-sacra-final-redemption-don-maro.mp4?v=1",
      abba: "../video-intro/crux-sacra-final-redemption-lady-seferina.mp4?v=1",
      timmy: "../video-intro/crux-sacra-final-redemption-mr-tio.mp4?v=1",
      guardian: "../video-intro/crux-sacra-final-redemption-father-v.mp4?v=1",
      michael: "../video-intro/crux-sacra-final-redemption-father-m.mp4?v=1",
    };
    const juarezFinalVideoByHero = {
      angie: "../video-intro/world2/crux-sacra-juarez-redemption-dona-carmelina.mp4?v=1",
      nana: "../video-intro/world2/crux-sacra-juarez-redemption-tan.mp4?v=1",
      ttitin: "../video-intro/world2/crux-sacra-juarez-redemption-mr-zuil.mp4?v=1",
      tata: "../video-intro/world2/crux-sacra-juarez-redemption-mr-hernandez.mp4?v=1",
      mrsFavi: "../video-intro/world2/crux-sacra-juarez-redemption-mr-domingo.mp4?v=1",
      mrChuy: "../video-intro/world2/crux-sacra-juarez-redemption-don-maro.mp4?v=1",
      abba: "../video-intro/world2/crux-sacra-juarez-redemption-lady-seferina.mp4?v=1",
      timmy: "../video-intro/world2/crux-sacra-juarez-redemption-mr-tio.mp4?v=1",
      guardian: "../video-intro/world2/crux-sacra-juarez-redemption-father-v.mp4?v=1",
      michael: "../video-intro/world2/crux-sacra-juarez-redemption-father-m.mp4?v=1",
    };
    const useastFinalVideoByHero = {
      angie: "../video-intro/world3/crux-sacra-us-east-redemption-dona-carmelina.mp4?v=4",
      nana: "../video-intro/world3/crux-sacra-us-east-redemption-tan.mp4?v=4",
      ttitin: "../video-intro/world3/crux-sacra-us-east-redemption-mr-zuil.mp4?v=4",
      tata: "../video-intro/world3/crux-sacra-us-east-redemption-mr-hernandez.mp4?v=4",
      mrsFavi: "../video-intro/world3/crux-sacra-us-east-redemption-mr-domingo.mp4?v=4",
      mrChuy: "../video-intro/world3/crux-sacra-us-east-redemption-don-maro.mp4?v=4",
      abba: "../video-intro/world3/crux-sacra-us-east-redemption-lady-seferina.mp4?v=4",
      timmy: "../video-intro/world3/crux-sacra-us-east-redemption-mr-tio.mp4?v=4",
      guardian: "../video-intro/world3/crux-sacra-us-east-redemption-father-v.mp4?v=4",
      michael: "../video-intro/world3/crux-sacra-us-east-redemption-father-m.mp4?v=4",
    };
    const elPasoFinalVideoByHero = {
      angie: "../video-intro/world4/crux-sacra-el-paso-redemption-dona-carmelina.mp4?v=2",
      nana: "../video-intro/world4/crux-sacra-el-paso-redemption-tan.mp4?v=2",
      ttitin: "../video-intro/world4/crux-sacra-el-paso-redemption-mr-zuil.mp4?v=2",
      tata: "../video-intro/world4/crux-sacra-el-paso-redemption-mr-hernandez.mp4?v=2",
      mrsFavi: "../video-intro/world4/crux-sacra-el-paso-redemption-mr-domingo.mp4?v=2",
      mrChuy: "../video-intro/world4/crux-sacra-el-paso-redemption-don-maro.mp4?v=2",
      abba: "../video-intro/world4/crux-sacra-el-paso-redemption-lady-seferina.mp4?v=2",
      timmy: "../video-intro/world4/crux-sacra-el-paso-redemption-mr-tio.mp4?v=2",
      guardian: "../video-intro/world4/crux-sacra-el-paso-redemption-father-v.mp4?v=2",
      michael: "../video-intro/world4/crux-sacra-el-paso-redemption-father-m.mp4?v=2",
    };
    const guadalajaraFinalVideoByHero = {
      angie: "../video-intro/world5/crux-sacra-guadalajara-redemption-dona-carmelina.mp4?v=2",
      nana: "../video-intro/world5/crux-sacra-guadalajara-redemption-tan.mp4?v=2",
      ttitin: "../video-intro/world5/crux-sacra-guadalajara-redemption-mr-zuil.mp4?v=2",
      tata: "../video-intro/world5/crux-sacra-guadalajara-redemption-mr-hernandez.mp4?v=2",
      mrsFavi: "../video-intro/world5/crux-sacra-guadalajara-redemption-mr-domingo.mp4?v=2",
      mrChuy: "../video-intro/world5/crux-sacra-guadalajara-redemption-don-maro.mp4?v=2",
      abba: "../video-intro/world5/crux-sacra-guadalajara-redemption-lady-seferina.mp4?v=2",
      timmy: "../video-intro/world5/crux-sacra-guadalajara-redemption-mr-tio.mp4?v=2",
      guardian: "../video-intro/world5/crux-sacra-guadalajara-redemption-father-v.mp4?v=2",
      michael: "../video-intro/world5/crux-sacra-guadalajara-redemption-father-m.mp4?v=2",
    };
    const mexicoCityFinalVideoByHero = {};
    const elCocoFinalVideoByHero = {};
    const holyMountainFinalVideoByHero = {};
    const saintsFinalVideoByHero = {};
    const elRanchoFinalVideoByHero = {};
    const finalVideosByWorld = {
      colorado: { map: finalVideoByHero, fallback: "../video-intro/crux-sacra-final-redemption.mp4?v=3" },
      juarez: { map: juarezFinalVideoByHero, fallback: "../video-intro/world2/crux-sacra-juarez-ending-placeholder.mp4?v=1" },
      useast: { map: useastFinalVideoByHero, fallback: "../video-intro/world3/crux-sacra-us-east-redemption-tan.mp4?v=4" },
      elpaso: { map: elPasoFinalVideoByHero, fallback: "../video-intro/world4/crux-sacra-el-paso-redemption-placeholder.mp4?v=2" },
      guadalajara: { map: guadalajaraFinalVideoByHero, fallback: "../video-intro/world5/crux-sacra-guadalajara-redemption-placeholder.mp4?v=2" },
      mexicocity: { map: mexicoCityFinalVideoByHero, fallback: "../video-intro/world6/crux-sacra-mexico-city-redemption-placeholder.mp4?v=1" },
      elcoco: { map: elCocoFinalVideoByHero, fallback: "../video-intro/world10/crux-sacra-el-coco-redemption-placeholder.mp4?v=1" },
      holymountain: { map: holyMountainFinalVideoByHero, fallback: "../video-intro/world7/crux-sacra-holy-mountain-redemption-placeholder.mp4?v=2" },
      saints: { map: saintsFinalVideoByHero, fallback: "../video-intro/world8/crux-sacra-saints-bonus-ending.mp4?v=1" },
      elrancho: { map: elRanchoFinalVideoByHero, fallback: "../video-intro/world9/crux-sacra-el-rancho-redemption-placeholder.mp4?v=1" },
    };
    const finalSet = finalVideosByWorld[game.world] || finalVideosByWorld.colorado;
    const redeemedKey = redeemedKeyForHero();
    const surpriseFinalVideoByRedeemed = {
      angeliux: game.world === "useast"
        ? "../video-intro/world3/crux-sacra-us-east-redemption-angeliux.mp4?v=1"
        : "../video-intro/crux-sacra-final-redemption-angeliux.mp4?v=2",
      srJoe: "../video-intro/crux-sacra-final-redemption-sr-joe.mp4?v=1",
      lordSanty: "../video-intro/crux-sacra-final-redemption-lord-santy.mp4?v=1",
      donaNene: "../video-intro/crux-sacra-final-redemption-dona-nene.mp4?v=1",
    };
    const surpriseFinalVideo = game.world === ranchWorldKey ? null : surpriseFinalVideoByRedeemed[redeemedKey];
    const nextFinalVideo = surpriseFinalVideo || finalSet.map[game.selectedHero] || finalSet.fallback;
    const redeemedName = redeemedNameForHero();
    finalCaption.textContent = game.world === bonusWorldKey
      ? "St. Mary, Mother of Jesus, joins the Saints bonus world. The next adventure begins soon."
      : redemptionMessage(redeemedName);
    if (!finalVideo.src.endsWith(nextFinalVideo)) {
      finalVideo.src = nextFinalVideo;
      finalVideo.load();
    }
    updateFinalCast();
    finalScreen.classList.remove("hidden");
    skipFinalButton.focus();
    finalVideo.currentTime = 0;
    finalVideo.play().catch(() => {});
  }

  function closeFinalSequence() {
    finalVideo.pause();
    finalScreen.classList.add("hidden");
    const completedWorld = game.world;
    game.passedWorlds.add(completedWorld);
    persistWorldProgress();
    updateWorldLocks();
    unlockRedeemedForHero();
    selectNextWorldAfterCompletion(completedWorld);
    if (completedWorld === finalWorldKey) {
      creditsScreen.classList.remove("hidden");
      creditsContinueButton.focus();
      return;
    }
    finish(true);
  }

  function closeCreditsSequence() {
    creditsScreen.classList.add("hidden");
    finish(true);
  }

  function unlockRedeemedForHero() {
    const unlocked = redeemedKeyForHero();
    if (!unlocked) return;
    if (redeemedCharacterKeys.has(unlocked)) {
      game.unlockedRedeemed.add(unlocked);
      persistUnlockedRedeemed();
      updateRedeemedLocks();
    }
  }

  function redeemedKeyForHero() {
    if (game.selectedHero === "nana" && game.selectedCompanion === "nana") return "angeliux";
    if (game.selectedHero === "elayitas" && game.selectedCompanion === "elayitas") return "daroe";
    if (game.selectedHero === "elayitas" && game.selectedCompanion === "angie") return "mamel";
    if (game.selectedHero === "mrTio") return "srJoe";
    if (game.selectedHero === "donaCarmelina") return "lordSanty";
    if (game.selectedHero === "tan") return "donaNene";
    const mapped = redeemedCharacterByHero[game.selectedHero] || "padrino";
    if (mapped && mapped !== game.selectedHero && !redeemedCharacterKeys.has(game.selectedHero)) return mapped;
    const blocked = new Set([game.selectedHero, game.selectedCompanion, mapped]);
    return fallbackRedemptionCandidates.find((key) => !blocked.has(key)) || mapped;
  }

  function redeemedNameForHero() {
    const key = redeemedKeyForHero();
    return characterDefs[key]?.label || redeemedByHero[game.selectedHero] || "Padrino";
  }

  function redemptionMessage(name) {
    const villain = currentVillain();
    return `${villain} was finally touched by the grace of God and became "${name}". / ${villain} finalmente fue tocado por la gracia de Dios y se convirtió en "${name}".`;
  }

  skipFinalButton.addEventListener("click", closeFinalSequence);
  finalVideo.addEventListener("ended", closeFinalSequence);
  creditsContinueButton.addEventListener("click", closeCreditsSequence);

  function speakLine(text, lang = "es-MX", rate = 0.92, pitch = 1) {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((voice) => voice.lang === lang) || voices.find((voice) => voice.lang.startsWith(lang.slice(0, 2)));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }

  function startIntroSpeech() {
    stopIntroSpeech();
    const lines = [
      { at: 2700, text: "Yo soy el Tacalache, y me llevo a los niños traviesos. Plam, plam, plam, plam, plam.", rate: 0.85, pitch: 0.65 },
      { at: 5200, text: "Crux Sacra Sit Mihi Lux. Non Draco Sit Mihi Dux.", rate: 0.88, pitch: 1.18 },
      { at: 8000, text: "¿Quién como Dios? La Crux Sacra protege a los niños.", rate: 0.9, pitch: 0.9 },
    ];
    for (const line of lines) {
      introSpeechTimers.push(window.setTimeout(() => speakLine(line.text, "es-MX", line.rate, line.pitch), line.at));
    }
  }

  function stopIntroSpeech() {
    for (const timer of introSpeechTimers) window.clearTimeout(timer);
    introSpeechTimers = [];
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  loadImages()
    .then(() => {
      refreshCharacterChoicePortraits();
      draw();
      requestAnimationFrame((now) => {
        game.last = now;
        loop(now);
      });
    })
    .catch((error) => {
      titleScreen.querySelector("p").textContent = error.message;
    });
})();
