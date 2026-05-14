/**
 * SEO Schema Definitions and Utilities
 * Schema.org structured data for improved search engine understanding
 */

/**
 * Organization schema for e-Results GH
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'e-Results GH',
  url: 'https://eresultsgh.com',
  logo: 'https://eresultsgh.com/ERESULTS_LOGO.png',
  description: "Ghana's leading SaaS platform for school administration and results management",
  sameAs: [
    'https://twitter.com/eresultsgh',
    'https://facebook.com/eresultsgh',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@eresultsgh.com',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'GH',
    addressLocality: 'Ghana',
  },
};

/**
 * Website schema with search action
 */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: 'https://eresultsgh.com',
  name: 'e-Results GH',
  description: "Ghana's leading school management and results platform",
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://eresultsgh.com/search?q={search_term_string}',
    },
    query_input: 'required name=search_term_string',
  },
};

/**
 * LocalBusiness schema for Ghana operations
 */
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'e-Results GH',
  image: 'https://eresultsgh.com/ERESULTS_LOGO.png',
  description: 'School Management and Results Platform',
  url: 'https://eresultsgh.com',
  areaServed: 'GH',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'Ghana',
  },
  priceRange: '$$',
  serviceType: 'School Management Software',
};

/**
 * Product/SoftwareApplication schema
 */
export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'e-Results GH',
  description: "Ghana's most advanced school management and grading platform",
  url: 'https://eresultsgh.com',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GHS',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '120',
  },
};

/**
 * Breadcrumb schema for navigation
 */
export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export const createBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
};

/**
 * FAQ schema for FAQ pages
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export const createFAQSchema = (items: FAQItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
};

/**
 * Review/Rating schema
 */
export interface ReviewItem {
  author: string;
  description: string;
  rating: number;
}

export const createReviewSchema = (items: ReviewItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    ratingValue: (
      items.reduce((sum, item) => sum + item.rating, 0) / items.length
    ).toFixed(1),
    ratingCount: items.length,
    bestRating: 5,
    worstRating: 1,
  };
};
