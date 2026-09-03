# SSIU ERP — Phase 5: Attendance Single Source of Truth Architecture

---

## 1. Unified Operational Data Flow

```text
Timetable + Faculty Allocations (/facultyAssignments)
                       ↓
Teaching Session Logged (/teachingSessions)
   - Subject Code & Name (e.g. CSE-402)
   - Division (e.g. Division A)
   - Date & Lecture Number (e.g. 2026-03-01, Slot 1)
   - Time Slot (e.g. 09:00 - 10:00)
   - Topic Taught
                       ↓
Student Attendance Records Written (/attendance)
   - studentId (Canonical ID)
   - status: PRESENT | ABSENT | LATE | ON_DUTY
   - submittedAt: ISO Timestamp
   - submittedBy: Faculty UID
                       ↓
Aggregated Attendance Reports (/attendanceReports)
   - Subject-wise percentage
   - Student-wise monthly breakdown
   - Shortage notifications (<75% threshold)
```

---

## 2. Invariants Guaranteed

1. **Zero Divergence**: "Mark Attendance", "Pending Attendance", "Submitted Attendance", and "Attendance Reports" read and write from the EXACT same canonical collections (`teachingSessions` and `attendance`).
2. **Duplicate Protection**: Before any session write is committed, `checkDuplicateSession` validates that no existing session with the identical tuple `(subjectId, divisionId, date, lectureNumber)` is in `SUBMITTED` state.
3. **Teaching Desk vs Mentor Desk Isolation**:
   - Faculty Attendance loads **only students enrolled in the assigned division/subject**.
   - Mentor Shortage Monitoring loads **only assigned mentees**.
   - Mentee students are NEVER injected into Faculty teaching attendance rosters.
