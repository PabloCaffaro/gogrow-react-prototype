import { Controller } from "@hotwired/stimulus"

// Controlador mínimo generado por Rails; sirve como referencia de la conexión Stimulus.
export default class extends Controller {
  connect() {
    this.element.textContent = "Hello World!"
  }
}
