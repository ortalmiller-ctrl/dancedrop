import { cn } from "@/lib/utils";

const INK = "#141110";
const ARM = { transformBox: "fill-box", transformOrigin: "50% 18%" };

const ART = {
  banana: (
    <>
      <g className="dd-arm" style={ARM}>
        <path d="M62 118 C44 118 32 106 28 93" stroke={INK} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="24" cy="88" r="10" fill="#FFC53D" stroke={INK} strokeWidth="5" />
      </g>
      <path d="M100 22 C130 32 146 64 140 104 C134 144 120 172 100 180 C80 172 66 144 60 104 C54 64 70 32 100 22 Z" fill="#FFC53D" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d="M78 44 C65 66 61 98 67 128" stroke="#FFEA9E" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M100 22 C104 13 113 10 121 13" stroke={INK} strokeWidth="7" strokeLinecap="round" fill="none" />
      <ellipse cx="85" cy="96" rx="5" ry="7.5" fill={INK} />
      <ellipse cx="115" cy="96" rx="5" ry="7.5" fill={INK} />
      <path d="M87 116 Q100 129 113 116" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
      <g className="dd-wave-arm" style={ARM}>
        <path d="M140 126 C158 130 172 122 178 108" stroke={INK} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="181" cy="103" r="10" fill="#FFC53D" stroke={INK} strokeWidth="5" />
      </g>
    </>
  ),
  chicken: (
    <>
      <g className="dd-arm" style={ARM}>
        <path d="M58 130 C42 134 34 146 31 157" stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="28" cy="162" r="8" fill="#F08A2B" stroke={INK} strokeWidth="4" />
      </g>
      <path d="M92 166 l-11 20 M108 166 l11 20" stroke="#F08A2B" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="100" cy="132" rx="54" ry="52" fill="#FFF7E9" stroke={INK} strokeWidth="6" />
      <circle cx="100" cy="76" r="38" fill="#FFF7E9" stroke={INK} strokeWidth="6" />
      <path d="M84 42 q4 -17 14 -9 q2 -15 12 -6 q11 -6 10 11" fill="#FF5C1A" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M100 88 l21 10 -21 10 z" fill="#F08A2B" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <circle cx="84" cy="72" r="5" fill={INK} />
      <circle cx="116" cy="72" r="5" fill={INK} />
      <path d="M70 138 q12 12 26 10" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.45" />
      <g className="dd-wave-arm" style={ARM}>
        <path d="M146 132 C162 128 170 116 172 104" stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="174" cy="99" r="8" fill="#F08A2B" stroke={INK} strokeWidth="4" />
      </g>
    </>
  ),
  robot: (
    <>
      <g className="dd-arm" style={ARM}>
        <rect x="28" y="106" width="18" height="52" rx="9" fill="#C9D2DC" stroke={INK} strokeWidth="5" />
      </g>
      <rect x="52" y="96" width="96" height="74" rx="18" fill="#C9D2DC" stroke={INK} strokeWidth="6" />
      <circle cx="100" cy="134" r="12" fill="#FF5C1A" stroke={INK} strokeWidth="5" />
      <path d="M100 36 V18" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="13" r="7" fill="#FF5C1A" stroke={INK} strokeWidth="4" />
      <rect x="64" y="36" width="72" height="58" rx="16" fill="#E9EEF4" stroke={INK} strokeWidth="6" />
      <rect x="80" y="54" width="14" height="15" rx="4" fill="#FF5C1A" />
      <rect x="106" y="54" width="14" height="15" rx="4" fill="#FF5C1A" />
      <path d="M84 80 h32" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <g className="dd-wave-arm" style={ARM}>
        <rect x="154" y="104" width="18" height="52" rx="9" fill="#C9D2DC" stroke={INK} strokeWidth="5" />
      </g>
    </>
  ),
  monster: (
    <>
      <g className="dd-arm" style={ARM}>
        <path d="M48 126 C32 130 24 142 22 154" stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="19" cy="159" r="9" fill="#B69CFF" stroke={INK} strokeWidth="5" />
      </g>
      <path d="M62 60 L50 20 L86 44 Z" fill="#FF5C1A" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d="M138 60 L150 20 L114 44 Z" fill="#FF5C1A" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d="M100 34 C148 34 164 76 160 116 C156 154 132 174 100 174 C68 174 44 154 40 116 C36 76 52 34 100 34 Z" fill="#B69CFF" stroke={INK} strokeWidth="6" />
      <circle cx="100" cy="94" r="27" fill="#FFFDF8" stroke={INK} strokeWidth="5" />
      <circle cx="104" cy="96" r="10" fill={INK} />
      <path d="M78 140 Q100 162 122 140" stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="74" cy="174" rx="14" ry="8" fill="#8E6DFF" stroke={INK} strokeWidth="5" />
      <ellipse cx="126" cy="174" rx="14" ry="8" fill="#8E6DFF" stroke={INK} strokeWidth="5" />
      <g className="dd-wave-arm" style={ARM}>
        <path d="M152 126 C168 130 176 142 178 154" stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="181" cy="159" r="9" fill="#B69CFF" stroke={INK} strokeWidth="5" />
      </g>
    </>
  ),
  potato: (
    <>
      <g className="dd-arm" style={ARM}>
        <path d="M50 116 C34 118 26 128 23 140" stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="20" cy="146" r="9" fill="#D9A15B" stroke={INK} strokeWidth="5" />
      </g>
      <g transform="rotate(-10 100 108)">
        <ellipse cx="100" cy="108" rx="56" ry="66" fill="#D9A15B" stroke={INK} strokeWidth="6" />
        <g fill="#B87E3C" opacity="0.75">
          <ellipse cx="128" cy="74" rx="7" ry="5" />
          <ellipse cx="76" cy="146" rx="6" ry="4" />
          <ellipse cx="132" cy="138" rx="5" ry="4" />
        </g>
      </g>
      <ellipse cx="86" cy="100" rx="5" ry="7" fill={INK} />
      <ellipse cx="114" cy="100" rx="5" ry="7" fill={INK} />
      <path d="M86 120 Q100 134 114 120" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
      <g className="dd-wave-arm" style={ARM}>
        <path d="M150 116 C166 118 174 128 177 140" stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="180" cy="146" r="9" fill="#D9A15B" stroke={INK} strokeWidth="5" />
      </g>
    </>
  ),
};

export default function CharacterArt({ slug = "banana", className }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={slug}
      className={cn("h-full w-full", className)}
      style={{ overflow: "visible" }}
    >
      {ART[slug] || ART.banana}
    </svg>
  );
}