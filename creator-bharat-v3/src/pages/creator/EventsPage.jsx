import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Star, Trophy, Zap, CheckCircle2,
  ArrowRight, Clock, Ticket, Award, Sparkles, X, ShieldCheck
} from 'lucide-react';
import { useApp } from '@/core/context';
import { LS, fmt } from '@/utils/helpers';
import { apiCall } from '@/utils/api';
import { Card, Btn, Bdg } from '@/components/common/Primitives';
import { CreatorPageHeader } from './CreatorShellPage';

// ─── Event Data ───────────────────────────────────────────────────────────────
const EVENTS = [
  {
    id: 'summit-2027',
    title: 'CreatorBharat National Summit 2027',
    subtitle: 'Bharat ka Sabse Bada Creator Gathering',
    date: 'March 15-16, 2027',
    location: 'Jaipur, Rajasthan',
    venue: 'Birla Auditorium, Jaipur',
    type: 'flagship',
    status: 'upcoming',
    seats: 500,
    seatsLeft: 347,
    eligibility: 'CB Score 60+ required',
    minScore: 60,
    highlights: [
      'Top 50 creators get free travel + stay',
      'Brand speed-networking sessions',
      'Live Play Button award ceremony',
      'Masterclasses by industry leaders',
      'Exclusive brand deal signings',
    ],
    perks: {
      free: ['Entry pass', 'Event kit', 'Networking access'],
      pro: ['VIP seating', 'Brand meeting slots', 'Exclusive after-party', 'Media coverage'],
    },
    cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
    color: '#FF9431',
  },
  {
    id: 'workshop-jaipur-2027',
    title: 'Creator Masterclass — Jaipur Hub',
    subtitle: 'Content Strategy & Brand Pitching Workshop',
    date: 'January 20, 2027',
    location: 'Jaipur, Rajasthan',
    venue: 'CB Hub, Bhilwara Road',
    type: 'workshop',
    status: 'upcoming',
    seats: 50,
    seatsLeft: 23,
    eligibility: 'Any verified creator',
    minScore: 0,
    highlights: [
      'Content strategy for Tier-2 markets',
      'How to pitch brands directly',
      'CB Score improvement workshop',
      'Live profile review session',
    ],
    perks: {
      free: ['Workshop entry', 'Study material'],
      pro: ['1-on-1 mentoring slot', 'Priority seating'],
    },
    cover: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200',
    color: '#10B981',
  },
  {
    id: 'awards-2027',
    title: 'CreatorBharat Awards Night 2027',
    subtitle: 'Celebrating Bharat\'s Top Regional Creators',
    date: 'December 10, 2027',
    location: 'Mumbai, Maharashtra',
    venue: 'NSCI Dome, Worli',
    type: 'awards',
    status: 'upcoming',
    seats: 300,
    seatsLeft: 300,
    eligibility: 'CB Score 80+ required',
    minScore: 80,
    highlights: [
      'India Creator Button ceremony',
      'Best Niche Creator awards',
      'Brand Partner of the Year',
      'Rising Star recognition',
    ],
    perks: {
      free: ['Entry pass', 'Awards ceremony access'],
      pro: ['VIP table', 'Brand networking dinner', 'Press coverage'],
    },
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
    color: '#7C3AED',
  },
];

