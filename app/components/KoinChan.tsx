"use client";

interface Props {
  mood?: "happy" | "thinking" | "excited" | "neutral";
  size?: number;
  animated?: boolean;
}

export default function KoinChan({ mood = "happy", size = 80, animated = true }: Props) {
  const eyeMap = {
    happy: { left: "M28,34 Q32,30 36,34", right: "M44,34 Q48,30 52,34", blink: false },
    thinking: { left: "M28,35 Q32,32 36,35", right: "M44,33 Q48,30 52,34", blink: false },
    excited: { left: "M27,33 Q32,27 37,33", right: "M43,33 Q48,27 53,33", blink: false },
    neutral: { left: "M29,35 L35,35", right: "M45,35 L51,35", blink: false },
  };

  const cheekColor = mood === "excited" ? "#ff9bb0" : "#ffb8c8";
  const eyes = eyeMap[mood];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="faceGrad" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#fff5f8" />
          <stop offset="100%" stopColor="#ffe4ec" />
        </radialGradient>
        <radialGradient id="hairGrad" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
        <radialGradient id="coinGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hair back */}
      <ellipse cx="40" cy="28" rx="24" ry="20" fill="url(#hairGrad)" />
      <path d="M18,30 Q12,50 14,65 Q20,60 22,55 Q24,45 26,40" fill="#7c3aed" />
      <path d="M62,30 Q68,50 66,65 Q60,60 58,55 Q56,45 54,40" fill="#7c3aed" />

      {/* Face */}
      <ellipse cx="40" cy="42" rx="20" ry="22" fill="url(#faceGrad)" />

      {/* Hair front / bangs */}
      <path d="M20,28 Q25,15 40,14 Q55,15 60,28 Q52,22 40,22 Q28,22 20,28" fill="url(#hairGrad)" />
      <path d="M20,28 Q22,20 28,18 Q24,24 22,32" fill="#7c3aed" />
      <path d="M60,28 Q58,20 52,18 Q56,24 58,32" fill="#7c3aed" />

      {/* Ears */}
      <ellipse cx="20" cy="42" rx="3.5" ry="4" fill="#ffe4ec" />
      <ellipse cx="60" cy="42" rx="3.5" ry="4" fill="#ffe4ec" />

      {/* Cat ears */}
      <path d="M26,20 L22,10 L32,16 Z" fill="url(#hairGrad)" />
      <path d="M54,20 L58,10 L48,16 Z" fill="url(#hairGrad)" />
      <path d="M26,20 L23,12 L30,17 Z" fill="#f0abfc" />
      <path d="M54,20 L57,12 L50,17 Z" fill="#f0abfc" />

      {/* Eyes */}
      <path d={eyes.left} stroke="#4c1d95" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d={eyes.right} stroke="#4c1d95" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Eye shine */}
      {mood !== "neutral" && (
        <>
          <circle cx="30" cy="34" r="1" fill="white" opacity="0.9" />
          <circle cx="46" cy="34" r="1" fill="white" opacity="0.9" />
        </>
      )}

      {/* Nose */}
      <ellipse cx="40" cy="43" rx="1.5" ry="1" fill="#f9a8d4" />

      {/* Mouth */}
      {mood === "happy" || mood === "excited" ? (
        <path d="M35,49 Q40,54 45,49" stroke="#f472b6" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : mood === "thinking" ? (
        <path d="M36,49 Q40,51 44,49" stroke="#f472b6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M36,49 L44,49" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
      )}

      {/* Cheeks */}
      <ellipse cx="26" cy="47" rx="5" ry="3" fill={cheekColor} opacity="0.5" />
      <ellipse cx="54" cy="47" rx="5" ry="3" fill={cheekColor} opacity="0.5" />

      {/* Gold coin accessory */}
      <circle cx="62" cy="18" r="7" fill="url(#coinGrad)" filter="url(#glow)" />
      <circle cx="62" cy="18" r="5.5" fill="none" stroke="#d97706" strokeWidth="1" />
      <text x="62" y="22" textAnchor="middle" fontSize="7" fill="#92400e" fontWeight="bold">¥</text>

      {/* Sparkles when excited */}
      {mood === "excited" && (
        <>
          <text x="8" y="20" fontSize="8" fill="#fbbf24">✦</text>
          <text x="65" y="35" fontSize="6" fill="#f472b6">✦</text>
          <text x="12" y="50" fontSize="5" fill="#a78bfa">✦</text>
        </>
      )}

      {/* Thinking dots */}
      {mood === "thinking" && (
        <>
          <circle cx="67" cy="30" r="2" fill="#a78bfa" opacity="0.8" />
          <circle cx="72" cy="24" r="3" fill="#a78bfa" opacity="0.6" />
          <circle cx="69" cy="18" r="4" fill="#a78bfa" opacity="0.3" />
        </>
      )}

      {animated && (
        <style>{`
          @keyframes koinchan-blink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
          }
        `}</style>
      )}
    </svg>
  );
}