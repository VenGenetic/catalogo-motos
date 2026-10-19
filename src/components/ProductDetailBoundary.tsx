import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCw, X } from 'lucide-react';

interface BoundaryProps {
  children: ReactNode;
  onClose: () => void;
}

interface BoundaryState {
  hasError: boolean;
}

export class ProductDetailBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('No se pudo abrir el detalle del producto', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="viewport-fill fixed inset-0 z-modal flex items-center justify-center bg-brand-bg/90 p-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="product-detail-error-title"
      >
        <div className="w-full max-w-sm rounded-2xl border border-ui-border bg-ui-surface p-6 text-center shadow-2xl">
          <AlertCircle className="mx-auto mb-4 text-brand-orange-action dark:text-brand-orange" size={36} />
          <h2 id="product-detail-error-title" className="text-lg font-black text-ui-ink">
            No pudimos abrir este repuesto
          </h2>
          <p className="mt-2 text-sm text-ui-copy">
            Cierra la ficha e intenta nuevamente. Si persiste, recarga la pagina.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={this.props.onClose}
              className="touch-target flex items-center justify-center gap-2 rounded-xl border border-ui-border bg-ui-muted px-3 font-bold text-ui-ink"
            >
              <X size={18} /> Cerrar
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="touch-target flex items-center justify-center gap-2 rounded-xl bg-brand-orange-action px-3 font-bold text-white"
            >
              <RotateCw size={18} /> Recargar
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export const ProductDetailLoader = () => (
  <div
    className="viewport-fill fixed inset-0 z-modal flex items-center justify-center bg-brand-bg/70"
    role="status"
    aria-label="Cargando detalle del repuesto"
  >
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-brand-orange" />
  </div>
);
