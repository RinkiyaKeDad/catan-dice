# Catan Dice

A mobile-first dice roller for Catan. It keeps a live tally of how often each number has come up, and shows a full breakdown when the game ends.

- Tap the dice or the Roll button (Space/Enter on a keyboard)
- The live tally shows each number's count, with a tick for how often it *should* have come up
- Optional players, in turn order, to track whose roll it is
- Undo the last roll
- End the game to see stats: each number against its odds, the hottest and coldest numbers, 7s, the longest run without a 7, doubles, and per-player numbers
- The game is saved on the device, and the screen stays awake while you play
- Installable to the home screen and works offline once it's been loaded

## Develop

```sh
npm install
npm run dev      # served on your LAN too, so you can open it on your phone
npm run build    # outputs static files to dist/
```

`dist/` is a static site and can be deployed to Netlify, GitHub Pages, and similar hosts.