// ─── Booking Modal ────────────────────────────────────────────────────────────
const BookingModal = ({ event, onClose, onConfirm, isPro, creatorScore }) => {
  const [step, setStep] = useState(1); // 1: details, 2: confirm, 3: success
  const [form, setForm] = useState({ name: '', phone: '', city: '', expectation: '' });
  const meetsEligibility = creatorScore >= event.minScore;

  if (step === 3) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ background: '#fff', borderRadius: 32, padding: 48, maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#10B98112', display: 'grid', placeItems: 'center', margin: '0 auto 24px', color: '#10B981' }}>
            <CheckCircle2 size={40} />
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 950, color: '#0f172a', marginBottom: 12 }}>Seat Reserved! 🎉</h3>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, marginBottom: 8 }}>
            <strong>{event.title}</strong>
          </p>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 32 }}>
            Confirmation details will be sent to your registered email. We'll notify you 30 days before the event.
          </p>
          <Btn full lg onClick={onClose} style={{ background: '#0f172a', color: '#fff', borderRadius: 100 }}>
            Done
          </Btn>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 32, padding: 40, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h3 style={{ fontSize: 20, fontWeight: 950, color: '#0f172a', margin: 0 }}>Book Your Seat</h3>
          <button onClick={onClose} style={{ background: '#f8fafc', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Event summary */}
        <div style={{ padding: 20, background: '#f8fafc', borderRadius: 20, border: '1px solid #f1f5f9', marginBottom: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>{event.title}</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
              <Calendar size={14} /> {event.date}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
              <MapPin size={14} /> {event.location}
            </div>
          </div>
        </div>

        {/* Eligibility check */}
        {!meetsEligibility && (
          <div style={{ padding: 16, background: '#FEF2F2', borderRadius: 16, border: '1px solid #FECACA', marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#EF4444', marginBottom: 4 }}>⚠️ Eligibility Not Met</div>
            <div style={{ fontSize: 13, color: '#B91C1C', fontWeight: 500 }}>
              This event requires CB Score {event.minScore}+. Your current score: <strong>{creatorScore}</strong>.
              Improve your profile, complete missions, and get brand deals to increase your score.
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'name', label: 'Full Name', placeholder: 'Rahul Sharma' },
              { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
              { key: 'city', label: 'Your City', placeholder: 'Jaipur, Rajasthan' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{f.label}</label>
                <input
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: 15, fontWeight: 600, outline: 'none' }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>What do you expect from this event?</label>
              <textarea
                value={form.expectation}
                onChange={e => setForm(p => ({ ...p, expectation: e.target.value }))}
                placeholder="Brand connections, learning, networking..."
                rows={3}
                style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: 15, fontWeight: 600, outline: 'none', resize: 'none' }}
              />
            </div>

            {/* Perks based on plan */}
            <div style={{ padding: 16, background: isPro ? '#f0fdf4' : '#FFF7ED', borderRadius: 16, border: `1px solid ${isPro ? '#BBF7D0' : '#FED7AA'}` }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: isPro ? '#10B981' : '#FF9431', marginBottom: 10 }}>
                {isPro ? '✅ Pro Perks Included' : '🎟️ Free Plan Perks'}
              </div>
              {(isPro ? event.perks.pro : event.perks.free).map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <CheckCircle2 size={13} color={isPro ? '#10B981' : '#FF9431'} />
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{p}</span>
                </div>
              ))}
              {!isPro && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                  Upgrade to Pro for VIP perks →
                </div>
              )}
            </div>

            <Btn full lg
              disabled={!meetsEligibility || !form.name || !form.phone}
              onClick={() => setStep(2)}
              style={{ background: meetsEligibility ? '#0f172a' : '#e2e8f0', color: meetsEligibility ? '#fff' : '#94a3b8', borderRadius: 100, marginTop: 8 }}
            >
              Continue to Confirm <ArrowRight size={18} />
            </Btn>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ padding: 20, background: '#f8fafc', borderRadius: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>Booking Summary</div>
              {[
                { l: 'Name', v: form.name },
                { l: 'Phone', v: form.phone },
                { l: 'City', v: form.city },
                { l: 'Plan', v: isPro ? 'Pro (VIP)' : 'Free' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{r.l}</span>
                  <span style={{ color: '#0f172a', fontWeight: 800 }}>{r.v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn full onClick={() => setStep(1)} style={{ background: '#f8fafc', color: '#64748b', borderRadius: 100 }}>Back</Btn>
              <Btn full lg onClick={() => { onConfirm(event, form); setStep(3); }} style={{ background: '#10B981', color: '#fff', borderRadius: 100 }}>
                <Ticket size={18} /> Confirm Booking
              </Btn>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ─── Event Card ───────────────────────────────────────────────────────────────
const EventCard = ({ event, creatorScore, isPro, onBook, delay = 0 }) => {
  const meetsEligibility = creatorScore >= event.minScore;
  const pctFilled = Math.round(((event.seats - event.seatsLeft) / event.seats) * 100);
  const typeColors = { flagship: '#FF9431', workshop: '#10B981', awards: '#7C3AED' };
  const typeColor = typeColors[event.type] || '#FF9431';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* Cover */}
        <div style={{ position: 'relative', height: 180 }}>
          <img src={event.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', top: 16, left: 16 }}>
            <span style={{ background: typeColor, color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {event.type}
            </span>
          </div>
          <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 950, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{event.title}</h3>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{event.subtitle}</div>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', fontWeight: 600 }}>
              <Calendar size={14} color={typeColor} /> {event.date}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', fontWeight: 600 }}>
              <MapPin size={14} color={typeColor} /> {event.location}
            </div>
          </div>

          {/* Seats progress */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
              <span>{event.seatsLeft} seats left</span>
              <span style={{ color: event.seatsLeft < 50 ? '#EF4444' : typeColor }}>{pctFilled}% filled</span>
            </div>
            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: event.seatsLeft < 50 ? '#EF4444' : typeColor, borderRadius: 100, width: `${pctFilled}%`, transition: '0.5s' }} />
            </div>
          </div>

          {/* Eligibility */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px', background: meetsEligibility ? '#f0fdf4' : '#FFF7ED', borderRadius: 12, border: `1px solid ${meetsEligibility ? '#BBF7D0' : '#FED7AA'}` }}>
            {meetsEligibility
              ? <CheckCircle2 size={14} color="#10B981" />
              : <ShieldCheck size={14} color="#FF9431" />
            }
            <span style={{ fontSize: 12, fontWeight: 700, color: meetsEligibility ? '#10B981' : '#FF9431' }}>
              {meetsEligibility ? 'You are eligible!' : `Requires CB Score ${event.minScore}+ (yours: ${creatorScore})`}
            </span>
          </div>

          <Btn full lg onClick={() => onBook(event)} style={{ background: meetsEligibility ? '#0f172a' : '#f1f5f9', color: meetsEligibility ? '#fff' : '#94a3b8', borderRadius: 14 }}>
            <Ticket size={16} /> {meetsEligibility ? 'Book My Seat' : 'Not Eligible Yet'}
          </Btn>
        </div>
      </Card>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const { st, dsp } = useApp();
  const navigate = useNavigate();
  const [mob, setMob] = useState(globalThis.innerWidth < 768);
  const [bookingEvent, setBookingEvent] = useState(null);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiCall('/events')
      .then(res => {
        if (!isMounted) return;
        if (Array.isArray(res) && res.length > 0) {
          const mapped = res.map(e => {
            const minScoreMatch = e.eligibility ? e.eligibility.match(/\d+/) : null;
            const minScoreVal = minScoreMatch ? parseInt(minScoreMatch[0], 10) : 0;
            const eventDateObj = new Date(e.date);
            const isValidDate = !isNaN(eventDateObj.getTime());
            return {
              id: e.id,
              title: e.title,
              subtitle: (e.description || '').slice(0, 100) + '...',
              date: isValidDate
                ? eventDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : e.date || 'TBA',
              location: e.location,
              venue: e.venue || '',
              type: (e.type || 'flagship').toLowerCase(),
              status: isValidDate && eventDateObj > new Date() ? 'upcoming' : 'past',
              seats: 100,
              seatsLeft: 42,
              eligibility: e.eligibility || 'Any verified creator',
              minScore: minScoreVal,
              highlights: [
                'Brand speed-networking sessions',
                'Live Play Button award ceremony',
                'Masterclasses by industry leaders'
              ],
              perks: {
                free: ['Entry pass', 'Event kit'],
                pro: ['VIP seating', 'Exclusive after-party']
              },
              cover: e.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
              color: (e.type || '').toUpperCase() === 'SUMMIT' ? '#FF9431' : (e.type || '').toUpperCase() === 'WORKSHOP' ? '#10B981' : '#7C3AED'
            };
          });
          setEventsList(mapped);
        } else {
          setEventsList(EVENTS);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('Failed to load events from API, falling back to local dataset:', err?.message || err);
        if (isMounted) {
          setEventsList(EVENTS);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const h = () => setMob(globalThis.innerWidth < 768);
    globalThis.addEventListener('resize', h);
    return () => globalThis.removeEventListener('resize', h);
  }, []);

  // Get creator profile for score
  const allC = LS.get('cb_creators', []);
  const c = st.user?.creatorProfile || allC.find(cr => cr.email === st.user?.email) || {};
  const creatorScore = c.score || fmt.score(c) || 0;
  const isPro = st.isPro;

  const handleConfirmBooking = (event, form) => {
    // Save booking to localStorage
    const bookings = LS.get('cb_event_bookings', []);
    bookings.push({
      id: `booking-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      ...form,
      isPro,
      bookedAt: new Date().toISOString(),
    });
    LS.set('cb_event_bookings', bookings);
    dsp({ t: 'TOAST', d: { type: 'success', msg: `Seat booked for ${event.title}! 🎉` } });
  };

  const myBookings = LS.get('cb_event_bookings', []);
  const bookedEventIds = myBookings.map(b => b.eventId);

  return (
    <div className="dashboard-page-container">
      <CreatorPageHeader
        badge="EVENTS 2027"
        title="CreatorBharat Events"
        subtitle="Exclusive events for verified creators — summits, workshops, and award nights. All events are in 2027."
        icon={Calendar}
      />

      {/* CB Score info banner */}
      <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF1E5 100%)', borderRadius: 20, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, border: '1.5px solid rgba(255,148,49,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,148,49,0.12)', display: 'grid', placeItems: 'center', color: '#FF9431' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Your CB Score</div>
            <div style={{ fontSize: 24, fontWeight: 950, color: '#EA580C' }}>{creatorScore}<span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 600 }}>/100</span></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Workshop eligible', score: 0, color: '#10B981' },
            { label: 'Summit eligible', score: 60, color: '#FF9431' },
            { label: 'Awards eligible', score: 80, color: '#7C3AED' },
          ].map(tier => (
            <div key={tier.label} style={{ padding: '6px 14px', borderRadius: 100, background: creatorScore >= tier.score ? `${tier.color}15` : '#F1F5F9', border: `1px solid ${creatorScore >= tier.score ? `${tier.color}30` : '#E2E8F0'}` }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: creatorScore >= tier.score ? tier.color : '#94A3B8' }}>
                {creatorScore >= tier.score ? '✓' : `${tier.score}+`} {tier.label}
              </span>
            </div>
          ))}
        </div>
        <Btn sm onClick={() => navigate('/creator/score')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)' }}>
          Improve Score <ArrowRight size={14} />
        </Btn>
      </div>

      {/* My Bookings */}
      {myBookings.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 16 }}>My Bookings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myBookings.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#f0fdf4', borderRadius: 16, border: '1px solid #BBF7D0' }}>
                <CheckCircle2 size={20} color="#10B981" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{b.eventTitle}</div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{b.eventDate} · {b.eventLocation}</div>
                </div>
                <Bdg sm color="green">BOOKED</Bdg>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {eventsList.map((event, i) => (
          <EventCard
            key={event.id}
            event={event}
            creatorScore={creatorScore}
            isPro={isPro}
            onBook={setBookingEvent}
            delay={i * 0.08}
          />
        ))}
      </div>

      {/* How CB Score works */}
      <div style={{ marginTop: 48, padding: mob ? 28 : 40, background: '#f8fafc', borderRadius: 32, border: '1px solid #f1f5f9' }}>
        <h3 style={{ fontSize: 20, fontWeight: 950, color: '#0f172a', marginBottom: 8 }}>How CB Score Works</h3>
        <p style={{ fontSize: 14, color: '#64748b', fontWeight: 500, marginBottom: 28, lineHeight: 1.6 }}>
          CB Score is your <strong>platform performance score</strong> — not just followers. It measures your overall impact on CreatorBharat.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { icon: Users, label: 'Followers', pts: '25 pts', desc: 'Social media reach across platforms', color: '#3B82F6' },
            { icon: Zap, label: 'Engagement Rate', pts: '25 pts', desc: 'Content quality & audience interaction', color: '#10B981' },
            { icon: Award, label: 'Brand Collabs', pts: '25 pts', desc: 'Deals completed on CreatorBharat', color: '#FF9431' },
            { icon: Star, label: 'Platform Activity', pts: '25 pts', desc: 'Profile completeness, missions, reviews', color: '#7C3AED' },
          ].map(s => (
            <div key={s.label} style={{ padding: 20, background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: s.color + '12', color: s.color, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <s.icon size={22} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 950, color: s.color, marginBottom: 6 }}>{s.pts}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, lineHeight: 1.4 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingEvent && (
          <BookingModal
            event={bookingEvent}
            onClose={() => setBookingEvent(null)}
            onConfirm={handleConfirmBooking}
            isPro={isPro}
            creatorScore={creatorScore}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
