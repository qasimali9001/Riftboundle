🧱 Phase 0 – Project Setup
✅ Goals

Establish a clean, simple frontend app with room for iteration.

Tasks
Choose stack (recommended):
Frontend: React + Vite (fast iteration)
State: Zustand or simple React state
Styling: Tailwind (fast UI building)

Setup project structure:

/src
  /components
  /features/game
  /features/hints
  /features/archive
  /lib/api
  /lib/utils
🃏 Phase 1 – Card Data Layer
✅ Goals

Fetch and prepare card data from https://riftcodex.com/

Tasks
1. API Exploration (Cursor task)
Discover:
Endpoint for all cards
Card schema (name, cost, text, keywords, legality, etc.)
2. Filtering Logic
Only include:
✅ Legal cards
Exclude:
❌ Tokens
❌ Non-playable entities
3. Normalization

Create a clean internal card model:

type Card = {
  id: string
  name: string
  manaCost: string
  energyCost: string
  text: string
  keywords: string[]
  color: string[]
  image?: string
}
4. Caching Strategy
Cache full card list:
In memory OR localStorage
Refresh:
Once per day (UTC)
📅 Phase 2 – Daily Card Selection
✅ Goals

Ensure all players get the same card daily.

Tasks
1. Seeded RNG
Seed = current UTC date (YYYY-MM-DD)

Deterministic selection:

index = hash(date) % cardList.length
2. Archive Support
Allow:
Selecting previous dates
Use same seed logic for past days
🎮 Phase 3 – Core Game Loop
✅ Goals

Replicate Spellify-style guessing with BoxOfficeGame scoring

🎯 Game State
type GameState = {
  targetCard: Card
  guesses: string[]
  score: number // starts at 1000
  hintsUsed: number
  revealed: {
    color: boolean
    keywords: boolean
    letters: string[]
  }
  isComplete: boolean
}
⌨️ Guess Input
Tasks
Input box with:
Autocomplete dropdown
Fuzzy search:
"hand" → matches "Sneaky Deck Hand"
Prevent:
Invalid guesses
✅ Guess Handling
Logic
If correct:
End game
Reveal full card + art
If incorrect:
Deduct points:
Define initial penalty (e.g. -50 or -100)
Store guess
🧩 Phase 4 – Masking System
✅ Goals

Hide all meaningful info initially.

🔤 Text Masking
Replace all letters with _
Preserve:
Spaces
Formatting

Example:

"Deal 3 damage to target unit"
→
"____ _ ______ __ ______ ____"
🟩 Keyword Handling
Keywords shown as:
Green boxes (visible)
Text hidden
🔢 Visible Info

At start, show:

✅ Mana cost
✅ Energy cost
❌ Name
❌ Text (masked)
❌ Color
❌ Keywords (only boxes)
💡 Phase 5 – Hint System (Player-Driven)
✅ Goals

Player buys hints using score (inspired by BoxOfficeGame)

💰 Hint Cost
Each hint = -100 points
🔍 Hint Types
1. Reveal Color
Show full color identity
2. Reveal Keywords
Replace green boxes with actual keyword text
3. Reveal Letter
Player inputs a letter
Reveal:
All occurrences in:
Card name
Card text
🧠 Logic Notes
Prevent duplicate letter purchases
Track revealed letters in state
🧮 Phase 6 – Scoring System
✅ Goals

Simple, transparent scoring

🧾 Rules
Start: 1000 points
Deduct:
Wrong guess → (configurable, e.g. -50/-100)
Each hint → -100
🏁 End Game Summary

Display:

Final score
Number of guesses
Hints used
Breakdown

Example:

Score: 850
Guesses: 3
Hints used: 1
🖼️ Phase 7 – End State Reveal
✅ Goals

Reward completion

On Win:
Reveal:
Full card name
Full text
Color
Keywords
✅ Card art
💾 Phase 8 – Persistence (Local Only)
✅ Goals

No accounts, simple storage

LocalStorage

Store per date:

{
  date: "2026-04-03",
  score: 900,
  guesses: 2,
  hintsUsed: 1
}
📊 Local Scoreboard

Display:

Aggregated stats:
2 days at 1000
4 days between 950–750
📚 Phase 9 – Archive Mode
✅ Goals

Replay past days

Features
Date picker or list
Load past game:
Either:
Replay fresh
OR show completed result
🎨 Phase 10 – UI/UX
Layout
Main Panel
Mana/Energy cost (visible)
Masked name
Masked text
Controls
Guess input + dropdown
Hint buttons:
Reveal color
Reveal keywords
Reveal letter
Feedback Area
Guess history
Score display
⚙️ Phase 11 – Polish
Nice Touches
Animations for reveals
Shake on wrong guess
Smooth letter reveal
Daily reset countdown (UTC)
🚀 MVP Definition (Lock Scope)
MUST HAVE
Daily seeded card
Guess input with autocomplete
Masked text system
Hint system (3 types)
Score system (1000 base)
LocalStorage persistence
End-of-game reveal
NICE TO HAVE
Archive mode
Score distribution stats
Animations
🧠 Implementation Notes for Cursor
Prioritize:
Data layer
Daily selection
Masking system
Game loop
Hints
Persistence
Keep everything:
Stateless where possible
Deterministic via date seed
🧩 Final Thought

This is essentially:

Spellify (guessing UX)
BoxOfficeGame (score economy)
Your Riftbound twist (text masking + hint purchases)