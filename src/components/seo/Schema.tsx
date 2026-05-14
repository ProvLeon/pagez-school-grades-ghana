import React from 'react';

/**
 * Renders structured data (JSON-LD) in the document head.
 * This helps search engines understand your content better.
 */
interface SchemaProps {
  data: Record<string, unknown>;
}

export const Schema: React.FC<SchemaProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
};

export default Schema;
