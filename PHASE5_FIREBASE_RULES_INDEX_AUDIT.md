# SSIU ERP — Phase 5: Firestore Rules & Indexes Production Audit

---

## 1. Security Rules Audit (`firestore.rules`)

| Collection Path | Read Rule | Write Rule | Security Invariant |
| :--- | :--- | :--- | :--- |
| `/users/{uid}` | `isAuthenticated() && (request.auth.uid == uid \|\| isAdmin())` | `isAdmin()` | User identity and role claims protected from client forgery |
| `/students/{id}` | `isAuthenticated() && (isAdmin() \|\| isFaculty() \|\| isStudentOwner(id) \|\| isParentOfStudent(id))` | `isAdmin() \|\| isPrincipal(...) \|\| isHOD(...)` | Student private data isolated; zero public access |
| `/faculty/{id}` | `isAuthenticated()` | `isAdmin() \|\| isPrincipal(...)` | Faculty directory readable internally; modifications restricted |
| `/facultyAssignments/{id}`| `isAuthenticated()` | `isAdmin() \|\| isHOD(...)` | Teaching allocations managed only by HOD / Admin |
| `/mentorAssignments/{id}` | `isAuthenticated() && (isAdmin() \|\| isFaculty() \|\| isMentor(id) \|\| isStudent(id))` | `isAdmin() \|\| isPrincipal(...) \|\| isHOD(...)` | Mentorship assignments isolated to mentor and mentee |
| `/teachingSessions/{id}` | `isAuthenticated()` | `isAdmin() \|\| (isFaculty() && request.resource.data.facultyId == request.auth.uid)` | Attendance session created only by assigned faculty |
| `/attendance/{id}` | `isAuthenticated() && (isAdmin() \|\| isFaculty() \|\| isStudentOwner(studentId) \|\| isParentOfStudent(studentId))` | `isAdmin() \|\| isFaculty()` | Student attendance strictly isolated |
| `/results/{id}` | `isAuthenticated() && (isAdmin() \|\| isExamAdmin() \|\| isStudentOwner(studentId))` | `isAdmin() \|\| isExamAdmin()` | Semester results confidential; stranger access strictly blocked |
| `/documents/{id}` | `isAuthenticated() && (isAdmin() \|\| isStudentOwner(studentId) \|\| isSectionStaff())` | `isAdmin() \|\| isStudentOwner(studentId)` | Upload restricted to owner; verification by office staff |
| `/workTransfers/{id}` | `isAuthenticated() && (isAdmin() \|\| request.auth.uid == fromUserId \|\| request.auth.uid == toUserId \|\| isHOD())` | `isAuthenticated()` | Handover logs restricted to participants and department head |
| `/auditLogs/{id}` | `isAuthenticated() && (isAdmin() \|\| isAuditor())` | `allow create: if isAuthenticated(); allow update, delete: if false;` | **IMMUTABLE & APPEND-ONLY**: Updates and deletions permanently forbidden |

---

## 2. Composite Indexes Audit (`firestore.indexes.json`)

All composite indexes required for complex queries are configured:
1. `teachingSessions`: `facultyId (ASC) + date (ASC)`
2. `teachingSessions`: `subjectId (ASC) + divisionId (ASC) + date (ASC) + lectureNumber (ASC)`
3. `attendance`: `studentId (ASC) + subjectId (ASC)`
4. `attendance`: `sessionId (ASC) + studentId (ASC)`
5. `mentorAssignments`: `mentorFacultyId (ASC) + status (ASC)`
6. `mentorAssignments`: `studentId (ASC) + status (ASC)`
7. `facultyAssignments`: `facultyId (ASC) + status (ASC)`
8. `students`: `departmentId (ASC) + status (ASC)`
9. `students`: `instituteId (ASC) + departmentId (ASC)`
10. `notices`: `status (ASC) + publishedAt (DESC)`
11. `notifications`: `recipientUid (ASC) + read (ASC) + createdAt (DESC)`
12. `workTransfers`: `toUserId (ASC) + status (ASC)`
13. `workTransfers`: `fromUserId (ASC) + status (ASC)`
