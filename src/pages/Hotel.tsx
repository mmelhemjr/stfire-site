import React, { useState } from 'react';
import HotelInterestModal from '../components/HotelInterestModal';

// Full-size images pulled directly from the Wix reference site
const WIX = {
  hero:  'https://static.wixstatic.com/media/06c297_ec7a6bbc93ed4508addca4083e177eed~mv2.jpg',
  img4:  'https://static.wixstatic.com/media/06c297_67cc2175bd7b4d1192b2ab11a95f5373~mv2.png',
  img11: 'https://static.wixstatic.com/media/06c297_35d3026055e7449b893d2fa5a39b6173~mv2.png',
  img9:  'https://static.wixstatic.com/media/06c297_95947b917c624f1292a8fb051a6ecb6e~mv2.png',
  img8:  'https://static.wixstatic.com/media/06c297_82091cdc0733473fb9ec2cb6d8ea46ce~mv2.png',
  img2:  'https://static.wixstatic.com/media/06c297_8d8c3ce0dbfb4da4bf255c97e68468b5~mv2.png',
  img5:  'https://static.wixstatic.com/media/06c297_523f6801239142b09e62ca49dca6ad85~mv2.png',
  img13: 'https://static.wixstatic.com/media/06c297_cadae10d790a4b239da5dfb4b6738a03~mv2.png',
};

const Hotel = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="pt-16" style={{ backgroundColor: '#F8F4EF', color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Hero ── */}
      <div className="relative h-screen min-h-[600px]">
        <img
          src={WIX.hero}
          alt="Saint Fire Hotel – Coming Summer 2027"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-8 leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.02em' }}
          >
            Coming Summer 2027
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl leading-relaxed font-light tracking-wide">
            A vibrant beachfront lifestyle hotel in Chios, where life by the sea introduces a new form of wellbeing.
          </p>
        </div>
      </div>

      {/* ── Two images ── */}
      <div className="grid grid-cols-2">
        <img
          src={WIX.img4}
          alt="Saint Fire Hotel exterior"
          className="w-full aspect-video object-cover"
        />
        <img
          src={WIX.img11}
          alt="Saint Fire Hotel pool area"
          className="w-full aspect-video object-cover"
        />
      </div>

      {/* ── The Next Chapter ── */}
      <div className="max-w-3xl mx-auto px-8 py-24 text-center">
        <h2
          className="text-4xl md:text-5xl font-light mb-12 leading-snug"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          The Next Chapter of<br />the Saint Fire Collection
        </h2>
        <div className="space-y-6 text-gray-600 text-lg leading-relaxed font-light">
          <p>
            The new addition to Saint Fire Collection introduces a contemporary beachfront hotel in Chios,
            expanding the spirit of Saint Fire Seaside Restaurant &amp; Bar into a fuller way of staying.
          </p>
          <p>
            Rooted in the island's coastline and shaped by its deep relationship with the water, the hotel
            brings together design, hospitality, gastronomy, and social energy into one complete coastal destination.
          </p>
          <p>
            It is a new chapter for Saint Fire, created for guests who want to experience the island through
            comfort, atmosphere, taste, and the generous simplicity of life by the sea.
          </p>
        </div>
      </div>

      {/* ── Four-image grid ── */}
      <div className="grid grid-cols-2">
        <img src={WIX.img9} alt="Saint Fire Hotel" className="w-full aspect-video object-cover" />
        <img src={WIX.img8} alt="Saint Fire Hotel" className="w-full aspect-video object-cover" />
        <img src={WIX.img2} alt="Saint Fire Hotel" className="w-full aspect-video object-cover" />
        <img src={WIX.img5} alt="Saint Fire Hotel" className="w-full aspect-video object-cover" />
      </div>

      {/* ── Island Soul. Seaside Rhythm. ── */}
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <h2
              className="text-4xl md:text-5xl font-light mb-8 leading-snug"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Island Soul.<br />Seaside Rhythm.
            </h2>
            <div className="space-y-5 text-gray-600 text-lg leading-relaxed font-light">
              <p>
                A design-forward beachfront hotel in Chios combining private suites and vibrant beach culture,
                where modern comfort and coastal rhythm shape a new way of living well by the sea.
              </p>
              <p>
                Here, each day unfolds with natural ease. Mornings begin with light, sea air, and slow rituals
                of care. Afternoons move between the beach, the pool, and shared tables. Evenings gather around
                cocktails, music, and the warmth of island life.
              </p>
              <p>
                Saint Fire Hotel creates a way of living that feels open, social, and grounded in place.
              </p>
            </div>
          </div>
          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <img src={WIX.img13} alt="Saint Fire Hotel suite" className="w-full aspect-[3/4] object-cover" />
            <img src={WIX.img9}  alt="Saint Fire Hotel pool" className="w-full aspect-[3/4] object-cover mt-10" />
          </div>
        </div>
      </div>

      {/* ── Be the First to Know ── */}
      <div
        className="py-24 px-8 text-center"
        style={{ backgroundColor: '#EDE8E0', borderTop: '1px solid #DDD6CA' }}
      >
        <h2
          className="text-4xl md:text-5xl font-light mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Be the First to Know
        </h2>
        <p className="text-gray-500 text-lg max-w-md mx-auto mb-10 font-light leading-relaxed">
          Receive opening news, exclusive previews, and early updates from the next chapter of Saint Fire.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="px-12 py-4 text-sm tracking-widest uppercase font-medium transition-colors"
          style={{
            backgroundColor: '#1A1A1A',
            color: '#F8F4EF',
            letterSpacing: '0.2em',
          }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = '#333')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
        >
          Join the Flame
        </button>
      </div>

      <HotelInterestModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Hotel;
