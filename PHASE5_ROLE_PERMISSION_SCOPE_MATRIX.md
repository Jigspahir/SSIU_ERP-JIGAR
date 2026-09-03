# SSIU ERP — Phase 5: Role-Based Access Control (RBAC) & Scope Matrix

| ERP Role | Authentication Gating | Identity & Profile Scope | Academic & Operational Scope | Firestore Security Rule Enforcement |
| :--- | :--- | :--- | :--- | :--- |
| **`STUDENT`** | Firebase Auth UID | Own user document (`users/{uid}`) | Own attendance, timetable, enrolled assignments, confidential semester results, own uploaded documents. | `request.auth.uid == studentId` |
| **`PARENT`** | Firebase Auth UID | Own user document (`users/{uid}`) | Linked children records only (`parentStudentIds`), ward PTM records, child attendance reports, parent feedback. | `request.auth.uid in student.parentUids` |
| **`FACULTY`** | Firebase Auth UID | Own user document (`users/{uid}`) | **Teaching Allocations Only**: Assigned subjects, assigned divisions, today's teaching slots, lecture-wise attendance submission, session plans, study materials. | `resource.data.facultyId == request.auth.uid` |
| **`MENTOR`** | Firebase Auth UID | Own user document (`users/{uid}`) | **Mentee Allocation Desk Only**: Assigned mentees, attendance shortage alerts, academic risk profile, counseling notes, PTM actions. **Completely decoupled from Faculty teaching allocations.** | `resource.data.mentorFacultyId == request.auth.uid` |
| **`HOD`** | Firebase Auth UID | Own user document (`users/{uid}`) | Full Department Scope: Department faculty, students, subject allocations, department timetable, curriculum progress, department work transfers. | `resource.data.departmentId == user.departmentId` |
| **`PRINCIPAL`** | Firebase Auth UID | Own user document (`users/{uid}`) | Full Institute Scope: Institute departments, faculty roster, institute-wide academic progression and approvals. | `resource.data.instituteId == user.instituteId` |
| **`DEPUTY_REGISTRAR`**| Firebase Auth UID | Own user document (`users/{uid}`) | University-Wide Governance: Regulatory compliance, note-sheets, statutory records, university audits. | `hasRole('DEPUTY_REGISTRAR')` |
| **`ADMIN_STAFF`** | Firebase Auth UID | Own user document (`users/{uid}`) | Functional Office Scope: Exam Cell, Student Section, HRMS, Accounts, Library, Transport, Hostel, Maintenance. | `hasRole('ADMIN_STAFF') && office == scope` |
| **`SUPER_ADMIN`** | Firebase Auth UID | Full system visibility | System configuration, database audits, centralized master records, security audit logs. | `hasRole('SUPER_ADMIN')` |
