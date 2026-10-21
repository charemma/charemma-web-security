# Glossary

Terms used in this project's rules, specs and conversation. Each entry states what the term means here and what it does not mean. Where another file defines a term normatively, the entry names that file and the definition there wins.

## souvlaki-case

- Meaning: synonym for kebab-case; words of lowercase letters and digits joined by dashes, e.g. `ipv6-scan`.
- Not: snake_case or camelCase; also not the File Registry naming convention, which additionally allows underscores.

## IMPLEMENT THE SPEC

- Meaning: the user instruction that creates the files a named spec specifies (an article, a scene, code) from that spec and the rules in their Instructions file; for articles the workflow is defined in `article-writing.md`.
- Not: a revision of an existing file, and not an instruction to change the spec itself.

## REVISE THE ARTICLE

- Meaning: the user instruction that changes the text of a named article within its spec, on the branch that created it; defined in `article-writing.md`.
- Not: creation of an article, translation into another language, and not a change to the article's spec, scene, registry row or code.

## site

- Meaning: one website delivered under its own domain (e.g. security.charemma.de), built and deployed as its own container image; defined in the Sites section of `AGENTS.md`.
- Not: a single page of a website, and not the domain name or DNS record alone.

## site folder

- Meaning: the folder `sites/<site>/` that holds every file of one site; defined in the Sites section of `AGENTS.md`.
- Not: the shared project root, and not the generated output folder `html/` inside a site folder.

## site registry

- Meaning: the file `sites/<site>/.ai/registry.md` holding a site's intent and the registry rows of every file in its site folder; defined in the Sites section of `AGENTS.md`.
- Not: the File Registry of `AGENTS.md`, which registers the files outside site folders and the site registries themselves.
