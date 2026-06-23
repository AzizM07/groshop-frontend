import { C } from './constants'

export default function AuthStyles() {
  return (
    <style>{`
      .social-card { transition: all 0.15s ease; cursor: pointer; }
      .social-card:hover {
        background: #fff !important;
        border-color: ${C.primary} !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(0,0,0,0.06);
      }
      .btn-primary { transition: all 0.15s ease; }
      .btn-primary:hover:not(:disabled) {
        background: ${C.primaryDark} !important;
        transform: translateY(-1px);
        box-shadow: 0 12px 28px rgba(255,107,53,0.50) !important;
      }
      .link-hover { transition: color 0.15s; }
      .link-hover:hover { color: ${C.primaryDark} !important; }
      .supplier-cta { transition: all 0.18s; cursor: pointer; }
      .supplier-cta:hover {
        background: ${C.primaryLight} !important;
        border-color: ${C.primaryBorder} !important;
      }
      @media (min-width: 1024px) {
        .lg-left  { display: flex !important; }
        .lg-wave  { display: block !important; }
      }
    `}</style>
  )
}