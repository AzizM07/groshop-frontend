import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star, StarHalf, Heart, Share2, ShoppingCart, MessageCircle,
  Store, MapPin, BadgeCheck, ChevronRight, ChevronDown, ChevronUp, ChevronLeft,
  ZoomIn, Check, Truck, Minus, Plus, Clock, Award, ThumbsUp, X, Camera,
  ShieldCheck, PackageCheck, Search
} from "lucide-react";
import { products as productsApi } from "../lib/api";

/* ── Police GROSHOP : Fraunces (display) + DM Sans (corps) ── */
if (typeof document !== "undefined" && !document.getElementById("groshop-fonts")) {
  const l = document.createElement("link");
  l.id = "groshop-fonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap";
  document.head.appendChild(l);
}
const DISPLAY = "'Fraunces', Georgia, serif";
const BODY    = "'DM Sans', system-ui, sans-serif";

/* ── couleurs ── */
const ORANGE = "#FF4500";
const YELLOW = "#FFB800";
const INK    = "#0F1419";
const MUTE   = "#6B7785";
const FAINT  = "#9AA3AE";
const LINE   = "#ECEEF1";

/* ════════════════════════════════════════════════════════════════
   PRODUCT CARD — collée ici, réutilisée dans les carrousels
   ════════════════════════════════════════════════════════════════ */
function fmtRange(p) {
  const f = n => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return Array.isArray(p) ? `${f(p[0])}–${f(p[1])}` : f(p);
}
function ProductCard({ product, onOrder }) {
  const [hov, setHov] = useState(false);
  const {
    name = "Produit", price = 0, was = null, discount = null,
    rating = null, soldCount = null, reviewCount = null, image = null,
    isFreeShipping = false, isBestSeller = false, moq = null, moqUnit = "pcs",
  } = product || {};

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: `1px solid ${hov ? "#FFD2C2" : LINE}`, cursor: "pointer",
        transition: "box-shadow .2s, transform .2s, border-color .2s",
        boxShadow: hov ? "0 12px 30px rgba(15,20,25,.12)" : "0 1px 4px rgba(15,20,25,.05)",
        transform: hov ? "translateY(-3px)" : "none",
        display: "flex", flexDirection: "column", fontFamily: BODY,
      }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "#F7F8FA", overflow: "hidden" }}>
        {image
          ? <img src={image} alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .35s", transform: hov ? "scale(1.05)" : "scale(1)" }}
              onError={e => { e.target.src = "https://placehold.co/300x300/F4F5F7/9AA3AE?text=GROSHOP"; }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#C0C6CC", fontSize: 13 }}>Pas d'image</div>}
        <div style={{ position: "absolute", bottom: 12, left: 12, width: 32, height: 32, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.18)", opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(4px)", transition: "opacity .2s, transform .2s" }}>
          <Search size={15} color={MUTE} />
        </div>
      </div>
      <div style={{ padding: "11px 12px 13px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 14.5, color: INK, lineHeight: 1.32, fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 38 }}>{name}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, whiteSpace: "nowrap", overflow: "hidden" }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 700, color: INK, lineHeight: 1, flexShrink: 0 }}>{fmtRange(price)} <span style={{ fontSize: 13, fontWeight: 600 }}>TND</span></span>
          {was && <span style={{ fontSize: 12, color: FAINT, textDecoration: "line-through", flexShrink: 0 }}>{fmtRange(was)} TND</span>}
        </div>
        {moq && <div style={{ fontSize: 12.5, color: MUTE }}>Quantité min. : <strong style={{ color: INK, fontWeight: 600 }}>{moq} {moqUnit}</strong></div>}
        {(rating || soldCount) && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span style={{ display: "flex", gap: 1 }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={rating && s <= Math.round(rating) ? YELLOW : LINE} stroke="none" />)}
            </span>
            {rating && <span style={{ fontSize: 12, color: MUTE, fontWeight: 600 }}>{rating.toFixed(1)}</span>}
            {soldCount != null && <span style={{ fontSize: 12, color: FAINT }}>· {soldCount >= 1000 ? (soldCount/1000).toFixed(1)+"k" : soldCount} vendus</span>}
          </div>
        )}
        <button onClick={e => { e.stopPropagation(); onOrder?.(product); }}
          style={{ marginTop: 5, width: "100%", padding: 9, background: hov ? ORANGE : "#fff", color: hov ? "#fff" : ORANGE, border: `1.5px solid ${ORANGE}`, borderRadius: 999, fontFamily: BODY, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background .18s, color .18s" }}>
          Commander
        </button>
      </div>
    </div>
  );
}

/* mapping données API (ProductListSerializer) → props ProductCard, pour les carrousels */
const toCard = (p) => {
  const img = p.primary_image || null;
  const newP = parseFloat(p.base_price_tnd) || 0;
  const oldP = p.old_price_tnd ? parseFloat(p.old_price_tnd) : null;
  return {
    id: p.id,
    name: p.name, price: newP, was: oldP,
    discount: oldP ? Math.round((1 - newP / oldP) * 100) : null,
    rating: p.rating_avg ? parseFloat(p.rating_avg) : null,
    reviewCount: p.rating_count || null,
    soldCount: p.sold_count || null, moq: p.moq, moqUnit: p.unit, image: img,
    isFreeShipping: p.is_free_shipping || false, isBestSeller: (p.sold_count || 0) > 150,
  };
};

// ── Helpers ─────────────────────────────────────────────────────
const fmtDT = (n) => new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 3 }).format(n) + " TND";

