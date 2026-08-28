import * as React from 'react'

import { cn } from '@/lib/utils'
import styles from './select.module.css'

/**
 * Select nativo con la apariencia del sistema de diseño.
 *
 * Mantener el elemento HTML real conserva automáticamente navegación por
 * teclado, lectores de pantalla y comportamiento consistente en formularios.
 */
function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(styles.select, className)}
      {...props}
    >
      {children}
    </select>
  )
}

export { Select }
