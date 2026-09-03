import React, { useState, useRef } from 'react';
import {
  Users,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Sparkles,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
  Trash2,
  Search,
  CheckSquare
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { userService, CreateUserInput, GeneratedUserRecord } from '../../services/userService';

export const BulkUserProvisioningCard: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'FILE_UPLOAD' | 'QUICK_GENERATE'>('FILE_UPLOAD');
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [quantity, setQuantity] = useState<number>(5);
  const [department, setDepartment] = useState<string>('Computer Science & Engineering');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showAllPasswords, setShowAllPasswords] = useState<boolean>(true);
  const [credentialSearch, setCredentialSearch] = useState<string>('');

  // File Upload & Parsing State
  const [parsedUsers, setParsedUsers] = useState<CreateUserInput[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success Notification & Credentials Vault State
  const [successNotification, setSuccessNotification] = useState<{
    show: boolean;
    count: number;
    users: GeneratedUserRecord[];
    timestamp: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Parses uploaded Excel (.xlsx, .xls) or CSV files in the browser.
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setErrorMessage(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt: ProgressEvent<FileReader>) => {
      try {
        const binaryData = evt.target?.result;
        const workbook = XLSX.read(binaryData, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setFileError('The uploaded file contains no data rows.');
          setParsedUsers([]);
          return;
        }

        // Map and normalize flexible column names
        const extractedUsers: CreateUserInput[] = [];
        const ignoredRows: number[] = [];

        rawJson.forEach((row, index) => {
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach(k => {
            normalizedRow[k.trim().toLowerCase().replace(/[\s_-]+/g, '')] = row[k];
          });

          const name =
            normalizedRow['name'] ||
            normalizedRow['fullname'] ||
            normalizedRow['studentname'] ||
            normalizedRow['staffname'] ||
            normalizedRow['username'] ||
            normalizedRow['employeename'] ||
            '';

          const email =
            normalizedRow['email'] ||
            normalizedRow['emailaddress'] ||
            normalizedRow['mail'] ||
            normalizedRow['useremail'] ||
            '';

          const detectedRole =
            normalizedRow['role'] ||
            normalizedRow['type'] ||
            normalizedRow['userrole'] ||
            role;

          const deptName =
            normalizedRow['department'] ||
            normalizedRow['departmentname'] ||
            normalizedRow['dept'] ||
            department;

          const idOrEnrollment =
            normalizedRow['enrollmentno'] ||
            normalizedRow['enrollment'] ||
            normalizedRow['employeeid'] ||
            normalizedRow['empid'] ||
            normalizedRow['id'] ||
            '';

          const designation =
            normalizedRow['designation'] ||
            normalizedRow['title'] ||
            normalizedRow['jobtitle'] ||
            '';

          const phone =
            normalizedRow['phone'] ||
            normalizedRow['mobile'] ||
            normalizedRow['contact'] ||
            '';

          if (name && email) {
            extractedUsers.push({
              name: String(name).trim(),
              email: String(email).trim().toLowerCase(),
              role: String(detectedRole).toLowerCase() === 'staff' ? 'staff' : 'student',
              departmentName: String(deptName).trim(),
              enrollmentNo: String(detectedRole).toLowerCase() === 'student' ? String(idOrEnrollment) : '',
              employeeId: String(detectedRole).toLowerCase() === 'staff' ? String(idOrEnrollment) : '',
              designation: String(designation).trim(),
              phone: String(phone).trim()
            });
          } else {
            ignoredRows.push(index + 2); // Row index in Excel
          }
        });

        if (extractedUsers.length === 0) {
          setFileError('Could not find valid "Name" and "Email" columns in the uploaded file.');
          setParsedUsers([]);
        } else {
          setParsedUsers(extractedUsers);
          if (ignoredRows.length > 0) {
            setFileError(`Parsed ${extractedUsers.length} valid users. ${ignoredRows.length} rows were skipped due to missing name or email (Rows: ${ignoredRows.slice(0, 5).join(', ')}${ignoredRows.length > 5 ? '...' : ''}).`);
          }
        }
      } catch (err: any) {
        console.error('[BulkUserProvisioning] Parse Error:', err);
        setFileError(`Failed to parse file: ${err.message || 'Invalid format'}`);
        setParsedUsers([]);
      }
    };

    reader.readAsBinaryString(file);
  };

  /**
   * Provisions parsed users from the uploaded file into Cloud Firestore
   */
  const handleProcessParsedFile = async () => {
    if (!parsedUsers || parsedUsers.length === 0) {
      setErrorMessage('No parsed users available to provision.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Execute bulk generation in Cloud Firestore
      const result = await userService.generateBulkUsers(parsedUsers);

      if (result.totalCreated > 0) {
        setSuccessNotification({
          show: true,
          count: result.totalCreated,
          users: result.users,
          timestamp: new Date().toLocaleString()
        });
        setParsedUsers([]);
        setFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else if (result.errors.length > 0) {
        setErrorMessage(result.errors[0].error || 'Failed to provision users to Cloud Firestore');
      }
    } catch (err: any) {
      console.error('[BulkUserProvisioning] Generation Error:', err);
      setErrorMessage(err.message || 'An error occurred during bulk user creation');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quick generation of sample preset student or staff accounts
   */
  const handleQuickBulkGenerate = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const timestamp = Date.now().toString().slice(-4);
      const inputs: CreateUserInput[] = [];

      for (let i = 1; i <= quantity; i++) {
        const paddedIndex = i.toString().padStart(2, '0');
        if (role === 'student') {
          inputs.push({
            name: `Student ${paddedIndex} (${department})`,
            email: `student.${timestamp}.${paddedIndex}@swarrnim.edu.in`,
            role: 'student',
            departmentName: department,
            enrollmentNo: `SWU26${timestamp}${paddedIndex}`
          });
        } else {
          inputs.push({
            name: `Staff Member ${paddedIndex} (${department})`,
            email: `staff.${timestamp}.${paddedIndex}@swarrnim.edu.in`,
            role: 'staff',
            departmentName: department,
            designation: i % 2 === 0 ? 'Assistant Professor' : 'Lab Instructor',
            employeeId: `EMP${timestamp}${paddedIndex}`
          });
        }
      }

      // Execute bulk generation in Cloud Firestore
      const result = await userService.generateBulkUsers(inputs);

      if (result.totalCreated > 0) {
        setSuccessNotification({
          show: true,
          count: result.totalCreated,
          users: result.users,
          timestamp: new Date().toLocaleString()
        });
      } else if (result.errors.length > 0) {
        setErrorMessage(result.errors[0].error || 'Failed to provision bulk user accounts');
      }
    } catch (err: any) {
      console.error('[BulkUserProvisioning] Error:', err);
      setErrorMessage(err.message || 'An error occurred during bulk user creation');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generates and downloads a sample Excel (.xlsx) or CSV template for admins
   */
  const downloadSampleTemplate = (format: 'xlsx' | 'csv') => {
    const sampleData = [
      {
        'Full Name': 'Aarav Patel',
        'Email Address': 'aarav.patel@swarrnim.edu.in',
        'Role': 'student',
        'Department': 'Computer Science & Engineering',
        'Enrollment / Employee ID': 'SWU2026001',
        'Phone': '+91 98765 43210'
      },
      {
        'Full Name': 'Dr. Meera Sharma',
        'Email Address': 'meera.sharma@swarrnim.edu.in',
        'Role': 'staff',
        'Department': 'Computer Science & Engineering',
        'Enrollment / Employee ID': 'EMP-CSE-102',
        'Phone': '+91 98765 43211'
      },
      {
        'Full Name': 'Rohan Shah',
        'Email Address': 'rohan.shah@swarrnim.edu.in',
        'Role': 'student',
        'Department': 'Mechanical Engineering',
        'Enrollment / Employee ID': 'SWU2026002',
        'Phone': '+91 98765 43212'
      }
    ];

    if (format === 'csv') {
      const headers = ['Full Name,Email Address,Role,Department,Enrollment / Employee ID,Phone'];
      const rows = sampleData.map(
        r => `"${r['Full Name']}","${r['Email Address']}","${r['Role']}","${r['Department']}","${r['Enrollment / Employee ID']}","${r['Phone']}"`
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ssiu_user_import_template.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const ws = XLSX.utils.json_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      XLSX.writeFile(wb, `ssiu_user_import_template.xlsx`);
    }
  };

  /**
   * Downloads the generated credentials as a secure CSV file for admin distribution.
   */
  const exportCredentialsCsv = () => {
    if (!successNotification || successNotification.users.length === 0) return;
    const headers = ['Unique ID,Full Name,Email Address,Role,Department,Designation,Enrollment/Emp ID,Auto-Generated Password,Account Status,Created At'];
    const rows = successNotification.users.map(
      u => `"${u.id}","${u.name}","${u.email}","${u.role}","${u.departmentName || ''}","${u.designation || ''}","${u.enrollmentNo || u.employeeId || ''}","${u.password || ''}","${u.status}","${u.createdAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ssiu_credentials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Downloads the generated credentials as an Excel (.xlsx) workbook.
   */
  const exportCredentialsExcel = () => {
    if (!successNotification || successNotification.users.length === 0) return;
    const data = successNotification.users.map(u => ({
      'Unique ID': u.id,
      'Full Name': u.name,
      'Email Address': u.email,
      'Role': u.role,
      'Department': u.departmentName || '—',
      'Designation': u.designation || '—',
      'Enrollment / Employee ID': u.enrollmentNo || u.employeeId || '—',
      'Auto-Generated Password': u.password || '—',
      'Account Status': u.status,
      'Created At': u.createdAt
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Credentials');
    XLSX.writeFile(wb, `ssiu_credentials_${Date.now()}.xlsx`);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllCredentials = () => {
    if (!successNotification || successNotification.users.length === 0) return;
    const text = successNotification.users
      .map((u, i) => `${i + 1}. Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Password: ${u.password}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedIndex(99999);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredCredentials = successNotification?.users.filter(u => {
    if (!credentialSearch.trim()) return true;
    const term = credentialSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.id.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-6 p-6">
      {/* ─── CARD HEADER ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/50 text-[#FF6B00] border border-orange-200 dark:border-orange-800/60">
              FIRESTORE PROVISIONING ENGINE
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800/60">
              Soft-Delete Protected
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#FF6B00]" />
            <span>Bulk User ID &amp; Password Generator</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mt-0.5">
            Upload an Excel/CSV spreadsheet or generate batches to create students and staff in Cloud Firestore with auto-generated secure passwords and exportable credential tables.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveMode('FILE_UPLOAD')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === 'FILE_UPLOAD'
                ? 'bg-white dark:bg-slate-900 text-[#FF6B00] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Excel / CSV Upload</span>
          </button>
          <button
            onClick={() => setActiveMode('QUICK_GENERATE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === 'QUICK_GENERATE'
                ? 'bg-white dark:bg-slate-900 text-[#FF6B00] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Batch</span>
          </button>
        </div>
      </div>

      {/* ─── MODE 1: EXCEL / CSV UPLOAD & CLIENT-SIDE PARSER ─────────────────── */}
      {activeMode === 'FILE_UPLOAD' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Upload Student/Staff List (.xlsx, .xls, or .csv)
              </div>
              <div className="text-[11px] text-slate-500">
                File must contain columns for <span className="font-semibold text-slate-700 dark:text-slate-300">Name</span> and <span className="font-semibold text-slate-700 dark:text-slate-300">Email</span> (optional: Role, Department, ID).
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadSampleTemplate('xlsx')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel Template</span>
              </button>
              <button
                onClick={() => downloadSampleTemplate('csv')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>CSV Template</span>
              </button>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 rounded-2xl p-6 text-center bg-white dark:bg-slate-900/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
              id="bulk-user-file-input"
            />
            <label
              htmlFor="bulk-user-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#FF6B00] flex items-center justify-center border border-orange-200 dark:border-orange-800/60 shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#FF6B00] hover:underline">
                  Click to select an Excel or CSV file
                </span>
                <span className="text-xs text-slate-500"> or drag and drop here</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
              </div>
            </label>
          </div>

          {/* Parsed Users Preview & Trigger Action */}
          {parsedUsers.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-300">
                    {parsedUsers.length} Users Ready
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                    File: {fileName}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setParsedUsers([]);
                      setFileName(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>

                  <button
                    onClick={handleProcessParsedFile}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Provisioning to Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Provision {parsedUsers.length} Users into Firestore</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3">Department</th>
                      <th className="py-2 px-3">ID / Enrollment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {parsedUsers.slice(0, 15).map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-1.5 px-3 font-mono text-[11px] text-slate-400">{i + 1}</td>
                        <td className="py-1.5 px-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                        <td className="py-1.5 px-3 font-mono text-[11px]">{u.email}</td>
                        <td className="py-1.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-slate-500">{u.departmentName || '—'}</td>
                        <td className="py-1.5 px-3 font-mono text-[11px] text-slate-500">
                          {u.enrollmentNo || u.employeeId || 'Auto-generated'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedUsers.length > 15 && (
                  <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                    Showing first 15 of {parsedUsers.length} parsed records. All {parsedUsers.length} records will be provisioned.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MODE 2: QUICK BATCH PRESET GENERATOR ───────────────────────────── */}
      {activeMode === 'QUICK_GENERATE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Target Role
              </label>
              <div className="flex rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setRole('student')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    role === 'student'
                      ? 'bg-[#FF6B00] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => setRole('staff')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    role === 'staff'
                      ? 'bg-[#FF6B00] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Staff
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Batch Quantity
              </label>
              <select
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value={1}>1 User</option>
                <option value={5}>5 Users (Standard)</option>
                <option value={10}>10 Users</option>
                <option value={25}>25 Users</option>
                <option value={50}>50 Users (Class Batch)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Department Scope
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Management Studies">Management Studies</option>
                <option value="Pharmacy & Health Sciences">Pharmacy &amp; Health Sciences</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleQuickBulkGenerate}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Provisioning in Firestore...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {quantity} {role === 'student' ? 'Students' : 'Staff'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── ERROR BANNER ──────────────────────────────────────────────────── */}
      {(errorMessage || fileError) && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-3 animate-fadeIn text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div>
            <div className="font-bold">File / Provisioning Notice</div>
            <div>{errorMessage || fileError}</div>
          </div>
        </div>
      )}

      {/* ─── CREDENTIALS DISTRIBUTION DESK & CSV DOWNLOAD SECTION ─────────── */}
      {successNotification && successNotification.show && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-emerald-50/50 to-teal-50/80 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 border border-emerald-300 dark:border-emerald-800/80 space-y-4 animate-fadeIn shadow-lg shadow-emerald-500/5">
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-emerald-200/80 dark:border-emerald-900/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-emerald-950 dark:text-emerald-200">
                    Bulk Provisioning Successful ({successNotification.count} Accounts Created)
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                    Saved in Firestore
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-400/90 mt-0.5">
                  Generated on {successNotification.timestamp}. Download the credentials CSV below to distribute securely to students and staff.
                </p>
              </div>
            </div>

            {/* Action Buttons: CSV Download & Excel */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                onClick={exportCredentialsCsv}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download Credentials CSV</span>
              </button>

              <button
                onClick={exportCredentialsExcel}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 text-emerald-900 dark:text-emerald-200 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download Excel</span>
              </button>

              <button
                onClick={copyAllCredentials}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
              >
                {copiedIndex === 99999 ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied All!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSuccessNotification(null)}
                className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold text-xs transition"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={credentialSearch}
                onChange={e => setCredentialSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => setShowAllPasswords(!showAllPasswords)}
                className="text-emerald-800 dark:text-emerald-300 hover:underline font-bold text-[11px] flex items-center gap-1"
              >
                {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAllPasswords ? 'Mask Passwords' : 'Show All Passwords'}</span>
              </button>
              <span className="text-slate-400 text-[11px]">
                Showing {filteredCredentials.length} of {successNotification.users.length} credentials
              </span>
            </div>
          </div>

          {/* Generated Credentials Temporary Table */}
          <div className="overflow-x-auto rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 shadow-sm max-h-[320px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Unique ID</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Auto-Generated Password</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredCredentials.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition">
                    <td className="py-2 px-3 font-mono font-bold text-[#FF6B00] whitespace-nowrap">{u.id}</td>
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">{u.name}</td>
                    <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">{u.email}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{u.departmentName || '—'}</td>
                    <td className="py-2 px-3 font-mono font-black text-amber-600 dark:text-amber-400 select-all whitespace-nowrap">
                      {showAllPasswords ? u.password : '••••••••••••'}
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => copyToClipboard(`ID: ${u.id}\nEmail: ${u.email}\nPassword: ${u.password}`, idx)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                        title="Copy credentials"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Security Notice Footer */}
          <div className="flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-400/80 bg-emerald-100/50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Security Protocol:</strong> Distribute these credentials via secure university communication channels. Users are prompted to verify and retain their login credentials on first access.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
