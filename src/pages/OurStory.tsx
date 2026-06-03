import React from 'react';
import { useTranslation } from 'react-i18next';

export default function OurStory() {
  const { t } = useTranslation();

  return (
    <div className="pt-16">
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
            Welcome to Saint Fire Chios, the island's first high-end seaside restobar, where luxury meets 
            the untamed beauty of Agia Fotia beach.
          </p>

          <p className="mb-8">
            Saint Fire is more than a destination—it's a passion project brought to life by three local 
            families who have cherished this coastline for generations. Inspired by the raw, natural beauty 
            of the Aegean and the rich culinary traditions of Greece, we set out to create an elevated yet 
            welcoming experience for both locals and travelers alike.
          </p>

          <p className="mb-8">
            At Saint Fire, we blend exceptional service, refined ambiance, and Greek Fusion cuisine, crafted 
            with the freshest local ingredients. Whether you're here for a leisurely seaside lunch, a sunset 
            cocktail, or an unforgettable dining experience under the stars, Saint Fire offers a sanctuary 
            where the elements of fire, sea, and earth come together in perfect harmony.
          </p>

          <p className="text-xl font-semibold text-sf-gold">
            Come discover your fire with us.
          </p>
        </div>
      </div>
    </div>
  );
}