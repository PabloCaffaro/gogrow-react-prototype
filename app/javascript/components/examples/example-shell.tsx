import { Link } from '@inertiajs/react'
import { ArrowLeft, BookOpen } from 'lucide-react'
import type { ReactNode } from 'react'

import styles from './example-shell.module.css'

type ExampleShellProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

/**
 * Estructura compartida por las páginas didácticas.
 * Mantener el encabezado aquí evita repetir navegación y estilos en cada ejemplo.
 */
function ExampleShell({ eyebrow, title, description, children }: ExampleShellProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.brand}>
            <BookOpen aria-hidden="true" />
            React en práctica
          </Link>

          <nav aria-label="Ejemplos disponibles">
            <Link href="/ejemplos/formularios" className={styles.navLink}>
              Formularios
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft aria-hidden="true" />
          Volver al inicio
        </Link>

        <section className={styles.introduction}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          <p className={styles.description}>{description}</p>
        </section>

        {children}
      </main>
    </div>
  )
}

export { ExampleShell }
