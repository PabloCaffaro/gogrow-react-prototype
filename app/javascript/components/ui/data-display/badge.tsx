import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import styles from "./badge.module.css"

/** Las variantes permiten reutilizar la etiqueta para diferentes significados. */
const badgeVariants = cva(styles.badge, {
  variants: {
    variant: {
      default: styles.default,
      secondary: styles.secondary,
      destructive: styles.destructive,
      outline: styles.outline,
      ghost: styles.ghost,
      link: styles.link,
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

/**
 * Etiqueta breve para estados o categorías.
 * `useRender` permite que Base UI conserve la semántica aunque se renderice
 * otro elemento mediante la propiedad `render`.
 */
function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
