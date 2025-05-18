# Component: DashboardView.vue

**Purpose:** Displays a comprehensive financial spending dashboard.

**Key Features (New UI):**

*   Overall "Spending Dashboard" title and "Financial Health" status.
*   **Net Worth Overview card:**
    *   Shows total net worth.
    *   Bar chart: Assets vs. Liabilities.
    *   Uses Font Awesome icon for the card title.
*   **Monthly Spending card:**
    *   Donut chart: Spending by category (Housing, Food, Transport, Entertainment, Other).
    *   Uses Font Awesome icon for the card title.
*   **Net Worth Trend card:**
    *   Line chart: Illustrates trends for assets, liabilities, and net worth over the last 4 months.
    *   "Trend Analysis" summary.
    *   Uses Font Awesome icon for the card title.
*   **Budget Status card:**
    *   Budget progress for categories (e.g., Entertainment, Food, Transport).
    *   "Personalized Insights" section with action buttons.
    *   Uses Font Awesome icon for the card title.
*   Implemented with Chart.js for interactive charts.

**Styling:**

*   Dark theme.
*   Designed to match specific visual mockups.

**Data Source (Current):**

*   Hardcoded data within the component for UI representation.

**Data Source (Planned):**

*   Backend API: `GET /api/dashboard-data`