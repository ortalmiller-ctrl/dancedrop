// Character artwork for the desktop overlay. Same cast and same animation keys
// as the website renderer, drawn as inline SVG so the app needs no network for
// its own artwork.

const INK = '#141110';
const ARM_STYLE = 'transform-box: fill-box; transform-origin: 50% 18%';

const ART = {
  banana: `
    <g class="dd-arm" style="${ARM_STYLE}">
      <path d="M62 118 C44 118 32 106 28 93" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="24" cy="88" r="10" fill="#FFC53D" stroke="${INK}" stroke-width="5"/>
    </g>
    <path d="M100 22 C130 32 146 64 140 104 C134 144 120 172 100 180 C80 172 66 144 60 104 C54 64 70 32 100 22 Z" fill="#FFC53D" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M78 44 C65 66 61 98 67 128" stroke="#FFEA9E" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.85"/>
    <path d="M100 22 C104 13 113 10 121 13" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/>
    <ellipse cx="85" cy="96" rx="5" ry="7.5" fill="${INK}"/>
    <ellipse cx="115" cy="96" rx="5" ry="7.5" fill="${INK}"/>
    <path d="M87 116 Q100 129 113 116" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <g class="dd-wave-arm" style="${ARM_STYLE}">
      <path d="M140 126 C158 130 172 122 178 108" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="181" cy="103" r="10" fill="#FFC53D" stroke="${INK}" stroke-width="5"/>
    </g>
  `,
  chicken: `
    <g class="dd-arm" style="${ARM_STYLE}">
      <path d="M58 130 C42 134 34 146 31 157" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="28" cy="162" r="8" fill="#F08A2B" stroke="${INK}" stroke-width="4"/>
    </g>
    <path d="M92 166 l-11 20 M108 166 l11 20" stroke="#F08A2B" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="100" cy="132" rx="54" ry="52" fill="#FFF7E9" stroke="${INK}" stroke-width="6"/>
    <circle cx="100" cy="76" r="38" fill="#FFF7E9" stroke="${INK}" stroke-width="6"/>
    <path d="M84 42 q4 -17 14 -9 q2 -15 12 -6 q11 -6 10 11" fill="#FF5C1A" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M100 88 l21 10 -21 10 z" fill="#F08A2B" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="84" cy="72" r="5" fill="${INK}"/>
    <circle cx="116" cy="72" r="5" fill="${INK}"/>
    <path d="M70 138 q12 12 26 10" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.45"/>
    <g class="dd-wave-arm" style="${ARM_STYLE}">
      <path d="M146 132 C162 128 170 116 172 104" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="174" cy="99" r="8" fill="#F08A2B" stroke="${INK}" stroke-width="4"/>
    </g>
  `,
  robot: `
    <g class="dd-arm" style="${ARM_STYLE}">
      <rect x="28" y="106" width="18" height="52" rx="9" fill="#C9D2DC" stroke="${INK}" stroke-width="5"/>
    </g>
    <rect x="52" y="96" width="96" height="74" rx="18" fill="#C9D2DC" stroke="${INK}" stroke-width="6"/>
    <circle cx="100" cy="134" r="12" fill="#FF5C1A" stroke="${INK}" stroke-width="5"/>
    <path d="M100 36 V18" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="100" cy="13" r="7" fill="#FF5C1A" stroke="${INK}" stroke-width="4"/>
    <rect x="64" y="36" width="72" height="58" rx="16" fill="#E9EEF4" stroke="${INK}" stroke-width="6"/>
    <rect x="80" y="54" width="14" height="15" rx="4" fill="#FF5C1A"/>
    <rect x="106" y="54" width="14" height="15" rx="4" fill="#FF5C1A"/>
    <path d="M84 80 h32" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <g class="dd-wave-arm" style="${ARM_STYLE}">
      <rect x="154" y="104" width="18" height="52" rx="9" fill="#C9D2DC" stroke="${INK}" stroke-width="5"/>
    </g>
  `,
  monster: `
    <g class="dd-arm" style="${ARM_STYLE}">
      <path d="M48 126 C32 130 24 142 22 154" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="19" cy="159" r="9" fill="#B69CFF" stroke="${INK}" stroke-width="5"/>
    </g>
    <path d="M62 60 L50 20 L86 44 Z" fill="#FF5C1A" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M138 60 L150 20 L114 44 Z" fill="#FF5C1A" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M100 34 C148 34 164 76 160 116 C156 154 132 174 100 174 C68 174 44 154 40 116 C36 76 52 34 100 34 Z" fill="#B69CFF" stroke="${INK}" stroke-width="6"/>
    <circle cx="100" cy="94" r="27" fill="#FFFDF8" stroke="${INK}" stroke-width="5"/>
    <circle cx="104" cy="96" r="10" fill="${INK}"/>
    <path d="M78 140 Q100 162 122 140" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
    <ellipse cx="74" cy="174" rx="14" ry="8" fill="#8E6DFF" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="126" cy="174" rx="14" ry="8" fill="#8E6DFF" stroke="${INK}" stroke-width="5"/>
    <g class="dd-wave-arm" style="${ARM_STYLE}">
      <path d="M152 126 C168 130 176 142 178 154" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="181" cy="159" r="9" fill="#B69CFF" stroke="${INK}" stroke-width="5"/>
    </g>
  `,
  potato: `
    <g class="dd-arm" style="${ARM_STYLE}">
      <path d="M50 116 C34 118 26 128 23 140" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="20" cy="146" r="9" fill="#D9A15B" stroke="${INK}" stroke-width="5"/>
    </g>
    <g transform="rotate(-10 100 108)">
      <ellipse cx="100" cy="108" rx="56" ry="66" fill="#D9A15B" stroke="${INK}" stroke-width="6"/>
      <g fill="#B87E3C" opacity="0.75">
        <ellipse cx="128" cy="74" rx="7" ry="5"/>
        <ellipse cx="76" cy="146" rx="6" ry="4"/>
        <ellipse cx="132" cy="138" rx="5" ry="4"/>
      </g>
    </g>
    <ellipse cx="86" cy="100" rx="5" ry="7" fill="${INK}"/>
    <ellipse cx="114" cy="100" rx="5" ry="7" fill="${INK}"/>
    <path d="M86 120 Q100 134 114 120" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <g class="dd-wave-arm" style="${ARM_STYLE}">
      <path d="M150 116 C166 118 174 128 177 140" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="180" cy="146" r="9" fill="#D9A15B" stroke="${INK}" stroke-width="5"/>
    </g>
  `,
  bibi: `
    <g class="dd-arm" style="${ARM_STYLE}">
      <path d="M58 130 C42 134 32 146 29 157" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="26" cy="162" r="9" fill="#F2C6A0" stroke="${INK}" stroke-width="5"/>
    </g>
    <path d="M91 96 h18 v22 h-18 z" fill="#E8B58C" stroke="${INK}" stroke-width="4"/>
    <path d="M100 106 C78 106 62 124 58 152 L54 190 H146 L142 152 C138 124 122 106 100 106 Z" fill="#22262E" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M100 110 L86 124 L100 152 L114 124 Z" fill="#FFFDF8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M100 126 L108 136 L104 168 L100 175 L96 168 L92 136 Z" fill="#E23B1F" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M84 118 L74 152" stroke="#3D4450" stroke-width="6" stroke-linecap="round"/>
    <path d="M116 118 L126 152" stroke="#3D4450" stroke-width="6" stroke-linecap="round"/>
    <path d="M124 150 l4 -11 l9 6 z" fill="#FF5C1A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <g class="dd-wave-arm" style="${ARM_STYLE}">
      <path d="M141 130 C159 124 169 109 173 95" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="175" cy="90" r="9" fill="#F2C6A0" stroke="${INK}" stroke-width="5"/>
      <path d="M181 84 l9 -6" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    </g>
  `,
};

// The real photo face for Bibi, positioned where the head sits in her artwork.
const FACES = {
  bibi: 'https://media.base44.com/images/public/6afc05b2e05cb78ddc781d5f/fb16bcd1b_bibi-portrait.jpg',
};

window.DD_CHARACTERS = Object.keys(ART).map(function (slug) {
  return { slug: slug, art: ART[slug], face: FACES[slug] || '' };
});