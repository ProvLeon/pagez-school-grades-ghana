import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Search,
  GraduationCap,
  AlertCircle,
  FileText,
  Award,
  TrendingUp,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Calendar,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  ChevronRight,
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
  class_id: string | null;
  position: number | null;
  created_at: string;
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

const getGradeFromAggregate = (aggregate: number, examType: 'bece' | 'wassce') => {
  const maxAggregate = examType === 'bece' ? 30 : 36;
  const isPassing = aggregate <= maxAggregate;
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
      style={{ width: '110%', height: '100%', borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
    />
  </div>
);

// ─── Metric tile (matches ViewResult style) ───────────────────────────────────
const MetricTile = ({
  icon: Icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
  unit?: string;
  accent: string;
}) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-2xl bg-white border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] p-4 flex flex-col justify-center group transition-all duration-300',
      accent,
    )}
  >
    <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full blur-2xl opacity-60 bg-current" />
    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
    <span className="text-2xl font-black text-gray-800 tracking-tight leading-none">
      {value}
      {unit && <span className="text-base text-gray-400 font-bold ml-0.5">{unit}</span>}
    </span>
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
    style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #3B82F6 100%)' }}
  >
    {/* dot grid */}
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '20px 20px' }}
    />
    {/* glow blobs */}
    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
    <div className="absolute top-20 -left-10 w-48 h-48 rounded-full bg-indigo-600/20 blur-2xl pointer-events-none" />

    <div className="relative z-10">
      {/* nav row */}
      <div className="max-w-5xl mx-auto px-5 pt-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/ERESULTS_LOGO.png" alt="e-Results GH" className="w-8 h-8 rounded-full border border-white/30 shadow-md" />
          <span className="text-white font-bold text-[15px] tracking-tight">e-Results GH</span>
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

      {/* hero */}
      <div className="max-w-5xl mx-auto px-5 pt-7 pb-20">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-blue-100 tracking-wide uppercase">
            Mock Examination Portal
          </span>
        </div>
        <h1 className="text-[26px] sm:text-[32px] font-extrabold text-white leading-[1.15] tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-blue-200/90 text-[13px] leading-relaxed max-w-lg mb-5">{subtitle}</p>

        {/* trust badges */}
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { icon: Shield, text: 'Secured portal' },
            { icon: GraduationCap, text: 'Official records' },
            { icon: Lock, text: 'School-verified' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-[11px] text-blue-200/80 font-medium">
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

// ─── Main component ───────────────────────────────────────────────────────────
const PublicMockResults = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── ALL HOOKS HOISTED ABOVE EVERY EARLY RETURN ─────────────────────────────
  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
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

  const examType: 'bece' | 'wassce' = useMemo(() => {
    if (!session) return 'bece';
    const name = session.name.toLowerCase();
    if (name.includes('wassce') || name.includes('shs') || name.includes('senior')) return 'wassce';
    return 'bece';
  }, [session]);

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['public-mock-results', sessionId],
    enabled: !!sessionId && session?.is_published === true,
    queryFn: async (): Promise<MockResult[]> => {
      if (!sessionId) return [];
      const { data, error } = await supabase
        .from('mock_exam_results')
        .select(`
          id, student_id, session_id, total_score, class_id, position, created_at,
          student:students(id, full_name, student_id, no_on_roll, class:classes(id, name)),
          subject_marks:mock_exam_subject_marks(
            id, subject_id, total_score, grade, subject:subjects(id, name)
          )
        `)
        .eq('session_id', sessionId)
        .order('total_score', { ascending: false });
      if (error) throw error;
      return (data || []).map((r) => {
        const sd = r.student as unknown;
        let studentObj: MockResult['student'] = null;
        if (sd) {
          const s = (Array.isArray(sd) ? sd[0] : sd) as Record<string, unknown>;
          if (s) {
            const cd = s.class;
            const classObj = Array.isArray(cd) && cd.length > 0
              ? (cd[0] as { id: string; name: string })
              : (cd as { id: string; name: string } | null);
            studentObj = {
              id: s.id as string,
              full_name: s.full_name as string,
              student_id: s.student_id as string,
              no_on_roll: s.no_on_roll as string | null,
              class: classObj,
            };
          }
        }
        const processedMarks = (r.subject_marks || []).map((mark: Record<string, unknown>) => {
          const subjectData = mark.subject;
          let subjectObj: { id: string; name: string } | null = null;
          if (subjectData) {
            if (Array.isArray(subjectData) && subjectData.length > 0) subjectObj = subjectData[0] as { id: string; name: string };
            else if (typeof subjectData === 'object') subjectObj = subjectData as { id: string; name: string };
          }
          return {
            id: mark.id as string,
            subject_id: mark.subject_id as string,
            total_score: mark.total_score as number | null,
            grade: mark.grade as string | null,
            subject: subjectObj,
          };
        });
        return { ...r, student: studentObj, subject_marks: processedMarks } as MockResult;
      });
    },
  });

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return results;
    const q = searchTerm.toLowerCase().trim();
    return results.filter((r) =>
      (r.student?.full_name?.toLowerCase() || '').includes(q) ||
      (r.student?.student_id?.toLowerCase() || '').includes(q) ||
      (r.student?.no_on_roll?.toLowerCase() || '').includes(q)
    );
  }, [results, searchTerm]);

  const totalStudents = results.length;
  const avgScore = totalStudents > 0
    ? Math.round(results.reduce((s, r) => s + (r.total_score || 0), 0) / totalStudents)
    : 0;
  const avgAggregate = totalStudents > 0
    ? (results.reduce((s, r) => s + (r.position || 54), 0) / totalStudents).toFixed(1)
    : '-';
  const passRate = totalStudents > 0
    ? Math.round((results.filter((r) => {
      const agg = r.position || 54;
      return examType === 'bece' ? agg <= 30 : agg <= 36;
    }).length / totalStudents) * 100)
    : 0;

  // ── No session link ────────────────────────────────────────────────────────
  if (!sessionId) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PageHeader
          title={<>Find Your<br /><span className="text-blue-200">Mock Results</span></>}
          subtitle="Mock exam results are shared via a unique link from your school administrator once results are published."
        />

        <main className="flex-1 px-4 sm:px-5 pb-10">
          <div className="max-w-md mx-auto space-y-4 pt-4">
            {/* How-to card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden"
            >
              <div className="px-5 pt-5 pb-2 border-b border-gray-100">
                <p className="text-[13px] font-bold text-gray-900">How to access your results</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Your school administrator shares a direct link</p>
              </div>
              <div className="px-5 py-4 space-y-3">
                {[
                  { n: 1, text: 'Contact your school administrator or class teacher' },
                  { n: 2, text: 'Ask for the mock results link for your exam session' },
                  { n: 3, text: 'Open the link on any device — no login required' },
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

            {/* Info note */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
              className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-4"
            >
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-blue-800 leading-relaxed">
                Results are only visible once your school has published them. Each mock exam
                session has its own unique link.
              </p>
            </motion.div>

            {/* Cross-link */}
            <p className="text-center text-[12px] text-gray-500 pb-4">
              Looking for end-of-term reports?{' '}
              <Link to="/student-reports" className="text-[#2563EB] font-bold hover:underline">
                View Term Reports →
              </Link>
            </p>

            {/* Footer */}
            <div className="text-center pt-2 pb-6 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <img src="/ERESULTS_LOGO.png" alt="e-Results GH" className="w-5 h-5 rounded-full opacity-50" />
                <p className="text-[11px] text-gray-400 font-semibold">e-Results GH · PB Pagez LTD</p>
              </div>
              <p className="text-[11px] text-gray-300">Published exclusively by your school.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PageHeader
          title={<>Mock Exam<br /><span className="text-blue-200">Results</span></>}
          subtitle="Loading exam session information…"
        />
        <main className="flex-1 px-4 sm:px-5 pb-10">
          <div className="max-w-5xl mx-auto pt-6 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => <Skel key={i} className="h-24 rounded-2xl" />)}
            </div>
            <Skel className="h-14 rounded-2xl" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skel key={i} className="h-16 rounded-2xl" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Session not found ──────────────────────────────────────────────────────
  if (sessionError || !session) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PageHeader
          title={<>Session<br /><span className="text-blue-200">Not Found</span></>}
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
                  <p className="font-bold text-gray-900 text-[16px]">Session Not Found</p>
                  <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                    This link may be invalid or the exam session may have been removed. Please
                    contact your school administrator for the correct link.
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
          </div>
        </main>
      </div>
    );
  }

  // ── Not published ──────────────────────────────────────────────────────────
  if (!session.is_published) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PageHeader
          title={<>{session.name}<br /><span className="text-blue-200">Not Yet Published</span></>}
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
                  <p className="font-bold text-gray-900 text-[16px]">Results Pending Publication</p>
                  <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                    Your school administrator has not yet published results for this session.
                    Please check back later or contact your school.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-3 py-1.5 text-[12px] font-semibold text-amber-700">
                  <Clock className="w-3.5 h-3.5" />
                  {session.name}
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  // ── Published results ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader
        title={<>{session.name}</>}
        subtitle={`${session.academic_year} · ${capitalize(session.term)} Term · ${getExamTypeName(examType)}`}
      />

      <main className="flex-1 px-4 sm:px-5 pb-12">
        <div className="max-w-5xl mx-auto space-y-4 pt-4">

          {/* ── Metric tiles ────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <MetricTile
              icon={Users}
              label="Total Students"
              value={totalStudents}
              accent="border-blue-100 hover:border-blue-200"
            />
            <MetricTile
              icon={TrendingUp}
              label="Avg Score"
              value={avgScore}
              unit="%"
              accent="border-purple-100 hover:border-purple-200"
            />
            <MetricTile
              icon={BarChart3}
              label="Avg Aggregate"
              value={avgAggregate}
              accent="border-orange-100 hover:border-orange-200"
            />
            <MetricTile
              icon={Award}
              label="Pass Rate"
              value={passRate}
              unit="%"
              accent="border-emerald-100 hover:border-emerald-200"
            />
          </motion.div>

          {/* ── Search ──────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3"
          >
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by student name, ID or roll number…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-[13px] text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchTerm('')}
                  className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
                >
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
            {searchTerm && (
              <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap">
                {filteredResults.length} of {results.length}
              </span>
            )}
          </motion.div>

          {/* ── Results list ────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Table header — desktop only */}
            <div className="hidden sm:grid grid-cols-[40px_1fr_140px_90px_90px_80px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
              {['#', 'Student', 'Class', 'Avg Score', 'Aggregate', ''].map((h) => (
                <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {h}
                </p>
              ))}
            </div>

            {resultsLoading ? (
              <div className="px-5 py-5 space-y-3">
                {[1, 2, 3, 4].map((i) => <Skel key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="px-5 py-14 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-[14px] font-semibold text-gray-700">
                  {searchTerm ? 'No students match your search' : 'No results available'}
                </p>
                <p className="text-[12px] text-gray-400 max-w-xs leading-relaxed">
                  {searchTerm
                    ? 'Try searching with a different name or ID.'
                    : 'Results for this session have not been entered yet.'}
                </p>
              </div>
            ) : (
              <div>
                {filteredResults.map((result, index) => {
                  const score = result.total_score ?? 0;
                  const aggregate = result.position ?? (examType === 'bece' ? 54 : 72);
                  const { grade, isPassing } = getGradeFromAggregate(aggregate, examType);
                  const isExpanded = expandedId === result.id;

                  return (
                    <div key={result.id} className={cn('border-b border-gray-100 last:border-0')}>
                      {/* Row */}
                      <div
                        className={cn(
                          'grid grid-cols-[40px_1fr_auto] sm:grid-cols-[40px_1fr_140px_90px_90px_80px]',
                          'gap-3 px-5 py-3.5 items-center cursor-pointer transition-colors',
                          isExpanded ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                        )}
                        onClick={() => setExpandedId(isExpanded ? null : result.id)}
                      >
                        {/* Rank */}
                        <div className="flex items-center justify-center">
                          <span className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold',
                            index === 0 ? 'bg-amber-100 text-amber-700' :
                              index === 1 ? 'bg-gray-200 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-600' :
                                  'bg-gray-100 text-gray-500'
                          )}>
                            {index + 1}
                          </span>
                        </div>

                        {/* Student */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-[#2563EB]">
                                {initials(result.student?.full_name || '??')}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-gray-900 truncate">
                                {result.student?.full_name || 'Unknown'}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {result.student?.no_on_roll || result.student?.student_id || '—'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Class — desktop */}
                        <p className="hidden sm:block text-[13px] text-gray-600 truncate">
                          {result.student?.class?.name || '—'}
                        </p>

                        {/* Score — desktop */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className="text-[13px] font-bold text-gray-800">{score}%</span>
                        </div>

                        {/* Aggregate — desktop */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className={cn(
                            'inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-full',
                            isPassing ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          )}>
                            {isPassing ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {aggregate}
                          </span>
                        </div>

                        {/* Expand toggle (both mobile and desktop) */}
                        <div className="flex items-center justify-end gap-2">
                          {/* Grade badge — mobile summary */}
                          <span className={cn(
                            'sm:hidden inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full',
                            gradeClasses(grade)
                          )}>
                            {grade}
                          </span>
                          <div className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                            isExpanded ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-gray-100 text-gray-500'
                          )}>
                            {isExpanded
                              ? <ChevronUp className="w-3.5 h-3.5" />
                              : <ChevronDown className="w-3.5 h-3.5" />
                            }
                          </div>
                        </div>
                      </div>

                      {/* Expanded detail panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="overflow-hidden border-t border-blue-100/60"
                          >
                            <div className="px-5 py-5 bg-blue-50/30 space-y-4">
                              {/* Student summary */}
                              <div className="flex items-center gap-3.5">
                                <div
                                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-[15px] shrink-0 shadow-sm"
                                  style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)' }}
                                >
                                  {initials(result.student?.full_name || '??')}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-[15px]">
                                    {result.student?.full_name}
                                  </p>
                                  <p className="text-[12px] text-gray-500">
                                    {result.student?.class?.name} ·{' '}
                                    {result.student?.no_on_roll || result.student?.student_id}
                                  </p>
                                </div>
                              </div>

                              {/* Mini metric tiles */}
                              <div className="grid grid-cols-3 gap-2.5">
                                <div className="bg-white rounded-xl border border-gray-100 px-3 py-3 text-center shadow-sm">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Score</p>
                                  <p className="text-[20px] font-black text-gray-800">{score}<span className="text-[12px] text-gray-400 ml-0.5">%</span></p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-100 px-3 py-3 text-center shadow-sm">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Aggregate</p>
                                  <p className={cn('text-[20px] font-black', isPassing ? 'text-emerald-600' : 'text-red-600')}>{aggregate}</p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-100 px-3 py-3 text-center shadow-sm">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Grade</p>
                                  <p className={cn('text-[20px] font-black', isPassing ? 'text-emerald-600' : 'text-red-600')}>{grade}</p>
                                </div>
                              </div>

                              {/* Subject breakdown */}
                              {result.subject_marks.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                  <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                      Subject Breakdown
                                    </p>
                                  </div>
                                  <div className="divide-y divide-gray-50">
                                    {result.subject_marks.map((mark) => (
                                      <div
                                        key={mark.id}
                                        className="flex items-center justify-between px-4 py-2.5"
                                      >
                                        <p className="text-[13px] text-gray-700 font-medium">
                                          {mark.subject?.name || 'Unknown Subject'}
                                        </p>
                                        <div className="flex items-center gap-2.5">
                                          <span className="text-[13px] font-bold text-gray-800">
                                            {mark.total_score ?? '—'}%
                                          </span>
                                          <span className={cn(
                                            'text-[11px] font-bold px-2 py-0.5 rounded-full',
                                            gradeClasses(mark.grade)
                                          )}>
                                            {mark.grade || '—'}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Pass/fail verdict */}
                              <div className={cn(
                                'flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold',
                                isPassing
                                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-800'
                                  : 'bg-red-50 border border-red-100 text-red-800'
                              )}>
                                {isPassing
                                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  : <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                }
                                {isPassing
                                  ? `Passed — aggregate of ${aggregate} is within the ${examType.toUpperCase()} passing threshold.`
                                  : `Not passed — aggregate of ${aggregate} exceeds the ${examType.toUpperCase()} passing threshold.`
                                }
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* ── Session info footer ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800">{session.name}</p>
                <p className="text-[11px] text-gray-400">
                  {session.academic_year} · {capitalize(session.term)} Term · {getExamTypeName(examType)}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Published
            </span>
          </motion.div>

          {/* Footer */}
          <div className="text-center pt-2 pb-4 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <img src="/ERESULTS_LOGO.png" alt="e-Results GH" className="w-5 h-5 rounded-full opacity-50" />
              <p className="text-[11px] text-gray-400 font-semibold">e-Results GH · PB Pagez LTD</p>
            </div>
            <p className="text-[11px] text-gray-300 max-w-xs mx-auto leading-relaxed">
              Results published and managed exclusively by your school. This portal does not store personal data.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PublicMockResults;
