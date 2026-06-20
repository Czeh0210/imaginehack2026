/**
 * lib/seedData.js
 * Comprehensive synthetic advisory memories for demo seeding.
 * 12-14 items per client × 6 clients = ~78 chunks.
 *
 * Content is deliberately written in natural, conversational language
 * so semantic search surfaces relevant context even when queries use
 * different vocabulary (e.g. query "retirement" finds "stop working at 55").
 */

export const SEED_ITEMS = [

  // ── 005511 · Lim Wei Ming · 48M · Moderate · Senior Exec ──────────────────
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'crm_note', sourceRef: 'seed_lim_001',
    content: 'Wei Ming expressed a strong desire to stop his corporate career before reaching the age of 55. He has been working for 25 years and wants to travel with his wife while they are still physically active. He asked whether his current EPF balance and investments would be enough to last the rest of his life without depleting principal.',
    metadata: { date: '2024-03-12', tags: ['early retirement', 'EPF', 'longevity concern'] }
  },
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'transcript', sourceRef: 'seed_lim_002',
    content: 'Client said: "I keep looking at my EPF statement and I\'m not sure it\'s enough. What if I live until 90? My father lived until 88 and my mother is still going at 82. I need to be sure the money doesn\'t run out." He is acutely aware of longevity risk and wants a guaranteed income stream beyond EPF.',
    metadata: { date: '2024-03-12', tags: ['EPF', 'longevity', 'annuity interest'] }
  },
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'meeting_summary', sourceRef: 'seed_lim_003',
    content: 'Discussed dividend-paying REITs and blue-chip stocks as vehicles for passive income. Wei Ming showed interest in a portfolio that generates RM8,000–10,000 per month in dividend/coupon income. We also reviewed a deferred annuity option that would begin payouts at age 58. He wants to protect against a major market drawdown in his first 5 years of retirement — sequence-of-returns risk is a key concern.',
    metadata: { date: '2024-04-05', tags: ['REIT', 'dividend', 'annuity', 'sequence risk'] }
  },
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'crm_note', sourceRef: 'seed_lim_004',
    content: 'Wei Ming inquired about annuity and fixed payout products. He is not comfortable with market volatility and would accept a lower overall return in exchange for predictable monthly income. He mentioned his wife does not work and is fully financially dependent on him — any disruption to income would be serious.',
    metadata: { date: '2024-05-20', tags: ['annuity', 'risk aversion', 'dependant'] }
  },
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'transcript', sourceRef: 'seed_lim_005',
    content: 'Client expressed anxiety about market volatility: "What if there\'s another crash like 2008 right after I stop working? I can\'t go back to work at 60." He is worried about the first few years of drawdown being hit by a bear market. Discussed a bucket strategy — cash bucket for 2 years, bond ladder for years 3–7, equities for long-term.',
    metadata: { date: '2024-07-11', tags: ['market risk', 'drawdown strategy', 'bucket approach'] }
  },
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'meeting_summary', sourceRef: 'seed_lim_006',
    content: 'Portfolio review session. Current holdings: EPF RM890,000; Unit trust RM240,000 (balanced fund); Savings account RM120,000; Endowment policy maturing at 55 (payout ~RM180,000). Total investable assets ~RM1.43M. Target annual spend in retirement: RM120,000/year. Projected shortfall if retired today: moderate — EPF alone covers about 7–8 years at full drawdown.',
    metadata: { date: '2024-08-14', tags: ['portfolio review', 'EPF', 'endowment', 'retirement gap'] }
  },
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'crm_note', sourceRef: 'seed_lim_007',
    content: 'Wei Ming raised the topic of his aging parents. Both are in their 80s and he is one of three children sharing care responsibilities. He estimated possible medical and care costs of RM2,000–3,000 per month for the next 5–10 years. This expense is not currently in his retirement plan and needs to be factored in.',
    metadata: { date: '2024-09-03', tags: ['elder care', 'unexpected expense', 'retirement planning'] }
  },
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'risk_assessment', sourceRef: 'seed_lim_008',
    content: 'Risk profile assessment: Wei Ming scored 42/100 on the risk questionnaire — Moderate. He stated clearly that he would not be able to tolerate a drawdown of more than 15% on his total retirement portfolio. He is comfortable with a 50/50 equity-bond split but wants guaranteed income layers underneath. Inflation risk acknowledged but secondary to capital protection in his mind.',
    metadata: { date: '2024-10-01', tags: ['risk profile', 'moderate', 'capital protection'] }
  },
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'transcript', sourceRef: 'seed_lim_009',
    content: 'Wei Ming asked: "Should I downsize my house now or wait until retirement? We have a 4-bedroom in Petaling Jaya — if we sell, we might free up RM400,000 after settling the remaining loan." Discussed pros and cons of property liquidation to boost retirement fund. He is emotionally attached to the home but practical about the financial benefit.',
    metadata: { date: '2025-01-15', tags: ['property', 'capital release', 'retirement fund'] }
  },
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'meeting_summary', sourceRef: 'seed_lim_010',
    content: 'Reviewed insurance coverage. Existing policies: medical card (RM1.5M limit), critical illness (RM250,000 sum assured), term life (RM500,000 — expires at 65). Recommended: increase CI coverage to RM400,000 given longer expected retirement horizon. Wife has no independent coverage — urgent to add medical card for her.',
    metadata: { date: '2025-02-20', tags: ['insurance review', 'critical illness', 'medical card'] }
  },
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'follow_up', sourceRef: 'seed_lim_011',
    content: 'Follow-up after Q1 market correction. Wei Ming called to ask whether to switch his unit trust from balanced fund to bond fund. He was visibly concerned when equity markets fell 9% in February. Advised maintaining allocation but rebalancing bond layer. He wants to review the full plan in next quarterly meeting. Emotional: "I\'m worried we\'re heading into another downturn."',
    metadata: { date: '2025-03-08', tags: ['market concern', 'rebalancing', 'emotional response'] }
  },
  {
    clientId: '005511', clientName: '005511_LimWeiMing',
    sourceType: 'crm_note', sourceRef: 'seed_lim_012',
    content: 'Discussed legacy planning. Wei Ming has one adult daughter who is studying overseas. He wants to leave her at least RM500,000 in liquid assets. He also mentioned a possible business inheritance from his late brother\'s small furniture company — may need estate planning if the inheritance is realised.',
    metadata: { date: '2025-04-10', tags: ['estate planning', 'inheritance', 'legacy'] }
  },

  // ── 005512 · Sarah Tan · 35F · Aggressive · Tech Entrepreneur ──────────────
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'crm_note', sourceRef: 'seed_sarah_001',
    content: 'Sarah is a co-founder of a SaaS startup that recently closed a Series B round. She holds approximately 18% equity in the company and is not planning to sell in the near term but wants to build a separate personal investment portfolio that is independent of her company\'s fortunes.',
    metadata: { date: '2024-01-08', tags: ['startup', 'equity', 'personal portfolio', 'diversification'] }
  },
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'transcript', sourceRef: 'seed_sarah_002',
    content: 'Sarah mentioned: "I\'m already in US tech stocks and a bit of crypto through Binance. I know I\'m overexposed to tech but I believe in the sector. What I need help with is the boring stuff — diversification, insurance, and making sure my personal finances are separate from my company bank account."',
    metadata: { date: '2024-01-08', tags: ['diversification', 'crypto', 'US tech', 'business separation'] }
  },
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'meeting_summary', sourceRef: 'seed_sarah_003',
    content: 'Discussed global equity ETFs as a core holding for long-term personal wealth. Sarah responded well to the concept of low-cost index investing as a passive layer beneath her active bets. Also flagged that she has no proper medical insurance — currently covered by a basic company plan that is too low for her actual needs.',
    metadata: { date: '2024-02-20', tags: ['ETF', 'index fund', 'medical insurance', 'personal wealth'] }
  },
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'crm_note', sourceRef: 'seed_sarah_004',
    content: 'Sarah sold a 20% stake in her startup to a strategic investor at a valuation that implies her stake is worth approximately RM4.2M on paper. She received a partial cash-out of RM800,000 net of taxes. She wants to deploy this capital into global equities and possibly private equity. She has a high risk tolerance and a 10+ year investment horizon.',
    metadata: { date: '2024-06-14', tags: ['liquidity event', 'capital deployment', 'private equity', 'high risk'] }
  },
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'transcript', sourceRef: 'seed_sarah_005',
    content: 'Client asked: "What\'s the most tax-efficient way to invest this RM800k? I don\'t want to just park it in a savings account. I\'m thinking ETFs, maybe some REITs, and a small allocation to something more illiquid like a private fund." Discussed Malaysian vs US-domiciled ETFs, dividend withholding tax implications, and how to structure allocations across brokers.',
    metadata: { date: '2024-07-02', tags: ['tax efficiency', 'ETF', 'REIT', 'capital allocation'] }
  },
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'meeting_summary', sourceRef: 'seed_sarah_006',
    content: 'Proposed a 3-bucket structure for the RM800k: Bucket 1 — RM100k emergency fund (high-interest savings), Bucket 2 — RM500k in a core global equity ETF portfolio (MSCI World + EM allocation), Bucket 3 — RM200k opportunistic/satellite (private equity or high-growth thematic ETFs). Sarah approved the structure and asked us to proceed with onboarding.',
    metadata: { date: '2024-07-20', tags: ['asset allocation', '3-bucket strategy', 'global equity', 'private equity'] }
  },
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'crm_note', sourceRef: 'seed_sarah_007',
    content: 'Sarah is planning to hire her first batch of 20 employees. She asked about group insurance and group term life for her team. Also raised the question of key-man insurance for herself and her co-founder — if either of them cannot work, the company\'s valuation could drop significantly. Flagged as a business advisory need.',
    metadata: { date: '2024-09-10', tags: ['group insurance', 'key-man', 'business continuity'] }
  },
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'transcript', sourceRef: 'seed_sarah_008',
    content: 'Sarah expressed interest in ESG and sustainable investing: "I want my money to do something good. Can we add a green energy or climate-tech ETF to the mix? I know returns might be lower but I care about where the money goes." Discussed MSCI World ESG Leaders ETF and a global clean energy fund.',
    metadata: { date: '2025-01-05', tags: ['ESG', 'sustainable investing', 'green energy', 'values-based'] }
  },
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'risk_assessment', sourceRef: 'seed_sarah_009',
    content: 'Risk profile: Sarah scored 81/100 — Aggressive. She explicitly said she can tolerate a 30–40% drawdown because she has a long investment horizon and strong earned income from the business. She is not dependent on her investment portfolio for living expenses. Primary risk to watch: concentration in tech sector across personal portfolio and company equity.',
    metadata: { date: '2024-08-15', tags: ['risk profile', 'aggressive', 'tech concentration'] }
  },
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'meeting_summary', sourceRef: 'seed_sarah_010',
    content: 'Annual portfolio review. YTD return on core ETF portfolio: +14.2% (outperformed MSCI World benchmark by 1.8%). Crypto position down 22% but Sarah is relaxed about it — she treats it as a speculative allocation capped at 5% of net worth. Recommended rebalancing ETF to increase EM allocation from 10% to 20% given relative valuations.',
    metadata: { date: '2025-03-15', tags: ['portfolio review', 'rebalancing', 'ETF', 'crypto'] }
  },
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'crm_note', sourceRef: 'seed_sarah_011',
    content: 'Sarah is considering buying a second property in Kuala Lumpur as a rental investment. She asked whether it makes more sense to leverage property or continue channeling capital into liquid ETFs. Given her existing equity concentration, property could provide diversification but leverage adds complexity. She wants a comparative analysis before deciding.',
    metadata: { date: '2025-04-22', tags: ['property investment', 'leverage', 'diversification', 'rental income'] }
  },
  {
    clientId: '005512', clientName: '005512_SarahTan',
    sourceType: 'follow_up', sourceRef: 'seed_sarah_012',
    content: 'Flagged: Sarah\'s will and beneficiary nominations are not up to date. She has no will. If something happened to her today, her assets would go through intestacy law. She acknowledged the urgency but deferred action. Action required: remind her again at next meeting and connect her to estate planning specialist.',
    metadata: { date: '2025-05-01', tags: ['estate planning', 'will', 'beneficiary', 'urgent'] }
  },

  // ── 005513 · Ahmad Razif · 52M · Conservative · Government Servant ─────────
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'crm_note', sourceRef: 'seed_ahmad_001',
    content: 'Ahmad\'s top priority is his three children\'s university education. His eldest son will start university in less than 2 years. The middle child is 16 and the youngest is 13. He estimates total education costs across all three children at RM250,000–350,000 in today\'s money. He wants to ensure education funds are ring-fenced and not mixed with retirement savings.',
    metadata: { date: '2024-02-05', tags: ['education funding', 'children', 'ring-fencing', 'priority'] }
  },
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'transcript', sourceRef: 'seed_ahmad_002',
    content: 'Ahmad raised concerns about rising hospitalisation costs: "My medical card is from 20 years ago — the limit is only RM100,000 per year. With today\'s hospital bills, that won\'t be enough for a serious illness. I worry especially about cancer — my father had it." He is aware that medical takaful premiums are higher at his age but considers it essential.',
    metadata: { date: '2024-02-05', tags: ['medical takaful', 'critical illness', 'cancer concern', 'insurance upgrade'] }
  },
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'meeting_summary', sourceRef: 'seed_ahmad_003',
    content: 'Reviewed a laddered fixed deposit strategy and discussed Shariah-compliant alternatives (Sukuk, ASB, Tabung Haji) as the core of Ahmad\'s conservative portfolio. Ahmad is very clear that all investments must be Shariah-compliant — no conventional interest-bearing products. He is comfortable with ASB\'s historical dividend of 4–6% and uses Tabung Haji for Hajj savings.',
    metadata: { date: '2024-03-18', tags: ['Shariah', 'Sukuk', 'ASB', 'Tabung Haji', 'halal investing'] }
  },
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'crm_note', sourceRef: 'seed_ahmad_004',
    content: 'Ahmad\'s eldest son has been accepted to a local public university to study engineering. Ahmad is relieved the first year is partly covered by PTPTN but wants to provide a monthly allowance of RM1,500 and cover semester fees (~RM4,000/semester). He asked about withdrawing from his children\'s SSPN savings to cover costs.',
    metadata: { date: '2024-05-10', tags: ['SSPN', 'PTPTN', 'university cost', 'children support'] }
  },
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'transcript', sourceRef: 'seed_ahmad_005',
    content: 'Ahmad is considering leaving government service at 55 under Skim Persaraan — he is currently 52. His pension entitlement at 55 would be approximately RM3,200/month. He asked if this, combined with EPF, would be sufficient for retirement. Concerned about whether the pension will keep up with inflation over 25+ years.',
    metadata: { date: '2024-07-22', tags: ['pension', 'government retirement', 'EPF', 'inflation'] }
  },
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'risk_assessment', sourceRef: 'seed_ahmad_006',
    content: 'Risk profile: Ahmad scored 28/100 — Conservative. He stated he cannot afford to lose any significant portion of his savings because he has no other source of income beyond his salary and future pension. His investment philosophy: "Capital first, return second." He is willing to accept 4–5% p.a. returns if principal is safe.',
    metadata: { date: '2024-08-01', tags: ['risk profile', 'conservative', 'capital protection'] }
  },
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'meeting_summary', sourceRef: 'seed_ahmad_007',
    content: 'Proposed a 3-year education savings plan for Ahmad\'s second child: top up SSPN account by RM500/month, which will grow to approximately RM22,000 in 3 years (tax deductible). For the youngest child, recommended starting Tabung Haji savings for longer-term accumulation. Ahmad approved both recommendations.',
    metadata: { date: '2024-09-14', tags: ['SSPN', 'Tabung Haji', 'education plan', 'monthly savings'] }
  },
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'crm_note', sourceRef: 'seed_ahmad_008',
    content: 'Ahmad asked about medical takaful upgrade options. He wants a plan with at least RM500,000 annual limit with cancer coverage. He was shocked by the premium quote for his age group (~RM4,800/year for a RM500k plan). After reviewing his budget, he agreed to proceed with a RM350,000 limit plan at RM3,200/year as a compromise.',
    metadata: { date: '2024-10-30', tags: ['medical takaful', 'premium', 'cancer', 'budget constraint'] }
  },
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'transcript', sourceRef: 'seed_ahmad_009',
    content: 'Client mentioned he has a small plot of land in Perak inherited from his father. He is unsure whether to sell it now (~RM80,000) or hold for future appreciation. He does not need the money immediately. Also mentioned his wife manages a small home-based catering business that generates RM1,500–2,000/month.',
    metadata: { date: '2025-01-08', tags: ['property', 'land', 'inheritance', 'side income'] }
  },
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'meeting_summary', sourceRef: 'seed_ahmad_010',
    content: 'Discussed hibah and wasiat for estate planning. Ahmad wants to ensure his assets are distributed correctly under Islamic law. He has three children and a wife. Recommended engaging an Islamic estate planner. Also discussed nominating his wife as beneficiary for EPF and takaful, and using hibah amanah for his ASB holdings.',
    metadata: { date: '2025-02-25', tags: ['hibah', 'wasiat', 'Islamic estate', 'EPF nomination'] }
  },
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'follow_up', sourceRef: 'seed_ahmad_011',
    content: 'Ahmad called with an urgent question: his eldest son was offered a scholarship to study abroad. He would need RM15,000 upfront for the first year. Ahmad asked if he should use his emergency fund or take a personal financing. Advised: use existing SSPN savings first (which have the least impact on long-term plan), and avoid interest-bearing personal loan.',
    metadata: { date: '2025-04-15', tags: ['scholarship', 'overseas education', 'emergency fund', 'Islamic financing'] }
  },
  {
    clientId: '005513', clientName: '005513_AhmadRazif',
    sourceType: 'crm_note', sourceRef: 'seed_ahmad_012',
    content: 'Ahmad is approaching his 3-year milestone as our client. He is very process-oriented and values transparency — he always brings printed copies of his previous recommendations to meetings. He has followed almost all recommended actions. Main outstanding item: critical illness coverage for his wife remains insufficient.',
    metadata: { date: '2025-05-20', tags: ['client milestone', 'compliance', 'CI coverage', 'wife coverage'] }
  },

  // ── 005514 · Jennifer Koh · 41F · Moderate-Aggressive · Single Mother ───────
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'crm_note', sourceRef: 'seed_jen_001',
    content: 'Jennifer finalised her divorce last month and received a settlement that includes RM220,000 cash, the family car (valued RM85,000), and sole custody of her two children (ages 9 and 12). Her ex-husband retains the jointly owned property. She is starting fresh financially and needs a complete plan rebuild.',
    metadata: { date: '2024-01-20', tags: ['divorce', 'settlement', 'fresh start', 'single parent'] }
  },
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'transcript', sourceRef: 'seed_jen_002',
    content: 'Jennifer asked about wills and insurance nomination: "I\'m the only parent for my children now. If something happens to me, I need to know they are protected." She wants to update all insurance nominations and create a will that designates a guardian for her children. She became emotional during this conversation — she is clearly motivated by protecting her children.',
    metadata: { date: '2024-01-20', tags: ['will', 'insurance nomination', 'children protection', 'guardian'] }
  },
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'meeting_summary', sourceRef: 'seed_jen_003',
    content: 'Proposed a 60/40 balanced portfolio split between equities and fixed income for the divorce settlement proceeds. Jennifer agreed on the overall direction but stressed she cannot afford to lose more than 15% of her capital as she is the sole provider. We earmarked RM40,000 as an untouchable emergency fund (6 months of expenses) before investing the remainder.',
    metadata: { date: '2024-02-14', tags: ['portfolio', 'balanced', 'emergency fund', 'capital protection'] }
  },
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'crm_note', sourceRef: 'seed_jen_004',
    content: 'Jennifer\'s Shopee and TikTok Shop e-commerce business has grown significantly. Monthly revenue is now RM25,000–35,000 with a net margin of about 25%. She is considering formalising as a Sdn Bhd for tax purposes but is unsure about compliance costs. This is becoming a meaningful secondary income stream that needs proper financial planning.',
    metadata: { date: '2024-05-18', tags: ['e-commerce', 'business income', 'Sdn Bhd', 'tax planning'] }
  },
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'transcript', sourceRef: 'seed_jen_005',
    content: 'Jennifer asked: "Should I put my emergency fund into a higher-yield instrument? I know it\'s supposed to be liquid but RM40,000 earning 2.2% in a savings account feels like a waste." Explained the purpose of emergency funds and suggested a money market fund or short-term FD as a slight yield improvement without sacrificing liquidity.',
    metadata: { date: '2024-06-05', tags: ['emergency fund', 'money market', 'liquidity', 'yield'] }
  },
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'risk_assessment', sourceRef: 'seed_jen_006',
    content: 'Risk profile: Jennifer scored 55/100 — Moderate-Aggressive. She understands market risk intellectually but emotionally struggles when she sees negative returns. The key constraint: as a single mother with no financial backstop, a major portfolio loss would directly affect her children\'s wellbeing. She needs a portfolio that balances growth with downside protection.',
    metadata: { date: '2024-07-01', tags: ['risk profile', 'moderate-aggressive', 'downside protection'] }
  },
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'meeting_summary', sourceRef: 'seed_jen_007',
    content: 'Reviewed children\'s education trust fund options. Jennifer wants to set aside RM1,000/month for each child\'s university fund. Recommended SSPN for its tax deductibility and government backing. For longer-term growth, also proposed a children\'s unit trust with a 10-year horizon. She wants the funds locked so she cannot be tempted to use them for the business.',
    metadata: { date: '2024-08-22', tags: ['children trust', 'SSPN', 'education fund', 'locked savings'] }
  },
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'crm_note', sourceRef: 'seed_jen_008',
    content: 'Jennifer raised concern about her mother who lives with her. Her mother (age 68) has type 2 diabetes and is on medication. Jennifer is currently paying RM800/month for her medication and check-ups out of pocket. She asked if there are medical products that could cover an elderly parent — takaful rider options explored.',
    metadata: { date: '2024-10-15', tags: ['elder care', 'parent coverage', 'medical cost', 'dependent'] }
  },
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'transcript', sourceRef: 'seed_jen_009',
    content: 'Jennifer: "My ex-husband\'s maintenance payment is RM3,000/month but it\'s often late. I can\'t rely on it for fixed expenses. I need my own income to fully cover everything." She is building financial independence deliberately and wants to reduce reliance on the court-ordered maintenance. Her employment income is RM9,500/month and business income adds another RM6,000–8,000/month.',
    metadata: { date: '2025-01-10', tags: ['financial independence', 'income', 'single mother', 'maintenance'] }
  },
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'meeting_summary', sourceRef: 'seed_jen_010',
    content: 'Annual review at 12 months post-divorce. Portfolio performance: balanced fund +9.2%, SSPN on track. Jennifer has followed 8 of 10 recommended actions. Outstanding: (1) will not yet signed despite being drafted, (2) business Sdn Bhd registration still pending. Net worth improved from RM305,000 to RM410,000 including business equity. She is ahead of target.',
    metadata: { date: '2025-01-30', tags: ['annual review', 'net worth', 'progress', 'action tracking'] }
  },
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'crm_note', sourceRef: 'seed_jen_011',
    content: 'Jennifer is looking to buy a small apartment (RM400,000–480,000) as she is currently renting. She has RM50,000 saved for a down payment. Her combined income should qualify for a RM380,000 loan. Flagged risk: buying property could significantly deplete liquid savings and increase monthly obligations. We need to model the impact on her financial plan.',
    metadata: { date: '2025-03-20', tags: ['property purchase', 'mortgage', 'affordability', 'liquidity risk'] }
  },
  {
    clientId: '005514', clientName: '005514_JenniferKoh',
    sourceType: 'follow_up', sourceRef: 'seed_jen_012',
    content: 'Jennifer called after receiving a promotion at work — salary increased to RM11,000/month. She wants to increase monthly investment contributions by RM500 and also top up her medical card sum assured. This is a positive life event and an opportunity to accelerate her financial plan.',
    metadata: { date: '2025-05-05', tags: ['salary increase', 'promotion', 'contribution increase', 'positive event'] }
  },

  // ── 005515 · David Ng · 29M · Aggressive · Banker / FIRE ──────────────────
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'crm_note', sourceRef: 'seed_david_001',
    content: 'David is 29 and works in banking. His immediate goal is to achieve a savings rate of 50% of his take-home income. He currently earns RM8,500/month and saves RM4,000/month. He is inspired by the FIRE (Financial Independence, Retire Early) movement and wants to stop depending on employment income by age 45.',
    metadata: { date: '2024-01-15', tags: ['FIRE', 'savings rate', 'financial independence', 'early retirement'] }
  },
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'transcript', sourceRef: 'seed_david_002',
    content: 'David mentioned: "I\'ve been reading about FIRE — the idea of living off the 4% withdrawal rule. So if I have RM3 million invested, I can withdraw RM120,000 a year indefinitely. Am I on track for that?" Discussed the 4% rule, sequence of returns risk, and whether RM3M is achievable by 45 given his current savings and income trajectory.',
    metadata: { date: '2024-01-15', tags: ['FIRE', '4% rule', 'RM3M target', 'withdrawal strategy'] }
  },
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'meeting_summary', sourceRef: 'seed_david_003',
    content: 'Discussed S&P 500 index funds, Vanguard global ETFs, and low-cost investment strategies. David is very fee-conscious — he understands expense ratios and TERs. He already uses a US brokerage (Interactive Brokers) for his personal ETF investments. He wants guidance on whether to supplement with Malaysian unit trusts for EPF withdrawal or keep everything offshore.',
    metadata: { date: '2024-02-28', tags: ['index fund', 'ETF', 'Interactive Brokers', 'expense ratio', 'EPF'] }
  },
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'crm_note', sourceRef: 'seed_david_004',
    content: 'David is weighing two options: aggressively paying down his student loan (RM85,000 remaining at 4.5% p.a.) vs investing the extra cash in global equity ETFs that historically return 8–10%. He leans towards investing but wants a mathematical and psychological perspective on both paths.',
    metadata: { date: '2024-04-10', tags: ['student loan', 'debt paydown', 'investment vs debt', 'opportunity cost'] }
  },
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'transcript', sourceRef: 'seed_david_005',
    content: 'David: "I want to buy a house but I\'m conflicted. Renting is cheaper monthly but property is an asset. My colleagues say I\'m throwing money away by renting. But buying locks up capital I could invest." Conducted a rent-vs-buy analysis for KL property market. Conclusion: at current prices, renting and investing the difference may outperform buying for his 15-year horizon.',
    metadata: { date: '2024-07-05', tags: ['property', 'rent vs buy', 'KL market', 'opportunity cost'] }
  },
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'risk_assessment', sourceRef: 'seed_david_006',
    content: 'Risk profile: David scored 78/100 — Aggressive. He has no dependants, strong job security in banking, and a long investment horizon. He is comfortable with a 30–40% portfolio drawdown. He does not check his portfolio daily — he invests on a schedule (monthly DCA) and tries to ignore short-term noise.',
    metadata: { date: '2024-08-01', tags: ['risk profile', 'aggressive', 'DCA', 'long horizon'] }
  },
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'meeting_summary', sourceRef: 'seed_david_007',
    content: 'Reviewed David\'s current investment portfolio: RM180,000 in IBKR across VT (global equity ETF) and QQQ (Nasdaq 100). He also has RM45,000 in EPF and RM20,000 in a high-yield savings account. Recommended: (1) consolidate into VT+BNDW (80/20 equity-bond), (2) maximise EPF voluntary contribution for tax relief, (3) open SSPN account for potential future children education savings.',
    metadata: { date: '2024-09-18', tags: ['portfolio review', 'VT', 'ETF', 'EPF', 'SSPN'] }
  },
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'crm_note', sourceRef: 'seed_david_008',
    content: 'David mentioned he received a promotion — now Associate Director with a RM12,000/month salary. He wants to maintain his lifestyle and increase his savings rate to 55%. He also mentioned he is in a serious relationship and his girlfriend may move in within a year — this could change his expense structure. No immediate change to financial plan but flagged for future review.',
    metadata: { date: '2025-01-20', tags: ['salary increase', 'savings rate', 'lifestyle', 'relationship change'] }
  },
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'transcript', sourceRef: 'seed_david_009',
    content: 'David: "Should I buy a new car? My old car is 10 years old and repairs are getting expensive. I could get a new one for RM90,000 but that feels like wasted capital." Discussed the opportunity cost of a car loan vs investing the same amount. He decided to buy a second-hand car at RM40,000 to minimise capital tied up in a depreciating asset.',
    metadata: { date: '2025-02-14', tags: ['car purchase', 'depreciating asset', 'opportunity cost', 'frugality'] }
  },
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'meeting_summary', sourceRef: 'seed_david_010',
    content: 'FIRE progress check at 12 months into the plan. David\'s investable net worth has grown from RM245,000 to RM340,000 — +38.7% (combination of new contributions and market returns). At this pace he is ahead of the RM3M by 45 target. Stress-tested the plan with a 5-year bear market scenario — still achievable by 47 in worst case.',
    metadata: { date: '2025-03-10', tags: ['FIRE progress', 'net worth', 'stress test', 'on track'] }
  },
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'crm_note', sourceRef: 'seed_david_011',
    content: 'David brought up his workplace benefit — his bank offers voluntary EPF over-contribution with employer match up to 3% additional. He was not aware of this benefit and wants to maximise it immediately. Also flagged: his death and disability cover through work is only RM200,000 — very low given his investment assets. He is uninsured for critical illness.',
    metadata: { date: '2025-04-05', tags: ['EPF employer match', 'workplace benefit', 'disability cover', 'critical illness gap'] }
  },
  {
    clientId: '005515', clientName: '005515_DavidNg',
    sourceType: 'follow_up', sourceRef: 'seed_david_012',
    content: 'David asked: "If I hit FIRE at 45, how do I actually access the money? My ETFs are in IBKR and my EPF is locked until 55. What\'s the withdrawal strategy for the 10-year gap?" Detailed discussion on bridge accounts, systematic withdrawal plans, and potential Roth/IRA ladder analogy for Malaysian context. David found this very useful.',
    metadata: { date: '2025-05-15', tags: ['withdrawal strategy', 'FIRE bridge', 'EPF', 'retirement income'] }
  },

  // ── 005516 · Rosnah Yusof · 55F · Conservative · Widow ────────────────────
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'crm_note', sourceRef: 'seed_rosnah_001',
    content: 'Rosnah\'s husband passed away suddenly 3 months ago from a heart attack at age 57. She received an insurance payout of RM450,000 and is the sole beneficiary of his EPF (RM320,000). She has two adult children — a son (28) working in Selangor and a daughter (25) who is a teacher. She is managing her finances alone for the first time in her life.',
    metadata: { date: '2024-03-05', tags: ['widow', 'bereavement', 'insurance payout', 'EPF inheritance'] }
  },
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'transcript', sourceRef: 'seed_rosnah_002',
    content: 'Rosnah said: "I don\'t understand all this investment stuff. My husband handled everything. I just need to know my money is safe and I get enough each month to live on." Her primary need is simple: monthly income that covers her RM3,500/month expenses without eroding principal. She is not interested in complex products.',
    metadata: { date: '2024-03-05', tags: ['financial literacy', 'monthly income', 'simplicity', 'capital preservation'] }
  },
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'meeting_summary', sourceRef: 'seed_rosnah_003',
    content: 'Proposed Tabung Haji, Amanah Saham Bumiputera (ASB), and a Shariah-compliant monthly income fund as the three pillars of Rosnah\'s investment plan. Total investable amount: RM770,000. Strategy: RM200k in Tabung Haji (monthly withdrawal facility), RM400k in ASB (annual dividend ~4.5%), RM170k in Shariah income unit trust. Monthly income target: RM3,800–4,200.',
    metadata: { date: '2024-04-10', tags: ['Tabung Haji', 'ASB', 'Shariah', 'monthly income', 'income plan'] }
  },
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'crm_note', sourceRef: 'seed_rosnah_004',
    content: 'Rosnah has two adult children and is considering distributing some of her assets to them. Her son asked for RM50,000 to start a business. She wants to help but is worried about depleting her own retirement funds. She does not want to be financially dependent on her children in old age — very important to her dignity.',
    metadata: { date: '2024-06-20', tags: ['family gift', 'children request', 'financial independence', 'dignity'] }
  },
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'transcript', sourceRef: 'seed_rosnah_005',
    content: 'During a portfolio review, Rosnah became visibly distressed when she saw that her unit trust had dropped in value (small correction of 3%). She said: "I thought this was safe. I don\'t want to lose money. I just want everything to be okay." Reassured her that the income fund was designed to be low volatility and the dip was temporary. She asked to be shown simpler, less fluctuating options.',
    metadata: { date: '2024-08-15', tags: ['emotional response', 'loss aversion', 'stability preference', 'low volatility'] }
  },
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'risk_assessment', sourceRef: 'seed_rosnah_006',
    content: 'Risk profile: Rosnah scored 18/100 — Conservative. She explicitly stated she cannot tolerate seeing any negative number on a statement. Her reference point is her husband\'s fixed deposit approach — guaranteed return, no surprises. She understands she may earn less but values peace of mind above all. Strategy must be almost entirely capital-guaranteed with predictable income.',
    metadata: { date: '2024-08-20', tags: ['risk profile', 'conservative', 'capital guarantee', 'peace of mind'] }
  },
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'meeting_summary', sourceRef: 'seed_rosnah_007',
    content: 'Discussed estate and hibah planning. Rosnah wants to distribute assets evenly between her son and daughter. She has no will and does not know what her husband\'s will said — he did not have one. Explained faraid (Islamic inheritance law) and how it would apply to her assets. She was surprised at the complexity and agreed to engage a Shariah estate planner.',
    metadata: { date: '2024-09-25', tags: ['estate planning', 'hibah', 'faraid', 'Islamic inheritance', 'will'] }
  },
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'crm_note', sourceRef: 'seed_rosnah_008',
    content: 'Rosnah expressed interest in performing Hajj within the next 2 years. She has been registered with Tabung Haji since 1998 and has accumulated RM42,000. The Hajj cost for 2025/2026 is estimated at RM22,000–28,000. Her savings are sufficient. She wants to ensure Hajj costs do not compromise her monthly income plan.',
    metadata: { date: '2024-11-10', tags: ['Hajj', 'Tabung Haji', 'spiritual goal', 'budget planning'] }
  },
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'transcript', sourceRef: 'seed_rosnah_009',
    content: 'Rosnah asked about the safety of ASB: "Is ASB guaranteed? What if the government stops the dividend?" Explained that ASB is managed by Permodalan Nasional Berhad and while not explicitly government guaranteed, it has paid dividends consistently for decades. She found this reassuring. Also asked about PIDM protection for fixed deposits.',
    metadata: { date: '2025-01-15', tags: ['ASB', 'PIDM', 'financial safety', 'reassurance', 'guarantees'] }
  },
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'meeting_summary', sourceRef: 'seed_rosnah_010',
    content: 'Monthly income review after 6 months on the plan. Rosnah received: Tabung Haji dividend annualised ~4.8%, ASB dividend 5.1% (FY2024), income unit trust distributed 4.2% annualised. Total income generated: approximately RM34,000 in 6 months (RM5,700/month average) — exceeds her RM3,500 monthly target. She was relieved and expressed gratitude.',
    metadata: { date: '2025-02-20', tags: ['income review', 'dividend', 'ASB', 'target met', 'positive outcome'] }
  },
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'crm_note', sourceRef: 'seed_rosnah_011',
    content: 'Rosnah\'s daughter is expecting a baby — Rosnah\'s first grandchild. She is overjoyed and wants to start a savings account for the baby. Also mentioned she is now taking care of her elderly mother (80s) two days a week. Her own health is good but she mentioned knee pain that may require minor surgery — medical card coverage confirmed adequate.',
    metadata: { date: '2025-03-30', tags: ['grandchild', 'baby savings', 'elder care', 'health', 'medical coverage'] }
  },
  {
    clientId: '005516', clientName: '005516_RosnahYusof',
    sourceType: 'follow_up', sourceRef: 'seed_rosnah_012',
    content: 'Rosnah called to say her son is returning the RM50,000 gift in installments — he did not use the business idea and feels guilty. She wants to reinvest it. Recommended adding it to the ASB lump sum. She also mentioned she has started attending a financial literacy class at her local surau — very positive development for her confidence.',
    metadata: { date: '2025-05-10', tags: ['reinvestment', 'family', 'financial literacy', 'progress'] }
  },
];
