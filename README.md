# 📊 GenZ Financial Literacy Analytics Dashboard

![Dashboard Preview](./docs/screenshot-overview.png)

A comprehensive analytics dashboard for analyzing financial literacy, behavior, and well-being among Generation Z in Indonesia. Built with React, TypeScript, and Recharts for rich data visualization and insights.

## 🎯 Project Overview

This dashboard provides deep insights into GenZ's financial literacy across multiple dimensions:
- **Financial Knowledge** - Understanding of basic financial concepts
- **Digital Literacy** - Competency in using digital financial tools
- **Financial Behavior** - Spending and saving habits
- **Decision Making** - Financial planning capabilities
- **Well-being** - Financial stress and anxiety levels

**Target Audience**: Researchers, policymakers, financial educators, and NGOs working on financial inclusion initiatives.

---

## ✨ Key Features

### 📈 Multi-Page Analytics
- **Overview Dashboard** - High-level KPIs and cross-sectional analysis
- **Financial Literacy** - Deep-dive into literacy scores, question-level performance
- **Behavior & Well-being** - Spending patterns and financial stress analysis
- **Regional Analysis** - Geographic comparison of literacy and economic indicators

### 🔍 Advanced Filtering
- Filter by **Province** (38 provinces across Indonesia)
- Filter by **Education Level** (Elementary to Postgraduate)
- Filter by **Income Range** (6 income brackets)
- Filter by **Age Group** (18-20, 21-23, 24-25, >25)

### 📊 Rich Visualizations
- **KPI Cards** - Financial literacy, digital adoption, behavior scores
- **Bar Charts** - Dimension analysis, demographic comparisons
- **Scatter Plots** - Correlation analysis (literacy vs fintech usage)
- **Radar Charts** - Multi-dimensional comparison
- **Heatmaps** - Question-level performance analysis

### 📥 Data Export
- Export filtered data to CSV
- Multiple dataset export (Survey + Profile + Regional)
- Timestamped filenames with filter indicators

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router v6** - Client-side routing
- **Zustand** - State management

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **Lucide React** - Icon library
- **CSS Modules** - Component-scoped styles

### Data Processing
- **Papa Parse** - CSV parsing
- **Custom transformers** - Data normalization and cleaning

---

## 📂 Project Structure

```

src/
├── pages/                          \# Main application pages
│   ├── Dashboard.tsx              \# Overview page (/)
│   ├── FinancialLiteracy.tsx      \# Literacy deep-dive (/literacy)
│   ├── BehaviorWellbeing.tsx      \# Behavior analysis (/behavior)
│   └── RegionalAnalysis.tsx       \# Regional comparison (/regional)
│
├── dashboard/
│   ├── widgets/                   \# Reusable visualization widgets
│   │   ├── KPIs.tsx              \# Key Performance Indicators
│   │   ├── LiteracyDimensions.tsx \# 5 Literacy dimensions bar chart
│   │   ├── LiteracyVsFintechCorrelation.tsx \# Scatter plot
│   │   ├── IncomeVsExpenditure.tsx \# Spending patterns
│   │   ├── DigitalTimeVsAnxiety.tsx \# Anxiety analysis
│   │   ├── EducationEmploymentBreakdown.tsx \# Demographics
│   │   ├── QuestionPerformance.tsx \# Question-level analysis
│   │   ├── LiteracyByDemographics.tsx \# Group comparison
│   │   ├── DimensionComparison.tsx \# Radar chart comparison
│   │   └── TopBottomPerformers.tsx \# Province rankings
│   └── metrics.ts                \# Score calculation logic
│
├── components/
│   ├── common/
│   │   ├── Header.tsx            \# Page header with export button
│   │   ├── Sidebar.tsx           \# Navigation sidebar
│   │   ├── FilterBar.tsx         \# Multi-filter component
│   │   └── CustomSelect.tsx      \# Custom dropdown
│   └── charts/
│       └── BarChart.tsx          \# Reusable bar chart component
│
├── services/
│   ├── dataTypes.ts              \# TypeScript interfaces
│   └── dataTransformers.ts       \# CSV to typed data transformers
│
├── store/
│   └── useStore.ts               \# Zustand global state
│
├── utils/
│   ├── constants.ts              \# App constants
│   ├── helpers.ts                \# Utility functions
│   └── ExportToCSV.ts           \# CSV export logic
│
├── styles/                       \# Global styles
│   ├── index.css                \# Tailwind imports
│   └── components/              \# Component-specific CSS
│
├── public/
│   └── data/                    \# CSV data files
│       ├── GenZ_Financial_Literacy_Survey_CLEAN.csv (1601 rows)
│       ├── GenZ_Financial_Profile_CLEAN.csv (1000 rows)
│       └── Regional_Economic_Indicators_CLEAN.csv (38 rows)
│
└── App.tsx                      \# Root component with routing

```

---

## 📊 Data Sources

### 1. **Survey Dataset** (1,601 respondents)
**File**: `GenZ_Financial_Literacy_Survey_CLEAN.csv`

