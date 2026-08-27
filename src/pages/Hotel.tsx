import React, { useState } from 'react';
import HotelInterestModal from '../components/HotelInterestModal';

const IMAGES = {
  hero: 'https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/Hotel%20overview.png',
  pool: 'https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/Eye%20Level%20Pool.png',
  room: 'https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/Room.png',
  living: 'https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/Living%20space%20.png',
  privatePool: 'https://lpwzdmgonrsopihvhohj.supabase.co/storage/v1/object/public/2026%20Photos/private%20pool%20room.png',
};

const Hotel = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="pt-16 bg-sf-black text-white">

      {/* ── Hero ── */}
      <div className="relative h-screen min-h-[600px]">
        <img
          src={IMAGES.hero}
          alt="Saint Fire Hotel aerial view"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <p className="text-sf-gold text-sm tracking-[0.3em] uppercase mb-6">Coming Summer 2027</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-tight mb-8">
            A New Chapter of the Saint Fire Collection
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed">
            A vibrant beachfront lifestyle hotel in Chios, where life by the sea introduces a new form of wellbeing.
          </p>
        </div>
      </div>

      {/* ── The Next Chapter ── */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sf-gold text-xs tracking-[0.3em] uppercase mb-4">The Saint Fire Collection</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-snug">
              The Next Chapter of<br />the Saint Fire Collection
            </h2>
            <div className="space-y-5 text-gray-300 leading-relaxed">
              <p>
                The new addition to Saint Fire Collection introduces a contemporary beachfront hotel in Chios, expanding the spirit of Saint Fire Seaside Restaurant & Bar into a fuller way of staying.
              </p>
              <p>
                Rooted in the island's coastline and shaped by its deep relationship with the water, the hotel brings together design, hospitality, gastronomy, and social energy into one complete coastal destination.
              </p>
              <p>
                It is a new chapter for Saint Fire, created for guests who want to experience the island through comfort, atmosphere, taste, and the generous simplicity of life by the sea.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src={IMAGES.pool}
              alt="Saint Fire Hotel pool"
              className="w-full aspect-[3/4] object-cover rounded-lg"
            />
            <img
              src={IMAGES.room}
              alt="Saint Fire Hotel room"
              className="w-full aspect-[3/4] object-cover rounded-lg mt-8"
            />
          </div>
        </div>
      </div>

      {/* ── Full-width image strip ── */}
      <div className="grid grid-cols-3 h-[50vh]">
        <img src={IMAGES.living} alt="Suite living space" className="w-full h-full object-cover" />
        <img src={IMAGES.privatePool} alt="Private pool suite" className="w-full h-full object-cover" />
        <img src={IMAGES.pool} alt="Hotel pool" className="w-full h-full object-cover" />
      </div>

      {/* ── Island Soul. Seaside Rhythm. ── */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <img
              src={IMAGES.privatePool}
              alt="Saint Fire Hotel private pool suite"
              className="w-full aspect-video object-cover rounded-lg"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-sf-gold text-xs tracking-[0.3em] uppercase mb-4">The Experience</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-snug">
              Island Soul.<br />Seaside Rhythm.
            </h2>
            <div className="space-y-5 text-gray-300 leading-relaxed">
              <p className="text-lg font-medium text-white">
                A design-forward beachfront hotel in Chios combining private suites and vibrant beach culture, where modern comfort and coastal rhythm shape a new way of living well by the sea.
              </p>
              <p>
                Here, each day unfolds with natural ease. Mornings begin with light, sea air, and slow rituals of care. Afternoons move between the beach, the pool, and shared tables. Evenings gather around cocktails, music, and the warmth of island life.
              </p>
              <p>
                Saint Fire Hotel creates a way of living that feels open, social, and grounded in place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Room Types ── */}
      <div className="border-t border-white/10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sf-gold text-xs tracking-[0.3em] uppercase mb-4 text-center">Accommodations</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Where You Stay</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                img: IMAGES.room,
                imgClass: 'object-cover object-top',
                title: 'Deluxe Sea View',
                desc: 'A beautifully appointed room featuring a private balcony with sweeping views of the Aegean Sea, refined interiors, and premium amenities for a truly restful stay.',
              },
              {
                img: IMAGES.living,
                imgClass: 'object-cover',
                title: 'Junior Suite',
                desc: 'An elegantly designed suite with a separate living area, private hot tub, and premium amenities — perfect for those seeking comfort and indulgence by the sea.',
              },
              {
                img: IMAGES.privatePool,
                imgClass: 'object-cover',
                title: 'Executive Suite',
                desc: 'Our most prestigious accommodation, featuring a private pool, panoramic Aegean views, a private terrace, and an elevated level of luxury and personalized service.',
              },
            ].map(room => (
              <div key={room.title} className="group">
                <div className="overflow-hidden rounded-lg mb-5 aspect-[4/3]">
                  <img
                    src={room.img}
                    alt={room.title}
                    className={`w-full h-full ${room.imgClass} group-hover:scale-105 transition-transform duration-700`}
                  />
                </div>
                <h3 className="text-xl font-bold mb-3">{room.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{room.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Be the First to Know CTA ── */}
      <div className="relative py-32 overflow-hidden">
        <img
          src={IMAGES.pool}
          alt="Saint Fire Hotel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative text-center px-6">
          <p className="text-sf-gold text-xs tracking-[0.3em] uppercase mb-4">Priority Access</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Be the First to Know</h2>
          <p className="text-gray-300 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
            Receive opening news, exclusive previews, and early updates from the next chapter of Saint Fire.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-sf-gold text-black px-12 py-4 rounded-lg font-semibold text-lg hover:bg-sf-gold/90 transition-colors"
          >
            Join the Flame
          </button>
        </div>
      </div>

      <HotelInterestModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Hotel;
