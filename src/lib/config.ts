/** Starting score before penalties */
export const SCORE_START = 1000

/** Points lost per wrong guess (tune here) */
export const WRONG_GUESS_PENALTY = 75

/** Points lost per hint purchase */
export const HINT_COST = 100

/** Earliest selectable archive date (UTC calendar day) */
export const ARCHIVE_MIN_DATE = '2026-01-01'

/** localStorage key prefix for card cache metadata */
export const CACHE_META_KEY = 'riftboundle:cache-meta'

/** localStorage key for cached card list JSON (bump when Card shape changes) */
export const CACHE_CARDS_KEY = 'riftboundle:cards-json-v4'

/** Keyword index from GET /index/keywords (Riftcodex) */
export const KEYWORD_INDEX_KEY = 'riftboundle:keyword-index-json'
export const KEYWORD_INDEX_META_KEY = 'riftboundle:keyword-index-meta'
