import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X } from 'lucide-react';

interface LanguageSelectorProps {
  onClose: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onClose }) => {
  const { t, setLanguage, language } = useLanguage();

  const languages = [
    { code: 'id' as const, name: 'Indonesia', flag: '🇮🇩' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'jp' as const, name: '日本語', flag: '🇯🇵' },
  ];

  const handleSelect = (code: 'id' | 'en' | 'jp') => {
    setLanguage(code);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="glass-panel p-8 rounded-lg max-w-md w-full mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-pixel text-lg text-primary neon-text">
            {t('selectLanguage')}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Language Options */}
        <div className="flex flex-col gap-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                language === lang.code
                  ? 'bg-primary/20 border-2 border-primary'
                  : 'bg-muted/50 border-2 border-transparent hover:border-primary/50'
              }`}
            >
              <span className="text-3xl">{lang.flag}</span>
              <span className="font-orbitron text-lg text-foreground">
                {lang.name}
              </span>
              {language === lang.code && (
                <span className="ml-auto text-primary font-pixel text-xs">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
