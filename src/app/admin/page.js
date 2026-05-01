"use client";
import { useState } from 'react';

export default function Admin() {
  const [icalUrl, setIcalUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  const handleSync = async () => {
    if (!icalUrl) {
      setSyncStatus('Please enter an Airbnb iCal link.');
      return;
    }
    setSyncStatus('Syncing from Airbnb...');
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: icalUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus(`Success! Imported ${data.imported} bookings from Airbnb into your website.`);
      } else {
        setSyncStatus('Error: ' + data.error);
      }
    } catch (e) {
      setSyncStatus('Failed to sync. Make sure the URL is correct.');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '5rem', minHeight: '80vh' }}>
      <h1>Host Dashboard</h1>
      
      <div className="booking-widget" style={{ marginTop: '2rem' }}>
        <h2>1. Import Bookings FROM Airbnb</h2>
        <p style={{ marginBottom: '1rem' }}>Paste your Airbnb Calendar Export link here. This will block those dates out on your website's calendar so no one can double-book them.</p>
        <input 
          type="text" 
          className="form-input" 
          placeholder="https://www.airbnb.com/calendar/ical/..." 
          value={icalUrl} 
          onChange={e => setIcalUrl(e.target.value)} 
          style={{ border: '1px solid #b0b0b0', padding: '1rem', borderRadius: '8px', width: '100%' }}
        />
        <button onClick={handleSync} className="btn-primary" style={{ marginTop: '1rem' }}>Sync Airbnb to Website</button>
        {syncStatus && <div className={`notification ${syncStatus.includes('Error') || syncStatus.includes('Please') ? 'error' : 'success'}`}>{syncStatus}</div>}
        
        <h2 style={{ marginTop: '3rem' }}>2. Export Bookings TO Airbnb</h2>
        <p>To block out the bookings made on your website over on Airbnb, go to your Airbnb Host Calendar settings, click <strong>"Import Calendar"</strong>, and paste this exact link:</p>
        <code style={{ display: 'block', background: '#f4f4f4', border: '1px solid #ddd', padding: '1rem', marginTop: '1rem', borderRadius: '8px', wordBreak: 'break-all' }}>
          https://airbnb-booking-app.vercel.app/api/ical
        </code>
      </div>
    </div>
  );
}
