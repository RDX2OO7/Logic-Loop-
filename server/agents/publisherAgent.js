/**
 * publisherAgent.js
 * Pure templating — no LLM calls. Converts the final assembled draft JSON
 * into a Word document (.docx) and a PowerPoint presentation (.pptx).
 *
 * Brand palette (navy / amber — consistent with the rest of the project):
 *   Navy  #15193D
 *   Amber #F5A623
 *   White #FFFFFF
 *   Light grey for table alternating rows #F4F5F8
 */

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  ShadingType,
  BorderStyle,
  VerticalAlign,
} from "docx";
import PptxGenJS from "pptxgenjs";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";


// ─── Palette constants ────────────────────────────────────────────────────────
const NAVY  = "15193D";
const AMBER = "F5A623";
const WHITE = "FFFFFF";
const LIGHT = "F4F5F8";
const GREY  = "8892A4";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Wrap text in a styled TextRun */
function run(text, opts = {}) {
  return new TextRun({ text: String(text ?? ""), ...opts });
}

/** Heading paragraph using docx HeadingLevel */
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    children: [
      new TextRun({
        text,
        bold: true,
        color: NAVY,
        size: level === HeadingLevel.HEADING_1 ? 36 : 28,
      }),
    ],
  });
}

/** Plain body paragraph with optional left indent */
function body(text, opts = {}) {
  return new Paragraph({
    children: [run(text, { size: 22, color: "333333", ...opts })],
    spacing: { after: 120 },
  });
}

/** Bullet paragraph */
function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    children: [run(text, { size: 22, color: "333333" })],
    spacing: { after: 80 },
  });
}

/** Empty spacer paragraph */
function spacer() {
  return new Paragraph({ children: [run("")], spacing: { after: 200 } });
}

/**
 * Build the milestones table.
 * Columns: # | Milestone | Description | Days
 */
function buildMilestoneTable(milestones) {
  const headerCellStyle = {
    shading: { type: ShadingType.SOLID, color: NAVY, fill: NAVY },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  };

  const headerText = (label) =>
    new TableCell({
      ...headerCellStyle,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [run(label, { bold: true, color: WHITE, size: 20 })],
        }),
      ],
    });

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerText("#"),
      headerText("Milestone"),
      headerText("Description"),
      headerText("Days"),
    ],
  });

  const dataRows = milestones.map((m, i) => {
    const isEven = i % 2 === 0;
    const bg = isEven ? WHITE : LIGHT;

    const cell = (text, align = AlignmentType.LEFT) =>
      new TableCell({
        shading: { type: ShadingType.SOLID, color: bg, fill: bg },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [
          new Paragraph({
            alignment: align,
            children: [run(text, { size: 20, color: "222222" })],
          }),
        ],
      });

    return new TableRow({
      children: [
        cell(String(i + 1), AlignmentType.CENTER),
        cell(m.name),
        cell(m.description),
        cell(String(m.duration_days ?? "?"), AlignmentType.CENTER),
      ],
    });
  });

  // Total row
  const totalDays = milestones.reduce((s, m) => s + (m.duration_days || 0), 0);
  const totalRow = new TableRow({
    children: [
      new TableCell({
        columnSpan: 3,
        shading: { type: ShadingType.SOLID, color: AMBER, fill: AMBER },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [run("Total duration", { bold: true, size: 20, color: NAVY })],
          }),
        ],
      }),
      new TableCell({
        shading: { type: ShadingType.SOLID, color: AMBER, fill: AMBER },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [run(String(totalDays), { bold: true, size: 20, color: NAVY })],
          }),
        ],
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left:   { style: BorderStyle.NONE },
      right:  { style: BorderStyle.NONE },
      insideH:{ style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      insideV:{ style: BorderStyle.NONE },
    },
    rows: [headerRow, ...dataRows, totalRow],
  });
}

// ─── .docx builder ────────────────────────────────────────────────────────────

