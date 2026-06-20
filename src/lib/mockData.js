/**
 * lib/mockData.js
 * Synthetic CRM data for 6 Malaysian financial advisory clients.
 *
 * Each client has 4–5 realistic "memories" (CRM notes, call transcripts,
 * meeting summaries) spread across 2022–2026.
 *
 * The key design principle: memories are phrased naturally, WITHOUT using
 * "semantic search" keywords. This proves that embedding-based retrieval
 * surfaces relevant context even when exact keywords don't match.
 *
 * Examples:
 *   Query  "retirement concerns"
 *   → retrieves Wei Ming's "stop working by 55" and "savings enough for the future"
 *     WITHOUT those memories containing the word "retirement"
 */

export const CLIENTS = [
  {
    id: '005511',
    name: '005511/LimWeiMing',
    age: 48,
    gender: 'Male',
    riskProfile: 'Moderate',
    goals: ['Early career exit', 'Passive income stream', 'Capital preservation'],
    servicesNeeded: ['Retirement planning', 'Investment portfolio review', 'Annuity products'],
    behaviourTags: ['Long-horizon thinker', 'Cautious about market downturns', 'Income-focused'],
    summary: 'Senior executive looking to leave corporate life before 55. Main concern is whether his savings can sustain 25–30 years post-employment.',
  },
  {
    id: '005512',
    name: '005512/SarahTan',
    age: 35,
    gender: 'Female',
    riskProfile: 'Aggressive',
    goals: ['Wealth accumulation', 'Business expansion', 'Long-term growth'],
    servicesNeeded: ['Equity portfolio', 'Business financial planning', 'Tax optimisation'],
    behaviourTags: ['Risk tolerant', 'Tech-savvy', 'Entrepreneurial mindset'],
    summary: 'Tech entrepreneur with high risk appetite. Recently received a significant liquidity event and wants to deploy capital strategically.',
  },
  {
    id: '005513',
    name: '005513/AhmadRazif',
    age: 52,
    gender: 'Male',
    riskProfile: 'Conservative',
    goals: ["Children's education", 'Capital preservation', 'Halal investing'],
    servicesNeeded: ['Education fund', 'Sukuk/fixed income', 'Critical illness coverage'],
    behaviourTags: ['Capital-preservation-first', 'Prefers Shariah-compliant products', 'Family-oriented'],
    summary: 'Government servant approaching retirement. Primary concern is securing his three children\'s university education and protecting against medical costs.',
  },
  {
    id: '005514',
    name: '005514/JenniferKoh',
    age: 41,
    gender: 'Female',
    riskProfile: 'Moderate-Aggressive',
    goals: ['Financial independence', 'Estate planning', 'Business income management'],
    servicesNeeded: ['Balanced portfolio', 'Unit trusts', "Children's trust fund"],
    behaviourTags: ['Resilient', 'Detail-oriented', 'Dual income (employment + business)'],
    summary: 'Recently divorced single mother rebuilding her financial life. Runs an e-commerce business alongside her day job. Wants growth but cannot afford large capital losses.',
  },
  {
    id: '005515',
    name: '005515/DavidNg',
    age: 29,
    gender: 'Male',
    riskProfile: 'Aggressive',
    goals: ['First property purchase', 'Long-term wealth building', 'Financial independence'],
    servicesNeeded: ['ETF/index fund portfolio', 'Debt management advice', 'Property financing'],
    behaviourTags: ['FIRE enthusiast', 'High savings rate', 'Self-directed learner'],
    summary: 'Young banking professional with strong savings discipline. Inspired by the FIRE movement and wants a passive, low-maintenance investment approach.',
  },
  {
    id: '005516',
    name: '005516/RosnahYusof',
    age: 55,
    gender: 'Female',
    riskProfile: 'Conservative',
    goals: ['Monthly income generation', 'Simple financial management', 'Estate distribution'],
    servicesNeeded: ['Fixed income products', 'Tabung Haji', 'Hibah/estate planning'],
    behaviourTags: ['Newly independent (widowed)', 'Risk-averse', 'Needs hand-holding'],
    summary: 'Widow managing inherited joint assets for the first time. Wants guaranteed income products she can easily understand, with no exposure to market volatility.',
  },
];

