export default function AppFooter() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6 py-3 pb-[max(12px,env(safe-area-inset-bottom))] text-[11px] sm:text-xs text-gray-400 text-center sm:text-left leading-relaxed">
      <span>
        Note: Semua prediksi bersifat indikatif berdasarkan model AI (XGBoost).
        Validasi lapangan tetap diperlukan sebelum implementasi kebijakan.
      </span>
      <span className="shrink-0 text-[10px] sm:text-xs">© 2026 Wolftagon. All rights reserved.</span>
    </div>
  );
}
