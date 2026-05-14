import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Schema } from './Schema';
import { createBreadcrumbSchema, type BreadcrumbItem } from './schemas';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * SEO-optimized breadcrumb component with schema markup
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
}) => {
  // Filter out home item as it's implied
  const displayItems = items.filter((item) => item.name !== 'Home');

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <>
      <Schema data={createBreadcrumbSchema(items)} />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}
      >
        <Link
          to="/"
          className="hover:text-foreground transition-colors"
          title="Back to home"
        >
          Home
        </Link>
        {displayItems.map((item, index) => (
          <React.Fragment key={`${item.name}-${index}`}>
            <ChevronRight className="w-4 h-4 mx-1" />
            {item.url ? (
              <Link
                to={item.url}
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.name}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
};

export default Breadcrumb;
