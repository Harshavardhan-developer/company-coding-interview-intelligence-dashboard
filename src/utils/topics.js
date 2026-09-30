// Inferred topics. The dataset has NO tag column, so labels are derived from problem titles only.
// Rules are ordered from most to least specific: the first match becomes the primary topic,
// every match is kept so a question can count toward several topics.
const RULES = [
  ['Bit Manipulation', /\bbits?\b|bitwise|\bxor\b|hamming|single number|power of (two|four)|number of 1|counting bits|gray code|sum of two integers|complement of|binary representation|\bmask|reverse bits|missing number|binary gap|ones and zeroes/],
  ['Design / Data Structure', /^design |^implement |\blru\b|\blfu\b|iterator|\bcache\b|min stack|max stack|getrandom|hit counter|time based key|snapshot array|logger rate|autocomplete|file system|browser history|data stream|\bmy calendar|tic-tac-toe|twitter|underground system|circular (queue|deque)/],
  ['Linked List', /linked list|list node|\blru cache|reorder list|merge (two|k) sorted lists|intersection of two linked|add two numbers|remove nth node|middle of the|odd even|swap nodes|rotate list|partition list|copy list with random|multilevel doubly|sort list|reverse nodes|delete node in a|remove duplicates from sorted list|cycle/],
  ['Trie', /\btrie\b|prefix tree|word search ii|add and search word|replace words|magic dictionary|stream of characters|search suggestions/],
  ['Union Find', /union|disjoint|redundant connection|accounts merge|number of provinces|equality equations|smallest string with swaps|connected components|number of islands ii/],
  ['Binary Search Tree', /binary search tree|\bbst\b|inorder successor|sorted (array|list) to|trim a binary|two sum iv/],
  ['Trees', /\btrees?\b|ancestor|inorder|preorder|postorder|level order|binary tree|\bdiameter|symmetric|subtree|path sum|serialize and deserialize|univalue|\bleaf\b|maximum depth|minimum depth|\broot\b/],
  ['Heap / Priority Queue', /\bheap\b|priority|kth (largest|smallest)|top k|k closest|median from|merge k sorted|task scheduler|reorganize string|meeting rooms ii|last stone|\bipo\b|connect sticks|smallest range|sliding window median|ugly number ii/],
  ['Stack', /\bstack\b|parenthes|daily temperatures|next greater|largest rectangle|reverse polish|basic calculator|decode string|remove k digits|asteroid|simplify path|remove duplicate letters|trapping rain|stock span|backspace string|brackets/],
  ['Queue', /queue|deque|recent calls|moving average|sliding window maximum|dota2|rotting oranges/],
  ['Backtracking', /permutations?|combinations?|subsets|n-queens|sudoku|word search|letter combinations|generate parentheses|palindrome partitioning|restore ip|beautiful arrangement|expression add operators|equal sum subsets|matchsticks|combination sum/],
  ['Dynamic Programming', /dynamic|climbing stairs|house robber|coin change|longest (increasing|common|palindromic|arithmetic)|edit distance|knapsack|unique paths|minimum path sum|decode ways|word break|partition equal subset|maximum (product )?subarray|jump game|best time to buy and sell stock (with|iii|iv)|palindromic substrings|regular expression|wildcard|interleaving|distinct subsequences|triangle|perfect squares|target sum|burst balloons|stone game|maximal square|fibonacci|tribonacci|number of ways|egg drop|paint (house|fence)|min cost|minimum cost|ways to|cost climbing|domino|2 keys|dp\b/],
  ['Binary Search', /binary search|rotated sorted|search insert|first bad version|sqrt|find peak|median of two sorted|find minimum in rotated|koko|capacity to ship|time based|search a 2d matrix|split array largest|first and last position|guess number|closest elements|mountain array|kth missing|minimum (speed|time) to|smallest (divisor|letter)/],
  ['Sliding Window', /sliding window|longest substring|minimum window|permutation in string|max consecutive ones|fruit into baskets|longest repeating character|find all anagrams|minimum size subarray|subarrays? with|contains duplicate ii|maximum average subarray|substring with concatenation|max consecutive/],
  ['Two Pointers', /two pointers?|container with most water|3sum|three sum|4sum|four sum|two sum ii|trapping rain|remove duplicates from sorted|move zeroes|valid palindrome|reverse (string|words|vowels)|sort colors|squares of a sorted|merge sorted array|is subsequence|boats to save|remove element|next permutation/],
  ['BFS', /level order|shortest path|word ladder|rotting oranges|walls and gates|knight|open the lock|bus routes|right side view|zigzag|snakes and ladders|shortest bridge|as far from land|nearest|minimum genetic/],
  ['DFS', /island|flood fill|path sum|surrounded regions|pacific atlantic|clone graph|provinces|max area|word search|all paths|course schedule|nested list|depth/],
  ['Graphs', /graph|shortest path|topological|course schedule|network delay|islands?|connected components|clone graph|word ladder|alien dictionary|cheapest flights|itinerary|redundant connection|bipartite|minimum height trees|flood fill|surrounded regions|pacific atlantic|evaluate division|critical connections|cities|provinces|maze|reachable|dijkstra/],
  ['Intervals', /interval|meeting rooms|non-overlapping|arrows|employee free|calendar|car pooling|video stitching|disjoint/],
  ['Matrix', /matrix|\bgrid\b|spiral|rotate image|zeroes|game of life|2d|islands?|sudoku|\bboard\b|\bmaze\b/],
  ['Greedy', /greedy|jump game|gas station|candy|assign cookies|task scheduler|partition labels|lemonade|boats|meeting rooms|maximum units|remove k digits|wiggle|queue reconstruction|minimum number of arrows/],
  ['Sorting', /\bsort(ed|ing)?\b|largest number|h-index|meeting rooms|merge intervals|insert interval|top k|k closest|relative sort|wiggle/],
  ['Hashing', /two sum|hash|group anagrams|duplicate|frequen|isomorphic|word pattern|ransom note|\bunique\b|majority element|intersection of two arrays|happy number|top k frequent|subarray sum equals|contiguous array|longest consecutive|\bpairs?\b|\bmap\b|\bset\b|anagram/],
  ['Strings', /string|palindrom|anagram|substring|subsequence|parenthes|characters?|\bwords?\b|letters?|prefix|suffix|roman|atoi|vowels?|\btext\b|\bcase\b|decode|encode|compress|brackets|\bcaesar|\bdigit/],
  ['Arrays', /array|subarray|two sum|3sum|three sum|4sum|kadane|prefix sum|rotate|trapping rain|container with most water|best time to buy|product of array|majority element|move zeroes|remove element|remove duplicates|pivot index|missing number|first missing positive|contains duplicate|next permutation|\bnums?\b|elements?|sum of|maximum subarray|pairs|equal|intersection of two/],
  ['Math', /\bmath|prime|\bpower\b|sqrt|factorial|gcd|palindrome number|integer|digits?|roman|fizz|happy|ugly|trailing zeroes|pow\(|excel sheet|add digits|multiply|divide|fraction|perfect|reverse integer|count primes|angle|area|average|\bsteps\b/],
  ['Recursion', /recurs|tower of hanoi|k-th symbol|flatten|generate|fibonacci|pow\(|permutations|subsets/],
]

export const TOPIC_NAMES = [...RULES.map(([name]) => name), 'Other']

/** Returns { topics: string[], primary: string } inferred from the title only. */
export function inferTopics(title) {
  const text = title.toLowerCase()
  const topics = RULES.filter(([, rule]) => rule.test(text)).map(([name]) => name)
  return topics.length ? { topics, primary: topics[0] } : { topics: ['Other'], primary: 'Other' }
}

// Topics the product spotlights.
export const FOCUS_TOPICS = ['Bit Manipulation', 'Linked List', 'Strings', 'Arrays', 'Hashing', 'Trees', 'Graphs', 'Dynamic Programming']
