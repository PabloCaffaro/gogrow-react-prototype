import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import styles from "./alert.module.css"

/** Relaciona el propósito de la alerta con su presentación visual. */
const alertVariants = cva(styles.alert, {
  variants: {
    variant: {
      default: styles.default,
      destructive: styles.destructive,
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

/** Contenedor accesible que anuncia mensajes importantes al usuario. */
function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

/** Título breve que permite comprender rápidamente el mensaje. */
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(styles.title, className)}
      {...props}
    />
  )
}

/** Explicación o instrucción que acompaña al título de la alerta. */
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(styles.description, className)}
      {...props}
    />
  )
}

/** Zona opcional para una acción, por ejemplo “Reintentar” o “Cerrar”. */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(styles.action, className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
