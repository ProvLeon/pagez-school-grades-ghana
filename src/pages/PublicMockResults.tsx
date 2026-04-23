import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Search,
  GraduationCap,
  AlertCircle,
  FileText,
  Award,
  TrendingUp,
  Calendar,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  BookOpen,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getExamTypeName } from '@/hooks/useMockExamDepartments';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MockSession {
  id: string;
  name: string;
  academic_year: string;
  term: string;
  is_published: boolean;
}

interface MockResult {
  id: string;
  student_id: string;
  session_id: string;
  total_score: number | null;
  position: number | null;
  student: {
    id: string;
    full_name: string;
    student_id: string;
    no_on_roll: string | null;
    class: { id: string; name: string } | null;
  } | null;
  subject_marks: Array<{
    id: string;
    subject_id: string;
    total_score: number | null;
    grade: string | null;
    subject?: { id: string; name: string } | null;
  }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

const getGradeFromAggregate = (
  aggregate: number,
  examType: 'bece' | 'wassce'
) => {
  const isPassing = examType === 'bece' ? aggregate <= 30 : aggregate <= 36;
  let grade = 'F';
  if (examType === 'bece') {
    if (aggregate <= 12) grade = 'A';
    else if (aggregate <= 18) grade = 'B';
    else if (aggregate <= 24) grade = 'C';
    else if (aggregate <= 30) grade = 'D';
    else if (aggregate <= 36) grade = 'E';
  } else {
    if (aggregate <= 16) grade = 'A';
    else if (aggregate <= 24) grade = 'B';
    else if (aggregate <= 32) grade = 'C';
    else if (aggregate <= 40) grade = 'D';
    else if (aggregate <= 48) grade = 'E';
  }
  return { grade, isPassing };
};

const gradeClasses = (grade: string | null) => {
  switch (grade) {
    case 'A': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'B': return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'C': return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'D': return 'bg-orange-100 text-orange-700 border border-orange-200';
    case 'E': return 'bg-red-100 text-red-600 border border-red-200';
    case 'F': return 'bg-red-100 text-red-700 border border-red-300';
    default: return 'bg-gray-100 text-gray-500 border border-gray-200';
  }
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skel = ({ className }: { className?: string }) => (
  <div className={cn('rounded-lg bg-gray-100 animate-pulse', className)} />
);

// ─── Wave divider ─────────────────────────────────────────────────────────────
const Wave = () => (
  <div
    aria-hidden
    className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none"
    style={{ height: 56, lineHeight: 0 }}
  >
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-gray-50"
      style={{
        width: '110%',
        height: '100%',
        borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
      }}
    />
  </div>
);

// ─── Shared page header ───────────────────────────────────────────────────────
const PageHeader = ({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle: string;
  children?: React.ReactNode;
}) => (
  <header
    className="relative"
    style={{
      background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #3B82F6 100%)',
    }}
  >
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    />
    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
    <div className="absolute top-20 -left-10 w-48 h-48 rounded-full bg-indigo-600/20 blur-2xl pointer-events-none" />

    <div className="relative z-10">
      <div className="max-w-lg mx-auto px-5 pt-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/ERESULTS_LOGO.png"
            alt="e-Results GH"
            className="w-8 h-8 rounded-full border border-white/30 shadow-md"
          />
          <span className="text-white font-bold text-[15px] tracking-tight">
            e-Results GH
          </span>
        </Link>
        <Link
          to="/student-reports"
          className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full"
        >
          <FileText className="w-3.5 h-3.5" />
          Term Reports
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-7 pb-20">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-blue-100 tracking-wide uppercase">
            Mock Examination Portal
          </span>
        </div>
        <h1 className="text-[26px] sm:text-[32px] font-extrabold text-white leading-[1.15] tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-blue-200/90 text-[13px] leading-relaxed max-w-lg mb-5">
          {subtitle}
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { icon: Shield, text: 'Secured portal' },
            { icon: GraduationCap, text: 'Official records' },
            { icon: Lock, text: 'School-verified' },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 text-[11px] text-blue-200/80 font-medium"
            >
              <Icon className="w-3.5 h-3.5" />
              {text}
            </div>
          ))}
        </div>
        {children}
      </div>

      <Wave />
    </div>
  </header>
);

