import { useEffect } from 'react'

const DEFAULT_KEYWORDS = [
  'Handiqo',
  'Handiqo App',
  'Handiqo Labour',
  'Handiqo Verified Kaamgaar',
  'Handiqo Service Marketplace',
  'mistri near me',
  'electrician near me',
  'plumber near me',
  'painter near me',
  'carpenter near me',
  'driver near me',
  'house help near me',
  'gardener mali near me',
  'local labour booking app',
  'daily wage worker India',
  'verified majdoor',
  'labour contact number',
  'ghar ke liye mistri',
  'zero commission labour app',
  'Bareilly mistri',
  'Delhi electrician',
  'UP skilled labour marketplace'
].join(', ')

export default function SEO({ title, description, keywords, image, canonicalUrl, schema }) {
  useEffect(() => {
    const siteTitle = 'Handiqo | Aapke Sheher Ke Verified Kaamgaar — Har Kaam Ka Sahi Haath'
    document.title = title ? `${title} | Handiqo` : siteTitle

    const updateMeta = (selector, attribute, value) => {
      if (!value) return
      let element = document.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        if (selector.includes('name=')) {
          const name = selector.match(/name="([^"]+)"/)?.[1]
          if (name) element.setAttribute('name', name)
        } else if (selector.includes('property=')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1]
          if (prop) element.setAttribute('property', prop)
        }
        document.head.appendChild(element)
      }
      element.setAttribute(attribute, value)
    }

    const defaultDesc = 'Handiqo — Apne sheher ke verified kaamgaar (Mistri, Electrician, Plumber, Painter, Driver, House Help) ek click mein dhundhein. Direct contact, 0% commission, 100% verified local workers.'
    const descText = description || defaultDesc
    const defaultImg = `${window.location.origin}/handiqo_final_dp_512.png`

    updateMeta('meta[name="description"]', 'content', descText)
    updateMeta('meta[name="keywords"]', 'content', keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS)
    updateMeta('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')

    // Open Graph / Facebook / WhatsApp
    updateMeta('meta[property="og:site_name"]', 'content', 'Handiqo')
    updateMeta('meta[property="og:title"]', 'content', title ? `${title} | Handiqo` : siteTitle)
    updateMeta('meta[property="og:description"]', 'content', descText)
    updateMeta('meta[property="og:image"]', 'content', image || defaultImg)
    updateMeta('meta[property="og:url"]', 'content', canonicalUrl || window.location.href)
    updateMeta('meta[property="og:type"]', 'content', 'website')
    updateMeta('meta[property="og:locale"]', 'content', 'hi_IN')

    // Twitter
    updateMeta('meta[name="twitter:card"]', 'content', 'summary_large_image')
    updateMeta('meta[name="twitter:title"]', 'content', title ? `${title} | Handiqo` : siteTitle)
    updateMeta('meta[name="twitter:description"]', 'content', descText)
    updateMeta('meta[name="twitter:image"]', 'content', image || defaultImg)

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl || window.location.href)

    // Dynamic JSON-LD Structured Data
    if (schema) {
      let script = document.querySelector('script[type="application/ld+json"]#dynamic-seo-schema')
      if (!script) {
        script = document.createElement('script')
        script.setAttribute('type', 'application/ld+json')
        script.setAttribute('id', 'dynamic-seo-schema')
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(schema)
    }
  }, [title, description, keywords, image, canonicalUrl, schema])

  return null
}
