# syntax=docker/dockerfile:1

ARG RUBY_VERSION=3.3.12
ARG NODE_VERSION=22

# Node se copia en la imagen de Ruby para soportar React, Inertia y shadcn/ui.
FROM docker.io/library/node:${NODE_VERSION}-bookworm-slim AS node

FROM docker.io/library/ruby:${RUBY_VERSION}-slim AS base

WORKDIR /rails

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx && \
    ln -s ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 libvips && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV BUNDLE_PATH="/usr/local/bundle"

# Entorno local: incluye herramientas para compilar gemas y paquetes JavaScript.
FROM base AS development

ENV RAILS_ENV="development" \
    BUNDLE_DEPLOYMENT="0" \
    BUNDLE_WITHOUT=""

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY package.json package-lock.json ./
RUN npm ci && gem install foreman

COPY . .

EXPOSE 3000
CMD ["./bin/rails", "server", "-b", "0.0.0.0"]

# Etapa temporal para construir la imagen de producción.
FROM base AS build

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_WITHOUT="development"

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY Gemfile Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN chmod +x bin/* && \
    bundle exec bootsnap precompile app/ lib/
RUN SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile

# Imagen final de producción.
FROM base AS production

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_WITHOUT="development"

COPY --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --from=build /rails /rails

RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    chown -R rails:rails log storage tmp && \
    chmod -R u+rwX log storage tmp

USER 1000:1000
ENTRYPOINT ["/rails/bin/docker-entrypoint"]
EXPOSE 3000
CMD ["./bin/rails", "server"]
