import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from 'lucide-react';

const orderLink = 'https://wa.me/8801776309481';
const phoneLink = 'tel:+8801776309481';
const instagramLink = 'https://instagram.com/mims.cake.by.world';
const directionsLink = 'https://www.google.com/maps/search/?api=1&query=Rangpur%2C%20Bangladesh';

const collections = [
  {
    name: 'Celebration cakes',
    note: 'For the big little moments',
    detail: 'Layered, generous, and finished around your story.',
    image: 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1000',
    tone: 'pink',
  },
  {
    name: 'Dessert table',
    note: 'Small bites, long conversations',
    detail: 'Brownies, dessert cups, and sweet things worth sharing.',
    image: 'https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=1000',
    tone: 'rose',
  },
  {
    name: 'Made for you',
    note: 'A cake with your name on it',
    detail: 'Colours, flavours, and details shaped to your occasion.',
    image: 'https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&cs=tinysrgb&w=1000',
    tone: 'lemon',
  },
];

const reviews = [
  { quote: 'The cake looked even more beautiful than I imagined. Every bite tasted homemade in the best possible way.', name: 'A happy celebration table', mark: 'A' },
  { quote: 'Mim understood exactly what I wanted and made the whole order feel so personal. We will be ordering again.', name: 'A returning customer', mark: 'R' },
  { quote: 'Soft, fresh, and not overly sweet. It disappeared before the tea was even poured.', name: 'A Rangpur sweet tooth', mark: 'S' },
];

const navItems = [
  { label: 'Home', id: 'top' },
  { label: 'Cakes', id: 'collection' },
  { label: 'About', id: 'story' },
  { label: 'Contact', id: 'contact' },
];

