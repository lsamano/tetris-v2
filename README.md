# Puyo Puyo Tetris II
This is a Javascript Tetris game.

# Setup
In the project directory, run `npm install` and `npm start`. Go to `localhost:9000` in your browser to start playing immediately.

# Controls
| Key | Action |
| --- | ------ |
| ← (Left) | Move Left |
| → (Right) | Move Right |
| ↓ (Down) | Fast Drop |
| ↑ (Up) | Hard Drop |
| 🆀 (Q) | Rotate Left |
| 🆆 (W) | Rotate Right |
| 🅳 (D) | Hold |
| [   ] (Space) | Pause |

Note: You can only hold once per turn.

# Scoring
| # of Lines Cleared | Points | Garbage Lines Sent |
| --- | --- | --- |
| 1 line | 100 pts | 0 lines |
| 2 lines | 300 pts | 1 line |
| 3 lines | 500 pts |  2 lines |
| 4 lines (Tetris) | 800 pts |  4 lines |

# Current Features
- Colors reflect actual Tetris pieces used in-game
- Able to clear lines and earn points
- Able to lose the game if it reaches the top
- Keeps score
- Increases speed based on score
- Able to hold pieces
- Able to Hard Drop (immediately drops piece into place)
- Ghost piece (shows where your piece will land if hard-dropped)
- Accurate point system for 1-4 line clears and drops
- Piece forecast shows next three pieces
- Guaranteed one of each letter at the beginning of a session, just like the real game
- Ability to play with other people via WebSockets
- Ability to attack opponent player (called garbage lines)
- Ability to nullify garbage lines

# Upcoming Features
- Ability to start the game at will
- Better game over mechanics
- Improved graphics (from Puyo Puyo Tetris)
- Advanced spins

# Known Bugs/Issues
- Stacked garbage lines >4 all come with the same hole

Bootstrapped using this tutorial: https://youtu.be/H2aW5V46khA
Edits, improvements, and additional features added by me.
