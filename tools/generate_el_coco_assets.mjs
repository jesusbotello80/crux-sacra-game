import { mkdirSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const bgDir = new URL("video-demo/backgrounds/el-coco/playable/", root);
const spriteDir = new URL("character-sprites/el-coco/", root);
mkdirSync(bgDir, { recursive: true });
mkdirSync(spriteDir, { recursive: true });

const css = `
  .ink{stroke:#201a25;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
  .soft{filter:url(#soft)}
  .label{font-family:Arial,Helvetica,sans-serif;font-weight:800;letter-spacing:.5px}
`;

function defs(extra = "") {
  return `<defs>
    <filter id="soft"><feGaussianBlur stdDeviation="7"/></filter>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3f4d6d"/><stop offset="1" stop-color="#172033"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5b4435"/><stop offset="1" stop-color="#2c211d"/></linearGradient>
    <radialGradient id="lamp" cx=".5" cy=".5" r=".55"><stop stop-color="#fff7c4"/><stop offset=".48" stop-color="#ffd772"/><stop offset="1" stop-color="#f4a73c" stop-opacity="0"/></radialGradient>
    <linearGradient id="shadow" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#04070d"/><stop offset="1" stop-color="#1f102b"/></linearGradient>
    ${extra}
  </defs>`;
}

function cross(x, y, scale = 1, color = "#f6d86f") {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <rect x="-8" y="-34" width="16" height="68" rx="4" fill="${color}" class="ink"/>
    <rect x="-30" y="-8" width="60" height="16" rx="4" fill="${color}" class="ink"/>
  </g>`;
}

function bed(x, y, w, h, sheet, pillow, wood = "#5f3a29") {
  return `<g>
    <rect x="${x}" y="${y - h * .35}" width="${w}" height="${h * .48}" rx="18" fill="${wood}" class="ink"/>
    <rect x="${x + 28}" y="${y - h * .64}" width="${w - 56}" height="${h * .36}" rx="14" fill="${pillow}" class="ink"/>
    <rect x="${x - 18}" y="${y - h * .2}" width="${w + 36}" height="${h * .62}" rx="24" fill="${sheet}" class="ink"/>
    <path d="M${x + 40} ${y + 4} C${x + w * .36} ${y + 32}, ${x + w * .62} ${y - 18}, ${x + w - 35} ${y + 15}" fill="none" stroke="#fff8d3" stroke-opacity=".34" stroke-width="5"/>
    <rect x="${x - 8}" y="${y + h * .35}" width="22" height="72" rx="8" fill="${wood}" class="ink"/>
    <rect x="${x + w - 14}" y="${y + h * .35}" width="22" height="72" rx="8" fill="${wood}" class="ink"/>
  </g>`;
}

function closet(x, y, w, h, color = "#5b352b") {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${color}" class="ink"/>
    <line x1="${x + w / 2}" y1="${y + 10}" x2="${x + w / 2}" y2="${y + h - 10}" stroke="#251716" stroke-width="4"/>
    <circle cx="${x + w / 2 - 18}" cy="${y + h * .48}" r="5" fill="#e8c46d"/>
    <circle cx="${x + w / 2 + 18}" cy="${y + h * .48}" r="5" fill="#e8c46d"/>
  </g>`;
}

function windowEl(x, y, w, h, sky = "#172747", curtain = "#8b3443") {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${sky}" class="ink"/>
    <path d="M${x + 16} ${y + h - 24} C${x + w * .35} ${y + h - 70}, ${x + w * .72} ${y + h - 40}, ${x + w - 16} ${y + h - 92}" stroke="#8fa6ce" stroke-width="5" fill="none" opacity=".55"/>
    <line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#e7d6ad" stroke-width="5"/>
    <line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#e7d6ad" stroke-width="5"/>
    <path d="M${x - 28} ${y - 10} C${x - 45} ${y + 45}, ${x - 36} ${y + h - 20}, ${x - 8} ${y + h + 10}" fill="${curtain}" opacity=".88" class="ink"/>
    <path d="M${x + w + 28} ${y - 10} C${x + w + 45} ${y + 45}, ${x + w + 36} ${y + h - 20}, ${x + w + 8} ${y + h + 10}" fill="${curtain}" opacity=".88" class="ink"/>
  </g>`;
}

function room({ file, title, subtitle, wallA, wallB, floorA, sheet, pillow, accent, closetColor, extras }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <style>${css}</style>
  ${defs(`<linearGradient id="sceneWall" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${wallA}"/><stop offset="1" stop-color="${wallB}"/></linearGradient><linearGradient id="sceneFloor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${floorA}"/><stop offset="1" stop-color="#261d1c"/></linearGradient>`)}
  <rect width="1600" height="900" fill="url(#sceneWall)"/>
  <rect y="620" width="1600" height="280" fill="url(#sceneFloor)"/>
  <path d="M0 620 C260 590 510 650 780 612 C1070 575 1310 650 1600 606 L1600 900 L0 900Z" fill="#110f17" opacity=".18"/>
  <circle cx="1280" cy="180" r="230" fill="url(#lamp)" opacity=".62"/>
  ${windowEl(100, 125, 290, 220, "#122542", accent)}
  ${closet(1130, 155, 260, 440, closetColor)}
  ${bed(460, 520, 560, 210, sheet, pillow)}
  ${cross(744, 230, 1.12)}
  <rect x="1032" y="472" width="82" height="120" rx="9" fill="#5c402c" class="ink"/>
  <circle cx="1074" cy="440" r="72" fill="url(#lamp)" opacity=".86"/>
  <path d="M1051 472 L1097 472 L1088 520 L1060 520Z" fill="#ffe3a0" class="ink"/>
  <g opacity=".8">${extras}</g>
  <text x="52" y="77" class="label" font-size="36" fill="#fff8d3">${title}</text>
  <text x="54" y="116" class="label" font-size="22" fill="#e7d6ad">${subtitle}</text>
  <rect x="0" y="0" width="1600" height="900" fill="none" stroke="#f6d86f" stroke-opacity=".08" stroke-width="18"/>
</svg>`;
  writeFileSync(new URL(file, bgDir), svg);
}

room({
  file: "bg-el-coco-level-1-colorado-bedroom.svg",
  title: "Colorado Springs Bedroom",
  subtitle: "mountain quilt, family crucifix, closet shadows",
  wallA: "#516985", wallB: "#263749", floorA: "#6a4a35", sheet: "#557a9b", pillow: "#f0efe8", accent: "#89444f", closetColor: "#6a412f",
  extras: `<path d="M118 598 L285 438 L450 598Z" fill="#89a7b8" opacity=".38"/><path d="M198 598 L325 488 L560 598Z" fill="#c34f39" opacity=".28"/><circle cx="255" cy="248" r="4" fill="#fff8d3"/><circle cx="300" cy="210" r="3" fill="#fff8d3"/><rect x="570" y="660" width="65" height="40" rx="10" fill="#c34f39" class="ink"/><rect x="650" y="660" width="65" height="40" rx="10" fill="#e8c46d" class="ink"/>`,
});

room({
  file: "bg-el-coco-level-2-alabama-bedroom.svg",
  title: "Alabama Bedroom",
  subtitle: "rain on the window, Gulf Coast quilt, crucifix above the bed",
  wallA: "#4d5d60", wallB: "#203133", floorA: "#6b4637", sheet: "#698f77", pillow: "#fff1ce", accent: "#5d7f8f", closetColor: "#4f362b",
  extras: `<path d="M118 180 C190 150 270 165 345 130" stroke="#d9f1ff" stroke-width="4" opacity=".38"/><path d="M155 226 C225 198 280 215 350 185" stroke="#d9f1ff" stroke-width="4" opacity=".28"/><path d="M1340 620 C1370 590 1404 588 1436 620 C1414 600 1394 602 1375 620Z" fill="#70a77e" class="ink"/><path d="M1160 684 C1200 650 1260 650 1298 684" stroke="#6fb37f" stroke-width="8" fill="none"/>`,
});

room({
  file: "bg-el-coco-level-3-juarez-infonavit-bedroom.svg",
  title: "Juárez Infonavit Bedroom",
  subtitle: "compact family room, barred window, practical ropero, crucifix above the bed",
  wallA: "#735f4c", wallB: "#302b29", floorA: "#70513d", sheet: "#2f8b9a", pillow: "#fff2d2", accent: "#2f8095", closetColor: "#7a4a34",
  extras: `<rect x="130" y="132" width="260" height="210" rx="6" fill="#112537" class="ink"/><g stroke="#d7c39b" stroke-width="8"><line x1="172" y1="142" x2="172" y2="334"/><line x1="224" y1="142" x2="224" y2="334"/><line x1="276" y1="142" x2="276" y2="334"/><line x1="328" y1="142" x2="328" y2="334"/><line x1="140" y1="198" x2="380" y2="198"/><line x1="140" y1="274" x2="380" y2="274"/></g><rect x="80" y="610" width="230" height="30" fill="#b77a4a" class="ink"/><rect x="104" y="518" width="62" height="92" fill="#8f5b39" class="ink"/><rect x="180" y="545" width="86" height="65" fill="#c99b5c" class="ink"/><path d="M1280 650 c40 -40 82 -36 120 -4" stroke="#6f7d43" stroke-width="8" fill="none"/><text x="72" y="690" class="label" font-size="28" fill="#f0d38a" opacity=".75">INFONAVIT</text>`,
});

room({
  file: "bg-el-coco-level-4-el-paso-bedroom.svg",
  title: "El Paso Bedroom",
  subtitle: "desert colors, ropero, Franklin star in the night window",
  wallA: "#6c5748", wallB: "#2a2629", floorA: "#765135", sheet: "#b4774f", pillow: "#fff0cf", accent: "#7b3652", closetColor: "#6b3b29",
  extras: `<polygon points="230,185 244,214 276,218 253,240 259,272 230,257 201,272 207,240 184,218 216,214" fill="#fff4a8" opacity=".88"/><path d="M100 610 C260 540 390 540 560 610" fill="#9e6b4b" opacity=".22"/><path d="M1280 640 l16 -74 l18 74 M1335 650 l20 -90 l23 90" stroke="#58724b" stroke-width="9" fill="none"/>`,
});

room({
  file: "bg-el-coco-level-5-guadalajara-bedroom.svg",
  title: "Guadalajara Bedroom",
  subtitle: "warm arches, embroidered blanket, old wooden closet",
  wallA: "#7b5441", wallB: "#352220", floorA: "#745034", sheet: "#d08c4e", pillow: "#fff6d8", accent: "#a74945", closetColor: "#5d2f25",
  extras: `<path d="M55 620 C80 490 190 470 224 620 M230 620 C260 485 365 480 410 620" fill="none" stroke="#e1a45f" stroke-width="18" opacity=".32"/><rect x="555" y="650" width="56" height="56" rx="7" fill="#e14c3e" class="ink"/><rect x="630" y="650" width="56" height="56" rx="7" fill="#62a56a" class="ink"/><rect x="705" y="650" width="56" height="56" rx="7" fill="#f2c14f" class="ink"/>`,
});

room({
  file: "bg-el-coco-level-6-mexico-city-bedroom.svg",
  title: "Mexico City Bedroom",
  subtitle: "city lights, family altar, ropero shadow",
  wallA: "#4d4a67", wallB: "#211d33", floorA: "#5f453f", sheet: "#6169a8", pillow: "#f7ead7", accent: "#7a4677", closetColor: "#4a2e3d",
  extras: `<rect x="132" y="250" width="18" height="55" fill="#ffd96e" opacity=".65"/><rect x="182" y="232" width="18" height="73" fill="#ffd96e" opacity=".6"/><rect x="255" y="265" width="18" height="40" fill="#ffd96e" opacity=".55"/><rect x="1180" y="635" width="125" height="18" fill="#684530" class="ink"/><circle cx="1212" cy="596" r="20" fill="#fff4a8"/><rect x="1195" y="616" width="34" height="42" rx="5" fill="#77a1d2" class="ink"/>`,
});

room({
  file: "bg-el-coco-level-7-closet-boss.svg",
  title: "Boss Room - El Coco",
  subtitle: "closet doors open, Crux Sacra light over the bed",
  wallA: "#302c46", wallB: "#0d111f", floorA: "#45302c", sheet: "#384f77", pillow: "#fff1ce", accent: "#492744", closetColor: "#231728",
  extras: `<path d="M1130 155 L1256 260 L1256 595 L1130 595Z" fill="#090812" class="ink"/><path d="M1390 155 L1264 260 L1264 595 L1390 595Z" fill="#07060e" class="ink"/><ellipse cx="1260" cy="390" rx="120" ry="185" fill="#04050a" opacity=".88"/><circle cx="1218" cy="352" r="16" fill="#ffdf70"/><circle cx="1302" cy="352" r="16" fill="#ffdf70"/><path d="M690 248 C720 210 770 210 800 248" stroke="#fff4a8" stroke-width="9" fill="none" opacity=".58"/>`,
});

const coco = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900">
  <style>${css}</style>
  <defs>
    <radialGradient id="body" cx=".45" cy=".3" r=".72"><stop stop-color="#33324d"/><stop offset=".62" stop-color="#11131f"/><stop offset="1" stop-color="#050609"/></radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M138 802 C166 725 176 640 158 564 C126 431 137 300 231 209 C279 163 330 141 384 142 C478 144 562 209 590 311 C620 419 577 511 592 611 C604 688 643 748 654 809 C546 764 470 782 358 829 C271 786 203 771 138 802Z" fill="url(#body)" stroke="#11131f" stroke-width="10" stroke-linejoin="round"/>
  <path d="M250 205 C236 135 254 91 315 43 C309 105 333 137 376 153" fill="#10121e" class="ink"/>
  <path d="M441 168 C479 105 528 82 594 91 C543 140 531 182 547 239" fill="#10121e" class="ink"/>
  <path d="M194 487 C104 495 70 552 60 636 C117 584 155 585 195 614" fill="#090a11" class="ink"/>
  <path d="M578 472 C652 488 690 548 688 637 C633 582 594 590 561 628" fill="#090a11" class="ink"/>
  <circle cx="310" cy="330" r="31" fill="#ffdf70" filter="url(#glow)"/>
  <circle cx="428" cy="330" r="31" fill="#ffdf70" filter="url(#glow)"/>
  <path d="M292 458 C336 486 398 488 450 455" stroke="#f4d58d" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M328 508 C340 548 333 597 296 648 M392 510 C384 560 400 605 440 652" stroke="#2c2a3b" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M218 268 C170 320 156 398 180 468 M539 271 C577 333 579 406 551 466" stroke="#514f68" stroke-width="9" fill="none" opacity=".5"/>
  <path d="M276 748 C295 708 332 688 360 685 C397 688 438 712 464 755" stroke="#f6d86f" stroke-width="10" stroke-linecap="round" opacity=".55"/>
</svg>`;
writeFileSync(new URL("el-coco-cutout.svg", spriteDir), coco);

console.log("Generated El Coco world SVG assets.");
