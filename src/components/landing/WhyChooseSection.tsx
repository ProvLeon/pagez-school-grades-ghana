import { Check } from "lucide-react";

/* ─── Report Sheet Mockup ─────────────────────────────────────────────────── */
const ReportSheetMockup = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 max-w-sm mx-auto w-full">
    {/* School header */}
    <div className="bg-[#2563EB] text-white text-center rounded-xl py-3 px-4 mb-4">
      <div className="text-[10px] font-semibold tracking-wide opacity-75 uppercase">
        Asante Preparatory School
      </div>
      <div className="text-xs font-bold mt-0.5">Student Report Sheet — Term 2</div>
    </div>

    {/* Student meta */}
    <div className="space-y-1 mb-4 px-1">
      {[
        { label: "Student Name", value: "Kofi Mensah" },
        { label: "Class", value: "JHS 2B" },
        { label: "Academic Year", value: "2024 / 2025" },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between text-[11px]">
          <span className="text-gray-400">{label}:</span>
          <span className="font-semibold text-gray-800">{value}</span>
        </div>
      ))}
    </div>

    {/* Scores table */}
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
        { subject: "Social Studies", sba: 30, exam: 46, grade: "B2" },
        { subject: "RME", sba: 36, exam: 50, grade: "A1" },
      ].map((row) => (
        <div
          key={row.subject}
          className="grid grid-cols-4 px-3 py-1.5 border-t border-gray-50 text-[10px] hover:bg-gray-50/60 transition-colors"
        >
          <span className="text-gray-700 font-medium truncate pr-1">{row.subject}</span>
          <span className="text-center text-gray-500">{row.sba}</span>
          <span className="text-center text-gray-500">{row.exam}</span>
          <span className="text-center font-bold text-[#2563EB]">{row.grade}</span>
        </div>
      ))}
    </div>

    {/* Aggregate footer */}
    <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-2.5">
      <div className="text-[11px] text-gray-500 font-medium">Total Aggregate</div>
      <div className="text-lg font-extrabold text-[#2563EB]">7</div>
    </div>

    {/* Remark */}
    <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2">
      <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
        Headmaster's Remark
      </div>
      <div className="text-[10px] text-gray-600 italic">
        "Excellent performance. Keep up the great work."
      </div>
    </div>
  </div>
);

/* ─── Student List Mockup ─────────────────────────────────────────────────── */
const StudentListMockup = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-sm mx-auto w-full">
    {/* Table header */}
    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
      <span className="text-xs font-bold text-gray-800">
        Student Register — JHS 3A
      </span>
      <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
        42 Students
      </span>
    </div>

    {/* Column headings */}
    <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
      <span>ID</span>
      <span className="col-span-2">Name</span>
      <span className="text-right">Status</span>
    </div>

    {/* Rows */}
    {[
      { id: "S-001", name: "Ama Owusu", status: "Active", color: "bg-blue-50 text-blue-700" },
      { id: "S-002", name: "Kweku Asante", status: "Active", color: "bg-blue-50 text-blue-700" },
      { id: "S-003", name: "Abena Boateng", status: "Promoted", color: "bg-green-50 text-green-700" },
      { id: "S-004", name: "Yaw Frimpong", status: "Active", color: "bg-blue-50 text-blue-700" },
      { id: "S-005", name: "Akua Darko", status: "Transferred", color: "bg-amber-50 text-amber-700" },
      { id: "S-006", name: "Kofi Mensah", status: "Active", color: "bg-blue-50 text-blue-700" },
    ].map((row) => (
      <div
        key={row.id}
        className="grid grid-cols-4 px-4 py-2 border-t border-gray-50 hover:bg-gray-50/60 transition-colors"
      >
        <span className="text-[10px] text-gray-400 font-mono">{row.id}</span>
        <span className="col-span-2 text-[10px] text-gray-800 font-medium truncate pr-2">
          {row.name}
        </span>
        <span className="text-right">
          <span
            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${row.color}`}
          >
            {row.status}
          </span>
        </span>
      </div>
    ))}

    {/* Footer action bar */}
    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
      <span className="text-[9px] text-gray-400">Showing 6 of 42 students</span>
      <div className="text-[9px] font-semibold text-[#2563EB] cursor-default">
        + Bulk Upload Excel
      </div>
    </div>
  </div>
);

/* ─── Feature Bullet ──────────────────────────────────────────────────────── */
const Bullet = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3">
    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Check className="w-3 h-3 text-[#2563EB]" />
    </div>
    <span className="text-sm text-gray-600 leading-relaxed">{text}</span>
  </li>
);

/* ─── Section ─────────────────────────────────────────────────────────────── */
const WhyChooseSection = () => {
  return (
    <section className="py-20 md:py-28 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 mb-4">
            Why Choose Us
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Why Choose e-Results GH?
          </h2>
          <p className="mt-4 text-base text-gray-500 max-w-xl mx-auto">
            Every feature is designed around the realities of Ghanaian school administration — no bloat, no guesswork.
          </p>
        </div>

        {/* ── Feature A: Visual Left · Text Right ── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-24">
          {/* Visual */}
          <div className="flex-1 w-full flex justify-center">
            <ReportSheetMockup />
          </div>

          {/* Text */}
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700">
              Report Generation
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug tracking-tight">
              Instant, Professional
              <br />
              Report Sheets
            </h3>
            <p className="text-gray-500 text-base leading-relaxed">
              Generate beautifully formatted, Ghana Education Service-aligned
              report sheets for every student, class, and term — in seconds,
              not hours. No manual calculations, no formatting errors.
            </p>
            <ul className="space-y-3.5">
              {[
                "BECE & SBA grading systems supported",
                "Automated remarks & grade computation",
                "One-click PDF download for all classes",
              ].map((f) => (
                <Bullet key={f} text={f} />
              ))}
            </ul>
          </div>
        </div>

        {/* ── Feature B: Text Left · Visual Right ── */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          {/* Visual */}
          <div className="flex-1 w-full flex justify-center">
            <StudentListMockup />
          </div>

          {/* Text */}
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-purple-200 bg-purple-50 text-purple-700">
              Student Management
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug tracking-tight">
              Complete Student
              <br />
              Lifecycle Management
            </h3>
            <p className="text-gray-500 text-base leading-relaxed">
              From first enrolment to graduation, manage every stage of a
              student's journey with complete data integrity — no spreadsheets,
              no duplicates, no manual errors.
            </p>
            <ul className="space-y-3.5">
              {[
                "Bulk upload via Excel template",
                "Track promotions, transfers & graduations",
                "Linked across classes, subjects, and results",
              ].map((f) => (
                <Bullet key={f} text={f} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
