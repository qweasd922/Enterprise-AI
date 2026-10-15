import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  getDoc,
} from 'firebase/firestore';

// Initialize Firebase safely
const firebaseConfig =
  typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : {
        apiKey: 'AIzaSyDummyKeyForPreviewModeOnly12345',
        authDomain: 'campusfix-ai.firebaseapp.com',
        projectId: 'campusfix-ai',
        storageBucket: 'campusfix-ai.appspot.com',
        messagingSenderId: '1234567890',
        appId: '1:1234567890:web:abcdef',
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId =
  typeof __app_id !== 'undefined' ? __app_id : 'default-campusfix-app';

const translations = {
  th: {
    feedTab: 'กระดานปัญหา',
    reportTab: 'แจ้งปัญหาใหม่',
    techDashboardTab: 'จัดการงานซ่อม (ช่าง)',
    analyticsTab: 'สรุปสถิติประจำเดือน',
    loginTab: 'เข้าสู่ระบบ / สมัครสมาชิก',
    logout: 'ออกจากระบบ',
    loginTitle: 'เข้าสู่ระบบ CampusFix AI',
    loginSubtitle: 'เลือกบทบาทเพื่อเข้าใช้งานระบบฐานข้อมูล',
    reporterRole: 'ผู้รายงานปัญหา (นักศึกษา/บุคลากร)',
    technicianRole: 'ทีมช่าง / ผู้รับผิดชอบ',
    emailLabel: 'อีเมล',
    passwordLabel: 'รหัสผ่าน',
    loginBtn: 'เข้าสู่ระบบ',
    registerBtn: 'สมัครสมาชิกใหม่',
    switchingToReg: 'ยังไม่มีบัญชี? สมัครสมาชิก',
    switchingToLogin: 'มีบัญชีแล้ว? เข้าสู่ระบบ',
    feedTitle: 'กระดานติดตามปัญหา',
    feedDesc: 'อัปเดตสถานะปัญหาในพื้นที่แบบเรียลไทม์ (บันทึกในฐานข้อมูล)',
    searchPlaceholder: 'ค้นหาปัญหา, หมวดหมู่...',
    urgency: 'ความเร่งด่วน',
    noIssues: 'ไม่พบปัญหาในระบบ',
    tryAgain: 'ลองตรวจสอบการค้นหาหรือสร้างปัญหาใหม่',
    reportTitle: 'แจ้งปัญหาใหม่',
    reportDesc: 'ให้ AI ช่วยวิเคราะห์และส่งปัญหาไปยังผู้รับผิดชอบโดยตรง',
    issueDescLabel: 'อธิบายปัญหาที่คุณพบ',
    issuePlaceholder:
      'เช่น ไฟทางเดินหน้าหอพักหญิง 2 กระพริบและดับไปเลยครับ เสี่ยงอันตรายตอนกลางคืน',
    addPhoto: 'เพิ่มรูปภาพ',
    photoHint: 'รูปภาพช่วยให้ AI วิเคราะห์ได้แม่นยำขึ้น',
    analyzeBtn: 'ให้ AI ช่วยวิเคราะห์ข้อมูล',
    analyzeHint:
      'AI จะช่วยจัดหมวดหมู่ ประเมินความเร่งด่วน และตรวจหาปัญหาที่ซ้ำซ้อนให้โดยอัตโนมัติ',
    analyzing: 'AI กำลังวิเคราะห์ข้อมูล...',
    evaluating: 'ประเมินหมวดหมู่และความเร่งด่วน',
    aiResult: 'ผลการวิเคราะห์จาก CampusFix AI',
    category: 'หมวดหมู่',
    forwardTo: 'ส่งต่อให้หน่วยงาน',
    duplicateFound: 'พบปัญหาที่อาจซ้ำซ้อน',
    alreadyReported: 'มีผู้แจ้งปัญหานี้แล้ว:',
    voteBtn: 'โหวตให้คะแนนปัญหานี้ (+1) แทนการแจ้งใหม่',
    editBtn: 'แก้ไขข้อมูลใหม่',
    submitBtn: 'ยืนยันและส่งแจ้งปัญหา',
    submitting: 'กำลังส่งข้อมูล...',
    langToggle: 'EN',
    locationLabel: 'สถานที่เกิดปัญหา',
    locationPlaceholder: 'ระบุสถานที่ เช่น หน้าหอพักหญิง 2, ห้อง 304...',
    detailTitle: 'รายละเอียดปัญหา',
    close: 'ปิดหน้าต่าง',
    statusHistory: 'ประวัติสถานะและการดำเนินงาน',
    techSectionTitle: 'รายการงานซ่อมสำหรับช่าง',
    techSectionDesc:
      'รายการปัญหาทั้งหมด เรียงตามความเร่งด่วน (สูงไปต่ำ) และยังไม่เสร็จสิ้น',
    resolvedSection: 'ปัญหาที่ดำเนินการแก้ไขเสร็จสิ้นแล้ว',
    resolveActionBtn: 'รายงานผลการซ่อมเสร็จสิ้น',
    resolveModalTitle: 'บันทึกผลการซ่อม',
    resolveReasonLabel: 'บันทึกเหตุผล / วิธีการแก้ไข (Optional)',
    resolveReasonPlaceholder:
      'เช่น เปลี่ยนหลอดไฟ LED ใหม่เรียบร้อยแล้ว ทดสอบใช้งานได้ปกติ',
    resolvePhotoLabel: 'รูปภาพหลังซ่อมเสร็จ',
    confirmResolve: 'ยืนยันการปิดงานซ่อม',
    analyticsTitle: 'รายงานสรุปสถิติประจำเดือน',
    analyticsDesc: 'วิเคราะห์สمطข้อมูลปัญหาแยกตามหมวดหมู่และระดับความเร่งด่วน',
    totalIssuesCount: 'จำนวนปัญหารวมทั้งหมด',
    resolvedCount: 'แก้ไขแล้วเสร็จ',
    pendingCount: 'รอดำเนินการ',
    byCategoryTitle: 'สรุปแยกตามหมวดหมู่ปัญหา',
    byUrgencyTitle: 'สรุปแยกตามระดับความเร่งด่วน',
    urgency_high: 'สูง',
    urgency_medium: 'ปานกลาง',
    urgency_low: 'ต่ำ',
    status_reported: 'รับแจ้งแล้ว',
    status_progress: 'กำลังแก้ไข',
    status_done: 'เสร็จสิ้น',
    cat_electric: 'ระบบไฟฟ้า',
    cat_clean: 'ความสะอาด',
    cat_plumbing: 'ระบบประปา',
    cat_air: 'เครื่องปรับอากาศ',
    cat_it: 'ระบบไอที',
    cat_general: 'ทั่วไป',
    dept_facility: 'ฝ่ายอาคารสถานที่',
    dept_maid: 'ฝ่ายแม่บ้าน',
    dept_maintain: 'ฝ่ายซ่อมบำรุง',
    dept_it: 'ศูนย์คอมพิวเตอร์',
    dept_general: 'ฝ่ายบริหารทั่วไป',
  },
  en: {
    feedTab: 'Issue Feed',
    reportTab: 'Report Issue',
    techDashboardTab: 'Tech Dashboard',
    analyticsTab: 'Monthly Analytics',
    loginTab: 'Login / Register',
    logout: 'Logout',
    loginTitle: 'CampusFix AI Login',
    loginSubtitle: 'Choose your role to access the database system',
    reporterRole: 'Reporter (Student/Staff)',
    technicianRole: 'Technician / Maintenance',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginBtn: 'Sign In',
    registerBtn: 'Create Account',
    switchingToReg: 'No account? Register here',
    switchingToLogin: 'Already have an account? Sign In',
    feedTitle: 'Issue Tracking Board',
    feedDesc: 'Real-time updates on campus issues (Cloud Database Connected)',
    searchPlaceholder: 'Search issues, categories...',
    urgency: 'Urgency',
    noIssues: 'No issues found in database',
    tryAgain: 'Try another search term or report a new issue',
    reportTitle: 'Report New Issue',
    reportDesc:
      'Let AI analyze and route the issue directly to the right department',
    issueDescLabel: 'Describe the issue',
    issuePlaceholder:
      "e.g., The hallway light in front of Women's Dorm 2 is flickering...",
    addPhoto: 'Add Photo',
    photoHint: 'Photos help AI analyze more accurately',
    analyzeBtn: 'Analyze with AI',
    analyzeHint:
      'AI will automatically categorize, evaluate urgency, and find duplicates.',
    analyzing: 'AI is analyzing data...',
    evaluating: 'Evaluating category and urgency',
    aiResult: 'CampusFix AI Analysis Result',
    category: 'Category',
    forwardTo: 'Forward to',
    duplicateFound: 'Potential Duplicate Found',
    alreadyReported: 'Someone has already reported this:',
    voteBtn: 'Upvote this issue (+1) instead of reporting again',
    editBtn: 'Edit Information',
    submitBtn: 'Confirm & Submit',
    submitting: 'Submitting...',
    langToggle: 'TH',
    locationLabel: 'Location details',
    locationPlaceholder: "e.g., In front of Women's Dorm 2, Room 304...",
    detailTitle: 'Issue Details',
    close: 'Close',
    statusHistory: 'Status & Progress History',
    techSectionTitle: 'Technician Maintenance Taskboard',
    techSectionDesc:
      'Sorted by urgency (High to Low) and pending resolution status',
    resolvedSection: 'Resolved Issues Archive',
    resolveActionBtn: 'Submit Repair Report',
    resolveModalTitle: 'Complete Maintenance Work',
    resolveReasonLabel: 'Repair Notes / Reason (Optional)',
    resolveReasonPlaceholder:
      'e.g., Replaced with new LED bulb and verified fully operational.',
    resolvePhotoLabel: 'Photo After Repair',
    confirmResolve: 'Confirm Completion',
    analyticsTitle: 'Monthly Issue Analytics',
    analyticsDesc:
      'Detailed statistics categorized by issue type and urgency level',
    totalIssuesCount: 'Total Issues Reported',
    resolvedCount: 'Resolved',
    pendingCount: 'Pending',
    byCategoryTitle: 'Summary by Category',
    byUrgencyTitle: 'Summary by Urgency Level',
    urgency_high: 'High',
    urgency_medium: 'Medium',
    urgency_low: 'Low',
    status_reported: 'Reported',
    status_progress: 'In Progress',
    status_done: 'Resolved',
    cat_electric: 'Electrical',
    cat_clean: 'Cleaning',
    cat_plumbing: 'Plumbing',
    cat_air: 'Air Conditioning',
    cat_it: 'IT System',
    cat_general: 'General',
    dept_facility: 'Facilities Dept.',
    dept_maid: 'Housekeeping',
    dept_maintain: 'Maintenance Dept.',
    dept_it: 'IT Center',
    dept_general: 'General Admin',
  },
};

const t = (key, lang) => translations[lang][key] || key;

const Icons = {
  Home: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Plus: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Wrench: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  BarChart: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  LogOut: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Camera: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  ),
  CheckCircle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Brain: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  ),
  Search: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  MapPin: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  User: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const Badge = ({ children, type }) => {
  const colors = {
    urgency_high: 'bg-red-100 text-red-800 border-red-200',
    urgency_medium: 'bg-amber-100 text-amber-800 border-amber-200',
    urgency_low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    status_reported: 'bg-blue-100 text-blue-800 border-blue-200',
    status_progress: 'bg-violet-100 text-violet-800 border-violet-200',
    status_done: 'bg-slate-100 text-slate-800 border-slate-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wide border shadow-sm ${
        colors[type] || colors.default
      }`}
    >
      {children}
    </span>
  );
};

export default function CampusFixApp() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('reporter'); // 'reporter' or 'technician'
  const [activeTab, setActiveTab] = useState('feed');
  const [issues, setIssues] = useState([]);
  const [lang, setLang] = useState('th');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolvingIssue, setResolvingIssue] = useState(null);

  // Authentication Setup & Role Check
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== 'undefined' &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error('Auth error:', e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user profile role from Firestore if exists
        const userDocRef = doc(
          db,
          'artifacts',
          appId,
          'users',
          currentUser.uid,
          'profile',
          'info'
        );
        getDoc(userDocRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              setUserRole(docSnap.data().role || 'reporter');
            }
          })
          .catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore Real-time Issue Synchronization
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'issues');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedIssues = [];
        snapshot.forEach((docSnap) => {
          loadedIssues.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (loadedIssues.length === 0) {
          // Seed initial mock issues if empty
          const defaultMock = [
            {
              id: 'CF-1001',
              title_th: 'หลอดไฟทางเดินหน้าตึกวิศวะขาด',
              title_en: 'Hallway light broken at Engineering building',
              desc_th:
                'มืดมาก เสี่ยงต่อความปลอดภัยตอนกลางคืน รบกวนมาซ่อมด้วยครับ',
              desc_en: 'Very dark and unsafe at night. Please fix it.',
              location: 'หน้าตึกวิศวกรรมศาสตร์',
              category: 'cat_electric',
              urgency: 'urgency_high',
              urgencyScore: 3,
              status: 'status_progress',
              department: 'dept_facility',
              date: '2026-10-15 09:30',
              image: null,
              repairNote: '',
              repairImage: null,
            },
            {
              id: 'CF-1002',
              title_th: 'ถังขยะล้นหน้าหอพักหญิง 2',
              title_en: "Trash can overflowing at Women's Dorm 2",
              desc_th: 'ขยะล้นออกมานอกถัง ส่งกลิ่นเหม็นมาก',
              desc_en: 'Trash overflowing and smells very bad.',
              location: 'หอพักหญิง 2 (จุดทิ้งขยะรวม)',
              category: 'cat_clean',
              urgency: 'urgency_medium',
              urgencyScore: 2,
              status: 'status_reported',
              department: 'dept_maid',
              date: '2026-10-15 10:15',
              image: null,
              repairNote: '',
              repairImage: null,
            },
          ];
          defaultMock.forEach(async (item) => {
            try {
              await setDoc(
                doc(
                  db,
                  'artifacts',
                  appId,
                  'public',
                  'data',
                  'issues',
                  item.id
                ),
                item
              );
            } catch (err) {}
          });
        } else {
          setIssues(loadedIssues);
        }
      },
      (error) => {
        console.error('Firestore sync error:', error);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const toggleLang = () => setLang(lang === 'th' ? 'en' : 'th');

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
            <Icons.Brain />
          </div>
          <h2 className="text-2xl font-black text-slate-900">CampusFix AI</h2>
          <p className="text-slate-500 text-sm mt-1">
            กำลังเชื่อมต่อฐานข้อมูลระบบ...
          </p>
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mt-6"></div>
        </div>
      </div>
    );
  }

  // Check if user has authenticated profile credentials saved in database
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 md:pb-0 flex flex-col md:flex-row selection:bg-indigo-100 selection:text-indigo-900">
      {!userProfileExists(user) && false ? (
        <AuthScreen
          user={user}
          setUserRole={setUserRole}
          lang={lang}
          toggleLang={toggleLang}
        />
      ) : (
        <>
          <nav className="bg-indigo-700 text-white shadow-xl md:w-64 lg:w-72 md:flex-shrink-0 md:h-screen md:sticky md:top-0 md:flex md:flex-col z-40 transition-all duration-300">
            <div className="p-4 sm:p-5 flex items-center justify-between md:justify-center md:py-8 border-b border-indigo-600/50">
              <div className="flex items-center gap-2.5">
                <div className="bg-white text-indigo-700 p-2 rounded-xl shadow-sm">
                  <Icons.Brain />
                </div>
                <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight">
                  CampusFix <span className="text-indigo-200">AI</span>
                </h1>
              </div>
              <button
                onClick={toggleLang}
                className="md:hidden bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-bold border border-white/20"
              >
                {t('langToggle', lang)}
              </button>
            </div>

            <div className="hidden md:flex flex-col mt-6 px-4 gap-2 flex-1">
              <div className="px-4 py-2 text-xs font-bold text-indigo-200 uppercase tracking-wider">
                {userRole === 'technician'
                  ? t('technicianRole', lang)
                  : t('reporterRole', lang)}
              </div>

              {userRole === 'reporter' ? (
                <>
                  <button
                    onClick={() => setActiveTab('feed')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      activeTab === 'feed'
                        ? 'bg-indigo-800 text-white font-semibold shadow-inner'
                        : 'text-indigo-100 hover:bg-white/10'
                    }`}
                  >
                    <Icons.Home />{' '}
                    <span className="text-sm">{t('feedTab', lang)}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      activeTab === 'report'
                        ? 'bg-indigo-800 text-white font-semibold shadow-inner'
                        : 'text-indigo-100 hover:bg-white/10'
                    }`}
                  >
                    <Icons.Plus />{' '}
                    <span className="text-sm">{t('reportTab', lang)}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('techDashboard')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      activeTab === 'techDashboard'
                        ? 'bg-indigo-800 text-white font-semibold shadow-inner'
                        : 'text-indigo-100 hover:bg-white/10'
                    }`}
                  >
                    <Icons.Wrench />{' '}
                    <span className="text-sm">
                      {t('techDashboardTab', lang)}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      activeTab === 'analytics'
                        ? 'bg-indigo-800 text-white font-semibold shadow-inner'
                        : 'text-indigo-100 hover:bg-white/10'
                    }`}
                  >
                    <Icons.BarChart />{' '}
                    <span className="text-sm">{t('analyticsTab', lang)}</span>
                  </button>
                </>
              )}

              {/* Role Switcher for Demo Convenience */}
              <button
                onClick={() =>
                  setUserRole(
                    userRole === 'reporter' ? 'technician' : 'reporter'
                  )
                }
                className="mt-4 bg-indigo-800/60 hover:bg-indigo-800 text-indigo-100 px-4 py-2.5 rounded-xl text-xs font-bold border border-indigo-500/40 transition-all flex items-center justify-center gap-2"
              >
                <Icons.User /> สลับมุมมอง:{' '}
                {userRole === 'reporter'
                  ? 'เปลี่ยนเป็นช่าง'
                  : 'เปลี่ยนเป็นผู้รายงาน'}
              </button>
            </div>

            <div className="hidden md:flex flex-col p-4 mt-auto border-t border-indigo-600/50 gap-2">
              <button
                onClick={toggleLang}
                className="w-full flex justify-center items-center gap-2 bg-indigo-800 hover:bg-indigo-900 text-indigo-100 px-4 py-3 rounded-xl text-sm font-bold border border-indigo-600/50"
              >
                <Icons.Search /> Language: {lang.toUpperCase()}
              </button>
              <button
                onClick={() => signOut(auth)}
                className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <Icons.LogOut /> {t('logout', lang)}
              </button>
            </div>
          </nav>

          <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 transition-all duration-300">
            {userRole === 'reporter' ? (
              activeTab === 'feed' ? (
                <IssueFeed
                  issues={issues}
                  lang={lang}
                  onSelectIssue={setSelectedIssue}
                />
              ) : (
                <ReportForm
                  user={user}
                  lang={lang}
                  setActiveTab={setActiveTab}
                />
              )
            ) : activeTab === 'techDashboard' ? (
              <TechDashboard
                issues={issues}
                lang={lang}
                onResolve={(issue) => setResolvingIssue(issue)}
              />
            ) : (
              <MonthlyAnalytics issues={issues} lang={lang} />
            )}
          </main>

          {selectedIssue && (
            <IssueDetailModal
              issue={selectedIssue}
              lang={lang}
              onClose={() => setSelectedIssue(null)}
            />
          )}
          {resolvingIssue && (
            <ResolveModal
              issue={resolvingIssue}
              user={user}
              lang={lang}
              onClose={() => setResolvingIssue(null)}
            />
          )}

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around p-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-50 shadow-lg">
            {userRole === 'reporter' ? (
              <>
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`flex flex-col items-center p-2 w-1/2 ${
                    activeTab === 'feed' ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  <Icons.Home />
                  <span className="text-[10px] mt-1 font-semibold">
                    {t('feedTab', lang)}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('report')}
                  className={`flex flex-col items-center p-2 w-1/2 ${
                    activeTab === 'report'
                      ? 'text-indigo-600'
                      : 'text-slate-400'
                  }`}
                >
                  <div className="bg-indigo-100 p-1 rounded-full">
                    <Icons.Plus />
                  </div>
                  <span className="text-[10px] font-semibold">
                    {t('reportTab', lang)}
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('techDashboard')}
                  className={`flex flex-col items-center p-2 w-1/2 ${
                    activeTab === 'techDashboard'
                      ? 'text-indigo-600'
                      : 'text-slate-400'
                  }`}
                >
                  <Icons.Wrench />
                  <span className="text-[10px] mt-1 font-semibold">
                    {t('techDashboardTab', lang)}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex flex-col items-center p-2 w-1/2 ${
                    activeTab === 'analytics'
                      ? 'text-indigo-600'
                      : 'text-slate-400'
                  }`}
                >
                  <Icons.BarChart />
                  <span className="text-[10px] mt-1 font-semibold">
                    {t('analyticsTab', lang)}
                  </span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function userProfileExists(user) {
  return true; // Simplified for smooth prototype experience
}

function AuthScreen({ user, setUserRole, lang, toggleLang }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleSelection, setRoleSelection] = useState('reporter');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      let cred;
      if (isRegister) {
        cred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        cred = await signInWithEmailAndPassword(auth, email, password);
      }
      // Save profile role in Firestore database
      await setDoc(
        doc(db, 'artifacts', appId, 'users', cred.user.uid, 'profile', 'info'),
        {
          email,
          role: roleSelection,
          createdAt: new Date().toISOString(),
        }
      );
      setUserRole(roleSelection);
    } catch (err) {
      alert('Authentication error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/20 animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl">
              <Icons.Brain />
            </div>
            <h1 className="text-xl font-black text-slate-900">
              CampusFix <span className="text-indigo-600">AI</span>
            </h1>
          </div>
          <button
            onClick={toggleLang}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            {t('langToggle', lang)}
          </button>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-1">
          {t('loginTitle', lang)}
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          {t('loginSubtitle', lang)}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('emailLabel', lang)}
            </label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
              placeholder="user@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('passwordLabel', lang)}
            </label>
            <input
              type="password"
              required
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              เลือกบทบาท (Role)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRoleSelection('reporter')}
                className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                  roleSelection === 'reporter'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👤 {t('reporterRole', lang)}
              </button>
              <button
                type="button"
                onClick={() => setRoleSelection('technician')}
                className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                  roleSelection === 'technician'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🛠️ {t('technicianRole', lang)}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 mt-2"
          >
            {loading
              ? 'กำลังดำเนินการ...'
              : isRegister
              ? t('registerBtn', lang)
              : t('loginBtn', lang)}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            {isRegister
              ? t('switchingToLogin', lang)
              : t('switchingToReg', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

function IssueFeed({ issues, lang, onSelectIssue }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredIssues = issues.filter((issue) => {
    const title = lang === 'th' ? issue.title_th : issue.title_en;
    const cat = t(issue.category, lang);
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('feedTitle', lang)}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1.5">
            {t('feedDesc', lang)}
          </p>
        </div>
        <div className="relative w-full md:w-72 lg:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icons.Search />
          </div>
          <input
            type="text"
            placeholder={t('searchPlaceholder', lang)}
            className="pl-11 w-full rounded-2xl border border-slate-200 shadow-sm focus:border-indigo-500 outline-none bg-white py-3 px-4 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            onClick={() => onSelectIssue(issue)}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-wrap gap-2">
                <Badge type={issue.status}>{t(issue.status, lang)}</Badge>
                <Badge type={issue.urgency}>
                  {t('urgency', lang)}: {t(issue.urgency, lang)}
                </Badge>
              </div>
              <span className="text-[11px] text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-md border">
                {issue.id}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {lang === 'th' ? issue.title_th : issue.title_en}
            </h3>

            <div className="flex items-center gap-1.5 text-slate-500 mb-3 text-sm">
              <div className="text-indigo-400">
                <Icons.MapPin />
              </div>
              <span className="font-medium">{issue.location}</span>
            </div>

            <p className="text-slate-600 text-sm mb-5 line-clamp-2">
              {lang === 'th' ? issue.desc_th : issue.desc_en}
            </p>

            <div className="flex items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4 mt-auto">
              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-50 px-2.5 py-1 rounded-lg border">
                  {t(issue.category, lang)}
                </span>
                <span className="bg-slate-50 px-2.5 py-1 rounded-lg border">
                  {t(issue.department, lang)}
                </span>
              </div>
              <span className="text-slate-400">{issue.date}</span>
            </div>
          </div>
        ))}
        {filteredIssues.length === 0 && (
          <div className="col-span-1 lg:col-span-2 text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-600 font-semibold">
              {t('noIssues', lang)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportForm({ user, lang, setActiveTab }) {
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const analyzeWithAI = () => {
    if (!description || !locationText) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      let category = 'cat_general',
        urgency = 'urgency_low',
        urgencyScore = 1,
        department = 'dept_general',
        duplicate = null,
        title_th = 'แจ้งปัญหาทั่วไป',
        title_en = 'General Issue';
      const descLower = description.toLowerCase();
      if (
        descLower.includes('ไฟ') ||
        descLower.includes('หลอด') ||
        descLower.includes('มืด') ||
        descLower.includes('light')
      ) {
        category = 'cat_electric';
        urgency = 'urgency_high';
        urgencyScore = 3;
        department = 'dept_facility';
        title_th = 'แจ้งซ่อมระบบไฟฟ้า/แสงสว่าง';
        title_en = 'Electrical/Lighting Issue';
      } else if (
        descLower.includes('น้ำ') ||
        descLower.includes('ท่อ') ||
        descLower.includes('รั่ว') ||
        descLower.includes('water')
      ) {
        category = 'cat_plumbing';
        urgency = 'urgency_high';
        urgencyScore = 3;
        department = 'dept_facility';
        title_th = 'แจ้งซ่อมระบบประปา/น้ำรั่ว';
        title_en = 'Plumbing/Water Leak Issue';
      } else if (
        descLower.includes('ขยะ') ||
        descLower.includes('เหม็น') ||
        descLower.includes('trash')
      ) {
        category = 'cat_clean';
        urgency = 'urgency_medium';
        urgencyScore = 2;
        department = 'dept_maid';
        title_th = 'แจ้งปัญหาความสะอาด/จัดการขยะ';
        title_en = 'Cleaning/Trash Issue';
      } else if (
        descLower.includes('แอร์') ||
        descLower.includes('ร้อน') ||
        descLower.includes('air')
      ) {
        category = 'cat_air';
        urgency = 'urgency_medium';
        urgencyScore = 2;
        department = 'dept_maintain';
        title_th = 'แจ้งซ่อมเครื่องปรับอากาศ';
        title_en = 'Air Conditioning Issue';
      }
      setAiResult({
        category,
        urgency,
        urgencyScore,
        department,
        duplicate,
        title_th,
        title_en,
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aiResult) return;
    setIsSubmitting(true);
    try {
      const newIssueId = `CF-${Math.floor(Math.random() * 9000) + 1000}`;
      const issueData = {
        id: newIssueId,
        title_th: aiResult.title_th,
        title_en: aiResult.title_en,
        location: locationText,
        desc_th: description,
        desc_en: description,
        category: aiResult.category,
        urgency: aiResult.urgency,
        urgencyScore: aiResult.urgencyScore,
        department: aiResult.department,
        status: 'status_reported',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        reporterUid: user.uid,
        image: photo || null,
        repairNote: '',
        repairImage: null,
      };
      await setDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'issues', newIssueId),
        issueData
      );
      setIsSubmitting(false);
      setActiveTab('feed');
    } catch (err) {
      alert('Error saving issue: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('reportTitle', lang)}
        </h2>
        <p className="text-sm text-slate-500 mt-1">{t('reportDesc', lang)}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {t('locationLabel', lang)} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
              placeholder={t('locationPlaceholder', lang)}
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {t('issueDescLabel', lang)}{' '}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="4"
              required
              className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 resize-none"
              placeholder={t('issuePlaceholder', lang)}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
            {!photo ? (
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold border"
              >
                <Icons.Camera /> {t('addPhoto', lang)}
              </button>
            ) : (
              <div className="relative inline-block">
                <img
                  src={photo}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-xl border-2 border-indigo-200 shadow"
                />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 sm:p-8 border-t border-indigo-100">
          {!aiResult && !isAnalyzing ? (
            <div className="text-center py-4">
              <button
                type="button"
                onClick={analyzeWithAI}
                disabled={!description || !locationText}
                className={`px-8 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all ${
                  description && locationText
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                <Icons.Brain /> {t('analyzeBtn', lang)}
              </button>
            </div>
          ) : isAnalyzing ? (
            <div className="text-center py-8 font-bold text-indigo-600 animate-pulse">
              {t('analyzing', lang)}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4 text-indigo-800 font-bold bg-indigo-100 px-3 py-1.5 rounded-lg inline-flex text-xs">
                <Icons.Brain /> {t('aiResult', lang)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <div className="bg-white p-3.5 rounded-xl border">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase">
                    {t('category', lang)}
                  </p>
                  <p className="font-bold text-sm">
                    {t(aiResult.category, lang)}
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase">
                    {t('urgency', lang)}
                  </p>
                  <Badge type={aiResult.urgency}>
                    {t(aiResult.urgency, lang)}
                  </Badge>
                </div>
                <div className="bg-white p-3.5 rounded-xl border col-span-2 md:col-span-1">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase">
                    {t('forwardTo', lang)}
                  </p>
                  <p className="font-bold text-sm truncate">
                    {t(aiResult.department, lang)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAiResult(null)}
                  className="px-5 py-3 rounded-xl border font-bold text-slate-600 bg-white"
                >
                  {t('editBtn', lang)}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  {isSubmitting ? t('submitting', lang) : t('submitBtn', lang)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TechDashboard({ issues, lang, onResolve }) {
  // Filter & Sort: Unresolved first, sorted by urgencyScore descending (High urgency first)
  const unresolvedIssues = issues
    .filter((i) => i.status !== 'status_done')
    .sort((a, b) => (b.urgencyScore || 1) - (a.urgencyScore || 1));
  const resolvedIssues = issues.filter((i) => i.status === 'status_done');

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('techSectionTitle', lang)}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {t('techSectionDesc', lang)}
        </p>
      </div>

      {/* Unresolved Taskboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {unresolvedIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                  <Badge type={issue.status}>{t(issue.status, lang)}</Badge>
                  <Badge type={issue.urgency}>
                    {t('urgency', lang)}: {t(issue.urgency, lang)}
                  </Badge>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                  {issue.id}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {lang === 'th' ? issue.title_th : issue.title_en}
              </h3>
              <p className="text-xs font-semibold text-indigo-600 mb-2 flex items-center gap-1">
                <Icons.MapPin /> {issue.location}
              </p>
              <p className="text-slate-600 text-sm mb-4">
                {lang === 'th' ? issue.desc_th : issue.desc_en}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">{issue.date}</span>
              <button
                onClick={() => onResolve(issue)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Icons.CheckCircle /> {t('resolveActionBtn', lang)}
              </button>
            </div>
          </div>
        ))}
        {unresolvedIssues.length === 0 && (
          <div className="col-span-1 lg:col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 font-semibold">
              ยอดเยี่ยม! ไม่มีค้างงานซ่อมในระบบ
            </p>
          </div>
        )}
      </div>

      {/* Resolved Archive Section */}
      {resolvedIssues.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            {t('resolvedSection', lang)}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {resolvedIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-slate-50 rounded-3xl border border-slate-200 p-6 opacity-90"
              >
                <div className="flex justify-between items-start mb-3">
                  <Badge type={issue.status}>{t(issue.status, lang)}</Badge>
                  <span className="text-xs font-mono text-slate-400">
                    {issue.id}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">
                  {lang === 'th' ? issue.title_th : issue.title_en}
                </h4>
                <p className="text-xs text-slate-500 mb-3">{issue.location}</p>
                {issue.repairNote && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 mt-2">
                    <strong>บันทึกช่าง:</strong> {issue.repairNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResolveModal({ issue, user, lang, onClose }) {
  const [repairNote, setRepairNote] = useState('');
  const [repairPhoto, setRepairPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) setRepairPhoto(URL.createObjectURL(file));
  };

  const handleConfirmResolve = async () => {
    setSubmitting(true);
    try {
      const issueRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'issues',
        issue.id
      );
      await updateDoc(issueRef, {
        status: 'status_done',
        repairNote: repairNote || 'ดำเนินการแก้ไขเรียบร้อย',
        repairImage: repairPhoto || null,
        resolvedAt: new Date().toISOString(),
      });
      setSubmitting(false);
      onClose();
    } catch (err) {
      alert('Error updating issue: ' + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-900">
            {t('resolveModalTitle', lang)} ({issue.id})
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 font-bold text-lg"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              {t('resolveReasonLabel', lang)}
            </label>
            <textarea
              rows="3"
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 resize-none"
              placeholder={t('resolveReasonPlaceholder', lang)}
              value={repairNote}
              onChange={(e) => setRepairNote(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              {t('resolvePhotoLabel', lang)}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhoto}
              accept="image/*"
              className="hidden"
            />
            {!repairPhoto ? (
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold border"
              >
                <Icons.Camera /> แนบรูปภาพหลักฐานหลังซ่อม
              </button>
            ) : (
              <div className="relative inline-block">
                <img
                  src={repairPhoto}
                  alt="Repair"
                  className="w-20 h-20 object-cover rounded-xl border shadow"
                />
                <button
                  type="button"
                  onClick={() => setRepairPhoto(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirmResolve}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
          >
            {submitting ? 'กำลังบันทึก...' : t('confirmResolve', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

function MonthlyAnalytics({ issues, lang }) {
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === 'status_done').length;
  const pending = total - resolved;

  // Aggregate by Category
  const byCategory = issues.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  // Aggregate by Urgency
  const byUrgency = issues.reduce((acc, curr) => {
    acc[curr.urgency] = (acc[curr.urgency] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('analyticsTitle', lang)}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {t('analyticsDesc', lang)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {t('totalIssuesCount', lang)}
          </p>
          <p className="text-3xl font-black text-slate-900 mt-2">{total}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            {t('resolvedCount', lang)}
          </p>
          <p className="text-3xl font-black text-emerald-700 mt-2">
            {resolved}
          </p>
        </div>
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            {t('pendingCount', lang)}
          </p>
          <p className="text-3xl font-black text-amber-700 mt-2">{pending}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">
            {t('byCategoryTitle', lang)}
          </h3>
          <div className="space-y-3">
            {Object.keys(byCategory).map((catKey) => (
              <div
                key={catKey}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl"
              >
                <span className="text-sm font-semibold text-slate-700">
                  {t(catKey, lang)}
                </span>
                <span className="bg-indigo-100 text-indigo-800 font-bold text-xs px-3 py-1 rounded-full">
                  {byCategory[catKey]} รายการ
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">
            {t('byUrgencyTitle', lang)}
          </h3>
          <div className="space-y-3">
            {Object.keys(byUrgency).map((urgKey) => (
              <div
                key={urgKey}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl"
              >
                <Badge type={urgKey}>{t(urgKey, lang)}</Badge>
                <span className="font-bold text-sm text-slate-800">
                  {byUrgency[urgKey]} รายการ
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IssueDetailModal({ issue, lang, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-mono px-2 py-0.5 rounded font-bold">
              {issue.id}
            </span>
            <h3 className="font-bold text-slate-900">
              {t('detailTitle', lang)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 font-bold text-lg"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex gap-2">
            <Badge type={issue.status}>{t(issue.status, lang)}</Badge>
            <Badge type={issue.urgency}>
              {t('urgency', lang)}: {t(issue.urgency, lang)}
            </Badge>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {lang === 'th' ? issue.title_th : issue.title_en}
          </h2>
          <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
            <Icons.MapPin /> {issue.location}
          </p>
          <p className="text-slate-600 text-sm bg-slate-50 p-4 rounded-2xl border">
            {lang === 'th' ? issue.desc_th : issue.desc_en}
          </p>

          {issue.image && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                รูปถ่ายปัญหา
              </p>
              <img
                src={issue.image}
                alt="Evidence"
                className="w-full h-48 object-cover rounded-xl border"
              />
            </div>
          )}

          {issue.repairNote && (
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <p className="text-xs font-bold text-emerald-700 uppercase mb-1">
                ผลการซ่อมจากช่าง
              </p>
              <p className="text-sm text-emerald-900">{issue.repairNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
