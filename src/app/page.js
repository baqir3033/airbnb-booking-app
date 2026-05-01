"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => setProperties(data));
  }, []);

  const filteredProperties = properties.filter(p => 
    p.city.toLowerCase().includes(search.toLowerCase()) || 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <nav className="navbar">
        <Link href="/" className="brand">VillaLuxe</Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--text-dark)', fontWeight: '600' }}>Host Dashboard</Link>
        </div>
      </nav>

      <section className="hero">
        <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2000&auto=format&fit=crop" alt="Luxury Home" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Find your next luxury stay</h1>
          <p>Hand-picked premium homes synced with Airbnb</p>
          
          <div className="booking-widget" style={{ marginTop: '2rem', padding: '1rem', background: 'white', color: 'black', maxWidth: '600px' }}>
            <div className="form-group" style={{ border: 'none' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search by city (e.g. Dubai, London, Bali)" 
                style={{ fontSize: '1.2rem', padding: '0.5rem' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ margin: '4rem 0' }}>
        <h2 style={{ marginBottom: '2rem' }}>Featured Listings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
          {filteredProperties.length > 0 ? (
            filteredProperties.map(prop => (
              <Link href={`/property/${prop.id}`} key={prop.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="property-card" style={{ transition: 'transform 0.3s ease' }}>
                  <div style={{ width: '100%', height: '250px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={prop.image_url || 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop'} 
                      alt={prop.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1.1rem' }}>{prop.title}</h3>
                      <div style={{ fontWeight: '600' }}>★ 4.9</div>
                    </div>
                    <p style={{ color: 'var(--text-light)', margin: '0.25rem 0' }}>{prop.city}</p>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>${prop.price}</span> 
                      <span style={{ color: 'var(--text-light)' }}> / night</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>No listings found matching your search.</p>
          )}
        </div>
      </section>
    </div>
  );
}
