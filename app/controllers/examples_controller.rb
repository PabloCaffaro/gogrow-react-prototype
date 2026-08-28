class ExamplesController < ApplicationController
  # Esta página es pública: su objetivo es enseñar componentes, no requerir sesión.
  def forms
    render inertia: "examples/forms"
  end
end
