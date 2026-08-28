import * as React from "react"

import { cn } from "@/lib/utils"
import styles from "./label.module.css"

/**
 * Etiqueta para controles de formulario.
 * La propiedad `htmlFor` debe coincidir con el `id` del campo para que hacer
 * clic en el texto enfoque el control y los lectores de pantalla los relacionen.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(styles.label, className)}
      {...props}
    />
  )
}

export { Label }
