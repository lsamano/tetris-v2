# Puyo Puyo Tetris II
This is a Javascript Tetris game.

# Setup
Open `index.html` in your browser to start playing immediately.

# Controls
1st Player
| Key | Action |
| --- | ------ |
| 🅰 (A) | Move Left |
| 🅳 (D) | Move Right |
| 🆂 (S) | Fast Drop |
| 🆆 (W) | Hard Drop |
| 1️⃣ (1) | Rotate Left |
| 2️⃣ (2) | Rotate Right |
| 3️⃣ (3)| Hold |

2nd Player
| Key | Action |
| --- | ------ |
| ← (Left) | Move Left |
| → (Right) | Move Right |
| ↓ (Down) | Fast Drop |
| ↑ (Up) | Hard Drop |
| 🅺 (K) | Rotate Left |
| 🅻 (L) | Rotate Right |
| [﹒] (Period) | Hold |

Note: You can only hold once per turn.

# Scoring
| # of Lines Cleared | Points |
| --- | --- |
| 1 line | 100 pts |
| 2 lines | 300 pts |
| 3 lines | 500 pts |
| 4 lines (Tetris) | 800 pts |

# Current Features
- Colors reflect actual Tetris pieces used in-game
- Able to clear lines and earn points towards your score
- Able to lose the game if it reaches the top
- Keeps score
- Increases speed based on score
- Able to hold pieces
- Able to Hard Drop (immediately drops piece into place)
- Ghost piece (shows where your piece will land if hard-dropped)
- Accurate point system for 1-4 line clears and drops
- Piece forecast shows next three pieces
- Guaranteed one of each letter at the beginning of a session, just like the real game
- 2-player mode

# Upcoming Features
- Improved graphics
- Websocket mode

# Known Bugs
- You sometimes cannot rotate the I piece when it is furthest to the right

Bootstrapped using this tutorial: https://youtu.be/H2aW5V46khA
Edits, improvements, and additional features added by me.
