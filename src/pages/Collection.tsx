import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HotelInterestModal from '../components/HotelInterestModal';

const IMG = {
  hotelBg:       'https://static.wixstatic.com/media/06c297_2e8a7d3ef2b247229de93c4fd14576dc~mv2.jpg',
  hotelLogo:     'https://static.wixstatic.com/media/06c297_e53e502420a34e65acc160de89758174~mv2.png',
  restaurantBg:  'https://static.wixstatic.com/media/06c297_cf9f25135e2a418da23a5e60cbfbc2df~mv2.jpg',
  restaurantLogo:'https://static.wixstatic.com/media/06c297_cc78df23d53a420c93eca9af3821d561~mv2.png',
  editorial:     'https://static.wixstatic.com/media/06c297_7059f59f5f5f41d3b10bfd9b88c542e5~mv2.png',
};

const DISPLAY: React.CSSProperties = { fontFamily: "SaintFireDisplay, 'Cormorant Garamond', serif" };
const BODY: React.CSSProperties    = { fontFamily: "SaintFireBody, Inter, sans-serif" };

const Collection = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ backgroundColor: '#F8F4EF', ...BODY }}>

      {/* ── Hotel + Restaurant: stacked on mobile, side by side on desktop ── */}
      <div className="flex flex-col md:flex-row md:h-screen">

        {/* Hotel */}
        <div className="relative w-full md:w-1/2 h-[65vh] md:h-full">
          <img src={IMG.hotelBg} alt="Saint Fire Hotel" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.38)' }} />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <div className="flex items-end justify-center mb-6" style={{ height: '130px' }}>
              <img src={IMG.hotelLogo} alt="Saint Fire Hotel" style={{ filter: 'brightness(0) invert(1)', maxHeight: '130px', maxWidth: '200px', objectFit: 'contain' }} />
            </div>
            <Link to="/hotel" className="whitespace-nowrap text-xs text-white border border-white/80 px-6 py-3 hover:bg-white hover:text-black transition-colors mb-4" style={{ letterSpacing: '0.22em' }}>
              TAKE A LOOK
            </Link>
            <p className="text-white/60 text-xs whitespace-nowrap" style={{ letterSpacing: '0.22em' }}>COMING SUMMER 2027</p>
          </div>
        </div>

        {/* Divider — horizontal on mobile, vertical on desktop */}
        <div className="md:w-px md:h-auto h-px w-full bg-white/30 z-10" />

        {/* Restaurant */}
        <div className="relative w-full md:w-1/2 h-[65vh] md:h-full">
          <img src={IMG.restaurantBg} alt="Saint Fire Seaside Restaurant & Bar" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.38)' }} />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <div className="flex items-end justify-center mb-6" style={{ height: '130px' }}>
              <img src={IMG.restaurantLogo} alt="Saint Fire Restaurant" style={{ filter: 'brightness(0) invert(1)', maxHeight: '130px', maxWidth: '200px', objectFit: 'contain' }} />
            </div>
            <Link to="/home" className="whitespace-nowrap text-xs text-white border border-white/80 px-6 py-3 hover:bg-white hover:text-black transition-colors mb-4" style={{ letterSpacing: '0.22em' }}>
              VISIT THE WEBSITE
            </Link>
            <p className="text-xs whitespace-nowrap" style={{ letterSpacing: '0.22em', color: 'transparent' }}>COMING SUMMER 2027</p>
          </div>
        </div>

      </div>

      {/* ── Editorial: text left, image right ── */}
      <div className="grid md:grid-cols-2 min-h-[520px]">
        <div className="flex flex-col justify-center px-14 py-20">
          <h2
            className="text-4xl md:text-5xl font-light mb-10 leading-snug"
            style={{ ...DISPLAY, color: '#1C2040' }}
          >
            Enter the world<br />of Saint Fire
          </h2>
          <div className="space-y-5 text-base leading-relaxed font-light" style={{ color: '#555' }}>
            <p>
              Saint Fire began as a seaside experience in Chios — a place for sunlit lunches, golden-hour
              drinks, music and the rhythm of summer by the water.
            </p>
            <p>Now, that world is expanding.</p>
            <p>
              The Saint Fire Collection brings together the existing Seaside Restaurant &amp; Bar with the
              upcoming Beachfront Lifestyle Hotel, creating a complete coastal destination shaped by design,
              shared moments and a new way of living well by the sea.
            </p>
            <p>
              The first chapter is already here.<br />
              The new chapter arrives in Summer 2027.
            </p>
          </div>
        </div>
        <div>
          <img
            src={IMG.editorial}
            alt="Saint Fire Collection"
            className="w-full h-full object-cover"
            style={{ minHeight: '480px' }}
          />
        </div>
      </div>

      {/* ── Be the First to Stay ── */}
      <div className="py-24 px-8 text-center" style={{ backgroundColor: '#EDE8DC' }}>
        <h2
          className="text-4xl md:text-5xl font-light mb-4"
          style={{ ...DISPLAY, color: '#1A1A1A' }}
        >
          Be the First to Stay
        </h2>
        <p className="text-base max-w-md mx-auto mb-10 font-light leading-relaxed" style={{ color: '#666' }}>
          Receive opening news, exclusive previews, and early updates from the next chapter of Saint Fire.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="px-12 py-4 text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
          style={{ backgroundColor: '#1C2040', color: '#F8F4EF', letterSpacing: '0.2em' }}
        >
          Join the Flame
        </button>
      </div>

      {/* ── Navy brand footer ── */}
      <div className="flex items-center justify-center py-14" style={{ backgroundColor: '#1C2040' }}>
        <img
          src="https://static.wixstatic.com/media/06c297_f1e1e170f0974f1b8063a727a9a8e1bf~mv2.png"
          alt="Saint Fire"
          className="w-44 object-contain"
          style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }}
        />
      </div>

      <HotelInterestModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Collection;
