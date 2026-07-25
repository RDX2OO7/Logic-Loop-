import { CopilotData } from './types';

export const mockCopilotData: CopilotData = {
  normalized_problem: "Automated dining hall food waste monitoring and dynamic meal forecasting platform for university campus dining systems",
  status: "done",
  agent_progress: [
    { name: "Discovery", status: "done", description: "Identified core waste vectors in dining halls" },
    { name: "DeepSearch", status: "done", description: "Retrieved 14 papers & 8 open-source repos" },
    { name: "Clustering", status: "done", description: "Grouped 42 signals into 4 research clusters" },
    { name: "Gap & Innovation", status: "done", description: "Extracted 3 novel innovation angles" },
    { name: "Planner", status: "done", description: "Structured 28-day production roadmap" },
    { name: "Curator", status: "done", description: "Indexed verified datasets & API specifications" },
    { name: "Critic", status: "done", description: "Validation complete (0 critical issues)" },
    { name: "Publisher", status: "done", description: "Generated verified project plan document" }
  ],
  sources: {
    papers: [
      {
        title: "Computer Vision Based Waste Quantification in Mass Catering Facilities",
        url: "https://arxiv.org/abs/2304.08912",
        snippet: "Demonstrates RGB-D tray imaging achieving 92.4% accuracy in post-meal plate waste volume estimation using lightweight YOLOv8 models.",
        source: "arXiv"
      },
      {
        title: "Predictive Demand Modeling in Campus Dining Services via Attention Transformers",
        url: "https://arxiv.org/abs/2311.04561",
        snippet: "Integrates student attendance schedules, weather patterns, and historical meal consumption to reduce over-prep by 34%.",
        source: "IEEE"
      },
      {
        title: "Edge AI Sensors for Kitchen Prep Waste Telemetry",
        url: "https://arxiv.org/abs/2309.11204",
        snippet: "Low-cost ESP32-CAM nodes mounted over disposal stations with edge inference for real-time ingredient logging.",
        source: "arXiv"
      }
    ],
    repos: [
      {
        name: "waste-vision-dataset",
        url: "https://github.com/example/waste-vision-dataset",
        stars: 412,
        description: "Annotated 12,000+ image dataset of food trays pre- and post-consumption with bounding boxes."
      },
      {
        name: "food-demand-forecaster",
        url: "https://github.com/example/food-demand-forecaster",
        stars: 289,
        description: "Temporal Fusion Transformer pipeline for mass dining hall meal reservation forecasting."
      },
      {
        name: "hostel-kitchen-telemetry",
        url: "https://github.com/example/hostel-kitchen-telemetry",
        stars: 154,
        description: "IoT micro-service for scale integration and automated kitchen log generation."
      }
    ],
    web: [
      {
        title: "UNEP Food Waste Index Report 2024 - Institutional Dining Insights",
        url: "https://www.unep.org/resources/report/food-waste-index-report-2024",
        snippet: "University dining halls generate an average of 0.4 lbs of waste per student per meal, primarily driven by uncalibrated prep volume."
      },
      {
        title: "Case Study: Modernizing University Food Procurement Systems",
        url: "https://example.org/case-studies/campus-food-prep",
        snippet: "Automated daily headcount predictions cut raw ingredient storage costs by 22% within 60 days."
      }
    ]
  },
  clusters: [
    { theme: "Computer Vision Waste Analytics", item_count: 14 },
    { theme: "Campus Demand & Weather Forecasting", item_count: 11 },
    { theme: "IoT Hardware & Disposal Telemetry", item_count: 9 },
    { theme: "Student Redistribution & Logistics", item_count: 8 }
  ],
  gaps: [
    "Existing solutions lack real-time feedback loops connecting tray waste data back to kitchen prep chefs during active meal windows.",
    "No open-source system integrates student timetable data directly into meal prediction models for hostel dining halls.",
    "Lack of privacy-preserving edge hardware architecture for mass dining facilities without streaming HD video to cloud servers."
  ],
  innovation_angles: [
    {
      angle: "Closed-Loop Prep Feedback System",
      why_novel: "Directly bridges plate-waste computer vision metrics into live kitchen prep queue adjustments during 2-hour meal shifts."
    },
    {
      angle: "Timetable-Informed Demand Transformer",
      why_novel: "Leverages university course schedule density and exam calendars as zero-lag predictors for meal attendance."
    },
    {
      angle: "Privacy-First Edge Waste Classification",
      why_novel: "On-device feature extraction ensures no identifiable student faces or personal items leave the local hardware node."
    }
  ],
  plan: {
    architecture: "Microservices architecture utilizing FastFCN edge camera nodes, FastAPI ingestion backend, Redis stream buffer, Temporal Fusion Transformer for demand prediction, and Next.js kitchen management dashboard.",
    tech_stack: ["Python 3.11", "PyTorch", "YOLOv8", "FastAPI", "React", "Tailwind CSS", "PostgreSQL", "Mosquitto MQTT"],
    milestones: [
      {
        name: "Phase 1: Dataset & Edge Setup",
        description: "Collect 2,000 campus tray images, train initial YOLOv8 classification model, assemble ESP32 hardware prototype.",
        duration_days: 7
      },
      {
        name: "Phase 2: Demand Prediction Engine",
        description: "Ingest student timetable & weather APIs, train Temporal Fusion Transformer, achieve <8% MAPE prediction error.",
        duration_days: 10
      },
      {
        name: "Phase 3: Kitchen Integration UI",
        description: "Build kitchen display system with dynamic prep alerts, real-time waste analytics, and exportable reports.",
        duration_days: 7
      },
      {
        name: "Phase 4: Pilot Test & Verification",
        description: "Deploy 2 camera nodes in hostel dining hall for 4 days, measure over-prep reduction vs baseline.",
        duration_days: 4
      }
    ]
  },
  resources: {
    datasets: [
      { name: "FoodSeg103 Multi-Class Food Dataset", url: "https://example.com/datasets/foodseg103" },
      { name: "Campus Hostel Meal Waste Logs (2023-2024)", url: "https://example.com/datasets/campus-waste-logs" }
    ],
    repos: [
      { name: "ultralytics/yolov8", url: "https://github.com/ultralytics/ultralytics" },
      { name: "pytorch/forecasting", url: "https://github.com/pytorch/forecasting" }
    ],
    apis: [
      { name: "Open-Meteo Historical Weather API", url: "https://open-meteo.com/" },
      { name: "University Campus Academic Calendar API", url: "https://example.edu/api/calendar" }
    ]
  },
  critic: {
    approved: true,
    issues: []
  }
};
