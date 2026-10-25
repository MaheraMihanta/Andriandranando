import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const pages = { accueil: 'Accueil', actualites: 'Actualités', inscriptions: 'Inscriptions', credits: 'Crédits photos' };
const landscapeSource = 'https://commons.wikimedia.org/wiki/File:Landscape_around_Tananarive_(3189647809).jpg';
const heritageSource = 'https://commons.wikimedia.org/wiki/File:Ambohimanga_(3189639665).jpg';
const photoLicense = 'https://creativecommons.org/licenses/by-sa/2.0/';
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Indian/Antananarivo' });

function currentPage() {
  const key = window.location.hash.slice(1);
  return Object.hasOwn(pages, key) ? key : 'accueil';
}

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}

function App() {
  const [page, setPage] = useState(currentPage);
  const main = useRef(null);
  useEffect(() => {
    const navigate = () => {
      setPage(currentPage());
      window.scrollTo({ top: 0, behavior: 'instant' });
      main.current?.focus({ preventScroll: true });
    };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  useEffect(() => { document.title = `${pages[page]} — NY ANDRIANDRANANDO`; }, [page]);
  return <>
    <a className="skip-link" href="#contenu" onClick={(event) => { event.preventDefault(); main.current?.focus(); }}>Aller au contenu</a>
    <header className="site-header"><div className="container header-inner">
      <a className="brand" href="#accueil" aria-label="NY ANDRIANDRANANDO, accueil"><span className="brand-symbol" aria-hidden="true">N<span>A</span></span><span><strong>NY ANDRIANDRANANDO</strong><small>Une histoire qui nous rassemble</small></span></a>
      <nav aria-label="Navigation principale">{['accueil', 'actualites', 'inscriptions'].map((key) => <a key={key} href={`#${key}`} className={`${page === key ? 'active' : ''} ${key === 'inscriptions' ? 'nav-join' : ''}`} aria-current={page === key ? 'page' : undefined}>{pages[key]}{key === 'inscriptions' && <Arrow />}</a>)}</nav>
    </div></header>
    <main id="contenu" ref={main} tabIndex={-1}>{page === 'accueil' && <Home />}{page === 'actualites' && <News />}{page === 'inscriptions' && <Registration />}{page === 'credits' && <Credits />}</main>
    <footer className="site-footer"><div className="container footer-inner"><div><a className="footer-brand" href="#accueil">NY ANDRIANDRANANDO</a><p>Nos racines nous relient. L’avenir nous rassemble.</p></div><div className="footer-links"><a href="#actualites">Nos actualités</a><a href="#inscriptions">Se faire recenser</a><a href="#credits">Crédits photos</a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} NY ANDRIANDRANANDO</span><span>Un espace pour notre communauté, où que nous soyons.</span></div></footer>
  </>;
}

function Home() {
  return <>
    <section className="container hero">
      <div className="hero-copy"><p className="eyebrow">Tonga soa · Bienvenue chez nous</p><h1>Nos racines.<br />Notre histoire.<br /><em>Notre lien.</em></h1><p className="lead">Un lieu pour nous retrouver, faire vivre la mémoire des Andriandranando et rapprocher les générations.</p><div className="hero-actions"><a className="button" href="#inscriptions">Rejoindre le recensement <Arrow /></a><a className="text-link" href="#actualites">La vie de la communauté <Arrow diagonal /></a></div><div className="hero-note"><span className="small-orbit" aria-hidden="true">✳</span><p>De nos vohitra à tous les horizons,<br /><strong>gardons le lien.</strong></p></div></div>
      <figure className="hero-visual"><img src="/images/hautes-terres.jpg" alt="Paysage vallonné et terres cultivées autour d’Antananarivo, photographiés en 1979" width="1799" height="1199" fetchPriority="high" /><span className="photo-label">Madagasikara <span>Nos terres, nos attaches</span></span><figcaption>Paysage autour d’Antananarivo, 1979 · <a href="#credits">mwanasimba / CC BY-SA 2.0</a></figcaption><div className="image-seal" aria-hidden="true">NY<br /><span>ANDRIANDRANANDO</span></div></figure>
    </section>
    <div className="values-strip"><div className="container"><span>Fihavanana <small>Le lien qui nous unit</small></span><span aria-hidden="true">✳</span><span>Fahatsiarovana <small>La mémoire que l’on transmet</small></span><span aria-hidden="true">✳</span><span>Firaisankina <small>La force d’être ensemble</small></span></div></div>
    <section className="container section mission"><div><p className="eyebrow">Notre raison d’être</p><h2>Une communauté vivante,<br /><em>une mémoire partagée.</em></h2></div><div className="mission-copy"><p>Les distances changent, nos attaches demeurent. Cet espace rassemble les familles Andriandranando autour de ce qui nous est précieux : nos villages, nos histoires et les liens entre générations.</p><p>En participant au recensement, chacun aide à mieux connaître notre communauté et à préserver sa mémoire familiale.</p></div></section>
    <section className="container pillars" aria-label="Les objectifs de notre communauté">{[['01', 'Nous retrouver', 'Garder un point de rencontre commun, au-delà des réseaux sociaux et de la distance.'], ['02', 'Nous connaître', 'Rassembler les informations de nos familles et de leurs vohitra grâce au recensement.'], ['03', 'Transmettre', 'Conserver les récits familiaux et les repères de notre patrimoine pour les générations à venir.']].map(([number, title, text]) => <article className="pillar" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</section>
    <section className="container section"><div className="section-heading"><div><p className="eyebrow">Au fil des jours</p><h2>La vie de la communauté</h2></div><a className="text-link" href="#actualites">Toutes les actualités <Arrow /></a></div><NewsFeed limit={3} /></section>
    <section className="container join-banner"><div><p className="eyebrow">Chaque famille compte</p><h2>Une histoire commune.<br /><em>Une place pour chacun.</em></h2><p>Quelques minutes pour vous faire connaître et contribuer à la mémoire de notre communauté.</p></div><a className="button button-light" href="#inscriptions">Je me fais recenser <Arrow /></a></section>
  </>;
}

function News() {
  return <div className="container section page-content"><p className="eyebrow">Restons en lien</p><h1 className="page-title">Les nouvelles<br /><em>de notre communauté.</em></h1><p className="page-intro">Rencontres, initiatives et mémoire partagée : retrouvez ici les informations publiées par les responsables de la communauté.</p><NewsFeed withFilters /></div>;
}

function NewsFeed({ limit, withFilters = false }) {
  const [state, setState] = useState({ loading: true, articles: [], error: false });
  const [filter, setFilter] = useState('toutes');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let active = true;
    setState({ loading: true, articles: [], error: false });
    fetch('/api/actualites', { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error('Service indisponible');
      const data = await response.json();
      if (!Array.isArray(data.actualites)) throw new Error('Réponse invalide');
      if (active) setState({ loading: false, articles: data.actualites, error: false });
    }).catch(() => { if (active) setState({ loading: false, articles: [], error: true }); }).finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [retry]);
  const articles = state.articles.filter((article) => filter === 'toutes' || article.categorie === filter).slice(0, limit);
  return <>
    {withFilters && <div className="filters" role="group" aria-label="Filtrer les actualités">{[['toutes', 'Toutes'], ['communaute', 'Vie de la communauté'], ['rencontre', 'Rencontres'], ['patrimoine', 'Mémoire et patrimoine']].map(([key, label]) => <button type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}</div>}
    <div aria-live="polite" aria-busy={state.loading}>{state.loading ? <p className="empty-state">Chargement des actualités…</p> : state.error ? <div className="empty-state"><h3>Les nouvelles se font attendre.</h3><p>Impossible de charger les actualités pour le moment.</p><button className="text-link" onClick={() => setRetry(retry + 1)}>Réessayer <Arrow /></button></div> : articles.length === 0 ? <div className="empty-state"><span className="empty-symbol" aria-hidden="true">✳</span><h3>{filter === 'toutes' ? 'Notre histoire continue de s’écrire.' : 'Aucune nouvelle dans cette catégorie.'}</h3><p>Les prochaines informations de la communauté seront partagées ici.</p></div> : <div className="news-grid">{articles.map((article) => <article className="news-card" key={article.id}><div className="news-meta"><span>{article.categorie_label}</span><time dateTime={article.date_publication}>{dateFormatter.format(new Date(article.date_publication))}</time></div><h3>{article.titre}</h3><p>{article.resume}</p><details><summary>Lire l’actualité <Arrow /></summary><div className="article-content">{article.contenu}</div></details></article>)}</div>}</div>
  </>;
}

function Field({ name, label, errors, required = false, full = false, multiline = false, ...props }) {
  const messages = (errors[name] || []).map((error) => typeof error === 'string' ? error : error.message);
  const Component = multiline ? 'textarea' : 'input';
  return <div className={`field ${full ? 'full' : ''}`}><label htmlFor={name}>{label}{required ? <span aria-hidden="true"> *</span> : <small> Facultatif</small>}</label><Component id={name} name={name} required={required} aria-invalid={messages.length ? 'true' : undefined} aria-describedby={messages.length ? `${name}-error` : undefined} {...props} />{messages.length > 0 && <p id={`${name}-error`} className="field-error">{messages.join(' ')}</p>}</div>;
}

function Registration() {
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [sending, setSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const statusRef = useRef(null);
  const inFlight = useRef(false);
  async function submit(event) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    payload.consentement = payload.consentement === 'on';
    inFlight.current = true;
    setSending(true);
    setErrors({});
    setStatus({ type: '', message: 'Enregistrement en cours…' });
    try {
      const response = await fetch('/api/inscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(25000) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(data.errors || {});
        setStatus({ type: 'error', message: data.message || (data.errors ? 'Certains champs sont à vérifier. Vos informations sont conservées dans le formulaire.' : 'Le service est indisponible. Veuillez réessayer dans quelques instants.') });
      } else {
        setComplete(true);
        setStatus({ type: 'success', message: data.message || 'Votre inscription a bien été enregistrée. Merci !' });
        form.reset();
      }
    } catch {
      setStatus({ type: 'error', message: 'La confirmation n’a pas pu être reçue. Si l’envoi a déjà abouti, une nouvelle tentative pourrait créer un doublon. Vérifiez auprès des responsables avant de renvoyer le formulaire.' });
    } finally {
      inFlight.current = false;
      setSending(false);
      setTimeout(() => statusRef.current?.focus(), 0);
    }
  }
  return <div className="container registration-layout section">
    <aside className="registration-intro"><p className="eyebrow">Faisons connaissance</p><h1 className="page-title">Vos racines.<br /><em>Votre place<br /> parmi nous.</em></h1><p className="lead">Participez au recensement des Andriandranando et contribuez à garder vivante notre mémoire commune.</p><div className="privacy-note"><span aria-hidden="true">⌑</span><div><h2>Vos informations restent privées</h2><p>Elles sont destinées aux responsables autorisés du recensement. Aucun annuaire public n’est publié sur ce site.</p></div></div><p className="optional-note">L’historique familial et les informations sur le tombeau ancestral sont facultatifs. Partagez uniquement ce que vous souhaitez confier.</p></aside>
    <div className="form-card">{complete ? <div className="success-card"><span aria-hidden="true">✓</span><h2>Misaotra !</h2><p ref={statusRef} tabIndex={-1} role="status">{status.message}</p><p>Votre contribution aide notre communauté à mieux se connaître.</p><a className="button" href="#accueil">Revenir à l’accueil <Arrow /></a><button className="text-link" type="button" onClick={() => { setComplete(false); setStatus({ type: '', message: '' }); }}>Inscrire une autre personne, avec son accord</button></div> : <>
      <div className="form-header"><h2>Formulaire de recensement</h2><p>Les champs marqués d’un <span aria-hidden="true">*</span> sont obligatoires.</p></div>
      <form onSubmit={submit} aria-busy={sending}>
        <fieldset disabled={sending}><legend><span>01</span> Votre identité</legend><div className="fields"><Field name="nom" label="Nom" errors={errors} required maxLength={100} autoComplete="family-name" placeholder="Votre nom de famille" /><Field name="prenom" label="Prénom" errors={errors} required maxLength={100} autoComplete="given-name" placeholder="Votre prénom" /><Field name="village" label="Village / vohitra d’origine" errors={errors} required full maxLength={150} placeholder="Le vohitra auquel votre famille est rattachée" /></div></fieldset>
        <fieldset disabled={sending}><legend><span>02</span> Vos coordonnées</legend><div className="fields"><Field name="contact" label="Téléphone / contact" errors={errors} required type="tel" maxLength={50} autoComplete="tel" placeholder="Ex. +261 34 00 000 00" /><Field name="email" label="Adresse e-mail" errors={errors} required type="email" maxLength={254} autoComplete="email" placeholder="vous@exemple.com" /><Field name="profession" label="Profession / activité" errors={errors} required full maxLength={150} autoComplete="organization-title" placeholder="Votre activité actuelle" /><Field name="adresse" label="Adresse actuelle" errors={errors} required full maxLength={300} autoComplete="street-address" placeholder="Quartier, ville et pays" /></div></fieldset>
        <fieldset disabled={sending}><legend><span>03</span> Votre mémoire familiale</legend><p className="fieldset-note">Cette partie est entièrement facultative.</p><div className="fields"><Field name="historique" label="Petit historique familial" errors={errors} full multiline rows={4} maxLength={5000} placeholder="Une histoire, une lignée, un souvenir à transmettre…" /><Field name="tombeau_lieu" label="Lieu du tombeau ancestral" errors={errors} full maxLength={300} placeholder="Village, lieu-dit ou localisation connue" /><Field name="tombeau_numero" label="Numéro du tombeau ancestral" errors={errors} full maxLength={50} placeholder="La référence, si vous la connaissez" /></div></fieldset>
        <div className="consent"><input id="consentement" name="consentement" type="checkbox" required disabled={sending} aria-invalid={errors.consentement ? 'true' : undefined} aria-describedby={errors.consentement ? 'consentement-error' : undefined} /><label htmlFor="consentement">J’accepte que ces informations soient enregistrées pour le recensement de la communauté et consultées par ses responsables autorisés. Je dispose de l’accord de la personne concernée si je l’inscris.</label></div>
        {errors.consentement && <p id="consentement-error" className="field-error">Votre accord est nécessaire.</p>}
        <button className="button submit-button" disabled={sending} type="submit">{sending ? 'Enregistrement en cours…' : 'Enregistrer mon inscription'}<Arrow /></button><p className={`form-status ${status.type}`} role="status" ref={statusRef} tabIndex={-1}>{status.message}</p>
      </form>
    </>}</div>
  </div>;
}

function Credits() {
  return <div className="container section page-content credits-page"><p className="eyebrow">Images et patrimoine</p><h1 className="page-title">Les images<br /><em>de notre espace commun.</em></h1><p className="page-intro">Ces photographies illustrent le contexte régional malgache. Elles ne représentent pas spécifiquement un vohitra ou un tombeau des Andriandranando.</p><div className="credits-grid">
    <figure><img src="/images/hautes-terres.jpg" alt="Ambohibe" width="1799" height="1199" loading="lazy" /><figcaption><h2>Ambohibe</h2><p>19xx · <a href={landscapeSource} target="_blank" rel="noreferrer">Wikimedia Commons <Arrow diagonal /></a></p><p>Licence <a href={photoLicense} target="_blank" rel="noreferrer">CC BY-SA 2.0</a>. Fichier original conservé, recadrage d’affichage sur l’accueil.</p></figcaption></figure>
    <figure><img src="/images/ambohimanga.jpg" alt="Rond point" width="1799" height="1199" loading="lazy" /><figcaption><h2>Rond point</h2><p>19xx · <a href={heritageSource} target="_blank" rel="noreferrer">Wikimedia Commons <Arrow diagonal /></a></p><p>Licence <a href={photoLicense} target="_blank" rel="noreferrer">CC BY-SA 2.0</a>. Fichier original conservé.</p></figcaption></figure>
    </div><p className="credits-note">Les photos propres à vos familles et à vos vohitra pourront remplacer ces illustrations avec l’accord de leurs auteurs.</p></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
