import { Head } from '@inertiajs/react'
import { CheckCircle2, Code2, RotateCcw, Send } from 'lucide-react'
import { FormEvent, useState } from 'react'

import { ExampleShell } from '@/components/examples/example-shell'
import { Button } from '@/components/ui/actions/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/feedback/alert'
import { Checkbox } from '@/components/ui/forms/checkbox'
import { Input } from '@/components/ui/forms/input'
import { Label } from '@/components/ui/forms/label'
import {
  RadioGroup,
  RadioGroupLegend,
  RadioOption,
} from '@/components/ui/forms/radio-group'
import { Select } from '@/components/ui/forms/select'
import { Textarea } from '@/components/ui/forms/textarea'
import styles from './forms.module.css'

type FormValues = {
  name: string
  email: string
  role: string
  biography: string
  contactMethod: 'email' | 'phone'
  newsletter: boolean
  terms: boolean
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = {
  name: '',
  email: '',
  role: '',
  biography: '',
  contactMethod: 'email',
  newsletter: false,
  terms: false,
}

/**
 * Laboratorio autocontenido para practicar los elementos más comunes de un formulario.
 * El ejemplo no envía información al servidor: se concentra en estado y validación de React.
 */
export default function FormsExample() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  /**
   * Una función genérica actualiza cualquier campo sin repetir un manejador por input.
   * TypeScript relaciona cada nombre de campo con el tipo de valor que le corresponde.
   */
  const updateField = <Key extends keyof FormValues>(
    field: Key,
    value: FormValues[Key],
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitted(false)
  }

  /** Devuelve solamente los errores actuales; un objeto vacío significa que todo es válido. */
  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}

    if (!values.name.trim()) nextErrors.name = 'Ingresá tu nombre.'
    if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      nextErrors.email = 'Ingresá un correo válido.'
    }
    if (!values.role) nextErrors.role = 'Elegí un perfil.'
    if (!values.terms) nextErrors.terms = 'Debés aceptar las condiciones para continuar.'

    return nextErrors
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setSubmitted(Object.keys(nextErrors).length === 0)
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setSubmitted(false)
  }

  return (
    <>
      <Head title="Ejemplo de formularios" />
      <ExampleShell
        eyebrow="Laboratorio 01"
        title="Formularios controlados en React"
        description="Un ejemplo completo y comentado con campos de texto, selección, opciones, validación y mensajes accesibles."
      >
        <div className={styles.layout}>
          <Card className={styles.formCard}>
            <CardHeader>
              <CardTitle>Creá tu perfil de práctica</CardTitle>
              <CardDescription>
                Probá los distintos controles. Los datos permanecen en este navegador.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className={styles.form} onSubmit={submit} noValidate>
                {submitted && (
                  <Alert className={styles.successAlert}>
                    <CheckCircle2 aria-hidden="true" />
                    <AlertTitle>Formulario válido</AlertTitle>
                    <AlertDescription>
                      React validó los datos localmente. En un proyecto real, ahora se enviarían al servidor.
                    </AlertDescription>
                  </Alert>
                )}

                <div className={styles.twoColumns}>
                  <div className={styles.field}>
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={values.name}
                      onChange={(event) => updateField('name', event.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      placeholder="Ada Lovelace"
                    />
                    {errors.name && <p id="name-error" className={styles.error}>{errors.name}</p>}
                  </div>

                  <div className={styles.field}>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={values.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      placeholder="ada@ejemplo.com"
                    />
                    {errors.email && <p id="email-error" className={styles.error}>{errors.email}</p>}
                  </div>
                </div>

                <div className={styles.field}>
                  <Label htmlFor="role">Perfil</Label>
                  <Select
                    id="role"
                    value={values.role}
                    onChange={(event) => updateField('role', event.target.value)}
                    aria-invalid={Boolean(errors.role)}
                    aria-describedby={errors.role ? 'role-error' : undefined}
                  >
                    <option value="">Seleccioná una opción</option>
                    <option value="frontend">Desarrollo frontend</option>
                    <option value="backend">Desarrollo backend</option>
                    <option value="design">Diseño UX/UI</option>
                  </Select>
                  {errors.role && <p id="role-error" className={styles.error}>{errors.role}</p>}
                </div>

                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <Label htmlFor="biography">Presentación</Label>
                    <span>{values.biography.length}/240</span>
                  </div>
                  <Textarea
                    id="biography"
                    value={values.biography}
                    onChange={(event) => updateField('biography', event.target.value)}
                    maxLength={240}
                    placeholder="Contanos brevemente qué querés aprender..."
                  />
                </div>

                <RadioGroup>
                  <RadioGroupLegend>Método de contacto preferido</RadioGroupLegend>
                  <div className={styles.radioOptions}>
                    <RadioOption
                      name="contactMethod"
                      value="email"
                      checked={values.contactMethod === 'email'}
                      onChange={() => updateField('contactMethod', 'email')}
                      label="Correo"
                      description="Ideal para mensajes detallados."
                    />
                    <RadioOption
                      name="contactMethod"
                      value="phone"
                      checked={values.contactMethod === 'phone'}
                      onChange={() => updateField('contactMethod', 'phone')}
                      label="Teléfono"
                      description="Útil para respuestas rápidas."
                    />
                  </div>
                </RadioGroup>

                <div className={styles.checkboxes}>
                  <div className={styles.checkboxRow}>
                    <Checkbox
                      id="newsletter"
                      checked={values.newsletter}
                      onCheckedChange={(checked) => updateField('newsletter', checked === true)}
                    />
                    <Label htmlFor="newsletter" className={styles.checkboxLabel}>
                      Quiero recibir novedades y nuevos ejemplos.
                    </Label>
                  </div>

                  <div className={styles.checkboxRow}>
                    <Checkbox
                      id="terms"
                      checked={values.terms}
                      onCheckedChange={(checked) => updateField('terms', checked === true)}
                      aria-invalid={Boolean(errors.terms)}
                      aria-describedby={errors.terms ? 'terms-error' : undefined}
                    />
                    <div>
                      <Label htmlFor="terms" className={styles.checkboxLabel}>
                        Acepto las condiciones del ejemplo.
                      </Label>
                      {errors.terms && <p id="terms-error" className={styles.error}>{errors.terms}</p>}
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <Button type="submit">
                    <Send aria-hidden="true" />
                    Validar formulario
                  </Button>
                  <Button type="button" variant="outline" onClick={reset}>
                    <RotateCcw aria-hidden="true" />
                    Reiniciar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <aside className={styles.lesson} aria-label="Conceptos del ejemplo">
            <div className={styles.lessonHeading}>
              <Code2 aria-hidden="true" />
              <h2>Qué enseña este ejemplo</h2>
            </div>
            <ol>
              <li><strong>Estado controlado:</strong> React guarda el valor de cada campo.</li>
              <li><strong>Evento submit:</strong> el formulario se procesa sin recargar la página.</li>
              <li><strong>Validación:</strong> los errores se calculan antes de enviar los datos.</li>
              <li><strong>Accesibilidad:</strong> labels, fieldset y atributos ARIA conectan cada mensaje.</li>
              <li><strong>Componentes reutilizables:</strong> cada control conserva una API similar al HTML nativo.</li>
            </ol>

            <div className={styles.codeExample}>
              <p>Patrón de un campo controlado</p>
              <pre><code>{`<Input
  value={values.name}
  onChange={(event) =>
    updateField('name', event.target.value)
  }
/>`}</code></pre>
            </div>
          </aside>
        </div>
      </ExampleShell>
    </>
  )
}
