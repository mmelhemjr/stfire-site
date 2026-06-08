import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

export default function OurStory() {
  const { t } = useTranslation();

  return (
    <div className="pt-16">
      <SEO
        title="Our Story | Saint Fire Chios"
        description="Discover the story behind Saint Fire — a passion project rooted in Chios, built on the beauty of Agia Fotia Beach and the spirit of Greek hospitality."
        canonical="/our-story"
        image="https://imgur.com/QOqiroF.jpg"
      />
      <div className="relative h-[60vh]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://imgur.com/QOqiroF.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white">Our Story</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="prose prose-lg dark:prose-invert mx-auto">
          <p className="text-xl leading-relaxed mb-8">
            Welcome to Saint Fire Chios, a luxury seaside restobar overlooking the crystal waters of Agia Fotia Beach.
          </p>

          <p className="mb-8">
            Saint Fire is more than a destination—it's a passion project brought to life by three local 
            families who have cherished this coastline for generations. Inspired by the raw beauty of the 
            Aegean Sea and Greece's rich culinary heritage, we set out to create an elevated yet welcoming 
            experience for both locals and travelers.
          </p>

          <p className="mb-8">
            At Saint Fire, we blend exceptional hospitality, refined ambiance, and contemporary Greek Fusion 
            cuisine crafted from the freshest local ingredients. Whether you're joining us for a leisurely 
            lunch by the sea, sunset cocktails, or an unforgettable dinner under the stars, Saint Fire offers 
            a place where fire, sea, and earth come together in perfect harmony.
          </p>

          <p className="mb-8">
            More than a restaurant, Saint Fire is a celebration of Chios, its people, and the timeless beauty of the Mediterranean.
          </p>

          <p className="text-xl font-semibold text-sf-gold">
            Come discover your fire with us.
          </p>
        </div>
      </div>
    </div>
  );
}