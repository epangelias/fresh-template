# Paracelsus - A Deno Fresh Template

## Install Paracelsus

```bash
deno install -Agrf https://raw.githubusercontent.com/epangelias/paracelsus/refs/heads/main/tasks/paracelsus.ts
```

## Create a new project

```bash
paracelsus my-project
```

## TODO

- CSS Theme
- Refactor and simplify, make bloated features more componential, easy to add/remove, plugins
- Allow data and other events to be sent through sse
- SEO
- Login delay, rate limit security
- Ensure that any functions called in route that are are async but not with await catch errors so no server crash
- Fix push notifications on chrome
- Fix sse errors logged to server
- Make Banners better
- Add screenshots, to manifest and to meta tags
