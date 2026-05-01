"use client";
import { useState, useEffect, use } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addDays, isWithinInterval } from 'date-fns';
import Link from 'next/link';

export default function PropertyPage({ params }) {
  const { id: propertyId } = use(params);
  const [property, setProperty] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [bookedDates, setBookedDates] = useState([]);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 1. Fetch Property Details
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p.id.toString() === propertyId);
        setProperty(found);
      });

    // 2. Fetch Availability
    fetch(`/api/availability?propertyId=${propertyId}`)
      .then(res => res.json())
      .then(data => {
        const intervals = data.bookings.map(b => ({
          start: new Date(b.start_date),
          end: new Date(b.end_date)
        }));
        setBookedDates(intervals);
      });
  }, [propertyId]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    
    setIsProcessing(true);
    setStatus({ type: 'info', msg: 'Processing payment...' });

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: parseInt(propertyId),
          guestName,
          email,
          startDate: checkIn.toISOString().split('T')[0],
          endDate: checkOut.toISOString().split('T')[0],
          paymentMethod: 'Test Card (4242)'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', msg: `Booking Confirmed! Your stay at "${property.title}" is reserved.` });
        setCheckIn(null);
        setCheckOut(null);
        setGuestName('');
        setEmail('');
      } else {
        setStatus({ type: 'error', msg: data.error });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Something went wrong. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!property) return <div className="container" style={{ padding: '5rem' }}>Loading property...</div>;

  const totalNights = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="container">
      <nav className="navbar">
        <Link href="/" className="brand">VillaLuxe</Link>
        <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--text-dark)', fontWeight: '600' }}>Host Dashboard</Link>
      </nav>

      <div className="hero">
        <img src={property.image_url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2000&auto=format&fit=crop'} alt={property.title} />
      </div>

      <div className="property-layout">
        <div className="property-details">
          <div className="details-section">
            <h1>{property.title}</h1>
            <p style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>Entire villa in {property.city}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', color: 'var(--text-dark)', fontWeight: '600' }}>
              <span>8 guests</span> • <span>4 bedrooms</span> • <span>4 beds</span> • <span>4.5 baths</span>
            </div>
          </div>

          <div className="details-section">
            <h2>What this place offers</h2>
            <div className="amenities-grid">
              <div className="amenity-item">🌊 Beach access</div>
              <div className="amenity-item">🏊 Private pool</div>
              <div className="amenity-item">🍳 Kitchen</div>
              <div className="amenity-item">📶 Fast wifi</div>
              <div className="amenity-item">🚗 Free parking</div>
              <div className="amenity-item">❄️ Air conditioning</div>
            </div>
          </div>

          <div className="details-section">
            <h2>Location</h2>
            <p>{property.city}, United Arab Emirates</p>
            <div style={{ width: '100%', height: '300px', backgroundColor: '#eee', borderRadius: '12px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               Map View (Simulated)
            </div>
          </div>
        </div>

        <div className="booking-widget-wrapper">
          <div className="booking-widget">
            <div className="price-header">
              <span className="amount">${property.price}</span>
              <span className="night">night</span>
            </div>

            <form onSubmit={handleBooking}>
              <div className="form-group">
                <div className="form-row">
                  <div>
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
                      portalId="root-portal"
                      required 
                    />
                  </div>
                  <div>
                    <label className="form-label">Check-out</label>
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
                      portalId="root-portal"
                      required 
                    />
                  </div>
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Enter your name" required />
                </div>
                <div style={{ padding: '0.75rem', borderTop: '1px solid #b0b0b0' }}>
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email for confirmation" required />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {totalNights > 0 && (
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                     <span>${property.price} x {totalNights} nights</span>
                     <span>${property.price * totalNights}</span>
                   </div>
                )}
                <button type="submit" className="btn-primary" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Reserve & Pay Now'}
                </button>
              </div>
            </form>

            {status.msg && (
              <div className={`notification ${status.type}`}>
                {status.msg}
              </div>
            )}
            
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
              You won't be charged yet (Test Mode)
            </p>
          </div>
        </div>
      </div>
      <div id="root-portal"></div>
    </div>
  );
}
