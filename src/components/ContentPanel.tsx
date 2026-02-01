import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAudio } from '@/contexts/AudioContext';
import { usePotatoMode } from '@/contexts/PotatoModeContext';
import { X, ExternalLink, Play, Award, Github, Youtube, Instagram, ChevronRight, Sparkles, Zap, Code, Gamepad2, Globe, Star, Rocket, Terminal } from 'lucide-react';

// Import images from src/assets
import profileIcon from '@/assets/Icon_Zidane.png';
// Uncomment when files are added:
// import certVeirtech from '@/assets/cert-veirtech.png';
// import certHadroh from '@/assets/cert-hadroh.png';
// import certJapanese from '@/assets/cert-japanese.png';

// Game thumbnail images
const gameThumbnails: { [key: string]: string } = {
  '2D Frits': 'https://img.itch.zone/aW1nLzExMDk3MTc3LnBuZw==/315x250%23c/o8kJzz.png',
  'Space Shot': 'https://img.itch.zone/aW1nLzE4NjA2NTM4LnBuZw==/315x250%23c/S60CGg.png',
  'Zidane World Nexus': 'https://img.itch.zone/aW1nLzIyNjk1MTcyLnBuZw==/315x250%23c/YSCpEs.png',
  'Eco Love': 'https://img.itch.zone/aW1nLzIyNjYyMTMwLnBuZw==/315x250%23c/nwso5r.png',
};

interface ContentItem {
  title: string;
  description: string;
  url?: string;
  type: 'game' | 'web' | 'certificate' | 'social';
  embed?: boolean;
  imageKey?: string;
}

interface ContentPanelProps {
  contentType: string;
  onClose: () => void;
}

// VHS Glitch overlay component
const VHSGlitchOverlay = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,hsl(var(--primary)/0.03)_2px,hsl(var(--primary)/0.03)_4px)]" />
      
      {/* Glitch bars */}
      <div className="absolute w-full h-2 bg-primary/20 animate-[glitch-panel_0.3s_ease-out]" style={{ top: '20%' }} />
      <div className="absolute w-full h-1 bg-secondary/30 animate-[glitch-panel_0.4s_ease-out_0.1s]" style={{ top: '60%' }} />
      <div className="absolute w-full h-3 bg-accent/10 animate-[glitch-panel_0.35s_ease-out_0.05s]" style={{ top: '80%' }} />
      
      {/* Color aberration */}
      <div className="absolute inset-0 mix-blend-color-dodge opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-transparent to-secondary/50 animate-[vhs-distort_0.4s_ease-out]" />
      </div>
    </div>
  );
};

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/50 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

// Interactive skill bar component
const SkillBar = ({ name, level, color, delay }: { name: string; level: number; color: string; delay: number }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(level), delay);
    return () => clearTimeout(timer);
  }, [level, delay]);

  return (
    <div className="group cursor-pointer">
      <div className="flex justify-between items-center mb-1">
        <span className="font-orbitron text-xs text-foreground group-hover:text-primary transition-colors">{name}</span>
        <span className="font-pixel text-xs text-muted-foreground">{level}%</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden border border-border">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${width}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Interactive card with hover effects
const InteractiveCard = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl transition-all duration-300 ${isHovered ? 'scale-[1.02] shadow-2xl' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Spotlight effect */}
      {isHovered && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.15), transparent)`,
            inset: 0,
          }}
        />
      )}
      {/* Border glow */}
      <div className={`absolute inset-0 rounded-xl border-2 transition-all duration-300 ${isHovered ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)]' : 'border-primary/20'}`} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Typing animation text
