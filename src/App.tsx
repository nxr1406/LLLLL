import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowRight, Check, ChevronDown, Clock3, Heart, Instagram, MapPin, Menu, MessageCircle, Phone, Send, Star, X } from 'lucide-react';

const orderLink = 'https://wa.me/8801776309481';
const phoneLink = 'tel:+8801776309481';
const instagramLink = 'https://instagram.com/mims.cake.by.world';
const directionsLink = 'https://www.google.com/maps/search/?api=1&query=Rangpur%2C%20Bangladesh';

const collections = [
  {
    name: 'Celebration cakes',
    note: 'For the big little moments',
    detail: 'Layered, generous, and finished around your story.',
    image: 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=900',
    tone: 'terracotta',
  },
  {
    name: 'Dessert table',
    note: 'Small bites, long conversations',
    detail: 'Brownies, dessert cups, and sweet things worth sharing.',
    image: 'https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=900',
    tone: 'sage',
  },
  {
    name: 'Made for you',
    note: 'A cake with your name on it',
    detail: 'Colours, flavours, and details shaped to your occasion.',
    image: 'https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&cs=tinysrgb&w=900',
    tone: 'gold',
  },
];

const reviews = [
  { quote: 'The cake looked even more beautiful than I imagined. Every bite tasted homemade in the best possible way.', name: 'A happy celebration table', mark: 'A' },
  { quote: 'Mim understood exactly what I wanted and made the whole order feel so personal. We will be ordering again.', name: 'A returning customer', mark: 'R' },
  { quote: 'Soft, fresh, and not overly sweet. It disappeared before the tea was even poured.', name: 'A Rangpur sweet tooth', mark: 'S' },
];

