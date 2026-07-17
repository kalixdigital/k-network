// components/contact/ContactMap.tsx
export default function ContactMap() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 h-[300px] sm:h-[400px]">
        {/* Google Maps Embed */}
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.73539736657!2d3.119619072782223!3d6.548718259233301!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2s!4v1700000000000"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="filter grayscale hover:grayscale-0 transition-all duration-500"
          title="K-NETWORK Location"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/50 to-transparent" />
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800">
          📍 Lagos, Nigeria
        </div>
      </div>
    </section>
  );
}