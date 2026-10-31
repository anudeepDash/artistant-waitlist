'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { joinRoleWaitlistAction } from '@/lib/email-actions';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Sparkles, 
  ChevronLeft, 
  ArrowRight,
  Music,
  Sliders,
  DollarSign,
  Ticket,
  HelpCircle,
  Calendar,
  Volume2
} from 'lucide-react';

interface RoleWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'organizer' | 'attendee' | 'venue' | null;
}

interface FormData {
  // Step 1 - Contact details (Common)
  name: string;
  email: string;
  phone: string;
  city: string;

  // Step 2 - Event Host (organizer)
  orgName: string;
  eventFormats: string[];
  bookingBudget: string;
  hostNotes: string;

  // Step 2 - Partner Venue (venue)
  venueName: string;
  venueType: string;
  capacity: string;
  soundGear: string[];
  venueNotes: string;

  // Step 2 - Show Attendee (attendee)
  favGenres: string[];
  attendanceFreq: string;
  tipInterest: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  city: '',
  
  orgName: '',
  eventFormats: [],
  bookingBudget: '',
  hostNotes: '',

  venueName: '',
  venueType: '',
  capacity: '',
  soundGear: [],
  venueNotes: '',

  favGenres: [],
  attendanceFreq: '',
  tipInterest: '',
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 5,
    transition: { duration: 0.15, ease: 'easeInOut' as const },
  },
} as const;

const stepVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 20 : -20 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -20 : 20, transition: { duration: 0.15 } }),
};