export const MEMORIES = [
  // ── Client 1: 005511/LimWeiMing ─────────────────────────────────────────────────
  {
    clientId: '005511',
    clientName: '005511/LimWeiMing',
    sourceType: 'crm_note',
    sourceRef: 'crm_2023_06',
    content:
      'Wei Ming expressed a strong desire to stop his corporate career before reaching the age of 55. He has been working for 25 years and wants to travel with his wife while he is still in good health. He mentioned feeling "tired of the rat race" and asked if this is financially realistic.',
    metadata: { date: '2023-06-14', tags: ['career exit', 'lifestyle goal'] },
  },
  {
    clientId: '005511',
    clientName: '005511/LimWeiMing',
    sourceType: 'transcript',
    sourceRef: 'call_2024_02',
    content:
      "Client said: 'I keep looking at my EPF statement and I'm not sure if it's enough. What if I live until 85 or 90? My savings have to last maybe 30 years after I stop working. That really worries me.' He asked us to run a projection for him.",
    metadata: { date: '2024-02-08', tags: ['EPF', 'longevity risk', 'projection needed'] },
  },
  {
    clientId: '005511',
    clientName: '005511/LimWeiMing',
    sourceType: 'meeting_summary',
    sourceRef: 'meeting_2024_09',
    content:
      'Discussed dividend-paying REITs and blue-chip stocks as vehicles for building a recurring income stream. Wei Ming was receptive and asked how much capital he would need to generate RM 5,000 per month passively. He wants a portfolio that "works for him while he sleeps".',
    metadata: { date: '2024-09-20', tags: ['passive income', 'REITs', 'dividend investing'] },
  },
  {
    clientId: '005511',
    clientName: '005511/LimWeiMing',
    sourceType: 'crm_note',
    sourceRef: 'crm_2025_01',
    content:
      "Wei Ming inquired about annuity and fixed payout products. He explicitly said he does NOT want to actively manage his money later in life and prefers a guaranteed monthly disbursement. He is not comfortable with products that require him to 'keep watching the market'.",
    metadata: { date: '2025-01-15', tags: ['annuity', 'guaranteed income', 'low maintenance'] },
  },
  {
    clientId: '005511',
    clientName: '005511/LimWeiMing',
    sourceType: 'transcript',
    sourceRef: 'call_2025_06',
    content:
      "Client expressed anxiety about market volatility: 'What if there's a crash right when I'm about to stop working? Will I have enough time to recover? I don't want to be forced to go back to work.' He asked about defensive allocation strategies for the years leading up to his exit.",
    metadata: { date: '2025-06-03', tags: ['market risk', 'sequence of returns', 'defensive portfolio'] },
  },

  // ── Client 2: Sarah Tan ────────────────────────────────────────────────────
  {
    clientId: '005512',
    clientName: '005512/SarahTan',
    sourceType: 'crm_note',
    sourceRef: 'crm_2023_03',
    content:
      'Sarah is a co-founder of a SaaS startup. She is comfortable with high risk and views volatility as opportunity. She has a 10–15 year investment horizon and wants to grow her wealth aggressively. She specifically said she does not want conservative products.',
    metadata: { date: '2023-03-22', tags: ['high risk', 'tech founder', 'long horizon'] },
  },
  {
    clientId: '005512',
    clientName: '005512/SarahTan',
    sourceType: 'transcript',
    sourceRef: 'call_2023_11',
    content:
      "Sarah mentioned: 'I'm already in US tech stocks and a bit of crypto. I know it's volatile but I believe in the long game. Can you help me diversify without losing the growth angle?' She also asked about structured products with equity exposure.",
    metadata: { date: '2023-11-10', tags: ['equities', 'crypto', 'growth investing', 'diversification'] },
  },
  {
    clientId: '005512',
    clientName: '005512/SarahTan',
    sourceType: 'meeting_summary',
    sourceRef: 'meeting_2024_05',
    content:
      'Discussed global equity ETFs as a core holding. Sarah also flagged that her company may complete a Series A round in the next 12 months, which could significantly change her liquidity position. Advised to keep a portion in liquid instruments until funding is confirmed.',
    metadata: { date: '2024-05-17', tags: ['ETF', 'startup funding', 'liquidity planning'] },
  },
  {
    clientId: '005512',
    clientName: '005512/SarahTan',
    sourceType: 'crm_note',
    sourceRef: 'crm_2025_02',
    content:
      "Sarah sold a 20% stake in her startup for a substantial sum. She wants to deploy the capital into a diversified equity portfolio and is asking about tax-efficient structures. She said: 'I'm thinking 10-year minimum hold. I want this money to compound hard.'",
    metadata: { date: '2025-02-28', tags: ['windfall', 'compounding', 'tax efficiency', 'deployment'] },
  },

  // ── Client 3: Ahmad Razif ──────────────────────────────────────────────────
  {
    clientId: '005513',
    clientName: '005513/AhmadRazif',
    sourceType: 'crm_note',
    sourceRef: 'crm_2022_08',
    content:
      "Ahmad's top priority is his three children's university education. He wants capital-guaranteed or low-risk instruments specifically earmarked for their tuition. He said: 'If something happens to me, I need to know they can still study.' He also asked about takaful coverage.",
    metadata: { date: '2022-08-11', tags: ['education fund', 'capital protection', 'takaful'] },
  },
  {
    clientId: '005513',
    clientName: '005513/AhmadRazif',
    sourceType: 'transcript',
    sourceRef: 'call_2023_04',
    content:
      "Ahmad raised concerns about rising hospitalisation costs: 'My parents spent so much on medical bills in their final years. I'm worried the same will happen to me. Is there insurance that covers critical illness and hospital stays during old age?' He asked for product recommendations.",
    metadata: { date: '2023-04-05', tags: ['healthcare', 'critical illness', 'medical insurance'] },
  },
  {
    clientId: '005513',
    clientName: '005513/AhmadRazif',
    sourceType: 'meeting_summary',
    sourceRef: 'meeting_2023_12',
    content:
      "Reviewed a laddered fixed deposit strategy and discussed Shariah-compliant sukuk bonds. Ahmad confirmed he only wants halal financial products — 'no conventional interest-bearing instruments at all'. He is comfortable sacrificing some returns for Shariah compliance.",
    metadata: { date: '2023-12-14', tags: ['sukuk', 'Shariah', 'fixed income', 'halal investing'] },
  },
  {
    clientId: '005513',
    clientName: '005513/AhmadRazif',
    sourceType: 'crm_note',
    sourceRef: 'crm_2024_07',
    content:
      "Ahmad's eldest son will begin university in less than 2 years. The urgency for the education fund has become critical. He asked to review existing savings and identify any shortfall. He also mentioned his second child will follow 3 years later, so planning needs a 6-year window.",
    metadata: { date: '2024-07-09', tags: ['education fund', 'urgent', 'timeline'] },
  },
  {
    clientId: '005513',
    clientName: '005513/AhmadRazif',
    sourceType: 'transcript',
    sourceRef: 'call_2025_03',
    content:
      "Ahmad is considering leaving government service at 55 under the early exit scheme. He asked: 'What pension benefits will I lose if I leave early? And how do I supplement my income after that? I don't want to work part-time but I need steady cash flow.'",
    metadata: { date: '2025-03-20', tags: ['pension', 'early retirement', 'income gap', 'government service'] },
  },

  // ── Client 4: Jennifer Koh ─────────────────────────────────────────────────
  {
    clientId: '005514',
    clientName: '005514/JenniferKoh',
    sourceType: 'crm_note',
    sourceRef: 'crm_2023_01',
    content:
      "Jennifer finalised her divorce last month and received a settlement payout. She wants to rebuild her financial life from scratch as an independent woman. She said: 'I never really managed the money before — my ex handled everything. I need to learn but also need a plan now.'",
    metadata: { date: '2023-01-18', tags: ['life change', 'financial independence', 'new start'] },
  },
  {
    clientId: '005514',
    clientName: '005514/JenniferKoh',
    sourceType: 'transcript',
    sourceRef: 'call_2023_09',
    content:
      "Jennifer asked about wills and insurance nomination: 'I'm the sole provider for my two kids now. If anything happens to me, I need to know they're protected financially. Can we set up something that ensures their welfare even without me?' She is particularly interested in trust structures.",
    metadata: { date: '2023-09-25', tags: ['estate planning', 'will', 'trust', 'single parent'] },
  },
  {
    clientId: '005514',
    clientName: '005514/JenniferKoh',
    sourceType: 'meeting_summary',
    sourceRef: 'meeting_2024_03',
    content:
      'Proposed a 60/40 balanced portfolio split between equities and bonds. Jennifer agreed she needs growth but stated clearly: "I cannot lose money I cannot afford to lose — my kids need school fees every month." Downside protection is a hard requirement.',
    metadata: { date: '2024-03-12', tags: ['balanced portfolio', 'downside protection', 'school fees'] },
  },
  {
    clientId: '005514',
    clientName: '005514/JenniferKoh',
    sourceType: 'crm_note',
    sourceRef: 'crm_2024_11',
    content:
      "Jennifer's Shopee and TikTok Shop e-commerce business has grown significantly. She now has two income streams: salary from her corporate job and variable business revenue. She asked how to manage cash flow between the two and whether to invest business profits separately.",
    metadata: { date: '2024-11-06', tags: ['business income', 'dual income', 'cash flow management'] },
  },
  {
    clientId: '005514',
    clientName: '005514/JenniferKoh',
    sourceType: 'transcript',
    sourceRef: 'call_2025_04',
    content:
      "Jennifer asked: 'Should I put my emergency fund into a higher-yielding account, or keep it in a regular savings account? Also, is it too soon to think about setting up a trust for my children?' She wants both safety and growth, and is gradually gaining confidence managing money independently.",
    metadata: { date: '2025-04-14', tags: ['emergency fund', 'trust fund', 'financial confidence'] },
  },

  // ── Client 5: David Ng ─────────────────────────────────────────────────────
  {
    clientId: '005515',
    clientName: '005515/DavidNg',
    sourceType: 'crm_note',
    sourceRef: 'crm_2023_07',
    content:
      "David is 29 and works in banking. His immediate goal is to accumulate enough for a down payment on a home within 5 years. He is also starting to invest seriously for the first time and asked for guidance on where to begin without making expensive beginner mistakes.",
    metadata: { date: '2023-07-03', tags: ['first-time investor', 'home purchase', 'beginner'] },
  },
  {
    clientId: '005515',
    clientName: '005515/DavidNg',
    sourceType: 'transcript',
    sourceRef: 'call_2024_01',
    content:
      "David mentioned: 'I've been reading about FIRE — the idea of becoming financially free early and not having to depend on a salary. I want to retire by 45 if possible. I know it's ambitious but I'm saving about 40% of my salary now.' He asked what investment vehicles best support this goal.",
    metadata: { date: '2024-01-22', tags: ['FIRE', 'financial independence', 'early retirement', 'high savings rate'] },
  },
  {
    clientId: '005515',
    clientName: '005515/DavidNg',
    sourceType: 'meeting_summary',
    sourceRef: 'meeting_2024_08',
    content:
      "Discussed S&P 500 index funds, Vanguard global ETFs, and low-cost passive investing. David was very engaged and said: 'I don't want to spend hours monitoring stocks. I want a set-it-and-forget-it approach that builds wealth over 15 years without needing me to be involved daily.'",
    metadata: { date: '2024-08-15', tags: ['index fund', 'S&P 500', 'passive investing', 'ETF'] },
  },
  {
    clientId: '005515',
    clientName: '005515/DavidNg',
    sourceType: 'crm_note',
    sourceRef: 'crm_2025_01',
    content:
      "David is weighing two options: aggressively paying down his PTPTN student loan (4% interest) versus investing his surplus cash at an expected 8–10% annual return. He asked the advisor to help him model the optimal allocation between debt repayment and wealth building.",
    metadata: { date: '2025-01-30', tags: ['PTPTN', 'debt vs investing', 'optimisation'] },
  },

  // ── Client 6: Puan Rosnah ──────────────────────────────────────────────────
  {
    clientId: '005516',
    clientName: '005516/RosnahYusof',
    sourceType: 'crm_note',
    sourceRef: 'crm_2024_03',
    content:
      "Rosnah's husband passed away suddenly 3 months ago from a heart attack. She has inherited their joint savings, property, and EPF nominee payout. She has never independently managed household finances and describes herself as feeling 'completely lost and scared'.",
    metadata: { date: '2024-03-08', tags: ['widowed', 'inherited assets', 'new to finance management'] },
  },
  {
    clientId: '005516',
    clientName: '005516/RosnahYusof',
    sourceType: 'transcript',
    sourceRef: 'call_2024_05',
    content:
      "Rosnah said: 'I don't understand all this investment stuff. I just need something safe where I know my money is there when I need it. I'm afraid someone will take advantage of me because I don't know what I'm doing. Can you explain everything simply?'",
    metadata: { date: '2024-05-20', tags: ['financial literacy', 'low complexity', 'trust in advisor'] },
  },
  {
    clientId: '005516',
    clientName: '005516/RosnahYusof',
    sourceType: 'meeting_summary',
    sourceRef: 'meeting_2024_09',
    content:
      "Proposed Tabung Haji, Amanah Saham Bumiputera (ASB), and a short-term fixed deposit ladder as the core portfolio. Rosnah responded positively: 'These I understand. My late husband used Tabung Haji too.' Her primary requirement is a monthly income of at least RM 3,000 to cover living expenses.",
    metadata: { date: '2024-09-11', tags: ['Tabung Haji', 'ASB', 'fixed deposit', 'income requirement'] },
  },
  {
    clientId: '005516',
    clientName: '005516/RosnahYusof',
    sourceType: 'crm_note',
    sourceRef: 'crm_2025_01',
    content:
      "Rosnah has two adult children and is considering distributing a portion of the inheritance to them now rather than waiting. She asked about the concept of hibah (inter-vivos gift) under Islamic law and whether this has any tax implications or affects her own financial security.",
    metadata: { date: '2025-01-09', tags: ['hibah', 'estate distribution', 'Islamic estate planning'] },
  },
  {
    clientId: '005516',
    clientName: '005516/RosnahYusof',
    sourceType: 'transcript',
    sourceRef: 'call_2025_05',
    content:
      "During a portfolio review, Rosnah became visibly distressed when shown a chart with market fluctuations. She said: 'No, no — I cannot see my money going up and down like this. I will have a heart attack. Fixed only, please.' Advisor confirmed the plan will remain 100% fixed income. She also confirmed she needs RM 3,000 monthly at minimum.",
    metadata: { date: '2025-05-22', tags: ['risk aversion', 'fixed income only', 'monthly income', 'behavioural'] },
  },
];
