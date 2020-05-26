![image of the game in action](images/img.png)
# Tetris v2
This is a Tetris game made using JavaScript, Canvas, Express, and WebSockets.

# Setup
In the project directory, run the following,
```
npm install
npm start
```
Now go to `localhost:9000` in your browser and press space to start playing immediately. *If you are playing with others, make sure you are using* **http**, *as the app will not be able to use WebSockets using https.*

# Goal of the Game
Drop pieces to the bottom of the screen. When you fill up an entire row, they will clear and earn you points. If you fill up to the top, it's game over!
Survive as long as possible and earn a high score!

When playing with an opponent, survive longer than they do and sabotage their efforts by sending them "garbage" lines.

# Controls
| Key |  ← (Left) | → (Right) | ↓ (Down) | ↑ (Up) | 🆀 (Q) | 🆆 (W) | 🅳 (D) | [   ] (Space) |
| --- | ------ |------ |------ |------ |------ |------ |------ |------ |
| **Action** | Move Left | Move Right | Soft Drop | Hard Drop | Rotate Left | Rotate Right | Hold |  Pause |

**Soft Drop:** Manually moves the piece downward.

**Hard Drop:** Sets the piece immediately where the ghost piece is.

**Hold:** Saves the current piece for later use. If you have a piece saved already, it will swap your current piece with the one being held. *Note: You can only hold once per turn.*

# Scoring
| # of Lines Cleared | Points | Garbage Lines Sent |
| --- | --- | --- |
| 1 line | 100 pts | 0 lines |
| 2 lines | 300 pts | 1 line |
| 3 lines | 500 pts |  2 lines |
| 4 lines (Tetris) | 800 pts |  4 lines |

*Note: Both Hard and Soft Drop earns you 1pt per "step" downward.*

# Current Features
- Base Game
  - Able to clear lines and earn points
  - If the pieces stacked reaches the top, it is Game Over (game will end)
  - Game keeps score based on how many lines were cleared
  - Increases speed based on score
- Advanced Features
  - Able to hold pieces
  - Able to Hard Drop (immediately drops piece into place)
  - Ghost piece (shows where your piece will land if hard-dropped)
  - Piece Forecast shows next five pieces
  - See incoming attacks with the Garbage Indicator
  - Player is able to wall kick and floor kick for ease of play
  - Player is able to do advanced rotations for high-level play
- Multiplayer
  - Play with other people via WebSockets for competitive play
  - Attack your opponents with "garbage lines" when you clear lines
  - Nullify incoming garbage lines to survive the longest
- Quality of Life Updates
  - Able to start the game at will
  - Player will not rotate on key repeat for precision movements
  - Added improved graphics of Tetris pieces

# Faithful Recreation
This app is made to reflect the real game as much as possible. It includes...
- Colors that reflect actual Tetris pieces used in-game
- The "Random Generator" algorithm, to ensure player can play forever
  - Guaranteed one of each letter every set of 7 pieces
- An accurate point system for 1-4 line clears and hard/soft drops
- The SRS algorithm for advanced spins and wall/floor kicks
  - This makes it possible to perform advanced Tetris techniques

# Latest Updates
- Player can see incoming attacks via indicator
- Player can see opponents' indicators as well
- Improved graphics on pieces

# Upcoming Features
- String combos, including using them for blocking
- Perfect clear, including points and attack
- Have host control room so players start, pause, and end at the same time
  - Allow player to either play alone or in a room
  - Add chat feature for ease of communication
- More graphic improvements (line clear animation)
- Ability to play using https

# Known Bugs/Issues
- None

# Sources
Project started using this tutorial: https://youtu.be/H2aW5V46khA
All improvements, and additional features added by me.
