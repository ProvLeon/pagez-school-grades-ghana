const testimonials = [
  {
    initials: "EA",
    color: "bg-blue-600",
    name: "Emmanuel Asante",
    role: "Headmaster, Asante Preparatory School",
    quote:
      "e-Results GH has completely transformed how we manage our end-of-term results. What used to take our admin staff two full days now takes under twenty minutes. The report sheets look incredibly professional — parents are genuinely impressed.",
  },
  {
    initials: "AM",
    color: "bg-purple-600",
    name: "Abena Mensah",
    role: "Vice-Principal, Ridge International School, Kumasi",
    quote:
      "The BECE-standard grading system is spot-on. I was skeptical at first, but the accuracy and speed of report generation won me over completely. Our teachers love it too — entering scores is simple and straightforward.",
  },
  {
    initials: "KB",
    color: "bg-emerald-600",
    name: "Kwame Boateng",
    role: "Admin, Apam Anglican JHS",
    quote:
      "Setting up mock exams and publishing results to parents has never been this easy. The platform is very straightforward and the support team responds quickly whenever we have a question. Highly dependable.",
  },
  {
    initials: "AF",
    color: "bg-rose-600",
    name: "Akosua Frempong",
    role: "Class Teacher, St. Joseph's RC School",
    quote:
      "As a teacher, I can enter my class scores directly without going through the admin office. The interface is clean and nothing is confusing. It has saved me so much time every term.",
  },
  {
    initials: "YD",
    color: "bg-orange-500",
    name: "Yaw Darko",
    role: "Admin, Techiman D/A Primary",
    quote:
      "The 30-day free trial gave us plenty of time to test everything before committing. The pricing is very fair for what you get — we pay less than we were spending on printing alone. I recommend it to every school head I meet.",
  },
];

const StarRating = () => (
  <div className="flex items-center gap-0.5 mb-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 mb-4">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Trusted by Schools Across Ghana
          </h2>
          <p className="mt-4 text-base text-gray-500 max-w-lg mx-auto">
            Hear from headmasters, admins, and teachers who've made the switch
            to smarter results management.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {testimonials.map(({ initials, color, name, role, quote }) => (
            <div
              key={name}
              className="break-inside-avoid mb-6 bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200"
            >
              {/* Star rating */}
              <StarRating />

              {/* Quote */}
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                &ldquo;{quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div
                  className={`w-9 h-9 rounded-full ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <span className="text-xs font-bold text-white tracking-wide">
                    {initials}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 leading-tight truncate">
                    {name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-tight truncate">
                    {role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
