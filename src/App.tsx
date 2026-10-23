import { cloneElement, useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { Link, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, Check,
  ChevronDown, Clock3, FlaskConical, HeartPulse, MapPin, Menu, MessageCircle,
  Microscope, Phone, Search, ShieldCheck, Sparkles, X,
} from 'lucide-react'
import { centres, contact, faqs, images, packages, tests, type DiagnosticTest } from './data/catalog'
import { isAppointmentApiConfigured, submitAppointment } from './services/appointment'
import './App.css'

const categories = ['All tests', ...new Set(tests.map((test) => test.category))]

function money(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function localDateToday() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    const siteUrl = import.meta.env.VITE_SITE_URL?.trim() || 'https://example.invalid'
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    canonical?.setAttribute('href', `${siteUrl.replace(/\/$/, '')}${window.location.pathname}`)
  }, [title, description])
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const nav = [
    ['Our tests', '#tests'], ['Health packages', '#packages'], ['Home collection', '#collection'],
    ['About us', '#about'], ['Locations', '#locations'], ['Contact', '#contact'],
  ]
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Vitalis Diagnostics home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><ActivityMark /></span>
          <span className="brand-name">VITALIS<span>DIAGNOSTICS</span></span>
        </Link>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {nav.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <Link className="mobile-report" to="/reports" onClick={() => setMenuOpen(false)}>Report access</Link>
          <a className="button button-primary nav-cta" href="#book" onClick={() => setMenuOpen(false)}>Book a test <ArrowUpRight size={16} /></a>
        </nav>
        <div className="header-actions">
          <Link className="report-link" to="/reports">View reports <ArrowUpRight size={14} /></Link>
          <a className="button button-primary desktop-cta" href="#book">Book a test <ArrowUpRight size={16} /></a>
        </div>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}

function ActivityMark() {
  return <HeartPulse size={22} strokeWidth={1.8} aria-hidden="true" />
}

function SectionHeading({ eyebrow, title, text, centered = false }: { eyebrow: string; title: string; text?: string; centered?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    element.classList.add('reveal-ready')
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: 0.18 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`section-heading ${centered ? 'centered' : ''}`}>
    <span className="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    {text && <p>{text}</p>}
  </div>
}

function TestSearch({ onSelect }: { onSelect: (test: DiagnosticTest) => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All tests')
  const [showResults, setShowResults] = useState(false)
  const results = useMemo(() => tests.filter((test) => {
    const matchesText = `${test.name} ${test.category} ${test.code}`.toLowerCase().includes(query.toLowerCase().trim())
    return matchesText && (category === 'All tests' || test.category === category)
  }).slice(0, 5), [query, category])
  return <div className="search-panel" role="search">
    <div className="search-title"><span className="search-icon"><Search size={18} /></span><div><strong>Find a test</strong><span>Search our illustrative test catalogue</span></div></div>
    <div className="search-controls">
      <label className="search-input">
        <span className="sr-only">Search by test name, category or code</span>
        <Search size={17} aria-hidden="true" />
        <input value={query} onChange={(event) => { setQuery(event.target.value); setShowResults(true) }} onFocus={() => setShowResults(true)} placeholder="Try “Thyroid Profile”" />
        {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}
      </label>
      <label className="select-wrap">
        <span className="sr-only">Test category</span>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setShowResults(true) }}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select><ChevronDown size={16} aria-hidden="true" />
      </label>
      <button className="button button-primary search-button" type="button" onClick={() => setShowResults(true)}>Search tests <ArrowRight size={16} /></button>
    </div>
    {showResults && (query || category !== 'All tests') && <div className="search-results" aria-live="polite">
      <div className="results-head"><span>{results.length ? `${results.length} matching ${results.length === 1 ? 'test' : 'tests'}` : 'No matching tests'}</span><button type="button" aria-label="Close search results" onClick={() => setShowResults(false)}><X size={16} /></button></div>
      {results.length ? results.map((test) => <button className="result-row" type="button" key={test.slug} onClick={() => { onSelect(test); setShowResults(false) }}>
        <span><strong>{test.name}</strong><small>{test.category} · Demo listing</small></span><span className="result-price">{money(test.price)} <ArrowUpRight size={14} /></span>
      </button>) : <p className="no-results">Try another name or category, or contact the laboratory to confirm availability.</p>}
    </div>}
    <span className="demo-note"><span className="demo-dot" /> Demonstration catalogue · availability and details need confirmation</span>
  </div>
}

