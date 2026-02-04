import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAudio } from '@/contexts/AudioContext';
import { usePotatoMode } from '@/contexts/PotatoModeContext';
import { Star, Send, MessageSquare, Pencil, RefreshCw, Globe, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  message: string;
  message_en: string | null;
  message_jp: string | null;
  created_at: string;
}

// Star Rating Component
const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false,
  size = 'md'
}: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const { playClickSound } = useAudio();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => {
            if (onRatingChange) {
              playClickSound();
              onRatingChange(star);
            }
          }}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`transition-all duration-200 ${!readonly ? 'cursor-pointer hover:scale-110' : ''}`}
        >
          <Star
            className={`${sizeClasses[size]} transition-all duration-200 ${
              (hoverRating || rating) >= star
                ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Individual Testimonial Card
const TestimonialCard = ({ 
  testimonial, 
  language,
  onTranslate,
  isTranslating
}: { 
  testimonial: Testimonial;
  language: 'id' | 'en' | 'jp';
  onTranslate: (id: string) => void;
  isTranslating: boolean;
}) => {
  const { isPotatoMode } = usePotatoMode();
  const { t } = useLanguage();
  
  // Get the appropriate message based on language
  const getMessage = () => {
    if (language === 'en' && testimonial.message_en) {
      return testimonial.message_en;
    }
    if (language === 'jp' && testimonial.message_jp) {
      return testimonial.message_jp;
    }
    return testimonial.message;
  };
  
  const needsTranslation = () => {
    if (language === 'en' && !testimonial.message_en) return true;
    if (language === 'jp' && !testimonial.message_jp) return true;
    return false;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'jp' ? 'ja-JP' : language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`relative bg-card/60 rounded-xl p-5 border border-primary/20 transition-all duration-300 hover:border-primary/50 ${
      isPotatoMode ? '' : 'hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border border-primary/30">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-orbitron text-sm text-foreground">{testimonial.name}</h4>
            <p className="font-pixel text-xs text-muted-foreground">{formatDate(testimonial.created_at)}</p>
          </div>
        </div>
        <StarRating rating={testimonial.rating} readonly size="sm" />
      </div>
      
      {/* Message */}
      <p className="font-orbitron text-sm text-muted-foreground leading-relaxed mb-3">
        {getMessage()}
      </p>
      
      {/* Translate button if needed */}
      {needsTranslation() && (
        <button
          onClick={() => onTranslate(testimonial.id)}
          disabled={isTranslating}
          className="inline-flex items-center gap-2 text-xs font-pixel text-primary/70 hover:text-primary transition-colors"
        >
          {isTranslating ? (
            <>
              <RefreshCw className={`w-3 h-3 ${isPotatoMode ? '' : 'animate-spin'}`} />
              {t('testimonialsTranslating')}
            </>
          ) : (
            <>
              <Globe className="w-3 h-3" />
              {t('testimonialsTranslate')}
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Write Form Component
const WriteForm = ({ 
  onSubmitSuccess 
}: { 
  onSubmitSuccess: () => void;
}) => {
  const { t } = useLanguage();
  const { isPotatoMode } = usePotatoMode();
  const { playClickSound } = useAudio();
  
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'rate_limited'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  
  // Typewriter states
  const [displayedName, setDisplayedName] = useState('');
  const [displayedMessage, setDisplayedMessage] = useState('');
  
  // Typewriter effects
  useEffect(() => {
    if (isPotatoMode) {
      setDisplayedName(name);
      return;
    }
    if (name.length > displayedName.length) {
      const timer = setTimeout(() => {
        setDisplayedName(name.slice(0, displayedName.length + 1));
      }, 30);
      return () => clearTimeout(timer);
    } else if (name.length < displayedName.length) {
      setDisplayedName(name);
    }
  }, [name, displayedName, isPotatoMode]);
  
  useEffect(() => {
    if (isPotatoMode) {
      setDisplayedMessage(message);
      return;
    }
    if (message.length > displayedMessage.length) {
      const timer = setTimeout(() => {
        setDisplayedMessage(message.slice(0, displayedMessage.length + 1));
      }, 15);
      return () => clearTimeout(timer);
    } else if (message.length < displayedMessage.length) {
      setDisplayedMessage(message);
    }
  }, [message, displayedMessage, isPotatoMode]);
  
  // Countdown timer effect
  useEffect(() => {
    if (cooldownSeconds <= 0) {
      if (submitStatus === 'rate_limited') {
        setSubmitStatus('idle');
      }
      return;
    }
    
    const timer = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          setSubmitStatus('idle');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [cooldownSeconds, submitStatus]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    
    if (!name.trim() || !message.trim()) {
      setErrorMessage(t('testimonialsFillAll'));
      setSubmitStatus('error');
      return;
    }
    
    if (rating < 1 || rating > 5) {
      setErrorMessage(t('testimonialsInvalidRating'));
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-testimonial', {
        body: {
          name: name.trim(),
          rating,
          message: message.trim()
        }
      });
      
      if (error) throw error;
      
      // Check for rate limit or other errors in response
      if (data?.error) {
        if (data.error === 'rate_limited') {
          setCooldownSeconds(data.retryAfter || 300);
          setSubmitStatus('rate_limited');
          return;
        } else {
          setErrorMessage(data.message || t('testimonialsError'));
          setSubmitStatus('error');
        }
        return;
      }
      
      setSubmitStatus('success');
      setTimeout(() => {
        setName('');
        setRating(5);
        setMessage('');
        setDisplayedName('');
        setDisplayedMessage('');
        setSubmitStatus('idle');
        onSubmitSuccess();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting testimonial:', error);
      setErrorMessage(error.message || t('testimonialsError'));
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {/* Name */}
      <div>
        <label className="block text-xs font-pixel text-primary mb-2">
          {t('testimonialsName')}
        </label>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background/50 border border-primary/30 rounded-lg px-4 py-3 font-orbitron text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            placeholder={t('testimonialsNamePlaceholder')}
            maxLength={50}
          />
          {!isPotatoMode && displayedName !== name && (
            <div className="absolute inset-0 pointer-events-none px-4 py-3 font-orbitron text-foreground overflow-hidden">
              {displayedName}
              <span className="animate-pulse text-primary">|</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Rating */}
      <div>
        <label className="block text-xs font-pixel text-primary mb-2">
          {t('testimonialsRating')}
        </label>
        <div className="flex items-center gap-4">
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          <span className="font-pixel text-sm text-muted-foreground">({rating}/5)</span>
        </div>
      </div>
      
      {/* Message */}
      <div>
        <label className="block text-xs font-pixel text-primary mb-2">
          {t('testimonialsMessage')}
        </label>
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-32 bg-background/50 border border-primary/30 rounded-lg px-4 py-3 font-orbitron text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
            placeholder={t('testimonialsMessagePlaceholder')}
            maxLength={500}
          />
          {!isPotatoMode && displayedMessage !== message && (
            <div className="absolute inset-0 pointer-events-none px-4 py-3 font-orbitron text-foreground overflow-hidden whitespace-pre-wrap">
              {displayedMessage}
              <span className="animate-pulse text-primary">|</span>
            </div>
          )}
        </div>
        <div className="text-right text-xs text-muted-foreground mt-1 font-orbitron">
          {message.length}/500
        </div>
      </div>
      
      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="text-destructive text-sm font-pixel bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          ⚠️ {errorMessage}
        </div>
      )}
      
      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className={`text-green-400 text-sm font-pixel bg-green-500/10 border border-green-500/30 rounded-lg p-3 ${
          isPotatoMode ? '' : 'animate-fade-in'
        }`}>
          <div className="flex items-center gap-2">
            <span className={isPotatoMode ? '' : 'animate-bounce'}>⭐</span>
            {t('testimonialsSuccess')}
          </div>
        </div>
      )}
      
      {/* Rate Limited Countdown */}
      {submitStatus === 'rate_limited' && (
        <div className={`text-amber-400 text-sm font-pixel bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 ${
          isPotatoMode ? '' : 'animate-fade-in'
        }`}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">⏳</span>
            <p className="text-center">{t('testimonialsRateLimited')}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`text-3xl font-orbitron text-amber-300 ${isPotatoMode ? '' : 'animate-pulse'}`}>
                {Math.floor(cooldownSeconds / 60).toString().padStart(2, '0')}:{(cooldownSeconds % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || submitStatus === 'success' || submitStatus === 'rate_limited'}
        className={`w-full py-4 rounded-lg font-pixel text-sm relative overflow-hidden transition-all duration-300 ${
          isSubmitting 
            ? 'bg-primary/50 cursor-not-allowed'
            : submitStatus === 'rate_limited'
            ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400 cursor-not-allowed'
            : submitStatus === 'success'
            ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
            : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-primary-foreground shadow-lg hover:shadow-primary/30 hover:scale-105'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className={isPotatoMode ? '' : 'animate-spin'}>⚙️</span>
            {t('testimonialsSending')}
          </span>
        ) : submitStatus === 'rate_limited' ? (
          <span className="flex items-center justify-center gap-2">
            <span>⏳</span>
            {t('testimonialsWait')} {Math.floor(cooldownSeconds / 60)}:{(cooldownSeconds % 60).toString().padStart(2, '0')}
          </span>
        ) : submitStatus === 'success' ? (
          <span className="flex items-center justify-center gap-2">
            <span>✓</span>
            {t('testimonialsSent')}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            {t('testimonialsSubmit')}
          </span>
        )}
      </button>
    </form>
  );
};

// Main Testimonials Content Component
const TestimonialsContent: React.FC = () => {
  const { t, language } = useLanguage();
  const { isPotatoMode } = usePotatoMode();
  const { playClickSound, playHoverSound } = useAudio();
  
  const [activeTab, setActiveTab] = useState<'read' | 'write'>('read');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  
  // Fetch testimonials
  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTestimonials((data as Testimonial[]) || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);
  
  // Translate a testimonial
  const handleTranslate = async (id: string) => {
    const testimonial = testimonials.find(t => t.id === id);
    if (!testimonial) return;
    
    setTranslatingIds(prev => new Set(prev).add(id));
    
    try {
      const { data, error } = await supabase.functions.invoke('translate-testimonial', {
        body: { 
          message: testimonial.message, 
          targetLanguage: language 
        }
      });
      
      if (error) throw error;
      
      if (data.translatedText) {
        // Update local state
        const fieldToUpdate = language === 'en' ? 'message_en' : 'message_jp';
        
        // Update in database
        await supabase
          .from('testimonials')
          .update({ [fieldToUpdate]: data.translatedText })
          .eq('id', id);
        
        // Update local state
        setTestimonials(prev => prev.map(t => 
          t.id === id 
            ? { ...t, [fieldToUpdate]: data.translatedText }
            : t
        ));
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Description */}
      <p className="font-orbitron text-sm text-muted-foreground text-center">
        {t('testimonialsDesc')}
      </p>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl border border-primary/20 max-w-md mx-auto">
        <button
          onClick={() => { setActiveTab('read'); playClickSound(); }}
          onMouseEnter={playHoverSound}
          className={`flex-1 py-3 px-4 rounded-lg font-orbitron text-xs transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'read' 
              ? 'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)]' 
              : 'text-muted-foreground hover:text-primary'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {t('testimonialsTabRead')}
        </button>
        <button
          onClick={() => { setActiveTab('write'); playClickSound(); }}
          onMouseEnter={playHoverSound}
          className={`flex-1 py-3 px-4 rounded-lg font-orbitron text-xs transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'write' 
              ? 'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)]' 
              : 'text-muted-foreground hover:text-primary'
          }`}
        >
          <Pencil className="w-4 h-4" />
          {t('testimonialsTabWrite')}
        </button>
      </div>
      
      {/* Content */}
      {activeTab === 'read' ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className={`w-8 h-8 text-primary mx-auto mb-2 ${isPotatoMode ? '' : 'animate-spin'}`} />
              <p className="font-pixel text-sm text-muted-foreground">{t('testimonialsLoading')}</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="font-orbitron text-sm text-muted-foreground">{t('testimonialsEmpty')}</p>
              <button
                onClick={() => { setActiveTab('write'); playClickSound(); }}
                className="mt-4 px-6 py-2 bg-primary/20 hover:bg-primary hover:text-primary-foreground border border-primary/50 rounded-lg font-pixel text-xs text-primary transition-all duration-300"
              >
                {t('testimonialsBeFirst')}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  language={language}
                  onTranslate={handleTranslate}
                  isTranslating={translatingIds.has(testimonial.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <WriteForm onSubmitSuccess={() => {
          fetchTestimonials();
          setTimeout(() => setActiveTab('read'), 500);
        }} />
      )}
    </div>
  );
};

export default TestimonialsContent;
