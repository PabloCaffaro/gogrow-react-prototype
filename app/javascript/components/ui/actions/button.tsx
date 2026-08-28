import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import styles from "./button.module.css"

/**
 * `cva` traduce propiedades semánticas como `variant="destructive"` a las
 * clases locales del CSS Module. React decide la variante y el CSS conserva
 * todos los detalles visuales.
 */
const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      default: styles.default,
      outline: styles.outline,
      secondary: styles.secondary,
      ghost: styles.ghost,
      destructive: styles.destructive,
      link: styles.link,
    },
    size: {
      default: styles.sizeDefault,
      xs: styles.sizeExtraSmall,
      sm: styles.sizeSmall,
      lg: styles.sizeLarge,
      icon: styles.sizeIcon,
      "icon-xs": styles.sizeIconExtraSmall,
      "icon-sm": styles.sizeIconSmall,
      "icon-lg": styles.sizeIconLarge,
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

/**
 * Botón base del sistema de diseño.
 *
 * `ButtonPrimitive.Props` aporta las propiedades y el comportamiento accesible
 * de Base UI. `VariantProps` agrega a TypeScript las variantes declaradas arriba.
 */
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// También exportamos las variantes para dar apariencia de botón a un enlace.
export { Button, buttonVariants }
