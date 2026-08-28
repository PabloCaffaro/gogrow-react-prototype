import { Head, Link, useForm } from '@inertiajs/react'
import { FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/actions/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/feedback/alert'
import { Input } from '@/components/ui/forms/input'
import { Label } from '@/components/ui/forms/label'
import styles from './forgot_password.module.css'

/** Rails envía `sent_to` después de aceptar una solicitud de recuperación. */
type Props = {
  sent_to?: string | null
}

/** Ejemplo de formulario que alterna entre captura de datos y confirmación. */
export default function ForgotPassword({ sent_to: sentTo }: Props) {
  // Inertia conserva juntos el valor del campo, sus errores y el estado de envío.
  const { data, setData, post, processing, errors } = useForm({ email: '' })

  /** Envía el correo a Rails sin recargar la página completa. */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    post('/recuperar-contrasena')
  }

  return (
    <>
      <Head title="Recuperar contraseña" />
      <main className={styles.page}>
        <Card className={styles.recoveryCard}>
          <CardHeader>
            <div className={styles.mailIconBox}>
              <Mail className={styles.mailIcon} aria-hidden="true" />
            </div>
            <CardTitle className={styles.cardTitle}>Recuperar contraseña</CardTitle>
            <CardDescription>
              Te enviaremos instrucciones para volver a ingresar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* La misma página muestra dos estados para evitar duplicar estructura. */}
            {sentTo ? (
              <div className={styles.successContent}>
                <Alert className={styles.successAlert}>
                  <CheckCircle2 className={styles.statusIcon} aria-hidden="true" />
                  <AlertTitle>Solicitud recibida</AlertTitle>
                  <AlertDescription>
                    Si existe una cuenta asociada a {sentTo}, recibirá un enlace de recuperación.
                  </AlertDescription>
                </Alert>

                <Link
                  href="/login"
                  className={buttonVariants({ className: styles.fullWidth })}
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <form className={styles.form} onSubmit={submit} noValidate>
                {errors.email && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.email}</AlertDescription>
                  </Alert>
                )}

                <div className={styles.field}>
                  <Label htmlFor="recovery-email">Correo electrónico</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@empresa.com"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className={styles.fullWidth}
                  size="lg"
                  disabled={processing}
                >
                  {processing ? 'Enviando…' : 'Enviar instrucciones'}
                </Button>

                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: 'ghost',
                    className: styles.fullWidth,
                  })}
                >
                  <ArrowLeft className={styles.backIcon} aria-hidden="true" />
                  Volver
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
