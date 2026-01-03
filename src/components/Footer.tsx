export const Footer = () => {
  return (
    // pb-32 en móvil evita que el BottomNav tape el contenido
    // md:pb-12 restablece el padding normal en computadoras
    <footer className="bg-slate-900 text-gray-500 py-12 text-center text-sm pb-32 md:pb-12 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-2">
        <p className="font-semibold text-gray-400">
          &copy; {new Date().getFullYear()} LV PARTS.
        </p>
        <p className="text-xs text-gray-600">
          Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};