export async function buildDocx(draft, outPath = "output.docx") {
  const { topic, plan, innovation_angles, resources } = draft;
  const angle = innovation_angles?.[0] ?? {};
  const milestones = plan?.milestones ?? [];
  const techStack = plan?.tech_stack ?? [];
  const apisNeeded = plan?.apis_needed ?? [];

  const children = [
    // ── Cover ──
    heading(`ResearchOS Project Report`, HeadingLevel.HEADING_1),
    new Paragraph({
      children: [
        run(topic ?? "Research Project", {
          bold: true, size: 48, color: AMBER,
        }),
      ],
      spacing: { after: 400 },
    }),
    spacer(),

    // ── Innovation Angle ──
    heading("Innovation Angle", HeadingLevel.HEADING_2),
    body(angle.angle ?? "(none selected)"),
    spacer(),

    heading("Why This Is Novel", HeadingLevel.HEADING_2),
    body(angle.why_novel ?? ""),
    spacer(),

    // ── Architecture ──
    heading("System Architecture", HeadingLevel.HEADING_2),
    body(plan?.architecture ?? ""),
    spacer(),

    // ── Tech Stack ──
    heading("Technology Stack", HeadingLevel.HEADING_2),
    ...techStack.map(bullet),
    spacer(),

    // ── APIs ──
    heading("APIs & External Services", HeadingLevel.HEADING_2),
    ...(apisNeeded.length > 0
      ? apisNeeded.map(bullet)
      : [body("None specified.")]),
    spacer(),

    // ── Milestones ──
    heading("Project Milestones", HeadingLevel.HEADING_2),
    spacer(),
    buildMilestoneTable(milestones),
    spacer(),

    // ── Resources ──
    ...(resources?.repos?.length > 0
      ? [
          heading("Reference Repositories", HeadingLevel.HEADING_2),
          ...resources.repos.map((r) => bullet(`${r.name} — ${r.url}`)),
          spacer(),
        ]
      : []),
    ...(resources?.datasets?.length > 0
      ? [
          heading("Datasets", HeadingLevel.HEADING_2),
          ...resources.datasets.map((d) => bullet(d.url ?? d.name ?? String(d))),
          spacer(),
        ]
      : []),

    // ── Footer note ──
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        run("Generated by ResearchOS · Logic Loops", {
          size: 18, color: GREY, italics: true,
        }),
      ],
      spacing: { before: 400 },
    }),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [{ children }],
  });

  const dir = path.dirname(outPath);
  if (dir && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const buffer = await Packer.toBuffer(doc);
  writeFileSync(outPath, buffer);
  console.log(`[publisherAgent] ✅  .docx written → ${outPath}`);
  return outPath;
}

// ─── .pptx builder ───────────────────────────────────────────────────────────

