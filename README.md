# Mahmoud Mohamed — Portfolio

Personal portfolio site. Front-end development, Unreal Engine 5 Blueprint
systems, AI model evaluation & data annotation, and workflow automation.

**Live areas covered:**
- Services overview
- Selected work (MissionCoach, UE5 Cover System on Fab, earnings tracker,
  n8n Arabic node reference, RTL fitness calendar)
- About & background
- Skills
- Contact form

## Stack

Plain HTML, CSS (custom properties, BEM naming), and TypeScript — no
framework. `js/script.js` is the compiled, committed output, so the site
runs directly in a browser with no build step required. `src/script.ts`
is the source of truth if you want to make changes.

## Structure

```
index.html
css/styles.css
js/script.js        ← compiled output, loaded by index.html
src/script.ts        ← TypeScript source
tsconfig.json
package.json
assets/img/
```

## Development

```bash
npm install
npm run build     # compiles src/script.ts → js/script.js
npm run watch      # recompiles on change
```

## License

All rights reserved — see [LICENSE.md](./LICENSE.md). This repo is public
for portfolio review only; it isn't licensed for reuse.

## Contact

- GitHub: [github.com/ehoda9](https://github.com/ehoda9)
- LinkedIn: [mahmoud-mohamed3](https://www.linkedin.com/in/mahmoud-mohamed3/)