function TestCard({ test }: { test: DiagnosticTest }) {
  return <article className="test-card">
    <div className="test-card-top"><span className="test-icon"><FlaskConical size={18} /></span><span className="test-code">{test.code}</span></div>
    <span className="card-category">{test.category}</span>
    <h3>{test.name}</h3>
    <p>{test.description}</p>
    <small className="test-confirmation">Sample, preparation and reporting details: confirm with the laboratory.</small>
    <div className="test-card-bottom">
      <span><small>Illustrative price</small><strong>{money(test.price)}</strong></span>
      <Link to={`/tests/${test.slug}`} aria-label={`View details for ${test.name}`}><ArrowUpRight size={18} /></Link>
    </div>
  </article>
}

function TestCatalog() {
  const [active, setActive] = useState('All tests')
  const filtered = active === 'All tests' ? tests : tests.filter((test) => test.category === active)
  return <section className="section tests-section" id="tests">
    <div className="container">
      <div className="section-row">
        <SectionHeading eyebrow="TEST CATALOGUE" title="The right test, made easier to find." text="Browse commonly requested investigations. This sample catalogue is illustrative; please confirm availability, preparation and pricing with the laboratory." />
        <Link className="text-link" to="/tests">Explore all tests <ArrowRight size={16} /></Link>
      </div>
      <div className="category-tabs" role="tablist" aria-label="Filter diagnostic tests">
        {categories.map((category) => <button key={category} role="tab" aria-selected={active === category} className={active === category ? 'active' : ''} onClick={() => setActive(category)}>{category}</button>)}
      </div>
      <div className="test-grid">{filtered.slice(0, 6).map((test) => <TestCard key={test.slug} test={test} />)}</div>
      {filtered.length > 6 && <div className="catalog-more"><a className="button button-outline" href="#tests" onClick={() => setActive('All tests')}>Show featured tests <ArrowDown size={15} /></a></div>}
      <p className="disclaimer-inline"><ShieldCheck size={15} /> Prices and test details are examples only, not an offer to provide services.</p>
    </div>
  </section>
}

function PackageSection({ onBook }: { onBook: (name: string) => void }) {
  return <section className="section package-section" id="packages">
    <div className="container">
      <div className="section-row">
        <SectionHeading eyebrow="PREVENTIVE HEALTH" title="A thoughtful place to start." text="Illustrative health checkup bundles to help you explore options. Discuss suitability with a qualified healthcare professional." />
        <span className="demo-pill"><Sparkles size={14} /> Sample packages</span>
      </div>
      <div className="package-grid">
        {packages.map((item, index) => <article key={item.name} className={`package-card ${index === 1 ? 'featured' : ''}`}>
          {index === 1 && <span className="package-ribbon">Popular sample</span>}
          <div className="package-top"><span className="package-icon"><HeartPulse size={19} /></span><span className="sample-label">DEMO</span></div>
          <h3>{item.name}</h3><p className="package-copy">{item.description}</p>
          <div className="package-price">{typeof item.price === 'number' ? money(item.price) : item.price}<small>{typeof item.price === 'number' ? 'illustrative price' : 'contact us'}</small></div>
          <div className="included"><span>Sample inclusions · confirm before booking</span>
            <ul>{item.inclusions.map((test) => <li key={test}><Check size={14} />{test}</li>)}</ul>
          </div>
          <p className="package-confirmation">Sample requirements, home collection and reporting time: confirm with the centre.</p>
          <Link to={`/packages/${slugify(item.name)}`} className="package-details-link">View package details <ArrowUpRight size={14} /></Link>
          <button type="button" className={`button ${index === 1 ? 'button-primary' : 'button-outline'} package-cta`} onClick={() => onBook(item.name)}>Ask about this package <ArrowRight size={15} /></button>
        </article>)}
      </div>
    </div>
  </section>
}

const bookingSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80, 'Please keep your name under 80 characters.'),
  phone: z.string().trim().regex(/^(?:\+91[\s-]?)?[6-9](?:[\s-]?\d){9}$/, 'Enter a valid 10-digit Indian mobile number.'),
  email: z.union([z.literal(''), z.string().email('Enter a valid email address.')]),
  requested: z.string().min(1, 'Choose a test or package.'),
  collectionType: z.enum(['Centre visit', 'Home sample collection']),
  date: z.string().optional(),
  time: z.string().optional(),
  centre: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().max(300, 'Please keep notes under 300 characters.').optional(),
  consent: z.boolean().refine((value) => value, 'Please confirm that this is an inquiry only.'),
}).superRefine((value, ctx) => {
  if (value.collectionType === 'Home sample collection') {
    if (!value.address || value.address.trim().length < 5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['address'], message: 'Enter the collection address.' })
    }
    if (!value.postalCode || !/^[1-9]\d{5}$/.test(value.postalCode)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['postalCode'], message: 'Enter a valid 6-digit Indian PIN code.' })
    }
  }
  if (value.date) {
    const selected = new Date(`${value.date}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selected < today) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['date'], message: 'Please choose today or a future date.' })
  }
})
type BookingValues = z.infer<typeof bookingSchema>

function BookingForm({ initialRequest = '' }: { initialRequest?: string }) {
  const [submissionState, setSubmissionState] = useState<'demo' | 'whatsapp' | 'api' | null>(null)
  const [formError, setFormError] = useState('')
  const [searchParams] = useSearchParams()
  const defaultTest = searchParams.get('test') ?? searchParams.get('package') ?? initialRequest
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: '', phone: '', email: '', requested: defaultTest, collectionType: 'Centre visit', date: '', time: '', centre: '', address: '', postalCode: '', notes: '', consent: false },
  })
  useEffect(() => {
    if (initialRequest) setValue('requested', initialRequest)
  }, [initialRequest, setValue])
  const collectionType = watch('collectionType')
  const onSubmit = async (values: BookingValues) => {
    setFormError('')
    if (isAppointmentApiConfigured()) {
      try {
        const request = values.collectionType === 'Home sample collection'
          ? values
          : { ...values, address: undefined, postalCode: undefined }
        await submitAppointment(request)
        setSubmissionState('api')
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'The inquiry could not be confirmed. Please try again.')
      }
      return
    }
    const number = contact.whatsappNumber.replace(/\D/g, '')
    if (number && !/X/i.test(contact.whatsappNumber)) {
      const message = [
        'Hello VITALIS DIAGNOSTICS,',
        '',
        'I would like to inquire about a diagnostic service.',
        `Requested Test/Package: ${values.requested}`,
        `Collection Preference: ${values.collectionType}`,
        `Preferred Date: ${values.date || 'Flexible / to discuss'}`,
        `Preferred Time: ${values.time || 'To discuss'}`,
        `Preferred Centre: ${values.centre || 'To confirm'}`,
        ...(values.collectionType === 'Home sample collection' && values.postalCode ? [`Postal Code: ${values.postalCode}`] : []),
        '',
        'Please confirm availability, pricing, preparation requirements, and next steps.',
      ].join('\n')
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
      setSubmissionState('whatsapp')
    } else {
      setSubmissionState('demo')
    }
  }
  return <div className="booking-form-wrap">
    {submissionState ? <div className="demo-submit-state" role="status">
      <span className="success-mark"><Check size={22} /></span>
      <h3>{submissionState === 'api' ? 'Inquiry confirmed' : submissionState === 'whatsapp' ? 'Inquiry message prepared' : 'Demo request preview'}</h3>
      <p>{submissionState === 'api' ? 'The appointment service confirmed receipt of your inquiry. This is not a confirmed appointment; the centre must confirm availability and the requested slot.' : submissionState === 'whatsapp' ? 'A WhatsApp draft was opened. Review it and press Send to transmit your inquiry. No appointment is confirmed until the laboratory responds.' : <>Your details have <strong>not</strong> been sent or stored. This demo has no booking backend or verified WhatsApp number. Please contact the laboratory through its confirmed official channels.</>}</p>
      <button type="button" className="text-link" onClick={() => setSubmissionState(null)}>Return to form <ArrowRight size={15} /></button>
    </div> : <form className="booking-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid">
        <Field label="Patient name" error={errors.name?.message}><input {...register('name')} autoComplete="name" placeholder="Your full name" /></Field>
        <Field label="Phone number" error={errors.phone?.message}><input {...register('phone')} autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210" /></Field>
        <Field label="Email address" error={errors.email?.message}><input {...register('email')} autoComplete="email" type="email" placeholder="Optional" /></Field>
        <Field label="Test or package" error={errors.requested?.message}><select {...register('requested')}><option value="">Select an inquiry</option>{tests.map((test) => <option key={test.slug} value={test.name}>{test.name}</option>)}{packages.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}<option value="Custom test inquiry">Custom test inquiry</option></select></Field>
        <Field label="Collection preference" error={errors.collectionType?.message}><select {...register('collectionType')}><option>Centre visit</option><option>Home sample collection</option></select></Field>
        <Field label="Preferred date" error={errors.date?.message}><input {...register('date')} type="date" min={localDateToday()} /></Field>
        <Field label="Preferred time window" error={errors.time?.message}><select {...register('time')}><option value="">Choose a time</option><option>Morning · confirm availability</option><option>Afternoon · confirm availability</option><option>Evening · confirm availability</option></select></Field>
        <Field label="Centre location" error={errors.centre?.message}><select {...register('centre')}><option value="">{centres.length ? 'Choose a centre' : 'Location to be confirmed'}</option>{centres.map((centre) => <option key={centre.name} value={centre.name}>{centre.name}</option>)}</select></Field>
        {collectionType === 'Home sample collection' && <>
          <Field label="Collection address" error={errors.address?.message} className="full-width"><input {...register('address')} autoComplete="street-address" placeholder="Address for collection coordination" maxLength={160} /></Field>
          <Field label="Postal code" error={errors.postalCode?.message}><input {...register('postalCode')} inputMode="numeric" placeholder="6-digit PIN code" maxLength={6} /></Field>
        </>}
        <Field label={collectionType === 'Home sample collection' ? 'Special access instructions' : 'Additional notes'} error={errors.notes?.message} className="full-width"><textarea {...register('notes')} placeholder="Optional access instructions only; please don't share medical or report information." rows={3} maxLength={300} /></Field>
      </div>
      <label className="consent-check"><input type="checkbox" {...register('consent')} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-error' : undefined} /> <span>I understand this is an inquiry only. Availability, pricing and any appointment need confirmation.</span></label>
      {errors.consent && <span className="field-error" id="consent-error">{errors.consent.message}</span>}
      {formError && <p className="submission-error" role="alert">{formError}</p>}
      <button type="submit" className="button button-primary form-submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting securely…' : 'Review inquiry'} {!isSubmitting && <ArrowRight size={16} />}</button>
      <p className="form-privacy"><ShieldCheck size={14} /> {isAppointmentApiConfigured() ? 'Your inquiry will be sent securely to the configured appointment service.' : contact.whatsappNumber ? 'WhatsApp opens a draft. Press Send to transmit; an appointment is not confirmed.' : 'Demo mode: form values stay in this browser session and are not transmitted or saved.'}</p>
    </form>}
  </div>
}

function Field({ label, error, children, className = '' }: { label: string; error?: string; children: ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>; className?: string }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return <div className={`form-field ${className}`}><label htmlFor={id}>{label}</label>{cloneElement(children, { id, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined })}{error && <span className="field-error" id={`${id}-error`}>{error}</span>}</div>
}

function HomeCollection() {
  return <section className="collection-section" id="collection">
    <div className="container collection-inner">
      <div className="collection-copy">
        <span className="eyebrow light-eyebrow">AT-HOME COLLECTION</span>
        <h2>Testing, made more convenient.</h2>
        <p>Request a home sample collection inquiry and our team can confirm whether your area, selected test and preferred time are serviceable.</p>
        <div className="collection-points"><span><MapPin size={17} /> PIN-code availability needs confirmation</span><span><CalendarDays size={17} /> Your request is not a confirmed slot</span></div>
        <a href="#book" className="button button-white">Request a collection <ArrowRight size={16} /></a>
      </div>
      <div className="collection-art" role="img" aria-label="Illustration of a home sample collection request">
        <img className="collection-image" src={images.collection} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }} />
        <div className="collection-note"><span className="note-icon"><Clock3 size={17} /></span><span><strong>Choose what works for you</strong><small>Team confirmation required</small></span></div>
      </div>
    </div>
  </section>
}

function AboutSection() {
  const steps = [
    ['01', 'Choose an inquiry', 'Explore tests and sample packages. Confirm details with the team.'],
    ['02', 'Request a time', 'Share only the contact and scheduling details needed to coordinate.'],
    ['03', 'Confirm directly', 'The laboratory must confirm availability, preparation and next steps.'],
  ]
  return <section className="section about-section" id="about"><div className="container">
    <div className="about-top">
      <div className="about-image"><img src={images.about} alt="Bright modern healthcare consultation space" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }} /><span className="image-caption"><span className="caption-dot" /> Patient-first, always</span></div>
      <div className="about-copy"><span className="eyebrow">A CLEARER EXPERIENCE</span><h2>Built around accuracy, care, and clarity.</h2><p>VITALIS DIAGNOSTICS is a fictional independent diagnostic centre concept. This experience is designed to make test information and appointment inquiries easier to navigate—without overstating what a laboratory can do.</p>
        <div className="about-promise"><BadgeCheck size={21} /><span><strong>Trust starts with transparency.</strong><small>Every catalogue item and service shown here is sample data until verified by the centre.</small></span></div>
      </div>
    </div>
    <div className="workflow">
      <div className="workflow-heading"><span className="eyebrow">HOW IT WORKS</span><h3>Three simple steps to get started.</h3></div>
      {steps.map(([number, title, text]) => <div className="workflow-step" key={number}><span className="step-number">{number}</span><h4>{title}</h4><p>{text}</p></div>)}
    </div>
  </div></section>
}

function Locations() {
  return <section className="section locations-section" id="locations"><div className="container location-content">
    <div><SectionHeading eyebrow="FIND US" title="A location that feels closer." text="We don't have verified centre addresses yet. Contact details and opening hours should be added here before launch." /><a href="#contact" className="text-link">Ask about locations <ArrowRight size={16} /></a></div>
    {centres.length ? <div className="configured-locations">{centres.map((centre) => <article key={centre.name} className="location-card configured-location"><div className="location-details"><div className="location-title"><span className="location-icon"><MapPin size={18} /></span><span><strong>{centre.name}</strong><small>{centre.address}</small></span></div><div className="location-facts"><span><Clock3 size={15} /> {centre.hours}</span><span><Phone size={15} /> {centre.phone}</span></div>{centre.services.length > 0 && <p className="configured-services">Services: {centre.services.join(', ')}</p>}<p className="configured-services">Home collection: {centre.homeCollection}</p>{centre.verified && <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centre.address)}`} target="_blank" rel="noreferrer">Directions <ArrowUpRight size={14} /></a>}</div></article>)}</div> : <div className="location-card">
      <div className="location-map"><div className="map-circle circle-one"></div><div className="map-circle circle-two"></div><div className="map-pin"><MapPin size={22} /></div><span className="map-label">Location details to be configured</span></div>
      <div className="location-details"><div className="location-title"><span className="location-icon"><MapPin size={18} /></span><span><strong>VITALIS DIAGNOSTICS</strong><small>Sample location · not a real centre</small></span></div>
        <p className="unconfigured"><span className="demo-dot" /> Address, opening hours and directions will appear when verified.</p>
        <div className="location-facts"><span><Clock3 size={15} /> Hours: confirm with centre</span><span><Phone size={15} /> Phone: not configured</span></div>
      </div>
    </div>}
  </div></section>
}

