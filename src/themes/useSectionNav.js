import { useEffect, useRef, useState } from 'react'

// Section tabs shared by every menu theme: tracks the section in view and
// scrolls to a section on click. Scoped to the menu's own document so it also
// works inside the admin preview iframe, where following a #hash link would
// resolve against the admin page's URL.
export function useSectionNav(sections, sectionSelector) {
  const rootRef = useRef(null)
  const [active, setActive] = useState(sections[0]?.id)
  const key = sections.map((s) => s.id).join()

  useEffect(() => {
    const root = rootRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { root: root.ownerDocument, rootMargin: '-30% 0px -60% 0px' }
    )
    root.querySelectorAll(sectionSelector).forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [key, sectionSelector])

  function goToSection(e, id) {
    e.preventDefault()
    rootRef.current.ownerDocument.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return { rootRef, active, goToSection }
}

// "Capuccino" -> "Capuccino." (product title style of the "tea" theme)
export function withPeriod(name) {
  return /[\p{L}\p{N}]$/u.test(name) ? `${name}.` : name
}