export default function RoleWaitlistModal({ isOpen, onClose, role }: RoleWaitlistModalProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Hidden spam trap: real people never see or fill this.
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setStep(1);
        setDirection(1);
        setFormData(initialFormData);
        setIsSubmitted(false);
        setLoading(false);
        setSubmitError(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Design tokens based on active role
  const getRoleAccent = useCallback(() => {
    switch (role) {
      case 'organizer':
        return {
          label: 'Event Host',
          desc: 'Book verified artists with a proper contract, protected payments and a backup if anything goes wrong.',
          accent: '#7C5CFF', // host violet, as on the homepage
          accentRgb: '124, 92, 255',
          secondary: '#D4567A', // magenta
          gradient: '#7C5CFF',
          icon: <Sliders className="w-5 h-5 text-white" />
        };
      case 'venue':
        return {
          label: 'Partner Venue',
          desc: 'Run weekly live nights with resident artists — pay week by week, with one invoice a month.',
          accent: '#6B7CDB', // venue blue, as on the homepage
          accentRgb: '107, 124, 219',
          secondary: '#7C5CFF', // purple
          gradient: '#6B7CDB',
          icon: <Building className="w-5 h-5 text-white" />
        };
      case 'attendee':
        return {
          label: 'Show Attendee',
          desc: 'Request live songs, tip directly, and buy tickets straight from the artist',
          accent: '#D4567A', // magenta
          accentRgb: '212, 86, 122',
          secondary: '#7C5CFF', // purple
          gradient: '#D4567A',
          icon: <Ticket className="w-5 h-5 text-white" />
        };
    }
  }, [role]);

  const roleTokens = getRoleAccent() || {
    label: '',
    desc: '',
    accent: '',
    accentRgb: '',
    secondary: '',
    gradient: '',
    icon: null
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = useCallback(() => {
    return (
      formData.name.trim().length >= 2 &&
      formData.email.trim().length >= 5 &&
      formData.email.includes('@') &&
      formData.phone.trim().length >= 8 &&
      formData.city.trim().length >= 2
    );
  }, [formData.name, formData.email, formData.phone, formData.city]);

  const isStep2Valid = useCallback(() => {
    if (role === 'organizer') {
      return formData.orgName.trim().length >= 2 && formData.bookingBudget !== '';
    }
    if (role === 'venue') {
      return (
        formData.venueName.trim().length >= 2 &&
        formData.venueType !== '' &&
        formData.capacity !== ''
      );
    }
    if (role === 'attendee') {
      return formData.favGenres.length > 0 && formData.attendanceFreq !== '';
    }
    return false;
  }, [role, formData.orgName, formData.bookingBudget, formData.venueName, formData.venueType, formData.capacity, formData.favGenres, formData.attendanceFreq]);

  const handleNextStep = useCallback(() => {
    if (isStep1Valid()) {
      setDirection(1);
      setStep(2);
    }
  }, [isStep1Valid]);

  const handlePrevStep = useCallback(() => {
    setDirection(-1);
    setStep(1);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!isStep1Valid() || !isStep2Valid()) return;
      if (role !== 'organizer' && role !== 'venue') {
        setIsSubmitted(true);
        return;
      }

      setLoading(true);
      setSubmitError(null);
      // Sends the details to the team inbox and the welcome email to the person.
      const res = await joinRoleWaitlistAction({ role, website, ...formData }).catch(() => ({
        success: false,
        message: 'We couldn’t save that just now. Please try again, or write to hello@artistant.in.',
      }));
      setLoading(false);
      if (res.success) setIsSubmitted(true);
      else setSubmitError(res.message);
    },
    [isStep1Valid, isStep2Valid, role, website, formData],
  );

  // Generate stable futuristic ticket passcode
  const generateTicketNumber = (email: string) => {
    const prefix = role === 'venue' ? 'VN' : role === 'organizer' ? 'HT' : 'AT';
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const val = Math.abs(hash % 90000) + 10000;
    return `${prefix}-${val}`;
  };

  if (!role) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="role-modal-overlay"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          {/* Modal Container */}
          <motion.div
            key="role-modal-card"
            className="relative w-full max-w-lg rounded-t-[1.75rem] sm:rounded-3xl p-5 sm:p-8 max-h-[92vh] overflow-y-auto mobile-touch-scroll border-t sm:border border-white/10 my-0 sm:my-8 z-50 shadow-2xl"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              '--accent-color': roleTokens.accent,
              '--accent-color-rgb': roleTokens.accentRgb,
              background: 'rgba(10, 10, 10, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 30px 60px -30px rgba(0, 0, 0, 0.9)'
            } as React.CSSProperties}
          >
            {/* Small drag bar indicator on mobile */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 shrink-0 sm:hidden" />
              
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 z-20"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <div className="relative z-10 flex flex-col gap-5 pt-2">
                    {/* Header */}
                    <div>
                      <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.2em] text-gray-400 mb-4">
                        <span className="w-[18px] h-px" style={{ backgroundColor: roleTokens.accent }} aria-hidden="true" />
                        {role === 'organizer' ? 'For hosts' : role === 'venue' ? 'For venues' : 'For fans'}
                      </div>
                      <h2 className="font-bold text-[32px] sm:text-[40px] text-[#f4f2ee] tracking-[-0.032em] leading-[0.95] mb-4" style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontStretch: '90%' }}>
                        {role === 'organizer' ? (
                          <>Book the act, <span style={{ color: roleTokens.accent }}>not the agency.</span></>
                        ) : role === 'venue' ? (
                          <>Your room, <span style={{ color: roleTokens.accent }}>booked out.</span></>
                        ) : (
                          <>Live music, <span style={{ color: roleTokens.accent }}>up close.</span></>
                        )}
                      </h2>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {roleTokens.desc}
                      </p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-[2px] bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ backgroundColor: roleTokens.accent }}
                          animate={{ width: step === 1 ? '50%' : '100%' }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 whitespace-nowrap">
                        Step {step} of 2
                      </span>
                    </div>

                    <hr style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />

                    {/* Form content steps */}
                    <form onSubmit={handleSubmit} className="overflow-hidden">
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                      />
                      <AnimatePresence mode="wait" initial={false} custom={direction}>
                        {step === 1 ? (
                          <motion.div
                            key="step1"
                            custom={direction}
                            variants={stepVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> Full Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.name}
                                  onChange={(e) => updateField('name', e.target.value)}
                                  placeholder="e.g. Liam Sterling"
                                  className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> Work / Personal Email
                                </label>
                                <input
                                  type="email"
                                  required
                                  value={formData.email}
                                  onChange={(e) => updateField('email', e.target.value)}
                                  placeholder="e.g. liam@domain.com"
                                  className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> Phone (WhatsApp)
                                </label>
                                <input
                                  type="tel"
                                  required
                                  value={formData.phone}
                                  onChange={(e) => updateField('phone', e.target.value)}
                                  placeholder="e.g. +91 98765 43210"
                                  className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> Operating City
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.city}
                                  onChange={(e) => updateField('city', e.target.value)}
                                  placeholder="e.g. Bengaluru"
                                  className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleNextStep}
                              disabled={!isStep1Valid()}
                              className="w-full mt-6 py-3.5 px-6 rounded-full font-semibold text-[15px] text-white flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              style={{ background: roleTokens.gradient }}
                            >
                              Continue <ArrowRight className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="step2"
                            custom={direction}
                            variants={stepVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-4"
                          >
                            {/* EVENT HOST (organizer) fields */}
                            {role === 'organizer' && (
                              <div className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <Building className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> Host Brand / Org Name
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={formData.orgName}
                                    onChange={(e) => updateField('orgName', e.target.value)}
                                    placeholder="e.g. Submerge Gigs"
                                    className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200"
                                  />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <Music className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> Primary Event Formats
                                  </label>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {['Festivals', 'Club Nights', 'Corporate Events', 'Weddings / Private', 'Cafe Acoust'].map((fmt) => {
                                      const isSelected = formData.eventFormats.includes(fmt);
                                      return (
                                        <button
                                          key={fmt}
                                          type="button"
                                          onClick={() => {
                                            const updated = isSelected
                                              ? formData.eventFormats.filter((x) => x !== fmt)
                                              : [...formData.eventFormats, fmt];
                                            updateField('eventFormats', updated);
                                          }}
                                          className="px-3.5 py-2 text-xs rounded-full border transition-all cursor-pointer font-medium"
                                          style={{
                                            backgroundColor: isSelected ? `rgba(${roleTokens.accentRgb}, 0.15)` : 'rgba(255,255,255,0.02)',
                                            borderColor: isSelected ? roleTokens.accent : 'rgba(255,255,255,0.08)',
                                            color: isSelected ? '#FFFFFF' : '#9BA4B8'
                                          }}
                                        >
                                          {fmt}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <DollarSign className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> Typical Booking Budget (per Artist)
                                  </label>
                                  <select
                                    required
                                    value={formData.bookingBudget}
                                    onChange={(e) => updateField('bookingBudget', e.target.value)}
                                    className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200 cursor-pointer"
                                  >
                                    <option value="" disabled className="bg-[#121212] text-gray-500">Select standard budget</option>
                                    <option value="Under ₹15,000" className="bg-[#121212]">Under ₹15,000</option>
                                    <option value="₹15,000 - ₹50,000" className="bg-[#121212]">₹15,000 - ₹50,000</option>
                                    <option value="₹50,000 - ₹1.5L" className="bg-[#121212]">₹50,000 - ₹1.5L</option>
                                    <option value="Above ₹1.5L" className="bg-[#121212]">Above ₹1.5L</option>
                                  </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Additional Host Requirements / Notes</label>
                                  <textarea
                                    value={formData.hostNotes}
                                    onChange={(e) => updateField('hostNotes', e.target.value)}
                                    placeholder="Tell us about the performers you usually book..."
                                    rows={2}
                                    className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200 resize-none"
                                  />
                                </div>
                              </div>
                            )}

                            {/* PARTNER VENUE (venue) fields */}
                            {role === 'venue' && (
                              <div className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <Building className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> Official Venue Name
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={formData.venueName}
                                    onChange={(e) => updateField('venueName', e.target.value)}
                                    placeholder="e.g. The Indigo Lounge"
                                    className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Venue Type</label>
                                    <select
                                      required
                                      value={formData.venueType}
                                      onChange={(e) => updateField('venueType', e.target.value)}
                                      className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200 cursor-pointer"
                                    >
                                      <option value="" disabled className="bg-[#121212] text-gray-500">Select type</option>
                                      <option value="Bar / Pub" className="bg-[#121212]">Bar / Pub</option>
                                      <option value="Nightclub" className="bg-[#121212]">Nightclub</option>
                                      <option value="Cafe" className="bg-[#121212]">Cafe / Bistro</option>
                                      <option value="Concert Hall" className="bg-[#121212]">Concert Hall</option>
                                      <option value="Outdoor Space" className="bg-[#121212]">Outdoor Space</option>
                                      <option value="Other" className="bg-[#121212]">Other</option>
                                    </select>
                                  </div>

                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Venue Capacity</label>
                                    <select
                                      required
                                      value={formData.capacity}
                                      onChange={(e) => updateField('capacity', e.target.value)}
                                      className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200 cursor-pointer"
                                    >
                                      <option value="" disabled className="bg-[#121212] text-gray-500">Select capacity</option>
                                      <option value="Under 150" className="bg-[#121212]">Under 150 pax</option>
                                      <option value="150 - 500" className="bg-[#121212]">150 - 500 pax</option>
                                      <option value="500 - 1500" className="bg-[#121212]">500 - 1500 pax</option>
                                      <option value="1500+" className="bg-[#121212]">1500+ pax</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <Volume2 className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> Stage Sound & Lighting Gear
                                  </label>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {['PA Speakers', 'Live Mixer', 'DJ Decks', 'Stage Lights', 'Acoustic treatment'].map((gear) => {
                                      const isSelected = formData.soundGear.includes(gear);
                                      return (
                                        <button
                                          key={gear}
                                          type="button"
                                          onClick={() => {
                                            const updated = isSelected
                                              ? formData.soundGear.filter((x) => x !== gear)
                                              : [...formData.soundGear, gear];
                                            updateField('soundGear', updated);
                                          }}
                                          className="px-3.5 py-2 text-xs rounded-full border transition-all cursor-pointer font-medium"
                                          style={{
                                            backgroundColor: isSelected ? `rgba(${roleTokens.accentRgb}, 0.15)` : 'rgba(255,255,255,0.02)',
                                            borderColor: isSelected ? roleTokens.accent : 'rgba(255,255,255,0.08)',
                                            color: isSelected ? '#FFFFFF' : '#9BA4B8'
                                          }}
                                        >
                                          {gear}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Venue Notes / Specs</label>
                                  <textarea
                                    value={formData.venueNotes}
                                    onChange={(e) => updateField('venueNotes', e.target.value)}
                                    placeholder="Describe your stage setup or acoustics..."
                                    rows={2}
                                    className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200 resize-none"
                                  />
                                </div>
                              </div>
                            )}

                            {/* SHOW ATTENDEE (attendee) fields */}
                            {role === 'attendee' && (
                              <div className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <Music className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> Favorite Music Genres
                                  </label>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {['Techno / House', 'Indie / Rock', 'Hip-Hop / Rap', 'Jazz / Blues', 'Pop / EDM', 'Metal', 'Other'].map((genre) => {
                                      const isSelected = formData.favGenres.includes(genre);
                                      return (
                                        <button
                                          key={genre}
                                          type="button"
                                          onClick={() => {
                                            const updated = isSelected
                                              ? formData.favGenres.filter((x) => x !== genre)
                                              : [...formData.favGenres, genre];
                                            updateField('favGenres', updated);
                                          }}
                                          className="px-3.5 py-2 text-xs rounded-full border transition-all cursor-pointer font-medium"
                                          style={{
                                            backgroundColor: isSelected ? `rgba(${roleTokens.accentRgb}, 0.15)` : 'rgba(255,255,255,0.02)',
                                            borderColor: isSelected ? roleTokens.accent : 'rgba(255,255,255,0.08)',
                                            color: isSelected ? '#FFFFFF' : '#9BA4B8'
                                          }}
                                        >
                                          {genre}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> How often do you attend gigs?
                                  </label>
                                  <select
                                    required
                                    value={formData.attendanceFreq}
                                    onChange={(e) => updateField('attendanceFreq', e.target.value)}
                                    className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200 cursor-pointer"
                                  >
                                    <option value="" disabled className="bg-[#121212] text-gray-500">Select attendance frequency</option>
                                    <option value="Multiple times a week" className="bg-[#121212]">Multiple times a week</option>
                                    <option value="Once a week" className="bg-[#121212]">Once a week</option>
                                    <option value="Once a month" className="bg-[#121212]">Once a month</option>
                                    <option value="Occasionally" className="bg-[#121212]">Occasionally</option>
                                  </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <HelpCircle className="w-3.5 h-3.5" style={{ color: roleTokens.accent }} /> What feature are you most excited for?
                                  </label>
                                  <select
                                    required
                                    value={formData.tipInterest}
                                    onChange={(e) => updateField('tipInterest', e.target.value)}
                                    className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[var(--accent-color)] outline-none transition-all duration-200 cursor-pointer"
                                  >
                                    <option value="" disabled className="bg-[#121212] text-gray-500">Select core interest</option>
                                    <option value="Tipping & Live Song Requests" className="bg-[#121212]">Tipping & Live Song Requests</option>
                                    <option value="Buying Tickets direct from Artists" className="bg-[#121212]">Buying Tickets direct from Artists</option>
                                    <option value="Both Features" className="bg-[#121212]">Both Features</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {submitError && (
                              <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                {submitError}
                              </p>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3 pt-4">
                              <button
                                type="button"
                                onClick={handlePrevStep}
                                className="py-3.5 px-5 rounded-full border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-sm"
                              >
                                <ChevronLeft className="w-4 h-4" /> Back
                              </button>

                              <button
                                type="submit"
                                disabled={loading || !isStep2Valid()}
                                className="flex-1 py-3.5 rounded-full font-semibold text-[15px] text-white transition-all transform active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                                style={{ background: roleTokens.gradient }}
                              >
                                {loading ? (
                                  <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                                    Saving your spot...
                                  </>
                                ) : (
                                  <>
                                    Get early access <ArrowRight className="w-4 h-4" />
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </div>
                ) : (
                  /* Redesigned Success Payoff Ticket View */
                  <motion.div
                    key="success"
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="relative z-10 flex flex-col items-center text-center py-4"
                  >
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold"
                      style={{
                        background: 'rgba(52, 211, 153, 0.1)',
                        color: '#34D399',
                        border: '1px solid rgba(52, 211, 153, 0.2)'
                      }}
                    >
                      ✓
                    </div>

                    <h3 className="text-[32px] sm:text-[40px] font-bold text-[#f4f2ee] mb-3 tracking-[-0.032em] leading-[0.95]" style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif', fontStretch: '90%' }}>
                      You&apos;re on the <span style={{ color: roleTokens.accent }}>list.</span>
                    </h3>
                    <p className="text-sm text-gray-400 mb-8 max-w-sm">
                      We&apos;ve saved your spot. We&apos;ll email you as soon as Artistant opens in your city.
                    </p>

                    {/* Digital Access Pass / Ticket Mockup */}
                    <div 
                      className="w-full rounded-2xl p-6 text-left border relative overflow-hidden mb-8"
                      style={{
                        background: '#131313',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {/* Ticket header watermark */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-60">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="font-mono text-[9px] uppercase tracking-wider text-green-400 font-bold">Saved</span>
                      </div>

                      {/* Ticket Details */}
                      <div className="flex flex-col gap-5 relative z-10 font-sans">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500 block mb-1">Passholder</span>
                            <span className="text-white text-base font-bold">{formData.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500 block mb-1">Network Role</span>
                            <span className="text-sm font-semibold" style={{ color: roleTokens.accent }}>
                              {roleTokens.label}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500 block mb-1">Registered Email</span>
                            <span className="text-white text-xs truncate block font-mono">{formData.email}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500 block mb-1">HQ Location</span>
                            <span className="text-white text-xs block">{formData.city}</span>
                          </div>
                        </div>

                        {/* Dashed Separator */}
                        <div className="border-t border-dashed border-white/10 my-1 relative">
                          <div className="absolute -left-8 -top-1.5 w-3 h-3 rounded-full bg-[#0a0a0a]" />
                          <div className="absolute -right-8 -top-1.5 w-3 h-3 rounded-full bg-[#0a0a0a]" />
                        </div>

                        {/* Barcode and Ticket Pass Code */}
                        <div className="flex justify-between items-center gap-4">
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500 block mb-1">Queue Ticket</span>
                            <span className="text-white font-bold font-mono tracking-wider text-sm">{generateTicketNumber(formData.email)}</span>
                          </div>
                          
                          {/* Mapped SVG Barcode */}
                          <svg className="h-9 w-28 opacity-70" viewBox="0 0 100 30" fill="currentColor">
                            <rect x="0" y="0" width="3" height="30" />
                            <rect x="5" y="0" width="1" height="30" />
                            <rect x="8" y="0" width="2" height="30" />
                            <rect x="12" y="0" width="4" height="30" />
                            <rect x="18" y="0" width="1" height="30" />
                            <rect x="21" y="0" width="3" height="30" />
                            <rect x="26" y="0" width="2" height="30" />
                            <rect x="30" y="0" width="4" height="30" />
                            <rect x="36" y="0" width="1" height="30" />
                            <rect x="39" y="0" width="2" height="30" />
                            <rect x="43" y="0" width="3" height="30" />
                            <rect x="48" y="0" width="1" height="30" />
                            <rect x="51" y="0" width="4" height="30" />
                            <rect x="57" y="0" width="2" height="30" />
                            <rect x="61" y="0" width="1" height="30" />
                            <rect x="64" y="0" width="3" height="30" />
                            <rect x="69" y="0" width="4" height="30" />
                            <rect x="75" y="0" width="1" height="30" />
                            <rect x="78" y="0" width="2" height="30" />
                            <rect x="82" y="0" width="3" height="30" />
                            <rect x="87" y="0" width="1" height="30" />
                            <rect x="90" y="0" width="4" height="30" />
                            <rect x="96" y="0" width="2" height="30" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full py-3.5 rounded-full font-semibold text-[15px] text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
