import { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from "@react-google-maps/api";

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
  if (cleanId.includes("acme")) {
    return [
      {
        id: "acme-readme",
        name: "README.md",
        type: "md",
        size: 750,
        description: "AcmeCorp Estate Planning & Shareholder Succession Plan",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        content: `# AcmeCorp Estate Planning & Shareholder Succession Plan

Welcome to the AcmeCorp secure wealth management repository. This repository contains strategic documents regarding founder succession, tax projections, and trust agreements.

## Document Structure
- \`client-info/\`: Corporate registration, shareholder listings, and intake notes.
- \`conversation history/\`: Advisory chat logs and email transcriptions.
- \`meeting/\`: Agendas and alignment meeting minutes.
- \`proposals/\`: Buy-sell agreement drafts and generation-skipping trust terms.
- \`resources/\`: Capital gains calculation models and yield sheets.

---
*Confidential wealth advisory records. Managed by Bruce Wayne, Wealth Planner.*`
      },
      {
        id: "acme-1",
        name: "client-info/AcmeCorp_Corporate_Profile.pdf",
        type: "pdf",
        size: 1258291,
        description: "Corporate profile and founder asset division overview",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        content: "SIMULATED_PDF_ACME",
      },
      {
        id: "acme-5",
        name: "client-info/Intake_Advisory_Notes.md",
        type: "md",
        size: 320,
        description: "Client advisory intake notes: moderate risk tolerance",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
        content: `# Client Advisory Intake Notes
- **Client**: Acme Corp Founders
- **Risk Tolerance**: Moderate-Conservative
- **Key Objective**: Wealth preservation and asset transition
- **Transition Target**: 45% corporate shares transfer to family trust deed`
      },
      {
        id: "acme-2",
        name: "proposals/Shareholder_Agreement_Clause_Draft.docx",
        type: "docx",
        size: 460800,
        description: "Draft clause on buyout rights upon member decease",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        content: "SIMULATED_DOCX_ACME",
      },
      {
        id: "acme-3",
        name: "resources/2025_Tax_Projections_Calculations.xlsx",
        type: "xlsx",
        size: 184320,
        description: "Tax bracket projections & corporate capital gains assessment",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        content: "SIMULATED_XLSX_ACME",
      },
      {
        id: "acme-4",
        name: "meeting/Meeting_Minutes_2026-06-18.md",
        type: "md",
        size: 1536,
        description: "Alignment minutes: Estate structure discussion",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        content: `# Meeting Minutes: AcmeCorp Estate Alignment
**Date:** June 18, 2026
**Participants:** Bruce Wayne (Advisor), Acme Corp Board, Legal Counsel

## Executive Summary
The meeting focused on establishing the succession protocol and tax-efficient asset transfer of corporate holdings.

## Key Decisions
- **Revocable Trust**: 45% of voting shares will be transferred to a revocable family trust by Q3.
- **Tax Optimization**: Tax counsel proposed a structure to defer capital gains tax during transition.

## Action Items
1. **Advisor**: Finalize the tax projection calculations sheet.
2. **Legal**: Draft modified shareholder buyout provisions.
3. **Board**: Approve the transition roadmap at the next quarterly meeting.`,
      },
      {
        id: "acme-chat",
        name: "conversation history/Initial_Consultation_Chat_Transcript.md",
        type: "md",
        size: 980,
        description: "Initial consultation transcript regarding trust deeds",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
        content: `# Initial consultation chat transcript
**Date**: June 10, 2026

- **Bruce (Advisor)**: Hello, let's discuss setting up the Generation-Skipping Trust for AcmeCorp holdings.
- **Acme Founder**: We want to make sure the transition has minimal capital gains exposure.
- **Bruce (Advisor)**: Understood. I will prepare tax projections and draft the transition roadmap in the proposals folder.`
      }
    ];
  } else if (cleanId.includes("globex")) {
    return [
      {
        id: "globex-readme",
        name: "README.md",
        type: "md",
        size: 780,
        description: "Globex Holdings Asset Protection Trust Structure",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
        content: `# Globex Holdings Asset Protection Trust Structure

Secure folder containing legal structures for the Globex Irrevocable Wealth Trust and overseas asset allocation.

## Folders
- \`client-info/\`: Trust deeds, settlor profiles, and milestone requirements.
- \`conversation history/\`: Consultations on reporting and regulatory compliance.
- \`meeting/\`: Minutes on asset distributions.
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
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        content: "SIMULATED_PDF_GLOBEX",
      },
      {
        id: "globex-compliance",
        name: "conversation history/Regulatory_Compliance_Brief.pdf",
        type: "pdf",
        size: 450000,
        description: "Overview of foreign holding disclosure requirements",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
        content: "SIMULATED_PDF_GLOBEX_COMPLIANCE",
      },
      {
        id: "globex-2",
        name: "resources/Trust_Fund_Asset_Allocation_Q2.xlsx",
        type: "xlsx",
        size: 97280,
        description: "Asset breakdown, yields, and growth projections",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        content: "SIMULATED_XLSX_GLOBEX",
      },
      {
        id: "globex-3",
        name: "meeting/Meeting_Transcript_2026-06-12.md",
        type: "md",
        size: 1200,
        description: "Offshore structures discussion notes",
        uploadedBy: "advisor-bot",
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
        id: "globex-proposal",
        name: "proposals/Milestone_Distribution_Amendment.docx",
        type: "docx",
        size: 210000,
        description: "Resolution proposing milestone payouts",
        uploadedBy: "advisor-bot",
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
        size: 730,
        description: "Smith Family Last Will & Testament Records",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
        content: `# Smith Family Last Will & Testament Records

Advisory repository for the Smith family estate planning. Holds current Will drafts, executor duties, and asset inventories.

## Folder Index
- \`client-info/\`: Family certificates and registration profiles.
- \`conversation history/\`: Consultation conversations about executor choices.
- \`meeting/\`: Family alignment meeting minutes.
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
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
        content: "SIMULATED_PDF_SMITH",
      },
      {
        id: "smith-chats",
        name: "conversation history/Executor_Choice_Discussions.md",
        type: "md",
        size: 850,
        description: "Chat logs regarding choice of primary and alternate executors",
        uploadedBy: "advisor-bot",
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
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        content: "SIMULATED_PDF_SMITH_EXEC",
      },
      {
        id: "smith-3",
        name: "resources/Asset_Inventory_Review.xlsx",
        type: "xlsx",
        size: 122880,
        description: "Family assets inventory and account numbers",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        content: "SIMULATED_XLSX_SMITH",
      },
      {
        id: "smith-4",
        name: "meeting/Meeting_Transcript_2026-06-19.md",
        type: "md",
        size: 980,
        description: "Smith Will final review alignment notes",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        content: `# Smith Will Review Meeting
**Date:** June 19, 2026

## Summary
Reviewed the asset allocation parameters. The primary residence will go to the spouse, and liquid savings split equally among the children.

## Actions
- Update Will draft with correct spelling of guardians' names.
- Schedule notary appointment.`,
      }
    ];
  } else if (cleanId.includes("wayne")) {
    return [
      {
        id: "wayne-readme",
        name: "README.md",
        type: "md",
        size: 710,
        description: "Wayne Enterprises Executive Succession Plan",
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
        content: `# Wayne Enterprises Executive Succession & Contingency Plan

Confidential governance planning and key man security documents.

## Structure
- \`client-info/\`: Corporate board resolutions and identity records.
- \`conversation history/\`: Leadership pathways consultations.
- \`meeting/\`: Board governance alignment minutes.
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
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        content: "SIMULATED_PDF_WAYNE",
      },
      {
        id: "wayne-qa",
        name: "conversation history/Transition_Pathways_Q&A.md",
        type: "md",
        size: 1100,
        description: "Q&A regarding operational control transition",
        uploadedBy: "advisor-bot",
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
        uploadedBy: "advisor-bot",
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        content: "SIMULATED_XLSX_WAYNE",
      },
      {
        id: "wayne-3",
        name: "meeting/Meeting_Transcript_2026-06-15.md",
        type: "md",
        size: 1650,
        description: "Succession alignment meeting notes",
        uploadedBy: "advisor-bot",
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
        id: "wayne-buyout",
        name: "proposals/Emergency_Buyout_Agreement_Draft.docx",
        type: "docx",
        size: 380000,
        description: "Contingency buyout provisions draft",
        uploadedBy: "advisor-bot",
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
      uploadedBy: "advisor-bot",
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      content: `# General Advisory Plan Overview

Advisory folder. Organised as follows:
- \`client-info/\`: Profiling documents.
- \`conversation history/\`: Transcripts.
- \`meeting/\`: Meeting minutes.
- \`proposals/\`: Draft contracts.
- \`resources/\`: Allocation spreadsheets.`
    },
    {
      id: "def-1",
      name: "client-info/Client_General_Advisory_Profile.pdf",
      type: "pdf",
      size: 512000,
      description: "General client profile and intake records",
      uploadedBy: "advisor-bot",
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      content: "SIMULATED_PDF_GEN",
    },
    {
      id: "def-2",
      name: "resources/Financial_Assessment_Q1.xlsx",
      type: "xlsx",
      size: 78500,
      description: "Asset distribution assessment spreadsheet",
      uploadedBy: "advisor-bot",
      uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      content: "SIMULATED_XLSX_GEN",
    },
    {
      id: "def-3",
      name: "meeting/Kickoff_Meeting_Minutes.md",
      type: "md",
      size: 950,
      description: "Initial consultation kickoff notes",
      uploadedBy: "advisor-bot",
      uploadedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      content: `# Kickoff Meeting Minutes
**Date:** June 10, 2026

## Discussion
Established relationship parameters, client risk tolerance, and advisory objectives.

## Actions
- Set up regular monthly planning check-ins.`,
    },
    {
      id: "def-chat",
      name: "conversation history/Initial_Consultation_Chat_Transcript.md",
      type: "md",
      size: 820,
      description: "Initial client chat transcript",
      uploadedBy: "advisor-bot",
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
      uploadedBy: "advisor-bot",
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      content: "SIMULATED_DOCX_GEN",
    }
  ];
};

export default function ClientRepo() {
  const router = useRouter();
  const { id } = router.query;
  const displayId = id ? id.replace(/_/g, "/") : "Loading...";
  const [activeTab, setActiveTab] = useState("info");
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

  useEffect(() => {
    if (!displayId || displayId === "Loading...") return;
    const localKey = `advisory_files_${displayId}`;
    const saved = localStorage.getItem(localKey);
    let parsed = null;
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        parsed = null;
      }
    }
    
    const hasNewFormat = parsed && parsed.some(f => f.name.includes("/") || f.name.toLowerCase() === "readme.md");
    
    if (hasNewFormat) {
      setAdvisoryFiles(parsed);
    } else {
      const def = getDefaultAdvisoryFiles(displayId);
      localStorage.setItem(localKey, JSON.stringify(def));
      setAdvisoryFiles(def);
    }
  }, [displayId]);

  const saveFiles = (newFiles) => {
    setAdvisoryFiles(newFiles);
    localStorage.setItem(`advisory_files_${displayId}`, JSON.stringify(newFiles));
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
      const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
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
        } else if (matchText.startsWith("`")) {
          const content = matchText.substring(1, matchText.length - 1);
          inlineElements.push(<code key={idx++} className="inline-code">{content}</code>);
        } else if (matchText.startsWith("[")) {
          const linkText = matchText.substring(1, matchText.indexOf("]"));
          const linkUrl = matchText.substring(matchText.indexOf("(") + 1, matchText.length - 1);
          inlineElements.push(<a key={idx++} href={linkUrl} target="_blank" rel="noreferrer">{linkText}</a>);
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
        listItems.push(<li key={`li-${i}`}>{parseInline(content)}</li>);
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
      if (line.startsWith("### ")) {
        elements.push(<h3 key={`h3-${i}`} className="preview-h3">{parseInline(line.substring(4))}</h3>);
        continue;
      }
      
      if (line.startsWith("> ")) {
        elements.push(<blockquote key={`bq-${i}`} className="preview-blockquote">{parseInline(line.substring(2))}</blockquote>);
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
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // Selangor stops — real addresses in Selangor, Malaysia
  const stops = [
    {
      id: 1,
      label: "Stop 1",
      name: "Ara Damansara Medical Centre",
      address: "Jalan Lapangan Terbang Subang, Ara Damansara, 47820 Petaling Jaya, Selangor",
      lat: 3.1132,
      lng: 101.5744,
      color: "#0969da",
    },
    {
      id: 2,
      label: "Stop 2",
      name: "IOI City Mall",
      address: "IOI Resort City, 62502 Putrajaya, Selangor",
      lat: 2.9723,
      lng: 101.7229,
      color: "#1f883d",
    },
    {
      id: 3,
      label: "Stop 3",
      name: "Shah Alam Convention Centre (SACC)",
      address: "Persiaran Perbandaran, Seksyen 14, 40000 Shah Alam, Selangor",
      lat: 3.0778,
      lng: 101.5183,
      color: "#9a3412",
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
    const allowedExtensions = /\.(pdf|docx?|pptx?|xlsx?|txt|md|markdown|html?)$/i;
    if (!allowedExtensions.test(file.name)) {
      setRepoUploadError("Unsupported file type. Supported: PDF, DOCX, PPTX, XLSX, TXT, MD, HTML");
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
      uploadedBy: "advisor-bot",
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
      uploadedBy: "advisor-bot",
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
          <div className="breadcrumb">
            <Link href="/dashboard" className="back-link">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
                <path d="M11.28 3.22a.75.75 0 0 0-1.06 0L5.47 7.97a.75.75 0 0 0 0 1.06l4.75 4.75a.75.75 0 0 0 1.06-1.06L7.06 8l4.22-4.22a.75.75 0 0 0 0-1.06Z"></path>
              </svg>
              Dashboard
            </Link>
            <span className="separator">/</span>
            <span className="repo-name">{displayId}</span>
            <span className="badge">Public</span>
          </div>
          <div className="repo-actions">
            <button className="action-btn">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm6.5-5.5a.75.75 0 0 1 .75.75v4.25h4.25a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75v-5a.75.75 0 0 1 .75-.75Z"></path></svg>
              Watch <span className="count">1</span>
            </button>
            <button className="action-btn">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>
              Fork <span className="count">0</span>
            </button>
            <button className="action-btn">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>
              Star <span className="count">4</span>
            </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <nav className="repo-tabs">
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
                className={`tab-item ${activeTab === "photo" ? "active" : ""}`}
                onClick={() => setActiveTab("photo")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h.94a.76.76 0 0 1 .03-.028 10.098 10.098 0 0 1 5.28-1.472 10.098 10.098 0 0 1 5.28 1.472.748.748 0 0 1 .03.028h.94a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25H1.75Zm12.5 11c-.538-.724-1.282-1.341-2.204-1.785a8.598 8.598 0 0 0-4.046-.965 8.598 8.598 0 0 0-4.046.965c-.922.444-1.666 1.061-2.204 1.785H1.75A1.75 1.75 0 0 1 0 13.25V2.75C0 1.784.784 1 1.75 1h12.5C15.216 1 16 1.784 16 2.75v10.5A1.75 1.75 0 0 1 13.25 15h-.002a2.228 2.228 0 0 0-.05-.043 11.59 11.59 0 0 0-6.198-1.707A11.59 11.59 0 0 0 1.802 14.96a2.25 2.25 0 0 0-.05.042H1.75v-1.5h12.5v1.5ZM5.75 7.5a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5ZM7 5.75a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0Z"></path></svg>
                Photo
              </button>
            </li>
            <li>
              <button 
                className={`tab-item ${activeTab === "location" ? "active" : ""}`}
                onClick={() => setActiveTab("location")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M8 0a5.53 5.53 0 0 0-5.5 5.5c0 3.16 4.69 9.38 5.06 9.87a.55.55 0 0 0 .88 0C8.81 14.88 13.5 8.66 13.5 5.5A5.53 5.53 0 0 0 8 0Zm0 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"></path></svg>
                Location
              </button>
            </li>
            <li>
              <button
                className={`tab-item ${activeTab === "documents" ? "active" : ""}`}
                onClick={() => setActiveTab("documents")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 8.75 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"></path></svg>
                Documents
              </button>
            </li>
          </ul>
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
                accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.md,.markdown,.html,.htm"
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
                                <div className="dz-progress-fill" style={{ width: `${repoUploadProgress}%`, height: '100%', background: '#0969da' }}></div>
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
                            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="#656d76" style={{ marginRight: 6 }}>
                              <path d="M11.75 2.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-6 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm4.25 11.25H3.75v-1.5a.25.25 0 0 1 .25-.25h8a.25.25 0 0 1 .25.25v1.5ZM4.5 1.5a2.25 2.25 0 0 0-2.25 2.25v4.5A2.25 2.25 0 0 0 4.5 10.5h7a2.25 2.25 0 0 0 2.25-2.25v-4.5A2.25 2.25 0 0 0 11.5 1.5h-7Z" />
                            </svg>
                            <span>main</span>
                            <span className="dropdown-caret">▼</span>
                          </button>
                          <div className="repo-breadcrumbs" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <button className="breadcrumb-link-btn" style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "#0969da", cursor: "pointer", fontWeight: 500 }} onClick={() => { setCurrentPath(""); setSelectedFile(null); }}>
                              {displayId}
                            </button>
                            {currentPath && currentPath.split("/").map((part, index, arr) => {
                              const pathUpToNow = arr.slice(0, index + 1).join("/");
                              return (
                                <span key={index} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <span className="repo-slash" style={{ color: "#57606a" }}>/</span>
                                  <button className="breadcrumb-link-btn" style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "#0969da", cursor: "pointer", fontWeight: index === arr.length - 1 ? 600 : 500 }} onClick={() => { setCurrentPath(pathUpToNow); setSelectedFile(null); }}>
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
                          <tbody>
                            {/* 1. Parent row if currentPath is not empty */}
                            {currentPath !== "" && (
                              <tr className="file-row parent-directory-row">
                                <td className="file-name-cell" colSpan="4">
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
                                    <td colSpan="4" className="empty-files-slate">
                                      <svg aria-hidden="true" height="32" viewBox="0 0 24 24" version="1.1" width="32" fill="#656d76">
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
                                  <svg className="file-icon" height="16" viewBox="0 0 16 16" width="16" fill="#656d76"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 8.75 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"/></svg>
                                );

                                if (isFolder) {
                                  icon = (
                                    <svg className="file-icon folder-icon" height="16" viewBox="0 0 16 16" width="16" fill="#54aeff">
                                      <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2A1.75 1.75 0 0 0 5 1H1.75ZM1.5 2.75a.25.25 0 0 1 .25-.25H5c.18 0 .35.09.45.25l.9 1.2a1.75 1.75 0 0 0 1.4 1.8h5.5a.25.25 0 0 1 .25.25v8.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V2.75Z" />
                                    </svg>
                                  );
                                } else if (item.type === "xlsx" || item.type === "xls") {
                                  icon = (
                                    <svg className="file-icon excel-icon" height="16" viewBox="0 0 16 16" width="16" fill="#1f883d"><path d="M1 1.75C1 .784 1.784 0 2.75 0h8.5c.966 0 1.75.784 1.75 1.75v12.5A1.75 1.75 0 0 1 11.25 16h-8.5A1.75 1.75 0 0 1 1 14.25V1.75ZM2.75 1.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5Z"/><path d="M4 4.75a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 4.75Zm0 3a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 7.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"/></svg>
                                  );
                                } else if (item.type === "pdf") {
                                  icon = (
                                    <svg className="file-icon pdf-icon" height="16" viewBox="0 0 16 16" width="16" fill="#d1242f"><path d="M2.75 0A1.75 1.75 0 0 0 1 1.75v12.5C1 15.216 1.784 16 2.75 16h10.5A1.75 1.75 0 0 0 15 14.25V4.664a1.75 1.75 0 0 0-.513-1.237L11.573.513A1.75 1.75 0 0 0 10.336 0H2.75ZM2.5 1.75a.25.25 0 0 1 .25-.25h7.5v2.75c0 .966.784 1.75 1.75 1.75h2.75v8.25a.25.25 0 0 1-.25.25H2.75a.25.25 0 0 1-.25-.25V1.75Zm10 2.5h-2.25a.25.25 0 0 1-.25-.25V1.75L12.5 4.25Z"/></svg>
                                  );
                                } else if (item.type === "md" || item.type === "markdown") {
                                  icon = (
                                    <svg className="file-icon md-icon" height="16" viewBox="0 0 16 16" width="16" fill="#0969da"><path d="M1.75 1.5A1.75 1.75 0 0 0 0 3.25v9.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 16 12.75v-9.5A1.75 1.75 0 0 0 14.25 1.5H1.75ZM1.5 3.25a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v9.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25v-9.5Z"/><path d="M3.25 5h1.5a.75.75 0 0 1 .75.75v2.583L7 6.136a.75.75 0 0 1 .99 0l1.5 1.2.75-.6a.75.75 0 0 1 .25-.564V7.5a.75.75 0 0 1-1.5 0v-.673l-.6.48a.75.75 0 0 1-.99 0l-1.5-1.2-1.41 1.13A.75.75 0 0 1 4 7.5v-1.75a.75.75 0 0 1 .75-.75Z"/></svg>
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
                        polylineOptions: { strokeColor: "#0969da", strokeWeight: 5, strokeOpacity: 0.85 },
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
                        <svg className="octicon octicon-file" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="#656d76">
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
                                uploadedBy: "advisor-bot",
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
                        <svg className="octicon octicon-file" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true" fill="#656d76">
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
                                uploadedBy: "advisor-bot",
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

        </div>
      </main>

      <style jsx>{`
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
          padding-top: 16px;
        }
        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          font-size: 20px;
          gap: 8px;
        }
        .back-link {
          color: #0969da;
          text-decoration: none;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .separator {
          color: #656d76;
        }
        .repo-name {
          font-weight: 600;
          color: #0969da;
        }
        .badge {
          font-size: 12px;
          color: #656d76;
          border: 1px solid #d0d7de;
          border-radius: 2em;
          padding: 2px 8px;
          font-weight: 500;
          margin-left: 8px;
        }

        .repo-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          color: #24292f;
          padding: 3px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .action-btn:hover {
          background: #f3f4f6;
          border-color: rgba(27,31,36,0.15);
        }
        .action-btn .count {
          background: #ffffff;
          padding: 0 6px;
          border-radius: 12px;
          font-weight: 600;
          border: 1px solid #d0d7de;
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
          border-bottom: 2px solid #fd8c73;
        }
        .tab-item svg {
          color: #656d76;
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
          background-color: #1f883d;
          color: #ffffff;
          border: 1px solid rgba(31, 35, 40, 0.15);
          border-radius: 6px;
          padding: 5px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary:hover {
          background-color: #1a7f37;
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
          color: #656d76;
          font-size: 14px;
          max-width: 400px;
          margin: 0;
        }
        .blank-slate-small {
          padding: 24px;
          text-align: center;
          color: #656d76;
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
          color: #656d76;
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
          color: #656d76;
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
          border-color: #0969da;
          background: #f0f6ff;
        }
        .dz--uploading {
          cursor: default;
          border-color: #1f883d;
          background: #f0fff4;
        }
        .dz-icon {
          color: #656d76;
          margin-bottom: 4px;
          transition: color 0.18s;
        }
        .upload-dropzone:hover .dz-icon, .dz--over .dz-icon {
          color: #0969da;
        }
        .dz-label {
          font-size: 15px;
          font-weight: 600;
          color: #1f2328;
          margin: 0;
        }
        .dz-link {
          color: #0969da;
          text-decoration: underline;
        }
        .dz-hint {
          font-size: 12px;
          color: #656d76;
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
          border-top-color: #1f883d;
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
          background: linear-gradient(90deg, #0969da, #1f883d);
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
          color: #656d76;
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
          color: #656d76;
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
          color: #656d76;
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
          color: #0969da;
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
          color: #656d76;
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
          border-left: 4px solid var(--stop-color, #0969da);
        }
        .stop-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.10);
          transform: translateY(-2px);
          border-color: var(--stop-color, #0969da);
        }
        .stop-card--active {
          box-shadow: 0 0 0 3px var(--stop-color, #0969da)40;
          border-color: var(--stop-color, #0969da);
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
          color: #656d76;
          line-height: 1.5;
        }
        .stop-cta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--stop-color, #0969da);
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
          color: #656d76;
          font-size: 14px;
        }
        .map-placeholder p { margin: 0; }
        .map-idle svg { opacity: 0.5; }
        .map-error p { color: #d1242f; }
        .map-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #d0d7de;
          border-top-color: #0969da;
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
          background: #0969da;
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
          color: #0969da;
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
          color: #656d76;
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
          border-color: #0969da;
          background: #f0f6ff;
        }

        .doc-dropzone.dz--processing {
          cursor: default;
          border-color: #0969da;
          background: #f0f6ff;
        }

        .doc-dropzone.dz--processing.dz--audio {
          border-color: #8250df;
          background: #f5f0ff;
        }

        .doc-dz-icon { color: #656d76; transition: color 0.18s; }
        .doc-dropzone:hover .doc-dz-icon,
        .doc-dropzone.dz--over .doc-dz-icon { color: #0969da; }
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

        .doc-spinner-blue   { border-top-color: #0969da; }
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
          background: #0969da;
          padding: 2px 7px;
          border-radius: 12px;
        }

        .parse-badge-audio { background: #8250df; }

        .parse-chars { font-size: 12px; color: #656d76; }
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
        .preview-ul {
          padding-left: 20px;
          margin-top: 0;
          margin-bottom: 16px;
          list-style-type: disc;
        }
        .preview-ol {
          padding-left: 20px;
          margin-top: 0;
          margin-bottom: 16px;
          list-style-type: decimal;
        }
        .preview-hr {
          height: 0.25em;
          padding: 0;
          margin: 24px 0;
          background-color: #d0d7de;
          border: 0;
        }
        .preview-blockquote {
          padding: 0 1em;
          color: #656d76;
          border-left: 0.25em solid #d0d7de;
          margin: 0 0 16px 0;
        }
        .inline-code {
          padding: 0.2em 0.4em;
          margin: 0;
          font-size: 85%;
          white-space: break-spaces;
          background-color: rgba(175, 184, 193, 0.2);
          border-radius: 6px;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
        }
        .preview-raw-code-block {
          padding: 16px;
          overflow: auto;
          font-size: 85%;
          line-height: 1.45;
          background-color: #f6f8fa;
          border-radius: 6px;
          margin-bottom: 16px;
        }
        .preview-raw-code-block code {
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
        }
        .markdown-body-table {
          border-spacing: 0;
          border-collapse: collapse;
          margin-top: 0;
          margin-bottom: 16px;
          width: 100%;
          overflow: auto;
        }
        .markdown-body-table th, .markdown-body-table td {
          padding: 6px 13px;
          border: 1px solid #d0d7de;
        }
        .markdown-body-table tr {
          background-color: #ffffff;
          border-top: 1px solid #d0d7de;
        }
        .markdown-body-table tr:nth-child(2n) {
          background-color: #f6f8fa;
        }
        .markdown-body-table th {
          font-weight: 600;
          background-color: #f6f8fa;
        }

        /* ── REPO FILE EXPLORER STYLES ── */
        .info-tab {
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          color: #0969da;
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
          background: #0969da;
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
          border: 1px solid #d0d7de;
          border-radius: 6px;
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

        .file-row {
          border-bottom: 1px solid #d0d7de;
          transition: background-color 0.1s;
        }

        .file-row:last-child {
          border-bottom: none;
        }

        .file-row:hover {
          background-color: #f6f8fa;
        }

        .files-table td {
          padding: 10px 16px;
          font-size: 14px;
          vertical-align: middle;
        }

        .file-name-cell {
          width: 30%;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .file-icon-wrapper {
          display: flex;
          align-items: center;
        }

        .file-name-link {
          background: none;
          border: none;
          color: #24292f;
          font-weight: 500;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
        }

        .file-name-link:hover {
          color: #0969da;
          text-decoration: underline;
        }

        .file-desc-cell {
          width: 55%;
        }

        .file-desc-text {
          color: #57606a;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 550px;
        }

        .file-date-cell {
          width: 10%;
          text-align: right;
          color: #57606a;
        }

        .file-date-text {
          font-size: 12px;
        }

        .file-action-cell {
          width: 5%;
          text-align: right;
        }

        .delete-file-btn {
          background: none;
          border: none;
          color: #57606a;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s, color 0.1s;
          padding: 4px;
          border-radius: 4px;
        }

        .file-row:hover .delete-file-btn {
          opacity: 1;
        }

        .delete-file-btn:hover {
          color: #cf222e;
          background-color: #ffebe9;
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
          color: #0969da;
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
          padding: 24px 32px;
          font-size: 14px;
          line-height: 1.6;
          color: #24292f;
        }

        .preview-rendered-md h1 {
          font-size: 24px;
          font-weight: 600;
          border-bottom: 1px solid #d0d7de;
          padding-bottom: 8px;
          margin-top: 0;
          margin-bottom: 16px;
        }

        .preview-rendered-md h2 {
          font-size: 20px;
          font-weight: 600;
          border-bottom: 1px solid #d0d7de;
          padding-bottom: 6px;
          margin-top: 24px;
          margin-bottom: 16px;
        }

        .preview-rendered-md h3 {
          font-size: 16px;
          font-weight: 600;
          margin-top: 20px;
          margin-bottom: 12px;
        }

        .preview-rendered-md p {
          margin-top: 0;
          margin-bottom: 16px;
        }

        .preview-rendered-md li {
          margin-bottom: 6px;
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
          border-color: #0969da;
          background: #f0f6ff;
        }

        .upload-dz-icon {
          color: #656d76;
        }

        .repo-dragzone:hover .upload-dz-icon {
          color: #0969da;
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
          border-color: #0969da;
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
      `}</style>
    </div>
  );
}
