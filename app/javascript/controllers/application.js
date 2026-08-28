import { Application } from "@hotwired/stimulus"

// Instancia compartida donde se registran los controladores Stimulus tradicionales.
const application = Application.start()

// Mantener `debug` desactivado evita ruido de Stimulus durante el trabajo en React.
application.debug = false
window.Stimulus   = application

export { application }
