/**
 * Abstract geometric decoration for auth panel backgrounds.
 * Renders floating shapes, grid dots, and organic curves that
 * blend seamlessly into a dark blue gradient.
 */
const AuthPanelDecoration = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    {/* Soft ambient orbs */}
    <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px]" />

    {/* Dot grid pattern */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="auth-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#auth-dots)" />
    </svg>

    {/* Large floating ring — top right */}
    <div
      className="absolute -top-16 -right-16 w-72 h-72 rounded-full border-[1.5px] border-white/[0.08]"
      style={{ transform: 'rotate(-15deg)' }}
    />
    <div
      className="absolute -top-8 -right-8 w-56 h-56 rounded-full border border-white/[0.05]"
    />

    {/* Floating rounded squares */}
    <div
      className="absolute top-[18%] right-[12%] w-20 h-20 rounded-2xl border border-white/[0.08] rotate-12"
    />
    <div
      className="absolute top-[22%] right-[8%] w-14 h-14 rounded-xl bg-white/[0.04] rotate-[25deg]"
    />

    {/* Diamond shape — mid left */}
    <div
      className="absolute top-[45%] left-[8%] w-16 h-16 border border-white/[0.07] rotate-45 rounded-md"
    />

    {/* Large arc curve — bottom area */}
    <svg className="absolute bottom-0 left-0 w-full h-1/2 opacity-[0.06]" viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M-50 300 Q 150 50 350 180 T 700 100" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M-50 280 Q 200 80 400 200 T 700 140" stroke="white" strokeWidth="1" fill="none" />
    </svg>

    {/* Floating circle — bottom left */}
    <div
      className="absolute bottom-[20%] left-[15%] w-10 h-10 rounded-full bg-white/[0.06]"
    />
    <div
      className="absolute bottom-[25%] left-[25%] w-6 h-6 rounded-full border border-white/[0.08]"
    />

    {/* Accent cross — top left area */}
    <div className="absolute top-[30%] left-[30%] w-8 h-[1.5px] bg-white/[0.1] rotate-45" />
    <div className="absolute top-[30%] left-[30%] w-8 h-[1.5px] bg-white/[0.1] -rotate-45" />

    {/* Large ghost rectangle — lower right */}
    <div
      className="absolute bottom-[12%] right-[5%] w-40 h-28 rounded-3xl border border-white/[0.05] -rotate-6"
    />
  </div>
);

export default AuthPanelDecoration;
