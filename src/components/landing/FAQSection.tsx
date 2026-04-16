import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is e-Results GH?",
    a: "e-Results GH is a purpose-built school management platform for Ghanaian schools. It provides BECE-standard grading, instant report sheet generation, student lifecycle management, mock exam administration, teacher portals, and powerful analytics — all in one secure, cloud-based system designed around the realities of Ghana Education Service requirements.",
  },
  {
    q: "How does the 14-day free trial work?",
    a: "When you sign up, you get full access to all platform features for 14 days with a cap of 10 students — no payment or credit card required. After the trial, the platform enters a Soft-Lock state: your school's data is fully preserved and viewable, but new entries and edits are paused until an active subscription is in place. You can activate your plan at any point during or after the trial.",
  },
  {
    q: "How is pricing calculated?",
    a: "Pricing is a simple flat rate of GHS 2.00 per registered student, billed annually. You only pay for the students you register — no hidden fees, no tiers. The more students you have, the more value you get from the platform.",
  },
  {
    q: "Can I pay with Mobile Money?",
    a: "Yes. We support MTN Mobile Money, AirtelTigo Money, and Telecel Cash via our Paystack payment integration. Bank card (Visa/Mastercard) payments are also accepted. All transactions are processed securely through Paystack's encrypted payment gateway.",
  },
  {
    q: "What happens when my student limit is reached?",
    a: "When your plan's registered student limit is reached, you'll receive an in-app notification prompting you to upgrade to the next tier or purchase a top-up allocation. Top-ups are prorated — you only pay for the remaining months in your current subscription year, so you're never overcharged.",
  },
  {
    q: "Is my school's data secure?",
    a: "Absolutely. Your school's data is hosted on Supabase cloud infrastructure with row-level security policies, encryption at rest, and strict data isolation between schools. No other school, administrator, or third party can access your data. We follow industry best practices for data protection and privacy.",
  },
  {
    q: "Can teachers access the platform too?",
    a: "Yes. e-Results GH has granular role-based access control. Headmasters and admins have full platform control, while teachers can be granted scoped access to enter and review scores for their specific assigned classes and subjects only — without the ability to view or modify any other school data or administrative settings.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 mb-4">
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-gray-500 max-w-lg mx-auto">
            Everything you need to know before getting started. Can't find the
            answer you're looking for?{" "}
            <a
              href="mailto:support@eresultsgh.com"
              className="text-[#2563EB] font-medium hover:underline"
            >
              Reach out to us.
            </a>
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-gray-200 rounded-xl px-5 bg-gray-50/60 shadow-sm hover:shadow-md hover:border-blue-100 hover:bg-white transition-all duration-200 data-[state=open]:border-blue-200 data-[state=open]:bg-white data-[state=open]:shadow-md"
            >
              <AccordionTrigger className="text-sm font-semibold text-gray-900 text-left hover:no-underline py-5 gap-4 [&[data-state=open]]:text-[#2563EB]">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-500 leading-relaxed pb-5 pr-6">
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