function FAQSection() {
  return <section className="section faq-section" id="faq"><div className="container faq-layout">
    <div><SectionHeading eyebrow="GOOD TO KNOW" title="Questions, answered with care." text="Answers are placeholders until the laboratory verifies its policies." /><a href="#contact" className="text-link">Still have a question? <ArrowRight size={16} /></a></div>
    <div className="faq-list">{faqs.map((item) => <details key={item.question} className="faq-item"><summary>{item.question}<span><ChevronDown size={17} /></span></summary><p>{item.answer}</p></details>)}</div>
  </div></section>
}

function ContactSection({ selectedRequest }: { selectedRequest: string }) {
  return <section className="section contact-section" id="contact"><div className="container contact-layout">
    <div className="contact-copy"><span className="eyebrow">HERE TO HELP</span><h2>Let's make your next step clearer.</h2><p>Our sample inquiry form can help you prepare a request. No message is sent until a real contact integration is configured.</p>
      <div className="contact-item"><span><Phone size={17} /></span><div><small>CALL US</small><strong>{contact.phone || 'Phone number not configured'}</strong></div></div>
      <div className="contact-item"><span><MessageCircle size={17} /></span><div><small>WHATSAPP</small><strong>{contact.whatsappNumber || 'Business number not configured'}</strong></div></div>
      <div className="contact-item"><span><MapPin size={17} /></span><div><small>VISIT</small><strong>{contact.address || 'Centre address to be confirmed'}</strong></div></div>
      <div className="contact-item"><span><MessageCircle size={17} /></span><div><small>EMAIL</small><strong>{contact.email || 'Email address not configured'}</strong></div></div>
    </div>
    <div className="form-card" id="book"><div className="form-card-heading"><div><span className="eyebrow">BOOKING INQUIRY</span><h3>Tell us what you need.</h3></div><span className="form-card-icon"><CalendarDays size={20} /></span></div><p className="form-intro">A request is not an appointment confirmation. The laboratory needs to contact you to confirm.</p><BookingForm initialRequest={selectedRequest} /></div>
  </div></section>
}