type OrderForm = { name: string; date: string; request: string };

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [form, setForm] = useState<OrderForm>({ name: '', date: '', request: '' });
  const cursorDotRef = useRef<HTMLSpanElement>(null);
  const cursorRingRef = useRef<HTMLSpanElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const lastScrolledRef = useRef(false);
  const pointerFrameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    document.title = "Mim's Cake by World | Homemade Cakes & Desserts in Rangpur";
    const description = "Mim's Cake by World offers delicious homemade cakes and desserts made with love in Rangpur, Bangladesh.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    revealElements.forEach((element) => observer.observe(element));

    let scrollFrame: number | null = null;
    const onScroll = () => {
      if (scrollFrame !== null) return;
      scrollFrame = requestAnimationFrame(() => {
        const scrolled = window.scrollY > 24;
        document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
        if (scrolled !== lastScrolledRef.current) {
          lastScrolledRef.current = scrolled;
          setIsScrolled(scrolled);
        }
        scrollFrame = null;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);
    };
  }, []);

  useEffect(() => {
    if (!orderOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOrderOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [orderOpen]);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (pointerFrameRef.current !== null) return;
      pointerFrameRef.current = requestAnimationFrame(() => {
        const { x, y } = pointerRef.current;
        cursorDotRef.current?.style.setProperty('--cursor-x', `${x}px`);
        cursorDotRef.current?.style.setProperty('--cursor-y', `${y}px`);
        cursorRingRef.current?.style.setProperty('--cursor-x', `${x}px`);
        cursorRingRef.current?.style.setProperty('--cursor-y', `${y}px`);
        heroRef.current?.style.setProperty('--pointer-x', `${(x / window.innerWidth - 0.5) * 18}px`);
        heroRef.current?.style.setProperty('--pointer-y', `${(y / window.innerHeight - 0.5) * 14}px`);
        pointerFrameRef.current = null;
      });
    };
    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      cursorRingRef.current?.classList.toggle('cursor-ring-active', Boolean(target.closest('a, button')));
    };

    document.body.classList.add('cursor-enhanced');
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerover', onPointerOver, { passive: true });
    return () => {
      document.body.classList.remove('cursor-enhanced');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerover', onPointerOver);
      if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    };
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openOrder = () => {
    setSent(false);
    setOrderOpen(true);
  };

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = `Hello Mim's Cake by World! My name is ${form.name}. I'd love to enquire about a cake${form.date ? ` for ${form.date}` : ''}. ${form.request}`;
    window.open(`${orderLink}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  return (
    <main className="bakery-page">
      <a href="#top" className="skip-link">Skip to content</a>
      <span ref={cursorDotRef} className="cursor-dot" aria-hidden="true" />
      <span ref={cursorRingRef} className="cursor-ring" aria-hidden="true" />

      <div className="site-frame">
        <header className={`site-header ${isScrolled ? 'site-header-scrolled' : ''}`}>
          <div className="site-header-inner">
            <button onClick={() => scrollTo('top')} aria-label="Mim's Cake by World home" className="brand-lockup">
              <span className="brand-mark"><span>✦</span><strong>M</strong></span>
              <span className="brand-name"><strong>Mim's</strong><em>Cake by World</em></span>
            </button>

            <nav aria-label="Main navigation" className="main-nav">
              {navItems.map((item, index) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className={index === 0 ? 'active' : ''}>{item.label}</button>
              ))}
            </nav>

            <div className="header-actions">
              <span aria-hidden="true" className="icon-button header-search"><Search size={20} strokeWidth={1.8} /></span>
              <button onClick={openOrder} aria-label="Open order form" className="order-bag">
                <ShoppingBag size={20} strokeWidth={1.8} />
                <span>1</span>
              </button>
              <button onClick={() => setMenuOpen((current) => !current)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="icon-button mobile-toggle">
                {menuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div id="mobile-navigation" className="mobile-menu">
              {navItems.map((item) => <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}</button>)}
              <button onClick={openOrder} className="mobile-order">Order now <ArrowRight size={16} /></button>
            </div>
          )}
        </header>

        <section ref={heroRef} id="top" className="hero-section">
          <div className="hero-pattern hero-pattern-one" aria-hidden="true">♡</div>
          <div className="hero-pattern hero-pattern-two" aria-hidden="true">✧</div>
          <div className="social-rail reveal">
            <a href={instagramLink} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={15} /></a>
            <a href={orderLink} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={15} /></a>
            <a href={phoneLink} aria-label="Phone"><Phone size={15} /></a>
            <span className="social-rail-label">Follow the sweetness</span>
          </div>

          <div className="hero-copy">
            <p className="hero-kicker reveal">Homemade in Rangpur, Bangladesh <Sparkles size={14} /></p>
            <h1 className="hero-title reveal reveal-delay-1">Every one <em>love's</em><br />a little <span>sweetness.</span></h1>
            <p className="hero-description reveal reveal-delay-2">Natural, joyful cakes and desserts made in a home kitchen with the kind of care you can taste.</p>
            <div className="hero-actions reveal reveal-delay-3">
              <button onClick={openOrder} className="hot-button">Order now <ArrowRight size={17} /></button>
              <button onClick={() => scrollTo('collection')} className="outline-button">Explore more <ArrowDown size={15} /></button>
            </div>
          </div>

          <div className="hero-stage">
            <div className="hero-orbit orbit-one" aria-hidden="true" />
            <div className="hero-orbit orbit-two" aria-hidden="true" />
            <div className="hero-cake-wrap reveal reveal-delay-2">
              <div className="cake-image-frame">
                <img src="https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="A handmade celebration cake topped with fresh berries" width="1200" height="1200" fetchPriority="high" decoding="async" />
              </div>
              <div className="cake-sticker"><span>✦</span><strong>Fresh<br />baked<br />with love</strong></div>
              <div className="cake-leaf leaf-one" aria-hidden="true">✾</div>
              <div className="cake-leaf leaf-two" aria-hidden="true">✿</div>
            </div>
            <div className="hero-rating reveal reveal-delay-3"><div className="stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill="currentColor" />)}</div><strong>4.5</strong><span>loved by cake people</span></div>
          </div>

          <div className="hero-pager reveal">
            <strong>01</strong><span /><small>03</small>
          </div>
          <div className="hero-scroll-hint"><span>Scroll to explore</span><ArrowDown size={15} /></div>
        </section>

        <div className="pink-marquee" aria-label="Mim's Cake by World highlights">
          <div className="pink-marquee-track"><span>Natural ingredients</span><b>✦</b><span>Small batch baking</span><b>✦</b><span>Made to order in Rangpur</span><b>✦</b><span>Natural ingredients</span><b>✦</b><span>Small batch baking</span><b>✦</b></div>
        </div>

        <section className="trust-strip reveal">
          <div><strong>100%</strong><span>recommended<br />by our customers</span></div>
          <div><strong>06</strong><span>thoughtful reviews<br />and counting</span></div>
          <div><Clock3 size={24} /><span>always open<br />for your ideas</span></div>
        </section>

        <section id="collection" className="content-section cakes-section">
          <div className="section-heading reveal"><div><p className="eyebrow">A table worth gathering around</p><h2>Sweet things,<br /><em>made from scratch.</em></h2></div><p>From first message to final crumb, every order is made by hand and shaped around the moment.</p></div>
          <div className="cake-grid">
            <article className="cake-card cake-card-feature reveal">
              <div className="cake-card-image"><img src={collections[0].image} alt="A chocolate celebration cake topped with berries" loading="lazy" decoding="async" /></div>
              <div className="cake-card-content"><p className="eyebrow">01 / For your people</p><h3>{collections[0].name}</h3><p>{collections[0].detail}</p></div>
            </article>
            {collections.slice(1).map((item, index) => (
              <article key={item.name} className={`cake-card cake-card-small cake-card-${item.tone} reveal reveal-delay-${index + 1}`}>
                <div className="cake-card-image"><img src={item.image} alt={item.name} loading="lazy" decoding="async" /></div>
                <div className="cake-card-content"><p className="eyebrow">0{index + 2} / {item.note}</p><h3>{item.name}</h3><p>{item.detail}</p></div>
              </article>
            ))}
          </div>
          <div className="section-cta reveal"><p>Your idea is the starting point.</p><button onClick={openOrder} className="text-button">Tell us what you’re dreaming of <ArrowRight size={17} /></button></div>
        </section>

        <section id="story" className="content-section story-section">
          <div className="story-image reveal"><img src="https://images.pexels.com/photos/3992382/pexels-photo-3992382.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Hands carefully preparing a homemade cake" loading="lazy" decoding="async" /><span>A home kitchen,<br /><em>with a point of view.</em></span></div>
          <div className="story-copy reveal reveal-delay-1"><p className="eyebrow">The heart of it</p><h2>Not just a cake.<br /><em>A reason to pause.</em></h2><p>Mim’s Cake by World began with a simple belief: the sweetest celebrations do not need to be loud. They need something made with care, a table that feels like yours, and one more slice than you planned for.</p><p>Everything is baked in small batches in Rangpur, Bangladesh — fresh for your people, your day, and the story you want to tell.</p><button onClick={() => scrollTo('contact')} className="text-button">Come a little closer <ArrowRight size={17} /></button></div>
        </section>

        <section className="process-section">
          <div className="process-intro reveal"><p className="eyebrow">The easy part</p><h2>Three messages<br /><em>to something lovely.</em></h2></div>
          <div className="process-list reveal reveal-delay-1">{[['01', 'Say hello', 'Tell us what you are celebrating, when, and how many people deserve a slice.'], ['02', 'Make it yours', 'We will talk through flavours, colours, size, and the little detail that makes it unmistakably yours.'], ['03', 'Gather around', 'Your fresh, handmade order arrives ready for the moment. All that is left is the first cut.']].map(([number, title, copy]) => <div key={number} className="process-item"><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></div>)}</div>
        </section>

        <section id="reviews" className="content-section review-section">
          <div className="section-heading review-heading reveal"><div><p className="eyebrow">Kind words, kept close</p><h2>The reviews<br /><em>say it best.</em></h2></div><div className="review-controls"><button onClick={() => setActiveReview((activeReview + reviews.length - 1) % reviews.length)} aria-label="Previous review"><ChevronLeft size={17} /></button><button onClick={() => setActiveReview((activeReview + 1) % reviews.length)} aria-label="Next review"><ChevronRight size={17} /></button></div></div>
          <div className="review-grid">
            <div className="review-quote reveal" aria-live="polite"><span className="quote-mark">“</span><div className="stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} fill="currentColor" />)}</div><p>“{reviews[activeReview].quote}”</p><strong>{reviews[activeReview].name}</strong></div>
            <div className="review-stat reveal reveal-delay-1"><p className="eyebrow">The verdict</p><strong>100%</strong><p>of reviewed customers recommend the experience.</p><div className="stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} fill="currentColor" />)}</div></div>
            <div className="review-social reveal reveal-delay-2"><MessageCircle size={24} /><p>Six reviews.<br />One shared feeling.</p><a href={instagramLink} target="_blank" rel="noreferrer" className="text-button">Read more on Instagram <ArrowRight size={15} /></a></div>
          </div>
        </section>

        <section id="contact" className="content-section contact-section">
          <div className="contact-copy reveal"><p className="eyebrow">Let’s make a day of it</p><h2>Your next<br /><em>sweet thing</em><br />starts here.</h2><p>Based in Rangpur, Bangladesh. Always open for an idea, a birthday, a just-because, or a very good cup of tea.</p><div className="contact-actions"><button onClick={openOrder} className="hot-button">Order on WhatsApp <Send size={15} /></button><a href={phoneLink} className="outline-button">Call Mim <Phone size={15} /></a></div></div>
          <div className="contact-card reveal reveal-delay-1"><div className="contact-image"><img src="https://images.pexels.com/photos/3992131/pexels-photo-3992131.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="A cake being finished with delicate cream details" loading="lazy" decoding="async" /><div className="location-chip"><MapPin size={15} /><span><strong>Rangpur, Bangladesh</strong><small>Home baked, locally loved</small></span><Clock3 size={18} /></div></div><a href={directionsLink} target="_blank" rel="noreferrer" className="text-button">Get directions <MapPin size={15} /></a><div className="contact-links"><a href={instagramLink} target="_blank" rel="noreferrer"><span>Instagram</span>@mims.cake.by.world</a><a href={phoneLink}><span>Phone</span>01776-309481</a><span><span>Messenger</span>Mim's cake by world</span></div></div>
        </section>

        <footer className="site-footer">
          <div className="footer-main"><div><div className="brand-lockup footer-brand"><span className="brand-mark"><span>✦</span><strong>M</strong></span><span className="brand-name"><strong>Mim's</strong><em>Cake by World</em></span></div><p className="footer-tagline">A little sweetness<br />goes a long way.</p></div><div><p className="eyebrow">Explore</p>{navItems.slice(1).map((item) => <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}</button>)}</div><div><p className="eyebrow">Say hello</p><a href={instagramLink} target="_blank" rel="noreferrer">Instagram</a><a href={orderLink} target="_blank" rel="noreferrer">WhatsApp</a><a href={phoneLink}>01776-309481</a></div></div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} Mim's Cake by World</span><span>Made at home · shared with love · Rangpur</span></div>
        </footer>
      </div>

      {orderOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="order-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setOrderOpen(false); }}>
          <div className="modal-card">
            <div className="modal-heading"><div><p className="eyebrow">A good place to begin</p><h2 id="order-title">Tell us your<br /><em>sweet idea.</em></h2></div><button onClick={() => setOrderOpen(false)} aria-label="Close order form" className="modal-close"><X size={18} /></button></div>
            {sent ? <div className="success-card"><div className="success-icon"><Check size={18} /></div><h3>Your message is ready.</h3><p>WhatsApp should have opened with your details. If it did not, you can reach Mim directly at 01776-309481.</p><div className="success-actions"><a href={orderLink} target="_blank" rel="noreferrer" className="hot-button">Open WhatsApp <Send size={15} /></a><button onClick={() => setOrderOpen(false)} className="text-button">Done</button></div></div> : <form onSubmit={submitOrder}><label><span>Your name</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="What should we call you?" /></label><label><span>Celebration date <small>(optional)</small></span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><label><span>What are you imagining?</span><textarea required rows={4} value={form.request} onChange={(event) => setForm({ ...form, request: event.target.value })} placeholder="Flavour, size, colours, number of people..." /></label><button type="submit" className="hot-button modal-submit">Continue to WhatsApp <Send size={15} /></button><p className="form-note">We’ll reply with availability, flavour ideas, and a thoughtful quote.</p></form>}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;