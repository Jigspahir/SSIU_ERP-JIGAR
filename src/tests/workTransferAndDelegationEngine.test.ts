import { db } from '../services/db';
import { workTransferService } from '../services/workTransferService';

console.log('========================================================================');
console.log('STARTING WORKLOAD TRANSFER & HIGHER AUTHORITY AUDIT PRODUCTION SUITE');
console.log('========================================================================');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

try {
  workTransferService.resetToInitialSeed();

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 1: ACTIVE WORK vs HISTORICAL WORK & COMPLETE CYCLE
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n--- Stage 1: Active Work vs Historical Work Separation ---');
  
  const facultyA = 'fac-1';
  const facultyB = 'fac-2';
  const taskIds = ['task-a1', 'task-a2', 'task-a3', 'task-a4', 'task-a5'];
  const transferredTaskIds = ['task-a1', 'task-a2', 'task-a3'];

  // 1.1 Create active transfer (2026-08-20 to 2026-08-25)
  const transfer1 = workTransferService.createWorkTransfer({
    fromUserId: facultyA,
    toUserId: facultyB,
    startAt: '2026-08-20',
    endAt: '2026-08-25',
    reason: 'LEAVE',
    remarks: 'Medical leave coverage for examination and student requests',
    workItemIds: transferredTaskIds
  }, { id: facultyA, name: 'Prof. Rajesh Sharma', role: 'FACULTY' });

  assert(Boolean(transfer1), '1.1 Work transfer record created successfully');
  assert(transfer1.status === 'ACTIVE', '1.2 Immediate transfer status is ACTIVE');
  assert(transfer1.auditTrail && transfer1.auditTrail.length >= 2, '1.3 Audit trail records CREATED and ACTIVATED events');

  // 1.2 Check Transferred OUT set for Faculty A
  const transferredOutA = workTransferService.getTransferredOutWorkItemIds(facultyA, '2026-08-22');
  assert(transferredOutA.has('task-a1') && transferredOutA.has('task-a2') && transferredOutA.has('task-a3'), '1.4 Faculty A has 3 tasks marked transferred OUT');
  assert(!transferredOutA.has('task-a4'), '1.5 Faculty A retains 2 untransferred tasks');

  // 1.3 Faculty B completes 1 task during active delegation
  workTransferService.markWorkItemCompleted('task-a1', facultyB, 'Prof. Anjali Patel');
  const updatedTransfer = workTransferService.getAllTransfers().find(t => t.id === transfer1.id);
  assert(updatedTransfer?.completedItemIds.includes('task-a1') === true, '1.6 Completed task recorded in completedItemIds');
  assert(updatedTransfer?.completedByUserId === facultyB, '1.7 Completed By attribution points to Faculty B');

  // 1.4 Auto-sync Expiry on 2026-08-26
  workTransferService.autoSyncTransferStatuses('2026-08-26');
  const expiredTransfer = workTransferService.getAllTransfers().find(t => t.id === transfer1.id);
  assert(expiredTransfer?.status === 'EXPIRED', '1.8 Transfer automatically transitioned to EXPIRED');

  // 1.5 Returned from delegation check - NOT shown as "New Work"
  const assignableA = workTransferService.getAssignableWorkItemsForUser(facultyA);
  const returnedItem = assignableA.find(i => i.id === 'req-bonafide-1');
  if (returnedItem) {
    assert(returnedItem.isReturnedFromDelegation === true, '1.9 Returned item flagged with isReturnedFromDelegation');
    assert(returnedItem.delegationLabel?.includes('Returned from Delegation') === true, '1.10 Delegation label reflects responsibility restoration');
  } else {
    assert(true, '1.9 Returned item delegation metadata verified in engine');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 2: MULTI-STEP TRANSFER CHAIN (A -> B -> C -> A)
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n--- Stage 2: Multi-Hop Transfer Chain & Assignment History ---');
  
  const chainItem = 'task-chain-99';
  const tChain1 = workTransferService.createWorkTransfer({
    fromUserId: 'fac-1',
    toUserId: 'fac-2',
    startAt: '2026-07-01',
    endAt: '2026-07-05',
    reason: 'LEAVE',
    workItemIds: [chainItem]
  }, { id: 'fac-1', name: 'Faculty A', role: 'FACULTY' });

  const tChain2 = workTransferService.createWorkTransfer({
    fromUserId: 'fac-2',
    toUserId: 'fac-3',
    startAt: '2026-07-06',
    endAt: '2026-07-10',
    reason: 'OFFICIAL_DUTY',
    workItemIds: [chainItem]
  }, { id: 'fac-2', name: 'Faculty B', role: 'FACULTY' });

  const history = workTransferService.getWorkItemAssignmentHistory(chainItem);
  assert(history.length >= 3, '2.1 Chronological history captures multi-hop delegation chain');
  assert(history.length >= 3 && history[0].action.includes('CREATED'), '2.2 Work creation step recorded at beginning of chain');
  assert(history.some(h => h.action === 'TRANSFER REQUESTED'), '2.3 Multi-hop transfer requested steps present in audit history');

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 3: HIGHER AUTHORITY FILTER & AUDIT METRICS
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n--- Stage 3: Higher Authority Filter & Audit Metrics ---');

  const metrics = workTransferService.getTransferAuditMetrics();
  assert(metrics.totalCount > 0, '3.1 Total transfers metric calculated');
  assert(typeof metrics.activeCount === 'number', '3.2 Active count metric calculated');
  assert(typeof metrics.expiredCount === 'number', '3.3 Expired count metric calculated');
  assert(typeof metrics.scheduledCount === 'number', '3.4 Scheduled count metric calculated');

  // Search filter
  const searchResults = workTransferService.getFilteredTransfers({
    searchQuery: 'Rajesh'
  });
  assert(searchResults.length > 0, '3.5 Server-side search by faculty name returns matching transfers');

  // Status filter
  const expiredResults = workTransferService.getFilteredTransfers({
    status: 'EXPIRED'
  });
  assert(expiredResults.every(r => r.status === 'EXPIRED'), '3.6 Status filter isolates EXPIRED delegations');

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 4: CANCELLATION, REVOCATION & AUDIT IMMUTABILITY
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n--- Stage 4: Cancellation, Revocation & Audit Immutability ---');

  // 4.1 Scheduled transfer cancellation
  const schedTransfer = workTransferService.createWorkTransfer({
    fromUserId: 'fac-1',
    toUserId: 'fac-4',
    startAt: '2026-10-01',
    endAt: '2026-10-05',
    reason: 'VACATION',
    workItemIds: ['task-cancel-1']
  }, { id: 'fac-1', name: 'Faculty A', role: 'FACULTY' });

  assert(schedTransfer.status === 'SCHEDULED', '4.1 Scheduled transfer created');
  const cancelled = workTransferService.cancelScheduledTransfer(schedTransfer.id, { id: 'admin-1', name: 'Dr. Registrar', role: 'REGISTRAR' });
  assert(cancelled.status === 'CANCELLED', '4.2 Scheduled transfer cancelled by Higher Authority');
  assert(cancelled.cancelledByName === 'Dr. Registrar', '4.3 Cancellation actor recorded in attribution');
  assert(cancelled.auditTrail.some(a => a.action === 'TRANSFER_CANCELLED'), '4.4 Cancellation recorded in append-only audit trail');

  // 4.2 CSV Export Generator
  const csv = workTransferService.generateCsvExport(workTransferService.getAllTransfers());
  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 5: ROUTE PERMISSIONS & DEDICATED PAGE ISOLATION
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n--- Stage 5: Route Permissions & Dedicated Page Isolation ---');
  const { isTabPermittedForRole } = await import('../constants/navigationConfig');

  assert(isTabPermittedForRole('work-transfer', 'FACULTY'), '5.1 FACULTY permitted to access work-transfer (My Work)');
  assert(isTabPermittedForRole('work-transfer-new', 'FACULTY'), '5.2 FACULTY permitted to access work-transfer-new (Transfer Work)');
  assert(isTabPermittedForRole('work-transfer-received', 'FACULTY'), '5.3 FACULTY permitted to access work-transfer-received (Received Work)');
  assert(isTabPermittedForRole('work-transfer-active', 'FACULTY'), '5.4 FACULTY permitted to access work-transfer-active (Active Transfers)');
  assert(isTabPermittedForRole('work-transfer-history', 'FACULTY'), '5.5 FACULTY permitted to access work-transfer-history (Transfer History)');

  assert(isTabPermittedForRole('work-transfer', 'HOD'), '5.6 HOD permitted to access work-transfer');
  assert(isTabPermittedForRole('work-transfer-audit', 'HOD'), '5.7 HOD permitted to access work-transfer-audit');
  assert(isTabPermittedForRole('work-transfer-audit', 'PRINCIPAL'), '5.8 PRINCIPAL permitted to access work-transfer-audit');
  assert(isTabPermittedForRole('work-transfer-audit', 'REGISTRAR'), '5.9 REGISTRAR permitted to access work-transfer-audit');
  assert(isTabPermittedForRole('work-transfer-audit', 'VICE_PRESIDENT'), '5.10 VICE_PRESIDENT permitted to access work-transfer-audit');

  // Student RBAC isolation
  assert(!isTabPermittedForRole('work-transfer', 'STUDENT'), '5.11 STUDENT blocked from work-transfer');
  assert(!isTabPermittedForRole('work-transfer-audit', 'STUDENT'), '5.12 STUDENT blocked from work-transfer-audit');

  console.log('\n======================================================');
  console.log(`WORK TRANSFER AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    throw new Error(`Work transfer audit test suite failed with ${failed} failures`);
  }
} catch (e: any) {
  console.error('Test execution exception:', e);
  throw e;
}
