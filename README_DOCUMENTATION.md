# ServeAi — Platform Documentation

**Bridging the gap between the informal workforce and community needs through agentic intelligence.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Key Features](#3-key-features)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [The 7-Agent Orchestration Pipeline](#6-the-7-agent-orchestration-pipeline)
7. [External API Integrations](#7-external-api-integrations)
8. [Data Schemas](#8-data-schemas)
9. [End-to-End Data Flow](#9-end-to-end-data-flow)
10. [Security and Privacy](#10-security-and-privacy)

---

## 1. Project Overview

ServeAi is a state-of-the-art, AI-driven, mobile-first service booking platform specifically engineered to empower the informal economy in emerging markets. The platform enables users to describe their service needs in natural language — including English, Urdu, and Roman Urdu — and receive an instantly bookable, localized service order within seconds.

At its core, ServeAi leverages advanced multi-agent orchestration to transform vague, code-switched user input into precise, structured booking transactions. The platform targets the critical gap between highly skilled informal laborers (mechanics, plumbers, AC technicians, carpenters, cleaners) and the communities that depend on them.

The user interface is built around a **Charcoal Black** (`#1E1E1E`) and **Sage Green** (`#8A9A5B`) visual identity — a premium aesthetic designed to inspire trust and usability in a traditionally fragmented market.

---

## 2. Problem Statement

In emerging economies, the informal service sector represents the backbone of daily life. Yet this sector suffers from systemic inefficiencies that both workers and consumers must navigate daily:

**Geospatial and Discovery Friction:** Highly skilled laborers lack digital visibility. Consumers are forced to search physically or rely entirely on word-of-mouth referrals, creating enormous friction in service discovery.

**Pricing Inconsistencies:** The absence of standardized rate structures leads to exhaustive negotiations, unfair pricing outcomes, and persistent trust deficits between service providers and clients.

**Language and Literacy Barriers:** The majority of workers and consumers in these markets communicate through localized code-switching — blending English, Urdu, and Roman Urdu in a single sentence. Conventional search filters and booking platforms are entirely incapable of parsing this intent.

**Lack of Operational Structure:** No formal booking pipelines, automated dispute resolution mechanisms, or real-time location and availability metrics exist for these essential workers.

ServeAi is purpose-built to resolve all four of these problems within a single unified platform.

---

## 3. Key Features

### Language-Agnostic Agentic AI Input

Users describe their requirements in plain voice or text — for example: *"AC thik krna hai G-13 mein, kal subah"*. ServeAi's Intent Parser Agent processes this input, identifies the service category, evaluates urgency, and converts the code-switched Roman Urdu or Urdu expression into structured, machine-readable criteria automatically.

### 7-Stage Multi-Agent Pipeline

Rather than relying on monolithic LLM completions — which introduce unpredictability and hallucination risk — ServeAi distributes cognitive processing across seven specialized, modular agents. Each agent has a single, well-defined responsibility and passes its structured output downstream to the next. This architecture ensures deterministic, auditable, and reliable execution at every stage of the booking lifecycle.

### Real-Time Location Awareness

Using `expo-location`, the client application dynamically tracks and transmits the user's live geographic coordinates. The backend uses these coordinates in both provider matchmaking and distance-based pricing calculations, ensuring all results are contextually anchored to the user's actual physical position.

### Dynamic Distance-Based Pricing

The platform integrates with the **Google Maps Distance Matrix API** to compute real road-network distances between service providers and users — not straight-line approximations. Pricing is derived mathematically in real time, incorporating base rates, travel distance, urgency level, and job complexity.

### Premium Charcoal Black and Sage Green UI

The interface is engineered for visual clarity and cognitive transparency:

- **Color System:** Sleek dark-mode background (`#1E1E1E`) paired with Sage Green (`#8A9A5B`) accents and deep slate secondary tones.
- **Layout Patterns:** Glassmorphism cards, animated booking timelines, custom active state indicators, and a floating AI-prompt command bar.
- **Agent Trace Visualization:** A dedicated "Agent Logs" screen exposes the full multi-agent cognitive trace with fluid micro-animations, giving users complete transparency into exactly why a specific provider was selected.

---

## 4. Technology Stack

ServeAi is built on a modern, scalable, three-tier architecture:

```
┌──────────────────────────────────────────────────────────────────┐
│                            FRONTEND                              │
│   React Native (Expo SDK) · TypeScript · Expo Router · Zustand   │
│   NativeWind (Tailwind CSS) · Reanimated · Expo Location         │
└──────────────────────────────┬───────────────────────────────────┘
                               │ HTTP / JSON REST API
┌──────────────────────────────▼───────────────────────────────────┐
│                             BACKEND                              │
│   Node.js · Express · TypeScript · Modular Agent Pipeline        │
│   MockDB (JSON-based localized state engine)                     │
└──────────────────────────────┬───────────────────────────────────┘
                               │ SDK / HTTP APIs
┌──────────────────────────────▼───────────────────────────────────┐
│                          INTEGRATIONS                            │
│   Google Gemini 2.5 Flash (@google/genai)                        │
│   Google Maps Distance Matrix API                                │
└──────────────────────────────────────────────────────────────────┘
```

### Frontend

| Component | Technology |
|---|---|
| Core Framework | React Native with Expo CLI |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| Client State | Zustand |
| Server State | TanStack Query (React Query) |
| Animations | React Native Reanimated (60fps) |
| Styling | NativeWind (Tailwind CSS for RN) |
| Location | expo-location |

### Backend

| Component | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| AI / LLM Layer | Google Gemini 2.5 Flash via `@google/genai` SDK |
| Proximity Service | Google Maps Distance Matrix API (via Axios) |
| Data Layer | Filesystem-based JSON state engine (MockDbService) |

---

## 5. System Architecture

ServeAi uses a decoupled, multi-tier topology that separates user interaction, AI orchestration, and data services into independently manageable layers.

```
graph TD
    subgraph Client Tier [React Native Expo App]
        A[Expo UI Components] <--> B[Zustand Local Store]
        A <--> C[TanStack Query]
        A --> D[expo-location Service]
    end

    subgraph Server Gateway [Node.js / Express API Gateway]
        E[Express Router] --> F[RequestController]
        G[AuthController]
        H[BookingController]
        I[DisputeController]
    end

    subgraph Orchestrator Core [Cognitive Processing Pipeline]
        J[AgentOrchestrator] --> K[1. IntentParserAgent]
        J --> L[2. ProviderDiscoveryAgent]
        J --> M[3. MatchingRankingAgent]
        J --> N[4. PricingAgent]
        J --> O[5. BookingExecutionAgent]
        J --> P[6. FollowUpDisputeAgent]
        J --> Q[7. TraceLoggerAgent]
    end

    subgraph Intelligence & Services [Service Layer]
        K <--> R[Gemini 2.5 Flash API]
        N <--> S[Google Maps API Wrapper]
        L <--> T[MockDbService]
        O <--> T
        P <--> T
        Q <--> T
    end

    subgraph Storage [Persistent Data Layer]
        T <--> U[(JSON File Databases)]
    end

    A <-->|HTTP JSON REST| E
    F -->|Process User Input| J
```

### Tier Descriptions

**Mobile Client (React Native + Expo):** A highly interactive mobile application structured via Expo Router. All client-side state is handled by Zustand; server-side query state and synchronization are managed by TanStack Query. Location data is streamed from `expo-location` and passed to the backend on active requests.

**API Gateway (Express + TypeScript):** A lightweight, typed Express server that hosts REST endpoints, manages routing, and instantiates controllers for request, booking, auth, and dispute workflows.

**Agentic Orchestrator (`AgentOrchestrator`):** The cognitive backbone of the platform. It coordinates the sequential execution of all seven agents, passing structured output from each stage as the input to the next.

**Service Layer (`GeminiService` and `MapsService`):** Encapsulates all external SDK interactions — LLM queries via Gemini 2.5 Flash and geographic routing via Google Maps Distance Matrix.

**Storage Layer (`MockDbService`):** A file-backed state engine that maintains full relational state for users, providers, bookings, disputes, and system notifications using structured JSON databases.

---

## 6. The 7-Agent Orchestration Pipeline

The defining architectural feature of ServeAi is its **7-stage multi-agent pipeline**. Each agent is modular, single-responsibility, and deterministic within its domain. This design eliminates the unpredictability of monolithic LLM prompting and provides a complete, human-readable audit trail of every booking decision.

```
                ┌──────────────────────────────┐
                │   1. Intent Parser Agent     │ ◄── Gemini 2.5 Flash
                └──────────────┬───────────────┘
                               │ Structured JSON Intent
                ┌──────────────▼───────────────┐
                │ 2. Provider Discovery Agent  │ ◄── DB Filter (Category + Sector)
                └──────────────┬───────────────┘
                               │ Candidate Provider List
                ┌──────────────▼───────────────┐
                │  3. Matching & Ranking Agent │ ◄── 6-Factor Weighted Algorithm
                └──────────────┬───────────────┘
                               │ Ranked Candidates
                ┌──────────────▼───────────────┐
                │    4. Dynamic Pricing Agent  │ ◄── Google Maps Distance Matrix
                └──────────────┬───────────────┘
                               │ Complete Fee Structure
                ┌──────────────▼───────────────┐
                │  5. Booking Execution Agent  │ ◄── DB Write (Booking Payload)
                └──────────────┬───────────────┘
                               │ Confirmed Booking State
                ┌──────────────▼───────────────┐
                │ 6. Follow-Up / Dispute Agent │ ◄── Auto-Resolution Logic
                └──────────────┬───────────────┘
                               │ Escalation Plan
                ┌──────────────▼───────────────┐
                │   7. Trace Logger Agent      │ ◄── Unified Audit Trail
                └──────────────────────────────┘
```

---

### Agent 1 — Intent Parser Agent (`IntentParserAgent.ts`)

**Role:** Resolves raw natural language user input into a structured JSON configuration.

**Engine:** Google Gemini 2.5 Flash, accessed via the `@google/genai` SDK with prompt engineering configured for deterministic JSON schema output.

**Linguistic Capability:** Handles English, Urdu, and Roman Urdu code-switching natively. Example input: *"mujhe Bahria Town me electrician chahiye kal subah".*

**Output Schema:**

```typescript
interface ExtractedIntent {
  service_type: string;        // e.g., 'ac_technician', 'plumber', 'electrician'
  location: string;            // e.g., 'G-13', 'Bahria Town'
  urgency: 'low' | 'medium' | 'high';
  preferred_time: string;      // e.g., 'morning', 'afternoon', 'tonight'
  language_detected: string;   // 'english' | 'urdu' | 'roman_urdu'
  complexity: 'Basic' | 'Intermediate' | 'Complex';
}
```

**Self-Correction Logic:** If required entities such as `service_type` or `location` are absent, the agent reduces its internal confidence score, sets `clarification_required: true`, and generates a context-aware conversational prompt requesting the missing parameters from the user.

---

### Agent 2 — Provider Discovery Agent (`ProviderDiscoveryAgent.ts`)

**Role:** Queries the mock database to extract a list of viable provider candidates matching the parsed intent.

**Logic:** Performs strict category filtering — matching the `service_type` extracted by Agent 1 — combined with geospatial sector filtering, verifying that the provider's declared service areas include the user's target location.

---

### Agent 3 — Matching and Ranking Agent (`MatchingRankingAgent.ts`)

**Role:** Performs Multi-Criteria Decision Analysis (MCDA) on the discovered provider pool to identify the optimal match.

**Weighted Scoring Factors:**

| Factor | Description |
|---|---|
| Proximity Priority | Alignment between user sector and provider service sector |
| Star Rating | Weighted average calculated from historical customer reviews |
| Review Count | Total review volume to prevent bias from low-sample high ratings |
| Availability / Capacity | Verification that the provider is not locked in concurrent active bookings |
| Pricing Competitiveness | Provider `base_rate` measured against the local category average |

---

### Agent 4 — Dynamic Pricing Agent (`PricingAgent.ts`)

**Role:** Determines the complete, real-time transaction fee structure for the booking.

**Geospatial Calculation:** Queries the Google Maps Distance Matrix API using the client's live coordinates (or sector centroid as fallback) to compute exact road-network driving distance to the provider's operational area.

**Pricing Formula:**

```
Total Price (PKR) = Base Rate + (Distance km × 50) × Urgency Multiplier × Complexity Adjustment
```

| Variable | Value |
|---|---|
| Urgency Multiplier (high) | 1.5× |
| Complexity Adjustment (Complex) | 1.3× |
| Travel Rate | PKR 50 per km |

---

### Agent 5 — Booking Execution Agent (`BookingExecutionAgent.ts`)

**Role:** Finalizes booking instantiation and commits the full state change to the database.

**Workflow:** Generates a secure, unique `booking_id`; establishes initial status coordinates (`pending` or `confirmed`); compiles the complete pricing breakdown; structures time slots; writes all state records to MockDbService; and inserts system notifications for the relevant provider.

---

### Agent 6 — Follow-Up and Dispute Agent (`FollowUpDisputeAgent.ts`)

**Role:** Coordinates post-booking tracking and automated resolution workflows.

**Workflow:** Monitors active job states, handles customer-initiated disputes by mapping type, description, and status, and calculates automated settlement allocations for cancellation and refund events.

---

### Agent 7 — Trace Logger Agent (`TraceLoggerAgent.ts`)

**Role:** Compiles a unified, human-readable audit trail of all agent activity for the current transaction.

**Workflow:** Collects the execution block logs emitted by each of the six preceding agents and merges them into a single `agent_trace` JSON array. This array is returned to the client in the API response and rendered as an interactive animated log in the "Agent Steps" modal within the mobile UI.

---

## 7. External API Integrations

### Google Maps Distance Matrix API (`MapsService.ts`)

`MapsService` uses Axios to query Google's routing infrastructure dynamically. Distance is calculated based on actual road networks rather than straight-line approximations — a critical distinction for accurate pricing in dense urban environments such as Islamabad and Rawalpindi.

**Endpoint Query Pattern:**

```
https://maps.googleapis.com/maps/api/distancematrix/json
  ?origins={lat,lng}
  &destinations={provider_sector}
  &key={API_KEY}
```

**Response Parsing:** The service parses the JSON response, validates element states, extracts raw distance in meters, and converts to kilometers (`realDistanceKm`) for use in the pricing formula.

**Resiliency Fallback:** `MapsService` implements an automated catch block that logs API failures gracefully and substitutes a default distance of 5 km, preventing backend timeouts or application crashes during network disruptions or key invalidation events.

---

### Google Gemini 2.5 Flash (`GeminiService.ts`)

The LLM integration uses the official `@google/genai` SDK configured for deterministic, schema-constrained JSON output. The service handles prompt engineering, schema enforcement, and response validation for the Intent Parser Agent.

---

## 8. Data Schemas

### API Request Payload — `POST /api/request`

```json
{
  "text": "AC kharab hai Bahria town me urgent thik krna ha",
  "user_id": "usr_998243",
  "userLocation": {
    "lat": 33.5651,
    "lng": 73.1276
  },
  "preferred_language": "roman_urdu"
}
```

### API Response Payload — Workflow Stage: Completed

```json
{
  "transaction_id": "txn_6d2a8c1f9b",
  "workflow_stage": "completed",
  "confidence_score": 0.95,
  "clarification_required": false,
  "clarification_prompt": "",
  "extracted_intent": {
    "service_type": "ac_technician",
    "location": "Bahria Town",
    "urgency": "high",
    "preferred_time": "not_specified",
    "language_detected": "roman_urdu",
    "complexity": "Intermediate"
  },
  "provider_rankings": [
    {
      "provider": {
        "provider_id": "p_01",
        "name": "Khan AC & Refrigerator Service",
        "category": "ac_technician",
        "rating": 4.8,
        "base_rate": 2200,
        "areas": ["Bahria Town", "DHA"]
      },
      "score": 92.4
    }
  ],
  "recommended_provider": {
    "provider": {
      "provider_id": "p_01",
      "name": "Khan AC & Refrigerator Service",
      "category": "ac_technician",
      "rating": 4.8,
      "base_rate": 2200,
      "areas": ["Bahria Town", "DHA"]
    },
    "score": 92.4
  },
  "dynamic_pricing": {
    "base_rate": 2200,
    "travel_fee": 380,
    "urgency_multiplier": 1.5,
    "complexity_adjustment": 1.3,
    "surge_pricing": 0,
    "total_pkr": 3354
  },
  "execution_payload": {
    "booking_id": "bk_171629850021",
    "user_id": "usr_998243",
    "provider_id": "p_01",
    "service_type": "ac_technician",
    "status": "confirmed",
    "total_amount": 3354,
    "created_at": "2026-05-21T00:55:00.000Z"
  },
  "agent_trace": [
    {
      "log_id": "log_01",
      "agent": "IntentParserAgent",
      "step": 1,
      "decision": "code_switched_detected",
      "action": "intent_extracted",
      "timestamp": "2026-05-21T00:55:00.201Z"
    }
  ],
  "ui_display_message": "Found and requested Khan AC & Refrigerator Service for ac_technician at Bahria Town. Total: PKR 3354. Awaiting provider confirmation."
}
```

---

## 9. End-to-End Data Flow

The following sequence diagram illustrates the complete transaction lifecycle from user input through to rendered UI:

```
sequenceDiagram
    autonumber
    actor User as Mobile App (User)
    participant API as Express API
    participant Gemini as Gemini 2.5 Flash
    participant Maps as Google Maps API
    participant DB as Mock DB Service

    User->>API: Send natural language prompt + Live Coordinates
    note right of User: "Bahria Town me plumber chahiye"

    API->>Gemini: Request Intent Parsing
    note right of Gemini: Parses category, location, urgency, language
    Gemini-->>API: Return Structured Intent (JSON)

    API->>DB: Discover & Filter Providers
    DB-->>API: Match by Category & Location

    API->>API: Rank Providers (Proximity, Rating, Capacity)

    API->>Maps: Query Proximity Route (Distance Matrix)
    Maps-->>API: Return Exact Travel Distance (km)

    API->>API: Calculate Dynamic Pricing (Distance Fee + Base Rate)

    API->>DB: Write Booking Payload + Log Agent Trace

    API-->>User: Dispatch Complete Booking UI (Rankings, Dynamic Price, Timeline)
```

### Step-by-Step Walkthrough

**Step 1 — User Prompt Capture:** The mobile client captures the user's text alongside live geographic coordinates via `expo-location` and dispatches a POST request to the API gateway.

**Step 2 — Intent Parsing:** The `RequestController` validates the payload and delegates to `AgentOrchestrator`. The `IntentParserAgent` sends the raw text to Gemini 2.5 Flash, which returns a structured JSON intent object containing the service type, location, urgency, preferred time, detected language, and job complexity.

**Step 3 — Provider Discovery:** The `ProviderDiscoveryAgent` queries `MockDbService`, filtering the provider database by the extracted `service_type` and verifying that each candidate's declared service areas cover the user's target location.

**Step 4 — Matching and Ranking:** The `MatchingRankingAgent` applies the six-factor weighted scoring algorithm to the candidate pool, producing an ordered ranked list with composite scores.

**Step 5 — Dynamic Pricing:** The `PricingAgent` invokes `MapsService.calculateDistance()` to retrieve the real road-network distance from the client's position to the top-ranked provider's area. It then applies the pricing formula with urgency and complexity multipliers to produce the complete fee structure.

**Step 6 — Booking Execution:** The `BookingExecutionAgent` generates a unique `booking_id`, writes the full booking state record to `MockDbService`, and inserts a provider notification.

**Step 7 — Dispute Monitoring:** The `FollowUpDisputeAgent` evaluates the new booking's operational status and sets up the initial follow-up and escalation parameters.

**Step 8 — Trace Compilation:** The `TraceLoggerAgent` collects execution logs from all preceding agents and compiles them into the unified `agent_trace` array.

**Step 9 — Response Dispatch:** The Express router returns the complete response JSON to the client.

**Step 10 — UI Render:** On the client side, Zustand and TanStack Query synchronize the received payload into application state. React Native Reanimated animates the provider booking card into view; the animated booking progress timeline advances to "Provider Requested"; and the "Agent Steps Trace" terminal modal populates with the full compiled trace logs.

---

## 10. Security and Privacy

ServeAi implements strict environment isolation to protect confidential credentials and sensitive user data:

**API Key Isolation:** Google Gemini API keys (`GOOGLE_GEMINI_API_KEY`) and Google Maps developer keys (`MAPS_API_KEY`) are managed exclusively on server instances via `.env` configuration files. They are never bundled into or exposed through the client application.

**User Location Privacy:** Precise geographic coordinates computed by `expo-location` are held exclusively in volatile application memory on the device. They are transmitted over HTTPS to the backend orchestrator only during active booking queries for the purpose of travel distance computation. Coordinates are not cached, logged, or exposed at any other point in the system lifecycle.

---

*ServeAi — Connecting communities with skilled workers through the power of agentic AI.*