const Stars = ({ value = 0, size = 14, showEmpty = true }) => {
  const full = Math.floor(value), half = value - full >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-[2px]">
      {Array(full).fill(0).map((_, i) => <Star key={"f"+i} size={size} fill={YELLOW} stroke="none" />)}
      {half && <StarHalf size={size} fill={YELLOW} stroke="none" />}
      {showEmpty && Array(empty).fill(0).map((_, i) => <Star key={"e"+i} size={size} fill="#E5E7EB" stroke="none" />)}
    </span>
  );
};

// ── Image Gallery ────────────────────────────────────────────────
const THUMB_VISIBLE = 5, THUMB_H = 80, THUMB_GAP = 10;
const ImageGallery = ({ images, wishlistBtn, shareBtn }) => {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [thumbOffset, setThumbOffset] = useState(0);
  const imgRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 });
  }, []);

  const go = (dir) => {
    const ni = (active + dir + images.length) % images.length;
    setActive(ni);
    if (ni < thumbOffset) setThumbOffset(ni);
    if (ni >= thumbOffset + THUMB_VISIBLE) setThumbOffset(ni - THUMB_VISIBLE + 1);
  };

  if (!images.length) {
    return (
      <div className="aspect-square rounded-[20px] bg-[#F7F8FA] border border-[#ECEEF1] flex items-center justify-center text-[#9AA3AE] text-sm">
        Pas d'image
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start" style={{ fontFamily: BODY }}>
      {images.length > 1 && (
        <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: THUMB_H }}>
          <button onClick={() => setThumbOffset(o => Math.max(0, o - 1))} disabled={thumbOffset === 0}
            className="w-full flex justify-center py-1 rounded-lg hover:bg-gray-100 disabled:opacity-20 transition-colors">
            <ChevronUp size={16} className="text-[#6B7785]" />
          </button>
          <div className="overflow-hidden flex flex-col gap-2" style={{ height: THUMB_VISIBLE * THUMB_H + (THUMB_VISIBLE - 1) * THUMB_GAP }}>
            <div className="flex flex-col gap-2 transition-transform duration-300" style={{ transform: `translateY(-${thumbOffset * (THUMB_H + THUMB_GAP)}px)` }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActive(i)} style={{ width: THUMB_H, height: THUMB_H }}
                  className={"flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all " + (active === i ? "border-[#FF4500]" : "border-gray-100 hover:border-gray-300")}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = "https://placehold.co/80x80/F8F8FB/9AA3AE?text=img"; }} />
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setThumbOffset(o => Math.min(o + 1, Math.max(0, images.length - THUMB_VISIBLE)))}
            disabled={thumbOffset >= images.length - THUMB_VISIBLE}
            className="w-full flex justify-center py-1 rounded-lg hover:bg-gray-100 disabled:opacity-20 transition-colors">
            <ChevronDown size={16} className="text-[#6B7785]" />
          </button>
        </div>
      )}
      <div className="flex-1 min-w-0 relative group">
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">{wishlistBtn}{shareBtn}</div>
        <div className="rounded-[20px] overflow-hidden bg-white border border-[#ECEEF1] relative">
          <div ref={imgRef} className="aspect-square overflow-hidden cursor-zoom-in flex items-center justify-center"
            onMouseEnter={() => setZoomed(true)} onMouseLeave={() => setZoomed(false)} onMouseMove={handleMouseMove}>
            <img src={images[active]?.url} alt="Produit" className="w-full h-full object-cover transition-transform duration-150"
              style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: "scale(2.2)" } : {}}
              onError={e => { e.target.src = "https://placehold.co/600x600/F8F8FB/9AA3AE?text=Image"; }} />
          </div>
          {images.length > 1 && (
            <>
              <button onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#0F1419] hover:scale-105 transition-transform opacity-0 group-hover:opacity-100">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#0F1419] hover:scale-105 transition-transform">
                <ChevronRight size={18} />
              </button>
            </>
          )}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/85 backdrop-blur-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn size={12} className="text-[#6B7785]" />
            <span className="text-[10px] text-[#9AA3AE] font-medium">Survolez pour zoomer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  COLONNE MILIEU