**Columns**:
- Demographics: `Gender`, `Province of Origin`, `Year of Birth`, `Last Education`
- Questions: `Q1` - `Q48` (Likert scale 1-4)
  - Q1-Q9: Financial Knowledge
  - Q10-Q18: Digital Literacy
  - Q19-Q29: Financial Behavior
  - Q30-Q39: Decision Making
  - Q40-Q48: Well-being

### 2. **Profile Dataset** (1,000 respondents)
**File**: `GenZ_Financial_Profile_CLEAN.csv`

**Columns**:
- `user_id`, `birth_year`, `gender`, `province`, `education_level`
- `employment_status`, `avg_monthly_income`, `avg_monthly_expense`
- `main_fintech_app`, `investment_type`, `loan_usage_purpose`
- `digital_time_spent_per_day`, `financial_anxiety_score`

### 3. **Regional Economic Data** (38 provinces)
**File**: `Regional_Economic_Indicators_CLEAN.csv`

**Columns**:
- `Provinsi`, `Jumlah Rekening Penerima Pinjaman Aktif`
- `Jumlah Dana yang Diberikan (Rp miliar)`
- `Outstanding Pinjaman (Rp miliar)`
- `Jumlah Penduduk (Ribu)`, `PDRB (Ribu Rp)`, `Urbanisasi (%)`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**

### Installation

```


# Clone repository

git clone https://github.com/your-username/genz-financial-dashboard.git
cd genz-financial-dashboard

# Install dependencies

npm install

# Start development server

npm run dev

```

The app will run at `http://localhost:5173`

### Build for Production

```


# Create optimized build

npm run build

# Preview production build

npm run preview

```

---

## 📱 Pages & Features

### 1. **Overview Dashboard** (`/`)
**Purpose**: High-level summary of all metrics

**Widgets**:
- KPI Cards (4 scores: Literacy, Digital, Behavior, Well-being)
- Literacy Dimensions (5 bar charts)
- Income vs Expenditure (Scatter plot by education)
- Literacy vs Fintech Usage (Correlation scatter)
- Digital Time vs Anxiety (Behavioral analysis)
- Education & Employment Breakdown (Stacked bar)

**Filters**: Province, Education, Income, Age Group

---

### 2. **Financial Literacy** (`/literacy`)
**Purpose**: Deep-dive into financial literacy performance

**Widgets**:
- Literacy Dimensions (Detailed 5-dimension analysis)
- Question Performance (Best/worst Q1-Q48)
- Literacy by Demographics (Age, Education comparison)
- Dimension Comparison (Radar chart by group)
- Top/Bottom Performers (Province rankings)

**Use Case**: Identify knowledge gaps, target interventions

---

### 3. **Behavior & Well-being** (`/behavior`)
**Purpose**: Analyze spending patterns and financial stress

**Widgets**:
- Spending Behavior Patterns
- Financial Anxiety Factors
- Digital Usage Impact
- Debt vs Income Analysis

**Use Case**: Understand behavioral drivers, stress factors

---

### 4. **Regional Analysis** (`/regional`)
**Purpose**: Geographic comparison and economic indicators

**Widgets**:
- Province Literacy Map
- PDRB vs Loan Outstanding
- Urbanization Impact
- Regional Economic Health

**Use Case**: Policy planning, regional targeting

---

## 🎨 Design System

### Color Palette
```

--primary-blue: \#3b82f6
--primary-green: \#10b981
--primary-orange: \#f59e0b
--primary-purple: \#8b5cf6
--primary-pink: \#ec4899
--bg-dark: \#0A0F1E
--bg-card: rgba(255, 255, 255, 0.05)
--text-primary: \#ffffff
--text-secondary: \#9ca3af

```

### Typography
- **Headings**: Inter, sans-serif
- **Body**: System fonts
- **Font Sizes**: 12px - 32px

---

## 🔧 Configuration

### Environment Variables
Create `.env` file:

```

VITE_API_URL=http://localhost:3000
VITE_APP_NAME=GenZ Financial Dashboard

```

### CSV Data Path
Update in `src/store/useStore.ts`:

```

const SURVEY_CSV_URL = '/data/GenZ_Financial_Literacy_Survey_CLEAN.csv';
const PROFILE_CSV_URL = '/data/GenZ_Financial_Profile_CLEAN.csv';
const REGIONAL_CSV_URL = '/data/Regional_Economic_Indicators_CLEAN.csv';

```

---

## 📈 Performance Optimizations

1. **Data Sampling**: Large datasets (>300 points) sampled for scatter plots
2. **Disabled Animations**: Chart animations disabled for smoother rendering
3. **useMemo Hooks**: Heavy calculations cached
4. **Lazy Loading**: Components loaded on-demand
5. **Code Splitting**: Route-based code splitting

---

## 🧪 Testing

```


# Run unit tests

npm run test

# Run E2E tests

npm run test:e2e

# Coverage report

npm run test:coverage

```

---