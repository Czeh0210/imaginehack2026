import { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { GoogleMap, DirectionsRenderer, Marker } from "@react-google-maps/api";
import { useMapsLoaded } from "@/lib/mapsLoader";

const getItemsInPath = (files, basePath) => {
  const items = [];
  const folderSet = new Set();
  
  files.forEach(file => {
    const name = file.name;
    if (basePath === "") {
      if (name.includes("/")) {
        const folderName = name.split("/")[0];
        if (!folderSet.has(folderName)) {
          folderSet.add(folderName);
          items.push({
            id: `folder-${folderName}`,
            name: folderName,
            type: "folder",
            description: "Folder containing client files",
            uploadedBy: file.uploadedBy,
            uploadedAt: file.uploadedAt,
          });
        }
      } else {
        items.push({ ...file });
      }
    } else {
      const prefix = basePath + "/";
      if (name.startsWith(prefix)) {
        const relative = name.substring(prefix.length);
        if (relative.includes("/")) {
          const folderName = relative.split("/")[0];
          const fullFolderName = basePath + "/" + folderName;
          if (!folderSet.has(fullFolderName)) {
            folderSet.add(fullFolderName);
            items.push({
              id: `folder-${fullFolderName}`,
              name: folderName,
              type: "folder",
              description: "Folder containing client files",
              uploadedBy: file.uploadedBy,
              uploadedAt: file.uploadedAt,
            });
          }
        } else {
          items.push({
            ...file,
            displayName: relative,
            type: file.type || "file"
          });
        }
      }
    }
  });
  
  return items;
};

const getDefaultAdvisoryFiles = (displayId) => {
  const cleanId = displayId ? displayId.toLowerCase() : "";
  if (cleanId.includes("acme") || cleanId.includes("amcord")) {
    return [
      {
        id: "amcord-readme",
        name: "README.md",
        type: "md",
        size: 4305,
        description: "AMCORD — Client Advisory Summary",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        content: `# AMCORD — Client Advisory Summary

> [!IMPORTANT]
> **Advisor Reminder:** AMCORD is a warm estate planning prospect who wants a simple explanation of how estate planning protects both family and business continuity; send a short summary and follow up gently through WhatsApp.

---

## 📊 Client Overview

| Attribute | Details |
| :--- | :--- |
| **Client Name** | AMCORD Sdn. Bhd. |
| **Client Type** | Corporate / SME Client |
| **Main Advisory Topic** | Estate Planning |
| **Relationship Stage** | 🟡 Warm Prospect |
| **Assigned Advisor** | Advisor A |
| **Preferred Contact** | WhatsApp for updates, phone call for detailed explanation |
| **Last Contact** | 18 June 2026 |
| **Next Follow-Up** | 25 June 2026 |
| **Relationship Health**| 📈 **74 / 100** (Warm, requires timely follow-up) |

---

## 📝 Current Client Summary

AMCORD is currently exploring estate planning solutions for business owners and company directors. The discussion is mainly focused on how the company’s key decision-makers can protect family interests, business continuity, share ownership, and wealth transfer planning in the event of death, disability, or unexpected succession issues.

The client has shown interest but requires a simple explanation because estate planning can feel complex and sensitive. Their main concern is understanding the practical purpose of estate planning, the cost involved, and how it can protect both the family and the business.

---

## 🎯 Main Needs & Concerns

### 🔍 Main Needs
* Estate planning for company directors
* Will and trust planning
* Business succession planning
* Shareholder protection
* Wealth transfer arrangement
* Protection for family beneficiaries
* Continuity plan if key decision-maker is absent
* Clear documentation of wishes and asset distribution

### ⚠️ Key Concerns
* Client wants to understand why estate planning is necessary
* Concerned about cost and complexity
* Needs a simple explanation before making decisions
* May need to involve other directors or family members
* Sensitive topic, so follow-up should be respectful and not pushy
* Wants to avoid future disputes among family or shareholders

---

## 📞 Communication Preference

* Prefers short WhatsApp updates first
* Detailed discussion should be done through phone call or meeting
* Avoid overly technical legal terms
* Use simple examples to explain estate planning
* Tone should be professional, respectful, and trust-building
* Do not make the message sound too sales-focused

---

## 💬 Latest Interaction

### 🗓️ 18 June 2026 — WhatsApp Follow-Up

* **Summary:** Advisor followed up after the first estate planning discussion. AMCORD replied that they are interested but need a simpler explanation before arranging a deeper discussion.
* **Extracted Memory:**
  * Client is interested in estate planning
  * Client needs simple explanation before next meeting
  * Client may involve family members or other directors later
  * Main concern is practical value and cost
  * Follow-up should focus on clarity, protection, and business continuity

> [!NOTE]
> **Client's Message:**
> “Can you send me a simple summary first? I want to understand how estate planning helps the company and family.”

---

## 🚀 Next Steps

### Next Best Action
Send a simple estate planning summary explaining:
1. What estate planning is
2. Why it matters for business owners
3. How it protects family and company continuity
4. What documents or structures may be needed
5. What the next discussion should cover

> [!NOTE]
> **Suggested WhatsApp Follow-Up:**
> "Hi, thanks for your reply. I’ll prepare a simple estate planning summary for you, focusing on how it can help protect both the family and the company’s continuity. I’ll keep it short and practical so it is easier for you to review before we arrange a deeper discussion."

---

## 📋 Pending Tasks

- [ ] Prepare simple estate planning summary
- [ ] Explain will, trust, and business succession in simple terms
- [ ] Highlight why estate planning matters for company directors
- [ ] Send WhatsApp follow-up by 25 June 2026
- [ ] Ask whether family members or other directors should join the next discussion
- [ ] Schedule estate planning consultation if client responds positively

---

## 🗓️ Important Dates & Milestones

| Milestone | Date |
| :--- | :--- |
| **First Discussion** | 12 June 2026 |
| **Last WhatsApp Reply** | 18 June 2026 |
| **Suggested Follow-Up** | 25 June 2026 |

* *If no reply, follow up again after 7 days.*
* *If still no response, move to soft nurture and reconnect after 60 days.*

---

## 🔄 Relationship Continuity Plan

### 🟢 If Client Responds Positively
* Schedule estate planning discussion
* Confirm whether the discussion is personal, family, or company-related
* Ask whether other directors or family members should be included
* Prepare simple estate planning checklist
* Move stage to **"Active Estate Planning Discussion"**

### 🟡 If Client Needs More Time
* Send educational content about estate planning basics
* Avoid pressure
* Set follow-up reminder after 30 days
* Revisit with a practical example or case scenario

### 🔴 If No Reply
* Follow up once after 7 days
* If still no reply, move to **"Nurture"**
* Reconnect after 60 days with a soft message about protecting family and business continuity

---

## 💡 Potential Opportunities

| Opportunity | Reason |
| :--- | :--- |
| **Will Writing** | Client may need clear asset distribution instructions |
| **Trust Planning** | Useful for family protection and controlled wealth transfer |
| **Business Succession** | Relevant if company depends on key directors |
| **Shareholder Protection** | Important if ownership transfer may affect business stability |
| **Family Protection Planning** | Estate planning can connect to family financial security |
| **Key Person Planning** | Company may need protection if key person is absent |
| **Cross-Border Estate Planning** | Possible if client has overseas assets or family members abroad |

---

## ⚖️ Risk and Compliance Notes

* Do not provide legal advice unless supported by qualified legal partners
* Explain that estate planning should involve proper legal documentation
* Avoid making assumptions about family structure or asset ownership
* Confirm whether the planning is personal, corporate, or both
* Record client consent before storing sensitive family or asset information
* Refer to legal or trust partners when necessary
* Keep communication respectful because estate planning involves sensitive topics

---

## 🏷️ AI Memory Tags

\`estate-planning\` · \`warm-prospect\` · \`business-owner\` · \`company-director\` · \`succession-planning\` · \`will-planning\` · \`trust-planning\` · \`family-protection\` · \`shareholder-protection\` · \`cost-concern\` · \`simple-explanation-needed\` · \`whatsapp-preferred\` · \`follow-up-needed\`

---

## One-Line Advisor Reminder

AMCORD is a warm estate planning prospect who wants a simple explanation of how estate planning protects both family and business continuity; send a short summary and follow up gently through WhatsApp.`
      },
      {
        id: "amcord-1",
        name: "client-info/AMCORD_Corporate_Profile.pdf",
        type: "pdf",
        size: 1258291,
        description: "Corporate profile and founder asset division overview",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        content: "SIMULATED_PDF_AMCORD",
      },
      {
        id: "amcord-5",
        name: "client-info/Intake_Advisory_Notes.md",
        type: "md",
        size: 320,
        description: "Client advisory intake notes: shareholder protection",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
        content: `# Client Advisory Intake Notes
- **Client**: AMCORD Sdn. Bhd.
- **Risk Tolerance**: Moderate-Conservative
- **Key Objective**: Wealth preservation and asset transition
- **Transition Target**: Shareholder protection and corporate continuity`
      },
      {
        id: "amcord-2",
        name: "proposals/Shareholder_Agreement_Clause_Draft.docx",
        type: "docx",
        size: 460800,
        description: "Draft clause on buyout rights upon member decease",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        content: "SIMULATED_DOCX_AMCORD",
      },
      {
        id: "amcord-3",
        name: "resources/2025_Tax_Projections_Calculations.xlsx",
        type: "xlsx",
        size: 184320,
        description: "Tax bracket projections & corporate capital gains assessment",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        content: "SIMULATED_XLSX_AMCORD",
      },
      {
        id: "amcord-4",
        name: "meeting/summary/Meeting_Minutes_2026-06-18.md",
        type: "md",
        size: 1536,
        description: "Alignment minutes: Estate structure discussion",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        content: `# Meeting Minutes: AMCORD Estate Alignment
**Date:** June 18, 2026
**Participants:** Bruce Wayne (Advisor), AMCORD Board, Legal Counsel

## Executive Summary
The meeting focused on establishing the succession protocol and tax-efficient asset transfer of corporate holdings.

## Key Decisions
- **Revocable Trust**: Shareholder agreement structure transfer by Q3.
- **Tax Optimization**: Tax counsel proposed a structure to defer capital gains tax during transition.

## Action Items
1. **Advisor**: Finalize the tax projection calculations sheet.
2. **Legal**: Draft modified shareholder buyout provisions.
3. **Board**: Approve the transition roadmap at the next quarterly meeting.`,
      },
      {
        id: "amcord-raw",
        name: "meeting/raw audio/15-minutes-of-silence.mp3",
        type: "mp3",
        size: 936272,
        description: "Raw meeting recording (silence)",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        fileUrl: "/15-minutes-of-silence.mp3",
        content: "",
      },
      {
        id: "amcord-chat",
        name: "conversation history/Initial_Consultation_Chat_Transcript.md",
        type: "md",
        size: 980,
        description: "Initial consultation transcript regarding trust deeds",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
        content: `# Initial consultation chat transcript
**Date**: June 10, 2026

- **Bruce (Advisor)**: Hello, let's discuss setting up the share protection trust for AMCORD holdings.
- **AMCORD Board**: We want to make sure the transition has minimal capital gains exposure.
- **Bruce (Advisor)**: Understood. I will prepare tax projections and draft the transition roadmap in the proposals folder.`
      }
    ];
  } else if (cleanId.includes("globex")) {
    return [
      {
        id: "globex-readme",
        name: "README.md",
        type: "md",
        size: 810,
        description: "Globex Holdings Asset Protection Trust Structure",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
        content: `# Globex Holdings Asset Protection Trust Structure

Secure folder containing legal structures for the Globex Irrevocable Wealth Trust and overseas asset allocation.

## Folders
- \`client-info/\`: Trust deeds, settlor profiles, and milestone requirements.
- \`conversation history/\`: Consultations on reporting and regulatory compliance.
- \`meeting/summary/\`: Minutes on asset distributions.
- \`meeting/raw audio/\`: Raw meeting audio recordings.
- \`proposals/\`: Trust amendment resolutions.
- \`resources/\`: Portfolio yields, targets, and allocations spreadsheet.

---
*Confidential wealth advisory records. Managed by Bruce Wayne, Wealth Planner.*`
      },
      {
        id: "globex-1",
        name: "client-info/Globex_Asset_Protection_Trust_Deed.pdf",
        type: "pdf",
        size: 2202009,
        description: "Irrevocable trust agreement for asset protection",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        content: "SIMULATED_PDF_GLOBEX",
      },
      {
        id: "globex-compliance",
        name: "conversation history/Regulatory_Compliance_Brief.pdf",
        type: "pdf",
        size: 450000,
        description: "Overview of foreign holding disclosure requirements",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
        content: "SIMULATED_PDF_GLOBEX_COMPLIANCE",
      },
      {
        id: "globex-2",
        name: "resources/Trust_Fund_Asset_Allocation_Q2.xlsx",
        type: "xlsx",
        size: 97280,
        description: "Asset breakdown, yields, and growth projections",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        content: "SIMULATED_XLSX_GLOBEX",
      },
      {
        id: "globex-3",
        name: "meeting/summary/Meeting_Transcript_2026-06-12.md",
        type: "md",
        size: 1200,
        description: "Offshore structures discussion notes",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        content: `# Meeting Notes: Globex Trust Structure
**Date:** June 12, 2026
**Advisor:** Bruce Wayne (Advisor)

## Discussion Points
Reviewed offshore compliance requirements and tax implications of global asset holdings under the family trust.

## Next Steps
- Confirm reporting requirements under global tax treaties.
- Verify asset valuation of international holdings by Q4.`,
      },
      {
        id: "globex-raw",
        name: "meeting/raw audio/15-minutes-of-silence.mp3",
        type: "mp3",
        size: 936272,
        description: "Raw meeting recording (silence)",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        fileUrl: "/15-minutes-of-silence.mp3",
        content: "",
      },
      {
        id: "globex-proposal",
        name: "proposals/Milestone_Distribution_Amendment.docx",
        type: "docx",
        size: 210000,
        description: "Resolution proposing milestone payouts",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        content: "SIMULATED_DOCX_GLOBEX_PROP",
      }
    ];
  } else if (cleanId.includes("smith")) {
    return [
      {
        id: "smith-readme",
        name: "README.md",
        type: "md",
        size: 760,
        description: "Smith Family Last Will & Testament Records",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
        content: `# Smith Family Last Will & Testament Records

Advisory repository for the Smith family estate planning. Holds current Will drafts, executor duties, and asset inventories.

## Folder Index
- \`client-info/\`: Family certificates and registration profiles.
- \`conversation history/\`: Consultation conversations about executor choices.
- \`meeting/summary/\`: Family alignment meeting minutes.
- \`meeting/raw audio/\`: Raw meeting audio recordings.
- \`proposals/\`: Testamentary trust proposals.
- \`resources/\`: Asset and bank account inventories.

---
*Smith Family Wealth Advisory Archive.*`
      },
      {
        id: "smith-1",
        name: "client-info/SmithFamily_Last_Will_and_Testament.pdf",
        type: "pdf",
        size: 1003520,
        description: "Last Will draft with guardian designations",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
        content: "SIMULATED_PDF_SMITH",
      },
      {
        id: "smith-chats",
        name: "conversation history/Executor_Choice_Discussions.md",
        type: "md",
        size: 850,
        description: "Chat logs regarding choice of primary and alternate executors",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
        content: `# Executor Choice Discussions
- **Bruce (Advisor)**: John, we need to designate an alternate executor in case your spouse is unable to serve.
- **John Smith**: I would like to nominate you, Bruce, as our alternate executor if that is acceptable.
- **Bruce (Advisor)**: I am honored. Let's record this in the proposals under Executor duties.`
      },
      {
        id: "smith-2",
        name: "proposals/Executor_Responsibility_Briefing.pdf",
        type: "pdf",
        size: 563200,
        description: "Guide for the designated family executor",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        content: "SIMULATED_PDF_SMITH_EXEC",
      },
      {
        id: "smith-3",
        name: "resources/Asset_Inventory_Review.xlsx",
        type: "xlsx",
        size: 122880,
        description: "Family assets inventory and account numbers",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        content: "SIMULATED_XLSX_SMITH",
      },
      {
        id: "smith-4",
        name: "meeting/summary/Meeting_Transcript_2026-06-19.md",
        type: "md",
        size: 980,
        description: "Smith Will final review alignment notes",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        content: `# Smith Will Review Meeting
**Date:** June 19, 2026

## Summary
Reviewed the asset allocation parameters. The primary residence will go to the spouse, and liquid savings split equally among the children.

## Actions
- Update Will draft with correct spelling of guardians' names.
- Schedule notary appointment.`,
      },
      {
        id: "smith-raw",
        name: "meeting/raw audio/15-minutes-of-silence.mp3",
        type: "mp3",
        size: 936272,
        description: "Raw meeting recording (silence)",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        fileUrl: "/15-minutes-of-silence.mp3",
        content: "",
      }
    ];
  } else if (cleanId.includes("wayne")) {
    return [
      {
        id: "wayne-readme",
        name: "README.md",
        type: "md",
        size: 740,
        description: "Wayne Enterprises Executive Succession Plan",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
        content: `# Wayne Enterprises Executive Succession & Contingency Plan

Confidential governance planning and key man security documents.

## Structure
- \`client-info/\`: Corporate board resolutions and identity records.
- \`conversation history/\`: Leadership pathways consultations.
- \`meeting/summary/\`: Board governance alignment minutes.
- \`meeting/raw audio/\`: Raw meeting audio recordings.
- \`proposals/\`: Buyout agreements and contingency bylaws.
- \`resources/\`: Key man insurance coverage and cost analysis.

---
*Security clearance Level 4 required. Access logged.*`
      },
      {
        id: "wayne-1",
        name: "client-info/WayneEnterprises_Succession_Roadmap.pdf",
        type: "pdf",
        size: 3565158,
        description: "Executive leadership succession planning roadmap",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        content: "SIMULATED_PDF_WAYNE",
      },
      {
        id: "wayne-qa",
        name: "conversation history/Transition_Pathways_Q&A.md",
        type: "md",
        size: 1100,
        description: "Q&A regarding operational control transition",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
        content: `# Transition Pathways Q&A
**Q**: Who takes immediate control if Bruce Wayne is unavailable?
**A**: Operationally, Lucius Fox has delegation limits. Shares will temporarily vote through the Board Trustee Council.`
      },
      {
        id: "wayne-2",
        name: "resources/Key_Man_Insurance_Policies.xlsx",
        type: "xlsx",
        size: 153600,
        description: "Key man policy coverage analysis and cost-benefit",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        content: "SIMULATED_XLSX_WAYNE",
      },
      {
        id: "wayne-3",
        name: "meeting/summary/Meeting_Transcript_2026-06-15.md",
        type: "md",
        size: 1650,
        description: "Succession alignment meeting notes",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        content: `# Wayne Enterprises Succession Planning Meeting
**Date:** June 15, 2026

## Context
Determining successor pathways and corporate control in the event of emergency leadership transitions.

## Action Plan
1. Formalize key-man insurance evaluations by Q3.
2. Obtain board approval for succession protocol.`,
      },
      {
        id: "wayne-raw",
        name: "meeting/raw audio/15-minutes-of-silence.mp3",
        type: "mp3",
        size: 936272,
        description: "Raw meeting recording (silence)",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        fileUrl: "/15-minutes-of-silence.mp3",
        content: "",
      },
      {
        id: "wayne-buyout",
        name: "proposals/Emergency_Buyout_Agreement_Draft.docx",
        type: "docx",
        size: 380000,
        description: "Contingency buyout provisions draft",
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        content: "SIMULATED_DOCX_WAYNE_BUYOUT",
      }
    ];
  }

  return [
    {
      id: "def-readme",
      name: "README.md",
      type: "md",
      size: 500,
      description: "General Advisory Plan Overview",
      uploadedBy: "Lim Fang Yee",
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      content: `# General Advisory Plan Overview

Advisory folder. Organised as follows:
- \`client-info/\`: Profiling documents.
- \`conversation history/\`: Transcripts.
- \`meeting/summary/\`: Meeting minutes.
- \`meeting/raw audio/\`: Raw meeting audio recordings.
- \`proposals/\`: Draft contracts.
- \`resources/\`: Allocation spreadsheets.`
    },
    {
      id: "def-1",
      name: "client-info/Client_General_Advisory_Profile.pdf",
      type: "pdf",
      size: 512000,
      description: "General client profile and intake records",
      uploadedBy: "Lim Fang Yee",
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      content: "SIMULATED_PDF_GEN",
    },
    {
      id: "def-2",
      name: "resources/Financial_Assessment_Q1.xlsx",
      type: "xlsx",
      size: 78500,
      description: "Asset distribution assessment spreadsheet",
      uploadedBy: "Lim Fang Yee",
      uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      content: "SIMULATED_XLSX_GEN",
    },
    {
      id: "def-3",
      name: "meeting/summary/Kickoff_Meeting_Minutes.md",
      type: "md",
      size: 950,
      description: "Initial consultation kickoff notes",
      uploadedBy: "Lim Fang Yee",
      uploadedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      content: `# Kickoff Meeting Minutes
**Date:** June 10, 2026

## Discussion
Established relationship parameters, client risk tolerance, and advisory objectives.

## Actions
- Set up regular monthly planning check-ins.`,
    },
    {
      id: "def-raw",
      name: "meeting/raw audio/15-minutes-of-silence.mp3",
      type: "mp3",
      size: 936272,
      description: "Raw meeting recording (silence)",
      uploadedBy: "Lim Fang Yee",
      uploadedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      fileUrl: "/15-minutes-of-silence.mp3",
      content: "",
    },
    {
      id: "def-chat",
      name: "conversation history/Initial_Consultation_Chat_Transcript.md",
      type: "md",
      size: 820,
      description: "Initial client chat transcript",
      uploadedBy: "Lim Fang Yee",
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      content: `# Consultation Chat Transcript
- **Bruce (Advisor)**: Welcome to your wealth advisory workspace.
- **Client**: Thank you. I want to organize my assets and see transition plans.
- **Bruce (Advisor)**: Perfect. I have set up files for you in the client-info, meeting, and resources folders.`
    },
    {
      id: "def-proposal",
      name: "proposals/General_Advisory_Agreement_Draft.docx",
      type: "docx",
      size: 256000,
      description: "Standard advisory services agreement draft",
      uploadedBy: "Lim Fang Yee",
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      content: "SIMULATED_DOCX_GEN",
    }
  ];
};

const toHash = (str) => {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) {
    h = Math.imul(31, h) + (str || "").charCodeAt(i) | 0;
  }
  return Math.abs(h).toString(16).padStart(7, "0").substring(0, 7);
};

