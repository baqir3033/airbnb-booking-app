"use client";
import { useState, useEffect } from 'react';

export default function Admin() {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({ title: '', city: '', price: '', image_url: '', airbnb_ical_url: '' });
  const [status, setStatus] = useState('');
  const [syncingId, setSyncingId] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const res = await fetch('/api/properties');
    const data = await res.json();
    if (res.ok) setProperties(data);
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setStatus('Adding property...');
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProperty)
      });
      if (res.ok) {
        setStatus('Property added successfully!');
        setNewProperty({ title: '', city: '', price: '', image_url: '', airbnb_ical_url: '' });
        fetchProperties();
      } else {
        const err = await res.json();
        setStatus('Error: ' + err.error);
      }
    } catch (e) {
      setStatus('Failed to add property.');
    }
  };

  const handleSync = async (property) => {
    if (!property.airbnb_ical_url) {
      alert('Please add an Airbnb iCal link for this property first.');
      return;
    }
    setSyncingId(property.id);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: property.airbnb_ical_url, propertyId: property.id })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Success! Imported ${data.imported} bookings for "${property.title}".`);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      alert('Failed to sync.');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
      <h1>Host Marketplace Manager</h1>

      <section className="booking-widget" style={{ marginTop: '2rem' }}>
        <h2>Add New Property</h2>
        <form onSubmit={handleAddProperty} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div className="form-group">
             <div className="form-row">
               <div>
                 <label className="form-label">Property Title</label>
                 <input type="text" className="form-input" placeholder="e.g. Luxury Beachfront Villa" value={newProperty.title} onChange={e => setNewProperty({...newProperty, title: e.target.value})} required />
               </div>
               <div>
                 <label className="form-label">City</label>
                 <input type="text" className="form-input" placeholder="e.g. Dubai" value={newProperty.city} onChange={e => setNewProperty({...newProperty, city: e.target.value})} required />
               </div>
             </div>
             <div className="form-row">
               <div>
                 <label className="form-label">Price per Night ($)</label>
                 <input type="number" className="form-input" placeholder="250" value={newProperty.price} onChange={e => setNewProperty({...newProperty, price: e.target.value})} required />
               </div>
               <div>
                 <label className="form-label">Image URL</label>
                 <input type="text" className="form-input" placeholder="https://image-link.com/photo.jpg" value={newProperty.image_url} onChange={e => setNewProperty({...newProperty, image_url: e.target.value})} />
               </div>
             </div>
          </div>
          <div className="form-group">
            <div style={{ padding: '0.75rem' }}>
              <label className="form-label">Airbnb iCal Export URL (For 2-Way Sync)</label>
              <input type="text" className="form-input" placeholder="https://www.airbnb.com/calendar/ical/..." value={newProperty.airbnb_ical_url} onChange={e => setNewProperty({...newProperty, airbnb_ical_url: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Create Listing</button>
        </form>
        {status && <p style={{ marginTop: '1rem', color: status.includes('Error') ? 'red' : 'green' }}>{status}</p>}
      </section>

      <section style={{ marginTop: '4rem' }}>
        <h2>Your Managed Listings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
          {properties.map(prop => (
            <div key={prop.id} className="booking-widget" style={{ padding: '1rem' }}>
              <img src={prop.image_url || '/api/placeholder/400/250'} alt={prop.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', height: '150px', objectFit: 'cover' }} />
              <h3>{prop.title}</h3>
              <p>{prop.city} • ${prop.price}/night</p>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleSync(prop)} 
                  className="btn-primary" 
                  style={{ background: '#00a699' }}
                  disabled={syncingId === prop.id}
                >
                  {syncingId === prop.id ? 'Syncing...' : 'Sync from Airbnb'}
                </button>
                
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  <strong>iCal Export URL (Paste this INTO Airbnb):</strong>
                  <code style={{ display: 'block', background: '#f4f4f4', padding: '0.5rem', marginTop: '0.25rem', borderRadius: '4px', wordBreak: 'break-all' }}>
                    {window.location.origin}/api/ical?propertyId={prop.id}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
