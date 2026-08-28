import * as React from 'react'

import { cn } from '@/lib/utils'
import styles from './radio-group.module.css'

/** Agrupa opciones relacionadas usando la semántica nativa de `fieldset`. */
function RadioGroup({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return <fieldset className={cn(styles.group, className)} {...props} />
}

/** El legend funciona como etiqueta accesible para todo el grupo. */
function RadioGroupLegend({ className, ...props }: React.ComponentProps<'legend'>) {
  return <legend className={cn(styles.legend, className)} {...props} />
}

type RadioOptionProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  label: string
  description?: string
}

/**
 * Opción individual del grupo.
 * Envolver el input con un label aumenta el área clickeable sin JavaScript extra.
 */
function RadioOption({
  className,
  label,
  description,
  ...props
}: RadioOptionProps) {
  return (
    <label className={cn(styles.option, className)}>
      <input type="radio" className={styles.input} {...props} />
      <span className={styles.control} aria-hidden="true" />
      <span className={styles.copy}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
    </label>
  )
}

export { RadioGroup, RadioGroupLegend, RadioOption }
