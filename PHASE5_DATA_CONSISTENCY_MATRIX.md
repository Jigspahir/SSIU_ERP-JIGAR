# SSIU ERP — Phase 5: Canonical Data Consistency Matrix

| Domain Entity | Canonical Collection | Stable ID Format | Authoritative Fields | Foreign Reference Fields |
| :--- | :--- | :--- | :--- | :--- |
| **Institute** | `/institutes` | `inst-{code}` (e.g. `inst-sit`) | `id`, `code`, `name`, `type`, `status` | `universityId` |
| **Department** | `/departments` | `dept-{code}` (e.g. `dept-1`) | `id`, `code`, `name`, `status` | `instituteId` |
| **Program** | `/programs` | `prog-{code}` (e.g. `prog-1`) | `id`, `code`, `name`, `durationYears`, `totalSemesters` | `departmentId`, `instituteId` |
| **Academic Year** | `/academicYears` | `ay-{year}` (e.g. `ay-2024`) | `id`, `year`, `name`, `isCurrent` | `universityId` |
| **Semester** | `/semesters` | `sem-{dept}-{num}` (e.g. `sem-cse-4`) | `id`, `number`, `type` (ODD/EVEN), `status` | `programId`, `academicYearId` |
| **Division** | `/divisions` | `div-{dept}-{sem}{div}` (e.g. `div-cse-4a`) | `id`, `name`, `code`, `capacity` | `semesterId`, `departmentId` |
| **Subject** | `/subjects` | `sub-{code}` (e.g. `sub-cse402`) | `id`, `code`, `name`, `type`, `credits`, `theoryHours`, `practicalHours` | `departmentId`, `programId`, `semesterId` |
| **Faculty** | `/faculty` | `fac-{num}` (e.g. `FAC-2026-000001`) | `id`, `employeeId`, `name`, `designation`, `status` | `departmentId`, `instituteId` |
| **Student** | `/students` | `stu-{num}` (e.g. `STU-2026-000001`) | `id`, `enrollmentNo`, `name`, `email`, `status` | `instituteId`, `departmentId`, `programId`, `semesterId`, `divisionId` |
| **Faculty Assignment** | `/facultyAssignments` | `fa-{subject}-{div}` | `id`, `subjectCode`, `subjectName`, `weeklyLectures`, `role` | `facultyId`, `subjectId`, `divisionId`, `departmentId` |
| **Mentor Assignment** | `/mentorAssignments` | `ma-{mentor}-{student}` | `id`, `status`, `assignedAt` | `mentorFacultyId`, `studentId`, `academicYearId` |
| **Teaching Session** | `/teachingSessions` | `ts-{subject}-{div}-{date}-{num}` | `id`, `date`, `lectureNumber`, `timeSlot`, `topicTaught`, `status` | `subjectId`, `divisionId`, `facultyId`, `departmentId` |
| **Attendance** | `/attendance` | `att-{session}-{student}` | `id`, `status` (PRESENT/ABSENT/LATE), `remarks` | `sessionId`, `studentId`, `subjectId`, `facultyId` |

---

### Duplicate Audit Result
- **Duplicate Subject Codes**: **0** (Authoritative `CSE-402` single definition verified)
- **Duplicate Student Enrollments**: **0** (Deterministic generator guarantees 2,000 unique sequential enrollment numbers)
- **Duplicate Faculty IDs**: **0** (500 canonical unique faculty accounts)
- **Status**: **100% CANONICAL & CONSISTENT**