// ─── Page footer ──────────────────────────────────────────────────────────────
const PageFooter = () => (
  <div className="text-center pt-4 pb-8 space-y-1.5">
    <div className="flex items-center justify-center gap-2">
      <img
        src="/ERESULTS_LOGO.png"
        alt="e-Results GH"
        className="w-5 h-5 rounded-full opacity-50"
      />
      <p className="text-[11px] text-gray-400 font-semibold">
        e-Results GH &nbsp;·&nbsp; PB Pagez LTD
      </p>
    </div>
    <p className="text-[11px] text-gray-300 leading-relaxed max-w-xs mx-auto">
      Results published and managed exclusively by your school. This portal
      does not store personal data.
    </p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const PublicMockResults = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  // Controlled input vs submitted value — two separate pieces of state
  // so the query only fires on explicit submit, not on every keystroke.
  const [inputValue, setInputValue] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // ── ALL HOOKS ABOVE EVERY EARLY RETURN ─────────────────────────────────────

  // 1. Fetch session metadata
  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ['public-mock-session', sessionId],
    enabled: !!sessionId,
    retry: false,
    queryFn: async (): Promise<MockSession | null> => {
      if (!sessionId) return null;
      const { data, error } = await supabase
        .from('mock_exam_sessions')
        .select('id, name, academic_year, term, is_published')
        .eq('id', sessionId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const examType: 'bece' | 'wassce' = (() => {
    if (!session) return 'bece';
    const name = session.name.toLowerCase();
    return name.includes('wassce') || name.includes('shs') || name.includes('senior')
      ? 'wassce'
      : 'bece';
  })();

  // 2. Targeted per-student query — only runs after the user submits their ID
  const {
    data: foundResult,
    isLoading: searching,
    error: searchError,
  } = useQuery({
    queryKey: ['public-mock-student-result', sessionId, submittedId],
    enabled: !!sessionId && !!submittedId && session?.is_published === true,
    retry: false,
    queryFn: async (): Promise<MockResult | null> => {
      if (!sessionId || !submittedId) return null;

      // Step 1 — resolve the student row by their human-readable student_id
      const { data: studentRow, error: studentErr } = await supabase
        .from('students')
        .select('id')
        .ilike('student_id', submittedId.trim())
        .maybeSingle();

      if (studentErr || !studentRow) return null;

      // Step 2 — find their result in this specific session
      const { data, error } = await supabase
        .from('mock_exam_results')
        .select(`
          id, student_id, session_id, total_score, position,
          student:students(id, full_name, student_id, no_on_roll,
            class:classes(id, name)),
          subject_marks:mock_exam_subject_marks(
            id, subject_id, total_score, grade,
            subject:subjects(id, name)
          )
        `)
        .eq('session_id', sessionId)
        .eq('student_id', studentRow.id)
        .maybeSingle();

      if (error || !data) return null;

      // Normalise nested relations that Supabase may return as arrays
      const raw = data as Record<string, unknown>;
      const sd = raw.student;
      let studentObj: MockResult['student'] = null;
      if (sd) {
        const s = (Array.isArray(sd) ? sd[0] : sd) as Record<string, unknown>;
        if (s) {
          const cd = s.class;
          const classObj = (
            Array.isArray(cd) && cd.length > 0
              ? cd[0]
              : cd
          ) as { id: string; name: string } | null;
          studentObj = {
            id: s.id as string,
            full_name: s.full_name as string,
            student_id: s.student_id as string,
            no_on_roll: s.no_on_roll as string | null,
            class: classObj,
          };
        }
      }

      const processedMarks = ((raw.subject_marks as Record<string, unknown>[]) || []).map(
        (mark) => {
          const subjectData = mark.subject;
          let subjectObj: { id: string; name: string } | null = null;
          if (subjectData) {
            if (Array.isArray(subjectData) && subjectData.length > 0)
              subjectObj = subjectData[0] as { id: string; name: string };
            else if (typeof subjectData === 'object')
              subjectObj = subjectData as { id: string; name: string };
          }
          return {
            id: mark.id as string,
            subject_id: mark.subject_id as string,
            total_score: mark.total_score as number | null,
            grade: mark.grade as string | null,
            subject: subjectObj,
          };
        }
      );

      return {
        ...(raw as Omit<MockResult, 'student' | 'subject_marks'>),
        student: studentObj,
        subject_marks: processedMarks,
      } as MockResult;
    },
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    if (!inputValue.trim()) return;
    setSubmittedId(inputValue.trim().toUpperCase());
    setHasSearched(true);
  };

  const handleClear = () => {
    setInputValue('');
    setSubmittedId('');
    setHasSearched(false);
  };

  // ── EARLY RETURNS (all hooks already called above) ──────────────────────────

  // No session ID in URL
  if (!sessionId) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PageHeader
          title={
            <>
              Find Your<br />
              <span className="text-blue-200">Mock Results</span>
            </>
          }
          subtitle="Mock exam results are accessed via a unique link shared by your school administrator once results are published."
        />
        <main className="flex-1 px-4 sm:px-5 pb-10">
          <div className="max-w-md mx-auto space-y-4 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden"
            >
              <div className="px-5 pt-5 pb-2 border-b border-gray-100">
                <p className="text-[13px] font-bold text-gray-900">
                  How to access your results
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Your school administrator shares a direct link
                </p>
              </div>
              <div className="px-5 py-4 space-y-3">
                {[
                  { n: 1, text: 'Contact your school administrator or class teacher' },
                  { n: 2, text: 'Ask for the mock results link for your exam session' },
                  { n: 3, text: 'Open the link and enter your Student ID to view your result' },
                ].map(({ n, text }) => (
                  <div key={n} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {n}
                    </div>
                    <p className="text-[13px] text-gray-700 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
              className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-4"
            >
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-blue-800 leading-relaxed">
                Results are only visible once your school has published them.
                Each mock exam session has its own unique link.
              </p>
            </motion.div>

            <p className="text-center text-[12px] text-gray-500 pb-4">
              Looking for end-of-term reports?{' '}
              <Link
                to="/student-reports"
                className="text-[#2563EB] font-bold hover:underline"
              >
                View Term Reports →
              </Link>
            </p>

            <PageFooter />
          </div>
        </main>
      </div>
    );
  }

  // Session loading
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PageHeader
          title={
            <>
              Mock Exam<br />
              <span className="text-blue-200">Results</span>
            </>
          }
          subtitle="Loading exam session…"
        />
        <main className="flex-1 px-4 sm:px-5 pb-10">
          <div className="max-w-md mx-auto pt-6 space-y-4">
            <Skel className="h-48 rounded-2xl" />
            <Skel className="h-14 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  // Session not found or error
  if (sessionError || !session) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PageHeader
          title={
            <>
              Session<br />
              <span className="text-blue-200">Not Found</span>
            </>
          }
          subtitle="The mock exam session you're looking for doesn't exist or has been removed."
        />
        <main className="flex-1 px-4 sm:px-5 pb-10">
          <div className="max-w-md mx-auto pt-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-8 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-[16px]">
                    Session Not Found
                  </p>
                  <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                    This link may be invalid or the exam session may have been
                    removed. Please contact your school for the correct link.
                  </p>
                </div>
                <Link
                  to="/"
                  className="text-[13px] font-semibold text-[#2563EB] hover:underline"
                >
                  ← Return to homepage
                </Link>
              </div>
            </motion.div>
            <PageFooter />
          </div>
        </main>
      </div>
    );
  }

  // Session not published yet
  if (!session.is_published) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PageHeader
          title={<>{session.name}</>}
          subtitle="Results for this mock exam session have not been published yet."
        />
        <main className="flex-1 px-4 sm:px-5 pb-10">
          <div className="max-w-md mx-auto pt-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-8 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-[16px]">
                    Results Pending Publication
                  </p>
                  <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                    Your school administrator has not yet published results for
                    this session. Please check back later or contact your school.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-3 py-1.5 text-[12px] font-semibold text-amber-700">
                  <Clock className="w-3.5 h-3.5" />
                  {session.name}
                </div>
              </div>
            </motion.div>
            <PageFooter />
          </div>
        </main>
      </div>
    );
  }

  // ── Published session — show the lookup form ────────────────────────────────
  const score = foundResult?.total_score ?? 0;
  const aggregate = foundResult?.position ?? (examType === 'bece' ? 54 : 72);
  const { grade, isPassing } = foundResult
    ? getGradeFromAggregate(aggregate, examType)
    : { grade: '', isPassing: false };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader
        title={<>{session.name}</>}
        subtitle={`${session.academic_year} · ${capitalize(session.term)} Term · ${getExamTypeName(examType)} — Enter your Student ID to view your result.`}
      />

      <main className="flex-1 px-4 sm:px-5 pb-10">
        <div className="max-w-md mx-auto space-y-4 pt-4">

          {/* ── Lookup card ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-gray-100/80 overflow-hidden"
          >
            {/* Card header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <p className="text-[13px] font-bold text-gray-900">
                Find Your Result
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Enter your Student ID exactly as given by your school
              </p>
            </div>

            <div className="px-5 pt-4 pb-5 space-y-3">
              {/* Student ID input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="student-id"
                  className="text-[13px] font-semibold text-gray-700 flex items-center gap-1"
                >
                  Student ID
                  <span className="text-[#2563EB]">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="student-id"
                    type="text"
                    autoComplete="off"
                    autoCapitalize="characters"
                    placeholder="e.g., PI25W9K"
                    value={inputValue}
                    onChange={(e) =>
                      setInputValue(e.target.value.toUpperCase())
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className={cn(
                      'h-12 text-[15px] rounded-xl border-gray-200 bg-gray-50/60',
                      'focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10',
                      'transition-all font-mono tracking-widest pr-10',
                      'placeholder:font-sans placeholder:tracking-normal placeholder:text-gray-400'
                    )}
                  />
                  <AnimatePresence>
                    {inputValue.trim() && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle2 className="w-[18px] h-[18px] text-[#2563EB]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-[11px] text-gray-400">
                  Your unique ID as given by your school — e.g. PI25W9K
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-1">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSearch}
                  disabled={!inputValue.trim() || searching}
                  className={cn(
                    'flex-1 h-12 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all duration-200',
                    inputValue.trim() && !searching
                      ? 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  )}
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching…
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Find My Result
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {(hasSearched || inputValue) && (
                    <motion.button
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      onClick={handleClear}
                      className="h-12 px-4 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors flex items-center gap-1.5 whitespace-nowrap overflow-hidden"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Clear
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Progress bar — fills when input is present */}
            <div className="h-1 bg-gray-100">
              <motion.div
                className="h-full bg-gradient-to-r from-[#2563EB] to-blue-400 rounded-full"
                animate={{ width: inputValue.trim() ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* ── Result states ────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">

            {/* Searching skeleton */}
            {searching && (
              <motion.div
                key="searching"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="h-1 bg-gray-100">
                  <motion.div
                    className="h-full bg-[#2563EB]/30 rounded-full"
                    animate={{ width: ['0%', '80%'] }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink-0">
                      <div className="absolute inset-0 rounded-full border-[3px] border-blue-100" />
                      <div className="absolute inset-0 rounded-full border-[3px] border-[#2563EB] border-t-transparent animate-spin" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <Skel className="h-3.5 w-40" />
                      <Skel className="h-2.5 w-28" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Skel className="h-16 rounded-xl" />
                    <Skel className="h-16 rounded-xl" />
                    <Skel className="h-16 rounded-xl" />
                  </div>
                  <Skel className="h-32 rounded-xl" />
                </div>
              </motion.div>
            )}

            {/* Search error */}
            {searchError && !searching && (
              <motion.div
                key="search-error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-red-50 border border-red-200/60 rounded-2xl px-5 py-5 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-red-800 text-[14px]">
                    Something went wrong
                  </p>
                  <p className="text-[12px] text-red-600/90 mt-1 leading-relaxed">
                    We could not complete your search. Please check your
                    connection and try again.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Not found */}
            {hasSearched && !searching && !searchError && foundResult === null && (
              <motion.div
                key="not-found"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-amber-50 border border-amber-200/60 rounded-2xl px-5 py-5 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-amber-900 text-[14px]">
                    No result found
                  </p>
                  <p className="text-[12px] text-amber-700/90 mt-1 leading-relaxed mb-3">
                    We could not find a result for{' '}
                    <span className="font-semibold font-mono">{submittedId}</span>{' '}
                    in this session. Please verify:
                  </p>
                  <div className="space-y-1.5">
                    {[
                      'Your Student ID is exactly correct (case-sensitive)',
                      'You are looking at the correct exam session',
                      'Your school has entered your scores in the system',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <p className="text-[12px] text-amber-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Found — student result card ────────────────────────────── */}
            {foundResult && !searching && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden"
              >
                {/* Blue gradient student header */}
                <div
                  className="px-5 pt-5 pb-5 relative overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle, #fff 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />
                  <div className="relative z-10 flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.15,
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0 shadow-lg"
                    >
                      <span className="text-white font-extrabold text-lg tracking-tight leading-none">
                        {initials(foundResult.student?.full_name ?? '??')}
                      </span>
                    </motion.div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.25, type: 'spring' }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0" />
                        </motion.div>
                        <span className="text-[11px] font-semibold text-green-300 uppercase tracking-wide">
                          Result verified
                        </span>
                      </div>
                      <p className="text-white font-extrabold text-[18px] leading-tight truncate">
                        {foundResult.student?.full_name}
                      </p>
                      <p className="text-blue-200 text-[12px] font-mono mt-0.5">
                        {foundResult.student?.student_id}
                        {foundResult.student?.class?.name
                          ? ` · ${foundResult.student.class.name}`
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session info strip */}
                <div className="px-5 py-3 bg-gray-50/60 border-b border-gray-100 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <p className="text-[12px] text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {session.name}
                    </span>{' '}
                    · {session.academic_year} · {capitalize(session.term)} Term
                  </p>
                </div>

                {/* Three metric tiles */}
                <div className="px-5 py-4 grid grid-cols-3 gap-3 border-b border-gray-100">
                  <div className="bg-white rounded-xl border border-gray-100 px-3 py-3 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Avg Score
                      </p>
                    </div>
                    <p className="text-[22px] font-black text-gray-800 leading-none">
                      {score}
                      <span className="text-[12px] text-gray-400 ml-0.5">%</span>
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 px-3 py-3 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Aggregate
                      </p>
                    </div>
                    <p
                      className={cn(
                        'text-[22px] font-black leading-none',
                        isPassing ? 'text-emerald-600' : 'text-red-600'
                      )}
                    >
                      {aggregate}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 px-3 py-3 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Grade
                      </p>
                    </div>
                    <p
                      className={cn(
                        'text-[22px] font-black leading-none',
                        isPassing ? 'text-emerald-600' : 'text-red-600'
                      )}
                    >
                      {grade}
                    </p>
                  </div>
                </div>

                {/* Subject breakdown */}
                {foundResult.subject_marks.length > 0 && (
                  <div className="overflow-hidden border-b border-gray-100">
                    <div className="px-5 py-2.5 bg-gray-50/60 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Subject Breakdown
                        </p>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {foundResult.subject_marks.map((mark) => (
                        <div
                          key={mark.id}
                          className="flex items-center justify-between px-5 py-2.5"
                        >
                          <p className="text-[13px] text-gray-700 font-medium">
                            {mark.subject?.name || 'Unknown Subject'}
                          </p>
                          <div className="flex items-center gap-2.5">
                            <span className="text-[13px] font-bold text-gray-800">
                              {mark.total_score ?? '—'}%
                            </span>
                            <span
                              className={cn(
                                'text-[11px] font-bold px-2 py-0.5 rounded-full',
                                gradeClasses(mark.grade)
                              )}
                            >
                              {mark.grade || '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pass / fail verdict */}
                <div className="px-5 py-4">
                  <div
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold',
                      isPassing
                        ? 'bg-emerald-50 border border-emerald-100 text-emerald-800'
                        : 'bg-red-50 border border-red-100 text-red-800'
                    )}
                  >
                    {isPassing ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    {isPassing
                      ? `Passed — aggregate of ${aggregate} is within the ${examType.toUpperCase()} passing threshold.`
                      : `Not passed — aggregate of ${aggregate} exceeds the ${examType.toUpperCase()} passing threshold.`}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Help card ────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-3.5"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-800 mb-0.5">
                Can't find your result?
              </p>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Make sure your Student ID is correct and your school has
                entered your scores. Contact your{' '}
                <span className="font-semibold text-gray-700">
                  school administrator
                </span>{' '}
                if the problem persists.
              </p>
            </div>
          </motion.div>

          <PageFooter />
        </div>
      </main>
    </div>
  );
};

export default PublicMockResults;
