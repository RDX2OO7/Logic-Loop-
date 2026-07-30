import { CopilotData } from './types';

export const mockCopilotData: CopilotData = {
  normalized_problem: "Automated dining hall food waste monitoring and dynamic meal forecasting platform for university campus dining systems",
  pipelineStatus: "approved",
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
    tech_stack: ["Python 3.11", "PyTorch", "YOLOv8", "FastAPI", "React 18", "Next.js 14", "Tailwind CSS", "PostgreSQL", "Mosquitto MQTT", "Docker"],
    apis_needed: ["Open-Meteo Historical Weather API", "University Campus Academic Calendar API"],
    milestones: [
      {
        name: "Phase 1: Dataset & Edge Setup",
        description: "Collect 2,000 campus tray images, train initial YOLOv8 classification model, assemble ESP32 hardware prototype.",
        duration_days: 7,
        subtasks: [
          "Annotate 2,000 tray image dataset using Roboflow",
          "Train baseline YOLOv8 nano model for low-latency edge inference",
          "Flash ESP32-CAM firmware with encrypted MQTT client",
          "Set up local Mosquitto MQTT broker and Redis stream listener"
        ],
        deliverables: ["Trained YOLOv8 weights file (.pt & .onnx)", "Operational ESP32 hardware node prototype"],
        tech_focus: ["Python", "YOLOv8", "PyTorch", "ESP32", "MQTT"]
      },
      {
        name: "Phase 2: Demand Prediction Engine",
        description: "Ingest student timetable & weather APIs, train Temporal Fusion Transformer, achieve <8% MAPE prediction error.",
        duration_days: 10,
        subtasks: [
          "Build weather & timetable API ingestion pipeline in FastAPI",
          "Feature engineering for campus density & exam schedule indicators",
          "Train PyTorch Forecasting Temporal Fusion Transformer (TFT)",
          "Implement model evaluation suite and automated retraining triggers"
        ],
        deliverables: ["Demand forecasting microservice endpoint", "Validated model with <8% MAPE error"],
        tech_focus: ["FastAPI", "PyTorch", "Pandas", "TimescaleDB"]
      },
      {
        name: "Phase 3: Kitchen Integration UI & WebSockets",
        description: "Build Next.js kitchen display system with dynamic prep alerts, real-time waste analytics, and exportable reports.",
        duration_days: 7,
        subtasks: [
          "Develop React/Next.js UI components using Tailwind CSS & Lucide icons",
          "Implement Zustand client state and TanStack Query data caching",
          "Integrate WebSocket live feed for real-time kitchen station alerts",
          "Build interactive metrics dashboard with Recharts visualization"
        ],
        deliverables: ["Full-featured Kitchen Display System (KDS) UI", "Live WebSocket telemetry streaming"],
        tech_focus: ["React 18", "Next.js 14", "Tailwind CSS", "Zustand", "WebSockets"]
      },
      {
        name: "Phase 4: Pilot Deployment & Verification",
        description: "Deploy 2 camera nodes in hostel dining hall for 4 days, measure over-prep reduction vs baseline.",
        duration_days: 4,
        subtasks: [
          "Containerize application services with Docker & Docker Compose",
          "Set up CI/CD pipeline with GitHub Actions for automated deployment",
          "Mount 2 camera nodes in campus dining hall prep area",
          "Conduct 4-day operational validation and calculate food waste savings"
        ],
        deliverables: ["Live production deployment on Render & Vercel", "Verified 4-day waste reduction evaluation report"],
        tech_focus: ["Docker", "GitHub Actions", "Vercel", "Render", "Sentry"]
      }
    ],
    tech_stack_breakdown: {
      frontend_ui: ["React 18", "Next.js 14 App Router", "Tailwind CSS", "Zustand State Management", "Recharts & Lucide Icons"],
      backend_api: ["Python 3.11", "FastAPI Async Web Framework", "WebSockets / SSE", "Mosquitto MQTT Broker"],
      database_storage: ["PostgreSQL 16 with TimescaleDB Extension", "Redis Stream & Caching Cluster", "MinIO / S3 Object Storage"],
      ai_ml_data: ["PyTorch 2.2", "YOLOv8 Edge Inference Engine", "Temporal Fusion Transformer (TFT)", "ONNX Runtime"],
      dev_ops_deployment: ["Docker Containerization", "Vercel Frontend Hosting", "Render Cloud API Services", "GitHub Actions CI/CD"]
    },
    ui_implementation_plan: {
      design_system: "Modern high-contrast dark navy theme (#15193D) with vibrant amber accents (#F5A623), clean card elevation, responsive flex/grid layouts, dynamic micro-animations, and real-time status pills.",
      core_views: [
        {
          page_name: "Executive Analytics Dashboard",
          purpose: "Provides kitchen managers real-time total waste metrics, campus meal attendance forecasts, and cost savings widgets.",
          key_components: ["Live Waste Meter KPI Cards", "Meal Forecast Comparison Chart", "Real-Time Prep Advisory Widget"]
        },
        {
          page_name: "Live Kitchen Prep Display (KDS)",
          purpose: "High-visibility tablet interface for prep station chefs showing real-time dish volume recommendations updated every 15 minutes.",
          key_components: ["Station Dish Queues", "Prep Alert Cards", "Quick-Adjust Serving Size Buttons"]
        },
        {
          page_name: "Tray Computer Vision Telemetry",
          purpose: "Monitors edge node camera health, frame inference logs, and waste classification accuracy metrics.",
          key_components: ["Live Camera Video Feed", "YOLO Bounding Box Inspector", "Node Connection Status Grid"]
        }
      ],
      state_management: "Zustand for client UI state, TanStack Query for server state caching with auto-retry, and native WebSockets for streaming live tray analytics without page reloads."
    },
    data_flow_and_endpoints: [
      {
        endpoint: "POST /api/v1/telemetry/frame",
        method: "POST",
        purpose: "Ingests encrypted tray images from ESP32 edge nodes and runs YOLOv8 waste volume classification.",
        payload_summary: "{ node_id: string, image_b64: string, timestamp: ISO8601 } → { waste_pct: float, items: [] }"
      },
      {
        endpoint: "GET /api/v1/forecast/meal-prep",
        method: "GET",
        purpose: "Calculates optimized cooking quantities for upcoming meal windows based on student schedules and weather.",
        payload_summary: "{ meal_type: string, date: string } → { recommended_kg: number, confidence: float }"
      },
      {
        endpoint: "WS /api/v1/ws/live-feed",
        method: "WS",
        purpose: "Streams real-time waste alerts and queue adjustments directly to kitchen display tablets.",
        payload_summary: "Subscribes to station topics; pushes { station_id: string, delta_prep_pct: number }"
      }
    ],
    deployment_strategy: {
      hosting_environments: "Frontend UI hosted on Vercel Edge Network. Core FastAPI Backend & Redis hosted on Render Cloud. PostgreSQL DB managed on Supabase with TimescaleDB for time-series logs.",
      ci_cd_pipeline: "GitHub Actions workflow triggers on 'main' push: linting, pytest suite, Docker image build pushed to GitHub Container Registry, followed by automated Vercel & Render zero-downtime deployment.",
      environment_variables: ["DATABASE_URL", "REDIS_URL", "MQTT_BROKER_HOST", "JWT_SECRET", "NEXT_PUBLIC_WS_URL"],
      monitoring_and_logs: "Sentry for client and API error tracking, Prometheus metrics endpoint for request latency monitoring, and Grafana dashboard for kitchen sensor uptime."
    }
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