export async function generatePptxBuffer(projectData) {
  const draft = {
    topic: projectData.title ?? projectData.normalized_problem,
    innovation_angles: projectData.chosen_angle ? [projectData.chosen_angle] : [],
    plan: projectData.plan,
    resources: projectData.resources ?? { datasets: [], repos: [], apis: [] },
  };
  const { topic, plan, innovation_angles, resources } = draft;
  const angle = innovation_angles?.[0] ?? {};
  const milestones = plan?.milestones ?? [];
  const techStack = plan?.tech_stack ?? [];
  const apisNeeded = plan?.apis_needed ?? [];
  const totalDays = milestones.reduce((s, m) => s + (m.duration_days || 0), 0);

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33" × 7.5"
  pptx.author = "ResearchOS · Logic Loops";
  pptx.subject = topic ?? "Research Project";
  pptx.title = topic ?? "Research Project";

  // ── Shared style helpers ──────────────────────────────────────────────────

  const addBackground = (slide, color = NAVY) => {
    slide.background = { color };
  };

  const titleText = (slide, text, y = 0.4) =>
    slide.addText(text, {
      x: 0.5, y, w: 12.33, h: 0.8,
      fontSize: 32, bold: true, color: WHITE, fontFace: "Calibri",
    });

  const accentBar = (slide) =>
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 1.25, w: 1.2, h: 0.08,
      fill: { color: AMBER }, line: { color: AMBER },
    });

  const bodyText = (slide, text, x, y, w, h, opts = {}) =>
    slide.addText(text, {
      x, y, w, h,
      fontSize: 14, color: "D0D4E8", fontFace: "Calibri",
      valign: "top", wrap: true,
      ...opts,
    });

  // ── Slide 1: Cover ───────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBackground(s);

    // Big amber accent rect on left edge
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.18, h: 7.5,
      fill: { color: AMBER }, line: { color: AMBER },
    });

    s.addText("ResearchOS", {
      x: 0.5, y: 0.8, w: 12, h: 0.6,
      fontSize: 18, bold: false, color: AMBER, fontFace: "Calibri",
    });
    s.addText(topic ?? "Research Project", {
      x: 0.5, y: 1.5, w: 12, h: 2.2,
      fontSize: 40, bold: true, color: WHITE, fontFace: "Calibri", wrap: true,
    });
    s.addText("AI-generated project brief · Logic Loops Hackathon", {
      x: 0.5, y: 5.8, w: 12, h: 0.5,
      fontSize: 13, color: GREY, fontFace: "Calibri", italic: true,
    });
  }

  // ── Slide 2: Innovation Angle ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBackground(s);
    titleText(s, "Innovation Angle");
    accentBar(s);

    bodyText(s, angle.angle ?? "", 0.5, 1.5, 12.33, 2.5, {
      fontSize: 16, color: WHITE, italic: false,
    });

    s.addText("WHY IT'S NOVEL", {
      x: 0.5, y: 4.0, w: 12.33, h: 0.35,
      fontSize: 11, bold: true, color: AMBER, fontFace: "Calibri",
    });
    bodyText(s, angle.why_novel ?? "", 0.5, 4.4, 12.33, 2.2);
  }

  // ── Slide 3: Architecture ────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBackground(s);
    titleText(s, "System Architecture");
    accentBar(s);
    bodyText(s, plan?.architecture ?? "", 0.5, 1.5, 12.33, 5.0);
  }

  // ── Slide 4: Tech Stack & APIs ───────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBackground(s);
    titleText(s, "Tech Stack & APIs");
    accentBar(s);

    // Two columns
    const stackRows = techStack.map((t) => [{ text: `• ${t}`, options: { color: WHITE } }]);
    if (stackRows.length > 0) {
      s.addTable(stackRows, {
        x: 0.5, y: 1.5, w: 5.5,
        fontSize: 14, fontFace: "Calibri",
        fill: { color: NAVY },
        border: { type: "none" },
      });
    }

    s.addText("APIs & Services", {
      x: 6.8, y: 1.5, w: 6, h: 0.4,
      fontSize: 13, bold: true, color: AMBER, fontFace: "Calibri",
    });
    const apiRows = (apisNeeded.length > 0 ? apisNeeded : ["None specified."]).map((a) => [
      { text: `• ${a}`, options: { color: WHITE } },
    ]);
    s.addTable(apiRows, {
      x: 6.8, y: 2.0, w: 6,
      fontSize: 13, fontFace: "Calibri",
      fill: { color: NAVY },
      border: { type: "none" },
    });
  }

  // ── Slide 5: Milestones table ────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBackground(s);
    titleText(s, "Project Milestones");
    accentBar(s);

    s.addText(`Total: ${totalDays} days`, {
      x: 10.0, y: 0.4, w: 3, h: 0.5,
      fontSize: 14, bold: true, color: AMBER, fontFace: "Calibri",
      align: "right",
    });

    const header = [
      { text: "#",           options: { bold: true, color: WHITE, fill: AMBER } },
      { text: "Milestone",   options: { bold: true, color: WHITE, fill: AMBER } },
      { text: "Description", options: { bold: true, color: WHITE, fill: AMBER } },
      { text: "Days",        options: { bold: true, color: WHITE, fill: AMBER } },
    ];

    const rows = milestones.map((m, i) => {
      const bg = i % 2 === 0 ? "1D2247" : "232959"; // subtle alternating navy tones
      return [
        { text: String(i + 1),        options: { color: WHITE, fill: bg, align: "center" } },
        { text: m.name,               options: { color: WHITE, fill: bg } },
        { text: m.description,        options: { color: "B0B8D0", fill: bg, fontSize: 11 } },
        { text: String(m.duration_days ?? "?"), options: { color: AMBER, fill: bg, align: "center", bold: true } },
      ];
    });

    s.addTable([header, ...rows], {
      x: 0.5, y: 1.45, w: 12.33,
      fontSize: 13, fontFace: "Calibri",
      border: { type: "solid", pt: 0.5, color: "2A2F5B" },
      rowH: 0.45,
    });
  }

  // ── Slide 6: Resources / Repos ───────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBackground(s);
    titleText(s, "Reference Resources");
    accentBar(s);

    const repos = resources?.repos ?? [];
    const items = repos.length > 0
      ? repos.map((r) => `• ${r.name}\n  ${r.url}`)
      : ["No repositories curated for this project."];

    bodyText(s, items.join("\n\n"), 0.5, 1.5, 12.33, 5.2, {
      fontSize: 13, color: "C0C8E0",
    });
  }

  // ── Slide 7: Thank-you / footer ──────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: AMBER };

    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.18, h: 7.5,
      fill: { color: NAVY }, line: { color: NAVY },
    });

    s.addText("Logic Loops", {
      x: 0.5, y: 2.0, w: 12.33, h: 1.0,
      fontSize: 52, bold: true, color: NAVY, fontFace: "Calibri", align: "center",
    });
    s.addText("Powered by ResearchOS", {
      x: 0.5, y: 3.2, w: 12.33, h: 0.5,
      fontSize: 18, color: NAVY, fontFace: "Calibri", align: "center", italic: true,
    });
  }

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return buffer;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * runPublisherAgent(draft, opts)
 * @param {object} draft  - The full assembled draft object
 * @param {object} [opts] - { docxPath, pptxPath }
 * @returns {{ docxPath, pptxPath }}
 */
