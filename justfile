default:
    @just --list

# Render the language versions from src/ into html/
build:
    uv run --quiet src/build.py

# Fail if the committed html/ is out of date with src/
check-generated: build
    git diff --exit-code -- html
    test -z "$(git status --porcelain -- html)"

# Fail if security.txt expires within 30 days
check-security-txt:
    python3 src/check_security_txt.py

# Build the container image locally
image:
    docker build -t charemma-web-security:dev .

# Render and serve on http://localhost:<port>
dev port="8090": build
    python3 -m http.server {{port}} --directory html
