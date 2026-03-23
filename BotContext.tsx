/* ========================================
   Nathan-Dash — Custom MkDocs Material CSS
   ======================================== */

/* Hero section on homepage */
.md-typeset .hero {
  text-align: center;
  padding: 2rem 1rem;
  margin-bottom: 2rem;
}

.md-typeset .hero h1 {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #7c4dff, #ffab40);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.md-typeset .hero p.subtitle {
  font-size: 1.3rem;
  opacity: 0.8;
  margin-top: 0;
}

/* Feature cards grid */
.md-typeset .grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.md-typeset .card {
  border: 1px solid var(--md-default-fg-color--lightest);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  background: var(--md-default-bg-color);
}

.md-typeset .card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: var(--md-primary-fg-color);
}

.md-typeset .card .card-icon {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.md-typeset .card h3 {
  margin-top: 0.5rem;
  font-weight: 700;
}

/* Steps timeline */
.md-typeset .steps {
  position: relative;
  padding-left: 2rem;
  margin: 2rem 0;
}

.md-typeset .steps::before {
  content: "";
  position: absolute;
  left: 0.9rem;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, var(--md-primary-fg-color), var(--md-accent-fg-color));
  border-radius: 3px;
}

.md-typeset .step {
  position: relative;
  padding: 1rem 0 1rem 1.5rem;
}

.md-typeset .step::before {
  content: attr(data-step);
  position: absolute;
  left: -1.6rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--md-primary-fg-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

/* Command highlight box */
.md-typeset .cmd-box {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border-left: 4px solid var(--md-accent-fg-color);
}

.md-typeset .cmd-box code {
  color: #e2e8f0;
  font-size: 0.95rem;
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .md-typeset .hero h1 {
    font-size: 2rem;
  }

  .md-typeset .hero p.subtitle {
    font-size: 1.1rem;
  }

  .md-typeset .grid-cards {
    grid-template-columns: 1fr;
  }
}

/* Status badges */
.md-typeset .status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.md-typeset .status.online { background: #dcfce7; color: #166534; }
.md-typeset .status.offline { background: #fee2e2; color: #991b1b; }
.md-typeset .status.warning { background: #fef3c7; color: #92400e; }

[data-md-color-scheme="slate"] .md-typeset .status.online { background: #166534; color: #dcfce7; }
[data-md-color-scheme="slate"] .md-typeset .status.offline { background: #991b1b; color: #fee2e2; }
[data-md-color-scheme="slate"] .md-typeset .status.warning { background: #92400e; color: #fef3c7; }

/* Architecture diagram container */
.md-typeset .architecture {
  overflow-x: auto;
  margin: 1.5rem 0;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Better inline code in admonitions */
.md-typeset .admonition code,
.md-typeset details code {
  font-size: 0.82rem;
}
