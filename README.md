# Catan Dice

A mobile-first dice roller for Catan. It keeps a live tally of how often each number has come up, and shows a full breakdown when the game ends.

- Tap the dice or the Roll button (Space/Enter on a keyboard)
- The live tally shows each number's count, with a tick for how often it *should* have come up
- Optional players, in turn order, to track whose roll it is
- Undo the last roll
- End the game to see stats: each number against its odds, the hottest and coldest numbers, 7s, the longest run without a 7, doubles, and per-player numbers
- The game is saved on the device, and the screen stays awake while you play
- Installable to the home screen and works offline once it's been loaded

## How the dice work

Each roll is two independent dice, so totals follow the same odds as real dice: there are 6 ways to make a 7 and only 1 way to make a 2 or a 12. Rolls have no memory of earlier rolls, so streaks and droughts happen just like at the table. The logic is `rollDie()` in [`src/game.ts`](src/game.ts).

- **Random source.** Each die uses the browser's secure random generator (`crypto.getRandomValues`), not `Math.random`.
- **No bias toward any face.** The generator returns a number from 0 to 255, and the face is that number's remainder after dividing by 6. 256 doesn't divide evenly by 6: 252 numbers split into 42 per face, and the 4 left over (252–255) would land on faces 1–4. Faces 1–4 would then have 43 chances each against 42 for faces 5 and 6, about 16.8% vs 16.4%. To avoid this, the code throws away 252–255 and draws again. Only 0–251 are used, which gives exactly 42 per face, so each face is exactly 1 in 6. A redraw happens about 1.6% of the time.
- **Decided on tap.** The result is picked the moment you roll. The faces shown during the tumble animation are only for show.

### Test results

`npm run simulate` rolls the real `rollDie()` a million times and compares the totals with the odds for fair dice:

| Total | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Rolled | 2.79% | 5.58% | 8.36% | 11.18% | 13.80% | 16.64% | 13.87% | 11.12% | 8.31% | 5.59% | 2.77% |
| Fair dice | 2.78% | 5.56% | 8.33% | 11.11% | 13.89% | 16.67% | 13.89% | 11.11% | 8.33% | 5.56% | 2.78% |

Each face came up between 16.61% and 16.71% of the time, against 16.67% for a fair die. The small differences are normal random variation and change slightly on every run. Over a single game of 60–80 rolls the counts can stray much further from the odds. The live tally and the end-of-game stats show that gap.

## Develop

```sh
npm install
npm run dev      # served on your LAN too, so you can open it on your phone
npm run build    # outputs static files to dist/
npm run simulate # checks the dice against fair-dice odds (1,000,000 rolls)
```

`dist/` is a static site and can be deployed to Netlify, GitHub Pages, and similar hosts.
