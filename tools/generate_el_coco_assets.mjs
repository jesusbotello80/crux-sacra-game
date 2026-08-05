import { mkdirSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const bgDir = new URL("video-demo/backgrounds/el-coco/playable/", root);
const spriteDir = new URL("character-sprites/el-coco/", root);
mkdirSync(bgDir, { recursive: true });
mkdirSync(spriteDir, { recursive: true });

const css = `
  .ink{stroke:#201823;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
  .thin{stroke:#2c2330;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .paint{filter:url(#paint)}
  .glow{filter:url(#goldGlow)}
  .label{font-family:Arial,Helvetica,sans-serif;font-weight:800;letter-spacing:.4px}
`;

function defs(extra = "") {
  return `<defs>
    <filter id="paint" x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency=".009 .018" numOctaves="3" seed="17" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values=".18" result="softNoise"/>
      <feBlend in="SourceGraphic" in2="softNoise" mode="overlay"/>
    </filter>
    <filter id="goldGlow" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 .95  0 1 0 0 .72  0 0 1 0 .25  0 0 0 .82 0" result="gold"/>
      <feMerge><feMergeNode in="gold"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="lamp" cx=".5" cy=".5" r=".58">
      <stop stop-color="#fff8c8"/>
      <stop offset=".45" stop-color="#ffd56f"/>
      <stop offset="1" stop-color="#f0a948" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="nightPool" cx=".5" cy=".55" r=".65">
      <stop stop-color="#1b2441" stop-opacity=".65"/>
      <stop offset="1" stop-color="#070a12" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="woodDark" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#7c4d36"/><stop offset="1" stop-color="#38221d"/>
    </linearGradient>
    ${extra}
  </defs>`;
}

function cross(x, y, scale = 1, color = "#f6d86f") {
  return `<g transform="translate(${x} ${y}) scale(${scale})" class="glow">
    <rect x="-8" y="-34" width="16" height="68" rx="4" fill="${color}" class="ink"/>
    <rect x="-30" y="-8" width="60" height="16" rx="4" fill="${color}" class="ink"/>
  </g>`;
}

function wallTexture(color = "#ffffff", opacity = ".16") {
  const marks = [];
  for (let i = 0; i < 30; i += 1) {
    const x = 70 + ((i * 139) % 1470);
    const y = 85 + ((i * 211) % 470);
    const w = 70 + ((i * 17) % 95);
    marks.push(`<path d="M${x} ${y} C${x + w * .35} ${y - 18}, ${x + w * .72} ${y + 22}, ${x + w} ${y + 2}" stroke="${color}" stroke-width="${2 + (i % 3)}" opacity="${opacity}" fill="none"/>`);
  }
  return marks.join("");
}

function floorBoards() {
  const lines = [];
  for (let y = 648; y < 890; y += 38) {
    lines.push(`<path d="M0 ${y} C260 ${y - 14}, 520 ${y + 18}, 820 ${y - 3} S1300 ${y + 12}, 1600 ${y - 4}" stroke="#1b1414" stroke-opacity=".22" stroke-width="4" fill="none"/>`);
  }
  for (let x = 80; x < 1600; x += 175) {
    lines.push(`<path d="M${x} 626 C${x + 28} 704, ${x - 16} 812, ${x + 18} 900" stroke="#271c1b" stroke-opacity=".18" stroke-width="3" fill="none"/>`);
  }
  return lines.join("");
}

function bed(x, y, w, h, sheet, pillow, wood = "#69412d", quilt = "#f6d86f") {
  return `<g class="paint">
    <ellipse cx="${x + w * .53}" cy="${y + h * .47}" rx="${w * .54}" ry="46" fill="#07080e" opacity=".32"/>
    <rect x="${x - 16}" y="${y - h * .43}" width="${w + 32}" height="${h * .58}" rx="18" fill="url(#woodDark)" class="ink"/>
    <path d="M${x + 28} ${y - h * .36} H${x + w - 28}" stroke="#a36a47" stroke-width="7" opacity=".45"/>
    <rect x="${x + 36}" y="${y - h * .72}" width="${w - 72}" height="${h * .39}" rx="15" fill="${pillow}" class="ink"/>
    <path d="M${x + 62} ${y - h * .52} C${x + w * .34} ${y - h * .67}, ${x + w * .68} ${y - h * .44}, ${x + w - 62} ${y - h * .58}" stroke="#d7cbb6" stroke-width="4" opacity=".5" fill="none"/>
    <rect x="${x - 24}" y="${y - h * .17}" width="${w + 48}" height="${h * .68}" rx="26" fill="${sheet}" class="ink"/>
    <path d="M${x + 50} ${y + 2} C${x + w * .32} ${y + 34}, ${x + w * .58} ${y - 20}, ${x + w - 36} ${y + 18}" fill="none" stroke="#fff8d3" stroke-opacity=".34" stroke-width="5"/>
    <path d="M${x + 70} ${y + 74} C${x + w * .28} ${y + 46}, ${x + w * .54} ${y + 98}, ${x + w - 70} ${y + 60}" stroke="${quilt}" stroke-width="5" opacity=".55" fill="none"/>
    <rect x="${x - 12}" y="${y + h * .36}" width="24" height="76" rx="8" fill="${wood}" class="ink"/>
    <rect x="${x + w - 12}" y="${y + h * .36}" width="24" height="76" rx="8" fill="${wood}" class="ink"/>
  </g>`;
}

function closet(x, y, w, h, color = "#5b352b", open = false) {
  if (open) {
    return `<g class="paint">
      <ellipse cx="${x + w / 2}" cy="${y + h - 16}" rx="${w * .56}" ry="42" fill="#04050a" opacity=".58"/>
      <path d="M${x + w * .5} ${y + 40} C${x + w * .25} ${y + 110}, ${x + w * .19} ${y + h - 60}, ${x + 12} ${y + h}" fill="#080813" class="ink"/>
      <path d="M${x + w * .5} ${y + 40} C${x + w * .77} ${y + 110}, ${x + w * .8} ${y + h - 60}, ${x + w - 12} ${y + h}" fill="#060711" class="ink"/>
      <ellipse cx="${x + w / 2}" cy="${y + h * .5}" rx="${w * .28}" ry="${h * .32}" fill="#010208" opacity=".9"/>
      <path d="M${x} ${y} L${x + w * .5} ${y + 52} L${x + w * .42} ${y + h} L${x} ${y + h - 8}Z" fill="${color}" class="ink"/>
      <path d="M${x + w} ${y} L${x + w * .5} ${y + 52} L${x + w * .58} ${y + h} L${x + w} ${y + h - 8}Z" fill="${color}" class="ink"/>
      <circle cx="${x + w * .42}" cy="${y + h * .48}" r="7" fill="#e8c46d"/>
      <circle cx="${x + w * .58}" cy="${y + h * .48}" r="7" fill="#e8c46d"/>
    </g>`;
  }
  return `<g class="paint">
    <ellipse cx="${x + w / 2}" cy="${y + h + 14}" rx="${w * .52}" ry="36" fill="#07080e" opacity=".28"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${color}" class="ink"/>
    <path d="M${x + 18} ${y + 28} C${x + 90} ${y + 12}, ${x + 130} ${y + 60}, ${x + w - 28} ${y + 30}" stroke="#906247" stroke-width="5" opacity=".34" fill="none"/>
    <line x1="${x + w / 2}" y1="${y + 14}" x2="${x + w / 2}" y2="${y + h - 14}" stroke="#251716" stroke-width="4"/>
    <circle cx="${x + w / 2 - 20}" cy="${y + h * .48}" r="6" fill="#e8c46d"/>
    <circle cx="${x + w / 2 + 20}" cy="${y + h * .48}" r="6" fill="#e8c46d"/>
  </g>`;
}

function windowEl(x, y, w, h, sky = "#172747", curtain = "#8b3443", bars = false) {
  const barLines = bars
    ? `<g stroke="#d7c39b" stroke-width="7" opacity=".85">
        <line x1="${x + 48}" y1="${y + 8}" x2="${x + 48}" y2="${y + h - 8}"/>
        <line x1="${x + 100}" y1="${y + 8}" x2="${x + 100}" y2="${y + h - 8}"/>
        <line x1="${x + 152}" y1="${y + 8}" x2="${x + 152}" y2="${y + h - 8}"/>
        <line x1="${x + 204}" y1="${y + 8}" x2="${x + 204}" y2="${y + h - 8}"/>
        <line x1="${x + 8}" y1="${y + h * .36}" x2="${x + w - 8}" y2="${y + h * .36}"/>
        <line x1="${x + 8}" y1="${y + h * .68}" x2="${x + w - 8}" y2="${y + h * .68}"/>
      </g>`
    : `<line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#e7d6ad" stroke-width="5"/>
       <line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#e7d6ad" stroke-width="5"/>`;
  return `<g class="paint">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${sky}" class="ink"/>
    <path d="M${x + 16} ${y + h - 24} C${x + w * .35} ${y + h - 70}, ${x + w * .72} ${y + h - 40}, ${x + w - 16} ${y + h - 92}" stroke="#9cb3d8" stroke-width="5" fill="none" opacity=".55"/>
    ${barLines}
    <path d="M${x - 32} ${y - 10} C${x - 50} ${y + 48}, ${x - 38} ${y + h - 20}, ${x - 8} ${y + h + 10}" fill="${curtain}" opacity=".9" class="ink"/>
    <path d="M${x + w + 32} ${y - 10} C${x + w + 50} ${y + 48}, ${x + w + 38} ${y + h - 20}, ${x + w + 8} ${y + h + 10}" fill="${curtain}" opacity=".9" class="ink"/>
  </g>`;
}

function lampTable(x, y) {
  return `<g class="paint">
    <rect x="${x}" y="${y + 36}" width="102" height="18" rx="7" fill="#6a422e" class="ink"/>
    <rect x="${x + 14}" y="${y + 54}" width="72" height="80" rx="8" fill="#543420" class="ink"/>
    <circle cx="${x + 50}" cy="${y - 12}" r="80" fill="url(#lamp)" opacity=".82"/>
    <path d="M${x + 24} ${y + 28} L${x + 76} ${y + 28} L${x + 64} ${y + 76} L${x + 36} ${y + 76}Z" fill="#ffe1a0" class="ink"/>
    <line x1="${x + 50}" y1="${y + 28}" x2="${x + 50}" y2="${y - 34}" stroke="#3b2b21" stroke-width="5"/>
  </g>`;
}

function toyBlocks(x, y) {
  return `<g class="paint">
    <rect x="${x}" y="${y}" width="62" height="44" rx="10" fill="#c94f3e" class="ink"/>
    <rect x="${x + 80}" y="${y}" width="62" height="44" rx="10" fill="#d9bd67" class="ink"/>
    <rect x="${x + 160}" y="${y}" width="62" height="44" rx="10" fill="#5a84a7" class="ink"/>
  </g>`;
}

function room({ file, title, subtitle, wallA, wallB, floorA, sheet, pillow, accent, closetColor, extras, bars = false, boss = false }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <style>${css}</style>
  ${defs(`<linearGradient id="sceneWall" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${wallA}"/><stop offset="1" stop-color="${wallB}"/></linearGradient><linearGradient id="sceneFloor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${floorA}"/><stop offset="1" stop-color="#211818"/></linearGradient>`)}
  <rect width="1600" height="900" fill="url(#sceneWall)"/>
  <rect width="1600" height="900" fill="url(#nightPool)" opacity=".42"/>
  ${wallTexture("#f4e2ba", ".11")}
  <rect y="620" width="1600" height="280" fill="url(#sceneFloor)"/>
  ${floorBoards()}
  <path d="M0 620 C260 590 510 650 780 612 C1070 575 1310 650 1600 606 L1600 900 L0 900Z" fill="#08070d" opacity=".2"/>
  <circle cx="1280" cy="180" r="245" fill="url(#lamp)" opacity=".5"/>
  ${windowEl(105, 122, 292, 224, "#122542", accent, bars)}
  ${closet(1130, 142, 282, 465, closetColor, boss)}
  ${bed(456, 518, 578, 214, sheet, pillow, "#5f3a29", accent)}
  ${cross(748, 232, 1.12)}
  ${lampTable(1020, 474)}
  <g opacity=".92">${extras}</g>
  <text x="52" y="76" class="label" font-size="36" fill="#fff8d3" opacity=".86">${title}</text>
  <text x="54" y="115" class="label" font-size="22" fill="#e7d6ad" opacity=".72">${subtitle}</text>
  <rect x="0" y="0" width="1600" height="900" fill="none" stroke="#f6d86f" stroke-opacity=".08" stroke-width="18"/>
</svg>`;
  writeFileSync(new URL(file, bgDir), svg);
}

room({
  file: "bg-el-coco-level-1-colorado-bedroom.svg",
  title: "Colorado Springs Bedroom",
  subtitle: "mountain quilt, family crucifix, closet shadows",
  wallA: "#536f8d",
  wallB: "#24364d",
  floorA: "#71513c",
  sheet: "#557a9b",
  pillow: "#f3efe5",
  accent: "#8e4050",
  closetColor: "#6b402e",
  extras: `<path d="M124 604 L288 430 L454 604Z" fill="#9ab0c0" opacity=".34"/><path d="M198 604 L334 486 L575 604Z" fill="#c5573d" opacity=".28"/><circle cx="254" cy="247" r="4" fill="#fff8d3"/><circle cx="304" cy="208" r="3" fill="#fff8d3"/>${toyBlocks(550, 660)}`,
});

room({
  file: "bg-el-coco-level-2-alabama-bedroom.svg",
  title: "Alabama Rain Room",
  subtitle: "rain on the window, Gulf Coast quilt, crucifix above the bed",
  wallA: "#526260",
  wallB: "#213437",
  floorA: "#6b4637",
  sheet: "#6d9479",
  pillow: "#fff1ce",
  accent: "#5c8091",
  closetColor: "#52372c",
  extras: `<path d="M120 178 C190 150 272 165 348 130" stroke="#dff4ff" stroke-width="4" opacity=".4"/><path d="M155 226 C225 198 282 215 352 185" stroke="#dff4ff" stroke-width="4" opacity=".3"/><path d="M1330 646 C1366 598 1414 594 1456 640 C1422 624 1394 625 1368 648Z" fill="#6fa17c" class="ink"/><path d="M1165 694 C1204 654 1262 650 1305 686" stroke="#6fb37f" stroke-width="8" fill="none"/>`,
});

room({
  file: "bg-el-coco-level-3-juarez-infonavit-bedroom.svg",
  title: "Juarez Infonavit Bedroom",
  subtitle: "compact family room, barred window, practical ropero",
  wallA: "#7a634d",
  wallB: "#302b29",
  floorA: "#77553f",
  sheet: "#2f8c9c",
  pillow: "#fff2d2",
  accent: "#2f8095",
  closetColor: "#7a4a34",
  bars: true,
  extras: `<rect x="82" y="613" width="240" height="32" fill="#b77a4a" class="ink"/><rect x="105" y="518" width="64" height="96" fill="#8f5b39" class="ink"/><rect x="184" y="546" width="88" height="68" fill="#c99b5c" class="ink"/><text x="72" y="696" class="label" font-size="28" fill="#f0d38a" opacity=".75">INFONAVIT</text><path d="M1280 652 c40 -40 84 -36 122 -4" stroke="#6f7d43" stroke-width="8" fill="none"/>`,
});

room({
  file: "bg-el-coco-level-4-el-paso-bedroom.svg",
  title: "El Paso Desert Bedroom",
  subtitle: "Franklin star in the night window",
  wallA: "#6c5848",
  wallB: "#2a2629",
  floorA: "#765135",
  sheet: "#b4774f",
  pillow: "#fff0cf",
  accent: "#7b3652",
  closetColor: "#6b3b29",
  extras: `<polygon points="232,182 246,214 280,218 255,241 262,275 230,258 200,275 207,241 182,218 216,214" fill="#fff4a8" opacity=".9" class="glow"/><path d="M100 612 C260 540 392 540 560 612" fill="#9e6b4b" opacity=".24"/><path d="M1280 648 l16 -78 l18 78 M1335 655 l20 -94 l23 94" stroke="#58724b" stroke-width="9" fill="none"/>`,
});

room({
  file: "bg-el-coco-level-5-guadalajara-bedroom.svg",
  title: "Guadalajara Ropero Room",
  subtitle: "warm arches, embroidered blanket, old wooden closet",
  wallA: "#805840",
  wallB: "#352220",
  floorA: "#745034",
  sheet: "#d08c4e",
  pillow: "#fff6d8",
  accent: "#a74945",
  closetColor: "#5d2f25",
  extras: `<path d="M55 620 C82 488 190 470 224 620 M230 620 C260 486 366 480 412 620" fill="none" stroke="#e1a45f" stroke-width="18" opacity=".32"/>${toyBlocks(548, 658)}<path d="M1330 665 C1390 612 1442 618 1488 662" stroke="#b36d4c" stroke-width="8" fill="none" opacity=".55"/>`,
});

room({
  file: "bg-el-coco-level-6-mexico-city-bedroom.svg",
  title: "Mexico City Night Room",
  subtitle: "city lights, family altar, ropero shadow",
  wallA: "#4f4a68",
  wallB: "#211d33",
  floorA: "#5f453f",
  sheet: "#626aac",
  pillow: "#f7ead7",
  accent: "#7a4677",
  closetColor: "#4a2e3d",
  extras: `<rect x="132" y="250" width="18" height="55" fill="#ffd96e" opacity=".65"/><rect x="182" y="232" width="18" height="73" fill="#ffd96e" opacity=".6"/><rect x="255" y="265" width="18" height="40" fill="#ffd96e" opacity=".55"/><rect x="1180" y="637" width="130" height="18" fill="#684530" class="ink"/><circle cx="1214" cy="596" r="20" fill="#fff4a8" class="glow"/><rect x="1198" y="616" width="34" height="42" rx="5" fill="#77a1d2" class="ink"/>`,
});

room({
  file: "bg-el-coco-level-7-closet-boss.svg",
  title: "Boss Room - El Coco",
  subtitle: "closet doors open, Crux Sacra light over the bed",
  wallA: "#302c46",
  wallB: "#0d111f",
  floorA: "#45302c",
  sheet: "#384f77",
  pillow: "#fff1ce",
  accent: "#492744",
  closetColor: "#231728",
  boss: true,
  extras: `<path d="M688 246 C722 207 772 207 806 246" stroke="#fff4a8" stroke-width="9" fill="none" opacity=".58"/><path d="M1092 626 C1140 586 1194 584 1240 622 M1302 626 C1344 590 1390 594 1428 628" stroke="#342742" stroke-width="8" fill="none" opacity=".58"/>`,
});

const coco = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900">
  <style>${css}</style>
  <defs>
    <radialGradient id="body" cx=".44" cy=".28" r=".74">
      <stop stop-color="#36334c"/>
      <stop offset=".58" stop-color="#11131f"/>
      <stop offset="1" stop-color="#050609"/>
    </radialGradient>
    <radialGradient id="eye" cx=".5" cy=".5" r=".5">
      <stop stop-color="#fff0a6"/>
      <stop offset=".52" stop-color="#ffd35c"/>
      <stop offset="1" stop-color="#b58cff" stop-opacity=".55"/>
    </radialGradient>
    <filter id="purpleGlow" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values=".7 0 0 0 .35  0 .5 0 0 .22  0 0 1 0 .85  0 0 0 .9 0" result="purple"/>
      <feMerge><feMergeNode in="purple"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="362" cy="824" rx="190" ry="38" fill="#050507" opacity=".32"/>
  <path d="M132 810 C168 715 172 636 152 548 C118 400 146 288 234 206 C284 160 336 139 391 142 C491 148 567 220 596 327 C624 432 582 520 599 618 C612 701 656 756 670 826 C560 778 474 785 360 842 C272 792 199 774 132 810Z" fill="url(#body)" stroke="#11131f" stroke-width="10" stroke-linejoin="round"/>
  <path d="M238 216 C222 138 248 88 318 36 C307 111 337 139 380 156" fill="#10121e" class="ink"/>
  <path d="M436 163 C480 94 535 74 604 88 C546 142 532 190 550 248" fill="#10121e" class="ink"/>
  <path d="M194 480 C108 486 66 542 54 632 C116 580 157 584 198 618" fill="#080912" class="ink"/>
  <path d="M580 468 C654 482 694 548 690 642 C637 583 596 586 562 628" fill="#080912" class="ink"/>
  <path d="M230 279 C178 348 172 428 204 498 M542 274 C582 338 582 418 548 494" stroke="#5e5b72" stroke-width="9" fill="none" opacity=".48"/>
  <path d="M222 647 C242 596 278 552 318 522 M492 524 C534 560 558 612 568 670" stroke="#343145" stroke-width="13" fill="none" opacity=".52"/>
  <circle cx="309" cy="328" r="30" fill="url(#eye)" filter="url(#purpleGlow)"/>
  <circle cx="428" cy="328" r="30" fill="url(#eye)" filter="url(#purpleGlow)"/>
  <circle cx="300" cy="320" r="8" fill="#fff8c8" opacity=".74"/>
  <circle cx="419" cy="320" r="8" fill="#fff8c8" opacity=".74"/>
  <path d="M290 455 C336 488 400 489 454 452" stroke="#f4d58d" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M318 516 C336 558 330 604 300 648 M394 516 C382 564 398 608 438 652" stroke="#2c2a3b" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M255 740 C290 705 326 688 360 686 C398 690 435 714 468 754" stroke="#f6d86f" stroke-width="10" stroke-linecap="round" opacity=".54"/>
  <path d="M158 770 C204 742 238 745 278 790 M444 792 C496 756 538 752 613 792" stroke="#050609" stroke-width="24" stroke-linecap="round" opacity=".8"/>
</svg>`;
writeFileSync(new URL("el-coco-cutout.svg", spriteDir), coco);

console.log("Generated improved El Coco world SVG assets.");
