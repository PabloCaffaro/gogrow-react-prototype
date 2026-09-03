/** Historial de pantallas locales usando la API pública de Inertia, sin HTTP. */
import { router, usePage } from '@inertiajs/react'

type Route<Section extends string> = { section: Section; detail?: string | number; tab?: string }

/**
 * Sólo la ubicación visual se guarda en el historial; el carrito sigue en React.
 * router.push registra Atrás/Adelante sin llamar a Rails. El layout persistente
 * de pages/dashboard/show.tsx conserva el dashboard cuando Inertia restaura una
 * entrada anterior, evitando perder los pedidos o los formularios en memoria.
 */
export function usePrototypeNavigation<Section extends string>(initialSection: Section) {
  const { props } = usePage<{ prototypeNavigation?: Route<Section> }>()
  const route = props.prototypeNavigation ?? { section: initialSection }

  const navigate = (next: Route<Section>) => {
    if (route.section === next.section && route.detail === next.detail && route.tab === next.tab) return
    // Inertia ignora el fragmento al comparar URLs y reemplaza esa entrada.
    // Parámetros de consulta distintos sí crean un paso real de Atrás/Adelante.
    // Rails ya sirve esta misma ruta; no se crea ningún endpoint nuevo.
    const url = new URL(window.location.href)
    url.hash = ''
    url.searchParams.set('vista', next.section)
    if (next.detail !== undefined) url.searchParams.set('detalle', String(next.detail))
    else url.searchParams.delete('detalle')
    if (next.tab !== undefined) url.searchParams.set('pestana', next.tab)
    else url.searchParams.delete('pestana')
    router.push({
      url: url.pathname + url.search,
      props: current => ({ ...current, prototypeNavigation: next }),
      preserveState: true,
      preserveScroll: false,
    })
  }

  return { route, navigate }
}
