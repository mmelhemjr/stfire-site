import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExternalLink, FileText } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { menuPdfs, getMenuPdfUrl } from '../data/menuPdfs';
import SEO from '../components/SEO';

export default function Menu() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className="pt-16 min-h-screen">
      <SEO
        title="Our Menu | Saint Fire Chios"
        description="Explore the Saint Fire menu — Mediterranean dishes, fresh seafood, signature cocktails, and curated wines on Agia Fotia Beach, Chios."
        canonical="/menu"
        image="https://imgur.com/rCHhU9U.jpg"
      />
      <div className="relative h-[60vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://imgur.com/rCHhU9U.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white">{t('menu.title')}</h1>
          <p className="text-lg md:text-xl text-white/90 mt-4 max-w-2xl">{t('menu.pdf_subtitle')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {menuPdfs.map((pdf, index) => {
            const Icon = pdf.icon;
            const href = getMenuPdfUrl(pdf.file);

            return (
              <motion.a
                key={pdf.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + index * 0.06 }}
                className={`glass-morphism flex items-center gap-5 p-6 rounded-xl group transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800/40'
                    : 'hover:bg-gray-50/80'
                }`}
              >
                <div className="flex-shrink-0 h-14 w-14 rounded-lg bg-sf-gold/20 flex items-center justify-center text-sf-gold group-hover:bg-sf-gold/30 transition-colors">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h2 className="text-xl font-bold group-hover:text-sf-gold transition-colors">
                    {t(pdf.titleKey)}
                  </h2>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t(pdf.descriptionKey)}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 text-sf-gold opacity-80 group-hover:opacity-100 transition-opacity">
                  <FileText className="h-5 w-5" />
                  <ExternalLink className="h-5 w-5" />
                </div>
              </motion.a>
            );
          })}
        </motion.div>

        <p className={`text-center text-sm mt-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          {t('menu.pdf_hint')}
        </p>
      </div>
    </div>
  );
}