const getClientMilestones = (displayId) => {
  const cleanId = displayId ? displayId.toLowerCase() : "";
  if (cleanId.includes("acme") || cleanId.includes("amcord")) {
    return [
      { id: 1, date: "2026-05-28", label: "Client Onboarded",       type: "start",    color: "#2563eb", description: "Advisory relationship established. Risk profile assessed: Moderate-Conservative. Focus area: Estate Planning & Business Succession." },
      { id: 2, date: "2026-06-10", label: "Initial Consultation",   type: "meeting",  color: "#0FBF3E", description: "First meeting with AMCORD board. Estate planning and shareholder protection needs clearly identified." },
      { id: 3, date: "2026-06-14", label: "Document Review",        type: "document", color: "#d97706", description: "Corporate profile and intake notes reviewed. Shareholder protection identified as primary advisory focus." },
      { id: 4, date: "2026-06-18", label: "Advisory Session",       type: "meeting",  color: "#2563eb", description: "Second meeting with legal counsel. Key decisions made on revocable trust structure and capital gains tax strategy." },
      { id: 5, date: "2026-06-18", label: "Follow-Up Sent",         type: "comms",    color: "#d97706", description: "WhatsApp follow-up after estate planning discussion. Client requested a simplified summary before the next session." },
      { id: 6, date: "2026-06-21", label: "Proposal Prep",          type: "proposal", color: "#2563eb", description: "Preparing simplified estate planning proposal — covering will structure, trust setup, and business succession in plain language." },
      { id: 7, date: "2026-06-21", label: "TaxCorp Advisory Joined",type: "partner",  color: "#0FBF3E", description: "TaxCorp Advisory onboarded as tax consultant partner for the AMCORD estate planning engagement. They will advise on tax-efficient trust structures and capital gains planning." },
      { id: 8, date: "2026-06-25", label: "Follow-Up Scheduled",    type: "upcoming", color: "#6b7280", description: "Planned: Send WhatsApp summary and gauge readiness for a deeper estate planning discussion session." },
    ];
  } else if (cleanId.includes("globex")) {
    return [
      { id: 1, date: "2026-05-10", label: "Client Onboarded",   type: "start",    color: "#2563eb", description: "Globex Holdings onboarded. Complex offshore asset protection trust identified as the primary advisory structure." },
      { id: 2, date: "2026-05-18", label: "Trust Deed Review",  type: "document", color: "#d97706", description: "Irrevocable Asset Protection Trust deed analyzed. Foreign holding disclosure requirements flagged for compliance." },
      { id: 3, date: "2026-06-01", label: "Compliance Brief",   type: "document", color: "#d97706", description: "Regulatory compliance brief prepared covering global tax treaty obligations and international disclosure requirements." },
      { id: 4, date: "2026-06-12", label: "Offshore Meeting",   type: "meeting",  color: "#0FBF3E", description: "Offshore structures discussion. Reviewed compliance and tax implications of global asset holdings under the family trust." },
      { id: 5, date: "2026-06-20", label: "Portfolio Review",   type: "proposal", color: "#2563eb", description: "Q2 asset allocation spreadsheet finalized. Milestone distribution amendment drafted and prepared for board review." },
      { id: 6, date: "2026-06-30", label: "Board Approval",     type: "upcoming", color: "#6b7280", description: "Planned: Board approval of succession protocol and final asset distribution amendment resolution." },
    ];
  } else if (cleanId.includes("smith")) {
    return [
      { id: 1, date: "2026-05-05", label: "Client Onboarded",      type: "start",    color: "#2563eb", description: "Smith family estate planning engagement commenced. Will writing and executor designation identified as priorities." },
      { id: 2, date: "2026-06-10", label: "Executor Consultation",  type: "meeting",  color: "#0FBF3E", description: "Initial consultation on will structure and executor designation. Alternate executor nominated by client." },
      { id: 3, date: "2026-06-15", label: "Asset Inventory",        type: "document", color: "#d97706", description: "Family asset inventory reviewed. Primary residence, liquid savings, and account details documented securely." },
      { id: 4, date: "2026-06-19", label: "Will Review",            type: "meeting",  color: "#2563eb", description: "Final will review meeting. Asset allocation confirmed. Guardian spelling correction noted before signing." },
      { id: 5, date: "2026-06-25", label: "Notary Appointment",     type: "upcoming", color: "#6b7280", description: "Planned: Schedule notary appointment for official will signing and legal execution." },
    ];
  } else if (cleanId.includes("wayne")) {
    return [
      { id: 1, date: "2026-04-20", label: "Engagement Start",      type: "start",    color: "#2563eb", description: "Wayne Enterprises succession planning engagement initiated. Security clearance Level 4 required for all documents." },
      { id: 2, date: "2026-05-05", label: "Leadership Assessment",  type: "document", color: "#d97706", description: "Key man insurance requirements assessed. Leadership transition pathways documented and reviewed by advisor." },
      { id: 3, date: "2026-05-20", label: "Board Consultation",     type: "meeting",  color: "#0FBF3E", description: "Board governance alignment session. Critical succession gaps identified and prioritized for resolution." },
      { id: 4, date: "2026-06-15", label: "Succession Meeting",     type: "meeting",  color: "#2563eb", description: "Formal succession planning meeting. Action plan finalized: key-man insurance evaluation to be completed by Q3 2026." },
      { id: 5, date: "2026-06-18", label: "Buyout Draft",           type: "proposal", color: "#d97706", description: "Emergency buyout agreement draft completed. Contingency bylaws reviewed with legal counsel and board." },
      { id: 6, date: "2026-06-30", label: "Board Approval",         type: "upcoming", color: "#6b7280", description: "Planned: Board approval for succession protocol and finalization of key-man insurance policy." },
    ];
  }
  return [
    { id: 1, date: "2026-05-15", label: "Client Onboarded",  type: "start",    color: "#2563eb", description: "Advisory relationship established. Initial profiling and risk assessment completed." },
    { id: 2, date: "2026-06-01", label: "Kickoff Meeting",   type: "meeting",  color: "#0FBF3E", description: "Initial consultation. Advisory objectives, risk tolerance, and planning scope established." },
    { id: 3, date: "2026-06-10", label: "Document Upload",   type: "document", color: "#d97706", description: "Client profile and initial assessment documents uploaded and reviewed." },
    { id: 4, date: "2026-06-20", label: "Proposal Ready",    type: "proposal", color: "#2563eb", description: "First advisory proposal drafted and prepared for client review." },
    { id: 5, date: "2026-06-30", label: "Review Scheduled",  type: "upcoming", color: "#6b7280", description: "Planned: Client review of advisory proposal and next steps planning." },
  ];
};

const getContactData = (displayId) => {
  const cleanId = displayId ? displayId.toLowerCase() : "";
  if (cleanId.includes("acme") || cleanId.includes("amcord")) {
    return {
      clientName: "AMCORD Sdn. Bhd.",
      contactPerson: "Ahmad (Director)",
      phone: "60123456789",
      tag: "Estate Planning",
      aiDraft: `Hi Ahmad, following our estate planning discussion on 18 June, I've prepared a brief summary on how estate planning can safeguard both your family and AMCORD's business continuity.\n\nThe summary covers:\n• What estate planning is and why it matters for company directors\n• How it protects your family and the company if a key person is absent\n• Simple steps to get started — will, trust, and succession planning\n\nWould you prefer I send it over WhatsApp, or would you like to schedule a short call to walk through it together?\n\nLooking forward to hearing from you.`,
      aiReasoning: "Ahmad confirmed interest in estate planning but asked for a simpler explanation before committing to the next session. This message is intentionally brief and non-pushy — it previews the summary topics so he knows what to expect, and offers two comfortable paths forward (WhatsApp or call) to reduce friction for the next interaction.",
    };
  } else if (cleanId.includes("globex")) {
    return {
      clientName: "Globex Holdings",
      contactPerson: "Board Representative",
      phone: "60112345678",
      tag: "Trust Structure",
      aiDraft: `Hi, I wanted to follow up on the offshore trust structure we reviewed on 12 June.\n\nI have confirmed the reporting requirements under the relevant global tax treaties, and the asset valuation of your international holdings is on track for Q4.\n\nI'd like to schedule a short alignment call before the board approval to make sure everything is in order. Would next week work for you?\n\nPlease let me know a convenient time.`,
      aiReasoning: "The last session confirmed compliance requirements and set Q4 as the asset valuation deadline. This follow-up references those specifics to show continuity, proposes a pre-board call to create a clear next milestone, and closes with a low-friction ask (just pick a time).",
    };
  } else if (cleanId.includes("smith")) {
    return {
      clientName: "Smith Family",
      contactPerson: "John Smith",
      phone: "60198765432",
      tag: "Will & Estate",
      aiDraft: `Hi John, just a quick follow-up on the will review we completed on 19 June.\n\nThe final document is ready — we just need to schedule the notary appointment to make it official. The process takes about 30 minutes.\n\nPlease let me know when you and your spouse are available and I will arrange everything from there.\n\nThank you for your trust throughout this process.`,
      aiReasoning: "The will review is complete and the only remaining action is the notary appointment. This message is warm, short, and action-oriented — it minimises what the client needs to do (just confirm a time) and the advisor handles the rest, removing all barriers to closure.",
    };
  } else if (cleanId.includes("wayne")) {
    return {
      clientName: "Wayne Enterprises",
      contactPerson: "Lucius Fox",
      phone: "60187654321",
      tag: "Succession Planning",
      aiDraft: `Hi Lucius, I wanted to touch base ahead of the board approval session at end of June.\n\nThe emergency buyout agreement draft and succession protocol are both ready for board review. The key-man insurance evaluation summary has also been uploaded to the repository.\n\nPlease confirm the board meeting date so I can prepare the final presentation materials.\n\nLooking forward to bringing this to closure.`,
      aiReasoning: "All deliverables are done — the only gate is board approval. This message proactively hands over completed items and asks for a single piece of information (meeting date), positioning the advisor as fully prepared and efficient ahead of the final sign-off.",
    };
  }
  return {
    clientName: displayId,
    contactPerson: "Client Contact",
    phone: "60100000000",
    tag: "Advisory",
    aiDraft: `Hi, I wanted to follow up on our recent advisory discussion.\n\nI have prepared materials for your review and would love to walk you through our next steps together.\n\nPlease let me know your availability and I will arrange accordingly.\n\nThank you for your continued trust.`,
    aiReasoning: "A general follow-up to maintain advisory momentum. It invites a next step without over-specifying details, keeping the conversation open at any engagement stage.",
  };
};

const CLIENT_META = {
  "AcmeCorp/estate-plan": {
    description: "Corporate estate planning and shareholder succession advisory for AMCORD Sdn. Bhd. Focused on protecting family interests and business continuity.",
    topics: ["estate-planning", "corporate", "succession", "will-trust", "shareholder-protection"],
    risk: "Moderate-Conservative", stage: "Warm Prospect", lastContact: "18 Jun 2026", relationshipScore: 74,
    portfolioAlloc: [{ label: "Estate / Trust", pct: 55, color: "#7c3aed" }, { label: "Insurance", pct: 25, color: "#2563eb" }, { label: "Cash", pct: 20, color: "#6b7280" }],
  },
  "Globex/wealth-trust": {
    description: "Irrevocable wealth trust and cross-border asset protection for Globex Holdings. Covers offshore compliance and tax-efficient distributions.",
    topics: ["wealth-trust", "offshore", "asset-protection", "compliance", "tax-optimisation"],
    risk: "Moderate", stage: "Active", lastContact: "12 Jun 2026", relationshipScore: 88,
    portfolioAlloc: [{ label: "Trust / Fixed Income", pct: 60, color: "#7c3aed" }, { label: "Equity", pct: 30, color: "#2563eb" }, { label: "Alternatives", pct: 10, color: "#d97706" }],
  },
  "SmithFamily/will-draft": {
    description: "Last will & testament drafting, executor designation, and testamentary trust planning for the Smith family estate.",
    topics: ["will-drafting", "estate-planning", "executor", "testamentary-trust", "family"],
    risk: "Conservative", stage: "Active", lastContact: "14 Jun 2026", relationshipScore: 81,
    portfolioAlloc: [{ label: "Estate / Property", pct: 50, color: "#7c3aed" }, { label: "Fixed Deposits", pct: 30, color: "#0FBF3E" }, { label: "Insurance", pct: 20, color: "#2563eb" }],
  },
  "WayneEnterprises/succession": {
    description: "Multi-generational succession planning and family office governance for Wayne Enterprises. Covers board transition and philanthropic mandates.",
    topics: ["succession", "family-office", "governance", "philanthropy", "corporate"],
    risk: "Moderate-Aggressive", stage: "Active", lastContact: "10 Jun 2026", relationshipScore: 92,
    portfolioAlloc: [{ label: "Corporate Equity", pct: 45, color: "#2563eb" }, { label: "Real Estate", pct: 30, color: "#d97706" }, { label: "Philanthropy Fund", pct: 25, color: "#0FBF3E" }],
  },
  "LimWeiMing/retirement-plan": {
    description: "Retirement income planning for a senior executive aiming to exit corporate life before 55. Focused on capital preservation and passive income.",
    topics: ["retirement", "passive-income", "capital-preservation", "annuity", "FIRE-adjacent"],
    risk: "Moderate", stage: "Active", lastContact: "15 Jun 2026", relationshipScore: 77,
    portfolioAlloc: [{ label: "Fixed Income / EPF", pct: 50, color: "#0FBF3E" }, { label: "Balanced Fund", pct: 30, color: "#2563eb" }, { label: "Annuity", pct: 20, color: "#d97706" }],
  },
  "SarahTan/portfolio-growth": {
    description: "Aggressive growth portfolio for a tech entrepreneur post-liquidity event. Strategic equity deployment and tax optimisation.",
    topics: ["growth-investing", "equity", "tax-optimisation", "entrepreneurial", "business-planning"],
    risk: "Aggressive", stage: "Active", lastContact: "17 Jun 2026", relationshipScore: 85,
    portfolioAlloc: [{ label: "Equity / ETF", pct: 65, color: "#2563eb" }, { label: "Private Equity", pct: 20, color: "#7c3aed" }, { label: "Cash Reserve", pct: 15, color: "#6b7280" }],
  },
  "AhmadRazif/education-trust": {
    description: "Shariah-compliant education trust and capital-preservation plan for a government servant with three children approaching university age.",
    topics: ["education-fund", "halal-investing", "sukuk", "capital-preservation", "critical-illness"],
    risk: "Conservative", stage: "Active", lastContact: "11 Jun 2026", relationshipScore: 79,
    portfolioAlloc: [{ label: "Sukuk / Fixed Income", pct: 55, color: "#0FBF3E" }, { label: "Education Fund", pct: 30, color: "#2563eb" }, { label: "Takaful", pct: 15, color: "#d97706" }],
  },
  "JenniferKoh/family-estate": {
    description: "Balanced growth and estate planning for a dual-income single mother. Children's trust fund alongside business income management.",
    topics: ["estate-planning", "balanced-portfolio", "unit-trusts", "childrens-trust", "dual-income"],
    risk: "Moderate-Aggressive", stage: "Active", lastContact: "16 Jun 2026", relationshipScore: 83,
    portfolioAlloc: [{ label: "Unit Trusts", pct: 40, color: "#2563eb" }, { label: "Children Trust", pct: 30, color: "#7c3aed" }, { label: "Insurance", pct: 30, color: "#0FBF3E" }],
  },
  "DavidNg/fire-strategy": {
    description: "FIRE movement strategy for a young banking professional — low-maintenance ETF/index portfolio, property financing, and aggressive savings discipline.",
    topics: ["FIRE", "ETF", "index-fund", "property-financing", "debt-management"],
    risk: "Aggressive", stage: "Active", lastContact: "19 Jun 2026", relationshipScore: 90,
    portfolioAlloc: [{ label: "ETF / Index", pct: 70, color: "#2563eb" }, { label: "Property", pct: 20, color: "#d97706" }, { label: "Emergency Fund", pct: 10, color: "#6b7280" }],
  },
  "RosnahYusof/income-plan": {
    description: "Conservative income plan for a widow managing inherited joint assets. Guaranteed income products, Tabung Haji, and Hibah estate distribution.",
    topics: ["fixed-income", "tabung-haji", "hibah", "estate-distribution", "income-generation"],
    risk: "Conservative", stage: "Nurture", lastContact: "13 Jun 2026", relationshipScore: 68,
    portfolioAlloc: [{ label: "Fixed Deposits", pct: 45, color: "#0FBF3E" }, { label: "Tabung Haji", pct: 35, color: "#d97706" }, { label: "Hibah / Estate", pct: 20, color: "#7c3aed" }],
  },
};

const RISK_COLOR = { "Conservative": "#0FBF3E", "Moderate-Conservative": "#d97706", "Moderate": "#2563eb", "Moderate-Aggressive": "#7c3aed", "Aggressive": "#dc2626" };
const STAGE_COLOR = { "Active": { bg: "#ecfdf5", text: "#0FBF3E" }, "Warm Prospect": { bg: "#fffbeb", text: "#d97706" }, "Nurture": { bg: "#eff6ff", text: "#2563eb" } };