export async function runPublisherAgent(draft, opts = {}) {
  const docxPath = opts.docxPath ?? "output.docx";
  const pptxPath = opts.pptxPath ?? "output.pptx";

  await buildDocx(draft, docxPath);
  buildPptx(draft, pptxPath);

  return { docxPath, pptxPath };
}

// ─── Orchestrator-facing aliases ──────────────────────────────────────────────
// The orchestrator imports generateDocxReport / generatePptxDeck as separate
// functions so it can inject them independently as deps for testing.

/**
 * resolveEvidenceSources(evidenceIds, sources)
 * Maps an array of evidence_id strings to { title, url } objects by looking
 * them up in the raw deepSearchResult (sources.papers / sources.repos / sources.web).
 * Returns an array of resolved objects; unresolvable ids are returned as-is.
 */
function resolveEvidenceSources(evidenceIds = [], sources = {}) {
  const pool = [
    ...(sources.papers ?? []),
    ...(sources.repos  ?? []),
    ...(sources.web    ?? []),
  ];
  const byId = new Map(pool.map((s) => [s.id, s]));

  return evidenceIds.map((id) => {
    const hit = byId.get(id);
    if (!hit) return { id, title: id, url: "" };
    return {
      id,
      title: hit.title ?? hit.name ?? id,
      url:   hit.url  ?? hit.html_url ?? "",
    };
  });
}

/**
 * generateDocxReport(projectData, fileName)
 * Accepts the orchestrator's projectData shape and emits a fully-populated
 * .docx with ALL sections present (honest empty-state fallback when data is
 * missing rather than silently dropping the section).
 *
 * Section order:
 *   1. Research Summary
 *   2. Identified Gaps
 *   3. Innovation Angle
 *   4. Sources Behind This Angle
 *   5. Architecture
 *   6. Tech Stack
 *   7. Roadmap
 *   8. Resources
 */
