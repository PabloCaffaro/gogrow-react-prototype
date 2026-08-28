// Descubre y registra todos los archivos `*_controller.js` disponibles en importmap.
import { application } from "controllers/application"
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"
eagerLoadControllersFrom("controllers", application)
