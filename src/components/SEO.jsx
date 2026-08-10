import { useEffect } from 'react'

export default function SEO({ title, description, keywords, image, canonicalUrl, schema }) {
  useEffect(() => {
    const siteTitle = 'Handiqo | Aapke Sheher Ke Verified Kaamgaar'
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

    const defaultDesc = 'Handiqo — Apne sheher ke verified kaamgaar (Mistri, Electrician, Plumber, Painter, Driver, aadi) dhundhein. Direct contact, zero extra charges, fast local hiring.'
    const descText = description || defaultDesc
    const defaultImg = `${window.location.origin}/handiqo_final_app_icon_512.png`

    updateMeta('meta[name="description"]', 'content', descText)
    updateMeta('meta[name="keywords"]', 'content', keywords || 'Handiqo, handiqo app, mistri, electrician, plumber, painter, driver, local labour, skilled workers, daily wage worker India, hiring labourers')

    // Open Graph / Facebook
    updateMeta('meta[property="og:title"]', 'content', title ? `${title} | Handiqo` : siteTitle)
    updateMeta('meta[property="og:description"]', 'content', descText)
    updateMeta('meta[property="og:image"]', 'content', image || defaultImg)
    updateMeta('meta[property="og:url"]', 'content', canonicalUrl || window.location.href)
    updateMeta('meta[property="og:type"]', 'content', 'website')

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

    // JSON-LD Structured Data
    if (schema) {
      let script = document.querySelector('script[type="application/ld+json"]#seo-schema')
      if (!script) {
        script = document.createElement('script')
        script.setAttribute('type', 'application/ld+json')
        script.setAttribute('id', 'seo-schema')
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(schema)
    }
  }, [title, description, keywords, image, canonicalUrl, schema])

  return null
}
