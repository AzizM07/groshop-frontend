import { useState, useRef, useCallback } from "react";
import {
  Star, StarHalf, Heart, Share2, ShoppingCart, MessageCircle,
  Store, MapPin, BadgeCheck, ChevronRight, ChevronDown, ChevronUp,
  ZoomIn, Check, Truck, Minus, Plus, Clock, Award, ThumbsUp, X, Camera
} from "lucide-react";

// ── Static data ─────────────────────────────────────────────────
const STATIC_PRODUCT = {
  id: "prod-001",
  name: "PC PORTABLE GAMER ASUS VIVOBOOK 16X I5 13È GÉN 8GO RTX 3050",
  brand: "ASUS",
  reference: "K3605VC-RP488W",
  unit: "pièce",
  moq: 1,
  pack_size: 1,
  stock_qty: 18,
  price_tnd: 2339.000,
  old_price_tnd: 2429.000,
  tiers: [
    { min_qty: 1,  max_qty: 4,  price_tnd: 4910.304 },
    { min_qty: 5,  max_qty: 12, price_tnd: 4676.480 },
    { min_qty: 13, max_qty: null, price_tnd: 4384.200 },
  ],
  rating_avg: 4.6,
  rating_count: 254,
  sold_count: 42,
  // intro courte + caractéristiques structurées
  intro: "PC portable gamer ASUS VivoBook 16X, conçu pour le jeu et la création. Idéal pour revendeurs et achats en volume.",
  specs: [
    { k: "Écran", v: "16\" WUXGA · IPS 144Hz" },
    { k: "Processeur", v: "Intel Core i5-13420H · jusqu'à 4.60 GHz" },
    { k: "Mémoire", v: "8 Go DDR4" },
    { k: "Stockage", v: "512 Go SSD NVMe" },
    { k: "Carte graphique", v: "NVIDIA RTX 3050 · 4 Go GDDR6" },
    { k: "Système", v: "Windows 11 Famille" },
    { k: "Connectique", v: "USB-C · HDMI 2.1 · WiFi · BT" },
    { k: "Garantie", v: "1 an constructeur" },
  ],
  colors: [
    { id: "c1", name: "Silver", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=120&q=70" },
    { id: "c2", name: "Noir", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=120&q=70" },
  ],
};

const STATIC_IMAGES = [
  { url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", is_primary: true },
  { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80" },
  { url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80" },
  { url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80" },
  { url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80" },
];

const STATIC_SUPPLIER = {
  id: "sup-01", slug: "lesen-tech", company_name: "Lesen Smart Tech Co.",
  city: "Tunis", wilaya: "Tunis", verification_status: "verified",
  rating_avg: 4.6, rating_count: 87, years: 6,
  brand_logo_url: "https://www.livinx.com/img/livinx-logo-1738657124.jpg",
  banner_url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1600&q=80",
};
const STATIC_STORE = { response_time_hrs: 3, response_rate: 94 };

const STATIC_REVIEWS = [
  {
    id: "r1", author: "Mohamed B.", initial: "M", rating: 5, date: "10 avril 2026",
    variant: "Couleur : Silver", country: "🇹🇳 Tunisie", helpful: 12,
    text: "Arrivé bien plus tôt que prévu. Produit entièrement de qualité, parfait pour le gaming. L'écran 144Hz est fluide et lumineux, la batterie tient une bonne durée. Je recommande vivement !",
    photos: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=70",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=70",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=70",
    ],
  },
  {
    id: "r2", author: "Sami K.", initial: "S", rating: 4, date: "2 avril 2026",
    variant: "Couleur : Noir", country: "🇹🇳 Tunisie", helpful: 5,
    text: "Bon rapport qualité-prix. Le ventilateur peut être un peu bruyant en pleine charge mais les performances sont au rendez-vous pour ce prix.",
    photos: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=70",
    ],
  },
  {
    id: "r3", author: "Ines T.", initial: "I", rating: 5, date: "28 mars 2026",
    variant: "Couleur : Silver", country: "🇹🇳 Tunisie", helpful: 8,
    text: "Excellent ! Livraison rapide et emballage soigné. Je l'utilise pour le montage vidéo, aucun ralentissement. Très satisfaite de mon achat.",
    photos: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=70",
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=70",
    ],
  },
  {
    id: "r4", author: "Karim Z.", initial: "K", rating: 3, date: "20 mars 2026",
    variant: "Couleur : Noir", country: "🇹🇳 Tunisie", helpful: 2,
    text: "Correct sans plus. La machine fait le travail mais j'attendais un peu mieux niveau autonomie. Le service client a été réactif cependant.",
    photos: [],
  },
  {
    id: "r5", author: "Yassine M.", initial: "Y", rating: 5, date: "15 mars 2026",
    variant: "Couleur : Silver", country: "🇹🇳 Tunisie", helpful: 17,
    text: "Parfait pour mon commerce, j'en ai commandé plusieurs. Qualité constante, bon partenaire. Je repasserai commande sans hésiter.",
    photos: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=70",
    ],
  },
];

const STATIC_SIMILAR = [
  { id: "s1", name: "PC Portable HP Pavilion 15 i7 16Go", base_price_tnd: 2890.000, moq: 1, unit: "pièce", rating_avg: 4.5, rating_count: 33, product_images: [{ url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&q=70", is_primary: true }] },
  { id: "s2", name: "Souris Gamer Logitech G502 Hero", base_price_tnd: 145.000, moq: 1, unit: "pièce", rating_avg: 4.8, rating_count: 210, product_images: [{ url: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=200&q=70", is_primary: true }] },
  { id: "s3", name: "Casque Gaming HyperX Cloud II", base_price_tnd: 280.000, moq: 1, unit: "pièce", rating_avg: 4.7, rating_count: 156, product_images: [{ url: "https://images.unsplash.com/photo-1599669454699-248893623440?w=200&q=70", is_primary: true }] },
  { id: "s4", name: "Clavier mécanique RGB Redragon", base_price_tnd: 120.000, moq: 1, unit: "pièce", rating_avg: 4.4, rating_count: 89, product_images: [{ url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&q=70", is_primary: true }] },
  { id: "s5", name: "Écran ASUS TUF 27\" 165Hz", base_price_tnd: 850.000, moq: 1, unit: "pièce", rating_avg: 4.9, rating_count: 64, product_images: [{ url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&q=70", is_primary: true }] },
  { id: "s6", name: "SSD NVMe Samsung 1To", base_price_tnd: 210.000, moq: 1, unit: "pièce", rating_avg: 4.8, rating_count: 178, product_images: [{ url: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200&q=70", is_primary: true }] },
];

// ── Helpers ─────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 3 }).format(n) + " TND";
const fmtDT = (n) => new Intl.NumberFormat("fr-TN", { minimumFractionDigits: 3 }).format(n) + " DT";

// orange = couleur principale, jaune = étoiles
const ORANGE = "#FF4500";
const YELLOW = "#FFB800";
const COLOR = { orange: ORANGE, blue: "#0000ff", ink: "#0F1419" };

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

  return (
    <div className="flex gap-3 items-start">
      {images.length > 1 && (
        <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: THUMB_H }}>
          <button onClick={() => setThumbOffset(o => Math.max(0, o - 1))} disabled={thumbOffset === 0}
            className="w-full flex justify-center py-1 rounded-lg hover:bg-gray-100 disabled:opacity-20 transition-colors">
            <ChevronUp size={16} className="text-[#6B7785]" />
          </button>
          <div className="overflow-hidden flex flex-col gap-2"
            style={{ height: THUMB_VISIBLE * THUMB_H + (THUMB_VISIBLE - 1) * THUMB_GAP }}>
            <div className="flex flex-col gap-2 transition-transform duration-300"
              style={{ transform: `translateY(-${thumbOffset * (THUMB_H + THUMB_GAP)}px)` }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActive(i)}
                  style={{ width: THUMB_H, height: THUMB_H }}
                  className={"flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all " +
                    (active === i ? "border-[#FF4500]" : "border-gray-100 hover:border-gray-300")}>
                  <img src={img.url} alt="" className="w-full h-full object-cover"
                    onError={e => { e.target.src = "https://placehold.co/80x80/F8F8FB/9AA3AE?text=img"; }} />
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
        <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 relative">
          <div ref={imgRef} className="aspect-square overflow-hidden cursor-zoom-in flex items-center justify-center"
            onMouseEnter={() => setZoomed(true)} onMouseLeave={() => setZoomed(false)} onMouseMove={handleMouseMove}>
            <img src={images[active]?.url} alt="Produit"
              className="w-full h-full object-cover transition-transform duration-150"
              style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: "scale(2.2)" } : {}}
              onError={e => { e.target.src = "https://placehold.co/600x600/F8F8FB/9AA3AE?text=Image"; }} />
          </div>
          {images.length > 1 && (
            <button onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#0F1419] hover:scale-105 transition-transform">
              <ChevronRight size={18} />
            </button>
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
  <div className="min-w-0 rounded-2xl bg-white p-6 space-y-4" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
    {/* Titre + avis */}
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <h1 className="text-xl font-black leading-snug flex-1 min-w-[220px]" style={{ color: COLOR.blue }}>
        {product.name}
      </h1>
      <button className="text-sm font-medium hover:underline whitespace-nowrap" style={{ color: COLOR.blue }}>
        Donner votre avis !
      </button>
    </div>

    {/* Stock + rating */}
    <div className="flex items-center gap-3 flex-wrap">
      <span className="inline-flex items-center gap-1.5 font-bold text-green-600">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> En Stock
      </span>
      <span className="text-gray-200">|</span>
      <Stars value={product.rating_avg} size={14} />
      <span className="text-xs text-[#9AA3AE]">{product.rating_count} avis</span>
    </div>

    {/* Marque + référence (texte simple) */}
    <div className="flex items-center gap-5 flex-wrap pb-3 border-b border-gray-100 text-sm">
      <div className="text-[#6B7785]">
        Marque : <span className="font-bold text-[#0F1419]">{product.brand}</span>
      </div>
      <div className="text-[#6B7785]">
        Référence # : <span className="font-bold text-[#0F1419]">{product.reference}</span>
      </div>
    </div>

    {/* Intro */}
    <p className="text-sm leading-relaxed text-[#6B7785]">{product.intro}</p>

    {/* Caractéristiques en grille */}
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-[#0F1419]">Caractéristiques principales</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-0 rounded-xl border border-gray-100 overflow-hidden">
        {product.specs.map((s, i) => (
          <div key={i} className={"flex justify-between gap-3 px-3 py-2.5 text-sm " +
            (Math.floor(i / 2) % 2 ? "bg-gray-50/60" : "bg-white")}>
            <span className="text-[#9AA3AE]">{s.k}</span>
            <span className="font-semibold text-[#0F1419] text-right">{s.v}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Couleur */}
    <div className="space-y-2">
      <span className="text-sm font-bold text-[#0F1419]">Couleur : <span className="text-[#6B7785] font-normal">{product.colors.find(c => c.id === color)?.name}</span></span>
      <div className="flex gap-2.5">
        {product.colors.map(c => (
          <button key={c.id} onClick={() => setColor(c.id)}
            className={"w-12 h-12 rounded-xl overflow-hidden border-2 transition-all " +
              (color === c.id ? "border-[#FF4500]" : "border-gray-100 hover:border-gray-300")}>
            <img src={c.img} alt={c.name} className="w-full h-full object-cover"
              onError={e => { e.target.src = "https://placehold.co/48x48/F8F8FB/9AA3AE?text=•"; }} />
          </button>
        ))}
      </div>
    </div>

    {/* Bandeau livraison */}
    <div className="rounded-lg bg-[#F0F0F3] px-4 py-2.5 text-sm text-[#6B7785]">
      Retrait en magasin ou <span className="font-bold" style={{ color: COLOR.orange }}>Livraison Gratuite</span> *
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
//  COLONNE DROITE — Buy box
// ════════════════════════════════════════════════════════════════
const BuyBox = ({ product, qty, setQty }) => {
  const moq = product.moq || 1;
  const parsedQty = parseInt(qty) || 0;
  const tiers = product.tiers || [];
  const activeIdx = tiers.findIndex(t => parsedQty >= t.min_qty && (!t.max_qty || parsedQty <= t.max_qty));
  const activeTier = tiers[activeIdx] || tiers[0];
  const unitPrice = activeTier ? activeTier.price_tnd : product.price_tnd;
  const basePrice = tiers.length ? tiers[0].price_tnd : product.price_tnd;
  const savePct = Math.round((1 - unitPrice / basePrice) * 100);
  const total = parsedQty * unitPrice;
  const qtyValid = parsedQty >= moq;

  // Bloc livraison style liste (comme l'image), couleur orange
  const shippingRows = [
    { icon: Truck, label: "Livraison", value: fmtDT(63.530), chevron: true },
    { icon: Clock, label: "Réception estimée", value: "31 juillet", chevron: false },
  ];

  return (
    <div className="space-y-2.5">
      {/* Carte prix + achat */}
      <div className="rounded-2xl bg-white p-4 space-y-3" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        {/* Prix unitaire dynamique (orange) */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-2xl font-black leading-none" style={{ color: COLOR.orange }}>
              {fmtDT(unitPrice)}
            </div>
            <span className="text-xs text-[#9AA3AE]">/ {product.unit}</span>
          </div>
          {savePct > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#9AA3AE] line-through">{fmtDT(basePrice)}</span>
              <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full" style={{ background: COLOR.orange }}>
                −{savePct}%
              </span>
            </div>
          )}
        </div>

        {/* Grille des tranches de prix */}
        <div>
          <div className="text-[10px] font-bold text-[#9AA3AE] uppercase tracking-wider mb-1.5">
            Prix selon la quantité
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {tiers.map((t, i) => {
              const isActive = i === activeIdx;
              const label = t.max_qty ? `${t.min_qty}-${t.max_qty} ${product.unit}` : `≥${t.min_qty} ${product.unit}`;
              return (
                <button key={i} onClick={() => setQty(String(t.min_qty))}
                  className={"text-left rounded-lg border-2 px-2.5 py-1.5 transition-all " +
                    (isActive ? "border-[#FF4500] bg-orange-50" : "border-gray-100 hover:border-gray-300")}>
                  <div className={"text-sm font-black leading-tight whitespace-nowrap " + (isActive ? "text-[#FF4500]" : "text-[#0F1419]")}>
                    {fmtDT(t.price_tnd)}
                  </div>
                  <div className="text-[10px] text-[#9AA3AE] mt-0.5">{label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MOQ + Quantité sur une ligne */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-[#6B7785]">
            MOQ : <span className="font-bold text-[#0F1419]">{moq} {product.unit}</span>
          </div>
          <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setQty(q => String(Math.max(moq, (parseInt(q) || moq) - 1)))}
              className="px-2.5 py-1.5 text-[#6B7785] hover:bg-gray-50"><Minus size={14} /></button>
            <input type="number" value={qty} min={moq} onChange={e => setQty(e.target.value)}
              className="text-center py-1.5 text-sm font-bold text-[#0F1419] outline-none border-x border-gray-200 w-12" />
            <button onClick={() => setQty(q => String((parseInt(q) || moq) + 1))}
              className="px-2.5 py-1.5 text-[#6B7785] hover:bg-gray-50"><Plus size={14} /></button>
          </div>
        </div>

        {!qtyValid && (
          <p className="text-[11px] font-medium" style={{ color: COLOR.orange }}>
            Quantité minimale : {moq} {product.unit}
          </p>
        )}

        <div className="flex items-center justify-between text-sm bg-[#FAFAFB] rounded-lg px-3 py-2">
          <span className="text-xs text-[#6B7785]">Total ({parsedQty} {product.unit})</span>
          <span className="text-base font-black" style={{ color: COLOR.orange }}>{fmtDT(total)}</span>
        </div>

        {/* Ajouter au panier (orange) */}
        <button disabled={!qtyValid}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all hover:brightness-95 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#FF6B35,#FF4500)", boxShadow: qtyValid ? "0 6px 16px rgba(255,69,0,0.3)" : "none" }}>
          <ShoppingCart size={16} /> Ajouter au panier
        </button>

        {/* Demander un devis (orange) */}
        <button className="w-full py-2.5 rounded-xl border-2 font-bold text-sm transition-colors hover:bg-orange-50"
          style={{ borderColor: COLOR.orange, color: COLOR.orange }}>
          Demander un devis
        </button>
      </div>

      {/* Bloc livraison — style liste, couleur orange */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        {shippingRows.map((r, i) => (
          <button key={i}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
            <r.icon size={17} className="flex-shrink-0" style={{ color: COLOR.orange }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#0F1419] leading-tight">{r.label}</div>
              {r.value && <div className="text-xs text-[#6B7785]">{r.value}</div>}
            </div>
            {r.chevron && <ChevronRight size={15} className="text-[#9AA3AE] flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Supplier Block ───────────────────────────────────────────────
const SupplierBlock = ({ supplier, store }) => {
  const stats = [
    { label: "Note boutique", value: supplier.rating_avg?.toFixed(1) + "/5", sub: `(${supplier.rating_count})` },
    { label: "Ancienneté", value: `${supplier.years} ans` },
    { label: "Temps de réponse", value: `≤${store.response_time_hrs}h` },
    { label: "Taux de réponse", value: `${store.response_rate}%` },
  ];
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      {/* Image en fond de toute la section */}
      <img src={supplier.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
      {/* Voile blanc pour la lisibilité */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.92) 100%)", backdropFilter: "blur(2px)" }} />

      {/* Contenu par-dessus */}
      <div className="relative px-5 py-5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Logo image */}
          <div className="w-[64px] h-[64px] rounded-2xl bg-white p-1 shadow-md flex-shrink-0">
            <div className="w-full h-full rounded-xl overflow-hidden bg-[#F4F5F7] flex items-center justify-center">
              {supplier.brand_logo_url
                ? <img src={supplier.brand_logo_url} alt={supplier.company_name}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.innerHTML = `<span style="font-weight:800;font-size:24px;color:#FF4500">${supplier.company_name[0]}</span>` }} />
                : <span className="font-extrabold text-2xl text-[#FF4500]">{supplier.company_name[0]}</span>}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[#0F1419] text-base">{supplier.company_name}</span>
              <BadgeCheck size={15} fill="#FF4500" stroke="white" />
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                <Award size={10} /> Gold Supplier
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#6B7785] mt-0.5">
              <MapPin size={11} />{supplier.city}, {supplier.wilaya}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white/80 text-sm font-semibold text-[#0F1419] hover:border-[#FF4500] hover:text-[#FF4500] transition-colors">
              <Store size={14} /> Boutique
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF4500] text-white text-sm font-semibold hover:bg-[#E03E00] transition-colors">
              <MessageCircle size={14} /> Contacter
            </button>
          </div>
        </div>

        {/* Bandeau stats — fond gris translucide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 rounded-xl bg-white/70 p-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-base font-black text-[#0F1419]">
                {s.value}{s.sub && <span className="text-xs font-normal text-[#9AA3AE] ml-0.5">{s.sub}</span>}
              </div>
              <div className="text-[11px] text-[#6B7785] leading-tight mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Mini Card ────────────────────────────────────────────────────
const MiniCard = ({ product: p }) => {
  const img = (p.product_images?.find(i => i.is_primary) || p.product_images?.[0])?.url
    || "https://placehold.co/200x200/F8F8FB/9AA3AE?text=img";
  return (
    <div className="flex-shrink-0 w-44 rounded-2xl bg-white overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div className="h-44 overflow-hidden bg-[#F5F5F7]">
        <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = "https://placehold.co/176x176/F8F8FB/9AA3AE?text=img"; }} />
      </div>
      <div className="p-3 space-y-1">
        <p className="text-xs font-semibold text-[#0F1419] line-clamp-2 leading-snug">{p.name}</p>
        <p className="text-sm font-black" style={{ color: COLOR.orange }}>{fmt(p.base_price_tnd)}</p>
        {p.rating_avg > 0 && (
          <div className="flex items-center gap-1">
            <Stars value={p.rating_avg} size={10} showEmpty={false} />
            <span className="text-[10px] text-[#9AA3AE]">({p.rating_count})</span>
          </div>
        )}
      </div>
    </div>
  );
};

const HScrollSection = ({ title, items }) => {
  if (!items?.length) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-black text-[#0F1419]">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
        {items.map(p => <MiniCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

// ── Reviews Section (style AliExpress) ───────────────────────────
const ReviewsSection = ({ reviews, ratingAvg, ratingCount }) => {
  const [starFilter, setStarFilter] = useState(0);     // 0 = tous
  const [photosOnly, setPhotosOnly] = useState(false);
  const [lightbox, setLightbox] = useState(null);      // { photos:[], index }

  // Répartition par étoiles
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));
  const totalPhotos = reviews.reduce((n, r) => n + (r.photos?.length || 0), 0);

  const filtered = reviews.filter(r =>
    (starFilter === 0 || r.rating === starFilter) &&
    (!photosOnly || (r.photos && r.photos.length > 0))
  );

  // Toutes les photos (pour la galerie "avec photos")
  const allPhotos = reviews.flatMap(r => (r.photos || []).map(url => ({ url, photos: r.photos })));

  const openLightbox = (photos, index) => setLightbox({ photos, index });
  const closeLightbox = () => setLightbox(null);
  const navLightbox = (dir) => setLightbox(lb => {
    if (!lb) return lb;
    const i = (lb.index + dir + lb.photos.length) % lb.photos.length;
    return { ...lb, index: i };
  });

  return (
    <section className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <h2 className="text-lg font-black text-[#0F1419] mb-5">Avis sur le produit</h2>

      {/* Résumé : note + barres */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 pb-5 border-b border-gray-100">
        <div className="flex flex-col items-center justify-center sm:w-40 flex-shrink-0">
          <div className="text-4xl font-black text-[#0F1419]">{ratingAvg.toFixed(1)}</div>
          <Stars value={ratingAvg} size={16} />
          <div className="text-xs text-[#9AA3AE] mt-1">{ratingCount} avis</div>
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          {dist.map(d => {
            const pct = ratingCount ? Math.round((d.count / reviews.length) * 100) : 0;
            return (
              <button key={d.star} onClick={() => setStarFilter(f => f === d.star ? 0 : d.star)}
                className="w-full flex items-center gap-2 group">
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

      {/* Galerie photos clients */}
      {totalPhotos > 0 && (
        <div className="py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#0F1419]">
            <Camera size={15} style={{ color: COLOR.orange }} /> Photos des clients ({totalPhotos})
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {allPhotos.map((p, i) => (
              <button key={i} onClick={() => openLightbox(p.photos, p.photos.indexOf(p.url))}
                className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 hover:opacity-90 transition-opacity">
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap py-4">
        <button onClick={() => { setStarFilter(0); setPhotosOnly(false); }}
          className={"px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors " +
            (starFilter === 0 && !photosOnly ? "border-[#FF4500] bg-orange-50 text-[#FF4500]" : "border-gray-200 text-[#6B7785] hover:border-gray-300")}>
          Tous ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map(star => {
          const count = reviews.filter(r => r.rating === star).length;
          if (!count) return null;
          return (
            <button key={star} onClick={() => { setStarFilter(f => f === star ? 0 : star); setPhotosOnly(false); }}
              className={"flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors " +
                (starFilter === star ? "border-[#FF4500] bg-orange-50 text-[#FF4500]" : "border-gray-200 text-[#6B7785] hover:border-gray-300")}>
              {star} <Star size={11} fill={YELLOW} stroke="none" /> ({count})
            </button>
          );
        })}
        {totalPhotos > 0 && (
          <button onClick={() => { setPhotosOnly(p => !p); setStarFilter(0); }}
            className={"flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors " +
              (photosOnly ? "border-[#FF4500] bg-orange-50 text-[#FF4500]" : "border-gray-200 text-[#6B7785] hover:border-gray-300")}>
            <Camera size={12} /> Avec photos
          </button>
        )}
      </div>

      {/* Liste des avis */}
      <div className="divide-y divide-gray-100">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-[#9AA3AE]">Aucun avis pour ce filtre.</p>
        )}
        {filtered.map(r => (
          <div key={r.id} className="py-5 first:pt-0">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#FF6B35,#FF4500)" }}>{r.initial}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-[#0F1419]">{r.author}</span>
                  <span className="text-xs text-[#9AA3AE]">{r.country}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Stars value={r.rating} size={12} />
                  <span className="text-xs text-[#9AA3AE]">{r.date}</span>
                </div>
              </div>
            </div>

            {/* Variante */}
            {r.variant && <div className="text-xs text-[#9AA3AE] mt-2">{r.variant}</div>}

            {/* Texte */}
            <p className="text-sm text-[#3D4853] leading-relaxed mt-2">{r.text}</p>

            {/* Photos cliquables */}
            {r.photos?.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {r.photos.map((url, i) => (
                  <button key={i} onClick={() => openLightbox(r.photos, i)}
                    className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Utile */}
            <button className="flex items-center gap-1.5 mt-3 text-xs text-[#9AA3AE] hover:text-[#FF4500] transition-colors">
              <ThumbsUp size={13} /> Utile ({r.helpful})
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 p-4" onClick={closeLightbox}>
          <button onClick={closeLightbox}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
            <X size={20} />
          </button>
          {lightbox.photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); navLightbox(-1); }}
                className="absolute left-5 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                <ChevronRight size={22} className="rotate-180" />
              </button>
              <button onClick={e => { e.stopPropagation(); navLightbox(1); }}
                className="absolute right-5 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <img src={lightbox.photos[lightbox.index]} alt="" onClick={e => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain" />
          {lightbox.photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">
              {lightbox.index + 1} / {lightbox.photos.length}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

// ── Main Page ────────────────────────────────────────────────────
export default function ProductPageStatic() {
  const product = STATIC_PRODUCT, images = STATIC_IMAGES;
  const supplier = STATIC_SUPPLIER, store = STATIC_STORE, similar = STATIC_SIMILAR;
  const reviews = STATIC_REVIEWS;

  const [qty, setQty] = useState(String(product.moq));
  const [color, setColor] = useState(product.colors[0].id);
  const [wishlisted, setWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen relative" style={{ background: "#F6F7F9" }}>

      {/* ── Ambiance : grille de points + lueur douce en haut ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(#0F1419 0.5px, transparent 0.5px)",
            backgroundSize: "22px 22px",
            opacity: 0.05,
          }} />
        <div className="absolute top-0 left-0 right-0 h-80"
          style={{ background: "linear-gradient(180deg, rgba(255,69,0,0.06) 0%, transparent 100%)" }} />
      </div>

      <div className="relative mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-8" style={{ maxWidth: 1680 }}>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-[#9AA3AE] flex-wrap">
          <span className="hover:text-[#FF4500] font-medium cursor-pointer">Accueil</span>
          <ChevronRight size={13} />
          <span className="hover:text-[#FF4500] cursor-pointer">Informatique</span>
          <ChevronRight size={13} />
          <span className="text-[#0F1419] font-medium truncate max-w-[260px]">{product.name}</span>
        </nav>

        {/* LAYOUT — Gauche (tout le contenu) | Droite (buy box sticky) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-6 items-start">

          {/* ── COLONNE GAUCHE : galerie + infos + reste ── */}
          <div className="min-w-0 space-y-8">

            {/* Galerie + Infos */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,460px)_minmax(0,1fr)] gap-6 items-start">
              {/* Gallery */}
              <div className="w-full lg:sticky lg:top-[140px] lg:self-start">
                <ImageGallery
                  images={images}
                  wishlistBtn={
                    <button onClick={() => setWishlisted(w => !w)}
                      className={"w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all " +
                        (wishlisted ? "bg-orange-50 text-[#FF4500]" : "bg-white text-[#9AA3AE] hover:text-[#FF4500]")}>
                      <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
                    </button>
                  }
                  shareBtn={
                    <button onClick={handleShare}
                      className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#9AA3AE] hover:text-[#6B7785] transition-colors">
                      {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
                    </button>
                  }
                />
              </div>

              {/* Info center */}
              <ProductInfo product={product} color={color} setColor={setColor} />
            </div>

            {/* Supplier */}
            <SupplierBlock supplier={supplier} store={store} />

            {/* Recommandations */}
            <HScrollSection title="Accessoires recommandés" items={similar.slice(0, 6)} />

            {/* Reviews */}
            <ReviewsSection reviews={reviews} ratingAvg={product.rating_avg} ratingCount={product.rating_count} />

            {/* More products */}
            <HScrollSection title="Vous aimerez aussi" items={similar} />
          </div>

          {/* ── COLONNE DROITE : buy box collée ── */}
          <div className="w-full lg:sticky lg:top-[140px] lg:self-start">
            <BuyBox product={product} qty={qty} setQty={setQty} />
          </div>
        </div>

      </div>
    </div>
  );
}