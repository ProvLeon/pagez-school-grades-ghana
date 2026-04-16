import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, CheckCircle2, PlayCircle, ShieldCheck, Zap, Users,
  BarChart3, FileText, Upload, Globe, BookOpen, GraduationCap, Award,
  ArrowUpRight, Plus, Minus, Mail, Phone, MapPin, ChevronRight, Star,
  Lock, TrendingUp, Smartphone, Zap as ZapIcon
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

// --- Animation Configs ---
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 40, damping: 14 } }
};
const fadeScale = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 45, damping: 18 } }
};

// --- Counter Hook ---
const useCounter = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    let start: number;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 4)) * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, end, duration]);
  return { count, ref };
};

const Stat = ({ value, suffix, label }: { value: number; suffix: string; label: string }) => {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black tracking-tight">{count}<span className="text-primary">{suffix}</span></div>
      <p className="text-sm text-muted-foreground font-medium mt-2">{label}</p>
    </div>
  );
};

// --- FAQ Accordion ---
const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/50 rounded-2xl overflow-hidden bg-card/50 transition-colors hover:border-primary/20">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 md:p-6 text-left gap-4">
        <span className="font-semibold text-[15px] md:text-base text-foreground">{q}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${open ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
          {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <p className="px-5 md:px-6 pb-5 md:pb-6 text-muted-foreground text-[14px] leading-relaxed -mt-1">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Logo Component ---
const Logo = ({ size = 40, className = "" }: { size?: number; className?: string }) => (
  <img src="/ERESULTS_LOGO.png" alt="e-Results GH" width={size} height={size} className={`rounded-xl ${className}`} />
);

// --- Report Sheet Mockup ---
const ReportSheetMockup = () => (
  <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 max-w-sm w-full">
    <div className="bg-blue-600 text-white text-center rounded-xl py-3 px-4 mb-4">
      <div className="text-[10px] font-semibold tracking-wide opacity-75 uppercase">Asante Prep School</div>
      <div className="text-xs font-bold mt-0.5">Student Report Sheet</div>
    </div>
    <div className="space-y-1 mb-4 px-1">
      {[
        { label: "Student", value: "Kofi Mensah" },
        { label: "Class", value: "JHS 2B" },
        { label: "Term", value: "2 · 2025" },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between text-[11px]">
          <span className="text-gray-400">{label}:</span>
          <span className="font-semibold text-gray-800">{value}</span>
        </div>
      ))}
    </div>
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
      <div className="grid grid-cols-4 bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        <span>Subject</span>
        <span className="text-center">SBA</span>
        <span className="text-center">Exam</span>
        <span className="text-center">Grade</span>
      </div>
      {[
        { subject: "Mathematics", sba: 32, exam: 48, grade: "B2" },
        { subject: "English Lang.", sba: 35, exam: 52, grade: "A1" },
        { subject: "Integrated Sci.", sba: 28, exam: 44, grade: "B3" },
      ].map((row) => (
        <div
          key={row.subject}
          className="grid grid-cols-4 px-3 py-1.5 border-t border-gray-50 text-[10px] hover:bg-gray-50/60"
        >
          <span className="text-gray-700 font-medium truncate pr-1">{row.subject}</span>
          <span className="text-center text-gray-500">{row.sba}</span>
          <span className="text-center text-gray-500">{row.exam}</span>
          <span className="text-center font-bold text-blue-600">{row.grade}</span>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-2.5">
      <div className="text-[11px] text-gray-500 font-medium">Total Aggregate</div>
      <div className="text-lg font-extrabold text-blue-600">7</div>
    </div>
  </div>
);

// --- Student Register Mockup ---
const StudentRegisterMockup = () => (
  <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-sm w-full">
    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
      <span className="text-xs font-bold text-gray-800">Student Register</span>
      <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">42 Students</span>
    </div>
    <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[9px] font-bold text-gray-400uppercase tracking-wider">
      <span>ID</span>
      <span className="col-span-2">Name</span>
      <span className="text-right">Status</span>
    </div>
    {[
      { id: "S-001", name: "Ama Owusu", status: "Active", color: "bg-blue-50 text-blue-700" },
      { id: "S-002", name: "Kweku Asante", status: "Active", color: "bg-blue-50 text-blue-700" },
      { id: "S-003", name: "Abena Boateng", status: "Promoted", color: "bg-green-50 text-green-700" },
      { id: "S-004", name: "Yaw Frimpong", status: "Active", color: "bg-blue-50 text-blue-700" },
      { id: "S-005", name: "Akua Darko", status: "Transferred", color: "bg-amber-50 text-amber-700" },
    ].map((row) => (
      <div key={row.id} className="grid grid-cols-4 px-4 py-2 border-t border-gray-50 hover:bg-gray-50/60">
        <span className="text-[10px] text-gray-400 font-mono">{row.id}</span>
        <span className="col-span-2 text-[10px] text-gray-800 font-medium truncate pr-2">{row.name}</span>
        <span className="text-right">
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${row.color}`}>{row.status}</span>
        </span>
      </div>
    ))}
    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
      <span className="text-[9px] text-gray-400">Showing 5 of 42 students</span>
      <div className="text-[9px] font-semibold text-blue-600 cursor-default">+ Bulk Upload</div>
    </div>
  </div>
);

const LandingPage = () => {
  // --- Report Sheet Mockup ---
  const ReportSheetMockup = () => (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 max-w-sm w-full">
      <div className="bg-blue-600 text-white text-center rounded-xl py-3 px-4 mb-4">
        <div className="text-[10px] font-semibold tracking-wide opacity-75 uppercase">Asante Prep School</div>
        <div className="text-xs font-bold mt-0.5">Student Report Sheet</div>
      </div>
      <div className="space-y-1 mb-4 px-1">
        {[
          { label: "Student", value: "Kofi Mensah" },
          { label: "Class", value: "JHS 2B" },
          { label: "Term", value: "2 · 2025" },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-[11px]">
            <span className="text-gray-400">{label}:</span>
            <span className="font-semibold text-gray-800">{value}</span>
          </div>
        ))}
      </div>
      <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
        <div className="grid grid-cols-4 bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <span>Subject</span>
          <span className="text-center">SBA</span>
          <span className="text-center">Exam</span>
          <span className="text-center">Grade</span>
        </div>
        {[
          { subject: "Mathematics", sba: 32, exam: 48, grade: "B2" },
          { subject: "English Lang.", sba: 35, exam: 52, grade: "A1" },
          { subject: "Integrated Sci.", sba: 28, exam: 44, grade: "B3" },
        ].map((row) => (
          <div
            key={row.subject}
            className="grid grid-cols-4 px-3 py-1.5 border-t border-gray-50 text-[10px] hover:bg-gray-50/60"
          >
            <span className="text-gray-700 font-medium truncate pr-1">{row.subject}</span>
            <span className="text-center text-gray-500">{row.sba}</span>
            <span className="text-center text-gray-500">{row.exam}</span>
            <span className="text-center font-bold text-blue-600">{row.grade}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-2.5">
        <div className="text-[11px] text-gray-500 font-medium">Total Aggregate</div>
        <div className="text-lg font-extrabold text-blue-600">7</div>
      </div>
    </div>
  );

  // --- Student Register Mockup ---
  const StudentRegisterMockup = () => (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-sm w-full">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
        <span className="text-xs font-bold text-gray-800">Student Register</span>
        <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">42 Students</span>
      </div>
      <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
        <span>ID</span>
        <span className="col-span-2">Name</span>
        <span className="text-right">Status</span>
      </div>
      {[
        { id: "S-001", name: "Ama Owusu", status: "Active", color: "bg-blue-50 text-blue-700" },
        { id: "S-002", name: "Kweku Asante", status: "Active", color: "bg-blue-50 text-blue-700" },
        { id: "S-003", name: "Abena Boateng", status: "Promoted", color: "bg-green-50 text-green-700" },
        { id: "S-004", name: "Yaw Frimpong", status: "Active", color: "bg-blue-50 text-blue-700" },
        { id: "S-005", name: "Akua Darko", status: "Transferred", color: "bg-amber-50 text-amber-700" },
      ].map((row) => (
        <div key={row.id} className="grid grid-cols-4 px-4 py-2 border-t border-gray-50 hover:bg-gray-50/60">
          <span className="text-[10px] text-gray-400 font-mono">{row.id}</span>
          <span className="col-span-2 text-[10px] text-gray-800 font-medium truncate pr-2">{row.name}</span>
          <span className="text-right">
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${row.color}`}>{row.status}</span>
          </span>
        </div>
      ))}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <span className="text-[9px] text-gray-400">Showing 5 of 42 students</span>
        <div className="text-[9px] font-semibold text-blue-600 cursor-default">+ Bulk Upload</div>
      </div>
    </div>
  );

  const LandingPage = () => {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
      <div className="min-h-screen bg-background font-sans overflow-x-hidden selection:bg-primary/30 text-foreground">

        {/* Ambient Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%] rounded-full bg-primary/[0.04] blur-[140px]" />
          <div className="absolute top-[30%] -right-[15%] w-[45%] h-[50%] rounded-full bg-blue-500/[0.03] blur-[140px]" />
          <div className="absolute -bottom-[15%] left-[20%] w-[50%] h-[45%] rounded-full bg-purple-500/[0.03] blur-[140px]" />
        </div>

        {/* ═══════════════ NAVIGATION ═══════════════ */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-2xl border-b border-border/30 supports-[backdrop-filter]:bg-background/40"
        >
          <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <Logo size={38} className="group-hover:-rotate-3 transition-transform duration-300 shadow-md" />
              <span className="text-xl font-bold tracking-tight">
                e-Results <span className="text-primary">GH</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-[14px] font-semibold">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#why-choose" className="text-muted-foreground hover:text-foreground transition-colors">Why Us</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login"><Button variant="ghost" className="font-semibold px-5 hidden sm:flex hover:bg-primary/5 hover:text-primary text-sm">Sign In</Button></Link>
              <Link to="/signup"><Button className="font-semibold shadow-lg shadow-primary/20 rounded-full px-7 hover:-translate-y-0.5 transition-all text-sm h-10">Start Free Trial</Button></Link>
            </div>
          </div>
        </motion.nav>

        {/* ═══════════════ HERO ═══════════════ */}
        <section ref={heroRef} className="relative pt-[16vh] pb-8 md:pt-[20vh] md:pb-16 px-6 z-10">
          <motion.div style={{ y: heroY, opacity: heroOpacity }}>
            <motion.div className="max-w-5xl mx-auto text-center space-y-7" variants={stagger} initial="hidden" animate="show">

              <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/15 bg-primary/[0.04] text-primary text-[13px] font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_2px_rgba(var(--primary),0.5)] animate-pulse" />
                Trusted by 50+ Schools in Ghana
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-[clamp(2.5rem,6vw,5.5rem)] font-black tracking-[-0.04em] leading-[1.05]">
                The future of<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-600">academic reporting</span>
                <br />starts here.
              </motion.h1>

              <motion.p variants={fadeUp} className="max-w-xl mx-auto text-[17px] md:text-lg text-muted-foreground leading-relaxed font-medium">
                The most advanced grading engine built specifically for Ghanaian schools. Automate reports, protect data integrity, and deliver results parents trust.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/signup">
                  <Button size="lg" className="h-14 px-9 text-[15px] font-bold rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-1 transition-all group">
                    Start your 14-day free trial <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="#video-demo">
                  <Button variant="outline" size="lg" className="h-14 px-9 text-[15px] font-semibold rounded-full border-2 border-border/60 hover:bg-muted/50 hover:border-primary/40 transition-all">
                    <PlayCircle className="mr-2 w-5 h-5 text-primary" /> Watch Demo
                  </Button>
                </a>
              </motion.div>

              <motion.p variants={fadeUp} className="text-xs text-muted-foreground/70 font-medium pt-1">
                No credit card required &middot; 10 student trial cap &middot; Full access to all features
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Dashboard Mockup Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, type: "spring", bounce: 0.3 }}
            className="max-w-6xl mx-auto mt-16 relative"
          >
            {/* Glow behind mockup */}
            <div className="absolute -inset-8 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-[48px] blur-2xl pointer-events-none" />

            <div className="relative p-[6px] md:p-3 rounded-[28px] md:rounded-[36px] bg-gradient-to-b from-border/60 via-border/30 to-border/10 shadow-2xl shadow-black/10">
              <div className="aspect-[16/9] w-full rounded-[22px] md:rounded-[28px] overflow-hidden bg-black relative flex items-center justify-center group cursor-pointer" id="video-demo">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-black to-black transition-all duration-700 group-hover:from-primary/25" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center shadow-[0_0_80px_rgba(var(--primary),0.5)]">
                  <PlayCircle className="w-10 h-10 text-white translate-x-0.5" />
                </motion.div>
                <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 z-10">
                  <p className="text-white font-bold text-lg md:text-xl">e-Results GH Overview</p>
                  <p className="text-white/50 text-sm font-medium">Watch how schools are transforming results management</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════ STATS ═══════════════ */}
        <section className="relative z-10 border-y border-border/30 bg-card/50 backdrop-blur-sm py-14 mt-16">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat value={500} suffix="+" label="Students Managed" />
            <Stat value={98} suffix="%" label="Report Accuracy" />
            <Stat value={50} suffix="+" label="Active Schools" />
            <Stat value={10} suffix="K" label="Reports Generated" />
          </div>
        </section>

        {/* ═══════════════ FEATURES (6 cards with 1 highlighted) ═══════════════ */}
        <section id="features" className="py-32 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <span className="inline-block text-primary font-bold text-sm tracking-widest uppercase mb-2">Capabilities</span>
              <h2 className="text-4xl md:text-[3.25rem] font-extrabold tracking-tight leading-tight">Powerful features for effortless school administration.</h2>
              <p className="text-muted-foreground text-lg font-medium">Six pillars of academic management excellence — built around how Ghanaian schools actually work.</p>
            </motion.div>

            <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { icon: FileText, title: "Instant Report Generation", desc: "Generate professional, BECE-aligned report sheets for every student in seconds. One click, unlimited copies.", highlight: true },
                {
                  icon: Zap, title: "Automated Grade Calculations", desc: "Grades, remarks, positions, and aggregates computed in real-time. Zero
 manual work, 100% accuracy." },
              { icon: ShieldCheck, title: "Anti-Cheat Security", desc: "Database-level seat quotas and anti-tampering triggers prevent unauthorized data manipulation." },
              { icon: Upload, title: "Bulk CSV Import", desc: "Upload hundreds of student records instantly via our intelligent CSV parser with error correction." },
                { icon: BarChart3, title: "Analytics Dashboard", desc: "Deep insights into class performance, subject trends, and student progress across terms." },
                { icon: Globe, title: "Online Result Verification", desc: "Parents verify results through a secure public portal with unique verification codes." }
              ].map((f, i) => (
                <motion.div key={i} variants={fadeScale} className={`group relative p-7 rounded-3xl transition-all duration-500 ${f.highlight ? 'lg:col-span-1 md:row-span-2 bg-gradient-to-br from-primary to-blue-600 text-white shadow-2xl shadow-primary/25 border border-primary/50' : 'bg-card border border-border/40 hover:border-primary/25 shadow-sm hover:shadow-xl hover:shadow-primary/5'}`}>
                  <div className={`absolute inset-0 ${f.highlight ? '' : 'bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100'} transition-opacity duration-500 rounded-3xl pointer-events-none`} />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className={`w-12 h-12 rounded-xl ${f.highlight ? 'bg-white/20' : 'bg-primary/[0.08]'} flex items-center justify-center mb-5 ${f.highlight ? '' : 'group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/25'} transition-all duration-400`}>
                      <f.icon className={`w-6 h-6 ${f.highlight ? 'text-white' : 'text-primary group-hover:text-white'} transition-colors duration-300`} />
                    </div>
                    <h3 className={`text-lg font-bold mb-2 tracking-tight ${f.highlight ? 'text-white' : ''}`}>{f.title}</h3>
                    <p className={`${f.highlight ? 'text-white/90' : 'text-muted-foreground'} leading-relaxed text-[14px] flex-grow`}>{f.desc}</p>
                    {f.highlight && (
                      <div className="mt-6 pt-4 border-t border-white/20">
                        <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Core Feature</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 text-center p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="text-muted-foreground mb-3">Still have questions?</p>
              <a href="mailto:support@eresultsgh.com" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                <Mail className="w-4 h-4" /> Email our support team
              </a>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ WHY CHOOSE US (with visual mockups) ═══════════════ */}
        <section id="why-choose" className="py-32 relative z-10 bg-muted/20 border-y border-border/20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <span className="inline-block text-primary font-bold text-sm tracking-widest uppercase mb-2">Why Choose Us</span>
              <h2 className="text-4xl md:text-[3.25rem] font-extrabold tracking-tight leading-tight">Designed specifically for Ghanaian schools.</h2>
              <p className="text-muted-foreground text-lg font-medium">Every feature built around how your school actually works, not some generic template.</p>
            </motion.div>

            {/* Feature 1: Report Generation */}
            <motion.div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-24" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <motion.div className="flex-1 w-full flex justify-center" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <ReportSheetMockup />
              </motion.div>
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700">
                  Report Generation
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold leading-snug tracking-tight">Instant, Professional Report Sheets</h3>
                <p className="text-muted-foreground text-base leading-relaxed">Generate beautifully formatted, Ghana Education Service-aligned report sheets for every student and class in seconds. No manual calculations, no formatting errors.</p>
                <ul className="space-y-3.5">
                  {[
                    "BECE & SBA grading systems fully supported",
                    "Automated remarks & grade computation",
                    "One-click PDF download for all classes",
                    "Ready to print or email to parents"
                  ].map((item) => (
                    <motion.li key={item} className="flex items-start gap-3" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Feature 2: Student Management */}
            <motion.div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <motion.div className="flex-1 w-full flex justify-center" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <StudentRegisterMockup />
              </motion.div>
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-purple-200 bg-purple-50 text-purple-700">
                  Student Management
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold leading-snug tracking-tight">Complete Student Lifecycle Management</h3>
                <p className="text-muted-foreground text-base leading-relaxed">From first enrolment to graduation, manage every stage of a student's journey with complete data integrity. No spreadsheets, no duplicates, no manual errors.</p>
                <ul className="space-y-3.5">
                  {[
                    "Bulk upload via Excel template with validation",
                    "Track promotions, transfers & graduations",
                    "Linked across classes, subjects, and results",
                    "Roll-forward students automatically to next term"
                  ].map((item) => (
                    <motion.li key={item} className="flex items-start gap-3" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ PRICING ═══════════════ */}
        <section id="pricing" className="py-32 relative z-10 overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 space-y-4">
              <span className="inline-block text-primary font-bold text-sm tracking-widest uppercase mb-2">Pricing</span>
              <h2 className="text-4xl md:text-[3.25rem] font-extrabold tracking-tight leading-tight">Simple, transparent pricing.</h2>
              <p className="text-muted-foreground text-lg font-medium max-w-lg mx-auto">One plan. One price per student. Unlimited power. Cancel anytime.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 40, damping: 18 }} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-[44px] blur-sm pointer-events-none" />
              <div className="relative rounded-[40px] bg-card border border-border/50 p-8 md:p-14 text-center shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/[0.06] rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                  <span className="inline-block py-1.5 px-6 rounded-full bg-primary/[0.08] text-primary font-bold text-xs tracking-[0.15em] uppercase mb-10 border border-primary/15">Annual Plan</span>
                  <div className="flex items-end justify-center gap-1 mb-2">
                    <span className="text-2xl md:text-3xl font-bold text-muted-foreground self-start mt-4">GHS</span>
                    <span className="text-[8rem] md:text-[10rem] font-black tracking-tighter leading-none text-foreground">2</span>
                    <span className="text-4xl md:text-5xl font
-black text-foreground/60 self-end mb-5">.00</span>
                  </div>
                  <p className="text-lg text-muted-foreground font-semibold mb-3">per student, billed annually</p>
                  <p className="text-sm text-muted-foreground/60 mb-12 max-w-md mx-auto">Pay securely via MTN Mobile Money, AirtelTigo, Telecel Cash, or bank card through Paystack</p>
                  <div className="grid sm:grid-cols-2 gap-y-4 gap-x-10 max-w-xl mx-auto mb-14 text-left">
                    {["BECE-standard grading", "Unlimited teachers & staff", "Bulk student uploads", "Professional PDF reports", "Analytics dashboard", "Secure data storage", "Email & SMS notifications", "Dedicated support"].map((f, i) => (
                      <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.06 }} key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-semibold text-foreground/85 text-[15px]">{f}</span>
                      </motion.div>
                    ))}
                  </div>
                  <Link to="/signup">
                    <Button size="lg" className="w-full sm:w-auto min-w-[340px] h-16 rounded-full text-lg font-bold shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                      Start Your 14-Day Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <p className="mt-6 text-sm font-medium text-muted-foreground max-w-sm mx-auto">30-day free trial with up to 10 students. No credit card required to start.</p>
                  <p className="mt-3 text-xs text-muted-foreground/60">Questions about pricing? <a href="mailto:support@eresultsgh.com" className="text-primary font-semibold hover:underline">Contact our team</a></p>
                  <p className="mt-3 text-xs text-muted-foreground/60">Questions about pricing? <a href="mailto:support@eresultsgh.com" className="text-primary font-semibold hover:underline">Contact our team</a></p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ TESTIMONIALS ═══════════════ */}
        <section className="py-32 relative z-10 bg-muted/10 border-y border-border/20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="inline-block text-primary font-bold text-sm tracking-widest uppercase mb-2">Testimonials</span>
              <h2 className="text-4xl md:text-[3.25rem] font-extrabold tracking-tight leading-tight">Trusted by educators across Ghana.</h2>
              <p className="text-muted-foreground text-lg font-medium">What school administrators and teachers say about e-Results GH.</p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { name: "Mr. Kwame Asante", role: "Headmaster, Bright Future Academy, Accra", quote: "The automated report card generation has saved us over 40 hours each term. Parents are genuinely impressed with the professional quality. Best investment we've made." },
                { name: "Mrs. Abena Mensah", role: "Administrator, Sunrise Preparatory, Kumasi", quote: "We used to spend weeks manually computing grades. With e-Results GH, everything is instant and accurate. It has genuinely transformed our term-end process." },
                { name: "Mr. Yaw Boateng", role: "IT Coordinator, Prestige Academy, Takoradi", quote: "The CSV bulk upload is a game-changer. I uploaded 350 student records in under 2 minutes. The system is incredibly fast, reliable, and secure." },
              ].map((t, i) => (
                <motion.div key={i} variants={fadeScale} className="p-7 rounded-3xl bg-card border border-border/40 shadow-sm hover:shadow-lg hover:border-primary/25 transition-all flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                  <p className="text-[14px] text-muted-foreground leading-relaxed flex-grow mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ FAQ ═══════════════ */}
        <section id="faq" className="py-32 relative z-10">
          <div className="max-w-3xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-xl mx-auto mb-16 space-y-4">
              <span className="inline-block text-primary font-bold text-sm tracking-widest uppercase mb-2">FAQ</span>
              <h2 className="text-4xl md:text-[3.25rem] font-extrabold tracking-tight leading-tight">Frequently Asked Questions</h2>
              <p className="text-muted-foreground text-base">Everything you need to know before getting started.</p>
            </motion.div>
            <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { q: "What is e-Results GH?", a: "e-Results GH is a comprehensive academic reporting platform designed specifically for Ghanaian schools. It automates grade calculations, BECE-standard report card generation, and result verification for JHS and SHS institutions." },
                { q: "How long does the free trial last?", a: "Your free trial lasts 14 days with full access to all features. You can test with up to 10 students. No credit card required to start, and you can cancel anytime." },
                { q: "Can I import existing student data?", a: "Absolutely. Our smart CSV importer lets you upload hundreds of student records in seconds with built-in validation and error correction to ensure clean data every time." },
                { q: "What payment methods do you accept?", a: "We support Mobile Money (MTN, AirtelTigo, Telecel) and bank cards (Visa/Mastercard). All payments are processed securely through Paystack, Ghana's leading payment platform." },
                { q: "Can I export my school's data?", a: "Yes. You have complete data ownership. You can export all student records, results, and reports at any time in standard formats like Excel and PDF." },
                { q: "Is my school's data secure?", a: "Your data is protected with bank-level encryption, row-level security policies, and automated backup. We follow industry best practices and have zero tolerance for data misuse." },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <FAQItem q={item.q} a={item.a} />
                </motion.div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 text-center p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="text-muted-foreground mb-3">Still have questions?</p>
              <a href="mailto:support@eresultsgh.com" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                <Mail className="w-4 h-4" /> Email our support team
              </a>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ FINAL CTA (Dark Banner) ═══════════════ */}
        <section className="relative z-10 mx-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto rounded-[32px] bg-gradient-to-br from-primary via-blue-600 to-primary overflow-hidden relative"
          >
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 px-8 md:px-16 py-16 md:py-20 text-center text-white space-y-6">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">Ready to eliminate manual grading errors?</h2>
              <p className="text-white/70 text-lg font-medium max-w-lg mx-auto">Join 50+ schools across Ghana that have already transformed their results management. Your 14-day free trial is ready.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/signup">
                  <Button size="lg" className="h-14 px-10 text-[15px] font-bold rounded-full bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/20 hover:-translate-y-1 transition-all group">
                    Get Started for Free <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="h-14 px-10 text-[15px] font-semibold rounded-full border-2 border-white/30 text-white hover:bg-white/10 transition-all">
                    Sign In to Your School
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/60 font-medium">No credit card required. Cancel anytime.</p>
              <p className="text-sm text-white/60 font-medium">No credit card required. Cancel anytime.</p>
            </div>
          </motion.div>
        </section>

        {/* ═══════════════ PROFESSIONAL FOOTER ═══════════════ */}
        <footer className="bg-foreground text-background relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-16 border-b border-white/10">
              {/* Brand Column */}
              <div className="md:col-span-1 space-y-5">
                <div className="flex items-center gap-2.5">
                  <Logo size={36} className="brightness-0 invert" />
                  <span className="text-lg font-bold">e-Results GH</span>
                </div>
                <p className="text-sm text-white/50 leading-relaxed max-w-[280px]">
                  The advanced academic reporting platform trusted by 50+ schools across Ghana to deliver accurate, professional results.
                </p>
                <div className="flex gap-3 pt-2">
                  {['Facebook', 'Twitter', 'LinkedIn'].map((social) => (
                    <a key={social} href="#" className="text-white/30 hover:text-white transition-colors text-xs font-medium">
                      {social}
                    </a>
                  ))}
                </div>
              </div>

              {/* Product Links */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm tracking-wider uppercase text-white/70">Product</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/signup" className="text-white/50 hover:text-white transition-colors">Start Free Trial</Link></li>
                  <li><Link to="/login" className="text-white/50 hover:text-white transition-colors">Sign In</Link></li>
                  <li><a href="#pricing" className="text-white/50 hover:text-white transition-colors">Pricing</a></li>
                  <li><Link to="/student-reports" className="text-white/50 hover:text-white transition-colors">Verify Results</Link></li>
                </ul>
              </div>

              {/* Company Links */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm tracking-wider uppercase text-white/70">Company</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="#features" className="text-white/50 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#why-choose" className="text-white/50 hover:text-white transition-colors">Why e-Results?</a></li>
                  <li><a href="#faq" className="text-white/50 hover:text-white transition-colors">FAQ</a></li>
                  <li><a href="mailto:support@eresultsgh.com" className="text-white/50 hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm tracking-wider uppercase text-white/70">Contact</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2.5 text-white/50"><Mail className="w-4 h-4 flex-shrink-0 text-primary" /> <a href="mailto:support@eresultsgh.com" className="hover:text-white transition-colors">support@eresultsgh.com</a></li>
                  <li className="flex items-center gap-2.5 text-white/50"><Phone className="w-4 h-4 flex-shrink-0 text-primary" /> +233 XX XXX XXXX</li>
                  <li className="flex items-start gap-2.5 text-white/50"><MapPin className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" /> <span>Accra, Ghana</span></li>
                </ul>
              </div>
            </div>

            {/* Copyright Bar */}
            <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/40">
                &copy; {new Date().getFullYear()} PB Pagez LTD. All Rights Reserved.
              </p>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white/60 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  export default LandingPage;
