import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"
import styles from "./separator.module.css"

/**
 * Separador visual horizontal o vertical.
 * Base UI conserva la semántica accesible mientras CSS adapta sus dimensiones.
 */
function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(styles.separator, className)}
      {...props}
    />
  )
}

export { Separator }
