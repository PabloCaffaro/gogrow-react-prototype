import { Head, Link, useForm } from '@inertiajs/react'
import { FormEvent, useState } from 'react'
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/actions/button'
import { Badge } from '@/components/ui/data-display/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/data-display/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/feedback/alert'
import { Checkbox } from '@/components/ui/forms/checkbox'
import { Input } from '@/components/ui/forms/input'
import { Label } from '@/components/ui/forms/label'
import { Separator } from '@/components/ui/layout/separator'
import styles from './login.module.css'

/** Cuentas preparadas para recorrer rápidamente los tres flujos de la demo. */
const demoAccounts = [
  { email: 'empleado@demo.com', label: 'Empleado' },
  { email: 'admin@demo.com', label: 'Administrador' },
  { email: 'proveedor@demo.com', label: 'Proveedor' },
]

/** Página de acceso conectada a Rails mediante el formulario de Inertia. */
export default function Login() {
  // Este estado es puramente visual: decide si la contraseña se muestra u oculta.
  const [showPassword, setShowPassword] = useState(false)

  // `useForm` centraliza valores, errores del servidor y estado de procesamiento.
  const { data, setData, post, processing, errors, clearErrors } = useForm({
    email: '',
    password: '',
    remember: false,
  })

  /** Completa el formulario sin autenticar todavía; el usuario confirma con submit. */
  const fillDemo = (email: string) => {
    setData({ email, password: 'demo1234', remember: false })
    clearErrors()
  }

  /** Evita la recarga tradicional y deja que Inertia envíe los datos a Rails. */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    post('/login', { preserveScroll: true })
  }

  return (
    <>
      <Head title="Iniciar sesión" />
      <main className={styles.page}>
        <div className={styles.layout}>
          {/* Esta introducción se oculta en pantallas pequeñas para priorizar el formulario. */}
          <section className={styles.introduction}>
            <Badge className={styles.demoBadge}>Prototipo UX · Acceso por rol</Badge>
            <h1 className={styles.heroTitle}>Un único acceso, tres experiencias de trabajo.</h1>
            <p className={styles.heroDescription}>
              El sistema identifica el perfil y presenta las herramientas adecuadas para empleados,
              administradores y proveedores.
            </p>

            <div className={styles.roleGrid}>
              {['Empleado', 'Administrador', 'Proveedor'].map((role) => (
                <div key={role} className={styles.roleCard}>
                  <ShieldCheck className={styles.roleIcon} aria-hidden="true" />
                  {role}
                </div>
              ))}
            </div>
          </section>

          <Card className={styles.loginCard}>
            <CardHeader className={styles.cardHeader}>
              <div className={styles.accessIconBox}>
                <LockKeyhole className={styles.accessIcon} aria-hidden="true" />
              </div>
              <div>
                <CardTitle className={styles.cardTitle}>Bienvenido</CardTitle>
                <CardDescription className={styles.cardDescription}>
                  Ingresá tus credenciales para acceder al portal.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form className={styles.form} onSubmit={submit} noValidate>
                {/* Rails devuelve los errores a través de las props de Inertia. */}
                {errors.email && (
                  <Alert variant="destructive" role="alert">
                    <AlertTitle>No pudimos iniciar sesión</AlertTitle>
                    <AlertDescription>{errors.email}</AlertDescription>
                  </Alert>
                )}

                <div className={styles.field}>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@empresa.com"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldHeader}>
                    <Label htmlFor="password">Contraseña</Label>
                    <Link href="/recuperar-contrasena" className={styles.forgotLink}>
                      ¿La olvidaste?
                    </Link>
                  </div>

                  <div className={styles.passwordField}>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={styles.passwordInput}
                      value={data.password}
                      onChange={(event) => setData('password', event.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className={styles.toggleIcon} aria-hidden="true" />
                      ) : (
                        <Eye className={styles.toggleIcon} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.rememberRow}>
                  <Checkbox
                    id="remember"
                    checked={data.remember}
                    onCheckedChange={(checked) => setData('remember', checked === true)}
                  />
                  <Label htmlFor="remember" className={styles.rememberLabel}>
                    Mantener mi sesión iniciada
                  </Label>
                </div>

                <Button type="submit" className={styles.fullWidth} size="lg" disabled={processing}>
                  {processing ? 'Validando acceso…' : 'Iniciar sesión'}
                </Button>
              </form>

              <div className={styles.demoDivider}>
                <Separator className={styles.dividerLine} />
                <span className={styles.dividerLabel}>Cuentas de prueba</span>
                <Separator className={styles.dividerLine} />
              </div>

              <div className={styles.demoButtons}>
                {demoAccounts.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemo(account.email)}
                  >
                    {account.label}
                  </Button>
                ))}
              </div>
            </CardContent>

            <CardFooter className={styles.cardFooter}>
              <span>Las cuentas de prueba se validan en Rails y PostgreSQL.</span>
              <Link href="/ejemplos/formularios" className={styles.examplesLink}>
                Ver laboratorio de formularios
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  )
}
