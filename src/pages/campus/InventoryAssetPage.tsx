import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import {
  FixedAsset, ConsumableItem, StockTransactionRecord, PhysicalFileRecord,
  AssetAssignmentRecord, AssetTransferRecord, AssetMaintenanceRecord,
  PhysicalVerificationRecord, AssetDisposalRecord, InventoryAuditRecord,
  InventoryCategoryItem, InventoryLocationRecord, AssetStatus, AssetCondition,
  InventoryCategoryGroup
} from '../../types';
import {
  exportToExcel,
  downloadAssetImportTemplateExcel,
  downloadConsumableStockTemplateExcel,
  downloadPhysicalFileTemplateExcel,
  downloadAssetAssignmentTemplateExcel,
  validateAssetExcelRows,
  validateConsumableExcelRows
} from '../../services/exportService';
import * as XLSX from 'xlsx';
import {
  Boxes, Plus, Search, Filter, Download, Upload, Eye, Edit2, ArrowRightLeft,
  Wrench, ShieldCheck, Trash2, QrCode, FileText, CheckCircle2, AlertTriangle,
  Clock, Package, Archive, Layers, HardDrive, RefreshCw, X, Check, Printer,
  UserCheck, AlertCircle, Building2, ChevronRight, FileSpreadsheet, History
} from 'lucide-react';

export type InventoryTabType =
  | 'DASHBOARD'
  | 'ASSET_REGISTER'
  | 'CONSUMABLES_STOCK'
  | 'STATIONERY_REGISTER'
  | 'DEPARTMENT_STORE'
  | 'ASSET_ASSIGNMENT'
  | 'STOCK_TRANSACTIONS'
  | 'MAINTENANCE'
  | 'PHYSICAL_VERIFICATION'
  | 'TRANSFERS'
  | 'DISPOSAL'
  | 'PHYSICAL_FILES'
  | 'EXCEL_IMPORT'
  | 'REPORTS'
  | 'AUDIT_LOG';

interface Props {
  initialTab?: InventoryTabType;
}