const TypewriterText = ({ text, delay = 50 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, delay]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const ContentPanel: React.FC<ContentPanelProps> = ({ contentType, onClose }) => {
  const { t } = useLanguage();
  const { playClickSound, playHoverSound } = useAudio();
  const { isPotatoMode } = usePotatoMode();
  const [activeTab, setActiveTab] = useState(0);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [showGlitch, setShowGlitch] = useState(!isPotatoMode);
  const [isEntering, setIsEntering] = useState(true);

  // Trigger glitch effect on mount and content change - skip in potato mode
  useEffect(() => {
    if (!isPotatoMode) {
      setShowGlitch(true);
      const glitchTimer = setTimeout(() => setShowGlitch(false), 600);
      return () => clearTimeout(glitchTimer);
    }
    setIsEntering(true);
    const enterTimer = setTimeout(() => setIsEntering(false), isPotatoMode ? 200 : 800);
    return () => clearTimeout(enterTimer);
  }, [contentType, isPotatoMode]);

  // Certificate images mapping - user will add these to src/assets
  const certificateImages: { [key: string]: string | null } = {
    veirtech: null, // Replace with: certVeirtech
    hadroh: null,   // Replace with: certHadroh
    japanese: null, // Replace with: certJapanese
  };

  // Profile image
  const profileImage: string | null = profileIcon;

  const getContent = (): { title: string; items: ContentItem[] } => {
    switch (contentType) {
      case 'about':
        return { title: t('aboutMe'), items: [] };
      case 'skills':
        return { title: t('skills'), items: [] };
      case 'games':
        return {
          title: t('gameProjects'),
          items: [
            { title: '2D Frits', description: t('game2DFrits'), url: 'https://zidandev.itch.io/2d-frits-020-inv', type: 'game', embed: true },
            { title: 'Space Shot', description: t('gameSpaceShot'), url: 'https://zidandev.itch.io/thats-trash', type: 'game', embed: true },
            { title: 'Zidane World Nexus', description: t('gameZidaneWorld'), url: 'https://zidandev.itch.io/zidane-world-nexus', type: 'game', embed: true },
            { title: 'Eco Love', description: t('gameEcoLove'), url: 'https://zidandev.itch.io/eco-love', type: 'game', embed: true },
          ],
        };
      case 'web':
        return {
          title: t('webProjects'),
          items: [
            { title: 'Environtment', description: t('webEnvironment'), url: 'https://sekolah-sehat.vercel.app/', type: 'web', embed: true },
            { title: 'GlobalVista', description: t('webGlobalVista'), url: 'https://lomba-rho.vercel.app/', type: 'web', embed: true },
            { title: 'VeirTech', description: t('webVeirTech'), url: 'https://veirtech.vercel.app/', type: 'web', embed: true },
            { title: 'SACG', description: t('webSACG'), url: 'https://sacg2.vercel.app/', type: 'web', embed: true },
          ],
        };
      case 'certificates':
        return {
          title: t('certificates'),
          items: [
            { title: 'VeirTech', description: t('certVeirTech'), type: 'certificate', imageKey: 'veirtech' },
            { title: 'Hadroh', description: t('certHadroh'), type: 'certificate', imageKey: 'hadroh' },
            { title: 'Japanese', description: t('certJapan'), type: 'certificate', imageKey: 'japanese' },
          ],
        };
      case 'social':
        return {
          title: t('socialMedia'),
          items: [
            { title: 'YouTube', description: t('youtube'), url: 'https://www.youtube.com/@Zidaneangamer8', type: 'social' },
            { title: 'Instagram', description: t('instagram'), url: 'https://www.instagram.com/zidanean.gamer/', type: 'social' },
            { title: 'GitHub', description: t('github'), url: 'https://github.com/Zidandev', type: 'social' },
            { title: 'itch.io', description: t('itchio'), url: 'https://zidandev.itch.io/', type: 'social' },
          ],
        };
      default:
        return { title: '', items: [] };
    }
  };

  const content = getContent();
  
  const skillsData = {
    gameEngines: [
      { name: 'Unity', level: 85 },
      { name: 'Godot', level: 75 },
    ],
    webDev: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'Tailwind CSS', level: 95 },
      { name: 'Vite', level: 80 },
      { name: 'HTML5/CSS3', level: 95 },
    ],
    languages: [
      { name: 'JavaScript', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'PHP', level: 70 },
      { name: 'Dart', level: 60 },
    ],
  };

  const getSocialIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'github': return <Github className="w-6 h-6" />;
      case 'youtube': return <Youtube className="w-6 h-6" />;
      case 'instagram': return <Instagram className="w-6 h-6" />;
      default: return <ExternalLink className="w-6 h-6" />;
    }
  };

  const getSocialColor = (title: string) => {
    switch (title.toLowerCase()) {
      case 'github': return 'from-gray-600 to-gray-800';
      case 'youtube': return 'from-red-500 to-red-700';
      case 'instagram': return 'from-pink-500 via-purple-500 to-orange-500';
      default: return 'from-primary to-secondary';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
      <div 
        className={`relative glass-panel rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border-2 border-primary/30 ${
          isPotatoMode ? '' : 'shadow-[0_0_50px_hsl(var(--primary)/0.3)] vhs-panel-effect'
        } ${
          isEntering && !isPotatoMode ? 'animate-panel-enter' : ''
        } ${showGlitch && !isPotatoMode ? 'animate-vhs-distort' : ''}`}
      >
        {/* VHS Glitch Overlay - skip in potato mode */}
        {!isPotatoMode && <VHSGlitchOverlay isActive={showGlitch} />}
        
        {/* Animated background - skip in potato mode */}
        {!isPotatoMode && <FloatingParticles />}
        
        {/* Header with neon effect */}
        <div className={`relative flex items-center justify-between p-4 md:p-6 border-b border-primary/30 ${isPotatoMode ? '' : 'bg-gradient-to-r from-primary/10 via-transparent to-secondary/10'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full bg-primary ${isPotatoMode ? '' : 'animate-pulse shadow-[0_0_10px_hsl(var(--primary))]'}`} />
            <h2 
              className={`font-pixel text-sm md:text-lg text-primary ${isPotatoMode ? '' : 'neon-text'} ${showGlitch && !isPotatoMode ? 'animate-chromatic' : ''}`}
              data-text={content.title}
            >
              {content.title}
            </h2>
          </div>
          <button
            onClick={() => { playClickSound(); onClose(); }}
            onMouseEnter={playHoverSound}
            className="group p-2 rounded-full bg-muted hover:bg-destructive/20 transition-all duration-300 border border-primary/30 hover:border-destructive/50"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:text-destructive transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className={`relative p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-80px)] custom-scrollbar ${isEntering && !isPotatoMode ? 'animate-fade-in' : ''}`}>
          
          {/* ABOUT ME - Redesigned */}
          {contentType === 'about' && (
            <div className={`space-y-8 ${showGlitch && !isPotatoMode ? 'animate-glitch-panel' : ''}`}>
              {/* Profile Hero Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 rounded-2xl blur-xl" />
                <InteractiveCard className="bg-card/80 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Profile Image */}
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary bg-muted">
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30">
                            <Rocket className="w-16 h-16 text-primary animate-float" />
                            <p className="absolute bottom-2 text-[8px] font-pixel text-primary/70">muka.png</p>
                          </div>
                        )}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-card shadow-[0_0_10px_#22c55e]" />
                    </div>
                    
                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                      <h3 className="font-orbitron text-2xl md:text-3xl text-primary mb-2 neon-text">
                        Zidane Achmad Nurjayyin
                      </h3>
                      <p className="font-pixel text-sm text-secondary mb-4">@Zidandev</p>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-primary/20 border border-primary/50 rounded-full font-orbitron text-xs text-primary flex items-center gap-1">
                          <Gamepad2 className="w-3 h-3" /> Game Dev
                        </span>
                        <span className="px-3 py-1 bg-secondary/20 border border-secondary/50 rounded-full font-orbitron text-xs text-secondary flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Web Dev
                        </span>
                        <span className="px-3 py-1 bg-accent/20 border border-accent/50 rounded-full font-orbitron text-xs text-accent flex items-center gap-1">
                          <Code className="w-3 h-3" /> Coder
                        </span>
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              </div>

              {/* Interactive Bio Sections */}
              <div className="grid md:grid-cols-2 gap-4">
                <InteractiveCard className="bg-card/60 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="w-5 h-5 text-primary" />
                    <h4 className="font-pixel text-sm text-primary">// About</h4>
                  </div>
                  <p className="font-orbitron text-sm text-muted-foreground leading-relaxed">
                    {t('aboutMeDesc')}
                  </p>
                </InteractiveCard>

                <InteractiveCard className="bg-card/60 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-secondary" />
                    <h4 className="font-pixel text-sm text-secondary">// Passion</h4>
                  </div>
                  <p className="font-orbitron text-sm text-muted-foreground leading-relaxed">
                    {t('passion')}
                  </p>
                </InteractiveCard>

                <InteractiveCard className="bg-card/60 p-5 md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-accent" />
                    <h4 className="font-pixel text-sm text-accent">// Languages</h4>
                  </div>
                  <p className="font-orbitron text-sm text-muted-foreground leading-relaxed">
                    {t('languageSkills')}
                  </p>
                </InteractiveCard>
              </div>

              {/* Stats Counter */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Projects', value: '10+', icon: Rocket },
                  { label: 'Games', value: '4+', icon: Gamepad2 },
                  { label: 'Websites', value: '4+', icon: Globe },
                  { label: 'Certificates', value: '3+', icon: Award },
                ].map((stat, i) => (
                  <InteractiveCard key={i} className="bg-card/60 p-4 text-center">
                    <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-pixel text-lg md:text-xl text-primary">{stat.value}</p>
                    <p className="font-orbitron text-xs text-muted-foreground">{stat.label}</p>
                  </InteractiveCard>
                ))}
              </div>
            </div>
          )}

          {/* SKILLS - With animated bars */}
          {contentType === 'skills' && (
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 p-1 bg-muted rounded-xl border border-primary/20">
                {['Game Engines', 'Web Dev', 'Languages'].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(i); playClickSound(); }}
                    onMouseEnter={playHoverSound}
                    className={`flex-1 py-2 px-4 rounded-lg font-orbitron text-xs transition-all duration-300 ${
                      activeTab === i 
                        ? 'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)]' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Skills Content */}
              <InteractiveCard className="bg-card/60 p-6">
                {activeTab === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <Gamepad2 className="w-6 h-6 text-primary" />
                      <h3 className="font-pixel text-sm text-primary">Game Engines</h3>
                    </div>
                    {skillsData.gameEngines.map((skill, i) => (
                      <SkillBar key={skill.name} {...skill} color="bg-gradient-to-r from-primary to-cyan-400" delay={i * 200} />
                    ))}
                  </div>
                )}
                {activeTab === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <Globe className="w-6 h-6 text-secondary" />
                      <h3 className="font-pixel text-sm text-secondary">Web Development</h3>
                    </div>
                    {skillsData.webDev.map((skill, i) => (
                      <SkillBar key={skill.name} {...skill} color="bg-gradient-to-r from-secondary to-pink-400" delay={i * 150} />
                    ))}
                  </div>
                )}
                {activeTab === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <Code className="w-6 h-6 text-accent" />
                      <h3 className="font-pixel text-sm text-accent">Programming Languages</h3>
                    </div>
                    {skillsData.languages.map((skill, i) => (
                      <SkillBar key={skill.name} {...skill} color="bg-gradient-to-r from-accent to-yellow-400" delay={i * 150} />
                    ))}
                  </div>
                )}
              </InteractiveCard>

              {/* Interactive Tech Stack */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {['React', 'TypeScript', 'Unity', 'Godot', 'Tailwind', 'Vite'].map((tech, i) => (
                  <button
                    key={tech}
                    onClick={playClickSound}
                    onMouseEnter={playHoverSound}
                    className="p-4 bg-card/60 rounded-xl border border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] group"
                  >
                    <p className="font-orbitron text-xs text-muted-foreground group-hover:text-primary transition-colors text-center">
                      {tech}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GAMES & WEB PROJECTS - Redesigned */}
          {(contentType === 'games' || contentType === 'web') && (
            <div className="space-y-6">
              {content.items.map((item, index) => (
                <InteractiveCard
                  key={index}
                  className="bg-card/60 overflow-hidden cursor-pointer"
                  onClick={() => setExpandedProject(expandedProject === index ? null : index)}
                >
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.type === 'game' ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                          {item.type === 'game' ? (
                            <Gamepad2 className="w-5 h-5 text-primary" />
                          ) : (
                            <Globe className="w-5 h-5 text-secondary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-orbitron text-lg text-primary">{item.title}</h3>
                          <p className="font-pixel text-xs text-muted-foreground">{item.type === 'game' ? 'Game Project' : 'Web Project'}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-primary transition-transform duration-300 ${expandedProject === index ? 'rotate-90' : ''}`} />
                    </div>
                    
                    <p className="font-orbitron text-sm text-muted-foreground mb-4">
                      {item.description}
                    </p>

                    {/* Game thumbnail preview */}
                    {item.type === 'game' && gameThumbnails[item.title] && (
                      <div className="mb-4 rounded-lg overflow-hidden border border-primary/20">
                        <img 
                          src={gameThumbnails[item.title]} 
                          alt={item.title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    {/* Expanded content */}
                    <div className={`overflow-hidden transition-all duration-500 ${expandedProject === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      {item.embed && item.url && (
                        <div className="aspect-video w-full bg-background rounded-lg overflow-hidden mb-4 border border-primary/20">
                          <iframe
                            src={item.url}
                            className="w-full h-full"
                            title={item.title}
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => { e.stopPropagation(); playClickSound(); }}
                          onMouseEnter={playHoverSound}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary hover:text-primary-foreground border border-primary/50 rounded-lg font-orbitron text-xs text-primary transition-all duration-300"
                        >
                          {item.type === 'game' ? <Play className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                          {item.type === 'game' ? t('playGame') : t('visitSite')}
                        </a>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); playClickSound(); setExpandedProject(expandedProject === index ? null : index); }}
                        className="px-4 py-2 bg-muted hover:bg-muted/80 border border-primary/30 rounded-lg font-orbitron text-xs text-muted-foreground hover:text-primary transition-all duration-300"
                      >
                        {expandedProject === index ? 'Minimize' : 'Preview'}
                      </button>
                    </div>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          )}

          {/* CERTIFICATES - With image slots */}
          {contentType === 'certificates' && (
            <div className="space-y-6">
              <p className="font-orbitron text-sm text-muted-foreground text-center mb-6">
                🏆 Sertifikat dan penghargaan yang telah diraih
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {content.items.map((item, index) => (
                  <InteractiveCard key={index} className="bg-card/60 p-4">
                    {/* Certificate Image Slot */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden mb-4 border-2 border-dashed border-primary/30 flex items-center justify-center relative group">
                      {certificateImages[item.imageKey || ''] ? (
                        <img
                          src={certificateImages[item.imageKey || '']!}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Award className="w-12 h-12 text-primary/30 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <p className="font-pixel text-xs text-primary/50">cert-{item.imageKey}.png</p>
                          <p className="font-orbitron text-[10px] text-muted-foreground mt-1">Add to src/assets</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-accent" />
                      <h3 className="font-orbitron text-base text-primary">{item.title}</h3>
                    </div>
                    <p className="font-orbitron text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </InteractiveCard>
                ))}
              </div>
            </div>
          )}

          {/* SOCIAL MEDIA - Redesigned */}
          {contentType === 'social' && (
            <div className="space-y-6">
              <p className="font-orbitron text-sm text-muted-foreground text-center mb-6">
                🌐 Mari terhubung di berbagai platform!
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {content.items.map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={playClickSound}
                    onMouseEnter={playHoverSound}
                  >
                    <InteractiveCard className="bg-card/60 p-6 h-full">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getSocialColor(item.title)} flex items-center justify-center text-white shadow-lg`}>
                          {getSocialIcon(item.title)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-orbitron text-lg text-primary">{item.title}</h3>
                          <p className="font-orbitron text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-primary/50" />
                      </div>
                    </InteractiveCard>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary));
        }
      `}</style>
    </div>
  );
};

export default ContentPanel;
