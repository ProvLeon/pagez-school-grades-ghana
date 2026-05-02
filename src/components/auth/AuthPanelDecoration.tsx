/**
 * Abstract geometric decoration for auth panel backgrounds.
 * Renders floating shapes, grid dots, and organic curves that
 * blend seamlessly into a dark blue gradient — with slow ambient animations.
 */
const AuthPanelDecoration = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    {/* Inject keyframes */}
    <style>{`
      @keyframes float-slow {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-18px) rotate(3deg); }
      }
      @keyframes float-drift {
        0%, 100% { transform: translate(0, 0) rotate(12deg); }
        33% { transform: translate(8px, -12px) rotate(18deg); }
        66% { transform: translate(-6px, -8px) rotate(8deg); }
      }
      @keyframes float-drift-reverse {
        0%, 100% { transform: translate(0, 0) rotate(25deg); }
        33% { transform: translate(-10px, -8px) rotate(30deg); }
        66% { transform: translate(5px, -14px) rotate(20deg); }
      }
      @keyframes pulse-glow {
        0%, 100% { opacity: 0.06; transform: scale(1); }
        50% { opacity: 0.12; transform: scale(1.05); }
      }
      @keyframes orbit-slow {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes draw-in {
        0% { stroke-dashoffset: 800; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes diamond-float {
        0%, 100% { transform: translate(0, 0) rotate(45deg); }
        50% { transform: translate(6px, -10px) rotate(50deg); }
      }
      @keyframes cross-pulse {
        0%, 100% { opacity: 0.1; transform: scale(1) rotate(45deg); }
        50% { opacity: 0.18; transform: scale(1.15) rotate(45deg); }
      }
    `}</style>

    {/* Soft ambient orbs */}
    <div
      className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      style={{ animation: 'pulse-glow 8s ease-in-out infinite' }}
    />
    <div
      className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
      style={{ animation: 'pulse-glow 10s ease-in-out infinite 2s' }}
    />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px]" />

    {/* Dot grid pattern — static backdrop */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="auth-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#auth-dots)" />
    </svg>

    {/* Large floating ring — top right, slow orbit */}
    <div
      className="absolute -top-16 -right-16 w-72 h-72 rounded-full border-[1.5px] border-white/[0.08]"
      style={{ animation: 'orbit-slow 60s linear infinite' }}
    />
    <div
      className="absolute -top-8 -right-8 w-56 h-56 rounded-full border border-white/[0.05]"
      style={{ animation: 'orbit-slow 45s linear infinite reverse' }}
    />

    {/* Floating rounded squares — drifting gently */}
    <div
      className="absolute top-[18%] right-[12%] w-20 h-20 rounded-2xl border border-white/[0.08]"
      style={{ animation: 'float-drift 12s ease-in-out infinite' }}
    />
    <div
      className="absolute top-[22%] right-[8%] w-14 h-14 rounded-xl bg-white/[0.04]"
      style={{ animation: 'float-drift-reverse 15s ease-in-out infinite 1s' }}
    />

    {/* Diamond shape — mid left, floating */}
    <div
      className="absolute top-[45%] left-[8%] w-16 h-16 border border-white/[0.07] rounded-md"
      style={{ animation: 'diamond-float 10s ease-in-out infinite' }}
    />

    {/* Large arc curves — animated draw-in */}
    <svg className="absolute bottom-0 left-0 w-full h-1/2 opacity-[0.06]" viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path
        d="M-50 300 Q 150 50 350 180 T 700 100"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="800"
        style={{ animation: 'draw-in 4s ease-out forwards' }}
      />
      <path
        d="M-50 280 Q 200 80 400 200 T 700 140"
        stroke="white"
        strokeWidth="1"
        fill="none"
        strokeDasharray="800"
        style={{ animation: 'draw-in 5s ease-out 0.5s forwards' }}
      />
    </svg>

    {/* Floating circles — bottom left */}
    <div
      className="absolute bottom-[20%] left-[15%] w-10 h-10 rounded-full bg-white/[0.06]"
      style={{ animation: 'float-slow 9s ease-in-out infinite' }}
    />
    <div
      className="absolute bottom-[25%] left-[25%] w-6 h-6 rounded-full border border-white/[0.08]"
      style={{ animation: 'float-slow 11s ease-in-out infinite 2s' }}
    />

    {/* Accent cross — pulsing */}
    <div className="absolute top-[30%] left-[30%]" style={{ animation: 'cross-pulse 6s ease-in-out infinite' }}>
      <div className="w-8 h-[1.5px] bg-white/[0.15] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="w-[1.5px] h-8 bg-white/[0.15] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>

    {/* Large ghost rectangle — lower right, drifting */}
    <div
      className="absolute bottom-[12%] right-[5%] w-40 h-28 rounded-3xl border border-white/[0.05]"
      style={{ animation: 'float-drift 18s ease-in-out infinite 3s' }}
    />
  </div>
);

export default AuthPanelDecoration;
