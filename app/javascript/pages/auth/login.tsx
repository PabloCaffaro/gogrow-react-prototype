/**
 * Acceso único al prototipo.
 * Rails autentica la cuenta; React sólo controla la presentación, los campos y
 * los atajos que completan credenciales ficticias para cada rol.
 */
import { Head, Link, useForm } from '@inertiajs/react'
import { FormEvent, useState } from 'react'
import { Check, Eye, EyeOff, UtensilsCrossed } from 'lucide-react'

import { GoogleMark } from '@/components/branding/google-mark'
import { Button } from '@/components/ui/actions/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/feedback/alert'
import { Checkbox } from '@/components/ui/forms/checkbox'
import { Label } from '@/components/ui/forms/label'
import { Separator } from '@/components/ui/layout/separator'
import styles from './login.module.css'

/** Cuentas locales que permiten recorrer los tres perfiles sin escribir credenciales. */
const demoAccounts = [
  { email: 'empleado@demo.com', label: 'Empleado' },
  { email: 'admin@demo.com', label: 'Administrador' },
  { email: 'proveedor@demo.com', label: 'Proveedor' },
]

/** Beneficios de producto usados únicamente en el panel editorial de escritorio. */
const productBenefits = [
  'Menús semanales en un solo lugar',
  'Beneficio y pedidos siempre visibles',
  'Pagos organizados por proveedor',
]

/** Formulario responsive conectado al endpoint de sesión existente. */
export default function Login() {
  // Estados exclusivamente visuales del acceso.
  const [showPassword, setShowPassword] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)

  // `data` es la única fuente de verdad del formulario para que los valores
  // visibles sean exactamente los mismos que Inertia envía al servidor.
  const { data, setData, post, processing, errors, clearErrors } = useForm({
    email: '',
    password: '',
    remember: false,
  })

  /** Completa y resalta una cuenta demo, pero espera el submit explícito del usuario. */
  const fillDemo = (email: string) => {
    setSelectedDemo(email)
    clearErrors()
    setData({
      email,
      password: 'demo1234',
      remember: data.remember,
    })
  }

  /** Delega validación y redirección al controlador Rails mediante Inertia. */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    post('/login', { preserveScroll: true })
  }

  return (
    <>
      <Head title="Iniciar sesión" />
      <main className={styles.page}>
        <div className={styles.layout}>
          <section className={styles.introduction} aria-labelledby="product-title">
            <div className={styles.brand}>
              <span className={styles.brandMark}><UtensilsCrossed aria-hidden="true" /></span>
              <span>GoGrow Meals</span>
            </div>

            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Tu beneficio, más simple</p>
              <h1 id="product-title">Organizá tus viandas en un solo lugar.</h1>
              <p>
                Pedí tus viandas, administrá tu beneficio y consultá tus pagos desde una experiencia
                simple y centralizada.
              </p>
            </div>

            <ul className={styles.benefitList}>
              {productBenefits.map((benefit) => (
                <li key={benefit}><Check aria-hidden="true" />{benefit}</li>
              ))}
            </ul>

            <p className={styles.introductionFooter}>Alimentación que acompaña tu jornada.</p>
          </section>

          <section className={styles.accessSection}>
            <div className={styles.mobileBrand}>
              <span className={styles.brandMark}><UtensilsCrossed aria-hidden="true" /></span>
              <span>GoGrow Meals</span>
            </div>

            <Card className={styles.loginCard}>
              <CardHeader className={styles.cardHeader}>
                <p className={styles.cardEyebrow}>Acceso a tu cuenta</p>
                <CardTitle className={styles.cardTitle}>Bienvenido a GoGrow</CardTitle>
                <CardDescription className={styles.cardDescription}>
                  Ingresá tus datos para continuar.
                </CardDescription>
              </CardHeader>

              <CardContent className={styles.cardContent}>
                <button
                  type="button"
                  className={styles.googleButton}
                  aria-disabled="true"
                >
                  <GoogleMark />
                  Continuar con Google
                </button>

                <div className={styles.loginDivider}><Separator /><span>o ingresá con tu email</span><Separator /></div>

                <form className={styles.form} onSubmit={submit} noValidate>
                  {errors.email && (
                    <Alert variant="destructive" role="alert">
                      <AlertTitle>No pudimos iniciar sesión</AlertTitle>
                      <AlertDescription>{errors.email}</AlertDescription>
                    </Alert>
                  )}

                  <div className={styles.field}>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <input
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
                      <input
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
                      onCheckedChange={(checked) => {
                        const remember = checked === true
                        setData('remember', remember)
                      }}
                    />
                    <Label htmlFor="remember" className={styles.rememberLabel}>
                      Mantener mi sesión iniciada
                    </Label>
                  </div>

                  <Button type="submit" className={styles.fullWidth} size="lg" disabled={processing}>
                    {processing ? 'Ingresando…' : 'Iniciar sesión'}
                  </Button>
                </form>

                <div className={styles.demoDivider}>
                  <Separator className={styles.dividerLine} />
                  <span className={styles.dividerLabel}>Acceso rápido de demostración</span>
                  <Separator className={styles.dividerLine} />
                </div>

                <p className={styles.demoHelp}>Elegí un perfil para completar sus credenciales.</p>
                <div className={styles.demoButtons}>
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      className={styles.demoButton}
                      data-selected={selectedDemo === account.email}
                      aria-pressed={selectedDemo === account.email}
                      onClick={() => fillDemo(account.email)}
                    >
                      {account.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <p className={styles.privacyCopy}>Acceso seguro para colaboradores y proveedores de GoGrow.</p>
          </section>
        </div>
      </main>
    </>
  )
}