function Footer() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-main"><div className="footer-brand"><Link to="/" className="brand"><span className="brand-mark"><ActivityMark /></span><span className="brand-name">VITALIS<span>DIAGNOSTICS</span></span></Link><p>Clarity for Better Care.</p><span className="demo-pill"><span className="demo-dot" /> DEMO WEBSITE</span></div>
      <div className="footer-links"><div><strong>Explore</strong><a href="#tests">Diagnostic tests</a><a href="#packages">Health packages</a><a href="#collection">Home collection</a></div><div><strong>Support</strong><a href="#faq">FAQs</a><Link to="/reports">Report access</Link><a href="#contact">Contact</a></div><div><strong>Important</strong><a href="#about">About the demo</a><a href="#contact">Privacy notice</a><a href="#contact">Patient information</a></div></div>
    </div>
    <div className="footer-bottom"><span>© 2026 VITALIS DIAGNOSTICS · Fictional demonstration brand</span><span>Replace all sample content with verified centre information before launch.</span></div>
    <p className="medical-disclaimer">Test information is for general educational purposes only. Test selection and interpretation should be discussed with a qualified healthcare professional. A laboratory report alone is not a substitute for clinical evaluation.</p>
  </div></footer>
}

function FloatingSupport() {
  const [open, setOpen] = useState(false)
  const whatsappNumber = contact.whatsappNumber.replace(/\D/g, '')
  const whatsAppUrl = whatsappNumber && !/X/i.test(contact.whatsappNumber)
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello VITALIS DIAGNOSTICS, I would like general information about your diagnostic services. Please confirm how I can reach your team.')}`
    : undefined
  return <>{whatsAppUrl ? <a className="floating-support" aria-label="Open WhatsApp with a general inquiry" href={whatsAppUrl} target="_blank" rel="noreferrer"><MessageCircle size={21} /><span>Need help?</span></a> : <button className="floating-support" type="button" aria-label="Check WhatsApp contact configuration" onClick={() => setOpen(true)}><MessageCircle size={21} /><span>Need help?</span></button>}
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}><div className="support-modal" role="dialog" aria-modal="true" aria-labelledby="support-title"><button className="modal-close" type="button" aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></button><span className="modal-icon"><MessageCircle size={21} /></span><h3 id="support-title">WhatsApp isn't configured yet</h3><p>This demo doesn't have a verified business number. No message has been sent. You can still prepare a request using the booking inquiry form.</p><a className="button button-primary" href="#book" onClick={() => setOpen(false)}>Go to inquiry form <ArrowRight size={15} /></a></div></div>}
  </>
}

