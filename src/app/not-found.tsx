export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#18181f] border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-[#D4AF37]">
        <span className="font-serif-luxury font-black text-xl">404</span>
      </div>
      <h2 className="text-2xl font-serif-luxury font-bold text-white mb-2">
        Garment Dossier Not Found
      </h2>
      <p className="text-xs sm:text-sm text-zinc-400 mb-6 max-w-md">
        The requested look or dossier is unavailable or has been archived.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-gold"
      >
        Return to Atelier
      </a>
    </div>
  );
}
