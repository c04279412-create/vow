import './globals.css';

export const metadata = {
  title: 'VowCrafts | Bespoke Wedding Frames & Luxury Gifts',
  description: 'Premium handcrafted wedding frames, Nikkah certificates, and custom romantic keepsakes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FAF7F2] text-[#1A1817] antialiased selection:bg-[#EEDDA9] selection:text-[#473312]">
        {children}
      </body>
    </html>
  );
}