type OrderForm = { name: string; date: string; request: string };

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [form, setForm] = useState<OrderForm>({ name: '', date: '', request: '' });
  const cursorDotRef = useRef<HTMLSpanElement>(null);
  const cursorRingRef = useRef<HTMLSpanElement>(null);

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
    }, { threshold: 0.12 });
    revealElements.forEach((element) => observer.observe(element));
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
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
      cursorDotRef.current?.style.setProperty('--cursor-x', `${event.clientX}px`);
      cursorDotRef.current?.style.setProperty('--cursor-y', `${event.clientY}px`);
      cursorRingRef.current?.style.setProperty('--cursor-x', `${event.clientX}px`);
      cursorRingRef.current?.style.setProperty('--cursor-y', `${event.clientY}px`);
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
    };
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = `Hello Mim's Cake by World! My name is ${form.name}. I'd love to enquire about a cake${form.date ? ` for ${form.date}` : ''}. ${form.request}`;
    window.open(`${orderLink}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  return (
    <main>
      <a href="#top" className="skip-link">Skip to content</a>
      <span ref={cursorDotRef} className="cursor-dot" aria-hidden="true" />
      <span ref={cursorRingRef} className="cursor-ring" aria-hidden="true" />
      <header className={`site-header fixed left-0 right-0 top-0 z-40 text-[#f9f1e7] ${isScrolled ? 'site-header-scrolled' : ''}`}>
        <div className="shell flex h-[84px] items-center justify-between">
          <button onClick={() => scrollTo('top')} aria-label="Mim's Cake by World home" className="group flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f9f1e7]/40 font-serif text-xl italic transition-colors group-hover:bg-[#f9f1e7] group-hover:text-[#183331]">M</span>
            <span className="hidden text-[11px] font-bold uppercase leading-[1.15] tracking-[.18em] sm:block">Mim's Cake<br />by World</span>
          </button>
          <nav aria-label="Main navigation" className="hidden items-center gap-6 text-[11px] font-bold uppercase tracking-[.16em] md:flex">
            <button onClick={() => scrollTo('top')} className="opacity-75 transition-opacity hover:opacity-100">Home</button>
            <button onClick={() => scrollTo('story')} className="opacity-75 transition-opacity hover:opacity-100">About</button>
            <button onClick={() => scrollTo('collection')} className="opacity-75 transition-opacity hover:opacity-100">Cakes</button>
            <button onClick={() => scrollTo('reviews')} className="opacity-75 transition-opacity hover:opacity-100">Reviews</button>
            <button onClick={() => scrollTo('contact')} className="opacity-75 transition-opacity hover:opacity-100">Contact</button>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => { setSent(false); setOrderOpen(true); }} className="hidden rounded-full bg-[#f9f1e7] px-5 py-3 text-[11px] font-bold uppercase tracking-[.13em] text-[#183331] transition-transform hover:-translate-y-0.5 sm:inline-flex">Order a cake</button>
            <button onClick={() => setMenuOpen((current) => !current)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f9f1e7]/40 transition-colors hover:bg-[#f9f1e7] hover:text-[#183331] md:hidden">
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div id="mobile-navigation" className="mobile-menu mx-4 rounded-2xl border border-[#f9f1e7]/20 bg-[#183331] p-5 shadow-2xl md:hidden">
            <div className="flex flex-col gap-4 text-[11px] font-bold uppercase tracking-[.15em]">
              <button onClick={() => scrollTo('top')} className="border-b border-[#f9f1e7]/15 pb-4 text-left">Home</button>
              <button onClick={() => scrollTo('story')} className="border-b border-[#f9f1e7]/15 pb-4 text-left">About</button>
              <button onClick={() => scrollTo('collection')} className="border-b border-[#f9f1e7]/15 pb-4 text-left">Cakes</button>
              <button onClick={() => scrollTo('reviews')} className="border-b border-[#f9f1e7]/15 pb-4 text-left">Reviews</button>
              <button onClick={() => scrollTo('contact')} className="border-b border-[#f9f1e7]/15 pb-4 text-left">Contact</button>
              <button onClick={() => { setMenuOpen(false); setSent(false); setOrderOpen(true); }} className="flex items-center justify-between text-left text-[#edab77]">Order a cake <ArrowRight size={16} /></button>
            </div>
          </div>
        )}
      </header>

      <section id="top" className="hero-grid relative isolate min-h-[920px] overflow-hidden md:min-h-[810px]">
        <div className="shell relative z-10 flex min-h-[920px] flex-col items-start pb-10 pt-32 md:min-h-[810px] md:flex-row md:items-center md:pb-20">
          <div className="relative z-10 max-w-[640px]">
            <p className="eyebrow mb-6 text-[#edab77] reveal">Homemade in Rangpur, Bangladesh</p>
            <h1 className="display max-w-[690px] text-[clamp(3.9rem,10vw,8.7rem)] leading-[.88] reveal reveal-delay-1">A little<br /><em className="text-[#edab77]">sweetness</em><br />goes a long way.</h1>
            <p className="mt-8 max-w-[415px] text-[15px] leading-7 text-[#f9f1e7]/70 reveal reveal-delay-2">Cakes and desserts made in a home kitchen, with the detail and devotion of a tiny dessert atelier.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4 reveal reveal-delay-3">
              <button onClick={() => { setSent(false); setOrderOpen(true); }} className="button-primary bg-[#edab77] text-[#183331] hover:bg-[#f4c79f]">Start an order <ArrowRight size={16} /></button>
              <button onClick={() => scrollTo('collection')} className="link-arrow text-[13px] text-[#f9f1e7]">See the collection <ArrowDown size={15} /></button>
            </div>
          </div>
          <div className="pointer-events-none relative z-0 mt-14 h-[320px] w-[320px] self-end rounded-full md:absolute md:bottom-[10%] md:right-[-4%] md:mt-0 md:h-[640px] md:w-[640px]">
            <div className="hero-art h-full w-full rounded-full border border-[#edab77]/35 p-3">
              <div className="image-wrap h-full w-full rounded-full border-[12px] border-[#edab77]/20">
                <img src="https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="A richly iced chocolate cake on a dessert table" className="h-full w-full object-cover" width="1400" height="1400" fetchPriority="high" decoding="async" />
              </div>
            </div>
          </div>
          <div className="float-note absolute bottom-[13%] right-[4%] z-20 hidden w-[148px] rotate-6 border border-[#183331]/10 bg-[#f3cb8c] px-5 py-4 text-[#183331] shadow-xl lg:block">
            <Heart size={16} fill="currentColor" className="mb-3 text-[#bd603f]" />
            <p className="font-serif text-[19px] leading-[1.05]">Made with a little more heart.</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden border-t border-[#f9f1e7]/10 py-3">
          <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap text-[10px] font-bold uppercase tracking-[.2em] text-[#f9f1e7]/55">
            <span>Always open for something sweet</span><span className="text-[#edab77]">✦</span><span>Small batch · made to order</span><span className="text-[#edab77]">✦</span><span>Rangpur, Bangladesh</span><span className="text-[#edab77]">✦</span>
            <span>Always open for something sweet</span><span className="text-[#edab77]">✦</span><span>Small batch · made to order</span><span className="text-[#edab77]">✦</span><span>Rangpur, Bangladesh</span><span className="text-[#edab77]">✦</span>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9cdbd] bg-[#f9f1e7]">
        <div className="shell grid divide-y divide-[#d9cdbd] py-7 md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="flex items-center gap-4 py-3 md:justify-center md:py-1"><span className="font-serif text-4xl italic text-[#bd603f]">100%</span><span className="max-w-[100px] text-[10px] font-bold uppercase leading-4 tracking-[.12em] text-[#536767]">Recommended by our customers</span></div>
          <div className="flex items-center gap-4 py-4 md:justify-center md:py-1"><span className="font-serif text-4xl italic text-[#bd603f]">06</span><span className="max-w-[100px] text-[10px] font-bold uppercase leading-4 tracking-[.12em] text-[#536767]">Thoughtful reviews<br />and counting</span></div>
          <div className="flex items-center gap-4 py-3 md:justify-center md:py-1"><Clock3 size={26} strokeWidth={1.2} className="text-[#bd603f]" /><span className="max-w-[120px] text-[10px] font-bold uppercase leading-4 tracking-[.12em] text-[#536767]">Always open<br />for your ideas</span></div>
        </div>
      </section>

      <section id="collection" className="section-pad bg-[#f0e4d5]">
        <div className="shell">
          <div className="mb-12 flex flex-col justify-between gap-5 md:mb-16 md:flex-row md:items-end">
            <div className="reveal"><p className="eyebrow mb-4">A table worth gathering around</p><h2 className="display max-w-[590px] text-5xl leading-[.98] md:text-7xl">The good stuff,<br /><em className="text-[#bd603f]">made from scratch.</em></h2></div>
            <p className="max-w-[280px] text-sm leading-6 text-[#536767] reveal reveal-delay-1">From first message to final crumb, every order is made by hand and tailored to the moment.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-[1.14fr_.86fr]">
            <article className="group relative overflow-hidden rounded-[1.25rem] bg-[#bd603f] md:row-span-2 reveal">
              <div className="image-wrap h-[430px] md:h-[635px]"><img src={collections[0].image} alt="A chocolate celebration cake topped with strawberries" className="h-full w-full object-cover mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" /></div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#183331]/90 to-transparent p-7 pt-28 text-[#f9f1e7]"><p className="eyebrow mb-3 text-[#edab77]">01 / For your people</p><h3 className="display text-4xl">{collections[0].name}</h3><p className="mt-3 max-w-[350px] text-sm leading-6 text-[#f9f1e7]/70">{collections[0].detail}</p></div>
            </article>
            {collections.slice(1).map((item, index) => (
              <article key={item.name} className={`group grid overflow-hidden rounded-[1.25rem] ${item.tone === 'sage' ? 'bg-[#c4d0c1]' : 'bg-[#e8bc7c]'} sm:grid-cols-[.85fr_1.15fr] reveal reveal-delay-${index + 1}`}>
                <div className="image-wrap min-h-[230px] sm:min-h-[260px]"><img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" /></div>
                <div className="flex flex-col justify-between p-6 md:p-7"><div><p className="eyebrow mb-5 text-[#183331]/60">0{index + 2} / {item.note}</p><h3 className="display text-3xl leading-[1.03] text-[#183331]">{item.name}</h3></div><p className="mt-7 text-sm leading-6 text-[#183331]/70">{item.detail}</p></div>
              </article>
            ))}
          </div>
          <div className="mt-9 flex flex-col items-start justify-between gap-5 border-t border-[#d1c0ad] pt-7 sm:flex-row sm:items-center reveal"><p className="font-serif text-xl italic text-[#536767]">Your idea is the starting point.</p><button onClick={() => { setSent(false); setOrderOpen(true); }} className="link-arrow text-sm text-[#bd603f]">Tell us what you’re dreaming of <ArrowRight size={17} /></button></div>
        </div>
      </section>

      <section id="story" className="section-pad overflow-hidden bg-[#f9f1e7]">
        <div className="shell grid items-center gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-24">
          <div className="relative mx-auto w-full max-w-[390px] reveal">
            <div className="absolute -left-6 top-8 h-full w-full border border-[#bd603f]/30"></div>
            <div className="image-wrap relative aspect-[4/5]"><img src="https://images.pexels.com/photos/3992382/pexels-photo-3992382.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Hands carefully preparing a homemade cake" className="h-full w-full object-cover" loading="lazy" decoding="async" /></div>
            <p className="absolute -bottom-6 -right-8 w-[150px] rotate-[-5deg] bg-[#183331] px-5 py-4 font-serif text-lg italic leading-[1.1] text-[#edab77]">A home kitchen,<br />with a point of view.</p>
          </div>
          <div className="reveal reveal-delay-1"><p className="eyebrow mb-5">The heart of it</p><h2 className="display max-w-[620px] text-5xl leading-[.98] md:text-7xl">Not just a cake.<br /><em className="text-[#bd603f]">A reason to pause.</em></h2><div className="mt-8 max-w-[540px] space-y-5 text-[15px] leading-7 text-[#536767]"><p>Mim’s Cake by World began with a simple belief: the sweetest celebrations do not need to be loud. They need something made with care, a table that feels like yours, and one more slice than you planned for.</p><p>Everything is baked in small batches in Rangpur, Bangladesh — fresh for your people, your day, and the story you want to tell.</p></div><button onClick={() => scrollTo('contact')} className="link-arrow mt-9 text-sm text-[#bd603f]">Come a little closer <ArrowRight size={17} /></button></div>
        </div>
      </section>

      <section className="section-pad bg-[#183331] text-[#f9f1e7]">
        <div className="shell">
          <div className="grid gap-10 md:grid-cols-[.7fr_1.3fr] md:gap-24"><div className="reveal"><p className="eyebrow text-[#edab77]">The easy part</p><h2 className="display mt-5 text-5xl leading-[.98] md:text-6xl">Three messages<br /><em className="text-[#edab77]">to something lovely.</em></h2></div><div className="grid gap-0 divide-y divide-[#f9f1e7]/15 reveal reveal-delay-1">{[['01', 'Say hello', 'Tell us what you are celebrating, when, and how many people deserve a slice.'], ['02', 'Make it yours', 'We will talk through flavours, colours, size, and the little detail that makes it unmistakably yours.'], ['03', 'Gather around', 'Your fresh, handmade order arrives ready for the moment. All that is left is the first cut.']].map(([number, title, copy]) => <div key={number} className="grid grid-cols-[54px_1fr] gap-5 py-6 first:pt-0 last:pb-0"><span className="font-mono text-xs text-[#edab77]">{number}</span><div><h3 className="font-serif text-2xl">{title}</h3><p className="mt-2 max-w-[430px] text-sm leading-6 text-[#f9f1e7]/60">{copy}</p></div></div>)}</div></div>
        </div>
      </section>

      <section id="reviews" className="section-pad bg-[#e7d8c8]">
        <div className="shell">
          <div className="mb-12 flex items-end justify-between gap-5 reveal"><div><p className="eyebrow mb-4">Kind words, kept close</p><h2 className="display text-5xl leading-none md:text-6xl">The reviews<br /><em className="text-[#bd603f]">say it best.</em></h2></div><div className="hidden items-center gap-2 sm:flex"><button onClick={() => setActiveReview((activeReview + reviews.length - 1) % reviews.length)} aria-label="Previous review" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#bcae9e] transition-colors hover:bg-[#f9f1e7]"><ArrowRight size={15} className="rotate-180" /></button><button onClick={() => setActiveReview((activeReview + 1) % reviews.length)} aria-label="Next review" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#bcae9e] transition-colors hover:bg-[#f9f1e7]"><ArrowRight size={15} /></button></div></div>
          <div className="grid items-stretch gap-5 md:grid-cols-[1fr_1.35fr]">
             <div className="relative min-h-[310px] overflow-hidden rounded-[1.25rem] bg-[#bd603f] p-8 text-[#f9f1e7] md:p-10 reveal"><div className="absolute -right-6 -top-8 font-serif text-[210px] leading-none text-[#e8bc7c]/30">“</div><div className="relative flex h-full flex-col justify-between"><div className="flex gap-1 text-[#f3cb8c]" aria-label="5 out of 5 stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} fill="currentColor" />)}</div><div aria-live="polite"><p className="display max-w-[420px] text-3xl leading-[1.08]">“{reviews[activeReview].quote}”</p><p className="mt-6 text-xs font-bold uppercase tracking-[.12em] text-[#f9f1e7]/70">{reviews[activeReview].name}</p></div></div></div>
            <div className="grid gap-5 sm:grid-cols-2"><div className="flex min-h-[310px] flex-col justify-between rounded-[1.25rem] bg-[#f9f1e7] p-8 reveal reveal-delay-1"><div><p className="eyebrow">The verdict</p><p className="mt-7 font-serif text-5xl italic text-[#bd603f]">100%</p><p className="mt-2 max-w-[165px] text-sm leading-6 text-[#536767]">of reviewed customers recommend the experience.</p></div><div className="flex gap-1 text-[#bd603f]">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} fill="currentColor" />)}</div></div><div className="flex min-h-[310px] flex-col justify-between rounded-[1.25rem] bg-[#183331] p-8 text-[#f9f1e7] reveal reveal-delay-2"><MessageCircle size={24} strokeWidth={1.3} className="text-[#edab77]" /><div><p className="font-serif text-3xl leading-tight">Six reviews.<br />One shared feeling.</p><a href={instagramLink} target="_blank" rel="noreferrer" className="link-arrow mt-7 text-xs text-[#edab77]">Read more on Instagram <ArrowRight size={15} /></a></div></div></div>
          </div>
          <div className="mt-5 flex gap-2 sm:hidden"><button onClick={() => setActiveReview((activeReview + reviews.length - 1) % reviews.length)} aria-label="Previous review" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#bcae9e]"><ArrowRight size={15} className="rotate-180" /></button><button onClick={() => setActiveReview((activeReview + 1) % reviews.length)} aria-label="Next review" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#bcae9e]"><ArrowRight size={15} /></button></div>
        </div>
      </section>

      <section id="contact" className="section-pad bg-[#f9f1e7]">
        <div className="shell grid gap-10 md:grid-cols-[1fr_1fr] md:gap-24">
           <div className="reveal"><p className="eyebrow mb-5">Let’s make a day of it</p><h2 className="display text-5xl leading-[.98] md:text-7xl">Your next<br /><em className="text-[#bd603f]">sweet thing</em><br />starts here.</h2><p className="mt-8 max-w-[360px] text-[15px] leading-7 text-[#536767]">Based in Rangpur, Bangladesh. Always open for an idea, a birthday, a just-because, or a very good cup of tea.</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => { setSent(false); setOrderOpen(true); }} className="button-primary">Order Now on WhatsApp <Send size={15} /></button><a href={phoneLink} className="button-quiet text-sm">Call Mim <Phone size={15} /></a></div></div>
           <div className="reveal reveal-delay-1"><div className="overflow-hidden rounded-[1.25rem] bg-[#e7d8c8] p-2"><div className="relative aspect-[1.12] overflow-hidden"><img src="https://images.pexels.com/photos/3992131/pexels-photo-3992131.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="A cake being finished with delicate cream details" className="h-full w-full object-cover" loading="lazy" decoding="async" /><div className="absolute inset-0 bg-[#183331]/10"></div><div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-[#f9f1e7]/90 p-4 backdrop-blur-sm"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#bd603f] text-[#f9f1e7]"><MapPin size={16} /></span><span><strong className="block text-xs">Rangpur, Bangladesh</strong><span className="text-[11px] text-[#536767]">Home baked, locally loved</span></span></div><Clock3 size={19} className="text-[#bd603f]" /></div></div></div><a href={directionsLink} target="_blank" rel="noreferrer" className="button-quiet mt-5 text-sm">Get Directions <MapPin size={15} /></a><div className="mt-5 grid grid-cols-2 gap-5 text-sm sm:grid-cols-3"><a href={instagramLink} target="_blank" rel="noreferrer" className="group border-t border-[#d9cdbd] pt-4"><span className="eyebrow flex items-center justify-between text-[#536767]">Instagram <Instagram size={15} className="transition-transform group-hover:scale-110" /></span><span className="mt-2 block font-serif text-lg">@mims.cake.by.world</span></a><a href={phoneLink} className="group border-t border-[#d9cdbd] pt-4"><span className="eyebrow flex items-center justify-between text-[#536767]">Phone <Phone size={15} className="transition-transform group-hover:scale-110" /></span><span className="mt-2 block font-serif text-lg">01776-309481</span></a><div className="group border-t border-[#d9cdbd] pt-4"><span className="eyebrow flex items-center justify-between text-[#536767]">Messenger <MessageCircle size={15} /></span><span className="mt-2 block font-serif text-lg">Mim's cake by world</span></div></div></div>
        </div>
      </section>

      <footer className="bg-[#183331] py-12 text-[#f9f1e7]">
        <div className="shell">
          <div className="grid gap-10 border-b border-[#f9f1e7]/15 pb-12 md:grid-cols-[1.4fr_.6fr_.6fr]">
            <div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#edab77] font-serif text-xl italic text-[#edab77]">M</span><span className="text-[11px] font-bold uppercase leading-[1.15] tracking-[.18em]">Mim's Cake<br />by World</span></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.18em] text-[#edab77]">Homemade with love</p><p className="mt-4 max-w-[320px] font-serif text-3xl leading-[1.08] text-[#edab77]">A little sweetness goes a long way.</p></div>
            <div><p className="eyebrow mb-5 text-[#edab77]">Explore</p><div className="flex flex-col items-start gap-3 text-sm text-[#f9f1e7]/65"><button onClick={() => scrollTo('story')} className="hover:text-[#f9f1e7]">About</button><button onClick={() => scrollTo('collection')} className="hover:text-[#f9f1e7]">Cakes</button><button onClick={() => scrollTo('reviews')} className="hover:text-[#f9f1e7]">Reviews</button><button onClick={() => scrollTo('contact')} className="hover:text-[#f9f1e7]">Contact</button></div></div>
            <div><p className="eyebrow mb-5 text-[#edab77]">Say hello</p><div className="flex flex-col items-start gap-3 text-sm text-[#f9f1e7]/65"><a href={instagramLink} target="_blank" rel="noreferrer" className="hover:text-[#f9f1e7]">Instagram</a><a href={phoneLink} className="hover:text-[#f9f1e7]">01776-309481</a><a href={orderLink} target="_blank" rel="noreferrer" className="hover:text-[#f9f1e7]">WhatsApp</a></div></div>
          </div>
          <div className="flex flex-col justify-between gap-4 pt-7 text-[10px] font-bold uppercase tracking-[.14em] text-[#f9f1e7]/40 sm:flex-row"><span>© {new Date().getFullYear()} Mim's Cake by World</span><span>Made at home · shared with love · Rangpur</span></div>
        </div>
      </footer>

      {orderOpen && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#183331]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="order-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setOrderOpen(false); }}>
          <div className="modal-card max-h-[92dvh] w-full max-w-[540px] overflow-y-auto rounded-t-[1.5rem] bg-[#f9f1e7] p-7 text-[#183331] sm:rounded-[1.5rem] sm:p-10">
            <div className="mb-8 flex items-start justify-between"><div><p className="eyebrow mb-3">A good place to begin</p><h2 id="order-title" className="display text-4xl leading-none">Tell us your<br /><em className="text-[#bd603f]">sweet idea.</em></h2></div><button onClick={() => setOrderOpen(false)} aria-label="Close order form" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9cdbd]"><X size={17} /></button></div>
            {sent ? <div className="rounded-2xl bg-[#c4d0c1] p-7"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#183331] text-[#edab77]"><Check size={18} /></div><h3 className="font-serif text-3xl">Your message is ready.</h3><p className="mt-3 text-sm leading-6 text-[#536767]">WhatsApp should have opened with your details. If it did not, you can reach Mim directly at 01776-309481.</p><div className="mt-6 flex flex-wrap gap-3"><a href={orderLink} target="_blank" rel="noreferrer" className="button-primary">Open WhatsApp <Send size={15} /></a><button onClick={() => setOrderOpen(false)} className="button-quiet text-sm">Done</button></div></div> : <form onSubmit={submitOrder} className="space-y-5"><label className="block"><span className="eyebrow mb-2 block text-[#536767]">Your name</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-[#d9cdbd] bg-[#f0e4d5] px-4 py-3 text-sm outline-none focus:border-[#bd603f] focus:ring-2 focus:ring-[#bd603f]/20" placeholder="What should we call you?" /></label><label className="block"><span className="eyebrow mb-2 block text-[#536767]">Celebration date <span className="font-sans normal-case tracking-normal opacity-60">(optional)</span></span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="w-full rounded-xl border border-[#d9cdbd] bg-[#f0e4d5] px-4 py-3 text-sm outline-none focus:border-[#bd603f] focus:ring-2 focus:ring-[#bd603f]/20" /></label><label className="block"><span className="eyebrow mb-2 block text-[#536767]">What are you imagining?</span><textarea required rows={4} value={form.request} onChange={(event) => setForm({ ...form, request: event.target.value })} className="w-full resize-none rounded-xl border border-[#d9cdbd] bg-[#f0e4d5] px-4 py-3 text-sm outline-none focus:border-[#bd603f] focus:ring-2 focus:ring-[#bd603f]/20" placeholder="Flavour, size, colours, number of people..." /></label><button type="submit" className="button-primary w-full">Continue to WhatsApp <Send size={15} /></button><p className="text-center text-[11px] leading-5 text-[#536767]">We’ll reply with availability, flavour ideas, and a thoughtful quote.</p></form>}
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;