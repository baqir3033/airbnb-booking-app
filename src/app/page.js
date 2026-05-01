"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Home() {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);

  const pricePerNight = 450;
  
  useEffect(() => {
    // Fetch availability on load
    fetch('/api/availability')
      .then(res => res.json())
      .then(data => {
        if (data.bookings) {
          const disabled = data.bookings.map(b => ({
            start: new Date(b.start_date + 'T00:00:00'),
            end: new Date(b.end_date + 'T00:00:00')
          }));
          setBookedDates(disabled);
        }
      })
      .catch(err => console.error("Could not fetch availability", err));
  }, []);

  const getDays = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = getDays();

  const isRangeBooked = (start, end) => {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (bookedDates.some(range => d >= range.start && d <= range.end)) return true;
    }
    return false;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut || !name || !email) {
      setStatus({ type: 'error', message: 'Please fill out all fields.' });
      return;
    }

    if (checkIn >= checkOut) {
      setStatus({ type: 'error', message: 'Check-out date must be after check-in.' });
      return;
    }

    if (isRangeBooked(checkIn, checkOut)) {
      setStatus({ type: 'error', message: 'Some dates in your selection are already booked on Airbnb.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    // Formatter to avoid timezone issues: YYYY-MM-DD
    const formatDate = d => {
        const offset = d.getTimezoneOffset();
        const date = new Date(d.getTime() - (offset*60*1000));
        return date.toISOString().split('T')[0];
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName: name, email, startDate: formatDate(checkIn), endDate: formatDate(checkOut) }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book');
      }

      setStatus({ type: 'success', message: 'Booking confirmed successfully!' });
      
      setBookedDates(prev => [...prev, { start: checkIn, end: checkOut }]);

      setCheckIn(null);
      setCheckOut(null);
      setName('');
      setEmail('');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className="hero">
        <Image src="/hero.png" alt="Luxury Villa" fill priority style={{ objectFit: 'cover' }} />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Escape to Paradise</h1>
          <p>Experience unparalleled luxury in our exclusive modern villa.</p>
        </div>
      </section>

      <section className="property-layout">
        <div className="property-details">
          <div className="details-section">
            <h2>About this space</h2>
            <p>
              Nestled in a serene landscape, VillaLuxe offers a perfect blend of modern architecture and natural beauty. 
              Featuring an infinity pool, panoramic sunset views, and state-of-the-art amenities, it's your ultimate retreat.
            </p>
          </div>
          
          <div className="details-section" id="amenities">
            <h2>What this place offers</h2>
            <div className="amenities-grid">
              <div className="amenity-item">✓ Infinity Pool</div>
              <div className="amenity-item">✓ Fast Wi-Fi</div>
              <div className="amenity-item">✓ Free Parking</div>
              <div className="amenity-item">✓ Smart TV</div>
              <div className="amenity-item">✓ Full Kitchen</div>
              <div className="amenity-item">✓ Air Conditioning</div>
            </div>
          </div>
        </div>

        <div className="booking-widget-wrapper">
          <div className="booking-widget">
            <div className="price-header">
              <span className="amount">${pricePerNight}</span>
              <span className="night">/ night</span>
            </div>

            <form onSubmit={handleBooking}>
              <div className="form-group">
                <div className="form-row">
                  <div style={{ position: 'relative' }}>
                    <label className="form-label">Check-in</label>
                    <DatePicker 
                      selected={checkIn} 
                      onChange={(date) => setCheckIn(date)} 
                      selectsStart 
                      startDate={checkIn} 
                      endDate={checkOut} 
                      minDate={new Date()} 
                      excludeDateIntervals={bookedDates}
                      className="form-input" 
                      placeholderText="Add date" 
                      required 
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <label className="form-label">Checkout</label>
                    <DatePicker 
                      selected={checkOut} 
                      onChange={(date) => setCheckOut(date)} 
                      selectsEnd 
                      startDate={checkIn} 
                      endDate={checkOut} 
                      minDate={checkIn || new Date()} 
                      excludeDateIntervals={bookedDates}
                      className="form-input" 
                      placeholderText="Add date" 
                      required 
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: '1rem', borderBottom: 'none' }}>
                <div className="form-row" style={{ flexDirection: 'column', borderBottom: 'none' }}>
                  <div style={{ borderRight: 'none', borderBottom: '1px solid #b0b0b0' }}>
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div style={{ borderRight: 'none' }}>
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
              </div>

              {nights > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid #ebebeb', paddingTop: '1rem' }}>
                  <span>${pricePerNight} x {nights} nights</span>
                  <span>${pricePerNight * nights}</span>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem' }} disabled={loading}>
                {loading ? 'Processing...' : 'Reserve'}
              </button>

              {status.message && (
                <div className={`notification ${status.type}`}>
                  {status.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
