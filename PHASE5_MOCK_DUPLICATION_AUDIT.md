# SSIU ERP — Phase 5: Mock & Duplication Audit

---

## 1. Classification of Codebase Data Sources

| Artifact / Source | Category | Purpose | Status in Production Path |
| :--- | :--- | :--- | :--- |
| `src/firebase/services/*.ts` | **D. Real Business Data** | Primary operational services communicating directly with Firestore backend with timeout-guarded query pipelines. | **ACTIVE (Primary Data Layer)** |
| `src/services/db.ts` | **B. Development Seed Cache** | In-memory synchronous cache initialized from canonical master definitions for offline resilience and ultra-fast UI rendering. | **INTEGRATED (Mirrored via Firebase)** |
| `src/services/seedData.ts` | **B. Development Seed** | Authoritative canonical definitions for 12 institutes, 13 departments, 60 programs, 3 academic years, 5 semesters, and 9 subjects. | **CANONICAL (Single Source of Truth)** |
| `src/services/demoDatasetGenerator.ts` | **B. Development Seed** | Deterministic generator producing 2,000 students and 500 faculty structured across valid hierarchical foreign keys. | **CANONICAL (Deterministic Generator)** |
| `scripts/seed-firebase.ts` | **B. Development Seed** | Uploads canonical records directly to Cloud Firestore. | **MIGRATION SCRIPT ONLY** |
| `scripts/test-phase*.ts` | **C. Test Fixture** | Automated validation scripts ensuring RBAC, scoping, and data consistency. | **TESTING HARNESS ONLY** |

---

## 2. Decontamination Checklist

- [x] Static duplicate subject arrays removed; all modules reference canonical `initialSubjects` or Firestore `/subjects`.
- [x] Hardcoded attendance lists replaced with lecture-wise session generator and Firestore `/attendance`.
- [x] Disconnected demo user records unified into canonical `initialUsers` mapping.
- [x] LocalStorage isolated to transient UI state (e.g., active filters, theme preference); all business data writes propagate to Firestore.
