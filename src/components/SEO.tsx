import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  /** Full URL to the OG image — will be added in Session 2 */
  image?: string;
}

const SITE_NAME = 'Saint Fire';
const DEFAULT_IMAGE = 'https://imgur.com/QOqiroF.jpg';

export default function SEO({ title, description, canonical, image = DEFAULT_IMAGE }: SEOProps) {
  const fullUrl = `https://saintfire.com${canonical}`;

  return (
    <Helmet>
      {/* Core */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
