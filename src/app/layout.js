import "./globals.css";

export const metadata = {
  title: "Luxury Villa | Direct Booking",
  description: "Book our premium luxury villa directly and save on fees.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="navbar">
            <a href="/" className="brand">VillaLuxe</a>
            <nav>
              <a href="#amenities" style={{marginRight: '1rem', color: 'var(--text-dark)', textDecoration: 'none'}}>Amenities</a>
              <a href="#location" style={{color: 'var(--text-dark)', textDecoration: 'none'}}>Location</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
