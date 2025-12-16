// =================================================================
// 5. APP LOGIC & RENDER (FULL UPDATED: SCIENTIFIC DARK GREEN THEME)
// =================================================================
function App() {
  // !! ទាញអថេរ និង Functions ពី Global Scope
  const {
    getTodayLocalDateString,
    getTodayLocalMonthString,
    calculateDuration,
    firebaseConfigRead,
    firebaseConfigWrite,
    translations,
    // backgroundStyles, // យើងនឹងប្រើ Custom Green Background ជំនួសវិញ
    passManagementPath,
    appBranch,
    IconSearch,
    IconClock,
    IconCheckCircle,
    IconQrCode,
    IconSettings,
    IconClose,
    IconTrash,
  } = window.appSetup;

  // !! ទាញ Components ពី Global Scope
  const {
    StudentCard,
    OnBreakStudentListCard,
    CompletedStudentListCard,
    CompletedListHeader,
    LoadingSpinner,
    DeleteConfirmationModal,
    PasswordConfirmationModal,
    AdminActionModal,
    QrScannerModal,
    InfoAlertModal,
    InputPromptModal,
    PaginationControls,
    DesktopSidebar,
  } = window;

  const { SettingsPage } = window;

  // --- States ---
  const [dbRead, setDbRead] = useState(null);
  const [dbWrite, setDbWrite] = useState(null);
  const [userId, setUserId] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  // State សម្រាប់ Keyboard Navigation
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [currentPage, setCurrentPage] = useState("search");
  const [authError, setAuthError] = useState(null);
  const [modalStudent, setModalStudent] = useState(null);
  const [now, setNow] = useState(new Date());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState({ isOpen: false });
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(null);
  const [bulkDeleteDate, setBulkDeleteDate] = useState(
    getTodayLocalDateString()
  );
  const [bulkDeleteMonth, setBulkDeleteMonth] = useState(
    getTodayLocalMonthString()
  );
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [totalPasses, setTotalPasses] = useState(0);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isScannerBusy, setIsScannerBusy] = useState(false);
  const [lastScannedInfo, setLastScannedInfo] = useState(null);
  const [scannerTriggeredCheckIn, setScannerTriggeredCheckIn] = useState(null);
  const [infoAlert, setInfoAlert] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });
  const [inputPrompt, setInputPrompt] = useState({ isOpen: false });
  const [language, setLanguage] = useState(
    localStorage.getItem("break_lang") || "km"
  );

  // Custom Green Background State (Ignore old styles)
  const [background, setBackground] = useState("green-scientific");

  const [adminPassword, setAdminPassword] = useState(null);
  const [checkInMode, setCheckInMode] = useState("scan");

  const [autoCheckOut, setAutoCheckOut] = useState(false);

  const [overtimeLimit, setOvertimeLimit] = useState(15);
  const [completedPage, setCompletedPage] = useState(0);
  const [passPrefix, setPassPrefix] = useState(null);
  const [passStartNumber, setPassStartNumber] = useState(null);

  // --- Refs ---
  const t = translations[language] || translations["km"];
  const tRef = React.useRef(t);
  const attendanceRef = React.useRef(attendance);
  const touchStartXRef = React.useRef(null);

  // Ref សម្រាប់ Input ស្វែងរក (Auto Focus)
  const searchInputRef = React.useRef(null);

  // Ref សម្រាប់ Scroll
  const searchResultRefs = React.useRef([]);

  // !! Firebase Functions
  const {
    runTransaction,
    get,
    update,
    ref,
    push,
    remove,
    onValue,
    orderByChild,
    equalTo,
    set,
  } = window.firebase;

  // --- TTS ---
  const speak = React.useCallback((text) => {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "km-KH";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis Error:", e);
    }
  }, []);

  // --- Effects ---
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("break_lang", language);
    tRef.current = translations[language] || translations["km"];
  }, [language, translations]);

  useEffect(() => {
    attendanceRef.current = attendance;
  }, [attendance]);

  // Auto Focus ពេលចូលមកទំព័រ Search
  useEffect(() => {
    if (currentPage === "search") {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  }, [currentPage]);

  // Scroll ទៅរកឈ្មោះដែលបាន Select (Arrow Down)
  useEffect(() => {
    if (selectedIndex !== -1 && searchResultRefs.current[selectedIndex]) {
      searchResultRefs.current[selectedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  // Reset Refs when search results change
  useEffect(() => {
    searchResultRefs.current = searchResultRefs.current.slice(
      0,
      searchResults.length
    );
  }, [searchResults]);

  // Firebase Init
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const { initializeApp, getAuth, signInAnonymously, getDatabase } =
          window.firebase;
        const readApp = initializeApp(firebaseConfigRead, "readApp");
        const authInstanceRead = getAuth(readApp);
        const dbInstanceRead = getDatabase(readApp);

        const writeApp = initializeApp(firebaseConfigWrite, "writeApp");
        const authInstanceWrite = getAuth(writeApp);
        const dbInstanceWrite = getDatabase(writeApp);

        try {
          await signInAnonymously(authInstanceRead);
          setDbRead(dbInstanceRead);
        } catch (error) {
          setAuthError(`Read Auth Error: ${error.message}`);
        }

        onAuthStateChanged(authInstanceWrite, async (user) => {
          if (user) {
            setUserId(user.uid);
            setDbWrite(dbInstanceWrite);
          } else {
            await signInAnonymously(authInstanceWrite);
          }
        });
      } catch (error) {
        setAuthError(`Firebase Init Error: ${error.message}`);
      }
    };
    initFirebase();
  }, [firebaseConfigRead, firebaseConfigWrite]);

  // Data Fetching
  useEffect(() => {
    if (dbRead && dbWrite) {
      const studentsRef = ref(dbRead, "students");
      const unsubscribeStudents = onValue(studentsRef, (snapshot) => {
        const studentsData = snapshot.val();
        const studentList = [];
        if (studentsData) {
          Object.keys(studentsData).forEach((key) => {
            const student = studentsData[key];
            studentList.push({
              id: key,
              ...student,
              name: student.name || student.ឈ្មោះ,
              idNumber: student.idNumber || student.អត្តលេខ,
              photoUrl: student.photoUrl || student.រូបថត,
              class: student.class || student.ថា្នក់,
            });
          });
        }
        studentList.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setStudents(studentList);
        setLoading(false);
      });

      const settingRef = ref(dbWrite, "passManagement");
      const branchSettingsRef = ref(dbWrite, passManagementPath);

      const unsubSettings = onValue(settingRef, (snapshot) => {
        const settings = snapshot.val() || {};
        setAdminPassword(settings.adminPassword || "4545ak0");
        setCheckInMode(settings.checkInMode || "scan");
        setOvertimeLimit(parseInt(settings.overtimeLimit) || 15);
        setAutoCheckOut(settings.autoCheckOut || false);
      });

      let unsubAttendance = () => {};

      const unsubBranchSettings = onValue(branchSettingsRef, (snapshot) => {
        const branchSettings = snapshot.val() || {};
        setTotalPasses(branchSettings.totalPasses || 0);
        setPassPrefix(branchSettings.passPrefix || "DD_");
        setPassStartNumber(branchSettings.passStartNumber || 1);

        unsubAttendance();

        const attendanceRefDb = ref(dbWrite, "attendance");
        const { query: rtdbQuery, orderByChild, equalTo } = window.firebase;
        const attendanceQuery = rtdbQuery(
          attendanceRefDb,
          orderByChild("date"),
          equalTo(window.appSetup.todayString)
        );

        unsubAttendance = onValue(attendanceQuery, (attSnapshot) => {
          const attMap = {};
          const attData = attSnapshot.val();
          if (attData) {
            Object.keys(attData).forEach((key) => {
              const data = attData[key];
              if (data.branch === appBranch) {
                if (!attMap[data.studentId]) {
                  attMap[data.studentId] = [];
                }
                attMap[data.studentId].push({ id: key, ...data });
              }
            });
          }
          for (const studentId in attMap) {
            attMap[studentId].sort(
              (a, b) => new Date(a.checkOutTime) - new Date(b.checkOutTime)
            );
          }
          setAttendance(attMap);
        });
      });

      return () => {
        unsubscribeStudents();
        unsubSettings();
        unsubBranchSettings();
        unsubAttendance();
      };
    }
  }, [dbRead, dbWrite, appBranch, passManagementPath]);

  // --- Logic & Memoization ---

  const sortedStudentsOnBreak = React.useMemo(() => {
    if (passPrefix === null) return [];
    return students
      .map((student) => {
        const breaks = attendance[student.id] || [];
        const activeBreak = breaks.find(
          (r) => r.checkOutTime && !r.checkInTime
        );
        if (!activeBreak) return null;
        const elapsedMins = calculateDuration(
          activeBreak.checkOutTime,
          now.toISOString()
        );
        const isOvertime = elapsedMins > overtimeLimit;
        return { student, record: activeBreak, elapsedMins, isOvertime };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const getPassNum = (passStr) => {
          if (!passStr) return 0;
          const numPart = passStr.replace(passPrefix, "");
          return parseInt(numPart) || 0;
        };
        return (
          getPassNum(b.record.passNumber) - getPassNum(a.record.passNumber)
        );
      });
  }, [students, attendance, now, calculateDuration, overtimeLimit, passPrefix]);

  const recentActiveBreaks = React.useMemo(() => {
    const sortedByTime = [...sortedStudentsOnBreak].sort((a, b) => {
      return new Date(b.record.checkOutTime) - new Date(a.record.checkOutTime);
    });
    return sortedByTime.slice(0, 6);
  }, [sortedStudentsOnBreak]);

  const allCompletedBreaks = React.useMemo(() => {
    const breaks = [];
    students.forEach((student) => {
      const studentBreaks = attendance[student.id] || [];
      studentBreaks.forEach((record) => {
        if (record.checkInTime && record.checkOutTime) {
          breaks.push({ student, record });
        }
      });
    });
    breaks.sort(
      (a, b) => new Date(b.record.checkInTime) - new Date(a.record.checkInTime)
    );
    return breaks;
  }, [students, attendance]);

  const filteredCompletedBreaks = React.useMemo(() => {
    return allCompletedBreaks;
  }, [allCompletedBreaks]);

  const CARDS_PER_PAGE = 12;
  const totalCompletedPages = Math.ceil(
    filteredCompletedBreaks.length / CARDS_PER_PAGE
  );
  const paginatedCompletedBreaks = React.useMemo(() => {
    return filteredCompletedBreaks.slice(
      completedPage * CARDS_PER_PAGE,
      (completedPage + 1) * CARDS_PER_PAGE
    );
  }, [filteredCompletedBreaks, completedPage]);

  const selectedStudent = React.useMemo(
    () => students.find((s) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  const studentsOnBreakCount = sortedStudentsOnBreak.length;

  const searchResults = React.useMemo(() => {
    const normalizedSearch = String(searchTerm)
      .replace(/\s+/g, "")
      .toLowerCase();
    if (normalizedSearch === "" || !isSearchFocused) return [];

    const currentAttendance = attendance;
    const currentT = t;

    const matches = students
      .filter(
        (student) =>
          (student.name &&
            student.name
              .replace(/\s+/g, "")
              .toLowerCase()
              .includes(normalizedSearch)) ||
          (student.idNumber &&
            String(student.idNumber)
              .replace(/\s+/g, "")
              .includes(normalizedSearch))
      )
      .slice(0, 10);

    return matches.map((student) => {
      const studentBreaks = currentAttendance[student.id] || [];
      const activeBreak = studentBreaks.find(
        (r) => r.checkOutTime && !r.checkInTime
      );
      const completedBreaks = studentBreaks.filter(
        (r) => r.checkOutTime && r.checkInTime
      );

      let statusText = currentT.statusNotYet;
      let passNumber = null;
      let statusColor = "text-gray-500";

      if (activeBreak) {
        statusText = currentT.statusOnBreak;
        passNumber = activeBreak.passNumber || null;
        statusColor = "text-yellow-600";
      } else if (completedBreaks.length > 0) {
        statusText = currentT.statusCompleted;
        statusColor = "text-emerald-600"; // Green for completed
      }
      return { ...student, statusText, passNumber, statusColor };
    });
  }, [searchTerm, students, attendance, t, isSearchFocused]);

  // --- Handlers ---

  const showAlert = React.useCallback((message, type = "info") => {
    setInfoAlert({ isOpen: true, message, type });
  }, []);

  // --- Check-Out Logic ---
  const handleCheckOut = React.useCallback(
    async (studentId) => {
      const student = students.find((s) => s.id === studentId);
      if (
        !student ||
        !dbWrite ||
        passPrefix === null ||
        passStartNumber === null
      ) {
        setAuthError("កំពុងទាញការកំណត់...");
        return;
      }

      const attendanceRefDb = ref(dbWrite, "attendance");
      let assignedPassNumber = null;

      try {
        const { committed, snapshot } = await runTransaction(
          attendanceRefDb,
          (currentAttendanceData) => {
            const attData = currentAttendanceData || {};
            const allBreaks = Object.values(attData);

            const usedPassNumbers = allBreaks
              .filter(
                (r) =>
                  r.date === window.appSetup.todayString &&
                  r.checkOutTime &&
                  !r.checkInTime &&
                  r.branch === appBranch
              )
              .map((r) => r.passNumber);

            if (usedPassNumbers.length >= totalPasses) return;

            let nextPassNumber = null;
            const loopStart = passStartNumber;
            const loopEnd = loopStart + totalPasses;

            for (let i = loopStart; i < loopEnd; i++) {
              const passNum = passPrefix + String(i).padStart(2, "0");
              if (!usedPassNumbers.includes(passNum)) {
                nextPassNumber = passNum;
                break;
              }
            }

            if (!nextPassNumber) return;
            assignedPassNumber = nextPassNumber;

            const studentBreaks = allBreaks.filter(
              (r) => r.studentId === studentId
            );
            const completedBreaks = studentBreaks.filter(
              (r) => r.checkInTime && r.checkOutTime
            );
            const newBreakType =
              completedBreaks.length >= 2 ? "special" : "normal";

            const newRecord = {
              studentId: studentId,
              studentName: student.name || null,
              studentPhotoUrl: student.photoUrl || null,
              date: window.appSetup.todayString,
              checkInTime: null,
              checkOutTime: new Date().toISOString(),
              breakType: newBreakType,
              passNumber: assignedPassNumber,
              branch: appBranch,
            };

            const newKey = push(attendanceRefDb).key;
            attData[newKey] = newRecord;
            return attData;
          }
        );

        if (committed && assignedPassNumber) {
          speak(
            `${student.name || "No Name"} ${tRef.current.statusOnBreak} ${
              tRef.current.statusPass
            } ${assignedPassNumber}`
          );

          // Instant Disappear & Focus Back
          setSearchTerm("");
          setSelectedStudentId("");
          setIsSearchFocused(true); // រក្សា Focus
          setSelectedIndex(-1);

          // Focus Back Input
          setTimeout(() => {
            if (searchInputRef.current) searchInputRef.current.focus();
          }, 50);
        } else {
          setAuthError(tRef.current.statusPassOut);
          speak(tRef.current.statusPassOut);
        }
      } catch (error) {
        console.error("Transaction Error:", error);
        setAuthError(error.message);
      }
    },
    [
      dbWrite,
      students,
      totalPasses,
      speak,
      ref,
      push,
      runTransaction,
      tRef,
      passPrefix,
      passStartNumber,
      appBranch,
    ]
  );

  const handleCheckIn = React.useCallback(
    async (studentId) => {
      const student = students.find((s) => s.id === studentId);
      if (!student || !dbWrite) return;

      const studentBreaks = attendanceRef.current[student.id] || [];
      const activeBreak = studentBreaks.find(
        (r) => r.checkOutTime && !r.checkInTime
      );

      if (!activeBreak) return;

      speak(`${student.name || "No Name"} ${tRef.current.checkIn}`);
      const docRef = ref(dbWrite, `attendance/${activeBreak.id}`);

      try {
        await update(docRef, { checkInTime: new Date().toISOString() });
        // Restore Focus
        setTimeout(() => {
          setSearchTerm("");
          setSelectedStudentId("");
          setIsSearchFocused(true);
          if (searchInputRef.current) searchInputRef.current.focus();
        }, 100);
      } catch (error) {
        setAuthError(error.message);
      }
    },
    [dbWrite, students, speak, ref, update]
  );

  // --- Helpers ---

  // Function ជ្រើសរើសសិស្ស + Auto Focus Logic
  const handleSelectStudentFromList = React.useCallback(
    (student) => {
      const studentBreaks = attendance[student.id] || [];
      const isActive = studentBreaks.some(
        (r) => r.checkOutTime && !r.checkInTime
      );

      if (!isActive) {
        handleCheckOut(student.id);
      } else {
        setSearchTerm("");
        setSelectedStudentId(student.id);
        setIsSearchFocused(true);

        setTimeout(() => {
          if (searchInputRef.current) searchInputRef.current.focus();
        }, 50);
      }
    },
    [attendance, handleCheckOut]
  );

  // Keyboard Navigation
  const handleSearchKeyDown = React.useCallback(
    (e) => {
      if (searchResults.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter") {
        e.preventDefault();

        const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
        const targetStudent = searchResults[targetIndex];

        if (targetStudent) {
          handleSelectStudentFromList(targetStudent);
        }
      }
    },
    [searchResults, selectedIndex, attendance, handleSelectStudentFromList]
  );

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchTerm]);

  // --- Admin/Delete Handlers ---
  const handleOpenPasswordModal = React.useCallback(
    (message, onConfirmCallback) => {
      setPasswordPrompt({
        isOpen: true,
        message,
        onConfirm: onConfirmCallback,
        error: null,
      });
    },
    []
  );

  const handleOpenDeleteModal_Simple = React.useCallback(
    (e, student, record) => {
      e.stopPropagation();
      setRecordToDelete({ student, record });
    },
    []
  );

  const handlePasswordSubmit = React.useCallback(
    (password) => {
      if (!adminPassword) return;
      if (password === adminPassword) {
        passwordPrompt.onConfirm();
        setPasswordPrompt({ isOpen: false });
      } else {
        setPasswordPrompt((prev) => ({
          ...prev,
          error: tRef.current.passwordError,
        }));
      }
    },
    [adminPassword, passwordPrompt]
  );

  const handleConfirmDelete_Single = React.useCallback(
    async (recordId) => {
      if (!dbWrite) return;
      try {
        await remove(ref(dbWrite, `attendance/${recordId}`));
      } catch (error) {
        setAuthError(error.message);
      }
    },
    [dbWrite, ref, remove]
  );

  const handleToggleSelectionMode = React.useCallback(() => {
    setIsSelectionMode((prev) => !prev);
    setSelectedRecords([]);
    setShowAdminModal(false);
  }, []);

  const handleRecordSelect = React.useCallback((recordId) => {
    setSelectedRecords((prev) =>
      prev.includes(recordId)
        ? prev.filter((id) => id !== recordId)
        : [...prev, recordId]
    );
  }, []);

  const handleOpenDeleteSelected = React.useCallback(() => {
    if (selectedRecords.length === 0) return;
    handleOpenPasswordModal(
      tRef.current.deleteSelectedTitle(selectedRecords.length),
      () => handleConfirmDelete_Multi()
    );
  }, [selectedRecords, tRef, handleOpenPasswordModal]);

  const handleConfirmDelete_Multi = React.useCallback(async () => {
    if (!dbWrite) return;
    setIsBulkLoading(true);
    const updates = {};
    selectedRecords.forEach((recordId) => {
      updates[`attendance/${recordId}`] = null;
    });
    try {
      await update(ref(dbWrite), updates);
      showAlert(tRef.current.deleteSuccess(selectedRecords.length), "success");
      handleToggleSelectionMode();
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsBulkLoading(false);
    }
  }, [
    dbWrite,
    selectedRecords,
    ref,
    update,
    handleToggleSelectionMode,
    showAlert,
    tRef,
  ]);

  const handleOpenBulkDelete = React.useCallback(
    (mode) => {
      setBulkDeleteMode(mode);
      setShowAdminModal(false);
      setTimeout(() => {
        handleOpenPasswordModal(
          mode === "day"
            ? tRef.current.deleteByDateTitle(bulkDeleteDate)
            : tRef.current.deleteByMonthTitle(bulkDeleteMonth),
          () => handleConfirmBulkDelete(mode)
        );
      }, 100);
    },
    [bulkDeleteDate, bulkDeleteMonth, tRef, handleOpenPasswordModal]
  );

  const handleConfirmBulkDelete = React.useCallback(
    async (mode) => {
      if (!dbWrite) return;
      setIsBulkLoading(true);
      try {
        const allDataSnapshot = await get(ref(dbWrite, "attendance"));
        if (!allDataSnapshot.exists()) {
          showAlert(tRef.current.deleteNotFound, "error");
          setIsBulkLoading(false);
          return;
        }
        const allData = allDataSnapshot.val();
        const updates = {};
        let count = 0;
        const filterDate = mode === "day" ? bulkDeleteDate : bulkDeleteMonth;

        Object.keys(allData).forEach((recordId) => {
          const record = allData[recordId];
          if (record && record.date) {
            if (
              (mode === "day" && record.date === filterDate) ||
              (mode === "month" && record.date.startsWith(filterDate))
            ) {
              updates[`attendance/${recordId}`] = null;
              count++;
            }
          }
        });

        if (count > 0) {
          await update(ref(dbWrite), updates);
          showAlert(tRef.current.deleteSuccess(count), "success");
        } else {
          showAlert(tRef.current.deleteNotFound, "error");
        }
      } catch (error) {
        setAuthError(error.message);
      } finally {
        setIsBulkLoading(false);
        setBulkDeleteMode(null);
      }
    },
    [
      dbWrite,
      bulkDeleteDate,
      bulkDeleteMonth,
      tRef,
      showAlert,
      ref,
      get,
      update,
    ]
  );

  // --- Settings Handlers ---

  const handleEditAutoCheckOut = React.useCallback(() => {
    handleOpenPasswordModal(tRef.current.autoCheckOutPrompt, () => {
      set(ref(dbWrite, "passManagement/autoCheckOut"), !autoCheckOut).then(() =>
        showAlert(tRef.current.autoCheckOutSuccess, "success")
      );
    });
  }, [
    handleOpenPasswordModal,
    tRef,
    autoCheckOut,
    dbWrite,
    ref,
    set,
    showAlert,
  ]);

  const handleEditTotalPasses = React.useCallback(() => {
    handleOpenPasswordModal(tRef.current.passwordRequired, () => {
      setInputPrompt({
        isOpen: true,
        title: tRef.current.editPassTotal,
        message: tRef.current.editPassTotalPrompt,
        defaultValue: totalPasses,
        type: "number",
        onSubmit: (val) => {
          if (val && !isNaN(parseInt(val))) {
            set(
              ref(dbWrite, `${passManagementPath}/totalPasses`),
              parseInt(val)
            );
            showAlert(tRef.current.passTotalSuccess, "success");
          }
          setInputPrompt({ isOpen: false });
        },
        onCancel: () => setInputPrompt({ isOpen: false }),
      });
    });
  }, [
    handleOpenPasswordModal,
    tRef,
    totalPasses,
    dbWrite,
    ref,
    set,
    showAlert,
    passManagementPath,
  ]);

  const handleEditOvertimeLimit = React.useCallback(() => {
    handleOpenPasswordModal(tRef.current.passwordRequired, () => {
      setInputPrompt({
        isOpen: true,
        title: tRef.current.overtimeLimit,
        message: tRef.current.overtimeLimitPrompt,
        defaultValue: overtimeLimit,
        type: "number",
        onSubmit: (val) => {
          if (val && !isNaN(parseInt(val))) {
            set(ref(dbWrite, "passManagement/overtimeLimit"), parseInt(val));
            showAlert(tRef.current.overtimeLimitSuccess, "success");
          }
          setInputPrompt({ isOpen: false });
        },
        onCancel: () => setInputPrompt({ isOpen: false }),
      });
    });
  }, [
    handleOpenPasswordModal,
    tRef,
    overtimeLimit,
    dbWrite,
    ref,
    set,
    showAlert,
  ]);

  const handleEditPassPrefix = React.useCallback(() => {
    handleOpenPasswordModal(tRef.current.passwordRequired, () => {
      setInputPrompt({
        isOpen: true,
        title: tRef.current.editPassPrefix,
        message: tRef.current.passPrefixPrompt,
        defaultValue: passPrefix,
        type: "text",
        onSubmit: (val) => {
          if (val && val.trim().length > 0) {
            set(ref(dbWrite, `${passManagementPath}/passPrefix`), val.trim());
            showAlert(tRef.current.passPrefixSuccess, "success");
          }
          setInputPrompt({ isOpen: false });
        },
        onCancel: () => setInputPrompt({ isOpen: false }),
      });
    });
  }, [
    handleOpenPasswordModal,
    tRef,
    passPrefix,
    dbWrite,
    ref,
    set,
    showAlert,
    passManagementPath,
  ]);

  const handleEditPassStartNumber = React.useCallback(() => {
    handleOpenPasswordModal(tRef.current.passwordRequired, () => {
      setInputPrompt({
        isOpen: true,
        title: tRef.current.editPassStartNumber,
        message: tRef.current.passStartNumberPrompt,
        defaultValue: passStartNumber,
        type: "number",
        onSubmit: (val) => {
          if (val && !isNaN(parseInt(val))) {
            set(
              ref(dbWrite, `${passManagementPath}/passStartNumber`),
              parseInt(val)
            );
            showAlert(tRef.current.passStartNumberSuccess, "success");
          }
          setInputPrompt({ isOpen: false });
        },
        onCancel: () => setInputPrompt({ isOpen: false }),
      });
    });
  }, [
    handleOpenPasswordModal,
    tRef,
    passStartNumber,
    dbWrite,
    ref,
    set,
    showAlert,
    passManagementPath,
  ]);

  const handleEditPassword = React.useCallback(() => {
    handleOpenPasswordModal(tRef.current.passwordRequired, () => {
      setInputPrompt({
        isOpen: true,
        title: tRef.current.changePassword,
        message: tRef.current.changePasswordPrompt,
        defaultValue: "",
        type: "text",
        onSubmit: (val) => {
          if (val && val.length >= 6) {
            set(ref(dbWrite, "passManagement/adminPassword"), val);
            showAlert(tRef.current.changePasswordSuccess, "success");
          } else {
            showAlert("Password ត្រូវមានយ៉ាងតិច 6 តួអក្សរ", "error");
          }
          setInputPrompt({ isOpen: false });
        },
        onCancel: () => setInputPrompt({ isOpen: false }),
      });
    });
  }, [handleOpenPasswordModal, tRef, dbWrite, ref, set, showAlert]);

  const handleEditCheckInMode = React.useCallback(() => {
    handleOpenPasswordModal(tRef.current.checkInMethodPrompt, () => {
      const newMode = checkInMode === "scan" ? "auto" : "scan";
      set(ref(dbWrite, "passManagement/checkInMode"), newMode).then(() =>
        showAlert(tRef.current.checkInModeSuccess, "success")
      );
    });
  }, [
    handleOpenPasswordModal,
    tRef,
    checkInMode,
    dbWrite,
    ref,
    set,
    showAlert,
  ]);

  const handleCheckInByPassNumber = React.useCallback(
    (passNumber) => {
      if (!passNumber || isScannerBusy) return;
      const activeBreakData = sortedStudentsOnBreak.find(
        (b) => b.record.passNumber === passNumber
      );
      if (activeBreakData) {
        setIsScannerBusy(true);
        setScannerTriggeredCheckIn(activeBreakData.student.id);
        setLastScannedInfo({
          status: "success",
          name: activeBreakData.student.name || tRef.current.noName,
        });
        handleCheckIn(activeBreakData.student.id);
      } else {
        setLastScannedInfo({
          status: "fail",
          message: tRef.current.scanPassNotFound(passNumber),
        });
      }
    },
    [isScannerBusy, sortedStudentsOnBreak, tRef, handleCheckIn]
  );

  const handleOpenQrScanner = React.useCallback(() => {
    setLastScannedInfo(null);
    setScannerTriggeredCheckIn(null);
    setIsScannerBusy(false);
    setShowQrScanner(true);
  }, []);

  useEffect(() => {
    window.handleOpenQrScanner_Global = handleOpenQrScanner;
  }, [handleOpenQrScanner]);

  useEffect(() => {
    if (scannerTriggeredCheckIn) {
      const stillOnBreak = sortedStudentsOnBreak.some(
        (b) => b.student.id === scannerTriggeredCheckIn
      );
      if (!stillOnBreak) {
        setShowQrScanner(false);
        setCurrentPage("completed");
        setIsScannerBusy(false);
        setScannerTriggeredCheckIn(null);
      } else {
        setIsScannerBusy(false);
        setScannerTriggeredCheckIn(null);
      }
    }
  }, [attendance, scannerTriggeredCheckIn, sortedStudentsOnBreak]);

  // --- Render ---
  const handleNextPage = () =>
    setCompletedPage((p) => Math.min(p + 1, totalCompletedPages - 1));
  const handlePrevPage = () => setCompletedPage((p) => Math.max(p - 1, 0));
  const handleTouchStart = (e) => {
    if (currentPage === "completed")
      touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (currentPage !== "completed" || touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (deltaX > 75) handlePrevPage();
    else if (deltaX < -75) handleNextPage();
    touchStartXRef.current = null;
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedStudentId("");
  };

  return (
    <React.Fragment>
      <div
        className={`min-h-screen font-kantumruy transition-all duration-500 flex bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900`} // 🔥 DARK GREEN SCIENTIFIC BG
      >
        {/* DESKTOP SIDEBAR */}
        <DesktopSidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setCompletedPage={setCompletedPage}
          t={t}
          studentsOnBreakCount={studentsOnBreakCount}
          filteredCompletedBreaksCount={filteredCompletedBreaks.length}
        />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 relative lg:ml-72 lg:p-10 p-4 overflow-x-hidden">
          {/* Mobile Header */}
          <div
            className={`lg:hidden container mx-auto max-w-lg transition-all duration-300 ease-in-out ${
              isSearchFocused ? "-translate-y-24" : "translate-y-0"
            }`}
          >
            <h1 className="text-4xl font-bold text-center mb-2 text-white">
              {t.appTitle}
            </h1>
            <p className="text-xl text-center text-emerald-200 mb-6">
              {window.appSetup.displayDate}
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {t.appTitle} Dashboard
                </h2>
                <p className="text-emerald-200">
                  {window.appSetup.displayDate}
                </p>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm">សាខា (Branch)</div>
                <div className="text-2xl font-bold text-emerald-300 bg-emerald-900/40 px-4 py-1 rounded-lg border border-emerald-500/30">
                  {appBranch}
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE TABS */}
          <div
            className={`lg:hidden w-full max-w-md mx-auto bg-emerald-900/30 backdrop-blur-sm rounded-full p-1 flex space-x-1 mb-6 transition-all duration-300 ease-in-out ${
              isSearchFocused ? "-translate-y-24" : "translate-y-0"
            }`}
          >
            <button
              onClick={() => {
                setCurrentPage("search");
                setCompletedPage(0);
              }}
              className={`w-1/5 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === "search"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                  : "text-emerald-200"
              }`}
            >
              <IconSearch />
            </button>
            <button
              onClick={() => {
                setCurrentPage("onBreak");
                setCompletedPage(0);
              }}
              className={`w-1/5 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === "onBreak"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                  : "text-emerald-200"
              }`}
            >
              <div className="relative">
                <IconClock />
                {studentsOnBreakCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {studentsOnBreakCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                setCurrentPage("completed");
                setCompletedPage(0);
              }}
              className={`w-1/5 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === "completed"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                  : "text-emerald-200"
              }`}
            >
              <div className="relative">
                <IconCheckCircle />
                {filteredCompletedBreaks.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {filteredCompletedBreaks.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={handleOpenQrScanner}
              className="w-1/5 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative text-emerald-200"
            >
              <IconQrCode />
            </button>
            <button
              onClick={() => {
                setCurrentPage("settings");
                setCompletedPage(0);
              }}
              className={`w-1/5 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === "settings"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                  : "text-emerald-200"
              }`}
            >
              <IconSettings />
            </button>
          </div>

          {/* CONTENT PAGES */}
          <div className="container mx-auto lg:max-w-full">
            {loading && <LoadingSpinner />}
            {authError && (
              <div className="mt-4 mb-4 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-md mx-auto">
                {authError}{" "}
                <button
                  onClick={() => setAuthError(null)}
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  ✕
                </button>
              </div>
            )}

            {/* --- PAGE 1: ស្វែងរក (DARK GREEN) --- */}
            {!loading && currentPage === "search" && (
              <div key="search-page" className="relative w-full h-full">
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:gap-8 items-start">
                  {/* === ផ្នែកខាងឆ្វេង: NEON GREEN CARD (សកម្មភាពថ្មីៗ) === */}
                  <div className="w-full lg:col-span-7 mt-8 lg:mt-0">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <IconClock className="text-emerald-300" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        សកម្មភាពថ្មីៗ (៦ នាក់ចុងក្រោយ)
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {recentActiveBreaks.length > 0 ? (
                        recentActiveBreaks.map(
                          ({ student, record, elapsedMins, isOvertime }) => (
                            /* 🔥 NEON CARD UI (Green Theme) 🔥 */
                            <div key={record.id} className="neon-running-card">
                              <div
                                className="neon-inner-content"
                                style={{ background: "#022c22" }}
                              >
                                {" "}
                                {/* Dark Emerald Bg */}
                                {/* Info Left */}
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="relative">
                                    <img
                                      src={
                                        student.photoUrl ||
                                        `https://placehold.co/50x50/EBF4FF/76A9FA?text=${
                                          student.name
                                            ? student.name.charAt(0)
                                            : "N"
                                        }`
                                      }
                                      alt={student.name}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/30"
                                    />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                                  </div>

                                  <div>
                                    <h4 className="text-white font-bold text-sm leading-tight truncate max-w-[120px] sm:max-w-xs">
                                      {student.name}
                                    </h4>
                                    <div className="flex items-center text-emerald-200 text-xs mt-1">
                                      <IconClock className="w-3 h-3 mr-1 opacity-70" />
                                      <span>
                                        {new Date(
                                          record.checkOutTime
                                        ).toLocaleTimeString("km-KH", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* Info Right */}
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`px-2 py-0.5 rounded text-xs font-bold shadow-lg ${
                                      isOvertime
                                        ? "bg-red-500 text-white"
                                        : "bg-emerald-500 text-white"
                                    }`}
                                  >
                                    {elapsedMins} {t.minutes}
                                  </div>

                                  {record.passNumber && (
                                    <div className="hidden sm:block text-xs font-mono text-emerald-100 bg-white/10 px-2 py-0.5 rounded">
                                      {record.passNumber}
                                    </div>
                                  )}

                                  <button
                                    onClick={(e) =>
                                      handleOpenDeleteModal_Simple(
                                        e,
                                        student,
                                        record
                                      )
                                    }
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all ml-1"
                                    title={t.delete}
                                  >
                                    <IconTrash className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            /* 🔥 END NEON CARD 🔥 */
                          )
                        )
                      ) : (
                        <div className="text-center py-10 text-white/30 italic bg-white/5 rounded-2xl border border-white/10">
                          {t.noStudentsOnBreak}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* === ផ្នែកខាងស្តាំ: INPUT ស្វែងរក (DARK GREEN THEME) === */}
                  <div className="w-full lg:col-span-5 sticky top-6">
                    <div
                      className={`w-full transition-all duration-300 ease-in-out ${
                        isSearchFocused
                          ? "-translate-y-24 lg:translate-y-0"
                          : ""
                      }`}
                    >
                      <div className="bg-emerald-900/30 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center lg:text-left">
                          {t.searchPlaceholder.split("/")[0]}
                        </h2>

                        {students.length > 0 ? (
                          <div className="relative">
                            {/* 🔥 INPUT (DARK GREEN TEXT) 🔥 */}
                            <input
                              ref={searchInputRef}
                              type="text"
                              value={searchTerm}
                              onChange={handleSearchChange}
                              onFocus={() => {
                                setIsSearchFocused(true);
                                setAuthError(null);
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  if (
                                    document.activeElement &&
                                    !document.activeElement.classList.contains(
                                      "search-result-button"
                                    )
                                  )
                                    setIsSearchFocused(false);
                                }, 200);
                              }}
                              onKeyDown={handleSearchKeyDown}
                              placeholder={t.searchPlaceholder}
                              className="block w-full px-6 py-4 bg-white text-emerald-950 font-bold text-lg rounded-xl placeholder-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 shadow-inner"
                              autoComplete="off"
                              autoFocus
                            />

                            {/* Dropdown Results (GREEN HIGHLIGHT) */}
                            {searchResults.length > 0 && (
                              <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl max-h-80 overflow-y-auto overflow-x-hidden border border-gray-200">
                                {searchResults.map((student, index) => (
                                  <button
                                    key={student.id}
                                    /* 🔥 REF សម្រាប់ SCROLL 🔥 */
                                    ref={(el) =>
                                      (searchResultRefs.current[index] = el)
                                    }
                                    className={`search-result-button flex items-center w-full p-3 space-x-3 text-left transition-colors border-b last:border-0 border-gray-100 ${
                                      index === selectedIndex
                                        ? "bg-emerald-100 ring-2 ring-inset ring-emerald-400"
                                        : "hover:bg-emerald-50"
                                    }`}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSelectStudentFromList(student);
                                    }}
                                  >
                                    <img
                                      src={
                                        student.photoUrl ||
                                        `https://placehold.co/40x40/EBF4FF/76A9FA?text=${
                                          student.name
                                            ? student.name.charAt(0)
                                            : "N"
                                        }`
                                      }
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-gray-800 truncate">
                                        {student.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        ID: {student.idNumber}
                                      </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <span
                                        className={`text-xs font-bold ${student.statusColor}`}
                                      >
                                        {student.statusText}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          !authError && (
                            <p className="text-emerald-200/50 text-center py-4">
                              {t.studentNotFound}
                            </p>
                          )
                        )}

                        {selectedStudent && (
                          <div className="mt-6 animate-fade-in-up">
                            <StudentCard
                              student={selectedStudent}
                              pageKey="search"
                              passesInUse={studentsOnBreakCount}
                              attendance={attendance}
                              now={now}
                              handleCheckOut={handleCheckOut}
                              handleCheckIn={handleCheckIn}
                              handleOpenQrScanner={handleOpenQrScanner}
                              onDeleteClick={handleOpenDeleteModal_Simple}
                              totalPasses={totalPasses}
                              t={t}
                              checkInMode={checkInMode}
                              overtimeLimit={overtimeLimit}
                              appBranch={appBranch}
                            />
                          </div>
                        )}
                        {!selectedStudent &&
                          searchTerm !== "" &&
                          searchResults.length === 0 &&
                          isSearchFocused && (
                            <div className="mt-4 text-center p-4 bg-white/5 rounded-xl border border-dashed border-white/20">
                              <p className="text-white/70">
                                {t.studentNotFound}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- PAGE 2: កំពុងសម្រាក (GRID) --- */}
            {!loading && currentPage === "onBreak" && (
              <div key="on-break-page" className="pb-10">
                {sortedStudentsOnBreak.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ...">
                    {sortedStudentsOnBreak.map(
                      ({ student, record, elapsedMins, isOvertime }) => (
                        <div
                          key={record.id}
                          className="transform transition hover:scale-105 duration-200"
                        >
                          <OnBreakStudentListCard
                            student={student}
                            record={record}
                            elapsedMins={elapsedMins}
                            isOvertime={isOvertime}
                            onCheckIn={() => handleCheckIn(student.id)}
                            handleOpenQrScanner={handleOpenQrScanner}
                            onDeleteClick={(e) =>
                              handleOpenDeleteModal_Simple(e, student, record)
                            }
                            t={t}
                            checkInMode={checkInMode}
                          />
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-16 text-center lg:mt-32">
                    <div className="bg-white/10 inline-block p-6 rounded-full mb-4">
                      <IconClock className="w-16 h-16 text-white/50" />
                    </div>
                    <p className="text-white text-2xl font-semibold opacity-70">
                      {t.noStudentsOnBreak}
                    </p>
                  </div>
                )}
              </div>
            )}
            {/* --- PAGE 3: បានចូល (GRID) --- */}
            {!loading && currentPage === "completed" && (
              <div
                key="completed-page"
                className="pb-10"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <CompletedListHeader
                  onAdminClick={() => setShowAdminModal(true)}
                  onMultiDeleteClick={handleOpenDeleteSelected}
                  onCancelMultiSelect={handleToggleSelectionMode}
                  selectionCount={selectedRecords.length}
                  isSelectionMode={isSelectionMode}
                  t={t}
                />
                {filteredCompletedBreaks.length > 0 ? (
                  <React.Fragment>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paginatedCompletedBreaks.map(({ student, record }) => (
                        <div key={record.id} className="h-full">
                          <CompletedStudentListCard
                            student={student}
                            record={record}
                            onClick={() => !isSelectionMode && null}
                            isSelected={selectedRecords.includes(record.id)}
                            onSelect={() => handleRecordSelect(record.id)}
                            onDeleteClick={(e) =>
                              handleOpenPasswordModal(
                                t.deleteConfirmMessage(student.name),
                                () => handleConfirmDelete_Single(record.id)
                              )
                            }
                            isSelectionMode={isSelectionMode}
                            t={t}
                            overtimeLimit={overtimeLimit}
                          />
                        </div>
                      ))}
                    </div>
                    <PaginationControls
                      currentPage={completedPage + 1}
                      totalPages={totalCompletedPages}
                      onNext={handleNextPage}
                      onPrev={handlePrevPage}
                      t={t}
                    />
                  </React.Fragment>
                ) : (
                  <div className="mt-16 text-center lg:mt-32">
                    <div className="bg-white/10 inline-block p-6 rounded-full mb-4">
                      <IconCheckCircle className="w-16 h-16 text-white/50" />
                    </div>
                    <p className="text-white text-2xl font-semibold opacity-70">
                      {t.noStudentsCompleted}
                    </p>
                  </div>
                )}
              </div>
            )}
            {/* --- PAGE 5: Settings --- */}
            {!loading && currentPage === "settings" && (
              <div className="w-full">
                <SettingsPage
                  t={t}
                  language={language}
                  setLanguage={setLanguage}
                  background={background}
                  setBackground={setBackground}
                  checkInMode={checkInMode}
                  onEditCheckInMode={handleEditCheckInMode}
                  onEditPassword={handleEditPassword}
                  passesInUse={studentsOnBreakCount}
                  totalPasses={totalPasses}
                  onEditTotalPasses={handleEditTotalPasses}
                  overtimeLimit={overtimeLimit}
                  onEditOvertimeLimit={handleEditOvertimeLimit}
                  passPrefix={passPrefix}
                  onEditPassPrefix={handleEditPassPrefix}
                  passStartNumber={passStartNumber}
                  onEditPassStartNumber={handleEditPassStartNumber}
                  appBranch={appBranch}
                  autoCheckOut={autoCheckOut}
                  onEditAutoCheckOut={handleEditAutoCheckOut}
                />
              </div>
            )}
            {!loading && (
              <p className="text-center text-xs text-emerald-300 opacity-70 mt-8 lg:hidden">
                {t.footer}
              </p>
            )}
          </div>
        </div>

        {/* MODALS */}
        {modalStudent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setModalStudent(null)}
          >
            <div
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <StudentCard
                student={modalStudent}
                pageKey="modal"
                passesInUse={studentsOnBreakCount}
                attendance={attendance}
                now={now}
                handleCheckOut={handleCheckOut}
                handleCheckIn={handleCheckIn}
                handleOpenQrScanner={handleOpenQrScanner}
                onDeleteClick={handleOpenDeleteModal_Simple}
                totalPasses={totalPasses}
                t={t}
                checkInMode={checkInMode}
                overtimeLimit={overtimeLimit}
                appBranch={appBranch}
              />
              <button
                onClick={() => setModalStudent(null)}
                className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full transition-all hover:bg-white/30"
              >
                <IconClose />
              </button>
            </div>
          </div>
        )}
        <DeleteConfirmationModal
          recordToDelete={recordToDelete}
          onCancel={() => setRecordToDelete(null)}
          onConfirm={() => {
            handleConfirmDelete_Single(recordToDelete.record.id);
            setRecordToDelete(null);
          }}
          t={t}
        />
        <PasswordConfirmationModal
          prompt={passwordPrompt}
          onCancel={() => setPasswordPrompt({ isOpen: false })}
          onSubmit={handlePasswordSubmit}
          t={t}
        />
        <AdminActionModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          onSelectClick={handleToggleSelectionMode}
          onBulkClick={(mode) => handleOpenBulkDelete(mode)}
          isBulkLoading={isBulkLoading}
          bulkDeleteDate={bulkDeleteDate}
          setBulkDeleteDate={setBulkDeleteDate}
          bulkDeleteMonth={bulkDeleteMonth}
          setBulkDeleteMonth={setBulkDeleteMonth}
          t={t}
        />
        <QrScannerModal
          isOpen={showQrScanner}
          onClose={() => setShowQrScanner(false)}
          onScanSuccess={handleCheckInByPassNumber}
          lastScannedInfo={lastScannedInfo}
          isScannerBusy={isScannerBusy}
          t={t}
        />
        <InfoAlertModal
          alertInfo={infoAlert}
          onClose={() => setInfoAlert({ isOpen: false })}
          t={t}
        />
        <InputPromptModal
          promptInfo={inputPrompt}
          onCancel={inputPrompt.onCancel}
          onSubmit={inputPrompt.onSubmit}
          t={t}
        />
      </div>
    </React.Fragment>
  );
}

// =================================================================
// 6. START APP
// =================================================================
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
