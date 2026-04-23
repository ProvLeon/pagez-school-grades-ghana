import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  FileText,
  Search,
  Download,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Shield,
  RefreshCw,
  BookOpen,
  ChevronRight,
  Lock,
} from 'lucide-react';
import {
  usePublicReportSearch,
  usePublicReportGeneration,
  usePublicSearchData,
} from '@/hooks/usePublicReports';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

// ─── Field completion dot ─────────────────────────────────────────────────────
const CompletionDot = ({ done }: { done: boolean }) => (
  <motion.div
    animate={{ scale: done ? 1 : 0.7, opacity: done ? 1 : 0.3 }}
    transition={{ duration: 0.25 }}
    className={cn(
      'w-2 h-2 rounded-full transition-colors duration-300',
      done ? 'bg-[#2563EB]' : 'bg-gray-300'
    )}
  />
);

// ─── Labelled form field ──────────────────────────────────────────────────────
const Field = ({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1">
      {label}
      {required && <span className="text-[#2563EB]">*</span>}
    </Label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 leading-relaxed">{hint}</p>}
  </div>
);

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('rounded-lg bg-gray-100 animate-pulse', className)} />
);

// ─── Wave divider — CSS elliptical curve, zero gap guaranteed ─────────────────
// Renders as an absolutely-positioned div inside the header.
// The gray ellipse curves UP into the blue header, giving the wave illusion.
// No SVG fill-direction issues, no pixel gaps, works at every viewport width.
const Wave = () => (
  <div
    aria-hidden
    className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none"
    style={{ height: 56, lineHeight: 0 }}
  >
    {/* Gray page-background fills from the bottom, curved top creates the wave */}
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

// ─── Main component ───────────────────────────────────────────────────────────
const PublicReports = () => {
  const [studentId, setStudentId] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState('');
  const [classId, setClassId] = useState('');

  const {
    result,
    isLoading: isSearching,
    error,
    searchReport,
    clearSearch,
  } = usePublicReportSearch();
  const { isGenerating, generatePublicReport } = usePublicReportGeneration();
  const { classes, academicYears, terms } = usePublicSearchData();

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((result !== undefined || error) && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [result, error]);

  const filteredClasses = classes.filter((c) => c.academic_year === academicYear);
  const isFormValid = studentId.trim() && academicYear && term && classId;

  const handleSearch = () => {
    if (!isFormValid) return;
    searchReport({ studentId: studentId.trim(), academicYear, term, classId });
  };

  const handleDownload = async () => {
    if (result?.id) await generatePublicReport(result.id);
  };

  const handleClear = () => {
    setStudentId('');
    setAcademicYear('');
    setTerm('');
    setClassId('');
    clearSearch();
  };

  // Form completion progress (4 fields)
  const fieldsDone = [
    !!studentId.trim(),
    !!academicYear,
    !!term,
    !!classId,
  ];
  const completedCount = fieldsDone.filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header
        className="relative"
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #3B82F6 100%)',
        }}
      >
        {/* Subtle dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Decorative glow blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-10 w-48 h-48 rounded-full bg-indigo-600/20 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Nav row */}
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
              to="/mock-results"
              className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Mock Results
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Hero content */}
          <div className="max-w-lg mx-auto px-5 pt-8 pb-20">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-blue-100 tracking-wide uppercase">
                Portal is live — results available
              </span>
            </div>

            <h1 className="text-[28px] sm:text-[34px] font-extrabold text-white leading-[1.15] tracking-tight mb-3">
              Find Your
              <br />
              <span className="text-blue-200">Report Card</span>
            </h1>
            <p className="text-blue-200/90 text-[13px] leading-relaxed max-w-sm mb-6">
              Enter your school details below to access and download
              your official academic report — published directly by your school.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { icon: Shield, text: 'Secured portal' },
                { icon: FileText, text: 'Official records' },
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
          </div>

          {/* Wave — must be last child so it sits on top of the header bg */}
          <Wave />
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 sm:px-5 pb-10">
        <div className="max-w-lg mx-auto space-y-4">

          {/* ── Form card ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-gray-100/80 overflow-hidden"
          >
            {/* Card header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-gray-900">
                  Student Details
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Fill all fields to search
                </p>
              </div>

              {/* Completion dots */}
              <div className="flex items-center gap-1.5">
                {fieldsDone.map((done, i) => (
                  <CompletionDot key={i} done={done} />
                ))}
                <span className="text-[11px] text-gray-400 font-medium ml-1">
                  {completedCount}/4
                </span>
              </div>
            </div>

            <div className="px-5 pt-4 pb-5 space-y-4">
              {/* Student ID */}
              <Field
                label="Student ID"
                required
                hint="Your unique ID as provided by your school — e.g. PI25W9K"
              >
                <div className="relative">
                  <Input
                    id="studentId"
                    type="text"
                    autoComplete="off"
                    autoCapitalize="characters"
                    placeholder="e.g., PI25W9K"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className={cn(
                      'h-12 text-[15px] rounded-xl border-gray-200 bg-gray-50/60',
                      'focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10',
                      'transition-all font-mono tracking-widest pr-10 placeholder:font-sans placeholder:tracking-normal placeholder:text-gray-400'
                    )}
                  />
                  <AnimatePresence>
                    {studentId.trim() && (
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
              </Field>

              {/* Year + Term */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Academic Year" required>
                  <Select
                    value={academicYear}
                    onValueChange={(v) => {
                      setAcademicYear(v);
                      setClassId('');
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/60 focus:border-[#2563EB] text-[13px]">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Term" required>
                  <Select value={term} onValueChange={setTerm}>
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/60 focus:border-[#2563EB] text-[13px]">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((t) => (
                        <SelectItem key={t} value={t}>
                          {capitalize(t)} Term
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Class */}
              <Field label="Class" required>
                <Select
                  value={classId}
                  onValueChange={setClassId}
                  disabled={!academicYear}
                >
                  <SelectTrigger
                    className={cn(
                      'h-12 rounded-xl border-gray-200 bg-gray-50/60 focus:border-[#2563EB] text-[13px] transition-all',
                      !academicYear && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <SelectValue
                      placeholder={
                        academicYear
                          ? 'Select your class'
                          : 'Select academic year first'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClasses.length === 0 ? (
                      <div className="px-4 py-3 text-[13px] text-gray-400 text-center">
                        No classes found for this year
                      </div>
                    ) : (
                      filteredClasses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </Field>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-1">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSearch}
                  disabled={!isFormValid || isSearching}
                  className={cn(
                    'flex-1 h-12 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all duration-200',
                    isFormValid && !isSearching
                      ? 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  )}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching…
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Find My Report
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {(result !== undefined || error || studentId) && (
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

            {/* Progress bar at bottom of form */}
            <div className="h-1 bg-gray-100">
              <motion.div
                className="h-full bg-gradient-to-r from-[#2563EB] to-blue-400 rounded-full"
                animate={{ width: `${(completedCount / 4) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* ── States ──────────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">

            {/* Loading — skeleton */}
            {isSearching && (
              <motion.div
                key="loading"
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
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-2.5 w-28" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                    <Skeleton className="h-12 rounded-xl" />
                  </div>
                  <Skeleton className="h-12 rounded-xl" />
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && !isSearching && (
              <motion.div
                key="error"
                ref={resultRef}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-red-50 border border-red-200/60 rounded-2xl px-5 py-5 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-red-800 text-[14px]">
                    Something went wrong
                  </p>
                  <p className="text-[12px] text-red-600/90 mt-1 leading-relaxed">
                    We could not complete your search. Please check your internet
                    connection and try again. If the problem continues, contact your
                    school for assistance.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Not found */}
            {result === null && !isSearching && isFormValid && !error && (
              <motion.div
                key="not-found"
                ref={resultRef}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-amber-50 border border-amber-200/60 rounded-2xl overflow-hidden"
              >
                <div className="px-5 py-5 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-amber-900 text-[14px]">
                      No report found
                    </p>
                    <p className="text-[12px] text-amber-700/90 mt-1 leading-relaxed mb-3">
                      We searched our records but could not find a report matching
                      your details. Please verify the following:
                    </p>
                    <div className="space-y-2">
                      {[
                        'Student ID is exactly correct (check for typos)',
                        'Academic year and term are correct',
                        'Class selection matches your actual class',
                        'Your school has published results for this term',
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <p className="text-[12px] text-amber-800">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {result && !isSearching && (
              <motion.div
                key="success"
                ref={resultRef}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden"
              >
                {/* Blue gradient header */}
                <div
                  className="px-5 pt-5 pb-5 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                  }}
                >
                  {/* Dot texture */}
                  <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />
                  <div className="relative z-10 flex items-center gap-4">
                    {/* Student initials avatar */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
                      className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0 shadow-lg"
                    >
                      <span className="text-white font-extrabold text-lg tracking-tight leading-none">
                        {initials(result.students?.full_name ?? '??')}
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
                          Report verified
                        </span>
                      </div>
                      <p className="text-white font-extrabold text-[18px] leading-tight truncate">
                        {result.students?.full_name}
                      </p>
                      <p className="text-blue-200 text-[12px] font-mono mt-0.5">
                        {result.students?.student_id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b border-gray-100">
                  {[
                    { label: 'Class', value: result.classes?.name ?? '—' },
                    {
                      label: 'Academic Year',
                      value: result.academic_year ?? '—',
                    },
                    {
                      label: 'Term',
                      value: `${capitalize(result.term ?? '')} Term`,
                    },
                    {
                      label: 'Status',
                      value: (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[13px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Published
                        </span>
                      ),
                    },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                        {label}
                      </p>
                      <div className="text-[13px] font-bold text-gray-900">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Download section */}
                <div className="px-5 py-4 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className={cn(
                      'w-full h-13 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 transition-all duration-200 py-3.5',
                      isGenerating
                        ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                        : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating PDF…
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download Report Card (PDF)
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                    The PDF will open or download automatically on your device.
                    <br />
                    Save it to your phone for future reference.
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ── Help card ───────────────────────────────────────────────────── */}
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
                Can't find your report?
              </p>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Reports are only available after your school publishes them.
                Contact your{' '}
                <span className="font-semibold text-gray-700">
                  school administrator
                </span>{' '}
                if you believe your results should be available.
              </p>
            </div>
          </motion.div>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          <div className="text-center pt-2 pb-6 space-y-1.5">
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
              Report data is managed and published exclusively by your school.
              This portal does not store personal data.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PublicReports;