export default function ClientRepo() {
  const router = useRouter();
  const { id, tab } = router.query;
  const displayId = id ? id.replace(/_/g, "/") : "Loading...";
  const [activeTab, setActiveTab] = useState("info");

  // Sync activeTab with URL query parameter
  useEffect(() => {
    if (tab && (tab === "info" || tab === "partners" || tab === "photo")) {
      setActiveTab(tab);
    }
  }, [tab]);
  const [hoveredMilestone, setHoveredMilestone] = useState(null);
  const [contactMessage, setContactMessage] = useState("");
  const [contactMsgCopied, setContactMsgCopied] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  // ── REPO FILE BROWSER STATE ──
  const [advisoryFiles, setAdvisoryFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [repoUploadMode, setRepoUploadMode] = useState("list"); // 'list', 'upload', 'create'
  const [repoDragOver, setRepoDragOver] = useState(false);
  const [repoUploadError, setRepoUploadError] = useState("");
  const [commitTitle, setCommitTitle] = useState("");
  const [commitDesc, setCommitDesc] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [repoUploading, setRepoUploading] = useState(false);
  const [repoUploadProgress, setRepoUploadProgress] = useState(0);
  const [stagedFile, setStagedFile] = useState(null);
  const [stagedFileContent, setStagedFileContent] = useState("");
  const [stagedFileUrl, setStagedFileUrl] = useState("");
  const repoFileInputRef = useRef(null);

  // Preview options
  const [previewTab, setPreviewTab] = useState("rendered"); // 'rendered', 'code'
  const [docPreviewTab, setDocPreviewTab] = useState("rendered");
  const [audioPreviewTab, setAudioPreviewTab] = useState("rendered");
  const [saveDocModalOpen, setSaveDocModalOpen] = useState(false);
  const [saveAudioModalOpen, setSaveAudioModalOpen] = useState(false);
  const [saveFileName, setSaveFileName] = useState("");
  const [saveCommitTitle, setSaveCommitTitle] = useState("");
  const [saveCommitDesc, setSaveCommitDesc] = useState("");

  // ── CUSTOM REPO INTERACTION STATES ──
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isUploadRecordingOpen, setIsUploadRecordingOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);

  // Recording Modal States
  const [recordingFile, setRecordingFile] = useState(null);
  const [recordingDesc, setRecordingDesc] = useState("");
  const [recordingUploadProgress, setRecordingUploadProgress] = useState(0);
  const [recordingUploading, setRecordingUploading] = useState(false);
  const [recordingError, setRecordingError] = useState("");

  // Expense Modal States
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseReceiptFile, setExpenseReceiptFile] = useState(null);
  const [expenseReceiptDataUrl, setExpenseReceiptDataUrl] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [expenseError, setExpenseError] = useState("");

  // Meeting Room Preview States
  const [meetingMicOn, setMeetingMicOn] = useState(true);
  const [meetingCamOn, setMeetingCamOn] = useState(true);
  const [meetingJoined, setMeetingJoined] = useState(false);
  const [selectedMicDevice, setSelectedMicDevice] = useState("MacBook Audio (Internal Mic)");
  const [selectedSpeakerDevice, setSelectedSpeakerDevice] = useState("MacBook Audio (Internal Speaker)");
  const [selectedCamDevice, setSelectedCamDevice] = useState("MacBook Audio (FaceTime HD Camera)");
  const [meetingStream, setMeetingStream] = useState(null);

  const meetingVideoRef = useRef(null);

  // Webcam stream hook
  useEffect(() => {
    let activeStream = null;
    async function startCamera() {
      if (activeTab === "meeting-room" && meetingCamOn && !meetingJoined) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: meetingMicOn
          });
          activeStream = stream;
          setMeetingStream(stream);
          if (meetingVideoRef.current) {
            meetingVideoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.warn("Could not access camera/mic stream, using fallback:", err);
          setMeetingStream(null);
        }
      } else {
        if (meetingStream) {
          meetingStream.getTracks().forEach(track => track.stop());
          setMeetingStream(null);
        }
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeTab, meetingCamOn, meetingJoined]);

  useEffect(() => {
    if (meetingStream) {
      const audioTracks = meetingStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = meetingMicOn;
      });
    }
  }, [meetingMicOn, meetingStream]);

  const handleUploadRecordingSubmit = (e) => {
    e.preventDefault();
    if (!recordingFile) {
      setRecordingError("Please choose a file.");
      return;
    }
    setRecordingUploading(true);
    setRecordingUploadProgress(30);

    const interval = setInterval(() => {
      setRecordingUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    const reader = new FileReader();
    reader.onload = (evt) => {
      clearInterval(interval);
      setRecordingUploadProgress(100);

      const fileExt = recordingFile.name.split('.').pop().toLowerCase();
      const destName = `meeting/raw audio/${recordingFile.name}`;
      const newFile = {
        id: Date.now().toString(),
        name: destName,
        type: fileExt,
        size: recordingFile.size,
        description: recordingDesc.trim() || `Raw recording: ${recordingFile.name}`,
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date().toISOString(),
        content: "",
        fileUrl: evt.target.result,
      };

      const updated = [newFile, ...advisoryFiles];
      saveFiles(updated);

      setRecordingUploading(false);
      setRecordingFile(null);
      setRecordingDesc("");
      setIsUploadRecordingOpen(false);
      setRecordingUploadProgress(0);
    };
    reader.readAsDataURL(recordingFile);
  };

  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expenseAmount.trim()) {
      setExpenseError("Please enter an amount.");
      return;
    }

    setExpenseSaving(true);
    setExpenseError("");

    const processSave = (receiptDataUrl = "", receiptFileName = "") => {
      const amountNum = parseFloat(expenseAmount).toFixed(2);
      const destName = receiptFileName ? `expenses/Receipt_${receiptFileName}` : `expenses/Expense_RM${amountNum}_${Date.now()}.txt`;
      const fileExt = receiptFileName ? receiptFileName.split('.').pop().toLowerCase() : "txt";
      
      const newFile = {
        id: Date.now().toString(),
        name: destName,
        type: fileExt,
        size: expenseReceiptFile ? expenseReceiptFile.size : 100,
        description: `RM ${amountNum} - ${expenseDesc.trim() || "Expense receipt"}`,
        uploadedBy: "Lim Fang Yee",
        uploadedAt: new Date().toISOString(),
        content: `Expense Amount: RM ${amountNum}\nDescription: ${expenseDesc.trim()}\nReceipt: ${receiptFileName || "None"}`,
        fileUrl: receiptDataUrl || "",
      };

      const updated = [newFile, ...advisoryFiles];
      saveFiles(updated);

      setExpenseSaving(false);
      setExpenseAmount("");
      setExpenseReceiptFile(null);
      setExpenseReceiptDataUrl("");
      setExpenseDesc("");
      setIsAddExpenseOpen(false);
    };

    if (expenseReceiptFile) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        processSave(evt.target.result, expenseReceiptFile.name);
      };
      reader.readAsDataURL(expenseReceiptFile);
    } else {
      processSave("", "");
    }
  };

  useEffect(() => {
    if (!displayId || displayId === "Loading...") return;
    const clientKey = encodeURIComponent(displayId);
    fetch(`/api/clients/${clientKey}/files`)
      .then((r) => r.json())
      .then(({ files, source }) => {
        if (source === "stored" && files && files.length > 0) {
          setAdvisoryFiles(files);
        } else {
          const def = getDefaultAdvisoryFiles(displayId);
          setAdvisoryFiles(def);
          // Bootstrap the server store with defaults so future edits persist
          fetch(`/api/clients/${clientKey}/files`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ files: def }),
          }).catch(() => {});
        }
      })
      .catch(() => {
        // Network error — fall back to defaults without blocking the UI
        setAdvisoryFiles(getDefaultAdvisoryFiles(displayId));
      });
  }, [displayId]);

  useEffect(() => {
    if (!displayId || displayId === "Loading...") return;
    setContactMessage(getContactData(displayId).aiDraft);
  }, [displayId]);

  const saveFiles = (newFiles) => {
    setAdvisoryFiles(newFiles);
    const clientKey = encodeURIComponent(displayId);
    fetch(`/api/clients/${clientKey}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: newFiles }),
    }).catch(() => {});
  };

  const formatAge = (isoString) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const triggerDownload = (file) => {
    let url = "";
    let name = file.name;
    
    if (file.fileUrl) {
      url = file.fileUrl;
    } else {
      let blob;
      if (file.type === "xlsx" || file.type === "xls") {
        const csvContent = "Category,Value,Notes\n" +
          "Net Valuation,$12500000,Corporate Assets\n" +
          "Transfer Share,45%,To Family Trust\n" +
          "Estate Tax Rate,40%,\n" +
          "Estimated Liability,$2250000,Before mitigation\n";
        blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        name = file.name.replace(/\.xlsx?$/, ".csv");
      } else {
        const textContent = `CONFIDENTIAL ADVISORY DOCUMENT\n` +
          `File Name: ${file.name}\n` +
          `Description: ${file.description}\n\n` +
          `This is a mock advisory file representing the wealth management files for ${displayId}.\n`;
        blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" });
      }
      url = URL.createObjectURL(blob);
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!file.fileUrl) {
      URL.revokeObjectURL(url);
    }
  };

  const openInNewTab = (file) => {
    if (file.fileUrl) {
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`<iframe src="${file.fileUrl}" style="width:100%; height:100%; border:none;"></iframe>`);
        newTab.document.close();
      }
    } else {
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 40px; background: #f6f8fa; color: #24292f; }
                .container { max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid #d0d7de; border-radius: 6px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                h1 { border-bottom: 1px solid #d0d7de; padding-bottom: 8px; font-size: 24px; margin-top: 0; }
                p { line-height: 1.6; }
                .meta { color: #57606a; font-size: 13px; margin-bottom: 24px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>${file.name}</h1>
                <div class="meta">Mock Advisory Document · Size: ${formatSize(file.size)}</div>
                <p><strong>Description:</strong> ${file.description}</p>
                <p>This is a simulated advisory file preloaded for the client repository. You can download the text or CSV version directly from the file explorer.</p>
              </div>
            </body>
          </html>
        `);
        newTab.document.close();
      }
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    const cleanText = text.replace(/\r/g, "");
    const lines = cleanText.split("\n");
    const elements = [];
    let inList = false;
    let listItems = [];
    let inNumList = false;
    let numListItems = [];
    let inCode = false;
    let codeLines = [];
    let inTable = false;
    let tableRows = [];
    
    const parseInline = (inlineText) => {
      if (!inlineText) return "";
      const inlineElements = [];
      let remainingText = inlineText;
      const regex = /(\*\*.*?\*\*|~~.*?~~|\*(?!\*)[^*\n]+\*|_(?!_)[^_\n]+_|`.*?`|\[.*?\]\(.*?\))/g;
      let match;
      let lastIndex = 0;
      let idx = 0;

      while ((match = regex.exec(remainingText)) !== null) {
        const matchText = match[0];
        const matchIndex = match.index;

        if (matchIndex > lastIndex) {
          inlineElements.push(remainingText.substring(lastIndex, matchIndex));
        }

        if (matchText.startsWith("**")) {
          const content = matchText.substring(2, matchText.length - 2);
          inlineElements.push(<strong key={idx++}>{content}</strong>);
        } else if (matchText.startsWith("~~")) {
          const content = matchText.substring(2, matchText.length - 2);
          inlineElements.push(<del key={idx++} style={{ color: "#6b7280" }}>{content}</del>);
        } else if (matchText.startsWith("*") || matchText.startsWith("_")) {
          const content = matchText.substring(1, matchText.length - 1);
          inlineElements.push(<em key={idx++}>{content}</em>);
        } else if (matchText.startsWith("`")) {
          const content = matchText.substring(1, matchText.length - 1);
          inlineElements.push(<code key={idx++} className="inline-code">{content}</code>);
        } else if (matchText.startsWith("[")) {
          const linkText = matchText.substring(1, matchText.indexOf("]"));
          const linkUrl = matchText.substring(matchText.indexOf("(") + 1, matchText.length - 1);
          inlineElements.push(<a key={idx++} href={linkUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>{linkText}</a>);
        }

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < remainingText.length) {
        inlineElements.push(remainingText.substring(lastIndex));
      }

      return inlineElements.length > 0 ? inlineElements : inlineText;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith("```")) {
        if (inCode) {
          elements.push(
            <pre key={`code-${i}`} className="preview-raw-code-block">
              <code>{codeLines.join("\n")}</code>
            </pre>
          );
          inCode = false;
          codeLines = [];
        } else {
          inCode = true;
        }
        continue;
      }
      
      if (inCode) {
        codeLines.push(line);
        continue;
      }

      const isTableLine = line.trim().startsWith("|") && line.trim().endsWith("|");
      if (isTableLine) {
        if (inList) {
          elements.push(<ul key={`ul-${i}`} className="preview-ul">{listItems}</ul>);
          inList = false;
          listItems = [];
        }
        if (inNumList) {
          elements.push(<ol key={`ol-${i}`} className="preview-ol">{numListItems}</ol>);
          inNumList = false;
          numListItems = [];
        }
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        const cells = line.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const isSeparator = cells.every(c => /^[:\-\s]+$/.test(c));
        if (!isSeparator) {
          tableRows.push(cells);
        }
        continue;
      } else {
        if (inTable) {
          elements.push(
            <table key={`table-${i}`} className="markdown-body-table">
              <thead>
                <tr>
                  {tableRows[0]?.map((cell, cIdx) => (
                    <th key={cIdx}>{parseInline(cell)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>{parseInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
          inTable = false;
          tableRows = [];
        }
      }
      
      const isBullet = line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ") || line.startsWith("•\t");
      const isNumbered = /^\d+\.\s+/.test(line);

      if (inList && !isBullet) {
        elements.push(<ul key={`ul-${i}`} className="preview-ul">{listItems}</ul>);
        inList = false;
        listItems = [];
      }
      if (inNumList && !isNumbered) {
        elements.push(<ol key={`ol-${i}`} className="preview-ol">{numListItems}</ol>);
        inNumList = false;
        numListItems = [];
      }

      if (isBullet) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        const content = line.replace(/^[-*•]\s*/, "");
        if (content.startsWith("[ ] ")) {
          listItems.push(
            <li key={`li-${i}`} style={{ listStyleType: "none", display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
              <input type="checkbox" disabled style={{ cursor: "default", margin: 0 }} />
              <span>{parseInline(content.substring(4))}</span>
            </li>
          );
        } else if (content.startsWith("[x] ")) {
          listItems.push(
            <li key={`li-${i}`} style={{ listStyleType: "none", display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
              <input type="checkbox" checked disabled style={{ cursor: "default", margin: 0 }} />
              <span style={{ textDecoration: "line-through", color: "#57606a" }}>{parseInline(content.substring(4))}</span>
            </li>
          );
        } else {
          listItems.push(<li key={`li-${i}`}>{parseInline(content)}</li>);
        }
        continue;
      }

      if (isNumbered) {
        if (!inNumList) {
          inNumList = true;
          numListItems = [];
        }
        const content = line.replace(/^\d+\.\s*/, "");
        numListItems.push(<li key={`li-${i}`}>{parseInline(content)}</li>);
        continue;
      }
      
      if (line === "---" || line === "___" || line === "***") {
        elements.push(<hr key={`hr-${i}`} className="preview-hr" />);
        continue;
      }
      
      if (line.startsWith("# ")) {
        elements.push(<h1 key={`h1-${i}`} className="preview-h1">{parseInline(line.substring(2))}</h1>);
        continue;
      }
      if (line.startsWith("## ")) {
        elements.push(<h2 key={`h2-${i}`} className="preview-h2">{parseInline(line.substring(3))}</h2>);
        continue;
      }
      if (line.startsWith("#### ")) {
        elements.push(<h4 key={`h4-${i}`} className="preview-h4">{parseInline(line.substring(5))}</h4>);
        continue;
      }
      if (line.startsWith("### ")) {
        elements.push(<h3 key={`h3-${i}`} className="preview-h3">{parseInline(line.substring(4))}</h3>);
        continue;
      }
      
      if (line.startsWith("> ")) {
        let quoteLines = [];
        let j = i;
        while (j < lines.length && lines[j].startsWith("> ")) {
          quoteLines.push(lines[j].substring(2).trim());
          j++;
        }
        i = j - 1; // Advance outer loop counter

        const firstLine = quoteLines[0] || "";
        let isAlert = false;
        let alertType = "";
        let alertTitle = "";
        let alertBg = "";
        let alertBorder = "";
        let alertColor = "";

        if (firstLine.startsWith("[!NOTE]")) {
          isAlert = true;
          alertType = "note";
          alertTitle = "💡 Note";
          alertBg = "#ddf4ff";
          alertBorder = "#0969da";
          alertColor = "#0550ae";
          quoteLines[0] = firstLine.substring(7).trim();
        } else if (firstLine.startsWith("[!IMPORTANT]")) {
          isAlert = true;
          alertType = "important";
          alertTitle = "💜 Important";
          alertBg = "#fbe8ff";
          alertBorder = "#8250df";
          alertColor = "#6e3ba7";
          quoteLines[0] = firstLine.substring(12).trim();
        } else if (firstLine.startsWith("[!WARNING]")) {
          isAlert = true;
          alertType = "warning";
          alertTitle = "⚠️ Warning";
          alertBg = "#fff8c5";
          alertBorder = "#9a6700";
          alertColor = "#765a00";
          quoteLines[0] = firstLine.substring(10).trim();
        }

        if (isAlert) {
          elements.push(
            <div key={`alert-${i}`} className={`markdown-alert alert-${alertType}`} style={{
              padding: "12px 16px",
              background: alertBg,
              borderLeft: `4px solid ${alertBorder}`,
              borderRadius: "6px",
              marginBottom: "16px",
              color: alertColor,
              fontSize: "14px",
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{alertTitle}</div>
              {quoteLines.filter(l => l !== "").map((l, idx) => (
                <div key={idx}>{parseInline(l)}</div>
              ))}
            </div>
          );
        } else {
          elements.push(
            <blockquote key={`bq-${i}`} className="preview-blockquote">
              {quoteLines.map((l, idx) => <p key={idx} className="preview-p" style={{ margin: "4px 0" }}>{parseInline(l)}</p>)}
            </blockquote>
          );
        }
        continue;
      }
      
      if (line.trim() === "") {
        elements.push(<div key={`empty-${i}`} className="preview-empty-line"></div>);
        continue;
      }
      
      elements.push(<p key={`p-${i}`} className="preview-p">{parseInline(line)}</p>);
    }
    
    if (inList) {
      elements.push(<ul key={`ul-end`} className="preview-ul">{listItems}</ul>);
    }
    if (inNumList) {
      elements.push(<ol key={`ol-end`} className="preview-ol">{numListItems}</ol>);
    }
    if (inTable) {
      elements.push(
        <table key={`table-end`} className="markdown-body-table">
          <thead>
            <tr>
              {tableRows[0]?.map((cell, cIdx) => (
                <th key={cIdx}>{parseInline(cell)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx}>{parseInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    
    return elements;
  };

  const renderFilePreview = (file) => {
    const fileType = file.type?.toLowerCase();
    
    if (fileType === "md" || fileType === "markdown" || fileType === "txt") {
      if (previewTab === "code") {
        const lines = file.content?.split("\n") || [];
        return (
          <div className="preview-code-box">
            <div className="line-numbers">
              {lines.map((_, i) => <div key={i} className="ln">{i + 1}</div>)}
            </div>
            <pre className="code-content">{file.content}</pre>
          </div>
        );
      } else {
        return <div className="preview-rendered-md">{renderMarkdown(file.content)}</div>;
      }
    }

    if (fileType === "mp3" || fileType === "wav" || fileType === "m4a" || fileType === "ogg") {
      return (
        <div className="audio-preview-container" style={{
          padding: "48px 24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f6f8fa",
        }}>
          <div className="audio-preview-card" style={{
            width: "100%",
            maxWidth: "520px",
            background: "#ffffff",
            border: `1px solid #d0d7de`,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            overflow: "hidden"
          }}>
            <div className="card-top-gradient" style={{
              height: "10px",
              background: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
            }} />
            <div className="card-body" style={{
              padding: "32px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px"
            }}>
              <div className="card-icon-wrapper" style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
              }}>
                🎵
              </div>
              
              <div className="card-details">
                <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: "600", color: "#24292f", wordBreak: "break-all" }}>
                  {file.displayName || file.name.split("/").pop()}
                </h3>
                <div style={{ display: "inline-flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                  <span className="file-badge" style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#57606a",
                    background: "#eaeef2",
                    padding: "2px 8px",
                    borderRadius: "12px"
                  }}>
                    Audio Recording
                  </span>
                  <span className="file-size-dot" style={{ color: "#d0d7de" }}>•</span>
                  <span style={{ fontSize: "13px", color: "#57606a" }}>
                    {formatSize(file.size)}
                  </span>
                </div>
                <p style={{ margin: "12px 0 0 0", fontSize: "13px", color: "#57606a", lineHeight: "1.5" }}>
                  {file.description || "No description provided."}
                </p>
              </div>

              <div className="audio-player-wrapper" style={{ width: "100%", marginTop: "8px" }}>
                <audio 
                  src={file.fileUrl || "/15-minutes-of-silence.mp3"} 
                  controls 
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              </div>

              <div className="card-divider" style={{ width: "100%", height: "1px", background: "#d0d7de", margin: "4px 0" }} />

              <div className="card-actions" style={{
                display: "flex",
                gap: "12px",
                width: "100%",
                justifyContent: "center"
              }}>
                <button className="btn-primary" style={{
                  flex: "1",
                  padding: "10px 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 1px 0 rgba(27,31,36,0.1)"
                }} onClick={() => triggerDownload(file)}>
                  <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
                    <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5c.138 0 .25-.112.25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"></path>
                    <path d="M7.25 1.25v8.536L4.97 7.507a.749.749 0 0 0-1.275.326.749.749 0 0 0 .215.734l3.52 3.52a.749.749 0 0 0 1.06 0l3.52-3.52a.749.749 0 0 0-.513-1.28.749.749 0 0 0-.547.22L8.75 9.786V1.25a.75.75 0 0 0-1.5 0Z"></path>
                  </svg>
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    let icon = "📄";
    let typeLabel = "Document File";
    let bgGradient = "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)";
    let borderTheme = "#90caf9";
    
    if (fileType === "xlsx" || fileType === "xls") {
      icon = "📊";
      typeLabel = "Excel Spreadsheet";
      bgGradient = "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)";
      borderTheme = "#81c784";
    } else if (fileType === "pdf") {
      icon = "📕";
      typeLabel = "PDF Document";
      bgGradient = "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)";
      borderTheme = "#e57373";
    } else if (fileType === "docx" || fileType === "doc") {
      icon = "📘";
      typeLabel = "Word Document";
      bgGradient = "linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)";
      borderTheme = "#4fc3f7";
    } else if (fileType === "pptx" || fileType === "ppt") {
      icon = "📙";
      typeLabel = "Powerpoint Presentation";
      bgGradient = "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)";
      borderTheme = "#ffb74d";
    }

    return (
      <div className="others-file-card-container" style={{
        padding: "48px 24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f6f8fa",
      }}>
        <div className="others-file-card" style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          border: `1px solid ${borderTheme}`,
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transition: "transform 0.2s"
        }}>
          <div className="card-top-gradient" style={{
            height: "10px",
            background: bgGradient
          }} />
          <div className="card-body" style={{
            padding: "32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px"
          }}>
            <div className="card-icon-wrapper" style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: bgGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
            }}>
              {icon}
            </div>
            
            <div className="card-details">
              <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: "600", color: "#24292f", wordBreak: "break-all" }}>
                {file.name}
              </h3>
              <div style={{ display: "inline-flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                <span className="file-badge" style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#57606a",
                  background: "#eaeef2",
                  padding: "2px 8px",
                  borderRadius: "12px"
                }}>
                  {typeLabel}
                </span>
                <span className="file-size-dot" style={{ color: "#d0d7de" }}>•</span>
                <span style={{ fontSize: "13px", color: "#57606a" }}>
                  {formatSize(file.size)}
                </span>
              </div>
              <p style={{ margin: "16px 0 0 0", fontSize: "13px", color: "#57606a", lineHeight: "1.5" }}>
                {file.description || "No description provided."}
              </p>
            </div>

            <div className="card-divider" style={{ width: "100%", height: "1px", background: "#d0d7de", margin: "8px 0" }} />

            <div className="card-actions" style={{
              display: "flex",
              gap: "12px",
              width: "100%",
              justifyContent: "center"
            }}>
              <button className="btn-primary" style={{
                flex: "1",
                padding: "10px 16px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
                boxShadow: "0 1px 0 rgba(27,31,36,0.1)"
              }} onClick={() => triggerDownload(file)}>
                <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
                  <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5c.138 0 .25-.112.25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"></path>
                  <path d="M7.25 1.25v8.536L4.97 7.507a.749.749 0 0 0-1.275.326.749.749 0 0 0 .215.734l3.52 3.52a.749.749 0 0 0 1.06 0l3.52-3.52a.749.749 0 0 0-.513-1.28.749.749 0 0 0-.547.22L8.75 9.786V1.25a.75.75 0 0 0-1.5 0Z"></path>
                </svg>
                Download File
              </button>
              <button className="btn-secondary" style={{
                flex: "1",
                padding: "10px 16px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600"
              }} onClick={() => openInNewTab(file)}>
                👁 Open in New Tab
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── GOOGLE MAPS STATE ──
  const mapsLoaded = useMapsLoaded();

  // Selangor stops — real addresses in Selangor, Malaysia
  const stops = [
    {
      id: 1,
      label: "Stop 1",
      name: "Ara Damansara Medical Centre",
      address: "Jalan Lapangan Terbang Subang, Ara Damansara, 47820 Petaling Jaya, Selangor",
      lat: 3.1132,
      lng: 101.5744,
      color: "#2563eb",
    },
    {
      id: 2,
      label: "Stop 2",
      name: "IOI City Mall",
      address: "IOI Resort City, 62502 Putrajaya, Selangor",
      lat: 2.9723,
      lng: 101.7229,
      color: "#0FBF3E",
    },
    {
      id: 3,
      label: "Stop 3",
      name: "Shah Alam Convention Centre (SACC)",
      address: "Persiaran Perbandaran, Seksyen 14, 40000 Shah Alam, Selangor",
      lat: 3.0778,
      lng: 101.5183,
      color: "#d97706",
    },
  ];

  // Advisor starting point (Kuala Lumpur City Centre)
  const advisorOrigin = {
    name: "Advisor Office (KLCC)",
    address: "Kuala Lumpur City Centre, 50088 Kuala Lumpur",
    lat: 3.1578,
    lng: 101.7123,
  };

  const [directionsResult, setDirectionsResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [selectedStop, setSelectedStop] = useState(null);
  const mapRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const mapCenter = { lat: 3.0738, lng: 101.6010 };

  const handleShowRoute = useCallback(() => {
    if (!mapsLoaded) return;
    setRouteLoading(true);
    setRouteError("");
    const directionsService = new window.google.maps.DirectionsService();
    const waypoints = stops.slice(0, 2).map(s => ({
      location: { lat: s.lat, lng: s.lng },
      stopover: true,
    }));
    directionsService.route(
      {
        origin: { lat: advisorOrigin.lat, lng: advisorOrigin.lng },
        destination: { lat: stops[2].lat, lng: stops[2].lng },
        waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setRouteLoading(false);
        if (status === "OK") {
          setDirectionsResult(result);
        } else {
          setRouteError(`Could not get directions: ${status}`);
        }
      }
    );
  }, [mapsLoaded]);

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
    handleShowRoute();
  };

  // ── RECEIPT / PHOTO UPLOAD (local browser state — no database) ──
  const [receipts, setReceipts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only images (JPG, PNG, WebP, GIF) and PDF are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be under 10 MB.");
      return;
    }
    setUploading(true);
    setUploadError("");
    setUploadProgress(30);

    // Use FileReader to get a local preview URL (no server/database needed)
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadProgress(90);
      const newReceipt = {
        id: Date.now().toString(),
        file_name: file.name,
        file_url: e.target.result,   // base64 data URL for preview
        file_type: file.type,
        file_size: file.size,
        created_at: new Date().toISOString(),
      };
      setReceipts((prev) => [newReceipt, ...prev]);
      setUploadProgress(100);
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 600);
    };
    reader.onerror = () => {
      setUploadError("Failed to read file. Please try again.");
      setUploading(false);
      setUploadProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadFile(file);
  };

  const handleDeleteReceipt = (receipt) => {
    if (!confirm(`Delete "${receipt.file_name}"?`)) return;
    setReceipts((prev) => prev.filter((r) => r.id !== receipt.id));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Mock data for partners
  const [partners, setPartners] = useState([
    { id: 1, name: "TaxCorp Advisory", role: "Tax Consultant" },
  ]);
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState("");

  const handleAddPartner = (e) => {
    e.preventDefault();
    if (!newPartnerName.trim()) return;
    setPartners([
      ...partners,
      { id: Date.now(), name: newPartnerName, role: "Partner" },
    ]);
    setNewPartnerName("");
    setIsAddingPartner(false);
  };

  const repoToClientId = {
    "005511_LimWeiMing": "005511",
    "005512_SarahTan": "005512",
    "005513_AhmadRazif": "005513",
    "005514_JenniferKoh": "005514",
    "005515_DavidNg": "005515",
    "005516_RosnahYusof": "005516"
  };
  const matchedClientId = repoToClientId[id] || "005511";

  // ── DOCUMENTS TAB STATE ──
  const docInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const [docDragOver, setDocDragOver] = useState(false);
  const [docParsing, setDocParsing] = useState(false);
  const [docResult, setDocResult] = useState(null);
  const [docError, setDocError] = useState("");
  const [docCopied, setDocCopied] = useState(false);
  const [docAiQuestion, setDocAiQuestion] = useState("");
  const [docAiReply, setDocAiReply] = useState("");
  const [docAiLoading, setDocAiLoading] = useState(false);

  const [audioDragOver, setAudioDragOver] = useState(false);
  const [audioTranscribing, setAudioTranscribing] = useState(false);
  const [audioResult, setAudioResult] = useState(null);
  const [audioError, setAudioError] = useState("");
  const [audioCopied, setAudioCopied] = useState(false);
  const [audioAiQuestion, setAudioAiQuestion] = useState("");
  const [audioAiReply, setAudioAiReply] = useState("");
  const [audioAiLoading, setAudioAiLoading] = useState(false);

  const handleParseDoc = async (file) => {
    if (!file) return;
    if (!/\.(pdf|docx?|pptx?|xlsx?|txt|md|markdown|html?)$/i.test(file.name)) {
      setDocError("Unsupported file type. Supported: PDF, DOCX, PPTX, XLSX, TXT, MD, HTML");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setDocError("File must be under 50 MB.");
      return;
    }
    setDocParsing(true);
    setDocError("");
    setDocResult(null);
    setDocAiReply("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/parse-document", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) setDocError(data.error || "Failed to parse document");
      else setDocResult(data);
    } catch {
      setDocError("Network error. Please try again.");
    } finally {
      setDocParsing(false);
    }
  };

  const handleTranscribeAudio = async (file) => {
    if (!file) return;
    if (!/\.(mp3|wav|m4a|ogg|webm|aac|flac)$/i.test(file.name)) {
      setAudioError("Unsupported format. Use MP3, WAV, M4A, OGG, WEBM, AAC, or FLAC.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setAudioError("Audio file must be under 15 MB.");
      return;
    }
    setAudioTranscribing(true);
    setAudioError("");
    setAudioResult(null);
    setAudioAiReply("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/transcribe-audio", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) setAudioError(data.error || "Failed to transcribe audio");
      else setAudioResult(data);
    } catch {
      setAudioError("Network error. Please try again.");
    } finally {
      setAudioTranscribing(false);
    }
  };

  const handleDocAskAI = async (e) => {
    e.preventDefault();
    if (!docAiQuestion.trim() || !docResult) return;
    setDocAiLoading(true);
    setDocAiReply("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Document context (${docResult.filename}):\n\n${docResult.markdown}\n\n---\n\nAdvisor question: ${docAiQuestion}`,
          history: [],
        }),
      });
      const data = await res.json();
      setDocAiReply(data.reply || "No response from AI.");
    } catch {
      setDocAiReply("Network error. Please try again.");
    } finally {
      setDocAiLoading(false);
    }
  };

  const handleAudioAskAI = async (e) => {
    e.preventDefault();
    if (!audioAiQuestion.trim() || !audioResult) return;
    setAudioAiLoading(true);
    setAudioAiReply("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Audio transcript context (${audioResult.filename}):\n\n${audioResult.transcript}\n\n---\n\nAdvisor question: ${audioAiQuestion}`,
          history: [],
        }),
      });
      const data = await res.json();
      setAudioAiReply(data.reply || "No response from AI.");
    } catch {
      setAudioAiReply("Network error. Please try again.");
    } finally {
      setAudioAiLoading(false);
    }
  };

  // ── REPO FILE BROWSER HANDLERS ──
  const handleDeleteRepoFolder = (fullFolderName) => {
    if (!confirm(`Are you sure you want to delete folder "${fullFolderName}" and all its contents?`)) return;
    const prefix = fullFolderName + "/";
    const filtered = advisoryFiles.filter(f => !f.name.startsWith(prefix));
    saveFiles(filtered);
    if (selectedFile?.name.startsWith(prefix)) {
      setSelectedFile(null);
    }
  };

  const handleDeleteRepoFile = (fileId, fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    const filtered = advisoryFiles.filter(f => f.id !== fileId);
    saveFiles(filtered);
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const handleSelectUploadFile = async (file) => {
    if (!file) return;
    const allowedExtensions = /\.(pdf|docx?|pptx?|xlsx?|txt|md|markdown|html?|mp3|wav|m4a|ogg)$/i;
    if (!allowedExtensions.test(file.name)) {
      setRepoUploadError("Unsupported file type. Supported: PDF, DOCX, PPTX, XLSX, TXT, MD, HTML, MP3, WAV, M4A, OGG");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setRepoUploadError("File must be under 50 MB.");
      return;
    }
    setRepoUploadError("");
    setStagedFile(file);
    setCommitTitle(`Add ${file.name}`);
    setCommitDesc(`Uploaded ${file.name} for advisory review`);

    // Parse the file contents using existing API
    setRepoUploading(true);
    setRepoUploadProgress(30);

    // Also read the file as Data URL so the advisor can open/download the original file exactly
    const reader = new FileReader();
    reader.onload = (evt) => {
      setStagedFileUrl(evt.target.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setRepoUploadProgress(50);
      const res = await fetch("/api/parse-document", { method: "POST", body: formData });
      setRepoUploadProgress(85);
      const data = await res.json();
      if (res.ok && data.markdown) {
        setStagedFileContent(data.markdown);
      } else {
        console.warn("Parse API returned warning or no markdown:", data.error);
        if (/\.(txt|md|markdown)$/i.test(file.name)) {
          const readerText = new FileReader();
          readerText.onload = (evt) => {
            setStagedFileContent(evt.target.result);
          };
          readerText.readAsText(file);
        } else {
          if (/\.xlsx?$/i.test(file.name)) {
            setStagedFileContent("SIMULATED_XLSX_GEN");
          } else if (/\.docx?$/i.test(file.name)) {
            setStagedFileContent("SIMULATED_DOCX_GEN");
          } else if (/\.(mp3|wav|m4a|ogg)$/i.test(file.name)) {
            setStagedFileContent("AUDIO_RECORD_FILE");
          } else {
            setStagedFileContent("SIMULATED_PDF_GEN");
          }
        }
      }
      setRepoUploadProgress(100);
    } catch (err) {
      console.error("Parse API failed, reading locally or simulating", err);
      if (/\.(txt|md|markdown)$/i.test(file.name)) {
        const readerText = new FileReader();
        readerText.onload = (evt) => {
          setStagedFileContent(evt.target.result);
        };
        readerText.readAsText(file);
      } else {
        if (/\.xlsx?$/i.test(file.name)) {
          setStagedFileContent("SIMULATED_XLSX_GEN");
        } else if (/\.docx?$/i.test(file.name)) {
          setStagedFileContent("SIMULATED_DOCX_GEN");
        } else {
          setStagedFileContent("SIMULATED_PDF_GEN");
        }
      }
      setRepoUploadProgress(100);
    } finally {
      setRepoUploading(false);
      setTimeout(() => setRepoUploadProgress(0), 600);
    }
  };

  const handleCommitRepoUpload = (e) => {
    e.preventDefault();
    if (!stagedFile) return;

    const fileExt = stagedFile.name.split('.').pop().toLowerCase();
    const destName = currentPath ? `${currentPath}/${stagedFile.name}` : stagedFile.name;
    const newFile = {
      id: Date.now().toString(),
      name: destName,
      type: fileExt,
      size: stagedFile.size,
      description: commitDesc.trim() || `Uploaded ${stagedFile.name}`,
      uploadedBy: "Lim Fang Yee",
      uploadedAt: new Date().toISOString(),
      content: stagedFileContent,
      fileUrl: stagedFileUrl,
    };

    const updated = [newFile, ...advisoryFiles];
    saveFiles(updated);
    
    // Reset staged variables
    setStagedFile(null);
    setStagedFileContent("");
    setStagedFileUrl("");
    setCommitTitle("");
    setCommitDesc("");
    setRepoUploadMode("list");
  };

  const handleCreateNewFileCommit = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      setRepoUploadError("Please provide a file name.");
      return;
    }
    const cleanName = newFileName.trim();
    if (!/\.(md|markdown|txt)$/i.test(cleanName)) {
      setRepoUploadError("Please create text files with .md, .markdown, or .txt extension.");
      return;
    }

    const fileExt = cleanName.split('.').pop().toLowerCase();
    const destName = currentPath ? `${currentPath}/${cleanName}` : cleanName;
    const fileUrl = "data:text/markdown;charset=utf-8," + encodeURIComponent(newFileContent);
    const newFile = {
      id: Date.now().toString(),
      name: destName,
      type: fileExt,
      size: new Blob([newFileContent]).size,
      description: commitDesc.trim() || `Created ${cleanName} via editor`,
      uploadedBy: "Lim Fang Yee",
      uploadedAt: new Date().toISOString(),
      content: newFileContent,
      fileUrl: fileUrl,
    };

    const updated = [newFile, ...advisoryFiles];
    saveFiles(updated);

    // Reset state
    setNewFileName("");
    setNewFileContent("");
    setCommitTitle("");
    setCommitDesc("");
    setRepoUploadMode("list");
  };

  return (
    <div className="repo-root">
      <Head>
        <title>{displayId} — Client Repository</title>
      </Head>

      {/* ── TOP HEADER / BREADCRUMBS ── */}
      <header className="repo-header">
        <div className="header-container">
          <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap", fontSize: 14, gap: 0, minWidth: 0 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#2563eb", textDecoration: "none", padding: "4px 6px", borderRadius: 6, flexShrink: 0, fontSize: 14, fontWeight: 400 }}>
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor" style={{ display: "inline", flexShrink: 0 }}>
                <path d="M11.28 3.22a.75.75 0 0 0-1.06 0L5.47 7.97a.75.75 0 0 0 0 1.06l4.75 4.75a.75.75 0 0 0 1.06-1.06L7.06 8l4.22-4.22a.75.75 0 0 0 0-1.06Z"></path>
              </svg>
              Dashboard
            </Link>
            <span style={{ color: "#909692", margin: "0 4px", fontSize: 18, fontWeight: 300, lineHeight: 1 }}>/</span>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#2563eb", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayId}</span>
            <span style={{ fontSize: 11, color: "#909692", border: "1px solid #d0d7de", borderRadius: "2em", padding: "1px 7px", fontWeight: 500, marginLeft: 8, flexShrink: 0, lineHeight: "18px" }}>Public</span>
          </div>
          <div className="repo-actions">
            {/* Watch split button */}
            <div className="action-split-btn">
              <button className="split-main">
                <svg aria-hidden="true" height="14" viewBox="0 0 16 16" width="14" fill="currentColor"><path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"/></svg>
                Watch
                <svg aria-hidden="true" height="12" viewBox="0 0 16 16" width="12" fill="currentColor" style={{ marginLeft: 2, color: "#909692" }}><path d="M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"/></svg>
              </button>
              <span className="split-count">1</span>
            </div>
            {/* Fork split button */}
            <div className="action-split-btn">
              <button className="split-main">
                <svg aria-hidden="true" height="14" viewBox="0 0 16 16" width="14" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>
                Fork
                <svg aria-hidden="true" height="12" viewBox="0 0 16 16" width="12" fill="currentColor" style={{ marginLeft: 2, color: "#909692" }}><path d="M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"/></svg>
              </button>
              <span className="split-count">0</span>
            </div>
            {/* Star split button */}
            <div className="action-split-btn">
              <button className="split-main">
                <svg aria-hidden="true" height="14" viewBox="0 0 16 16" width="14" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
                Star
                <svg aria-hidden="true" height="12" viewBox="0 0 16 16" width="12" fill="currentColor" style={{ marginLeft: 2, color: "#909692" }}><path d="M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"/></svg>
              </button>
              <span className="split-count">4</span>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <nav className="repo-tabs" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <ul className="tab-list">
            <li>
              <button 
                className={`tab-item ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm6.5-.25A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>
                Info
              </button>
            </li>
            <li>
              <button
                className={`tab-item ${activeTab === "partners" ? "active" : ""}`}
                onClick={() => setActiveTab("partners")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"></path></svg>
                Partners
              </button>
            </li>
            <li>
              <button
                className={`tab-item ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M1.643 3.143.427 1.927A.25.25 0 0 0 0 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 0 0 .177-.427L2.715 4.215a6.5 6.5 0 1 1-1.18 4.458.75.75 0 1 0-1.493.154 8.001 8.001 0 1 0 1.6-5.684ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z"></path></svg>
                History
              </button>
            </li>
            <li>
              <button
                className={`tab-item ${activeTab === "insights" ? "active" : ""}`}
                onClick={() => setActiveTab("insights")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L9 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"></path></svg>
                Insights
              </button>
            </li>
            <li>
              <button
                className={`tab-item ${activeTab === "contact" ? "active" : ""}`}
                onClick={() => setActiveTab("contact")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 13H8.061l-2.574 2.573A1.457 1.457 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25Z"></path></svg>
                Contact
              </button>
            </li>
          </ul>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

            {/* ── NOTIFICATION BELL ── */}
            {(() => {
              const audioNotis = advisoryFiles
                .filter(f => ["mp3", "wav", "m4a", "ogg"].includes((f.type || "").toLowerCase()))
.map(f => ({
                  id: f.id,
                  icon: "🎵",
                  title: "Meeting recording added",
                  question: "Run AI transcription?",
                  fileName: (f.name || "").split("/").pop(),
                  time: f.uploadedAt,
                }));
              const unread = audioNotis.length;
              return (
                <div className="noti-wrapper">
                  <button
                    className="tab-add-btn"
                    onClick={() => setNotiOpen(o => !o)}
                    title="Notifications"
                    style={{ position: "relative" }}
                  >
                    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
                      <path d="M8 16a2 2 0 0 0 1.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 0 0 8 16ZM3 5a5 5 0 0 1 10 0v2.947c0 .05.015.098.042.139l1.703 2.555A1.519 1.519 0 0 1 13.482 13H2.518a1.516 1.516 0 0 1-1.263-2.36l1.703-2.554A.255.255 0 0 0 3 7.947Zm5-3.5A3.5 3.5 0 0 0 4.5 5v2.947c0 .346-.102.683-.294.97l-1.703 2.556a.017.017 0 0 0-.003.01l.001.006c0 .002.002.004.004.006l.006.004.007.001h10.964l.007-.001.006-.004.004-.006.001-.007a.017.017 0 0 0-.003-.01l-1.703-2.554a1.745 1.745 0 0 1-.294-.97V5A3.5 3.5 0 0 0 8 1.5Z"></path>
                    </svg>
                    {unread > 0 && (
                      <span className="noti-badge">{unread > 9 ? "9+" : unread}</span>
                    )}
                  </button>

                  {notiOpen && (
                    <>
                      <div className="dropdown-overlay" onClick={() => setNotiOpen(false)} />
                      <div className="noti-dropdown">
                        <div className="noti-panel-header">
                          <span>Notifications</span>
                          {unread > 0 && <span className="noti-new-badge">{unread} new</span>}
                        </div>
                        {audioNotis.length === 0 ? (
                          <div className="noti-empty">
                            <svg height="24" viewBox="0 0 16 16" width="24" fill="#d0d7de" style={{marginBottom: 8}}><path d="M8 16a2 2 0 0 0 1.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 0 0 8 16ZM3 5a5 5 0 0 1 10 0v2.947c0 .05.015.098.042.139l1.703 2.555A1.519 1.519 0 0 1 13.482 13H2.518a1.516 1.516 0 0 1-1.263-2.36l1.703-2.554A.255.255 0 0 0 3 7.947Z"/></svg>
                            No new notifications
                          </div>
                        ) : (
                          audioNotis.map(noti => (
                            <div key={noti.id} className="noti-item">
                              <div className="noti-item-icon">{noti.icon}</div>
                              <div className="noti-item-body">
                                <div className="noti-item-title">{noti.title}</div>
                                <div className="noti-item-question">{noti.question}</div>
                                <div className="noti-item-file">{noti.fileName}</div>
                                <div className="noti-item-time">{formatAge(noti.time)}</div>
                                <div className="noti-item-actions">
                                  <button
                                    className="noti-run-btn"
                                    onClick={() => { setActiveTab("documents"); setNotiOpen(false); }}
                                  >
                                    Analyse →
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* ── ADD DROPDOWN ── */}
            <div className="add-action-wrapper" style={{ position: "relative" }}>
            <button
              className="tab-add-btn"
              onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
              title="Add options"
            >
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
                <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path>
              </svg>
            </button>

            {isAddDropdownOpen && (
              <>
                <div className="dropdown-overlay" onClick={() => setIsAddDropdownOpen(false)} />
                <ul className="add-dropdown-menu">
                  <li>
                    <button onClick={() => { setActiveTab("meeting-room"); setIsAddDropdownOpen(false); }}>
                      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M1.75 1h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 13H1.75A1.75 1.75 0 0 1 0 11.25v-8.5C0 1.784.784 1 1.75 1ZM1.5 2.75v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25ZM6.5 5.5v3a.5.5 0 0 0 .75.433l2.5-1.5a.5.5 0 0 0 0-.866l-2.5-1.5a.5.5 0 0 0-.75.433Z"></path></svg>
                      Create Meeting
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setIsUploadRecordingOpen(true); setIsAddDropdownOpen(false); }}>
                      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M11.75 6.5a.75.75 0 0 1 .75.75v1.25a4.5 4.5 0 0 1-4 4.475v1.275h2a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1 0-1.5h2v-1.275a4.5 4.5 0 0 1-4-4.475V7.25a.75.75 0 0 1 1.5 0v1.25a3 3 0 0 0 6 0V7.25a.75.75 0 0 1 .75-.75ZM8 1.5a2.5 2.5 0 0 0-2.5 2.5v3.5a2.5 2.5 0 0 0 5 0V4a2.5 2.5 0 0 0-2.5-2.5Z"></path></svg>
                      Upload Recording
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setIsAddExpenseOpen(true); setIsAddDropdownOpen(false); }}>
                      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M1.75 1.5h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15.5H1.75A1.75 1.75 0 0 1 0 13.75V3.25C0 2.284.784 1.5 1.75 1.5ZM1.5 3.25v2.25h13V3.25a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25ZM1.5 7v6.75c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V7Zm7.25 1.5h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1 0-1.5Zm0 3h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1 0-1.5ZM3.25 8h2.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-3.5A.75.75 0 0 1 3.25 8Z"></path></svg>
                      Add Expense
                    </button>
                  </li>
                </ul>
              </>
            )}
            </div>
          </div>
        </nav>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="repo-content">
        <div className="content-container">
          
          {/* TAB 1: INFO */}
          {activeTab === "info" && (
            <div className="tab-pane info-tab">
              {/* Ref for file input */}
              <input
                ref={repoFileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.md,.markdown,.html,.htm,.mp3,.wav,.m4a,.ogg"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSelectUploadFile(f); e.target.value = ""; }}
              />

              {/* 1. FILE PREVIEW VIEW */}
              {selectedFile ? (
                <div className="repo-preview-container">
                  <div className="repo-preview-header">
                    <div className="preview-breadcrumbs">
                      <button className="breadcrumb-link-btn" onClick={() => setSelectedFile(null)}>{displayId}</button>
                      <span className="repo-slash">/</span>
                      <span className="preview-filename">{selectedFile.name}</span>
                    </div>
                    <div className="preview-meta-actions">
                      <span className="preview-size-tag">{formatSize(selectedFile.size)}</span>
                      
                      {/* Formats toggle for text/markdown */}
                      {/\.(md|markdown|txt)$/i.test(selectedFile.name) && (
                        <div className="preview-format-toggle">
                          <button
                            className={`toggle-btn ${previewTab === "rendered" ? "active" : ""}`}
                            onClick={() => setPreviewTab("rendered")}
                          >
                            Preview
                          </button>
                          <button
                            className={`toggle-btn ${previewTab === "code" ? "active" : ""}`}
                            onClick={() => setPreviewTab("code")}
                          >
                            Code
                          </button>
                        </div>
                      )}

                      <button className="btn-secondary btn-small" onClick={() => {
                        navigator.clipboard?.writeText(selectedFile.content || "");
                        alert("File content copied to clipboard!");
                      }}>
                        Copy
                      </button>
                      
                      <button className="btn-secondary btn-small btn-danger" onClick={() => handleDeleteRepoFile(selectedFile.id, selectedFile.name)}>
                        Delete
                      </button>

                      <button className="btn-secondary btn-small" onClick={() => setSelectedFile(null)}>
                        ✕ Close
                      </button>
                    </div>
                  </div>
                  <div className="repo-preview-body">
                    {renderFilePreview(selectedFile)}
                  </div>
                </div>
              ) : (
                <>
                  {/* 2. FILE UPLOADER VIEW */}
                  {repoUploadMode === "upload" && (
                    <div className="repo-upload-container">
                      <div className="upload-header-bar">
                        <h3>Upload files to {displayId}</h3>
                        <button className="close-upload-btn" onClick={() => { setRepoUploadMode("list"); setStagedFile(null); setRepoUploadError(""); }}>✕</button>
                      </div>

                      <div
                        className={`repo-dragzone ${repoDragOver ? "dz--over" : ""} ${repoUploading ? "dz--uploading" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setRepoDragOver(true); }}
                        onDragLeave={() => setRepoDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setRepoDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleSelectUploadFile(f); }}
                        onClick={() => !repoUploading && repoFileInputRef.current?.click()}
                      >
                        {repoUploading ? (
                          <div className="dz-uploading-state">
                            <div className="doc-spinner doc-spinner-blue"></div>
                            <p className="dz-label">Parsing document & creating preview…</p>
                            {repoUploadProgress > 0 && (
                              <div className="dz-progress-bar" style={{width: 200, height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden', marginTop: 8}}>
                                <div className="dz-progress-fill" style={{ width: `${repoUploadProgress}%`, height: '100%', background: '#0FBF3E' }}></div>
                              </div>
                            )}
                          </div>
                        ) : stagedFile ? (
                          <div className="dz-staged-state">
                            <div className="staged-icon-wrapper">
                              {/\.xlsx?$/i.test(stagedFile.name) ? (
                                <span className="staged-icon excel">📊</span>
                              ) : /\.pdf$/i.test(stagedFile.name) ? (
                                <span className="staged-icon pdf">📄</span>
                              ) : (
                                <span className="staged-icon doc">📝</span>
                              )}
                            </div>
                            <h4 className="staged-filename">{stagedFile.name}</h4>
                            <p className="staged-meta">{formatSize(stagedFile.size)} · Ready to commit</p>
                            <button className="btn-secondary btn-small" style={{marginTop: 8}} onClick={(e) => { e.stopPropagation(); setStagedFile(null); setStagedFileContent(""); }}>
                              Choose different file
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg height="40" viewBox="0 0 24 24" width="40" fill="currentColor" className="upload-dz-icon">
                              <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                            </svg>
                            <p className="dz-label">Drag files here to add them to your repository or <span className="dz-link">choose your files</span></p>
                            <p className="dz-hint">PDF · DOCX · PPTX · XLSX · TXT · MD · HTML · max 50 MB</p>
                          </>
                        )}
                      </div>

                      {repoUploadError && (
                        <div className="repo-error-banner">
                          ⚠️ {repoUploadError}
                          <button onClick={() => setRepoUploadError("")}>×</button>
                        </div>
                      )}

                      {/* Commit Form */}
                      <form className="repo-commit-form" onSubmit={handleCommitRepoUpload}>
                        <div className="commit-form-header">
                          <h4>Commit changes</h4>
                        </div>
                        <div className="commit-form-body">
                          <div className="form-group">
                            <label htmlFor="commit-title">Commit title</label>
                            <input
                              type="text"
                              id="commit-title"
                              className="form-input"
                              placeholder="e.g. Add estate roadmap worksheet"
                              value={commitTitle}
                              onChange={(e) => setCommitTitle(e.target.value)}
                              required
                              disabled={!stagedFile}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="commit-desc">Advisory Notes / Description</label>
                            <textarea
                              id="commit-desc"
                              className="form-input"
                              placeholder="e.g. Details about capital gains rollover strategy and trust holdings..."
                              value={commitDesc}
                              onChange={(e) => setCommitDesc(e.target.value)}
                              rows={3}
                              disabled={!stagedFile}
                            />
                          </div>

                          <div className="commit-options">
                            <label className="commit-radio-label">
                              <input type="radio" name="commit-branch" defaultChecked />
                              <span className="radio-circle"></span>
                              <span className="radio-text">
                                <strong>Commit directly to the <code className="branch-code">main</code> branch.</strong>
                              </span>
                            </label>
                          </div>

                          <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={!stagedFile || repoUploading}>
                              Commit changes
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => { setRepoUploadMode("list"); setStagedFile(null); setRepoUploadError(""); }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* 3. FILE CREATION VIEW */}
                  {repoUploadMode === "create" && (
                    <div className="repo-create-container">
                      <div className="upload-header-bar">
                        <h3>Create new file in {displayId}</h3>
                        <button className="close-upload-btn" onClick={() => { setRepoUploadMode("list"); setNewFileName(""); setNewFileContent(""); setRepoUploadError(""); }}>✕</button>
                      </div>

                      <div className="create-editor-box">
                        <div className="editor-path-bar">
                          <span className="editor-displayId">{displayId} /</span>
                          <input
                            type="text"
                            className="editor-filename-input"
                            placeholder="name-your-file.md"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            required
                          />
                        </div>
                        <textarea
                          className="editor-content-input"
                          placeholder="# Write your advisory transcript or notes in Markdown here..."
                          value={newFileContent}
                          onChange={(e) => setNewFileContent(e.target.value)}
                          rows={15}
                        />
                      </div>

                      {repoUploadError && (
                        <div className="repo-error-banner">
                          ⚠️ {repoUploadError}
                          <button onClick={() => setRepoUploadError("")}>×</button>
                        </div>
                      )}

                      {/* Commit Form for new file */}
                      <form className="repo-commit-form" onSubmit={handleCreateNewFileCommit}>
                        <div className="commit-form-header">
                          <h4>Commit changes</h4>
                        </div>
                        <div className="commit-form-body">
                          <div className="form-group">
                            <label htmlFor="create-commit-title">Commit title</label>
                            <input
                              type="text"
                              id="create-commit-title"
                              className="form-input"
                              placeholder="e.g. Create kickoff minutes"
                              value={newFileName ? `Create ${newFileName}` : "Create new file"}
                              readOnly
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="create-commit-desc">Advisory Notes / Description</label>
                            <textarea
                              id="create-commit-desc"
                              className="form-input"
                              placeholder="e.g. Initial customer alignments notes and next steps..."
                              value={commitDesc}
                              onChange={(e) => setCommitDesc(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <div className="commit-options">
                            <label className="commit-radio-label">
                              <input type="radio" name="commit-branch" defaultChecked />
                              <span className="radio-circle"></span>
                              <span className="radio-text">
                                <strong>Commit directly to the <code className="branch-code">main</code> branch.</strong>
                              </span>
                            </label>
                          </div>

                          <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={!newFileName.trim()}>
                              Commit new file
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => { setRepoUploadMode("list"); setNewFileName(""); setNewFileContent(""); setRepoUploadError(""); }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* 4. FILE LIST VIEW (DEFAULT EXPLORER) */}
                  {repoUploadMode === "list" && (
                    <div className="repo-explorer">
                      <div className="repo-actions-bar">
                        <div className="branch-and-path">
                          <button className="btn-secondary branch-btn">
                            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="#909692" style={{ marginRight: 6 }}>
                              <path d="M11.75 2.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-6 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm4.25 11.25H3.75v-1.5a.25.25 0 0 1 .25-.25h8a.25.25 0 0 1 .25.25v1.5ZM4.5 1.5a2.25 2.25 0 0 0-2.25 2.25v4.5A2.25 2.25 0 0 0 4.5 10.5h7a2.25 2.25 0 0 0 2.25-2.25v-4.5A2.25 2.25 0 0 0 11.5 1.5h-7Z" />
                            </svg>
                            <span>main</span>
                            <span className="dropdown-caret">▼</span>
                          </button>
                          <div className="repo-breadcrumbs" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <button className="breadcrumb-link-btn" style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "#2563eb", cursor: "pointer", fontWeight: 500 }} onClick={() => { setCurrentPath(""); setSelectedFile(null); }}>
                              {displayId}
                            </button>
                            {currentPath && currentPath.split("/").map((part, index, arr) => {
                              const pathUpToNow = arr.slice(0, index + 1).join("/");
                              return (
                                <span key={index} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <span className="repo-slash" style={{ color: "#57606a" }}>/</span>
                                  <button className="breadcrumb-link-btn" style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "#2563eb", cursor: "pointer", fontWeight: index === arr.length - 1 ? 600 : 500 }} onClick={() => { setCurrentPath(pathUpToNow); setSelectedFile(null); }}>
                                    {part}
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="repo-actions-right">
                          <button className="btn-secondary add-file-action-btn" onClick={() => {
                            setRepoUploadMode("upload");
                            setRepoUploadError("");
                          }}>
                            Upload files
                          </button>
                          <button className="btn-secondary add-file-action-btn" onClick={() => {
                            setRepoUploadMode("create");
                            setNewFileName("");
                            setNewFileContent("");
                            setRepoUploadError("");
                          }}>
                            Create new file
                          </button>
                        </div>
                      </div>

                      {/* Commit Banner */}
                      <div className="commit-header-banner">
                        <div className="commit-author-avatar">
                          {advisoryFiles[0]?.uploadedBy?.substring(0, 1).toUpperCase() || "A"}
                        </div>
                        <div className="commit-details">
                          <span className="commit-author-name">{advisoryFiles[0]?.uploadedBy || "advisor-bot"}</span>
                          <span className="commit-message">
                            {advisoryFiles[0]?.description || "Initialized wealth planning structure and advisory documents"}
                          </span>
                        </div>
                        <div className="commit-meta">
                          <span className="commit-hash">a7b8c2d</span>
                          <span className="commit-date">
                            {advisoryFiles[0] ? formatAge(advisoryFiles[0].uploadedAt) : "3 days ago"}
                          </span>
                        </div>
                      </div>

                      {/* Files Table */}
                      <div className="files-table-container">
                        <table className="files-table">
                          <thead>
                            <tr>
                              <th className="ft-th ft-th-name">Name</th>
                              <th className="ft-th ft-th-desc">Description</th>
                              <th className="ft-th ft-th-type">Type</th>
                              <th className="ft-th ft-th-updated">Updated</th>
                              <th className="ft-th ft-th-action"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* 1. Parent row if currentPath is not empty */}
                            {currentPath !== "" && (
                              <tr className="file-row parent-directory-row">
                                <td className="file-name-cell" colSpan="5">
                                  <span className="file-icon-wrapper" style={{ marginRight: 8, display: "inline-flex", alignItems: "center" }}>
                                    <svg className="file-icon folder-icon" height="16" viewBox="0 0 16 16" width="16" fill="#54aeff">
                                      <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2A1.75 1.75 0 0 0 5 1H1.75ZM1.5 2.75a.25.25 0 0 1 .25-.25H5c.18 0 .35.09.45.25l.9 1.2a1.75 1.75 0 0 0 1.4 1.8h5.5a.25.25 0 0 1 .25.25v8.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V2.75Z" />
                                    </svg>
                                  </span>
                                  <button className="file-name-link" style={{ fontWeight: "bold" }} onClick={() => {
                                    const parentPath = currentPath.includes("/") ? currentPath.substring(0, currentPath.lastIndexOf("/")) : "";
                                    setCurrentPath(parentPath);
                                    setSelectedFile(null);
                                  }}>
                                    ..
                                  </button>
                                  <span className="parent-directory-label" style={{ marginLeft: 8, color: "#57606a", fontSize: "12px" }}>
                                    Go to parent directory
                                  </span>
                                </td>
                              </tr>
                            )}

                            {/* 2. List items in current path */}
                            {(() => {
                              const items = getItemsInPath(advisoryFiles, currentPath);
                              
                              if (items.length === 0 && currentPath === "") {
                                return (
                                  <tr>
                                    <td colSpan="5" className="empty-files-slate">
                                      <svg aria-hidden="true" height="32" viewBox="0 0 24 24" version="1.1" width="32" fill="#909692">
                                        <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 8.75 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"/>
                                      </svg>
                                      <h4>This client repository is empty</h4>
                                      <p>Upload wealth planning worksheets, PDFs, or meeting minutes to this client's profile.</p>
                                      <button className="btn-primary" style={{marginTop: 12}} onClick={() => setRepoUploadMode("upload")}>Upload files</button>
                                    </td>
                                  </tr>
                                );
                              }

                              return items.map((item) => {
                                const isFolder = item.type === "folder";
                                const relativePath = currentPath ? `${currentPath}/${item.name}` : item.name;
                                
                                let icon = (
                                  <svg className="file-icon" height="16" viewBox="0 0 16 16" width="16" fill="#909692"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 8.75 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"/></svg>
                                );

                                if (isFolder) {
                                  icon = (
                                    <svg className="file-icon folder-icon" height="16" viewBox="0 0 16 16" width="16" fill="#54aeff">
                                      <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2A1.75 1.75 0 0 0 5 1H1.75ZM1.5 2.75a.25.25 0 0 1 .25-.25H5c.18 0 .35.09.45.25l.9 1.2a1.75 1.75 0 0 0 1.4 1.8h5.5a.25.25 0 0 1 .25.25v8.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V2.75Z" />
                                    </svg>
                                  );
                                } else if (item.type === "xlsx" || item.type === "xls") {
                                  icon = (
                                    <svg className="file-icon excel-icon" height="16" viewBox="0 0 16 16" width="16" fill="#0FBF3E"><path d="M1 1.75C1 .784 1.784 0 2.75 0h8.5c.966 0 1.75.784 1.75 1.75v12.5A1.75 1.75 0 0 1 11.25 16h-8.5A1.75 1.75 0 0 1 1 14.25V1.75ZM2.75 1.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5Z"/><path d="M4 4.75a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 4.75Zm0 3a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 7.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"/></svg>
                                  );
                                } else if (item.type === "pdf") {
                                  icon = (
                                    <svg className="file-icon pdf-icon" height="16" viewBox="0 0 16 16" width="16" fill="#d1242f"><path d="M2.75 0A1.75 1.75 0 0 0 1 1.75v12.5C1 15.216 1.784 16 2.75 16h10.5A1.75 1.75 0 0 0 15 14.25V4.664a1.75 1.75 0 0 0-.513-1.237L11.573.513A1.75 1.75 0 0 0 10.336 0H2.75ZM2.5 1.75a.25.25 0 0 1 .25-.25h7.5v2.75c0 .966.784 1.75 1.75 1.75h2.75v8.25a.25.25 0 0 1-.25.25H2.75a.25.25 0 0 1-.25-.25V1.75Zm10 2.5h-2.25a.25.25 0 0 1-.25-.25V1.75L12.5 4.25Z"/></svg>
                                  );
                                } else if (item.type === "md" || item.type === "markdown") {
                                  icon = (
                                    <svg className="file-icon md-icon" height="16" viewBox="0 0 16 16" width="16" fill="#2563eb"><path d="M1.75 1.5A1.75 1.75 0 0 0 0 3.25v9.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 16 12.75v-9.5A1.75 1.75 0 0 0 14.25 1.5H1.75ZM1.5 3.25a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v9.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25v-9.5Z"/><path d="M3.25 5h1.5a.75.75 0 0 1 .75.75v2.583L7 6.136a.75.75 0 0 1 .99 0l1.5 1.2.75-.6a.75.75 0 0 1 .25-.564V7.5a.75.75 0 0 1-1.5 0v-.673l-.6.48a.75.75 0 0 1-.99 0l-1.5-1.2-1.41 1.13A.75.75 0 0 1 4 7.5v-1.75a.75.75 0 0 1 .75-.75Z"/></svg>
                                  );
                                } else if (item.type === "mp3" || item.type === "wav" || item.type === "m4a" || item.type === "ogg") {
                                  icon = (
                                    <svg className="file-icon audio-icon" height="16" viewBox="0 0 16 16" width="16" fill="#8f34ab"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z"/><path d="M10.25 4.5a.75.75 0 0 0-.75.75v3.663a2.25 2.25 0 1 0 1.5 1.96V6h1.25a.75.75 0 0 0 0-1.5h-2Z"/></svg>
                                  );
                                }

                                return (
                                  <tr key={item.id} className="file-row">
                                    <td className="file-name-cell">
                                      <span className="file-icon-wrapper">{icon}</span>
                                      {isFolder ? (
                                        <button className="file-name-link" style={{ fontWeight: 500 }} onClick={() => {
                                          setCurrentPath(relativePath);
                                          setSelectedFile(null);
                                        }}>
                                          {item.name}
                                        </button>
                                      ) : (
                                        <button className="file-name-link" onClick={() => {
                                          setSelectedFile(item);
                                          setPreviewTab("rendered");
                                        }}>
                                          {item.displayName || item.name}
                                        </button>
                                      )}
                                    </td>
                                    <td className="file-desc-cell">
                                      <span className="file-desc-text">{item.description}</span>
                                    </td>
                                    <td className="file-type-cell">
                                      <span className={`file-type-badge ${isFolder ? "badge-folder" : item.type === "md" || item.type === "markdown" ? "badge-md" : item.type === "pdf" ? "badge-pdf" : item.type === "xlsx" || item.type === "xls" ? "badge-xlsx" : item.type === "mp3" || item.type === "wav" || item.type === "m4a" || item.type === "ogg" ? "badge-audio" : "badge-default"}`}>
                                        {isFolder ? "Folder" : (item.type || "file").toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="file-date-cell">
                                      <span className="file-date-text">{item.uploadedAt ? formatAge(item.uploadedAt) : ""}</span>
                                    </td>
                                    <td className="file-action-cell">
                                      {isFolder ? (
                                        <button className="file-action-btn delete-file-btn" title="Delete folder" onClick={() => handleDeleteRepoFolder(relativePath)}>
                                          <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15Z"/></svg>
                                        </button>
                                      ) : (
                                        <button className="file-action-btn delete-file-btn" title="Delete file" onClick={() => handleDeleteRepoFile(item.id, item.name)}>
                                          <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15Z"/></svg>
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>

                      {/* README rendering at bottom */}
                      {(() => {
                        const items = getItemsInPath(advisoryFiles, currentPath);
                        const currentFiles = items.filter(item => item.type !== "folder");
                        let primaryMarkdownFile = currentFiles.find(
                          (f) => {
                            const filename = f.displayName || f.name;
                            return filename.toLowerCase() === "readme.md";
                          }
                        );
                        if (!primaryMarkdownFile) {
                          primaryMarkdownFile = currentFiles.find(
                            (f) => f.type === "md" || f.type === "markdown" || (f.displayName || f.name).endsWith(".md")
                          );
                        }
                        if (!primaryMarkdownFile) return null;
                        return (
                          <div className="repo-readme-box" style={{ marginTop: 24 }}>
                            <div className="repo-readme-header" style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "12px 16px",
                              backgroundColor: "#f6f8fa",
                              border: "1px solid #d0d7de",
                              borderBottom: "none",
                              borderTopLeftRadius: 6,
                              borderTopRightRadius: 6,
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#24292f"
                            }}>
                              <svg className="octicon octicon-book" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="currentColor">
                                <path d="M0 1.75A.75.75 0 0 1 .75 1h7.5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75H.75A.75.75 0 0 1 0 14.75Zm1.75-.25v12.5h5.75V1.5Zm10 1.25a.75.75 0 0 0-1.5 0v10a.75.75 0 0 0 1.5 0ZM15 3a.75.75 0 0 0-1.5 0v8a.75.75 0 0 0 1.5 0Z"></path>
                              </svg>
                              <span>{primaryMarkdownFile.displayName || primaryMarkdownFile.name}</span>
                            </div>
                            <div className="repo-readme-body" style={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #d0d7de",
                              borderBottomLeftRadius: 6,
                              borderBottomRightRadius: 6,
                              padding: "24px",
                            }}>
                              <div className="preview-rendered-md">
                                {renderMarkdown(primaryMarkdownFile.content)}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: PARTNERS */}
          {activeTab === "partners" && (
            <div className="tab-pane partners-tab">
              <div className="action-bar">
                <p className="tab-description">Manage consulting partners and tax advisors for this client.</p>
                <button className="btn-primary" onClick={() => setIsAddingPartner(!isAddingPartner)}>
                  Add Partner
                </button>
              </div>

              {isAddingPartner && (
                <form className="add-partner-form" onSubmit={handleAddPartner}>
                  <div className="form-group">
                    <label>Partner Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. John Doe, CPA"
                      value={newPartnerName}
                      onChange={(e) => setNewPartnerName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Save</button>
                    <button type="button" className="btn-secondary" onClick={() => setIsAddingPartner(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="box">
                <div className="box-header">
                  <h3 className="box-title">Active Partners</h3>
                </div>
                <div className="box-body no-padding">
                  <ul className="partner-list">
                    {partners.map(p => (
                      <li key={p.id} className="partner-item">
                        <div className="partner-avatar"></div>
                        <div className="partner-info">
                          <span className="partner-name">{p.name}</span>
                          <span className="partner-role">{p.role}</span>
                        </div>
                        <button className="btn-secondary btn-small">Remove</button>
                      </li>
                    ))}
                    {partners.length === 0 && (
                      <li className="partner-item blank-slate-small">No partners assigned to this client.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MEETING ROOM */}
          {activeTab === "meeting-room" && (
            <div className="tab-pane meeting-tab">
              {meetingJoined ? (
                /* Joined call screen */
                <div className="joined-meeting-container">
                  <div className="meeting-grid">
                    <div className="meeting-card self-card">
                      {meetingCamOn && meetingStream ? (
                        <video 
                          ref={meetingVideoRef}
                          autoPlay 
                          playsInline 
                          muted 
                          className="meeting-video"
                          style={{ transform: "scaleX(-1)" }}
                        />
                      ) : (
                        <div className="meeting-avatar-fallback">
                          <span className="fallback-initials">L FY</span>
                        </div>
                      )}
                      <div className="meeting-card-name">Advisor (You) {(!meetingMicOn) && "🎤 Off"}</div>
                    </div>
                    
                    <div className="meeting-card participant-card">
                      <div className="meeting-avatar-fallback client-avatar">
                        <span className="fallback-initials">{displayId.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <div className="meeting-card-name">{displayId} Board Representative</div>
                      <div className="audio-wave">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Joined bottom bar */}
                  <div className="meeting-controls-bar">
                    <button 
                      className={`control-btn ${!meetingMicOn ? "disabled" : ""}`}
                      onClick={() => setMeetingMicOn(!meetingMicOn)}
                      title={meetingMicOn ? "Mute Microphone" : "Unmute Microphone"}
                    >
                      {meetingMicOn ? "🎤" : "🎙️"}
                    </button>
                    
                    <button 
                      className={`control-btn ${!meetingCamOn ? "disabled" : ""}`}
                      onClick={() => setMeetingCamOn(!meetingCamOn)}
                      title={meetingCamOn ? "Turn Camera Off" : "Turn Camera On"}
                    >
                      {meetingCamOn ? "📷" : "📹"}
                    </button>

                    <button 
                      className="control-btn end-call-btn"
                      onClick={() => {
                        setMeetingJoined(false);
                        setActiveTab("info");
                      }}
                      title="Leave Meeting"
                    >
                      Leave Call
                    </button>
                  </div>
                </div>
              ) : (
                /* Google Meet Joining Preview Screen */
                <div className="meet-joining-container">
                  <div className="meet-joining-layout">
                    {/* Left Column: Camera Preview Box */}
                    <div className="preview-column">
                      <div className="video-box-container">
                        <div className="video-box">
                          {meetingCamOn && meetingStream ? (
                            <video 
                              ref={meetingVideoRef}
                              autoPlay 
                              playsInline 
                              muted 
                              className="meeting-video"
                              style={{ transform: "scaleX(-1)" }}
                            />
                          ) : (
                            <div className="video-avatar-fallback">
                              <span className="avatar-text">L FY</span>
                            </div>
                          )}
                          
                          {/* Top left overlay */}
                          <div className="video-overlay-left">
                            L FY
                          </div>
                          
                          {/* Top right overlay */}
                          <div className="video-overlay-right">
                            <button className="icon-overlay-btn" title="More options" type="button">⋮</button>
                          </div>
                          
                          {/* Bottom controls overlay */}
                          <div className="video-controls-overlay">
                            <button 
                              className={`circle-btn ${!meetingMicOn ? "btn-off" : ""}`}
                              onClick={() => setMeetingMicOn(!meetingMicOn)}
                              title={meetingMicOn ? "Mute microphone" : "Unmute microphone"}
                              type="button"
                            >
                              {meetingMicOn ? (
                                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                                </svg>
                              ) : (
                                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c.57-.08 1.12-.24 1.64-.46l5.1 5.1L21 21.27 4.27 3z"/>
                                </svg>
                              )}
                            </button>
                            <button 
                              className={`circle-btn ${!meetingCamOn ? "btn-off" : ""}`}
                              onClick={() => setMeetingCamOn(!meetingCamOn)}
                              title={meetingCamOn ? "Turn camera off" : "Turn camera on"}
                              type="button"
                            >
                              {meetingCamOn ? (
                                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM15 16H5V8h10v8z"/>
                                </svg>
                              ) : (
                                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                                  <path d="M18 10.48V6c0-1.1-.9-2-2-2H6.83l2 2H16v7.17l2 2v-1.18l4 4v-11l-4 4zM2.81 3.19L1.39 4.61 4 7.22V18c0 1.1.9 2 2 2h12.78l2.61 2.61 1.41-1.41L2.81 3.19zM6 18V9.22L14.78 18H6z"/>
                                </svg>
                              )}
                            </button>
                            <button className="circle-btn" title="Visual effects" type="button">
                              <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Device dropdown selectors list */}
                      <div className="device-selectors">
                        <div className="selector-group">
                          <svg className="device-icon" height="16" viewBox="0 0 24 24" width="16" fill="currentColor">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          </svg>
                          <select 
                            className="device-select"
                            value={selectedMicDevice}
                            onChange={(e) => setSelectedMicDevice(e.target.value)}
                          >
                            <option>{selectedMicDevice}</option>
                            <option>Default System Microphone</option>
                            <option>External Mic (USB Audio)</option>
                          </select>
                        </div>
                        
                        <div className="selector-group">
                          <svg className="device-icon" height="16" viewBox="0 0 24 24" width="16" fill="currentColor">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                          </svg>
                          <select 
                            className="device-select"
                            value={selectedSpeakerDevice}
                            onChange={(e) => setSelectedSpeakerDevice(e.target.value)}
                          >
                            <option>{selectedSpeakerDevice}</option>
                            <option>Default System Speakers</option>
                            <option>Headphones (USB Audio)</option>
                          </select>
                        </div>

                        <div className="selector-group">
                          <svg className="device-icon" height="16" viewBox="0 0 24 24" width="16" fill="currentColor">
                            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                          </svg>
                          <select 
                            className="device-select"
                            value={selectedCamDevice}
                            onChange={(e) => setSelectedCamDevice(e.target.value)}
                          >
                            <option>{selectedCamDevice}</option>
                            <option>FaceTime HD Camera (Built-in)</option>
                            <option>USB Webcam</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column: Join Action Block */}
                    <div className="join-column">
                      <h2 className="join-title">Ready to join?</h2>
                      <div className="join-actions-container">
                        <button 
                          className="meet-btn-primary" 
                          onClick={() => setMeetingJoined(true)}
                          type="button"
                        >
                          Ask to join
                        </button>
                        
                        <div className="other-ways-container">
                          <button className="meet-btn-secondary" type="button">
                            Other ways to join
                            <span className="chevron-down">▼</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PHOTO / RECEIPTS */}
          {activeTab === "photo" && (
            <div className="tab-pane photo-tab">

              {/* Upload drop zone */}
              <div
                className={`upload-dropzone ${dragOver ? "dz--over" : ""} ${uploading ? "dz--uploading" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {uploading ? (
                  <div className="dz-uploading-state">
                    <div className="dz-spinner"></div>
                    <p className="dz-label">Uploading…</p>
                    <div className="dz-progress-bar">
                      <div className="dz-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="dz-icon">
                      <svg height="40" viewBox="0 0 24 24" width="40" fill="currentColor">
                        <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                      </svg>
                    </div>
                    <p className="dz-label">Drop receipt here, or <span className="dz-link">browse</span></p>
                    <p className="dz-hint">JPG, PNG, WebP, PDF · max 10 MB</p>
                  </>
                )}
              </div>

              {/* Error */}
              {uploadError && (
                <div className="upload-error">
                  ⚠️ {uploadError}
                  <button className="upload-error-dismiss" onClick={() => setUploadError("")}>Dismiss</button>
                </div>
              )}

              {/* Recent Uploads */}
              <div className="receipts-section">
                <div className="receipts-header">
                  <h4 className="receipts-title">Recent Uploads</h4>
                  <span className="receipts-count">{receipts.length} file{receipts.length !== 1 ? "s" : ""}</span>
                </div>

                {receipts.length === 0 ? (
                  <div className="receipts-empty">
                    <svg height="32" viewBox="0 0 24 24" width="32" fill="#d0d7de">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                    </svg>
                    <p>No files uploaded yet. Upload a receipt to get started.</p>
                  </div>
                ) : (
                  <div className="receipts-grid">
                    {receipts.map((r) => (
                      <div key={r.id} className="receipt-card">
                        {/* Preview */}
                        <div className="receipt-preview">
                          {r.file_type?.startsWith("image/") ? (
                            <img src={r.file_url} alt={r.file_name} className="receipt-img" />
                          ) : (
                            <div className="receipt-pdf-icon">
                              <svg height="32" viewBox="0 0 24 24" width="32" fill="#d1242f">
                                <path d="M20 2H8L2 8v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-9 13H9v-2h2v2zm0-4H9V9h2v2zm4 4h-2v-2h2v2zm0-4h-2V9h2v2zm4 4h-2v-2h2v2zm0-4h-2V9h2v2z"/>
                              </svg>
                              <span>PDF</span>
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="receipt-info">
                          <p className="receipt-name" title={r.file_name}>{r.file_name}</p>
                          <p className="receipt-meta">
                            {formatSize(r.file_size)} · {new Date(r.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        {/* Actions */}
                        <div className="receipt-actions">
                          <a href={r.file_url} target="_blank" rel="noreferrer" className="receipt-view-btn" title="View">
                            <svg height="13" viewBox="0 0 16 16" width="13" fill="currentColor"><path d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2zm0 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM8 7a1 1 0 1 1 0 2A1 1 0 0 1 8 7z"/></svg>
                            View
                          </a>
                          <button className="receipt-del-btn" title="Delete" onClick={() => handleDeleteReceipt(r)}>
                            <svg height="13" viewBox="0 0 16 16" width="13" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15Z"/></svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LOCATION */}
          {activeTab === "location" && (
            <div className="tab-pane location-tab">
              <div className="location-header">
                <div>
                  <h2 className="location-title">Client Visit Locations</h2>
                  <p className="location-subtitle">Click a stop to see the best driving route from your office (KLCC) through all stops.</p>
                </div>
              </div>

              {/* Origin card */}
              <div className="origin-card">
                <div className="origin-icon">🏢</div>
                <div className="origin-info">
                  <span className="origin-label">Starting Point — Advisor Office</span>
                  <span className="origin-address">{advisorOrigin.address}</span>
                </div>
              </div>

              {/* Stop cards */}
              <div className="stops-grid">
                {stops.map((stop) => (
                  <button
                    key={stop.id}
                    id={`stop-btn-${stop.id}`}
                    className={`stop-card ${selectedStop?.id === stop.id ? "stop-card--active" : ""}`}
                    onClick={() => handleStopClick(stop)}
                    style={{ "--stop-color": stop.color }}
                  >
                    <div className="stop-badge" style={{ background: stop.color }}>
                      {stop.label}
                    </div>
                    <div className="stop-body">
                      <div className="stop-name">{stop.name}</div>
                      <div className="stop-address">{stop.address}</div>
                    </div>
                    <div className="stop-cta">
                      <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor"><path d="M8 0a5.53 5.53 0 0 0-5.5 5.5c0 3.16 4.69 9.38 5.06 9.87a.55.55 0 0 0 .88 0C8.81 14.88 13.5 8.66 13.5 5.5A5.53 5.53 0 0 0 8 0Zm0 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"></path></svg>
                      View Route
                    </div>
                  </button>
                ))}
              </div>

              {/* Map section */}
              <div className="map-wrapper">
                {!mapsLoaded && (
                  <div className="map-placeholder">
                    <div className="map-spinner"></div>
                    <p>Loading Google Maps…</p>
                  </div>
                )}
                {mapsLoaded && !directionsResult && !routeLoading && (
                  <div className="map-placeholder map-idle">
                    <svg height="48" viewBox="0 0 24 24" width="48" fill="#d0d7de"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5Z"/></svg>
                    <p>Click any stop above to display the route on the map</p>
                  </div>
                )}
                {mapsLoaded && routeLoading && (
                  <div className="map-placeholder">
                    <div className="map-spinner"></div>
                    <p>Calculating best route…</p>
                  </div>
                )}
                {routeError && (
                  <div className="map-placeholder map-error">
                    <p>⚠️ {routeError}</p>
                  </div>
                )}
                {mapsLoaded && directionsResult && (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "480px", borderRadius: "0 0 6px 6px" }}
                    center={mapCenter}
                    zoom={11}
                    onLoad={onMapLoad}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true,
                      styles: [
                        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                      ],
                    }}
                  >
                    {/* Origin marker */}
                    <Marker
                      position={{ lat: advisorOrigin.lat, lng: advisorOrigin.lng }}
                      label={{ text: "🏢", fontSize: "20px" }}
                      title={advisorOrigin.name}
                    />
                    {/* Stop markers */}
                    {stops.map((stop) => (
                      <Marker
                        key={stop.id}
                        position={{ lat: stop.lat, lng: stop.lng }}
                        label={{ text: stop.label, color: "#fff", fontWeight: "bold", fontSize: "11px" }}
                        title={stop.name}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 18,
                          fillColor: stop.color,
                          fillOpacity: 1,
                          strokeColor: "#fff",
                          strokeWeight: 2,
                        }}
                      />
                    ))}
                    <DirectionsRenderer
                      directions={directionsResult}
                      options={{
                        suppressMarkers: true,
                        polylineOptions: { strokeColor: "#2563eb", strokeWeight: 5, strokeOpacity: 0.85 },
                      }}
                    />
                  </GoogleMap>
                )}
              </div>

              {/* Route summary */}
              {directionsResult && (
                <div className="route-summary">
                  <h4 className="summary-title">📍 Route Summary</h4>
                  <div className="summary-legs">
                    {directionsResult.routes[0].legs.map((leg, i) => (
                      <div key={i} className="summary-leg">
                        <div className="leg-index">{i + 1}</div>
                        <div className="leg-info">
                          <div className="leg-from">{leg.start_address}</div>
                          <div className="leg-arrow">↓ {leg.distance.text} · {leg.duration.text}</div>
                          <div className="leg-to">{leg.end_address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="tab-pane documents-tab">

              {/* ── Document Parser ── */}
              <div className="doc-section">
                <div className="doc-section-header">
                  <div className="doc-section-icon">📄</div>
                  <div>
                    <h3 className="doc-section-title">Document Parser</h3>
                    <p className="doc-section-subtitle">Convert PDF, DOCX, PPTX, XLSX, TXT, MD, or HTML into readable Markdown</p>
                  </div>
                </div>

                <div
                  className={`doc-dropzone ${docDragOver ? "dz--over" : ""} ${docParsing ? "dz--processing" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDocDragOver(true); }}
                  onDragLeave={() => setDocDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDocDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleParseDoc(f); }}
                  onClick={() => !docParsing && docInputRef.current?.click()}
                >
                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.md,.markdown,.html,.htm"
                    style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleParseDoc(f); e.target.value = ""; }}
                  />
                  {docParsing ? (
                    <div className="dz-processing-state">
                      <div className="doc-spinner doc-spinner-blue"></div>
                      <p className="dz-processing-label">Parsing document…</p>
                    </div>
                  ) : (
                    <>
                      <svg height="36" viewBox="0 0 24 24" width="36" fill="currentColor" className="doc-dz-icon">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                      </svg>
                      <p className="dz-label">Drop document here or <span className="dz-link">browse</span></p>
                      <p className="dz-hint">PDF · DOCX · PPTX · XLSX · TXT · MD · HTML · max 50 MB</p>
                    </>
                  )}
                </div>

                {docError && (
                  <div className="parse-error">
                    ⚠️ {docError}
                    <button onClick={() => setDocError("")}>×</button>
                  </div>
                )}

                {docResult && (
                  <div className="parse-result" style={{ margin: "16px 20px 20px" }}>
                    {/* Header */}
                    <div className="repo-preview-header" style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      backgroundColor: "#f6f8fa",
                      border: "1px solid #d0d7de",
                      borderBottom: "none",
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg className="octicon octicon-file" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="#909692">
                          <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 8.75 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"></path>
                        </svg>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#1f2328" }}>{docResult.filename}</span>
                        <span className="parse-badge" style={{ marginLeft: 4 }}>{docResult.fileType}</span>
                        <span style={{ fontSize: 12, color: "#57606a" }}>{formatSize(new Blob([docResult.markdown]).size)}</span>
                      </div>
                      
                      <div className="preview-meta-actions">
                        <div className="preview-format-toggle">
                          <button
                            className={`toggle-btn ${docPreviewTab === "rendered" ? "active" : ""}`}
                            onClick={() => setDocPreviewTab("rendered")}
                          >
                            Preview
                          </button>
                          <button
                            className={`toggle-btn ${docPreviewTab === "code" ? "active" : ""}`}
                            onClick={() => setDocPreviewTab("code")}
                          >
                            Code
                          </button>
                        </div>
                        
                        <button className="btn-secondary btn-small" onClick={() => {
                          navigator.clipboard?.writeText(docResult.markdown);
                          setDocCopied(true);
                          setTimeout(() => setDocCopied(false), 2000);
                        }}>
                          {docCopied ? "✓ Copied" : "Copy"}
                        </button>

                        <button className="btn-primary btn-small" onClick={() => {
                          setSaveFileName(docResult.filename.replace(/\.[^/.]+$/, "") + ".md");
                          setSaveCommitTitle(`Add parsed ${docResult.filename}`);
                          setSaveCommitDesc(`Parsed document ${docResult.filename} to markdown format`);
                          setSaveDocModalOpen(true);
                        }}>
                          Save to Repo
                        </button>
                        
                        <button className="btn-secondary btn-small" onClick={() => { setDocResult(null); setDocAiReply(""); setDocAiQuestion(""); setSaveDocModalOpen(false); }}>
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Commit Save Box */}
                    {saveDocModalOpen && (
                      <div style={{
                        padding: 16,
                        backgroundColor: "#fafbfc",
                        border: "1px solid #d0d7de",
                        borderBottom: "none",
                        fontSize: 13
                      }}>
                        <h4 style={{ margin: "0 0 12px 0", fontWeight: 600 }}>Save file to client repository</h4>
                        <div style={{ display: "grid", gap: 12 }}>
                          <div>
                            <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>File Name</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ width: "100%", maxWidth: 300 }}
                              value={saveFileName}
                              onChange={(e) => setSaveFileName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>Commit Title</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ width: "100%", maxWidth: 400 }}
                              value={saveCommitTitle}
                              onChange={(e) => setSaveCommitTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>Commit Description</label>
                            <textarea
                              className="form-input"
                              style={{ width: "100%", maxWidth: 400 }}
                              rows={2}
                              value={saveCommitDesc}
                              onChange={(e) => setSaveCommitDesc(e.target.value)}
                            />
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <button className="btn-primary btn-small" onClick={() => {
                              if (!saveFileName.trim()) return;
                              const fileUrl = "data:text/markdown;charset=utf-8," + encodeURIComponent(docResult.markdown);
                              const newFile = {
                                id: Date.now().toString(),
                                name: saveFileName.trim(),
                                type: "md",
                                size: new Blob([docResult.markdown]).size,
                                description: saveCommitDesc.trim() || `Saved ${saveFileName.trim()}`,
                                uploadedBy: "Lim Fang Yee",
                                uploadedAt: new Date().toISOString(),
                                content: docResult.markdown,
                                fileUrl: fileUrl,
                              };
                              const updated = [newFile, ...advisoryFiles];
                              saveFiles(updated);
                              setSaveDocModalOpen(false);
                              alert(`Saved ${saveFileName.trim()} to repository! Check the Info tab.`);
                            }}>
                              Commit File
                            </button>
                            <button className="btn-secondary btn-small" onClick={() => setSaveDocModalOpen(false)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preview / Code Body */}
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d0d7de",
                      borderBottom: "1px solid #d0d7de",
                      maxHeight: "500px",
                      overflowY: "auto",
                    }}>
                      {docPreviewTab === "rendered" ? (
                        <div className="preview-rendered-md">
                          {renderMarkdown(docResult.markdown)}
                        </div>
                      ) : (
                        <div className="preview-code-box">
                          <div className="line-numbers">
                            {docResult.markdown.split("\n").map((_, i) => <div key={i} className="ln">{i + 1}</div>)}
                          </div>
                          <pre className="code-content" style={{ margin: 0, padding: 16 }}>{docResult.markdown}</pre>
                        </div>
                      )}
                    </div>

                    <div className="ask-ai-section">
                      <h4 className="ask-ai-title">
                        <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>
                        Ask AI about this document
                      </h4>
                      <form className="ask-ai-form" onSubmit={handleDocAskAI}>
                        <textarea
                          className="ask-ai-input"
                          placeholder="e.g. Summarise the key action items, What risks are mentioned?, List all recommendations…"
                          value={docAiQuestion}
                          onChange={(e) => setDocAiQuestion(e.target.value)}
                          rows={2}
                        />
                        <button type="submit" className="ask-ai-btn" disabled={docAiLoading || !docAiQuestion.trim()}>
                          {docAiLoading ? "Thinking…" : "Ask AI"}
                        </button>
                      </form>
                      {docAiLoading && <div className="ask-ai-loading"><div className="doc-spinner doc-spinner-blue"></div></div>}
                      {docAiReply && (
                        <div className="ask-ai-reply">
                          <div className="ask-ai-reply-label">AI Response</div>
                          <div className="ask-ai-reply-body">{docAiReply}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Audio Transcriber ── */}
              <div className="doc-section">
                <div className="doc-section-header">
                  <div className="doc-section-icon">🎙️</div>
                  <div>
                    <h3 className="doc-section-title">Audio Transcriber</h3>
                    <p className="doc-section-subtitle">Transcribe meeting recordings to Markdown using AI — MP3, WAV, M4A, OGG, WEBM, AAC, FLAC</p>
                  </div>
                </div>

                <div
                  className={`doc-dropzone ${audioDragOver ? "dz--over" : ""} ${audioTranscribing ? "dz--processing dz--audio" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setAudioDragOver(true); }}
                  onDragLeave={() => setAudioDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setAudioDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleTranscribeAudio(f); }}
                  onClick={() => !audioTranscribing && audioInputRef.current?.click()}
                >
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/mp4,audio/ogg,audio/webm,audio/aac,audio/flac,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"
                    style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTranscribeAudio(f); e.target.value = ""; }}
                  />
                  {audioTranscribing ? (
                    <div className="dz-processing-state">
                      <div className="doc-spinner doc-spinner-purple"></div>
                      <p className="dz-processing-label">Transcribing audio with AI…</p>
                      <p className="dz-hint">This may take a minute for longer recordings</p>
                    </div>
                  ) : (
                    <>
                      <svg height="36" viewBox="0 0 24 24" width="36" fill="currentColor" className="doc-dz-icon doc-dz-audio">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                      <p className="dz-label">Drop audio file here or <span className="dz-link">browse</span></p>
                      <p className="dz-hint">MP3 · WAV · M4A · OGG · WEBM · AAC · FLAC · max 15 MB</p>
                    </>
                  )}
                </div>

                {audioError && (
                  <div className="parse-error">
                    ⚠️ {audioError}
                    <button onClick={() => setAudioError("")}>×</button>
                  </div>
                )}

                {audioResult && (
                  <div className="parse-result" style={{ margin: "16px 20px 20px" }}>
                    {/* Header */}
                    <div className="repo-preview-header" style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      backgroundColor: "#f6f8fa",
                      border: "1px solid #d0d7de",
                      borderBottom: "none",
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg className="octicon octicon-file" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="#909692">
                          <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 8.75 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"></path>
                        </svg>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#1f2328" }}>{audioResult.filename}</span>
                        <span className="parse-badge parse-badge-audio" style={{ marginLeft: 4 }}>AUDIO</span>
                        <span style={{ fontSize: 12, color: "#57606a" }}>{formatSize(new Blob([audioResult.transcript]).size)}</span>
                      </div>
                      
                      <div className="preview-meta-actions">
                        <div className="preview-format-toggle">
                          <button
                            className={`toggle-btn ${audioPreviewTab === "rendered" ? "active" : ""}`}
                            onClick={() => setAudioPreviewTab("rendered")}
                          >
                            Preview
                          </button>
                          <button
                            className={`toggle-btn ${audioPreviewTab === "code" ? "active" : ""}`}
                            onClick={() => setAudioPreviewTab("code")}
                          >
                            Code
                          </button>
                        </div>
                        
                        <button className="btn-secondary btn-small" onClick={() => {
                          navigator.clipboard?.writeText(audioResult.transcript);
                          setAudioCopied(true);
                          setTimeout(() => setAudioCopied(false), 2000);
                        }}>
                          {audioCopied ? "✓ Copied" : "Copy"}
                        </button>

                        <button className="btn-primary btn-small" onClick={() => {
                          setSaveFileName(audioResult.filename.replace(/\.[^/.]+$/, "") + ".md");
                          setSaveCommitTitle(`Add transcript ${audioResult.filename}`);
                          setSaveCommitDesc(`Transcribed audio meeting minutes for ${audioResult.filename}`);
                          setSaveAudioModalOpen(true);
                        }}>
                          Save to Repo
                        </button>
                        
                        <button className="btn-secondary btn-small" onClick={() => { setAudioResult(null); setAudioAiReply(""); setAudioAiQuestion(""); setSaveAudioModalOpen(false); }}>
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Commit Save Box */}
                    {saveAudioModalOpen && (
                      <div style={{
                        padding: 16,
                        backgroundColor: "#fafbfc",
                        border: "1px solid #d0d7de",
                        borderBottom: "none",
                        fontSize: 13
                      }}>
                        <h4 style={{ margin: "0 0 12px 0", fontWeight: 600 }}>Save file to client repository</h4>
                        <div style={{ display: "grid", gap: 12 }}>
                          <div>
                            <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>File Name</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ width: "100%", maxWidth: 300 }}
                              value={saveFileName}
                              onChange={(e) => setSaveFileName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>Commit Title</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ width: "100%", maxWidth: 400 }}
                              value={saveCommitTitle}
                              onChange={(e) => setSaveCommitTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>Commit Description</label>
                            <textarea
                              className="form-input"
                              style={{ width: "100%", maxWidth: 400 }}
                              rows={2}
                              value={saveCommitDesc}
                              onChange={(e) => setSaveCommitDesc(e.target.value)}
                            />
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <button className="btn-primary btn-small" onClick={() => {
                              if (!saveFileName.trim()) return;
                              const fileUrl = "data:text/markdown;charset=utf-8," + encodeURIComponent(audioResult.transcript);
                              const newFile = {
                                id: Date.now().toString(),
                                name: saveFileName.trim(),
                                type: "md",
                                size: new Blob([audioResult.transcript]).size,
                                description: saveCommitDesc.trim() || `Saved ${saveFileName.trim()}`,
                                uploadedBy: "Lim Fang Yee",
                                uploadedAt: new Date().toISOString(),
                                content: audioResult.transcript,
                                fileUrl: fileUrl,
                              };
                              const updated = [newFile, ...advisoryFiles];
                              saveFiles(updated);
                              setSaveAudioModalOpen(false);
                              alert(`Saved ${saveFileName.trim()} to repository! Check the Info tab.`);
                            }}>
                              Commit File
                            </button>
                            <button className="btn-secondary btn-small" onClick={() => setSaveAudioModalOpen(false)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preview / Code Body */}
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d0d7de",
                      borderBottom: "1px solid #d0d7de",
                      maxHeight: "500px",
                      overflowY: "auto",
                    }}>
                      {audioPreviewTab === "rendered" ? (
                        <div className="preview-rendered-md">
                          {renderMarkdown(audioResult.transcript)}
                        </div>
                      ) : (
                        <div className="preview-code-box">
                          <div className="line-numbers">
                            {audioResult.transcript.split("\n").map((_, i) => <div key={i} className="ln">{i + 1}</div>)}
                          </div>
                          <pre className="code-content" style={{ margin: 0, padding: 16 }}>{audioResult.transcript}</pre>
                        </div>
                      )}
                    </div>

                    <div className="ask-ai-section ask-ai-section-audio">
                      <h4 className="ask-ai-title ask-ai-title-audio">
                        <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>
                        Ask AI about this recording
                      </h4>
                      <form className="ask-ai-form" onSubmit={handleAudioAskAI}>
                        <textarea
                          className="ask-ai-input ask-ai-input-audio"
                          placeholder="e.g. What were the main decisions made?, List action items with owners, What follow-up tasks were agreed?…"
                          value={audioAiQuestion}
                          onChange={(e) => setAudioAiQuestion(e.target.value)}
                          rows={2}
                        />
                        <button type="submit" className="ask-ai-btn ask-ai-btn-audio" disabled={audioAiLoading || !audioAiQuestion.trim()}>
                          {audioAiLoading ? "Thinking…" : "Ask AI"}
                        </button>
                      </form>
                      {audioAiLoading && <div className="ask-ai-loading"><div className="doc-spinner doc-spinner-purple"></div></div>}
                      {audioAiReply && (
                        <div className="ask-ai-reply ask-ai-reply-audio">
                          <div className="ask-ai-reply-label ask-ai-reply-label-audio">AI Response</div>
                          <div className="ask-ai-reply-body">{audioAiReply}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: CONTACT */}
          {activeTab === "contact" && (() => {
            const cd = getContactData(displayId);
            return (
              <div className="contact-tab">
                {/* Left: client card + AI reasoning */}
                <div className="contact-left">
                  <div className="contact-client-card">
                    <div className="contact-client-avatar">{cd.clientName[0]}</div>
                    <div>
                      <div className="contact-client-name">{cd.clientName}</div>
                      <div className="contact-client-person">{cd.contactPerson}</div>
                      <div className="contact-client-phone">+{cd.phone}</div>
                    </div>
                    <span className="contact-tag">{cd.tag}</span>
                  </div>

                  <div className="contact-reasoning-card">
                    <div className="contact-reasoning-header">
                      <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor" style={{flexShrink: 0, color: "#8250df"}}>
                        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
                      </svg>
                      <span>Why AI drafted this</span>
                    </div>
                    <p className="contact-reasoning-body">{cd.aiReasoning}</p>
                  </div>
                </div>

                {/* Right: compose + send */}
                <div className="contact-right">
                  <div className="contact-compose-header">
                    <div className="contact-compose-to-label">To</div>
                    <div className="contact-compose-to-value">
                      <strong>{cd.contactPerson}</strong>
                      <span style={{color: "#909692", fontSize: 13}}> · +{cd.phone}</span>
                    </div>
                  </div>

                  <div className="contact-compose-body">
                    <div className="contact-compose-label">Message</div>
                    <textarea
                      className="contact-textarea"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      rows={12}
                      placeholder="AI-suggested follow-up message..."
                    />
                  </div>

                  <div className="contact-actions">
                    <button
                      className="contact-btn-whatsapp"
                      disabled={!contactMessage.trim()}
                      onClick={() => {
                        const url = `https://wa.me/${cd.phone}?text=${encodeURIComponent(contactMessage)}`;
                        window.open(url, "_blank");
                      }}
                    >
                      <svg height="16" viewBox="0 0 24 24" width="16" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      Open in WhatsApp
                    </button>
                    <button
                      className="contact-btn-copy"
                      disabled={!contactMessage.trim()}
                      onClick={() => {
                        navigator.clipboard?.writeText(contactMessage);
                        setContactMsgCopied(true);
                        setTimeout(() => setContactMsgCopied(false), 2000);
                      }}
                    >
                      {contactMsgCopied ? "✓ Copied" : "Copy"}
                    </button>
                    <button
                      className="contact-btn-reset"
                      onClick={() => setContactMessage(cd.aiDraft)}
                    >
                      Reset to AI Draft
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB: HISTORY */}
          {activeTab === "history" && (
            <div className="history-tab">
              {(() => {
                const commits = [...advisoryFiles].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
                const grouped = {};
                commits.forEach(file => {
                  const d = new Date(file.uploadedAt);
                  const key = d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(file);
                });
                if (commits.length === 0) {
                  return (
                    <div className="blank-slate">
                      <svg height="48" viewBox="0 0 16 16" width="48" fill="#d0d7de"><path d="M1.643 3.143.427 1.927A.25.25 0 0 0 0 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 0 0 .177-.427L2.715 4.215a6.5 6.5 0 1 1-1.18 4.458.75.75 0 1 0-1.493.154 8.001 8.001 0 1 0 1.6-5.684ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z"></path></svg>
                      <h4>No history yet</h4>
                      <p>Files added to this repository will appear here as commits.</p>
                    </div>
                  );
                }
                return Object.entries(grouped).map(([dateKey, files]) => (
                  <div key={dateKey} className="commit-group">
                    <div className="commit-group-header">
                      <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor" style={{marginRight: 8, flexShrink: 0}}><path d="M1.643 3.143.427 1.927A.25.25 0 0 0 0 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 0 0 .177-.427L2.715 4.215a6.5 6.5 0 1 1-1.18 4.458.75.75 0 1 0-1.493.154 8.001 8.001 0 1 0 1.6-5.684ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z"></path></svg>
                      Commits on {dateKey}
                    </div>
                    <div className="commit-list-box">
                      {files.map(file => {
                        const hash = toHash(file.id || file.name);
                        const typeEmoji = file.type === "pdf" ? "📕" : file.type === "xlsx" ? "📊" : file.type === "docx" ? "📘" : file.type === "mp3" ? "🎵" : file.type === "md" ? "📝" : "📄";
                        const authorInitial = (file.uploadedBy || "A")[0].toUpperCase();
                        return (
                          <div key={file.id} className="commit-row">
                            <div className="commit-left">
                              <span className="commit-type-icon">{typeEmoji}</span>
                              <div className="commit-info">
                                <span className="commit-title">{file.description || file.name}</span>
                                <div className="commit-meta-row">
                                  <div className="commit-avatar-mini" title={file.uploadedBy || "advisor-bot"}>{authorInitial}</div>
                                  <span className="commit-author-name">{file.uploadedBy || "advisor-bot"}</span>
                                  <span className="commit-verb">committed</span>
                                  <span className="commit-time-ago">{formatAge(file.uploadedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="commit-right">
                              <code className="commit-hash-tag">{hash}</code>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* TAB: INSIGHTS */}
          {activeTab === "insights" && (() => {
            const milestones = getClientMilestones(displayId);
            const n = milestones.length;
            return (
              <div className="insights-tab">
                <div style={{marginBottom: 32}}>
                  <h3 style={{fontSize: 16, fontWeight: 600, margin: "0 0 4px 0", color: "#111827"}}>Client Journey</h3>
                  <p style={{fontSize: 13, color: "#6b7280", margin: 0}}>Key milestones in the advisory relationship — hover a point to see details</p>
                </div>

                {/* Timeline */}
                <div style={{position: "relative", height: 340, margin: "0 0 48px", padding: "0 60px"}}>
                  {/* Line */}
                  <div style={{
                    position: "absolute", top: 162, left: 60, right: 60, height: 2,
                    background: "linear-gradient(90deg, transparent, #d1d5db 4%, #d1d5db 95%, transparent)"
                  }} />
                  {/* Arrow */}
                  <div style={{
                    position: "absolute", top: 155, right: 52,
                    width: 0, height: 0,
                    borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "11px solid #d1d5db"
                  }} />

                  {milestones.map((m, i) => {
                    const isAbove = i % 2 === 0;
                    const leftPct = n === 1 ? 50 : (i / (n - 1)) * 100;
                    const isHovered = hoveredMilestone === m.id;
                    const isUpcoming = m.type === "upcoming";
                    // dot center = 154px (section) + 8px (half dot) = 162px, matching the line
                    // left formula: leftPct=0→60px, leftPct=100→calc(100%-60px)
                    const leftStyle = `calc(${leftPct}% + ${(60 - leftPct * 1.2).toFixed(1)}px)`;
                    return (
                      <div key={m.id} style={{
                        position: "absolute",
                        left: leftStyle,
                        top: 0, bottom: 0,
                        transform: "translateX(-50%)",
                        width: 130,
                        display: "flex", flexDirection: "column", alignItems: "center",
                      }}>
                        {/* Above section */}
                        <div style={{height: 154, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", paddingBottom: 16, position: "relative"}}>
                          {isAbove && !isHovered && (
                            <>
                              <div style={{fontSize: 12, fontWeight: 700, color: m.color, textAlign: "center", lineHeight: 1.3, maxWidth: 110}}>{m.label}</div>
                              <div style={{fontSize: 11, color: "#6b7280", marginTop: 4, textAlign: "center"}}>
                                {new Date(m.date).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"})}
                              </div>
                            </>
                          )}
                          {isAbove && isHovered && (
                            <div style={{
                              background: "#111827", color: "#f9fafb", borderRadius: 8,
                              padding: "10px 12px", fontSize: 12, lineHeight: 1.5,
                              width: 210, textAlign: "left",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                              position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
                              zIndex: 10, pointerEvents: "none",
                            }}>
                              <div style={{fontWeight: 700, marginBottom: 4, color: m.color}}>{m.label}</div>
                              <div style={{opacity: 0.85, fontSize: 11}}>{m.description}</div>
                            </div>
                          )}
                        </div>

                        {/* Dot */}
                        <div
                          onMouseEnter={() => setHoveredMilestone(m.id)}
                          onMouseLeave={() => setHoveredMilestone(null)}
                          style={{
                            width: 16, height: 16, borderRadius: "50%",
                            background: isUpcoming ? "#f6f8fa" : m.color,
                            border: isUpcoming ? `2.5px dashed ${m.color}` : "3px solid #fff",
                            boxShadow: isUpcoming ? "none" : `0 0 0 2.5px ${m.color}`,
                            cursor: "pointer", flexShrink: 0, zIndex: 2,
                            transform: isHovered ? "scale(1.6)" : "scale(1)",
                            transition: "transform 0.15s ease",
                          }}
                        />

                        {/* Below section */}
                        <div style={{height: 154, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", paddingTop: 16, position: "relative"}}>
                          {!isAbove && !isHovered && (
                            <>
                              <div style={{fontSize: 12, fontWeight: 700, color: m.color, textAlign: "center", lineHeight: 1.3, maxWidth: 110}}>{m.label}</div>
                              <div style={{fontSize: 11, color: "#6b7280", marginTop: 4, textAlign: "center"}}>
                                {new Date(m.date).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"})}
                              </div>
                            </>
                          )}
                          {!isAbove && isHovered && (
                            <div style={{
                              background: "#111827", color: "#f9fafb", borderRadius: 8,
                              padding: "10px 12px", fontSize: 12, lineHeight: 1.5,
                              width: 210, textAlign: "left",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                              position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
                              zIndex: 10, pointerEvents: "none",
                            }}>
                              <div style={{fontWeight: 700, marginBottom: 4, color: m.color}}>{m.label}</div>
                              <div style={{opacity: 0.85, fontSize: 11}}>{m.description}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stats cards */}
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginTop: 8}}>
                  {[
                    { label: "Milestones Reached", value: milestones.filter(m => m.type !== "upcoming").length, color: "#2563eb", surface: "#eff6ff", icon: "🏁" },
                    { label: "Meetings Held",       value: milestones.filter(m => m.type === "meeting").length,  color: "#0FBF3E", surface: "#f0fdf4", icon: "🤝" },
                    { label: "Documents Filed",     value: advisoryFiles.length,                                 color: "#d97706", surface: "#fffbeb", icon: "📂" },
                    { label: "Days Active",         value: Math.max(1, Math.round((Date.now() - new Date(milestones[0]?.date).getTime()) / 86400000)), color: "#374151", surface: "#f3f4f6", icon: "📅" },
                  ].map((stat, idx) => (
                    <div key={idx} style={{
                      background: stat.surface,
                      border: `1px solid #e5e7eb`,
                      borderRadius: 10,
                      padding: "20px 20px 16px",
                      borderTop: `3px solid ${stat.color}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                      <div style={{fontSize: 22, marginBottom: 10}}>{stat.icon}</div>
                      <div style={{fontSize: 30, fontWeight: 700, color: stat.color, lineHeight: 1, letterSpacing: "-0.5px"}}>{stat.value}</div>
                      <div style={{fontSize: 12, color: "#6b7280", marginTop: 8, fontWeight: 500}}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </main>

      <style jsx>{`
        /* ── NOTIFICATION ── */
        .noti-wrapper { position: relative; }
        .noti-badge {
          position: absolute;
          top: -5px; right: -5px;
          background: #d1242f;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          border: 2px solid #f6f8fa;
          line-height: 1;
          pointer-events: none;
        }
        .noti-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 320px;
          background: #fff;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(140,149,159,0.2);
          z-index: 100;
          overflow: hidden;
        }
        .noti-panel-header {
          padding: 10px 16px;
          background: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 700;
          color: #1f2328;
        }
        .noti-new-badge {
          font-size: 11px;
          font-weight: 600;
          background: #d1242f;
          color: #fff;
          padding: 1px 7px;
          border-radius: 10px;
        }
        .noti-empty {
          padding: 28px 16px;
          text-align: center;
          font-size: 13px;
          color: #909692;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .noti-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #eaeef2;
        }
        .noti-item:last-child { border-bottom: none; }
        .noti-item-icon {
          font-size: 18px;
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          background: #f0f6ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .noti-item-body { flex: 1; min-width: 0; }
        .noti-item-title {
          font-size: 13px;
          font-weight: 700;
          color: #1f2328;
        }
        .noti-item-question {
          font-size: 13px;
          color: #57606a;
          margin: 2px 0 3px;
        }
        .noti-item-file {
          font-size: 11px;
          color: #909692;
          font-family: "SFMono-Regular", Consolas, monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .noti-item-time {
          font-size: 11px;
          color: #909692;
          margin-top: 3px;
        }
        .noti-item-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          align-items: center;
        }
        .noti-run-btn {
          font-size: 12px;
          font-weight: 600;
          color: #0FBF3E;
          background: #dff0ff;
          border: none;
          border-radius: 4px;
          padding: 5px 12px;
          cursor: pointer;
          transition: background 0.12s;
        }
        .noti-run-btn:hover { background: #b6daff; }

/* ── CONTACT TAB ── */
        .contact-tab {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 820px) {
          .contact-tab { grid-template-columns: 1fr; }
        }
        .contact-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .contact-client-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: #fff;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 16px;
          position: relative;
        }
        .contact-client-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0FBF3E, #08872B);
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .contact-client-name {
          font-size: 15px;
          font-weight: 700;
          color: #1f2328;
        }
        .contact-client-person {
          font-size: 13px;
          color: #57606a;
          margin-top: 2px;
        }
        .contact-client-phone {
          font-size: 12px;
          color: #909692;
          margin-top: 2px;
          font-family: "SFMono-Regular", Consolas, monospace;
        }
        .contact-tag {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 11px;
          font-weight: 600;
          background: #dff0ff;
          color: #0FBF3E;
          padding: 2px 8px;
          border-radius: 12px;
        }
        .contact-reasoning-card {
          background: #fbf0ff;
          border: 1px solid #d8b4fe;
          border-radius: 8px;
          padding: 14px 16px;
        }
        .contact-reasoning-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #6f3fa8;
          margin-bottom: 8px;
        }
        .contact-reasoning-body {
          font-size: 13px;
          color: #44337a;
          line-height: 1.6;
          margin: 0;
        }
        .contact-right {
          background: #fff;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          overflow: hidden;
        }
        .contact-compose-header {
          border-bottom: 1px solid #eaeef2;
          padding: 14px 16px;
          display: flex;
          align-items: baseline;
          gap: 12px;
        }
        .contact-compose-to-label {
          font-size: 11px;
          font-weight: 700;
          color: #909692;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          flex-shrink: 0;
        }
        .contact-compose-to-value {
          font-size: 14px;
          color: #1f2328;
        }
        .contact-compose-body {
          padding: 14px 16px 0;
        }
        .contact-compose-label {
          font-size: 11px;
          font-weight: 700;
          color: #909692;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }
        .contact-textarea {
          width: 100%;
          padding: 12px;
          font-size: 14px;
          color: #1f2328;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          resize: vertical;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          line-height: 1.6;
          box-sizing: border-box;
        }
        .contact-textarea:focus {
          outline: none;
          border-color: #0FBF3E;
          box-shadow: 0 0 0 3px rgba(9,105,218,0.12);
        }
        .contact-actions {
          display: flex;
          gap: 10px;
          padding: 14px 16px;
          border-top: 1px solid #eaeef2;
          flex-wrap: wrap;
        }
        .contact-btn-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 18px;
          background: #25d366;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .contact-btn-whatsapp:hover { background: #1eb455; }
        .contact-btn-whatsapp:disabled { background: #d0d7de; cursor: not-allowed; }
        .contact-btn-copy {
          padding: 8px 16px;
          background: #f6f8fa;
          color: #24292f;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .contact-btn-copy:hover { background: #eaeef2; }
        .contact-btn-copy:disabled { opacity: 0.5; cursor: not-allowed; }
        .contact-btn-reset {
          padding: 8px 16px;
          background: transparent;
          color: #909692;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
          margin-left: auto;
        }
        .contact-btn-reset:hover { color: #1f2328; border-color: #57606a; }

        /* ── HISTORY TAB ── */
        .history-tab {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .commit-group {
          border: 1px solid #d0d7de;
          border-radius: 6px;
          overflow: hidden;
        }
        .commit-group-header {
          background: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #57606a;
          display: flex;
          align-items: center;
        }
        .commit-list-box {
          background: #fff;
        }
        .commit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 16px;
          border-bottom: 1px solid #eaeef2;
          transition: background 0.1s;
        }
        .commit-row:last-child { border-bottom: none; }
        .commit-row:hover { background: #f6f8fa; }
        .commit-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .commit-type-icon { font-size: 18px; flex-shrink: 0; }
        .commit-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .commit-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2328;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .commit-meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #57606a;
          flex-wrap: wrap;
        }
        .commit-avatar-mini {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0FBF3E;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .commit-author-name { font-weight: 600; color: #1f2328; }
        .commit-right {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          margin-left: 16px;
        }
        .commit-hash-tag {
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 12px;
          color: #0FBF3E;
          background: #dff0ff;
          padding: 2px 8px;
          border-radius: 4px;
          cursor: default;
          letter-spacing: 0.02em;
        }

        /* ── INSIGHTS TAB ── */
        .insights-tab {
          padding: 8px 0 24px;
        }

        .repo-root {
          min-height: 100vh;
          background-color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
          color: #1F2328;
        }

        /* ── HEADER ── */
        .repo-header {
          background-color: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
        }
        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 52px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          font-size: 14px;
          gap: 0;
          min-width: 0;
        }
        .back-link {
          text-decoration: none;
          font-size: 14px;
          font-weight: 400;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 6px;
          border-radius: 6px;
          color: #0FBF3E;
          flex-shrink: 0;
        }
        .back-link:hover {
          background: rgba(208,215,222,0.32);
          text-decoration: none;
        }
        .separator {
          color: #909692;
          margin: 0 4px;
          font-weight: 300;
          font-size: 18px;
          line-height: 1;
        }
        .repo-name {
          font-weight: 600;
          font-size: 14px;
          color: #0FBF3E;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .badge {
          font-size: 11px;
          color: #909692;
          border: 1px solid #d0d7de;
          border-radius: 2em;
          padding: 1px 7px;
          font-weight: 500;
          margin-left: 8px;
          flex-shrink: 0;
          line-height: 18px;
        }

        .repo-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        /* GitHub-style split buttons */
        .action-split-btn {
          display: inline-flex;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 1px 0 rgba(27,31,36,0.04);
        }
        .split-main {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f6f8fa;
          border: 1px solid rgba(27,31,36,0.15);
          border-right: none;
          color: #24292f;
          padding: 3px 10px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px 0 0 6px;
          white-space: nowrap;
        }
        .split-main:hover {
          background: #eaeef2;
        }
        .split-count {
          display: inline-flex;
          align-items: center;
          background: #f6f8fa;
          border: 1px solid rgba(27,31,36,0.15);
          color: #24292f;
          padding: 3px 10px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 0 6px 6px 0;
          cursor: pointer;
          white-space: nowrap;
        }
        .split-count:hover {
          background: #eaeef2;
          color: #0FBF3E;
        }

        /* ── TABS ── */
        .repo-tabs {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .tab-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          gap: 8px;
        }
        .tab-item {
          background: transparent;
          border: none;
          padding: 8px 16px;
          font-size: 14px;
          color: #1f2328;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tab-item:hover {
          background: rgba(208,215,222,0.32);
          border-radius: 6px 6px 0 0;
        }
        .tab-item.active {
          font-weight: 600;
          border-bottom: 2px solid #0FBF3E;
        }
        .tab-item svg {
          color: #909692;
        }
        .tab-item.active svg {
          color: #1f2328;
        }

        /* ── MAIN CONTENT ── */
        .repo-content {
          padding: 24px 0;
        }
        .content-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* BUTTONS */
        .btn-primary {
          background-color: #0FBF3E;
          color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 6px;
          padding: 5px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary:hover {
          background-color: #08872B;
        }
        .btn-secondary {
          background-color: #f6f8fa;
          color: #24292f;
          border: 1px solid rgba(31, 35, 40, 0.15);
          border-radius: 6px;
          padding: 5px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background-color: #f3f4f6;
        }
        .btn-small {
          padding: 3px 12px;
          font-size: 12px;
        }

        /* BOXES */
        .box {
          border: 1px solid #d0d7de;
          border-radius: 6px;
          background: #ffffff;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .box-header {
          background: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
          padding: 12px 16px;
        }
        .box-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }
        .box-body {
          padding: 16px;
        }
        .box-body.no-padding {
          padding: 0;
        }
        .blank-slate {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 16px;
          text-align: center;
        }
        .blank-slate h4 {
          margin: 0 0 8px;
          font-size: 16px;
        }
        .blank-slate p {
          color: #909692;
          font-size: 14px;
          max-width: 400px;
          margin: 0;
        }
        .blank-slate-small {
          padding: 24px;
          text-align: center;
          color: #909692;
          font-size: 14px;
        }

        /* PARTNERS TAB */
        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .tab-description {
          color: #909692;
          font-size: 14px;
          margin: 0;
        }
        .add-partner-form {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          max-width: 400px;
          padding: 5px 12px;
          font-size: 14px;
          border: 1px solid #d0d7de;
          border-radius: 6px;
        }
        .form-actions {
          display: flex;
          gap: 8px;
        }

        .partner-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .partner-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #d0d7de;
        }
        .partner-item:last-child {
          border-bottom: none;
        }
        .partner-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #d0d7de;
          margin-right: 12px;
        }
        .partner-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .partner-name {
          font-weight: 600;
          font-size: 14px;
        }
        .partner-role {
          font-size: 12px;
          color: #909692;
        }

        /* ── PHOTO / RECEIPT TAB ── */
        .photo-tab {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Drop zone */
        .upload-dropzone {
          border: 2px dashed #d0d7de;
          border-radius: 10px;
          background: #fafbfc;
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
          text-align: center;
        }
        .upload-dropzone:hover, .dz--over {
          border-color: #0FBF3E;
          background: #f0f6ff;
        }
        .dz--uploading {
          cursor: default;
          border-color: #0FBF3E;
          background: #f0fff4;
        }
        .dz-icon {
          color: #909692;
          margin-bottom: 4px;
          transition: color 0.18s;
        }
        .upload-dropzone:hover .dz-icon, .dz--over .dz-icon {
          color: #0FBF3E;
        }
        .dz-label {
          font-size: 15px;
          font-weight: 600;
          color: #1f2328;
          margin: 0;
        }
        .dz-link {
          color: #0FBF3E;
          text-decoration: underline;
        }
        .dz-hint {
          font-size: 12px;
          color: #909692;
          margin: 0;
        }
        .dz-uploading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 100%;
          max-width: 280px;
        }
        .dz-spinner {
          width: 32px; height: 32px;
          border: 3px solid #d0d7de;
          border-top-color: #0FBF3E;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dz-progress-bar {
          width: 100%;
          height: 6px;
          background: #eaeef2;
          border-radius: 6px;
          overflow: hidden;
        }
        .dz-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0FBF3E, #08872B);
          border-radius: 6px;
          transition: width 0.3s ease;
        }

        /* Error */
        .upload-error {
          background: #fff0f0;
          border: 1px solid #ffa8a8;
          border-radius: 6px;
          padding: 10px 14px;
          font-size: 13px;
          color: #d1242f;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .upload-error-dismiss {
          background: none;
          border: none;
          color: #d1242f;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          flex-shrink: 0;
        }

        /* Receipts section */
        .receipts-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .receipts-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .receipts-title {
          font-size: 15px;
          font-weight: 700;
          margin: 0;
          color: #1f2328;
        }
        .receipts-count {
          font-size: 12px;
          color: #909692;
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 12px;
          padding: 2px 8px;
        }
        .receipts-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 36px 16px;
          color: #909692;
          font-size: 13px;
          border: 1px solid #eaeef2;
          border-radius: 8px;
          background: #fafbfc;
          text-align: center;
        }
        .receipts-empty p { margin: 0; }

        /* Grid of receipt cards */
        .receipts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 14px;
        }
        .receipt-card {
          border: 1px solid #d0d7de;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.15s;
        }
        .receipt-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.09);
        }
        .receipt-preview {
          height: 120px;
          background: #f6f8fa;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .receipt-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .receipt-pdf-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #d1242f;
          font-size: 11px;
          font-weight: 700;
        }
        .receipt-info {
          padding: 8px 10px 4px;
          flex: 1;
        }
        .receipt-name {
          font-size: 12px;
          font-weight: 600;
          color: #1f2328;
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .receipt-meta {
          font-size: 11px;
          color: #909692;
          margin: 0;
        }
        .receipt-actions {
          display: flex;
          border-top: 1px solid #eaeef2;
        }
        .receipt-view-btn, .receipt-del-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 7px 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: transparent;
          text-decoration: none;
          transition: background 0.12s;
        }
        .receipt-view-btn {
          color: #0FBF3E;
          border-right: 1px solid #eaeef2;
        }
        .receipt-view-btn:hover { background: #f0f6ff; }
        .receipt-del-btn {
          color: #d1242f;
        }
        .receipt-del-btn:hover { background: #fff0f0; }

        /* ── LOCATION TAB ── */
        .location-tab {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .location-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .location-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px;
          color: #1f2328;
        }
        .location-subtitle {
          font-size: 13px;
          color: #909692;
          margin: 0;
        }

        /* Origin card */
        .origin-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f0f6ff;
          border: 1px solid #b6d4fe;
          border-radius: 8px;
          padding: 14px 18px;
        }
        .origin-icon {
          font-size: 28px;
          flex-shrink: 0;
        }
        .origin-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .origin-label {
          font-size: 13px;
          font-weight: 700;
          color: #0550ae;
        }
        .origin-address {
          font-size: 13px;
          color: #444;
        }

        /* Stop cards grid */
        .stops-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }
        .stop-card {
          text-align: left;
          background: #fff;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 0;
          cursor: pointer;
          transition: box-shadow 0.18s, border-color 0.18s, transform 0.15s;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border-left: 4px solid var(--stop-color, #0FBF3E);
        }
        .stop-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.10);
          transform: translateY(-2px);
          border-color: var(--stop-color, #0FBF3E);
        }
        .stop-card--active {
          box-shadow: 0 0 0 3px var(--stop-color, #0FBF3E)40;
          border-color: var(--stop-color, #0FBF3E);
        }
        .stop-badge {
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          display: inline-block;
          width: fit-content;
          border-radius: 0 0 8px 0;
        }
        .stop-body {
          padding: 12px 14px 8px;
          flex: 1;
        }
        .stop-name {
          font-size: 14px;
          font-weight: 700;
          color: #1f2328;
          margin-bottom: 4px;
        }
        .stop-address {
          font-size: 12px;
          color: #909692;
          line-height: 1.5;
        }
        .stop-cta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--stop-color, #0FBF3E);
          padding: 8px 14px 12px;
        }

        /* Map */
        .map-wrapper {
          border: 1px solid #d0d7de;
          border-radius: 6px;
          overflow: hidden;
          min-height: 220px;
          background: #f6f8fa;
        }
        .map-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 220px;
          gap: 16px;
          color: #909692;
          font-size: 14px;
        }
        .map-placeholder p { margin: 0; }
        .map-idle svg { opacity: 0.5; }
        .map-error p { color: #d1242f; }
        .map-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #d0d7de;
          border-top-color: #0FBF3E;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Route summary */
        .route-summary {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 16px;
        }
        .summary-title {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 14px;
          color: #1f2328;
        }
        .summary-legs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .summary-leg {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .leg-index {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0FBF3E;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .leg-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 13px;
        }
        .leg-from, .leg-to {
          color: #1f2328;
          font-weight: 500;
        }
        .leg-arrow {
          color: #0FBF3E;
          font-size: 12px;
          font-weight: 600;
        }

        /* ── DOCUMENTS TAB ── */
        .documents-tab {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .doc-section {
          border: 1px solid #d0d7de;
          border-radius: 8px;
          background: #fff;
          overflow: hidden;
        }

        .doc-section-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
          background: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
        }

        .doc-section-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }

        .doc-section-title {
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 3px;
          color: #1f2328;
        }

        .doc-section-subtitle {
          font-size: 13px;
          color: #909692;
          margin: 0;
        }

        /* Drop zone */
        .doc-dropzone {
          margin: 16px 20px;
          border: 2px dashed #d0d7de;
          border-radius: 8px;
          background: #fafbfc;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
          text-align: center;
          min-height: 140px;
        }

        .doc-dropzone:hover, .doc-dropzone.dz--over {
          border-color: #0FBF3E;
          background: #f0f6ff;
        }

        .doc-dropzone.dz--processing {
          cursor: default;
          border-color: #0FBF3E;
          background: #f0f6ff;
        }

        .doc-dropzone.dz--processing.dz--audio {
          border-color: #8250df;
          background: #f5f0ff;
        }

        .doc-dz-icon { color: #909692; transition: color 0.18s; }
        .doc-dropzone:hover .doc-dz-icon,
        .doc-dropzone.dz--over .doc-dz-icon { color: #0FBF3E; }
        .doc-dz-audio { color: #8250df; }

        .dz-processing-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .dz-processing-label {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2328;
        }

        /* Spinners */
        .doc-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #d0d7de;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .doc-spinner-blue   { border-top-color: #0FBF3E; }
        .doc-spinner-purple { border-top-color: #8250df; }

        /* Error banner */
        .parse-error {
          margin: 0 20px 16px;
          background: #fff0f0;
          border: 1px solid #ffa8a8;
          border-radius: 6px;
          padding: 10px 14px;
          font-size: 13px;
          color: #d1242f;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .parse-error button {
          background: none;
          border: none;
          color: #d1242f;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          padding: 0 2px;
        }

        /* Result card */
        .parse-result {
          margin: 0 20px 20px;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          overflow: hidden;
        }

        .parse-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
          flex-wrap: wrap;
          gap: 8px;
        }

        .parse-result-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .parse-result-filename { font-size: 13px; font-weight: 700; color: #1f2328; }

        .parse-badge {
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          background: #0FBF3E;
          padding: 2px 7px;
          border-radius: 12px;
        }

        .parse-badge-audio { background: #8250df; }

        .parse-chars { font-size: 12px; color: #909692; }
        .parse-model { font-size: 11px; color: #8250df; font-style: italic; }

        .parse-result-actions { display: flex; gap: 6px; }

        .parse-action-btn {
          background: #fff;
          border: 1px solid #d0d7de;
          border-radius: 5px;
          padding: 3px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #24292f;
          cursor: pointer;
        }

        .parse-action-btn:hover { background: #f3f4f6; }

        .parse-action-clear { color: #d1242f; }
        .parse-action-clear:hover { background: #fff0f0; border-color: #ffa8a8; }

        /* Markdown viewer */
        .parse-markdown-viewer {
          margin: 0;
          padding: 14px 16px;
          font-size: 12.5px;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
          color: #1f2328;
          background: #fff;
          max-height: 360px;
          overflow-y: auto;
          border: none;
          border-bottom: 1px solid #d0d7de;
        }

        /* Ask AI panel */
        .ask-ai-section {
          padding: 14px 16px;
          background: #f9f9ff;
          border-top: 1px solid #e8e0ff;
        }

        .ask-ai-section-audio { background: #faf9ff; border-top-color: #e0d8ff; }

        .ask-ai-title {
          font-size: 13px;
          font-weight: 700;
          color: #6e40c9;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ask-ai-title-audio { color: #6e40c9; }

        .ask-ai-form {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .ask-ai-input {
          flex: 1;
          padding: 8px 12px;
          font-size: 13px;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          resize: vertical;
          font-family: inherit;
          line-height: 1.5;
        }

        .ask-ai-input:focus {
          outline: none;
          border-color: #8250df;
          box-shadow: 0 0 0 3px rgba(130,80,223,0.12);
        }

        .ask-ai-input-audio:focus { border-color: #8250df; }

        .ask-ai-btn {
          background: #8250df;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          align-self: flex-start;
        }

        .ask-ai-btn:hover { background: #6e40c9; }
        .ask-ai-btn:disabled { opacity: 0.5; cursor: default; }
        .ask-ai-btn-audio { background: #8250df; }
        .ask-ai-btn-audio:hover { background: #6e40c9; }

        .ask-ai-loading {
          display: flex;
          justify-content: center;
          padding: 12px 0;
        }

        .ask-ai-reply {
          margin-top: 12px;
          border: 1px solid #d0caf7;
          border-radius: 6px;
          overflow: hidden;
          background: #fff;
        }

        .ask-ai-reply-audio { border-color: #c9bdf7; }

        .ask-ai-reply-label {
          padding: 5px 12px;
          background: #efe8ff;
          font-size: 10px;
          font-weight: 800;
          color: #6e40c9;
          border-bottom: 1px solid #d0caf7;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .ask-ai-reply-label-audio { background: #ebe3ff; border-color: #c9bdf7; }

        .ask-ai-reply-body {
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.7;
          color: #1f2328;
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 400px;
          overflow-y: auto;
        }

        /* Markdown styles & tables */
        .preview-hr {
          height: 0;
          padding: 0;
          margin: 28px 0;
          border: 0;
          border-top: 2px dashed #e2e8f0;
        }
        .preview-blockquote {
          padding: 10px 16px;
          color: #475569;
          border-left: 4px solid #94a3b8;
          margin: 0 0 16px 0;
          background: #f8fafc;
          border-radius: 0 6px 6px 0;
          font-style: italic;
        }
        .inline-code {
          padding: 0.15em 0.45em;
          margin: 0;
          font-size: 85%;
          white-space: break-spaces;
          background-color: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 4px;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
          color: #92400e;
        }
        .preview-raw-code-block {
          padding: 16px 20px;
          overflow: auto;
          font-size: 85%;
          line-height: 1.5;
          background-color: #1e293b;
          border-radius: 8px;
          margin-bottom: 16px;
          color: #e2e8f0;
          border: 1px solid #334155;
        }
        .preview-raw-code-block code {
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
        }
        .preview-ul {
          padding-left: 22px;
          margin-top: 0 !important;
          margin-bottom: 16px !important;
          list-style-type: disc;
        }
        .preview-ol {
          padding-left: 22px;
          margin-top: 0 !important;
          margin-bottom: 16px !important;
          list-style-type: decimal;
        }
        .markdown-body-table {
          border-spacing: 0;
          border-collapse: separate;
          margin-top: 0;
          margin-bottom: 20px;
          width: 100%;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px;
          overflow: hidden;
        }
        .markdown-body-table th, .markdown-body-table td {
          padding: 10px 16px !important;
          border-bottom: 1px solid #e2e8f0 !important;
          border-right: 1px solid #e2e8f0 !important;
          font-size: 13px !important;
          line-height: 1.5;
        }
        .markdown-body-table th:last-child, .markdown-body-table td:last-child {
          border-right: none !important;
        }
        .markdown-body-table tr:last-child td {
          border-bottom: none !important;
        }
        .markdown-body-table tr {
          background-color: #ffffff;
        }
        .markdown-body-table tr:nth-child(2n) {
          background-color: #f8fafc;
        }
        .markdown-body-table tr:hover {
          background-color: #f0f7ff;
        }
        .markdown-body-table th {
          font-weight: 700 !important;
          background-color: #1e3a5f !important;
          color: #ffffff !important;
          font-size: 11px !important;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── REPO FILE EXPLORER STYLES ── */
        .info-tab {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* GitHub two-column layout for file explorer */
        .repo-two-col {
          display: grid;
          grid-template-columns: 1fr 296px;
          gap: 24px;
          align-items: start;
        }
        .repo-main-col {
          min-width: 0;
        }
        .repo-side-col {
          display: flex;
          flex-direction: column;
        }
        .repo-about-section {
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 14px 16px;
        }
        @media (max-width: 900px) {
          .repo-two-col {
            grid-template-columns: 1fr;
          }
          .repo-side-col {
            order: -1;
          }
        }

        .repo-actions-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          flex-wrap: wrap;
          gap: 12px;
        }

        .branch-and-path {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .branch-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 600;
          color: #24292f;
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 5px 12px;
          cursor: pointer;
        }

        .branch-btn:hover {
          background-color: #f3f4f6;
        }

        .dropdown-caret {
          font-size: 8px;
          margin-left: 4px;
          color: #57606a;
        }

        .repo-breadcrumbs {
          display: flex;
          align-items: center;
          font-size: 14px;
          font-weight: 600;
          color: #24292f;
        }

        .repo-root-name {
          color: #0FBF3E;
          cursor: pointer;
        }

        .repo-root-name:hover {
          text-decoration: underline;
        }

        .repo-slash {
          margin: 0 6px;
          color: #57606a;
          font-weight: 400;
        }

        .repo-actions-right {
          display: flex;
          gap: 8px;
        }

        .add-file-action-btn {
          font-weight: 600;
          font-size: 13px;
          padding: 5px 12px;
        }

        /* Commit Banner */
        .commit-header-banner {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-bottom: none;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          font-size: 13px;
          color: #24292f;
          flex-wrap: wrap;
          gap: 12px;
        }

        .commit-author-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0FBF3E;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 11px;
        }

        .commit-details {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 200px;
        }

        .commit-author-name {
          font-weight: 600;
          color: #24292f;
        }

        .commit-message {
          color: #57606a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 500px;
        }

        .commit-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #57606a;
        }

        .commit-hash {
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
          color: #24292f;
          font-weight: 500;
        }

        /* Files Table */
        .files-table-container {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
          background: #fff;
          overflow: hidden;
        }

        .files-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .ft-th {
          padding: 10px 16px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #6b7280;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        .ft-th-action {
          width: 40px;
        }

        .ft-th-type {
          width: 90px;
        }

        .ft-th-updated {
          width: 110px;
          text-align: right;
        }

        .file-row {
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.1s;
        }

        .file-row:last-child {
          border-bottom: none;
        }

        .file-row:hover {
          background-color: #f9fafb;
        }

        .files-table td {
          padding: 12px 16px;
          font-size: 13px;
          vertical-align: middle;
        }

        .file-name-cell {
          width: 28%;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .file-icon-wrapper {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .file-name-link {
          background: none;
          border: none;
          color: #111827;
          font-weight: 500;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
        }

        .file-name-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .file-desc-cell {
          width: 42%;
        }

        .file-desc-text {
          color: #6b7280;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 480px;
          font-size: 13px;
        }

        .file-type-cell {
          width: 90px;
        }

        .file-type-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          line-height: 18px;
        }

        .badge-md { background: #eff6ff; color: #2563eb; }
        .badge-pdf { background: #fef2f2; color: #dc2626; }
        .badge-xlsx { background: #ecfdf5; color: #0FBF3E; }
        .badge-audio { background: #faf5ff; color: #7c3aed; }
        .badge-folder { background: #f3f4f6; color: #6b7280; }
        .badge-default { background: #f3f4f6; color: #6b7280; }

        .file-date-cell {
          width: 110px;
          text-align: right;
          color: #6b7280;
          white-space: nowrap;
        }

        .file-date-text {
          font-size: 12px;
        }

        .file-action-cell {
          width: 40px;
          text-align: right;
        }

        .delete-file-btn {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s, color 0.1s;
          padding: 4px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
        }

        .file-row:hover .delete-file-btn {
          opacity: 1;
        }

        .delete-file-btn:hover {
          color: #dc2626;
          background-color: #fef2f2;
        }

        .empty-files-slate {
          text-align: center;
          padding: 48px 16px !important;
          color: #57606a;
        }

        .empty-files-slate h4 {
          margin: 12px 0 4px;
          color: #24292f;
          font-size: 16px;
        }

        .empty-files-slate p {
          font-size: 13px;
          margin: 0;
        }

        /* ── PREVIEW VIEW STYLES ── */
        .repo-preview-container {
          border: 1px solid #d0d7de;
          border-radius: 6px;
          background: #fff;
          overflow: hidden;
        }

        .repo-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
          flex-wrap: wrap;
          gap: 12px;
        }

        .breadcrumb-link-btn {
          background: none;
          border: none;
          color: #0FBF3E;
          font-weight: 600;
          font-size: 14px;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
        }

        .breadcrumb-link-btn:hover {
          text-decoration: underline;
        }

        .preview-filename {
          font-weight: 600;
          font-size: 14px;
          color: #24292f;
        }

        .preview-meta-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .preview-size-tag {
          font-size: 12px;
          color: #57606a;
        }

        .preview-format-toggle {
          display: inline-flex;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          overflow: hidden;
          background: #fff;
        }

        .preview-format-toggle .toggle-btn {
          border: none;
          background: #fff;
          font-size: 12px;
          font-weight: 500;
          color: #57606a;
          padding: 4px 10px;
          cursor: pointer;
          border-right: 1px solid #d0d7de;
        }

        .preview-format-toggle .toggle-btn:last-child {
          border-right: none;
        }

        .preview-format-toggle .toggle-btn.active {
          background-color: #f6f8fa;
          color: #24292f;
          font-weight: 600;
        }

        .btn-danger:hover {
          color: #fff !important;
          background-color: #cf222e !important;
          border-color: rgba(27,31,36,0.15) !important;
        }

        .repo-preview-body {
          background: #fff;
        }

        /* Markdown/Text previews */
        .preview-code-box {
          display: flex;
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
          font-size: 12px;
          line-height: 1.6;
          overflow-x: auto;
          background: #ffffff;
        }

        .preview-code-box .line-numbers {
          padding: 16px 8px;
          text-align: right;
          background: #fafbfc;
          border-right: 1px solid #d0d7de;
          color: rgba(27,31,36,0.3);
          user-select: none;
          min-width: 45px;
        }

        .preview-code-box .ln {
          height: 19.2px;
        }

        .preview-code-box .code-content {
          padding: 16px;
          margin: 0;
          overflow-x: auto;
          flex: 1;
          color: #24292f;
        }

        .preview-rendered-md {
          padding: 28px 36px;
          font-size: 14px !important;
          line-height: 1.75;
          color: #374151;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .preview-rendered-md h1 {
          font-size: 22px !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 12px;
          margin-top: 0 !important;
          margin-bottom: 22px !important;
          letter-spacing: -0.02em;
        }

        .preview-rendered-md h2 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #1e3a5f !important;
          background: #f0f7ff;
          border-left: 4px solid #2563eb;
          border-radius: 0 4px 4px 0;
          padding: 6px 10px 6px 12px;
          margin-top: 28px !important;
          margin-bottom: 14px !important;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .preview-rendered-md h3 {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #374151 !important;
          margin-top: 18px !important;
          margin-bottom: 8px !important;
          border-bottom: 1px dashed #e5e7eb;
          padding-bottom: 4px;
        }

        .preview-rendered-md h4 {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #6b7280 !important;
          margin-top: 14px !important;
          margin-bottom: 6px !important;
          font-style: italic;
        }

        .preview-rendered-md p {
          margin-top: 0 !important;
          margin-bottom: 14px !important;
          text-align: justify;
          hyphens: auto;
          font-size: 13.5px;
          color: #374151;
        }

        .preview-rendered-md li {
          margin-bottom: 6px !important;
          text-align: left;
          font-size: 13.5px;
          color: #374151;
        }

        .preview-rendered-md strong {
          font-weight: 700 !important;
          color: #111827 !important;
        }

        .preview-rendered-md em {
          font-style: italic !important;
          color: #4b5563;
        }

        .preview-rendered-md a {
          color: #2563eb !important;
          text-decoration: underline;
        }

        .preview-rendered-md a:hover {
          color: #1d4ed8;
        }

        /* Excel grid */
        .preview-excel-sheet {
          padding: 20px;
          background: #f6f8fa;
        }

        .excel-sheet-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #1f2328;
          padding: 8px 12px;
          background: #fff;
          border: 1px solid #d0d7de;
          border-bottom: none;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
        }

        .excel-grid-icon {
          font-size: 16px;
        }

        .excel-grid-container {
          overflow-x: auto;
          border: 1px solid #d0d7de;
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
          background: #fff;
        }

        .excel-grid {
          border-collapse: collapse;
          width: 100%;
          font-size: 13px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .excel-grid th, .excel-grid td {
          border: 1px solid #e1e4e8;
          padding: 6px 12px;
          text-align: left;
        }

        .excel-grid th {
          background-color: #f6f8fa;
          font-weight: 500;
          color: #586069;
          font-size: 11px;
          text-align: center;
          width: 40px;
          user-select: none;
        }

        .excel-grid td.excel-col-header {
          background-color: #e8f5e9;
          color: #1b5e20;
          font-weight: 600;
        }

        .excel-grid .row-num {
          background-color: #f6f8fa;
          color: #586069;
          font-weight: 500;
          text-align: center;
          font-size: 11px;
          width: 30px;
          user-select: none;
        }

        /* PDF Viewer simulated styles */
        .preview-pdf-view {
          padding: 24px;
          background: #8e9297;
          display: flex;
          justify-content: center;
          overflow-y: auto;
          max-height: 600px;
        }

        .pdf-page {
          background: #fff;
          width: 100%;
          max-width: 680px;
          min-height: 800px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 48px;
          box-sizing: border-box;
          font-family: 'Times New Roman', Times, serif;
          color: #111;
          display: flex;
          flex-direction: column;
        }

        .pdf-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .pdf-logo {
          font-size: 28px;
          color: #9a3412;
        }

        .pdf-logo-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 1px;
          color: #444;
        }

        .pdf-confidential {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 10px;
          font-weight: 800;
          color: #cf222e;
          letter-spacing: 0.5px;
        }

        .pdf-body {
          flex: 1;
        }

        .pdf-title {
          font-family: 'Times New Roman', Times, serif;
          font-size: 22px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0 6px;
          color: #000;
        }

        .pdf-subtitle {
          font-family: 'Times New Roman', Times, serif;
          font-size: 14px;
          font-style: italic;
          text-align: center;
          margin: 0 0 20px;
          color: #444;
        }

        .pdf-divider {
          border: none;
          border-top: 2px double #333;
          margin-bottom: 24px;
        }

        .pdf-text-p {
          font-size: 14.5px;
          line-height: 1.8;
          margin-bottom: 16px;
          text-align: justify;
          text-indent: 24px;
        }

        .pdf-signatures {
          margin-top: 48px;
          display: flex;
          justify-content: space-between;
          gap: 40px;
        }

        .pdf-sig-line {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-top: 1px solid #333;
          padding-top: 8px;
          text-align: center;
        }

        .sig-label {
          font-size: 11px;
          color: #555;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .sig-name {
          font-size: 13px;
          font-weight: bold;
          font-style: italic;
        }

        /* ── UPLOADER & CREATE VIEWS STYLES ── */
        .repo-upload-container, .repo-create-container {
          background: #fff;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 20px;
        }

        .upload-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #d0d7de;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }

        .upload-header-bar h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .close-upload-btn {
          background: none;
          border: none;
          font-size: 18px;
          color: #57606a;
          cursor: pointer;
        }

        .repo-dragzone {
          border: 2px dashed #d0d7de;
          border-radius: 6px;
          padding: 36px 20px;
          text-align: center;
          cursor: pointer;
          background: #fafbfc;
          transition: background 0.15s, border-color 0.15s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .repo-dragzone:hover, .repo-dragzone.dz--over {
          border-color: #0FBF3E;
          background: #f0f6ff;
        }

        .upload-dz-icon {
          color: #909692;
        }

        .repo-dragzone:hover .upload-dz-icon {
          color: #0FBF3E;
        }

        .dz-staged-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .staged-icon-wrapper {
          font-size: 32px;
        }

        .staged-filename {
          margin: 4px 0 2px;
          font-size: 15px;
          font-weight: 600;
        }

        .staged-meta {
          font-size: 12px;
          color: #57606a;
          margin: 0;
        }

        .repo-error-banner {
          background: #ffebe9;
          border: 1px solid rgba(255,129,130,0.4);
          color: #cf222e;
          border-radius: 6px;
          padding: 12px;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .repo-error-banner button {
          background: none;
          border: none;
          color: #cf222e;
          font-size: 16px;
          cursor: pointer;
        }

        /* Commit Form styling */
        .repo-commit-form {
          border: 1px solid #d0d7de;
          border-radius: 6px;
          overflow: hidden;
        }

        .commit-form-header {
          background: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
          padding: 10px 16px;
        }

        .commit-form-header h4 {
          margin: 0;
          font-size: 13.5px;
          font-weight: 600;
        }

        .commit-form-body {
          padding: 16px;
          background: #fff;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .commit-options {
          padding: 4px 0;
        }

        .commit-radio-label {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
        }

        .radio-text {
          font-size: 13px;
          color: #24292f;
        }

        .branch-code {
          background-color: #afb8c133;
          padding: 2px 5px;
          border-radius: 6px;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
          font-size: 12px;
        }

        /* Editor Mode */
        .create-editor-box {
          border: 1px solid #d0d7de;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 20px;
          background: #fff;
        }

        .editor-path-bar {
          background: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .editor-displayId {
          font-size: 13px;
          font-weight: 500;
          color: #57606a;
        }

        .editor-filename-input {
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 13px;
          font-family: inherit;
          max-width: 250px;
          background: #fff;
        }

        .editor-filename-input:focus {
          outline: none;
          border-color: #0FBF3E;
          box-shadow: 0 0 0 3px rgba(9,105,218,0.15);
        }

        .editor-content-input {
          width: 100%;
          border: none;
          padding: 16px;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
          font-size: 13px;
          resize: vertical;
          line-height: 1.5;
        }

        .editor-content-input:focus {
          outline: none;
        }

        /* ── DROPDOWN, MEETING, AND MODAL CSS ADDITIONS ── */
        .tab-add-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #57606a;
          transition: background-color 0.2s, border-color 0.2s, color 0.2s;
        }
        .tab-add-btn:hover {
          background: #ebeef2;
          border-color: #8c959f;
          color: #24292f;
        }
        .add-action-wrapper {
          position: relative;
        }
        .dropdown-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99;
          background: transparent;
        }
        .add-dropdown-menu {
          position: absolute;
          right: 0;
          top: 36px;
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
          list-style: none;
          padding: 4px 0;
          margin: 0;
          min-width: 180px;
          z-index: 100;
        }
        .add-dropdown-menu li {
          padding: 0;
          margin: 0;
        }
        .add-dropdown-menu button {
          width: 100%;
          background: none;
          border: none;
          padding: 8px 16px;
          font-size: 13.5px;
          color: #24292f;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background-color 0.15s;
        }
        .add-dropdown-menu button:hover {
          background-color: #f6f8fa;
          color: #0FBF3E;
        }
        .add-dropdown-menu button svg {
          color: #57606a;
        }
        .add-dropdown-menu button:hover svg {
          color: #0FBF3E;
        }

        /* Modal custom styling */
        .custom-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(27, 31, 36, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 16px;
          animation: modalFadeIn 0.2s ease-out;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .custom-modal-content {
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 12px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 520px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalSlideUp {
          from { transform: translateY(20px); }
          to { transform: translateY(0); }
        }
        .custom-modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid #d0d7de;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f6f8fa;
        }
        .custom-modal-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #24292f;
        }
        .custom-modal-close {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #57606a;
          padding: 4px;
          border-radius: 4px;
        }
        .custom-modal-close:hover {
          background-color: rgba(27, 31, 36, 0.08);
          color: #24292f;
        }
        .custom-modal-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .custom-modal-error {
          background: #ffebe9;
          color: #cf222e;
          border: 1px solid #ffc1c0;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 13px;
        }
        .custom-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .custom-form-group label {
          font-size: 13.5px;
          font-weight: 600;
          color: #24292f;
        }
        .custom-form-group input[type="text"],
        .custom-form-group input[type="number"],
        .custom-form-group textarea {
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          font-family: inherit;
          width: 100%;
          background: #ffffff;
        }
        .custom-form-group input:focus,
        .custom-form-group textarea:focus {
          outline: none;
          border-color: #0FBF3E;
          box-shadow: 0 0 0 3px rgba(9,105,218,0.15);
        }
        .custom-dragzone {
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          padding: 24px 16px;
          text-align: center;
          cursor: pointer;
          transition: background-color 0.15s, border-color 0.15s;
          background: #fafbfe;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .custom-dragzone:hover {
          background: #f1f5f9;
          border-color: #0FBF3E;
        }
        .dragzone-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .upload-cloud-icon {
          font-size: 28px;
        }
        .dragzone-text {
          font-size: 13.5px;
          color: #334155;
        }
        .dragzone-hint {
          font-size: 12px;
          color: #64748b;
        }
        .staged-file-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .file-preview-icon {
          font-size: 32px;
        }
        .file-preview-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #0FBF3E;
          max-width: 250px;
          word-break: break-all;
        }
        .file-preview-size {
          font-size: 12px;
          color: #64748b;
        }
        .modal-progress-bar-container {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
          margin-top: -8px;
        }
        .modal-progress-bar {
          height: 100%;
          background: #0FBF3E;
          transition: width 0.1s;
        }
        .custom-modal-footer {
          padding: 16px 20px;
          border-top: 1px solid #d0d7de;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f6f8fa;
        }

        /* Meeting room styling */
        .meet-joining-container {
          background-color: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 32px;
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .meet-joining-layout {
          display: flex;
          gap: 48px;
          max-width: 960px;
          width: 100%;
          align-items: center;
        }
        @media (max-width: 800px) {
          .meet-joining-layout {
            flex-direction: column;
            gap: 24px;
          }
        }
        .preview-column {
          flex: 1.3;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }
        .video-box-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background-color: #202124;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .video-box {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .meeting-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background-color: #000;
        }
        .video-avatar-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #202124;
        }
        .avatar-text {
          font-size: 48px;
          color: #ffffff;
          font-weight: 500;
          background: #3c4043;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .video-overlay-left {
          position: absolute;
          top: 16px;
          left: 16px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        }
        .video-overlay-right {
          position: absolute;
          top: 16px;
          right: 16px;
        }
        .icon-overlay-btn {
          background: rgba(0,0,0,0.4);
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-overlay-btn:hover {
          background: rgba(0,0,0,0.6);
        }
        .video-controls-overlay {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 10;
        }
        .circle-btn {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, transform 0.1s;
        }
        .circle-btn:hover {
          background: rgba(255,255,255,0.3);
        }
        .circle-btn:active {
          transform: scale(0.95);
        }
        .circle-btn.btn-off {
          background: #ea4335;
          border-color: #ea4335;
        }
        .circle-btn.btn-off:hover {
          background: #d93025;
        }
        
        .device-selectors {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }
        .selector-group {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8f9fa;
          border: 1px solid #dadce0;
          border-radius: 20px;
          padding: 6px 16px;
          flex: 1;
          min-width: 180px;
        }
        .device-icon {
          color: #5f6368;
        }
        .device-select {
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 500;
          color: #3c4043;
          width: 100%;
          outline: none;
          cursor: pointer;
        }
        
        .join-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
        }
        .join-title {
          font-size: 28px;
          font-weight: 400;
          color: #202124;
          margin-bottom: 24px;
        }
        .join-actions-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 220px;
        }
        .meet-btn-primary {
          background-color: #1a73e8;
          color: white;
          border: none;
          border-radius: 24px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 1px 2px rgba(60,64,67,0.3);
        }
        .meet-btn-primary:hover {
          background-color: #1557b0;
          box-shadow: 0 1px 3px rgba(60,64,67,0.3), 0 4px 8px rgba(60,64,67,0.15);
        }
        .meet-btn-secondary {
          background-color: transparent;
          color: #1a73e8;
          border: 1px solid #dadce0;
          border-radius: 24px;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
        }
        .meet-btn-secondary:hover {
          background-color: #f8f9fa;
        }
        .chevron-down {
          font-size: 8px;
        }

        /* Active Joined Meeting */
        .joined-meeting-container {
          background-color: #202124;
          border-radius: 8px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-height: 520px;
        }
        .meeting-grid {
          display: flex;
          gap: 16px;
          flex: 1;
        }
        @media (max-width: 700px) {
          .meeting-grid {
            flex-direction: column;
          }
        }
        .meeting-card {
          flex: 1;
          aspect-ratio: 16/10;
          background-color: #3c4043;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .meeting-avatar-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fallback-initials {
          font-size: 40px;
          color: #ffffff;
          font-weight: 500;
          background: #0078d4;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .client-avatar .fallback-initials {
          background: #e28743;
        }
        .meeting-card-name {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background-color: rgba(0,0,0,0.5);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .audio-wave {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 3px;
          align-items: flex-end;
          height: 16px;
        }
        .audio-wave span {
          width: 3px;
          height: 60%;
          background: #8ab4f8;
          animation: wave 1.2s ease-in-out infinite;
          border-radius: 2px;
        }
        .audio-wave span:nth-child(2) {
          animation-delay: 0.15s;
          height: 80%;
        }
        .audio-wave span:nth-child(3) {
          animation-delay: 0.3s;
          height: 40%;
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .meeting-controls-bar {
          display: flex;
          justify-content: center;
          gap: 16px;
          padding-top: 12px;
          border-top: 1px solid #3c4043;
        }
        .control-btn {
          background: #3c4043;
          border: none;
          color: white;
          font-size: 18px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        .control-btn:hover {
          background: #4f5256;
        }
        .control-btn.disabled {
          background: #ea4335;
        }
        .control-btn.disabled:hover {
          background: #d93025;
        }
        .end-call-btn {
          width: auto;
          border-radius: 24px;
          padding: 0 20px;
          font-size: 14px;
          font-weight: 600;
          background: #ea4335;
        }
        .end-call-btn:hover {
          background: #d93025;
        }
      `}</style>

      {/* ── RECORDING UPLOAD MODAL ── */}
      {isUploadRecordingOpen && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h3>Upload recording to {displayId}</h3>
              <button 
                className="custom-modal-close" 
                onClick={() => {
                  setIsUploadRecordingOpen(false);
                  setRecordingFile(null);
                  setRecordingDesc("");
                  setRecordingError("");
                }}
                type="button"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUploadRecordingSubmit}>
              <div className="custom-modal-body">
                {recordingError && (
                  <div className="custom-modal-error">
                    ⚠️ {recordingError}
                  </div>
                )}
                
                <div 
                  className="custom-dragzone"
                  onClick={() => document.getElementById("recording-file-input")?.click()}
                >
                  <input 
                    type="file" 
                    id="recording-file-input"
                    accept="audio/*,video/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (!/\.(mp3|mp4|wav|m4a|ogg|aac|flac)$/i.test(f.name)) {
                          setRecordingError("Please select a valid audio/video file (MP3, MP4, WAV, M4A, etc.)");
                          return;
                        }
                        setRecordingFile(f);
                        setRecordingError("");
                      }
                    }}
                  />
                  {recordingFile ? (
                    <div className="staged-file-preview">
                      <span className="file-preview-icon">🎵</span>
                      <span className="file-preview-name">{recordingFile.name}</span>
                      <span className="file-preview-size">{formatSize(recordingFile.size)}</span>
                    </div>
                  ) : (
                    <div className="dragzone-placeholder">
                      <span className="upload-cloud-icon">☁️</span>
                      <span className="dragzone-text">Drag audio/video recording here or <strong>browse</strong></span>
                      <span className="dragzone-hint">Supports MP3, MP4, WAV, M4A up to 50MB</span>
                    </div>
                  )}
                </div>

                {recordingUploading && (
                  <div className="modal-progress-bar-container">
                    <div className="modal-progress-bar" style={{ width: `${recordingUploadProgress}%` }}></div>
                  </div>
                )}

                <div className="custom-form-group">
                  <label htmlFor="recording-description">Description / Advisory Notes</label>
                  <textarea 
                    id="recording-description" 
                    placeholder="e.g. Raw discussion recording of shareholder agreement buyout drafts..."
                    value={recordingDesc}
                    onChange={(e) => setRecordingDesc(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="custom-modal-footer">
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={!recordingFile || recordingUploading}
                >
                  {recordingUploading ? "Uploading..." : "Upload Recording"}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setIsUploadRecordingOpen(false);
                    setRecordingFile(null);
                    setRecordingDesc("");
                    setRecordingError("");
                  }}
                  disabled={recordingUploading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD EXPENSE MODAL ── */}
      {isAddExpenseOpen && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h3>Add Expense to {displayId}</h3>
              <button 
                className="custom-modal-close" 
                onClick={() => {
                  setIsAddExpenseOpen(false);
                  setExpenseAmount("");
                  setExpenseReceiptFile(null);
                  setExpenseReceiptDataUrl("");
                  setExpenseDesc("");
                  setExpenseError("");
                }}
                type="button"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddExpenseSubmit}>
              <div className="custom-modal-body">
                {expenseError && (
                  <div className="custom-modal-error">
                    ⚠️ {expenseError}
                  </div>
                )}
                
                <div className="custom-form-group">
                  <label htmlFor="expense-amount">Amount (RM)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    id="expense-amount" 
                    placeholder="0.00" 
                    value={expenseAmount} 
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required
                    style={{ fontSize: "16px", fontWeight: "600", color: "#1f2328" }}
                  />
                </div>

                <div className="custom-form-group">
                  <label>Receipt Upload (Photo / PDF)</label>
                  <div 
                    className="custom-dragzone"
                    onClick={() => document.getElementById("expense-file-input")?.click()}
                  >
                    <input 
                      type="file" 
                      id="expense-file-input"
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          if (!/\.(jpe?g|png|webp|pdf)$/i.test(f.name)) {
                            setExpenseError("Receipt must be an image (JPG, PNG, WebP) or PDF");
                            return;
                          }
                          setExpenseReceiptFile(f);
                          setExpenseError("");
                        }
                      }}
                    />
                    {expenseReceiptFile ? (
                      <div className="staged-file-preview">
                        <span className="file-preview-icon">🧾</span>
                        <span className="file-preview-name">{expenseReceiptFile.name}</span>
                        <span className="file-preview-size">{formatSize(expenseReceiptFile.size)}</span>
                      </div>
                    ) : (
                      <div className="dragzone-placeholder">
                        <span className="upload-cloud-icon">📷</span>
                        <span className="dragzone-text">Drag receipt image/PDF here or <strong>browse</strong></span>
                        <span className="dragzone-hint">Supports JPEG, PNG, WebP, PDF</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="custom-form-group">
                  <label htmlFor="expense-description">Description</label>
                  <textarea 
                    id="expense-description" 
                    placeholder="e.g. Travel claims for client site visit regarding trust deed signing..."
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="custom-modal-footer">
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={expenseSaving}
                >
                  {expenseSaving ? "Saving..." : "Add Expense"}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setIsAddExpenseOpen(false);
                    setExpenseAmount("");
                    setExpenseReceiptFile(null);
                    setExpenseReceiptDataUrl("");
                    setExpenseDesc("");
                    setExpenseError("");
                  }}
                  disabled={expenseSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