export async function generateDocxBuffer(projectData) {
  const angle     = projectData.chosen_angle ?? {};
  const plan      = projectData.plan ?? {};
  const resources = projectData.resources ?? {};
  const sources   = projectData.sources   ?? {};

  // ── Resolve evidence sources for the chosen angle ──────────────────────────
  const evidenceIds     = angle.evidence_ids ?? [];
  const resolvedSources = resolveEvidenceSources(evidenceIds, sources);

  // ── Gaps ───────────────────────────────────────────────────────────────────
  const gaps = Array.isArray(projectData.gaps) ? projectData.gaps : [];

  // ── Tech stack ─────────────────────────────────────────────────────────────
  const techStack  = Array.isArray(plan.tech_stack)  ? plan.tech_stack  : [];
  const milestones = Array.isArray(plan.milestones)  ? plan.milestones  : [];

  const children = [
    // ── Cover ────────────────────────────────────────────────────────────────
    heading("ResearchOS Project Report", HeadingLevel.HEADING_1),
    new Paragraph({
      children: [
        run(projectData.title ?? projectData.normalized_problem ?? "Research Project", {
          bold: true, size: 48, color: AMBER,
        }),
      ],
      spacing: { after: 400 },
    }),
    spacer(),

    // ── 1. Research Summary ──────────────────────────────────────────────────
    heading("Research Summary", HeadingLevel.HEADING_2),
    body(projectData.evidence_summary || "(No evidence summary available.)"),
    spacer(),

    // ── 2. Identified Gaps ───────────────────────────────────────────────────
    heading("Identified Gaps", HeadingLevel.HEADING_2),
    ...(gaps.length > 0
      ? gaps.map((g) => bullet(typeof g === "string" ? g : g.description ?? JSON.stringify(g)))
      : [body("(No gaps identified.)")]),
    spacer(),

    // ── 3. Innovation Angle ──────────────────────────────────────────────────
    heading("Innovation Angle", HeadingLevel.HEADING_2),
    body(angle.angle || "(No innovation angle selected.)"),
    ...(angle.why_novel
      ? [
          new Paragraph({
            children: [run("Why This Is Novel", { bold: true, size: 22, color: NAVY })],
            spacing: { after: 80 },
          }),
          body(angle.why_novel),
        ]
      : []),
    spacer(),

    // ── 4. Sources Behind This Angle ─────────────────────────────────────────
    heading("Sources Behind This Angle", HeadingLevel.HEADING_2),
    ...(resolvedSources.length > 0
      ? resolvedSources.map((s) =>
          new Paragraph({
            bullet: { level: 0 },
            children: [
              run(s.title, { size: 22, color: "333333" }),
              ...(s.url ? [run(`  — ${s.url}`, { size: 20, color: GREY, italics: true })] : []),
            ],
            spacing: { after: 80 },
          })
        )
      : [body("(No evidence sources linked to this angle.)")]),
    spacer(),

    // ── 5. Architecture ───────────────────────────────────────────────────────
    heading("Architecture", HeadingLevel.HEADING_2),
    body(plan.architecture || "(No architecture description available.)"),
    spacer(),

    // ── 6. Tech Stack ─────────────────────────────────────────────────────────
    heading("Tech Stack", HeadingLevel.HEADING_2),
    ...(techStack.length > 0 ? techStack.map(bullet) : [body("(No tech stack specified.)")]),
    spacer(),

    // ── 7. Roadmap ────────────────────────────────────────────────────────────
    heading("Roadmap", HeadingLevel.HEADING_2),
    ...(milestones.length > 0
      ? [spacer(), buildMilestoneTable(milestones), spacer()]
      : [body("(No milestones defined.)")]),
    spacer(),

    // ── 8. Resources ──────────────────────────────────────────────────────────
    heading("Resources", HeadingLevel.HEADING_2),
    ...((resources.repos ?? []).length > 0
      ? (resources.repos ?? []).map((r) => bullet(`${r.name} — ${r.url}`))
      : []),
    ...((resources.datasets ?? []).length > 0
      ? (resources.datasets ?? []).map((d) => bullet(d.url ?? d.name ?? String(d)))
      : []),
    ...(((resources.repos ?? []).length === 0 && (resources.datasets ?? []).length === 0)
      ? [body("(No resources curated.)")]
      : []),
    spacer(),

    // ── Footer ────────────────────────────────────────────────────────────────
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        run("Generated by ResearchOS · Logic Loops", {
          size: 18, color: GREY, italics: true,
        }),
      ],
      spacing: { before: 400 },
    }),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

export async function generateDocxReport(projectData, outputPath) {
  const buffer = await generateDocxBuffer(projectData);
  writeFileSync(outputPath, buffer);
  return outputPath;
}

export async function generatePptxDeck(projectData, outputPath) {
  const buffer = await generatePptxBuffer(projectData);
  writeFileSync(outputPath, buffer);
  return outputPath;
}