export const InventoryAssetPage: React.FC<Props> = ({ initialTab = 'DASHBOARD' }) => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<InventoryTabType>(initialTab);

  // Global Central Academic Hierarchy Filters
  const institutes = useMemo(() => db.getInstitutes(), []);
  const [selectedInstId, setSelectedInstId] = useState<string>(
    user?.instituteId || (institutes.length > 0 ? institutes[0].id : '')
  );

  const departments = useMemo(() => {
    return selectedInstId ? db.getDepartmentsByInstitute(selectedInstId) : db.getDepartments();
  }, [selectedInstId]);

  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    (user?.role === 'HOD' && user?.departmentId) ? user.departmentId : ''
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [showCreateAssetModal, setShowCreateAssetModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);
  const [showAssetDetailModal, setShowAssetDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showDisposalModal, setShowDisposalModal] = useState(false);

  const [showReceiveStockModal, setShowReceiveStockModal] = useState(false);
  const [showIssueStockModal, setShowIssueStockModal] = useState(false);
  const [showReturnStockModal, setShowReturnStockModal] = useState(false);
  const [selectedConsumable, setSelectedConsumable] = useState<ConsumableItem | null>(null);

  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PhysicalFileRecord | null>(null);

  const [quickLookupTag, setQuickLookupTag] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'ASSETS' | 'CONSUMABLES' | 'FILES'>('ASSETS');
  const [importErrors, setImportErrors] = useState<{ rowNumber: number; field: string; value: any; reason: string }[]>([]);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Queries
  const categories = useMemo(() => db.getInventoryCategories(), []);
  const locations = useMemo(() => db.getInventoryLocations(selectedInstId, selectedDeptId || undefined), [selectedInstId, selectedDeptId]);

  const assets = useMemo(() => {
    return db.getFixedAssets(user, {
      instituteId: selectedInstId !== 'ALL' ? selectedInstId : undefined,
      departmentId: selectedDeptId && selectedDeptId !== 'ALL' ? selectedDeptId : undefined,
      categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      search: searchQuery
    });
  }, [user, selectedInstId, selectedDeptId, categoryFilter, statusFilter, searchQuery, feedbackMsg]);

  const consumables = useMemo(() => {
    return db.getConsumables(user, {
      instituteId: selectedInstId !== 'ALL' ? selectedInstId : undefined,
      departmentId: selectedDeptId && selectedDeptId !== 'ALL' ? selectedDeptId : undefined,
      search: searchQuery
    });
  }, [user, selectedInstId, selectedDeptId, searchQuery, feedbackMsg]);

  const stockTransactions = useMemo(() => {
    return db.getStockTransactions({
      instituteId: selectedInstId !== 'ALL' ? selectedInstId : undefined,
      departmentId: selectedDeptId && selectedDeptId !== 'ALL' ? selectedDeptId : undefined
    });
  }, [selectedInstId, selectedDeptId, feedbackMsg]);

  const physicalFiles = useMemo(() => {
    return db.getPhysicalFiles(user, {
      instituteId: selectedInstId !== 'ALL' ? selectedInstId : undefined,
      departmentId: selectedDeptId && selectedDeptId !== 'ALL' ? selectedDeptId : undefined,
      search: searchQuery
    });
  }, [user, selectedInstId, selectedDeptId, searchQuery, feedbackMsg]);

  const auditLogs = useMemo(() => {
    return db.getInventoryAuditLogs({ search: searchQuery });
  }, [searchQuery, feedbackMsg]);

  // Dashboard KPI Computations
  const totalAssetsCount = assets.length;
  const activeAssetsCount = assets.filter(a => a.status === 'ACTIVE' || a.status === 'ASSIGNED').length;
  const assignedAssetsCount = assets.filter(a => a.status === 'ASSIGNED').length;
  const inStoreAssetsCount = assets.filter(a => a.status === 'IN_STORE' || a.status === 'ACTIVE').length;
  const maintenanceCount = assets.filter(a => a.status === 'UNDER_MAINTENANCE').length;
  const damagedCount = assets.filter(a => a.status === 'DAMAGED' || a.status === 'LOST').length;
  const disposedCount = assets.filter(a => a.status === 'DISPOSED').length;
  const totalAssetValue = assets.reduce((acc, a) => acc + (a.currentValue || 0), 0);

  const lowStockConsumables = consumables.filter(c => c.currentBalance <= c.minimumStockLevel);
  const totalConsumableItems = consumables.length;

  // Selected Institute Details
  const currentInst = institutes.find(i => i.id === selectedInstId);
  const currentDept = departments.find(d => d.id === selectedDeptId);

  // Form states for modals
  const [assetForm, setAssetForm] = useState<Partial<FixedAsset>>({
    name: '',
    categoryId: 'cat-it-1',
    instituteId: selectedInstId,
    departmentId: selectedDeptId,
    locationName: '',
    building: 'Engineering Block A',
    floor: '2nd Floor',
    roomNo: 'A-204',
    purchaseCost: 50000,
    serialNumber: '',
    modelNumber: '',
    manufacturer: '',
    vendor: '',
    purchaseOrderNumber: '',
    assetCondition: 'NEW',
    status: 'ACTIVE',
    cpuConfig: {
      processor: 'Intel Core i7 12th Gen',
      ram: '16 GB DDR4',
      storageCapacity: '512 GB NVMe SSD',
      os: 'Windows 11 Pro'
    }
  });

  const handleCreateAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = db.createFixedAsset({
        ...assetForm,
        instituteId: selectedInstId,
        departmentId: selectedDeptId || undefined
      }, user || undefined);
      setShowCreateAssetModal(false);
      showNotification(`Asset ${created.assetTag} created successfully!`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to create asset', 'error');
    }
  };

  const handleQuickLookup = () => {
    if (!quickLookupTag.trim()) return;
    const found = db.getFixedAssetById(quickLookupTag.trim());
    if (found) {
      setSelectedAsset(found);
      setShowAssetDetailModal(true);
      setQuickLookupTag('');
    } else {
      showNotification(`No asset found with Tag / Serial: "${quickLookupTag}"`, 'error');
    }
  };

  const handleExcelImport = () => {
    if (!importFile) {
      showNotification('Please select an Excel (.xlsx) file first', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (importType === 'ASSETS') {
          const res = validateAssetExcelRows(rows, institutes, db.getDepartments(), categories);
          if (!res.isValid) {
            setImportErrors(res.errors);
            showNotification(`Validation failed with ${res.errors.length} error(s). Please correct them.`, 'error');
            return;
          }
          res.validatedData.forEach(item => {
            db.createFixedAsset(item, user || undefined);
          });
          setImportErrors([]);
          setImportSuccessCount(res.validatedData.length);
          showNotification(`Successfully imported ${res.validatedData.length} fixed assets!`);
        } else if (importType === 'CONSUMABLES') {
          const res = validateConsumableExcelRows(rows, institutes, db.getDepartments(), categories);
          if (!res.isValid) {
            setImportErrors(res.errors);
            showNotification(`Validation failed with ${res.errors.length} error(s).`, 'error');
            return;
          }
          res.validatedData.forEach(item => {
            db.createConsumableItem(item, user || undefined);
          });
          setImportErrors([]);
          setImportSuccessCount(res.validatedData.length);
          showNotification(`Successfully imported ${res.validatedData.length} consumable items!`);
        }
      } catch (err: any) {
        showNotification('Error processing Excel file: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(importFile);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Toast Feedback Notification */}
      {feedbackMsg && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white font-medium ${
          feedbackMsg.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="ml-2 hover:opacity-75"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-indigo-900 text-white rounded-2xl p-6 shadow-xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/10 backdrop-blur rounded-xl">
              <Boxes className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">University Inventory & Asset Management</h1>
              <p className="text-slate-300 text-sm">
                Centralized Department-Wise Asset, Consumable & Document Storage Register
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-2">
            <span className="px-2.5 py-1 bg-white/10 rounded-full flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              {currentInst?.name || 'All Institutes'}
            </span>
            {currentDept && (
              <span className="px-2.5 py-1 bg-white/10 rounded-full flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                {currentDept.name}
              </span>
            )}
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-semibold">
              Live Assets: {totalAssetsCount} (₹{totalAssetValue.toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        {/* Quick QR Lookup and Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex items-center flex-1 md:flex-initial">
            <QrCode className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Scan QR / Asset Tag..."
              value={quickLookupTag}
              onChange={(e) => setQuickLookupTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickLookup()}
              className="pl-9 pr-3 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full md:w-48"
            />
            <button
              onClick={handleQuickLookup}
              className="ml-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-md transition-all"
            >
              Find
            </button>
          </div>

          <button
            onClick={() => {
              setAssetForm({
                ...assetForm,
                instituteId: selectedInstId,
                departmentId: selectedDeptId
              });
              setShowCreateAssetModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-navy-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </div>

      {/* Central Academic Master Hierarchy Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Master Filters:</span>
          </div>

          {/* Institute Selector */}
          <select
            value={selectedInstId}
            onChange={(e) => {
              setSelectedInstId(e.target.value);
              setSelectedDeptId('');
            }}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">🏛 All University Institutes</option>
            {institutes.map(i => (
              <option key={i.id} value={i.id}>{i.name} ({i.code})</option>
            ))}
          </select>

          {/* Department Selector (Only if Institute has Departments) */}
          {departments.length > 0 && (
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">🏢 All Departments / Direct Programs</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          )}

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">📦 All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Tag, Name, Location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 mb-6 scrollbar-thin">
        {[
          { id: 'DASHBOARD', label: 'Dashboard', icon: Boxes },
          { id: 'ASSET_REGISTER', label: 'Asset Register', icon: Package },
          { id: 'CONSUMABLES_STOCK', label: 'Consumable Stock', icon: Layers },
          { id: 'STATIONERY_REGISTER', label: 'Stationery', icon: FileSpreadsheet },
          { id: 'DEPARTMENT_STORE', label: 'Department Store', icon: Building2 },
          { id: 'ASSET_ASSIGNMENT', label: 'Asset Assignment', icon: UserCheck },
          { id: 'STOCK_TRANSACTIONS', label: 'Stock Receipts/Issues', icon: ArrowRightLeft },
          { id: 'MAINTENANCE', label: 'Maintenance & AMC', icon: Wrench },
          { id: 'PHYSICAL_VERIFICATION', label: 'Physical Verification', icon: ShieldCheck },
          { id: 'TRANSFERS', label: 'Transfers', icon: RefreshCw },
          { id: 'DISPOSAL', label: 'Disposal / Scrap', icon: Trash2 },
          { id: 'PHYSICAL_FILES', label: 'Physical File Archive', icon: Archive },
          { id: 'EXCEL_IMPORT', label: 'Excel Import & Templates', icon: Upload },
          { id: 'REPORTS', label: 'Reports & Export', icon: Download },
          { id: 'AUDIT_LOG', label: 'Audit Trail', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as InventoryTabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: DASHBOARD */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Low Stock Warning Alert Banner */}
          {lowStockConsumables.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Low Stock Alert Detected ({lowStockConsumables.length} Items)</h4>
                  <p className="text-amber-800 text-xs">
                    The following consumable items have dropped below their designated minimum threshold: {' '}
                    <span className="font-semibold">{lowStockConsumables.map(c => `${c.name} (${c.currentBalance} ${c.unit})`).slice(0, 3).join(', ')}</span>
                    {lowStockConsumables.length > 3 && ` and ${lowStockConsumables.length - 3} more.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('CONSUMABLES_STOCK')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow transition-all"
              >
                Reorder Stock
              </button>
            </div>
          )}

          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Fixed Assets</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{totalAssetsCount}</h3>
                <p className="text-emerald-600 text-xs font-medium mt-1">₹{totalAssetValue.toLocaleString('en-IN')} Book Value</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Assigned to Staff</p>
                <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">{assignedAssetsCount}</h3>
                <p className="text-slate-500 text-xs font-medium mt-1">{((assignedAssetsCount / (totalAssetsCount || 1)) * 100).toFixed(0)}% Utilization Rate</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Under Maintenance</p>
                <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{maintenanceCount}</h3>
                <p className="text-slate-500 text-xs font-medium mt-1">{damagedCount} Marked Damaged/Lost</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Wrench className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Consumable Stock Items</p>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{totalConsumableItems}</h3>
                <p className={`text-xs font-semibold mt-1 ${lowStockConsumables.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {lowStockConsumables.length} Low Stock Warnings
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Shortcuts and Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-indigo-600" />
                  Asset Inventory by Category Group
                </h3>
                <span className="text-xs text-slate-500 font-medium">Updated live</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'IT & Computing', group: 'IT_EQUIPMENT', count: assets.filter(a => a.categoryGroup === 'IT_EQUIPMENT').length, color: 'bg-blue-500' },
                  { label: 'Furniture & Desks', group: 'FURNITURE', count: assets.filter(a => a.categoryGroup === 'FURNITURE').length, color: 'bg-amber-500' },
                  { label: 'Lab & Technical', group: 'LAB_TECHNICAL', count: assets.filter(a => a.categoryGroup === 'LAB_TECHNICAL').length, color: 'bg-purple-500' },
                  { label: 'Office Equipment', group: 'OFFICE_EQUIPMENT', count: assets.filter(a => a.categoryGroup === 'OFFICE_EQUIPMENT').length, color: 'bg-emerald-500' },
                  { label: 'Facility & Electrical', group: 'FACILITY_ELECTRICAL', count: assets.filter(a => a.categoryGroup === 'FACILITY_ELECTRICAL').length, color: 'bg-cyan-500' },
                  { label: 'Physical Document Files', group: 'PHYSICAL_RECORDS', count: physicalFiles.length, color: 'bg-rose-500' }
                ].map(item => (
                  <div key={item.group} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                      <h4 className="text-xl font-bold text-slate-800 mt-1">{item.count}</h4>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-br from-indigo-900 to-navy-950 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Store & Custody Actions
                </h3>
                <p className="text-slate-300 text-xs mb-4">Rapid stock receipt, issue vouchers and physical verification workflows.</p>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setShowReceiveStockModal(true)}
                    className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-400" /> Receive Consumable Stock</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowIssueStockModal(true)}
                    className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-sky-400" /> Issue Stock to Faculty / Lab</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowCreateFileModal(true)}
                    className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2"><Archive className="w-4 h-4 text-amber-400" /> Archive Physical Document File</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span>Location Master</span>
                <span className="font-semibold text-white">{locations.length} Campus Locations Mapped</span>
              </div>
            </div>
          </div>

          {/* Recent Fixed Assets Table Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Recently Registered Assets</h3>
              <button
                onClick={() => setActiveTab('ASSET_REGISTER')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View Full Asset Register <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Asset Tag</th>
                    <th className="p-3">Asset Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Custodian</th>
                    <th className="p-3">Value (₹)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assets.slice(0, 5).map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded text-xs">
                          {asset.assetTag}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{asset.name}</td>
                      <td className="p-3 text-slate-600">{asset.categoryName}</td>
                      <td className="p-3 text-slate-600 text-xs">{asset.locationName || asset.roomNo || 'Dept Store'}</td>
                      <td className="p-3 text-slate-700 font-medium">{asset.assignedToName || '— In Store —'}</td>
                      <td className="p-3 font-medium text-slate-900">₹{asset.currentValue?.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          asset.status === 'ACTIVE' || asset.status === 'ASSIGNED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : asset.status === 'UNDER_MAINTENANCE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setShowAssetDetailModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: ASSET REGISTER */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'ASSET_REGISTER' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Fixed Asset Master Register</h3>
              <p className="text-slate-500 text-xs">Complete registry of capitalized equipment, computers, furniture and lab instruments.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const headers = ['Asset Tag', 'Name', 'Category', 'Institute', 'Department', 'Location', 'Custodian', 'Cost', 'Current Value', 'Serial No', 'Status'];
                  const rows = assets.map(a => [
                    a.assetTag, a.name, a.categoryName, a.instituteName, a.departmentName || 'Direct',
                    a.locationName || a.roomNo || 'Store', a.assignedToName || 'None', a.purchaseCost, a.currentValue,
                    a.serialNumber || '', a.status
                  ]);
                  exportToExcel('Fixed_Asset_Register', headers, rows, { instituteName: currentInst?.name, departmentName: currentDept?.name });
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" /> Export Excel
              </button>

              <button
                onClick={() => {
                  setAssetForm({
                    ...assetForm,
                    instituteId: selectedInstId,
                    departmentId: selectedDeptId
                  });
                  setShowCreateAssetModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> New Fixed Asset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Asset Tag</th>
                  <th className="p-3">Asset Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location Coordinates</th>
                  <th className="p-3">Assigned Custodian</th>
                  <th className="p-3">Purchase Date</th>
                  <th className="p-3">Cost (₹)</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 font-medium">
                      No assets found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  assets.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md text-xs">
                            {asset.assetTag}
                          </span>
                          {asset.cpuConfig && (
                            <span className="p-1 bg-amber-100 text-amber-800 rounded" title="Desktop / CPU Specs Configured">
                              <HardDrive className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{asset.name}</div>
                        <div className="text-xs text-slate-500">SN: {asset.serialNumber || 'N/A'} • {asset.manufacturer || 'OEM'}</div>
                      </td>
                      <td className="p-3 text-slate-700 font-medium text-xs">{asset.categoryName}</td>
                      <td className="p-3 text-slate-600 text-xs">
                        <div>{asset.building || 'Campus Block'}</div>
                        <div className="text-slate-400">{asset.locationName || asset.roomNo || 'Store'}</div>
                      </td>
                      <td className="p-3">
                        {asset.assignedToName ? (
                          <div>
                            <div className="font-semibold text-slate-800 text-xs">{asset.assignedToName}</div>
                            <div className="text-[11px] text-slate-400">{asset.assignedToEmpCode || 'Faculty'}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">In Store</span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-slate-600">{asset.purchaseDate}</td>
                      <td className="p-3 font-bold text-slate-900">₹{asset.currentValue?.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                          {asset.assetCondition}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          asset.status === 'ASSIGNED' || asset.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : asset.status === 'UNDER_MAINTENANCE'
                            ? 'bg-amber-100 text-amber-800'
                            : asset.status === 'DISPOSED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowAssetDetailModal(true);
                            }}
                            title="View Asset Details & Specs"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowAssignModal(true);
                            }}
                            title="Assign to Employee / Location"
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowTransferModal(true);
                            }}
                            title="Transfer Asset"
                            className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowMaintenanceModal(true);
                            }}
                            title="Log Maintenance / Service"
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowVerificationModal(true);
                            }}
                            title="Record Physical Verification"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: CONSUMABLES & STOCK REGISTER */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {(activeTab === 'CONSUMABLES_STOCK' || activeTab === 'STATIONERY_REGISTER') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Consumables & Quantity Stock Register</h3>
              <p className="text-slate-500 text-xs">Real-time balances for paper reams, printer toners, lab chemicals, stationery and cables.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReceiveStockModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Receive Stock
              </button>

              <button
                onClick={() => setShowIssueStockModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <ArrowRightLeft className="w-4 h-4" /> Issue Stock
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Item Code</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Opening Qty</th>
                  <th className="p-3">Received Qty</th>
                  <th className="p-3">Issued Qty</th>
                  <th className="p-3">Current Balance</th>
                  <th className="p-3">Min / Reorder</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consumables.map(item => {
                  const isLow = item.currentBalance <= item.minimumStockLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {item.itemCode}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.locationName}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-600 text-xs">{item.unit}</td>
                      <td className="p-3 text-slate-600">{item.openingQuantity}</td>
                      <td className="p-3 text-emerald-600 font-semibold">+{item.receivedQuantity}</td>
                      <td className="p-3 text-rose-600 font-semibold">-{item.issuedQuantity}</td>
                      <td className="p-3">
                        <span className="text-base font-extrabold text-slate-900">
                          {item.currentBalance} {item.unit}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-500">
                        Min: {item.minimumStockLevel} | Reorder: {item.reorderLevel}
                      </td>
                      <td className="p-3">
                        {isLow ? (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold w-max">
                            Optimal
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedConsumable(item);
                              setShowIssueStockModal(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs"
                          >
                            Issue
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: PHYSICAL FILE & DOCUMENT ARCHIVE */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'PHYSICAL_FILES' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Physical Document & Statutory Archive Register</h3>
              <p className="text-slate-500 text-xs">Track student dossiers, examination gazettes, NAAC IQAC criteria files and legal records by exact Rack, Shelf and Box coordinates.</p>
            </div>

            <button
              onClick={() => setShowCreateFileModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Archive New File
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">File Number</th>
                  <th className="p-3">File Title / Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Storage Coordinates</th>
                  <th className="p-3">Designated Custodian</th>
                  <th className="p-3">Year</th>
                  <th className="p-3">Retention Until</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {physicalFiles.map(file => (
                  <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded text-xs">
                        {file.fileNumber}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{file.fileName}</td>
                    <td className="p-3 text-xs font-medium text-slate-600">{file.fileCategory}</td>
                    <td className="p-3 text-xs text-slate-700">
                      <div className="font-bold text-slate-800">{file.storageLocation}</div>
                      <div className="text-slate-500">{file.rackNumber} • {file.shelfNumber} • {file.boxNumber}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-800 text-xs">{file.custodianName}</td>
                    <td className="p-3 text-xs text-slate-600">{file.documentYear}</td>
                    <td className="p-3 text-xs text-slate-600">{file.retentionUntil || 'Permanent'}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                        {file.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: EXCEL IMPORT & TEMPLATES */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'EXCEL_IMPORT' && (
        <div className="space-y-6">
          {/* Download Official Templates Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              Official Downloadable Excel Templates (.xlsx)
            </h3>
            <p className="text-slate-500 text-xs mb-5">
              Download standardized university Excel spreadsheets with pre-formatted columns and validation dropdowns.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <FileSpreadsheet className="w-8 h-8 text-emerald-600 mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Fixed Asset Import</h4>
                  <p className="text-slate-500 text-xs mt-1">Template for bulk registering computers, furniture, machinery and lab instruments.</p>
                </div>
                <button
                  onClick={downloadAssetImportTemplateExcel}
                  className="mt-4 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" /> Download .xlsx
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <Layers className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Consumables & Stock</h4>
                  <p className="text-slate-500 text-xs mt-1">Template for bulk importing paper reams, printing toners and stationery items.</p>
                </div>
                <button
                  onClick={downloadConsumableStockTemplateExcel}
                  className="mt-4 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" /> Download .xlsx
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <Archive className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Physical File Register</h4>
                  <p className="text-slate-500 text-xs mt-1">Template for archiving exam dossiers, student record files, and NAAC folders.</p>
                </div>
                <button
                  onClick={downloadPhysicalFileTemplateExcel}
                  className="mt-4 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" /> Download .xlsx
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <UserCheck className="w-8 h-8 text-amber-600 mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Employee Asset Assignment</h4>
                  <p className="text-slate-500 text-xs mt-1">Template for bulk mapping assets to faculty and staff employee codes.</p>
                </div>
                <button
                  onClick={downloadAssetAssignmentTemplateExcel}
                  className="mt-4 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" /> Download .xlsx
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Excel Upload & Validation Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Bulk Excel Upload & Academic Master Validation
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              All rows will be rigorously validated against the Central University Master (Institutes, Departments, Categories).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Register Type</label>
                <select
                  value={importType}
                  onChange={(e) => setImportType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium"
                >
                  <option value="ASSETS">Fixed Asset Register</option>
                  <option value="CONSUMABLES">Consumables & Stock Register</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Choose Excel Spreadsheet (.xlsx)</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <button
                onClick={handleExcelImport}
                disabled={!importFile}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" /> Validate & Import
              </button>
            </div>

            {/* Error Reporting Table */}
            {importErrors.length > 0 && (
              <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <h4 className="font-bold text-rose-900 text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Validation Errors Found ({importErrors.length})
                </h4>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-rose-100 text-rose-800 font-bold">
                      <tr>
                        <th className="p-2">Row</th>
                        <th className="p-2">Column Field</th>
                        <th className="p-2">Invalid Value</th>
                        <th className="p-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-200 text-rose-900">
                      {importErrors.map((err, i) => (
                        <tr key={i}>
                          <td className="p-2 font-bold">{err.rowNumber}</td>
                          <td className="p-2 font-semibold">{err.field}</td>
                          <td className="p-2 font-mono">{String(err.value)}</td>
                          <td className="p-2">{err.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* TAB 6: AUDIT TRAIL */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'AUDIT_LOG' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Immutable Inventory Audit Trail</h3>
              <p className="text-slate-500 text-xs">Chronological record of every creation, assignment, issue, transfer, maintenance and disposal event.</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Entity Description</th>
                  <th className="p-3">Performed By</th>
                  <th className="p-3">Audit Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-xs text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-semibold text-slate-700">{log.module}</td>
                    <td className="p-3 font-semibold text-slate-800 text-xs">{log.entityName}</td>
                    <td className="p-3 text-xs text-slate-600">{log.performedByName} ({log.performedByRole})</td>
                    <td className="p-3 text-xs text-slate-600">{log.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE FIXED ASSET */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {showCreateAssetModal && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 bg-gradient-to-r from-navy-900 to-indigo-900 text-white rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Register New University Fixed Asset
              </h3>
              <button onClick={() => setShowCreateAssetModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssetSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Asset Name / Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell OptiPlex 7000 Workstation"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Inventory Category *</label>
                  <select
                    value={assetForm.categoryId}
                    onChange={(e) => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setAssetForm({
                        ...assetForm,
                        categoryId: e.target.value,
                        categoryGroup: cat?.categoryGroup
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.categoryGroup})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DL-OPT7000-8849"
                    value={assetForm.serialNumber}
                    onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={assetForm.purchaseCost}
                    onChange={(e) => setAssetForm({ ...assetForm, purchaseCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. A-204 AI Lab"
                    value={assetForm.roomNo}
                    onChange={(e) => setAssetForm({ ...assetForm, roomNo: e.target.value, locationName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturer / Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dell India / HP"
                    value={assetForm.manufacturer}
                    onChange={(e) => setAssetForm({ ...assetForm, manufacturer: e.target.value, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Dedicated CPU Configuration Section if IT Equipment */}
              {assetForm.categoryId === 'cat-it-1' && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-indigo-600" />
                    Desktop & CPU Hardware Specifications
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Processor</label>
                      <input
                        type="text"
                        placeholder="Intel Core i7 12th Gen"
                        value={assetForm.cpuConfig?.processor || ''}
                        onChange={(e) => setAssetForm({
                          ...assetForm,
                          cpuConfig: { ...assetForm.cpuConfig, processor: e.target.value, os: assetForm.cpuConfig?.os || 'Windows 11', ram: assetForm.cpuConfig?.ram || '16 GB', storageCapacity: assetForm.cpuConfig?.storageCapacity || '512 GB SSD' }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">RAM</label>
                      <input
                        type="text"
                        placeholder="16 GB DDR4"
                        value={assetForm.cpuConfig?.ram || ''}
                        onChange={(e) => setAssetForm({
                          ...assetForm,
                          cpuConfig: { ...assetForm.cpuConfig, ram: e.target.value, processor: assetForm.cpuConfig?.processor || '', os: assetForm.cpuConfig?.os || 'Windows 11', storageCapacity: assetForm.cpuConfig?.storageCapacity || '512 GB SSD' }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Storage</label>
                      <input
                        type="text"
                        placeholder="512 GB NVMe SSD"
                        value={assetForm.cpuConfig?.storageCapacity || ''}
                        onChange={(e) => setAssetForm({
                          ...assetForm,
                          cpuConfig: { ...assetForm.cpuConfig, storageCapacity: e.target.value, processor: assetForm.cpuConfig?.processor || '', os: assetForm.cpuConfig?.os || 'Windows 11', ram: assetForm.cpuConfig?.ram || '16 GB' }
                        })}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateAssetModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: ASSET DETAIL & QR CODE VIEWER */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {showAssetDetailModal && selectedAsset && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 bg-gradient-to-r from-navy-900 to-indigo-900 text-white rounded-t-2xl flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-amber-400 uppercase">{selectedAsset.assetTag}</span>
                <h3 className="font-bold text-lg">{selectedAsset.name}</h3>
              </div>
              <button onClick={() => setShowAssetDetailModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* QR and Metadata Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-5">
                <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-sm flex flex-col items-center">
                  <QrCode className="w-20 h-20 text-slate-800" />
                  <span className="text-[10px] font-mono font-bold text-slate-600 mt-1">{selectedAsset.assetTag}</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="text-slate-500 font-medium">Institute / Department</div>
                  <div className="font-bold text-slate-800">{selectedAsset.instituteName} • {selectedAsset.departmentName || 'Direct'}</div>
                  <div className="text-slate-500 font-medium mt-2">Assigned Custodian</div>
                  <div className="font-bold text-indigo-700">{selectedAsset.assignedToName || '— In Department Store —'}</div>
                  <div className="text-slate-500 font-medium mt-2">Location</div>
                  <div className="font-semibold text-slate-800">{selectedAsset.locationName || selectedAsset.roomNo || 'Store'}</div>
                </div>
              </div>

              {/* CPU Configuration Details if present */}
              {selectedAsset.cpuConfig && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <h4 className="font-bold text-indigo-950 text-xs mb-3 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-indigo-600" />
                    Hardware & CPU Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-500">Processor:</span> <span className="font-semibold">{selectedAsset.cpuConfig.processor}</span></div>
                    <div><span className="text-slate-500">RAM:</span> <span className="font-semibold">{selectedAsset.cpuConfig.ram}</span></div>
                    <div><span className="text-slate-500">Storage:</span> <span className="font-semibold">{selectedAsset.cpuConfig.storageCapacity}</span></div>
                    <div><span className="text-slate-500">Operating System:</span> <span className="font-semibold">{selectedAsset.cpuConfig.os}</span></div>
                    <div><span className="text-slate-500">IP Address:</span> <span className="font-mono font-semibold">{selectedAsset.cpuConfig.ipAddress || 'DHCP'}</span></div>
                    <div><span className="text-slate-500">Computer Name:</span> <span className="font-mono font-semibold">{selectedAsset.cpuConfig.computerName || selectedAsset.assetTag}</span></div>
                  </div>
                </div>
              )}

              {/* Purchase & Warranty */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-400">Purchase Date</div>
                  <div className="font-bold text-slate-800">{selectedAsset.purchaseDate || 'N/A'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-400">Purchase Cost</div>
                  <div className="font-bold text-slate-800">₹{selectedAsset.purchaseCost?.toLocaleString('en-IN')}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-400">Current Value</div>
                  <div className="font-bold text-emerald-700">₹{selectedAsset.currentValue?.toLocaleString('en-IN')}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-400">Warranty End</div>
                  <div className="font-bold text-slate-800">{selectedAsset.warrantyEnd || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Label
                </button>
                <button
                  onClick={() => setShowAssetDetailModal(false)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: ASSIGN ASSET */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {showAssignModal && selectedAsset && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Assign Asset: {selectedAsset.assetTag}</h3>
            <p className="text-slate-500 text-xs mb-4">Allocate this asset to an employee, faculty member or lab location.</p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              db.assignAsset(selectedAsset.id, {
                assignedToName: fd.get('assignedToName') as string,
                assignedToEmpCode: fd.get('assignedToEmpCode') as string,
                assignedToDesignation: fd.get('assignedToDesignation') as string,
                location: fd.get('location') as string,
                purpose: fd.get('purpose') as string
              }, user || undefined);
              setShowAssignModal(false);
              showNotification(`Asset ${selectedAsset.assetTag} assigned successfully!`);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Employee Name *</label>
                <input name="assignedToName" required placeholder="e.g. Dr. Aarav Mehta" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Employee Code</label>
                <input name="assignedToEmpCode" placeholder="e.g. EMP-SIT-042" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Room Number</label>
                <input name="location" placeholder="e.g. Engineering Block A (A-204)" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Purpose / Allocation Details</label>
                <textarea name="purpose" placeholder="Allocated for AI research and instruction" className="w-full px-3 py-2 border rounded-lg h-16" />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: RECEIVE STOCK */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {showReceiveStockModal && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Receive Consumable Stock</h3>
            <p className="text-slate-500 text-xs mb-4">Record incoming vendor goods and automatically increment available stock balances.</p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const res = db.receiveStock({
                itemId: fd.get('itemId') as string,
                quantity: Number(fd.get('quantity')),
                vendorName: fd.get('vendorName') as string,
                purchaseOrderNo: fd.get('purchaseOrderNo') as string,
                invoiceNo: fd.get('invoiceNo') as string,
                remarks: fd.get('remarks') as string
              }, user || undefined);

              if (res.success) {
                setShowReceiveStockModal(false);
                showNotification('Stock received and inventory balance updated successfully!');
              } else {
                showNotification(res.error || 'Failed to receive stock', 'error');
              }
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Consumable Item *</label>
                <select name="itemId" required className="w-full px-3 py-2 border rounded-lg bg-slate-50">
                  {consumables.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Current: {c.currentBalance} {c.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Received Quantity *</label>
                <input name="quantity" type="number" min="1" required placeholder="e.g. 100" className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vendor / Supplier Name</label>
                <input name="vendorName" placeholder="e.g. Shree Stationery Hub" className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purchase Order No</label>
                  <input name="purchaseOrderNo" placeholder="PO-2026-01" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Invoice Number</label>
                  <input name="invoiceNo" placeholder="INV-8841" className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowReceiveStockModal(false)} className="px-4 py-2 border rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold">Receive & Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: ISSUE STOCK */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {showIssueStockModal && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Issue Consumable Stock</h3>
            <p className="text-slate-500 text-xs mb-4">Deliver goods to faculty/department and subtract from current balance.</p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const res = db.issueStock({
                itemId: fd.get('itemId') as string,
                quantity: Number(fd.get('quantity')),
                issuedToName: fd.get('issuedToName') as string,
                purpose: fd.get('purpose') as string
              }, user || undefined);

              if (res.success) {
                setShowIssueStockModal(false);
                showNotification('Stock issued and inventory balance updated successfully!');
              } else {
                showNotification(res.error || 'Failed to issue stock', 'error');
              }
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Consumable Item *</label>
                <select
                  name="itemId"
                  defaultValue={selectedConsumable?.id}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                >
                  {consumables.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Available: {c.currentBalance} {c.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity to Issue *</label>
                <input name="quantity" type="number" min="1" required placeholder="e.g. 10" className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issued To (Employee / Lab Incharge) *</label>
                <input name="issuedToName" required placeholder="e.g. Dr. Aarav Mehta" className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purpose / Requirement Details</label>
                <textarea name="purpose" placeholder="For mid-semester exam question paper printing" className="w-full px-3 py-2 border rounded-lg h-16" />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowIssueStockModal(false)} className="px-4 py-2 border rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold">Issue Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* MODAL: ARCHIVE PHYSICAL FILE */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {showCreateFileModal && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Archive Physical Document Dossier</h3>
            <p className="text-slate-500 text-xs mb-4">Register physical paper files in Central Archives by exact Rack and Shelf coordinates.</p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              db.createPhysicalFile({
                fileName: fd.get('fileName') as string,
                fileCategory: fd.get('fileCategory') as string,
                fileNumber: fd.get('fileNumber') as string,
                instituteId: selectedInstId,
                departmentId: selectedDeptId || undefined,
                storageLocation: fd.get('storageLocation') as string,
                rackNumber: fd.get('rackNumber') as string,
                shelfNumber: fd.get('shelfNumber') as string,
                boxNumber: fd.get('boxNumber') as string,
                custodianName: fd.get('custodianName') as string
              }, user || undefined);
              setShowCreateFileModal(false);
              showNotification('Physical file archived successfully!');
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">File Title / Description *</label>
                <input name="fileName" required placeholder="e.g. Summer 2026 Regular Exam Gazette" className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">File Category *</label>
                  <select name="fileCategory" className="w-full px-3 py-2 border rounded-lg bg-slate-50">
                    <option value="EXAM_FILES">Examination Files</option>
                    <option value="STUDENT_FILES">Student Files</option>
                    <option value="NAAC_IQAC_FILES">NAAC & IQAC Files</option>
                    <option value="ADMISSION_FILES">Admission Files</option>
                    <option value="FINANCE_FILES">Finance & Accounts</option>
                    <option value="DEPT_FILES">Department Files</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">File Number / Ref</label>
                  <input name="fileNumber" placeholder="EXAM/2026/001" className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Storage Room / Archive Location</label>
                <input name="storageLocation" placeholder="Central Archive Room ARC-101" className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rack No</label>
                  <input name="rackNumber" placeholder="Rack R-04" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shelf No</label>
                  <input name="shelfNumber" placeholder="Shelf S-02" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Box No</label>
                  <input name="boxNumber" placeholder="Box B-18" className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custodian Name</label>
                <input name="custodianName" placeholder="Dr. Sanjay Patel" className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowCreateFileModal(false)} className="px-4 py-2 border rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold">Save File Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
