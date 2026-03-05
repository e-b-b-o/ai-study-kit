import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useTheme } from '../components/ThemeProvider';
import { BookOpen, Brain, Zap, ArrowRight, Clock, FileText, CheckCircle2, Sun, Moon, Menu, X } from 'lucide-react';
import heroImg from '../assets/hero_study_illustration_1772654680512.png';

function Landing() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Close menu on resize above mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-page">

      {/* ── NAVBAR ── */}
      <nav className="navbar" ref={menuRef}>
        <div className="nav-content">
          <Link to="/" className="logo">
            <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em', color: 'var(--purple-accent)' }}>
              AI Study Kit
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#pricing">Pricing</a>

            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="nav-link-auth">Log In</Link>
                <Link to="/register" className="btn btn-primary">Sign Up Free</Link>
              </>
            )}
          </div>

          {/* Hamburger Button (mobile only) */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle mobile menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        <div className={`mobile-nav-menu ${menuOpen ? 'open' : ''}`}>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#how-it-works" onClick={closeMenu}>How it Works</a>
          <a href="#pricing" onClick={closeMenu}>Pricing</a>
          <div className="mobile-nav-divider" />
          {user ? (
            <button onClick={() => { navigate('/dashboard'); closeMenu(); }} className="btn btn-primary mobile-nav-btn">
              Go to Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="mobile-nav-link">Log In</Link>
              <Link to="/register" onClick={closeMenu} className="btn btn-primary mobile-nav-btn">Sign Up Free</Link>
            </>
          )}
          <button onClick={() => { toggleTheme(); closeMenu(); }} className="mobile-nav-theme">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

        {/* ── HERO (Two-Column Layout) ── */}
        <section className="hero" id="hero">
          <div className="hero-bg-gradient" />
          <div className="hero-grid">
            {/* LEFT — Text Content */}
            <div className="hero-text">
              <h1 className="hero-headline">
                A smarter way to study{' '}
                <span className="text-gradient">Lecture Materials</span>.
              </h1>

              <p className="hero-subheadline">
                Upload your syllabus or PDFs. Instantly generate zero-hallucination academic summaries and multi-choice quizzes.
              </p>

              <div className="hero-actions">
                <button onClick={handleCTA} className="btn btn-primary">
                  Get Started for Free <ArrowRight style={{ marginLeft: '0.5rem', width: 18, height: 18 }} />
                </button>
                <a href="#how-it-works" className="btn btn-outline">
                  See How it Works
                </a>
              </div>

              <div className="hero-trust-badges">
                <span><CheckCircle2 style={{ width: 17, height: 17, color: 'var(--purple-accent)' }} /> Accurate Summary</span>
                <span><Clock style={{ width: 17, height: 17, color: 'var(--purple-accent)' }} /> Save Hours of Reading</span>
              </div>
            </div>

            {/* RIGHT — Illustration */}
            <div className="hero-visual">
              <img
                src={heroImg}
                alt="Student studying with a digital device"
                className="hero-illustration"
              />
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="section-block bg-section-alt">
          <div className="container">
            <div className="section-header">
              <h2>Learn deeply, remember perfectly.</h2>
              <p>We've stripped away conversational chatbots to give you a pure, structured, and distraction-free study environment tailored strictly to your uploaded curriculum.</p>
            </div>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon"><BookOpen size={26} /></div>
                <h3 className="card-title">Academic Summaries</h3>
                <p className="card-text">Instantly parse hundreds of pages into a synthesized outline highlighting core concepts, definitions, and required formulas.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon"><Brain size={26} /></div>
                <h3 className="card-title">Zero Hallucinations</h3>
                <p className="card-text">If the answer isn't in your slides, the engine won't guess. Strict algorithmic constraints ensure you study only real facts.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon"><CheckCircle2 size={26} /></div>
                <h3 className="card-title">10-Question Quizzes</h3>
                <p className="card-text">Validate your knowledge immediately. Hit generate to extract ten multiple-choice questions directly from your text context.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="section-block">
          <div className="container">
            <div className="section-header">
              <h2>From Upload to Mastery in seconds.</h2>
              <p>Our pipeline uses secure vector embeddings to guarantee accuracy without the bloated interface of a standard chatbot.</p>
            </div>
            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-icon-wrapper"><FileText size={30} /></div>
                <h4 className="card-title">Upload PDF</h4>
                <p className="card-text" style={{ textAlign: 'center' }}>Securely ingest your syllabus or lecture slides.</p>
              </div>
              <div className="step-connector" />
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-icon-wrapper"><Zap size={30} /></div>
                <h4 className="card-title">Vector Search</h4>
                <p className="card-text" style={{ textAlign: 'center' }}>We securely embed your text into isolated searchable chunks.</p>
              </div>
              <div className="step-connector" />
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-icon-wrapper"><BookOpen size={30} /></div>
                <h4 className="card-title">Master Concepts</h4>
                <p className="card-text" style={{ textAlign: 'center' }}>Review the generated Academic Summary and Quiz.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="section-block bg-section-alt">
          <div className="container">
            <div className="section-header">
              <h2>Trusted by top students.</h2>
              <p>Join thousands of students who study smarter, not harder.</p>
            </div>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <div className="testimonial-content">"I was tired of generic AI chatbots hallucinating answers that weren't on my syllabus. The strict constraints here ensure I'm actually studying the right material."</div>
                <div className="testimonial-author">
                  <div className="author-avatar" style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)' }}>SJ</div>
                  <div>
                    <div className="author-name">Sarah Jenkins</div>
                    <div className="author-role">Medical Student</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">"The 10-question quiz generator is basically a cheat code for active recall. I upload my slide decks right after class and test myself immediately."</div>
                <div className="testimonial-author">
                  <div className="author-avatar" style={{ background: 'var(--purple-light)', color: 'var(--purple-accent)' }}>MC</div>
                  <div>
                    <div className="author-name">Marcus Chen</div>
                    <div className="author-role">Computer Science, MSc</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">"As a TA, I use this tool to quickly generate cohesive summaries of reading materials for my undergraduate classes. It saves me hours every week."</div>
                <div className="testimonial-author">
                  <div className="author-avatar" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>ER</div>
                  <div>
                    <div className="author-name">Dr. Elena Rostova</div>
                    <div className="author-role">University Professor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="section-block" style={{ borderTop: '1px solid var(--border-light)' }}>
          <div className="container">
            <div className="section-header">
              <h2>Simple, transparent pricing.</h2>
              <p>Start studying smarter today. Upgrade when you need more bandwidth.</p>
            </div>
            <div className="pricing-grid">
              <div className="pricing-card">
                <h3 className="pricing-card-title">Basic</h3>
                <div className="pricing-price"><span className="pricing-amount">$0</span><span className="pricing-period">/mo</span></div>
                <p className="card-text" style={{ marginBottom: '1.5rem' }}>Perfect for testing the waters and light reading.</p>
                <ul className="pricing-features">
                  <li><CheckCircle2 size={16} style={{ color: 'var(--purple-accent)', flexShrink: 0 }} /> Up to 5 PDFs per month</li>
                  <li><CheckCircle2 size={16} style={{ color: 'var(--purple-accent)', flexShrink: 0 }} /> Standard Summaries</li>
                  <li><CheckCircle2 size={16} style={{ color: 'var(--purple-accent)', flexShrink: 0 }} /> 10-Question Quizzes</li>
                </ul>
                <button onClick={handleCTA} className="btn btn-outline" style={{ width: '100%', fontWeight: 700 }}>Start for Free</button>
              </div>
              <div className="pricing-card pricing-card-featured">
                <div className="pricing-badge">Most Popular</div>
                <h3 className="pricing-card-title">Scholar Pro</h3>
                <div className="pricing-price"><span className="pricing-amount">$9</span><span className="pricing-period">/mo</span></div>
                <p className="card-text" style={{ marginBottom: '1.5rem' }}>Everything you need to master your entire semester.</p>
                <ul className="pricing-features">
                  <li><CheckCircle2 size={16} style={{ color: 'var(--purple-accent)', flexShrink: 0 }} /> Unlimited PDFs</li>
                  <li><CheckCircle2 size={16} style={{ color: 'var(--purple-accent)', flexShrink: 0 }} /> Instant Vector Processing</li>
                  <li><CheckCircle2 size={16} style={{ color: 'var(--purple-accent)', flexShrink: 0 }} /> Advanced Quiz Generation</li>
                  <li><CheckCircle2 size={16} style={{ color: 'var(--purple-accent)', flexShrink: 0 }} /> Priority Support</li>
                </ul>
                <button onClick={handleCTA} className="btn btn-primary" style={{ width: '100%', fontWeight: 700 }}>Get Scholar Pro</button>
              </div>
              <div className="pricing-card">
                <h3 className="pricing-card-title">University</h3>
                <div className="pricing-price"><span className="pricing-amount">Custom</span></div>
                <p className="card-text" style={{ marginBottom: '1.5rem' }}>For educators and organizations needing bulk access.</p>
                <ul className="pricing-features">
                  <li><CheckCircle2 size={16} style={{ color: 'var(--purple-accent)', flexShrink: 0 }} /> Unlimited Everything</li>
                  <li><CheckCircle2 size={16} style={{ color: 'var(--purple-accent)', flexShrink: 0 }} /> Local Deployment Options</li>
                  <li><CheckCircle2 size={16} style={{ color: 'var(--purple-accent)', flexShrink: 0 }} /> Custom Guardrails</li>
                </ul>
                <button onClick={handleCTA} className="btn btn-outline" style={{ width: '100%', fontWeight: 700 }}>Contact Us</button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="logo" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em', color: 'var(--purple-accent)' }}>AI Study Kit</span>
              </Link>
              <p>Built as a modern SaaS tool for strict, zero-hallucination PDF studying. Stop chatting, start learning.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link to="/login" className="footer-link">Log In</Link>
              <Link to="/register" className="footer-link">Sign Up</Link>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
          <div className="footer-divider">
            <span>© {new Date().getFullYear()} AI Study Kit Generator. All rights reserved.</span>
            <div className="footer-divider-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Landing;
