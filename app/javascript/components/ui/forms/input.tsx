import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"
import styles from "./input.module.css"

/**
 * Campo de texto base.
 * Acepta las mismas propiedades de un `<input>` nativo, por lo que puede usarse
 * como texto, correo, contraseña, número o archivo sin crear componentes nuevos.
 */
function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(styles.input, className)}
      {...props}
    />
  )
}

export { Input }
