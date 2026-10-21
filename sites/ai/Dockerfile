FROM nginx:alpine

# Version identifier of this build, see specs/013-site-images.md.
# CI passes the short commit hash, just image passes <branch>@<hash>[-dirty].
ARG SITE_VERSION=unknown

COPY html/ /usr/share/nginx/html/
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Stamp the identifier into any placeholders and expose it at /version.
# Keep in sync with the stamp recipe in the justfile.
RUN commit="${SITE_VERSION##*@}" && commit="${commit%-dirty}" \
    && find /usr/share/nginx/html -name '*.html' -exec sed -i \
        -e "s|__SITE_VERSION__|$SITE_VERSION|g" \
        -e "s|__SITE_COMMIT__|$commit|g" {} + \
    && printf '%s\n' "$SITE_VERSION" > /usr/share/nginx/html/version

EXPOSE 80