// ════════════════════════════════════════════════════════════════
const ProductInfo = ({ product, color, setColor }) => (
  <div className="min-w-0 rounded-[20px] bg-white p-6 space-y-4 border border-[#ECEEF1]" style={{ boxShadow: "0 2px 20px rgba(15,20,25,0.05)", fontFamily: BODY }}>
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <h1 className="text-[22px] font-bold leading-snug flex-1 min-w-[220px]" style={{ color: INK }}>{product.name}</h1>
      <button className="text-sm font-medium hover:underline whitespace-nowrap" style={{ color: ORANGE }}>Donner votre avis !</button>
    </div>

    <div className="flex items-center gap-3 flex-wrap">
      <span className="inline-flex items-center gap-1.5 font-semibold text-green-600 text-sm">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {product.stock_qty > 0 ? "En stock" : "Rupture de stock"}
      </span>
      <span className="text-gray-200">|</span>
      <Stars value={product.rating_avg} size={14} />
      <span className="text-xs text-[#9AA3AE]">{product.rating_count} avis</span>
      <span className="text-gray-200">|</span>
      <span className="text-xs text-[#9AA3AE]">{product.sold_count} vendus</span>
    </div>

    {(product.brand || product.reference) && (
      <div className="flex items-center gap-5 flex-wrap pb-3 border-b border-[#ECEEF1] text-sm">
        {product.brand && <div className="text-[#6B7785]">Marque : <span className="font-semibold text-[#0F1419]">{product.brand}</span></div>}
        {product.reference && <div className="text-[#6B7785]">Référence # : <span className="font-semibold text-[#0F1419]">{product.reference}</span></div>}
      </div>
    )}

    {product.description && <p className="text-sm leading-relaxed text-[#6B7785]">{product.description}</p>}

    {product.specs?.length > 0 && (
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-[#0F1419]" style={{ fontFamily: DISPLAY }}>Caractéristiques principales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-0 rounded-2xl border border-[#ECEEF1] overflow-hidden">
          {product.specs.map((s, i) => (
            <div key={i} className={"flex justify-between gap-3 px-3.5 py-2.5 text-sm " + (Math.floor(i / 2) % 2 ? "bg-[#FAFAFB]" : "bg-white")}>
              <span className="text-[#9AA3AE]">{s.k}</span>
              <span className="font-semibold text-[#0F1419] text-right">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {product.variants?.length > 0 && (
      <div className="space-y-2">
        <span className="text-sm font-semibold text-[#0F1419]">Variante : <span className="text-[#6B7785] font-normal">{product.variants.find(c => c.id === color)?.name}</span></span>
        <div className="flex gap-2.5">
          {product.variants.map(c => (
            <button key={c.id} onClick={() => setColor(c.id)}
              className={"w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center bg-[#F7F8FA] " + (color === c.id ? "border-[#FF4500]" : "border-gray-100 hover:border-gray-300")}>
              {c.image_url
                ? <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" onError={e => { e.target.src = "https://placehold.co/48x48/F8F8FB/9AA3AE?text=•"; }} />
                : <span className="text-[10px] text-[#6B7785] font-medium px-1 text-center leading-tight">{c.name}</span>}
            </button>
          ))}
        </div>
      </div>
    )}

  </div>
);

// ── Bandeau livraison + délai estimé (style liste, prix venant du fournisseur) ──
const ShippingBlock = ({ product }) => {
  const shippingPrice = parseFloat(product.shipping_price_tnd) || 0;
  const days = product.delivery_days || 3;

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + days);
  const formattedDate = estimatedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  const rows = [
    { icon: Truck, label: "Livraison", value: shippingPrice > 0 ? fmtDT(shippingPrice) : "Gratuite" },
    { icon: Clock, label: "Réception estimée", value: formattedDate },
  ];

  return (
    <div className="rounded-[20px] bg-white overflow-hidden border border-[#ECEEF1]" style={{ boxShadow: "0 2px 12px rgba(15,20,25,0.04)", fontFamily: BODY }}>
      {rows.map((r, i) => (
        <div key={i} className="w-full flex items-center gap-3 px-4 py-2.5 text-left border-b border-[#ECEEF1] last:border-0">
          <r.icon size={17} className="flex-shrink-0" style={{ color: ORANGE }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#0F1419] leading-tight">{r.label}</div>
            <div className="text-xs text-[#6B7785]">{r.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  COLONNE DROITE — Buy box
// ════════════════════════════════════════════════════════════════
const BuyBox = ({ product, qty, setQty, onOrder }) => {
  const moq = product.moq || 1;
  const parsedQty = parseInt(qty) || 0;
  const tiers = product.price_tiers || [];
  const activeIdx = tiers.findIndex(t => parsedQty >= t.min_qty && (!t.max_qty || parsedQty <= t.max_qty));
  const activeTier = tiers[activeIdx] || tiers[0];
  const unitPrice = activeTier ? parseFloat(activeTier.price_tnd) : parseFloat(product.base_price_tnd);
  const basePrice = tiers.length ? parseFloat(tiers[0].price_tnd) : parseFloat(product.base_price_tnd);
  const savePct = basePrice ? Math.round((1 - unitPrice / basePrice) * 100) : 0;
  const total = parsedQty * unitPrice;
  const qtyValid = parsedQty >= moq;

  const trust = [
    { icon: ShieldCheck, label: "Paiement sécurisé" },
    { icon: PackageCheck, label: "Livraison suivie" },
    { icon: BadgeCheck, label: "Fournisseur vérifié" },
  ];

  return (
    <div className="space-y-2.5" style={{ fontFamily: BODY }}>
      <div className="rounded-[20px] bg-white p-4 space-y-3 border border-[#ECEEF1]" style={{ boxShadow: "0 4px 24px rgba(15,20,25,0.07)" }}>
        <div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-[26px] leading-none font-bold" style={{ color: ORANGE, fontFamily: DISPLAY }}>{fmtDT(unitPrice)}</div>
            <span className="text-xs text-[#9AA3AE]">/ {product.unit || "pièce"}</span>
          </div>
          {savePct > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-[#9AA3AE] line-through">{fmtDT(basePrice)}</span>
              <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full" style={{ background: ORANGE }}>−{savePct}%</span>
            </div>
          )}
        </div>

        {tiers.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-[#9AA3AE] uppercase tracking-wider mb-1.5">Prix selon la quantité</div>
            <div className="grid grid-cols-2 gap-1.5">
              {tiers.map((t, i) => {
                const isActive = i === activeIdx;
                const label = t.max_qty ? `${t.min_qty}-${t.max_qty} ${product.unit}` : `≥${t.min_qty} ${product.unit}`;
                return (
                  <button key={t.id || i} onClick={() => setQty(String(t.min_qty))}
                    className={"text-left rounded-xl border-2 px-2.5 py-1.5 transition-all " + (isActive ? "border-[#FF4500] bg-[#FFF4F0]" : "border-gray-100 hover:border-gray-300")}>
                    <div className={"text-sm font-bold leading-tight whitespace-nowrap " + (isActive ? "text-[#FF4500]" : "text-[#0F1419]")}>{fmtDT(parseFloat(t.price_tnd))}</div>
                    <div className="text-[10px] text-[#9AA3AE] mt-0.5">{label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-[#6B7785]">MOQ : <span className="font-semibold text-[#0F1419]">{moq} {product.unit}</span></div>
          <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
            <button onClick={() => setQty(q => String(Math.max(moq, (parseInt(q) || moq) - 1)))} className="px-2.5 py-1.5 text-[#6B7785] hover:bg-gray-50"><Minus size={14} /></button>
            <input type="number" value={qty} min={moq} onChange={e => setQty(e.target.value)} className="text-center py-1.5 text-sm font-bold text-[#0F1419] outline-none border-x border-gray-200 w-12" />
            <button onClick={() => setQty(q => String((parseInt(q) || moq) + 1))} className="px-2.5 py-1.5 text-[#6B7785] hover:bg-gray-50"><Plus size={14} /></button>
          </div>
        </div>

        {!qtyValid && <p className="text-[11px] font-medium" style={{ color: ORANGE }}>Quantité minimale : {moq} {product.unit}</p>}

        <div className="flex items-center justify-between text-sm bg-[#FAFAFB] rounded-xl px-3 py-2">
          <span className="text-xs text-[#6B7785]">Total ({parsedQty} {product.unit})</span>
          <span className="text-base font-bold" style={{ color: ORANGE, fontFamily: DISPLAY }}>{fmtDT(total)}</span>
        </div>

        <button disabled={!qtyValid} onClick={() => onOrder?.({ product, qty: parsedQty, unitPrice })}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:brightness-95 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#FF6B35,#FF4500)", boxShadow: qtyValid ? "0 6px 16px rgba(255,69,0,0.3)" : "none" }}>
          <ShoppingCart size={16} /> Ajouter au panier
        </button>

        <button className="w-full py-2.5 rounded-xl border-2 font-semibold text-sm transition-colors hover:bg-[#FFF4F0]" style={{ borderColor: ORANGE, color: ORANGE }}>
          Demander un devis
        </button>

        <div className="grid grid-cols-3 gap-1 pt-1">
          {trust.map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-1 text-center">
              <t.icon size={16} style={{ color: ORANGE }} />
              <span className="text-[10px] leading-tight text-[#6B7785]">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      <ShippingBlock product={product} />
    </div>
  );
};

// ── Supplier Block ───────────────────────────────────────────────
const SupplierBlock = ({ product }) => {
  const stats = [
    { label: "Note boutique", value: (parseFloat(product.supplier_rating) || 0).toFixed(1) + "/5", sub: `(${product.supplier_rating_count || 0})` },
    { label: "Ville", value: product.supplier_city || "—" },
    { label: "Statut", value: product.supplier_verified === 'approved' ? 'Vérifié' : 'En attente' },
  ];
  return (
    <div className="relative rounded-[20px] overflow-hidden border border-[#ECEEF1]" style={{ boxShadow: "0 2px 16px rgba(15,20,25,0.06)", fontFamily: BODY }}>
      {product.supplier_banner && (
        <img src={product.supplier_banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0" style={{
        background: product.supplier_banner
          ? "linear-gradient(180deg, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.93) 100%)"
          : "#FAFAFB",
        backdropFilter: product.supplier_banner ? "blur(2px)" : "none",
      }} />
      <div className="relative px-5 py-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-[64px] h-[64px] rounded-2xl bg-white p-1 shadow-md flex-shrink-0">
            <div className="w-full h-full rounded-xl overflow-hidden bg-[#F4F5F7] flex items-center justify-center">
              {product.supplier_logo
                ? <img src={product.supplier_logo} alt={product.supplier_name} className="w-full h-full object-contain"
                    onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.innerHTML = `<span style="font-weight:700;font-size:24px;color:#FF4500">${(product.supplier_name||'?')[0]}</span>`; }} />
                : <span className="font-bold text-2xl text-[#FF4500]">{(product.supplier_name||'?')[0]}</span>}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-[#0F1419] text-base">{product.supplier_name}</span>
              {product.supplier_verified === 'approved' && <BadgeCheck size={15} fill="#FF4500" stroke="white" />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#6B7785] mt-0.5"><MapPin size={11} />{product.supplier_city}{product.supplier_wilaya ? `, ${product.supplier_wilaya}` : ''}</div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <a href={`/fournisseur/${product.supplier_slug}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white/80 text-sm font-medium text-[#0F1419] hover:border-[#FF4500] hover:text-[#FF4500] transition-colors no-underline"><Store size={14} /> Boutique</a>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF4500] text-white text-sm font-medium hover:bg-[#E03E00] transition-colors"><MessageCircle size={14} /> Contacter</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 rounded-2xl bg-white/70 p-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-base font-bold text-[#0F1419]">{s.value}{s.sub && <span className="text-xs font-normal text-[#9AA3AE] ml-0.5">{s.sub}</span>}</div>
              <div className="text-[11px] text-[#6B7785] leading-tight mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Carrousel produits (utilise ProductCard) ─────────────────────
const ProductCarousel = ({ title, items, onOrder }) => {
  const scrollRef = useRef(null);
  if (!items?.length) return null;
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 480, behavior: "smooth" });
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[20px] font-semibold text-[#0F1419]" style={{ fontFamily: DISPLAY }}>{title}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-[#ECEEF1] bg-white flex items-center justify-center text-[#6B7785] hover:border-[#FF4500] hover:text-[#FF4500] transition-colors"><ChevronLeft size={18} /></button>
          <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-[#ECEEF1] bg-white flex items-center justify-center text-[#6B7785] hover:border-[#FF4500] hover:text-[#FF4500] transition-colors"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}>
        {items.map(p => (
          <div key={p.id} className="flex-shrink-0 w-[224px]" style={{ scrollSnapAlign: "start" }}>
            <ProductCard product={toCard(p)} onOrder={onOrder} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Reviews Section ──────────────────────────────────────────────
const ReviewsSection = ({ reviews, ratingAvg, ratingCount }) => {
  const [starFilter, setStarFilter] = useState(0);
  const [photosOnly, setPhotosOnly] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const dist = [5, 4, 3, 2, 1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length }));
  const totalPhotos = reviews.reduce((n, r) => n + (r.photos?.length || 0), 0);
  const allPhotos = reviews.flatMap(r => (r.photos || []).map((p, i) => ({ url: p.url, photos: r.photos, index: i })));
  const filtered = reviews.filter(r =>
    (starFilter === 0 || r.rating === starFilter) &&
    (!photosOnly || (r.photos && r.photos.length > 0))
  );

  const openLightbox = (photos, index) => setLightbox({ photos, index });
  const closeLightbox = () => setLightbox(null);
  const navLightbox = (dir) => setLightbox(lb => {
    if (!lb) return lb;
    const i = (lb.index + dir + lb.photos.length) % lb.photos.length;
    return { ...lb, index: i };
  });

  if (reviews.length === 0) {
    return (
      <section className="rounded-[20px] bg-white p-6 border border-[#ECEEF1]" style={{ boxShadow: "0 2px 16px rgba(15,20,25,0.05)", fontFamily: BODY }}>
        <h2 className="text-[20px] font-semibold text-[#0F1419] mb-2" style={{ fontFamily: DISPLAY }}>Avis sur le produit</h2>
        <p className="text-sm text-[#9AA3AE]">Aucun avis pour ce produit pour le moment.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[20px] bg-white p-6 border border-[#ECEEF1]" style={{ boxShadow: "0 2px 16px rgba(15,20,25,0.05)", fontFamily: BODY }}>
      <h2 className="text-[20px] font-semibold text-[#0F1419] mb-5" style={{ fontFamily: DISPLAY }}>Avis sur le produit</h2>

      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 pb-5 border-b border-[#ECEEF1]">
        <div className="flex flex-col items-center justify-center sm:w-40 flex-shrink-0">
          <div className="text-4xl font-bold text-[#0F1419]" style={{ fontFamily: DISPLAY }}>{ratingAvg.toFixed(1)}</div>
          <Stars value={ratingAvg} size={16} />
          <div className="text-xs text-[#9AA3AE] mt-1">{ratingCount} avis</div>
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          {dist.map(d => {
            const pct = reviews.length ? Math.round((d.count / reviews.length) * 100) : 0;
            return (
              <button key={d.star} onClick={() => setStarFilter(f => f === d.star ? 0 : d.star)} className="w-full flex items-center gap-2 group">
                <span className="flex items-center gap-0.5 text-xs text-[#6B7785] w-7">{d.star}<Star size={11} fill={YELLOW} stroke="none" /></span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: YELLOW }} />
                </div>
                <span className="text-xs text-[#9AA3AE] w-8 text-right">{d.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {totalPhotos > 0 && (
        <div className="py-5 border-b border-[#ECEEF1]">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[#0F1419]"><Camera size={15} style={{ color: ORANGE }} /> Photos des clients ({totalPhotos})</div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {allPhotos.map((p, i) => (
              <button key={i} onClick={() => openLightbox(p.photos, p.index)} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 hover:opacity-90 transition-opacity">
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap py-4">
        <button onClick={() => { setStarFilter(0); setPhotosOnly(false); }}
          className={"px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " + (starFilter === 0 && !photosOnly ? "border-[#FF4500] bg-[#FFF4F0] text-[#FF4500]" : "border-gray-200 text-[#6B7785] hover:border-gray-300")}>
          Tous ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map(star => {
          const count = reviews.filter(r => r.rating === star).length;
          if (!count) return null;
          return (
            <button key={star} onClick={() => { setStarFilter(f => f === star ? 0 : star); setPhotosOnly(false); }}
              className={"flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " + (starFilter === star ? "border-[#FF4500] bg-[#FFF4F0] text-[#FF4500]" : "border-gray-200 text-[#6B7785] hover:border-gray-300")}>
              {star} <Star size={11} fill={YELLOW} stroke="none" /> ({count})
            </button>
          );
        })}
        {totalPhotos > 0 && (
          <button onClick={() => { setPhotosOnly(p => !p); setStarFilter(0); }}
            className={"flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " + (photosOnly ? "border-[#FF4500] bg-[#FFF4F0] text-[#FF4500]" : "border-gray-200 text-[#6B7785] hover:border-gray-300")}>
            <Camera size={12} /> Avec photos
          </button>
        )}
      </div>

      <div className="divide-y divide-[#ECEEF1]">
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-[#9AA3AE]">Aucun avis pour ce filtre.</p>}
        {filtered.map(r => {
          const initial = (r.reviewer_name || '?')[0]?.toUpperCase();
          const date = new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
          return (
            <div key={r.id} className="py-5 first:pt-0">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6B35,#FF4500)" }}>{initial}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[#0F1419]">{r.reviewer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5"><Stars value={r.rating} size={12} /><span className="text-xs text-[#9AA3AE]">{date}</span></div>
                </div>
              </div>
              {r.variant_name && <div className="text-xs text-[#9AA3AE] mt-2">Variante : {r.variant_name}</div>}
              <p className="text-sm text-[#3D4853] leading-relaxed mt-2">{r.comment}</p>
              {r.photos?.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {r.photos.map((photo, i) => (
                    <button key={photo.id || i} onClick={() => openLightbox(r.photos, i)}
                      className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity">
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 p-4" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"><X size={20} /></button>
          {lightbox.photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); navLightbox(-1); }} className="absolute left-5 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"><ChevronLeft size={22} /></button>
              <button onClick={e => { e.stopPropagation(); navLightbox(1); }} className="absolute right-5 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"><ChevronRight size={22} /></button>
            </>
          )}
          <img src={lightbox.photos[lightbox.index]?.url} alt="" onClick={e => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain" />
          {lightbox.photos.length > 1 && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">{lightbox.index + 1} / {lightbox.photos.length}</div>}
        </div>
      )}
    </section>
  );
};

// ── Main Page ────────────────────────────────────────────────────
export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [qty, setQty] = useState("1");
  const [color, setColor] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [productData, similarData, reviewsData, recommendationsData] = await Promise.all([
          productsApi.detail(id),
          productsApi.similar(id),
          productsApi.reviews(id),
          productsApi.recommendations(id),
        ]);

        if (cancelled) return;

        setProduct(productData);
        setSimilar(similarData || []);
        setReviews(reviewsData || []);
        setRecommendations(recommendationsData || []);
        setQty(String(productData.moq || 1));
        if (productData.variants?.length > 0) setColor(productData.variants[0].id);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Impossible de charger ce produit.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleShare = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  // Placeholder — le vrai panier (lié au compte) sera connecté séparément
  const handleOrder = (payload) => {
    console.log("Ajouter au panier:", payload);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFA" }}>
        <div className="w-8 h-8 border-4 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: "#FAFAFA" }}>
        <p className="text-[#6B7785] text-sm">{error || "Produit introuvable."}</p>
        <button onClick={() => navigate('/')} className="text-sm font-semibold" style={{ color: ORANGE }}>Retour à l'accueil</button>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : (product.primary_image ? [{ url: product.primary_image }] : []);

  return (
    <div className="min-h-screen relative" style={{ background: "#FAFAFA", fontFamily: BODY }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#0F1419 0.5px, transparent 0.5px)", backgroundSize: "24px 24px", opacity: 0.035 }} />
        <div className="absolute -top-20 -left-20 w-[480px] h-[480px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,69,0,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-40 -right-32 w-[420px] h-[420px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,105,60,0.06) 0%, transparent 70%)" }} />
      </div>

      <div className="relative mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-9" style={{ maxWidth: 1680 }}>
        <nav className="flex items-center gap-1.5 text-sm text-[#9AA3AE] flex-wrap">
          <span onClick={() => navigate('/')} className="hover:text-[#FF4500] font-medium cursor-pointer transition-colors">Accueil</span>
          {product.category_name && (
            <>
              <ChevronRight size={13} />
              <span className="hover:text-[#FF4500] cursor-pointer transition-colors">{product.category_name}</span>
            </>
          )}
          <ChevronRight size={13} />
          <span className="text-[#0F1419] font-medium truncate max-w-[260px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-6 items-start">
          <div className="min-w-0 space-y-9">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,460px)_minmax(0,1fr)] gap-6 items-start">
              <div className="w-full lg:sticky lg:top-[140px] lg:self-start">
                <ImageGallery images={images}
                  wishlistBtn={
                    <button onClick={() => setWishlisted(w => !w)}
                      className={"w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all " + (wishlisted ? "bg-[#FFF4F0] text-[#FF4500]" : "bg-white text-[#9AA3AE] hover:text-[#FF4500]")}>
                      <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
                    </button>}
                  shareBtn={
                    <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#9AA3AE] hover:text-[#6B7785] transition-colors">
                      {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
                    </button>}
                />
              </div>
              <ProductInfo product={product} color={color} setColor={setColor} />
            </div>

            <SupplierBlock product={product} />
            {recommendations.length > 0 && <ProductCarousel title="Accessoires recommandés" items={recommendations} onOrder={handleOrder} />}
            <ReviewsSection reviews={reviews} ratingAvg={parseFloat(product.rating_avg) || 0} ratingCount={product.rating_count || 0} />
            {similar.length > 0 && <ProductCarousel title="Vous aimerez aussi" items={similar} onOrder={handleOrder} />}
          </div>

          <div className="w-full lg:sticky lg:top-[140px] lg:self-start">
            <BuyBox product={product} qty={qty} setQty={setQty} onOrder={handleOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}