function HomePage() {
  const navigate = useNavigate()
  const [request, setRequest] = useState('')
  usePageMeta(
    'VITALIS DIAGNOSTICS | Clarity for Better Care',
    'Explore diagnostic test information, sample health packages and collection inquiries through VITALIS DIAGNOSTICS. Demonstration content; confirm all details with the laboratory.',
  )
  const chooseTest = (test: DiagnosticTest) => navigate(`/tests/${test.slug}`)
  return <>
    <Header />
    <main>
      <section className="hero"><div className="container hero-grid">
        <div className="hero-copy hero-enter"><div className="hero-kicker"><span className="kicker-dot"></span> YOUR HEALTH. OUR COMMITMENT.</div><h1>Reliable diagnostics.<br /><em>Clearer next steps.</em></h1><p>Explore diagnostic tests, preventive health packages, and convenient sample collection through a patient-focused laboratory experience.</p><div className="hero-actions"><a className="button button-primary" href="#tests">Explore diagnostic tests <ArrowRight size={16} /></a><a className="button button-quiet" href="#book">Request an inquiry <ArrowUpRight size={16} /></a></div>
          <div className="hero-footnote"><span className="mini-avatars"><i>V</i><i>+</i><i>✓</i></span><span>Clear information, with care.<small>Sample content · details need verification</small></span></div>
        </div>
        <div className="hero-visual"><img src={images.hero} alt="Healthcare professional in a modern clinical setting" fetchPriority="high" onError={(event) => { event.currentTarget.style.display = 'none' }} /><span className="hero-image-tag"><span className="live-dot"></span> Patient-first diagnostics</span><div className="hero-stat"><span className="stat-icon"><Microscope size={19} /></span><span><strong>Clarity at every step</strong><small>Find · inquire · confirm</small></span></div><div className="hero-decor"></div></div>
      </div><div className="container search-container"><TestSearch onSelect={chooseTest} /></div>
      </section>
      <div className="trust-strip"><div className="container trust-inner"><span><ShieldCheck size={18} /> Transparent information</span><span><HeartPulse size={18} /> Patient-first experience</span><span><MapPin size={18} /> Collection options to confirm</span><span><BadgeCheck size={18} /> No unverified claims</span></div></div>
      <TestCatalog />
      <PackageSection onBook={(name) => { setRequest(name); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} />
      <HomeCollection />
      <AboutSection />
      <Locations />
      <FAQSection />
      <ContactSection selectedRequest={request} />
    </main>
    <Footer />
    <FloatingSupport />
    {request && <span className="sr-only" aria-live="polite">{request} selected for inquiry. Choose it in the form to continue.</span>}
  </>
}

function TestDetailPage() {
  const navigate = useNavigate()
  const slug = window.location.pathname.split('/').filter(Boolean).at(-1)
  const test = tests.find((item) => item.slug === slug)
  usePageMeta(
    test ? `${test.name} | VITALIS DIAGNOSTICS` : 'Test not found | VITALIS DIAGNOSTICS',
    test ? `${test.name}: illustrative test information and pricing. Confirm availability and preparation with the laboratory.` : 'This demonstration test listing could not be found.',
  )
  if (!test) return <><Header /><main className="not-found container"><span className="eyebrow">TEST NOT FOUND</span><h1>We couldn't find that listing.</h1><Link className="button button-primary" to="/">Back to home</Link></main><Footer /></>
  return <><Header /><main className="detail-page"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><a href="/#tests">Tests</a><span>/</span><span>{test.name}</span></nav>
    <div className="detail-layout"><article className="detail-main"><span className="eyebrow">{test.category} · DEMONSTRATION LISTING</span><h1>{test.name}</h1><p className="detail-lede">{test.description}</p><div className="detail-info-grid"><InfoBlock title="What it measures" text={test.description} /><InfoBlock title="Sample type" text="Confirm with the laboratory before booking." /><InfoBlock title="Preparation" text="Preparation requirements are not configured. Confirm with the laboratory." /><InfoBlock title="Reporting time" text="Confirm with the laboratory; no timeframe has been verified." /></div>
      <div className="detail-disclaimer"><ShieldCheck size={19} /><p>Test information is provided for general educational purposes. Test selection and interpretation should be discussed with a qualified healthcare professional. The laboratory report alone is not a substitute for clinical evaluation.</p></div>
      <div className="faq-item detail-faq"><details><summary>Do I need to prepare for this test?<span><ChevronDown size={17} /></span></summary><p>Preparation information has not been verified. Contact the laboratory and follow advice from your qualified healthcare professional.</p></details></div></article>
      <aside className="detail-aside"><span className="aside-label">ILLUSTRATIVE PRICE</span><strong className="detail-price">{money(test.price)}</strong><span className="aside-note">Demo data only · confirm current pricing and availability</span><button className="button button-primary" onClick={() => navigate(`/?test=${encodeURIComponent(test.name)}#book`)}>Request this test <ArrowRight size={16} /></button><Link to="/#tests" className="button button-outline">Browse other tests</Link></aside></div>
  </div></main><Footer /><FloatingSupport /></>
}

function PackageDetailsPage() {
  const slug = window.location.pathname.split('/').filter(Boolean).at(-1)
  const item = packages.find((entry) => slugify(entry.name) === slug)
  usePageMeta(
    item ? `${item.name} | VITALIS DIAGNOSTICS` : 'Package not found | VITALIS DIAGNOSTICS',
    item ? `${item.name}: illustrative health package details. Confirm contents, availability and suitability before arranging any test.` : 'This demonstration package could not be found.',
  )
  if (!item) return <><Header /><main className="not-found container"><span className="eyebrow">PACKAGE NOT FOUND</span><h1>We couldn't find that package.</h1><Link className="button button-primary" to="/">Back to home</Link></main><Footer /></>
  return <><Header /><main className="detail-page"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><a href="/#packages">Health packages</a><span>/</span><span>{item.name}</span></nav><div className="detail-layout"><article className="detail-main"><span className="eyebrow">SAMPLE HEALTH PACKAGE · DEMONSTRATION</span><h1>{item.name}</h1><p className="detail-lede">{item.description}</p><section className="package-detail-list"><h2>Sample inclusions</h2><p>Every inclusion below is illustrative and must be checked against the centre's current services and clinical guidance.</p><ul>{item.inclusions.map((test) => <li key={test}><Check size={15} />{test}</li>)}</ul></section><div className="detail-info-grid"><InfoBlock title="Preparation and sample" text="Requirements have not been verified. Confirm specific instructions with the laboratory." /><InfoBlock title="Collection availability" text="Centre visit or home collection availability must be confirmed for this package and your location." /><InfoBlock title="Reporting time" text="No reporting time has been verified. Contact the centre to confirm an estimate." /><InfoBlock title="Clinical suitability" text="Discuss package selection with a qualified healthcare professional. Package availability does not imply suitability." /></div><div className="detail-disclaimer"><ShieldCheck size={19} /><p>Test information is provided for general educational purposes. Test selection and interpretation should be discussed with a qualified healthcare professional. The laboratory report alone is not a substitute for clinical evaluation.</p></div></article><aside className="detail-aside"><span className="aside-label">ILLUSTRATIVE PRICE</span><strong className="detail-price">{typeof item.price === 'number' ? money(item.price) : item.price}</strong><span className="aside-note">Demo data only · confirm current pricing and package contents</span><Link className="button button-primary" to={`/?package=${encodeURIComponent(item.name)}#book`}>Ask about this package <ArrowRight size={16} /></Link><Link to="/#packages" className="button button-outline">Browse other packages</Link></aside></div></div></main><Footer /><FloatingSupport /></>
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return <div className="info-block"><h3>{title}</h3><p>{text}</p></div>
}

function ReportsPage() {
  usePageMeta(
    'Secure Report Access | VITALIS DIAGNOSTICS',
    'Secure report access is not configured on this demonstration website. Contact the diagnostic centre through verified official channels.',
  )
  return <><Header /><main className="report-page"><div className="container report-card"><span className="report-icon"><ShieldCheck size={24} /></span><span className="eyebrow">REPORT ACCESS</span><h1>Your reports deserve secure access.</h1><p>Secure patient authentication is not connected to this demonstration website. There is no report lookup here, and no report can be accessed through a name, phone number, or guessed ID.</p><div className="report-status"><span className="status-indicator"></span> Secure report integration not configured</div><div className="report-guidance"><h2>Need help with a report?</h2><p>Contact the diagnostic centre using its verified official phone number or visit in person. Do not send reports or sensitive health information through public links or unverified messaging accounts.</p></div><Link className="button button-primary" to="/#contact">Contact information <ArrowRight size={16} /></Link><Link className="back-home" to="/">← Return to VITALIS home</Link></div></main><Footer /></>
}

function AllTestsPage() {
  const [query, setQuery] = useState('')
  usePageMeta(
    'Diagnostic Tests | VITALIS DIAGNOSTICS',
    'Browse an illustrative catalogue of diagnostic tests from VITALIS DIAGNOSTICS. Sample listings and prices require laboratory confirmation.',
  )
  const filtered = tests.filter((test) => `${test.name} ${test.category}`.toLowerCase().includes(query.toLowerCase()))
  return <><Header /><main className="all-tests-page"><div className="container"><span className="eyebrow">DEMONSTRATION CATALOGUE</span><h1>Explore diagnostic tests.</h1><p className="all-tests-intro">All listings and prices below are editable examples. Confirm service availability and details with the laboratory.</p><label className="all-tests-search"><Search size={17} /><input aria-label="Filter tests" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tests or categories" /></label><div className="test-grid">{filtered.map((test) => <TestCard key={test.slug} test={test} />)}</div>{!filtered.length && <p className="no-results">No tests match your search. Please try another term.</p>}</div></main><Footer /></>
}

function App() {
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/tests" element={<AllTestsPage />} />
    <Route path="/tests/:slug" element={<TestDetailPage />} />
    <Route path="/packages/:slug" element={<PackageDetailsPage />} />
    <Route path="/reports" element={<ReportsPage />} />
    <Route path="*" element={<TestDetailPage />} />
  </Routes>
}

export default App
