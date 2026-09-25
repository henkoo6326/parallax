// Copied verbatim from PARALLAX_콘솔_20260919/통제실_3D/app.js cityBase().
// Fictional city; not a geographic basemap.
export function cityBase() {
  const VX = [140, 340, 540, 740, 900], HY = [120, 280, 440, 580];
  let s = `<rect x="0" y="0" width="1000" height="680" fill="#e9ece7"/>`;
  const xs = [0, ...VX, 1000], ys = [0, ...HY, 680];
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    const x = xs[i] + 12, y = ys[j] + 12, w = xs[i + 1] - xs[i] - 24, h = ys[j + 1] - ys[j] - 24;
    if (w > 8 && h > 8) s += `<rect class="m-block ${(i + j) % 2 ? 'm-block-2' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`;
  }
  s += `<rect class="m-park" x="592" y="300" width="164" height="130" rx="8"/>`;
  s += `<ellipse class="m-water" cx="712" cy="404" rx="34" ry="20"/>`;
  s += `<path class="m-water" d="M0 640 Q 160 600 260 660 T 520 668 L 520 680 L 0 680 Z"/>`;
  VX.forEach(x => { s += `<line class="m-road ${x === 540 ? 'm-road-major' : ''}" x1="${x}" y1="0" x2="${x}" y2="680" stroke-width="${x === 540 ? 16 : 11}"/>`; });
  HY.forEach(y => { s += `<line class="m-road ${y === 440 ? 'm-road-major' : ''}" x1="0" y1="${y}" x2="1000" y2="${y}" stroke-width="${y === 440 ? 16 : 11}"/>`; });
  s += `<line class="m-roadmark" x1="0" y1="440" x2="1000" y2="440"/><line class="m-roadmark" x1="540" y1="0" x2="540" y2="680"/>`;
  const lb = [[64, 100, '하늘동'], [636, 100, '새빛로'], [556, 470, '중앙대로'], [660, 296, '한들공원'],
    [812, 470, '서강로'], [64, 500, '미르동'], [180, 664, '물결천'], [404, 268, '중앙시장'], [860, 108, '북단 교차로']];
  lb.forEach(([x, y, t]) => { s += `<text class="m-label" x="${x}" y="${y}">${t}</text>`; });
  return s;
}
