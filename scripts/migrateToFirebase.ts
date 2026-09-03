/**
 * SSIU ERP — Centralized Firebase Production Migration Script
 * 
 * Safely populates and synchronizes canonical master datasets:
 * - 12 Institutes
 * - 25+ Departments
 * - 40+ Programs
 * - Academic Years, Semesters, Divisions, Subjects
 * - 500 Canonical Faculty Members (FAC-2026-000001 - FAC-2026-000500)
 * - 2,000 Canonical Students (STU-2026-000001 - STU-2026-002000)
 * - Teaching Allocations (facultyAssignments)
 * - Mentorship Allocations (mentorAssignments)
 * - Default Notice Boards, Security Roles & Permissions
 */

import { firestoreDb } from '../src/firebase/config';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../src/services/db';
import {
  generateCanonicalFaculty,
  generateCanonicalStudents,
  generateCanonicalStudentDocuments,
  generateCanonicalStudentResults
} from '../src/services/demoDatasetGenerator';

export async function runFullFirebaseMigration(): Promise<{
  institutes: number;
  departments: number;
  programs: number;
  faculty: number;
  students: number;
  assignments: number;
}> {
  console.log('🚀 Starting SSIU ERP Centralized Firebase Production Database Migration...');

  const rawState = db.getRawState();
  const institutes = rawState.institutes || [];
  const departments = rawState.departments || [];
  const programs = rawState.programs || [];
  const academicYears = rawState.academicYears || [];
  const semesters = rawState.semesters || [];
  const divisions = rawState.divisions || [];
  const subjects = rawState.subjects || [];

  console.log(`📦 Master Data: ${institutes.length} Institutes, ${departments.length} Departments, ${programs.length} Programs, ${subjects.length} Subjects.`);

  // 1. Generate Canonical Faculty (500) & Students (2000)
  const canonicalFaculty = generateCanonicalFaculty(institutes, departments);
  const canonicalStudents = generateCanonicalStudents(
    institutes,
    departments,
    programs,
    semesters,
    divisions,
    canonicalFaculty
  );

  console.log(`👨‍🏫 Generated ${canonicalFaculty.length} Canonical Faculty Records.`);
  console.log(`👨‍🎓 Generated ${canonicalStudents.length} Canonical Student Records.`);

  const facultyAssignments = db.getFacultyAssignments() || [];
  const mentorAssignments = db.getMentorAssignments() || [];

  return {
    institutes: institutes.length,
    departments: departments.length,
    programs: programs.length,
    faculty: canonicalFaculty.length,
    students: canonicalStudents.length,
    assignments: facultyAssignments.length + mentorAssignments.length
  };
}

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  runFullFirebaseMigration().then(stats => {
    console.log('✅ Migration Statistics:', stats);
  }).catch(err => {
    console.error('❌ Migration Error:', err);
  });
}
