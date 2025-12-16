// !! ថ្មី !!: ទាញអថេរ និង Icons ពី Global Scope
const {
  calculateDuration,
  IconCheckOut,
  IconCheckIn,
  IconSearch,
  IconClock,
  IconCheckCircle,
  IconTicket,
  IconClose,
  IconTrash,
  IconNoSymbol,
  IconAlert,
  IconSpecial,
  IconDotsVertical,
  IconLock,
  IconQrCode,
  IconPencil,
  IconInfo,
  IconCheckCircleFill,
  IconPencilSquare,
  IconArrowLeft,
  IconArrowRight,
  IconCameraRotate,
  IconToggleLeft,
  IconToggleRight, // Icons សម្រាប់ QR Scanner
  IconSettings,
  IconTimer, // Icons សម្រាប់ Dashboard
} = window.appSetup;

// =================================================================
// 1. DESKTOP DASHBOARD COMPONENTS (NEW)
// =================================================================

// Sidebar សម្រាប់ Desktop (ជំនួស Tabs លើទូរស័ព្ទ)
window.DesktopSidebar = ({
  currentPage,
  setCurrentPage,
  setCompletedPage,
  t,
  studentsOnBreakCount,
  filteredCompletedBreaksCount,
}) => {
  const NavItem = ({ id, icon, label, count, color }) => (
    <button
      onClick={() => {
        setCurrentPage(id);
        setCompletedPage(0);
      }}
      className={`w-full flex items-center space-x-3 px-6 py-4 transition-all rounded-xl mb-2 ${
        currentPage === id
          ? "bg-white text-blue-900 shadow-lg font-bold"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <div className="relative">
        {icon}
        {count > 0 && (
          <span
            className={`absolute -top-2 -right-2 px-1.5 py-0.5 text-xs rounded-full text-white font-bold ${color}`}
          >
            {count}
          </span>
        )}
      </div>
      <span className="text-lg text-left flex-1">{label}</span>
    </button>
  );

  return (
    <div className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-white/5 backdrop-blur-md border-r border-white/10 p-6 z-40">
      <div className="mb-10 text-center">
        {/* Logo ឬ Title */}
        <div className="bg-white/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner">
          <IconTicket className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white mb-1">{t.appTitle}</h1>
        <p className="text-xs text-blue-200 opacity-70">System Dashboard</p>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        <NavItem
          id="search"
          icon={<IconSearch />}
          label={t.searchPlaceholder.split("/")[0]}
        />
        <NavItem
          id="onBreak"
          icon={<IconClock />}
          label={t.statusOnBreak}
          count={studentsOnBreakCount}
          color="bg-red-500"
        />
        <NavItem
          id="completed"
          icon={<IconCheckCircle />}
          label={t.statusCompleted}
          count={filteredCompletedBreaksCount}
          color="bg-green-500"
        />
        <div className="my-4 border-t border-white/10"></div>
        <NavItem
          id="settings"
          icon={<IconSettings />}
          label={t.settingsTitle}
        />
      </nav>

      {/* QR Code Button at Bottom */}
      <div className="mt-4">
        <button
          onClick={() =>
            window.handleOpenQrScanner_Global &&
            window.handleOpenQrScanner_Global()
          }
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          <IconQrCode />
          <span className="font-bold">{t.scanToComeBack}</span>
        </button>
      </div>

      <div className="mt-6 text-center text-xs text-white/30">{t.footer}</div>
    </div>
  );
};

// Dashboard Stats Widget (បង្ហាញស្ថិតិសរុបខាងលើ)
window.DashboardStatsRow = ({
  t,
  totalPasses,
  passesInUse,
  onBreakCount,
  completedCount,
  overtimeLimit,
}) => {
  const passesAvailable = totalPasses - passesInUse;

  const StatCard = ({ title, value, subtext, color, icon }) => (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center space-x-4 shadow-sm hover:bg-white/20 transition-all cursor-default flex-1">
      <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-blue-100 text-sm font-medium mb-1 opacity-80">
          {title}
        </p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtext && <p className="text-xs text-white/50 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="hidden lg:flex flex-row gap-6 mb-8">
      <StatCard
        title={t.passesAvailable}
        value={passesAvailable}
        subtext={`${t.passesInUse}: ${passesInUse} / ${t.passTotal}: ${totalPasses}`}
        color="bg-gradient-to-br from-green-400 to-green-600"
        icon={<IconTicket />}
      />
      <StatCard
        title={t.statusOnBreak}
        value={onBreakCount}
        subtext="Active Students"
        color="bg-gradient-to-br from-yellow-400 to-orange-500"
        icon={<IconClock />}
      />
      <StatCard
        title={t.statusCompleted}
        value={completedCount}
        subtext="Returned Today"
        color="bg-gradient-to-br from-blue-400 to-blue-600"
        icon={<IconCheckCircle />}
      />
      <StatCard
        title={t.overtimeLimit}
        value={`${overtimeLimit} ${t.minutes}`}
        subtext="Max Allowed Time"
        color="bg-gradient-to-br from-purple-400 to-purple-600"
        icon={<IconTimer />}
      />
    </div>
  );
};

// =================================================================
// 2. MAIN UI COMPONENTS (UPDATED FOR RESPONSIVE)
// =================================================================

window.StudentCard = ({
  student,
  pageKey,
  passesInUse,
  attendance,
  now,
  handleCheckOut,
  handleCheckIn,
  handleOpenQrScanner,
  onDeleteClick,
  totalPasses,
  t,
  checkInMode,
  overtimeLimit,
  appBranch,
}) => {
  const studentBreaks = attendance[student.id] || [];
  const activeBreak = studentBreaks.find(
    (r) => r.checkOutTime && !r.checkInTime
  );
  const completedBreaks = studentBreaks.filter(
    (r) => r.checkOutTime && r.checkInTime
  );

  let statusText = t.statusNotYet;
  let statusClass = "bg-gray-500 text-white";
  let canCheckIn = false;
  let canCheckOut = true;
  let isSpecialCase = false;

  let passesAvailable = totalPasses - passesInUse;

  if (activeBreak) {
    const elapsedMins = calculateDuration(
      activeBreak.checkOutTime,
      now.toISOString()
    );
    const isOvertime = elapsedMins > overtimeLimit;

    const branchDisplay = activeBreak.branch ? ` (${activeBreak.branch})` : "";
    const passNumberDisplay = activeBreak.passNumber
      ? `${t.statusPass}: ${activeBreak.passNumber}`
      : "";
    statusText = `${t.statusOnBreak} (${passNumberDisplay}${branchDisplay}) (${elapsedMins} ${t.minutes})`;

    statusClass = isOvertime
      ? "bg-red-600 text-white animate-pulse"
      : "bg-yellow-500 text-white animate-pulse";
    canCheckIn = true;
    canCheckOut = false;
    if (activeBreak.breakType === "special") {
      isSpecialCase = true;
    }
  } else if (completedBreaks.length > 0) {
    const lastBreak = completedBreaks[completedBreaks.length - 1];
    const duration = calculateDuration(
      lastBreak.checkOutTime,
      lastBreak.checkInTime
    );
    const isCompletedOvertime = duration > overtimeLimit;
    const overtimeMins = isCompletedOvertime ? duration - overtimeLimit : 0;

    statusText = isCompletedOvertime
      ? `${t.statusCompleted} (${t.statusOvertime} ${overtimeMins} ${t.minutes})`
      : `${t.statusCompleted} (${duration} ${t.minutes})`;
    statusClass = isCompletedOvertime
      ? "bg-red-600 text-white"
      : "bg-green-600 text-white";
    canCheckIn = false;
    canCheckOut = true;

    if (studentBreaks.some((r) => r.breakType === "special")) {
      isSpecialCase = true;
    }
  } else {
    statusText = t.statusNotYet;
    statusClass = "bg-gray-500 text-white";
    canCheckIn = false;
    canCheckOut = true;
  }

  if (passesAvailable <= 0 && canCheckOut) {
    canCheckOut = false;
    statusText = `${t.statusPassOut} (${passesInUse}/${totalPasses})`;
    statusClass = "bg-red-600 text-white";
  }

  const photoUrl =
    student.photoUrl ||
    `https://placehold.co/128x128/EBF4FF/76A9FA?text=${
      student.name ? student.name.charAt(0) : "N"
    }`;

  const checkInAction =
    checkInMode === "scan"
      ? handleOpenQrScanner
      : () => handleCheckIn(student.id);

  // Updated Class: Added lg:max-w-full to fit in grid
  return (
    <div
      key={`${pageKey}-${student.id}`}
      className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-6 relative mt-16 w-full max-w-md mx-auto lg:max-w-full"
    >
      {activeBreak && (
        <button
          onClick={(e) => onDeleteClick(e, student, activeBreak)}
          className="absolute top-4 right-4 text-red-300 bg-red-900/50 p-2 rounded-full transition-all hover:bg-red-500 hover:text-white"
          title={t.delete}
        >
          <IconTrash />
        </button>
      )}

      <img
        src={photoUrl}
        alt={`រូបថតរបស់ ${student.name || t.noName}`}
        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
        onError={(e) => {
          e.target.src = `https://placehold.co/128x128/EBF4FF/76A9FA?text=${
            student.name ? student.name.charAt(0) : "N"
          }`;
        }}
      />

      <div className="pt-16 text-center">
        <p className="text-3xl font-bold text-white">
          {student.name || t.noName}
        </p>
        <p className="text-lg text-blue-200">
          {t.idNumber}: {student.idNumber || "N/A"}
        </p>
        <p className="text-lg text-blue-200">
          {t.class}: {student.class || "N/A"}
        </p>
      </div>

      {/* --- Case 1: កំពុងសម្រាក (Active Break) --- */}
      {activeBreak && (
        <>
          <div className="my-6 text-center">
            <p
              className={`inline-flex items-center px-5 py-2 rounded-full text-md font-semibold ${statusClass}`}
            >
              {statusText}
              {isSpecialCase && <IconSpecial />}
            </p>
          </div>
          <button
            onClick={checkInAction}
            disabled={!canCheckIn}
            className="flex items-center justify-center w-full px-4 py-4 rounded-full text-lg text-blue-800 font-bold transition-all transform hover:scale-105 shadow-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <IconCheckIn />
            {t.checkIn}
          </button>
        </>
      )}

      {/* --- Case 2: មិនទាន់សម្រាក ឬ សម្រាករួច (No Active Break) --- */}
      {!activeBreak && (
        <div className="my-6">
          <div className="flex justify-center items-center space-x-4">
            {/* Status Text */}
            <p
              className={`inline-flex items-center px-5 py-2 rounded-full text-md font-semibold ${statusClass}`}
            >
              {statusText}
              {isSpecialCase && <IconSpecial />}
            </p>

            {/* Check-out Button (បើអាច) */}
            {canCheckOut && (
              <button
                onClick={() => handleCheckOut(student.id)}
                disabled={!canCheckOut}
                className="flex items-center justify-center p-4 rounded-full text-lg text-white font-bold transition-all transform hover:scale-105 shadow-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                <IconCheckOut />
              </button>
            )}

            {/* Pass Out Warning (បើអស់កាត) */}
            {!canCheckOut && statusText.startsWith(t.statusPassOut) && (
              <div className="flex items-center justify-center p-4 rounded-full text-lg text-white font-bold bg-red-600/50 opacity-80 cursor-not-allowed">
                <IconNoSymbol />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

window.CompletedStudentListCard = ({
  student,
  record,
  onClick,
  isSelected,
  onSelect,
  onDeleteClick,
  isSelectionMode,
  t,
  overtimeLimit,
}) => {
  const formatTime = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleTimeString("km-KH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const duration = calculateDuration(record?.checkOutTime, record?.checkInTime);

  const isOvertime = duration > overtimeLimit;
  const overtimeMins = isOvertime ? duration - overtimeLimit : 0;
  const cardColor = isOvertime
    ? "bg-red-800/30 backdrop-blur-lg border border-red-500/30"
    : "bg-white/10 backdrop-blur-lg";
  const durationColor = isOvertime ? "text-red-300" : "text-green-300";

  const photoUrl =
    student.photoUrl ||
    `https://placehold.co/64x64/EBF4FF/76A9FA?text=${
      student.name ? student.name.charAt(0) : "N"
    }`;

  const branchDisplay = record.branch ? ` (${record.branch})` : "";

  // Updated Class: w-full, remove max-w-md constraint on large screens for grid
  return (
    <div
      className={`w-full max-w-md mx-auto lg:max-w-full rounded-2xl shadow-lg p-4 mb-3 flex items-center space-x-4 transition-all h-full ${cardColor} ${
        isSelectionMode ? "cursor-pointer" : ""
      } ${isSelected ? "ring-2 ring-blue-400" : ""}`}
      onClick={() =>
        isSelectionMode ? onSelect() : onClick ? onClick() : null
      }
    >
      {isSelectionMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="form-checkbox h-6 w-6 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <img
        src={photoUrl}
        alt={`រូបថតរបស់ ${student.name || t.noName}`}
        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
        onError={(e) => {
          e.target.src = `https://placehold.co/64x64/EBF4FF/76A9FA?text=${
            student.name ? student.name.charAt(0) : "N"
          }`;
        }}
      />
      <div className="flex-1 text-left">
        <p className="text-xl font-bold text-white truncate">
          {student.name || t.noName}
        </p>
        <p className="text-sm text-blue-200">
          {t.checkOut}: {formatTime(record?.checkOutTime)} | {t.checkIn}:{" "}
          {formatTime(record?.checkInTime)}
        </p>

        {record.passNumber && (
          <p className="text-sm font-semibold text-cyan-300">
            ({t.statusPass}: {record.passNumber}
            {branchDisplay})
          </p>
        )}

        {isOvertime && (
          <p className="text-sm font-semibold text-red-300">
            ({t.statusOvertime} {overtimeMins} {t.minutes})
          </p>
        )}
        {record.breakType === "special" && (
          <p className="text-sm font-semibold text-purple-300">
            ({t.specialCase})
          </p>
        )}
      </div>

      <div className="text-center px-2">
        <p className={`text-2xl font-bold ${durationColor}`}>{duration}</p>
        <p className="text-xs text-blue-200">{t.minutes}</p>
      </div>

      {!isSelectionMode && (
        <button
          onClick={(e) => onDeleteClick(e)}
          className="p-3 rounded-full text-red-300 bg-white/10 transition-colors hover:bg-red-500 hover:text-white"
          title={t.delete}
        >
          <IconTrash />
        </button>
      )}
    </div>
  );
};

window.OnBreakStudentListCard = ({
  student,
  record,
  elapsedMins,
  isOvertime,
  onCheckIn,
  handleOpenQrScanner,
  onDeleteClick,
  t,
  checkInMode,
}) => {
  const cardColor = isOvertime
    ? "bg-red-800/30 backdrop-blur-lg border border-red-500/30"
    : "bg-yellow-500/20 backdrop-blur-lg border border-yellow-500/30";

  const textColor = isOvertime ? "text-red-300" : "text-yellow-300";

  const photoUrl =
    student.photoUrl ||
    `https://placehold.co/64x64/EBF4FF/76A9FA?text=${
      student.name ? student.name.charAt(0) : "N"
    }`;

  const checkInAction =
    checkInMode === "scan" ? handleOpenQrScanner : () => onCheckIn();

  const branchDisplay = record.branch ? ` (${record.branch})` : "";

  // Updated Class: w-full, remove max-w-md constraint on large screens for grid
  return (
    <div
      className={`w-full max-w-md mx-auto lg:max-w-full rounded-2xl shadow-lg p-4 mb-3 flex items-center space-x-3 h-full ${cardColor}`}
    >
      <img
        src={photoUrl}
        alt={`រូបថតរបស់ ${student.name || t.noName}`}
        className="w-16 h-16 rounded-full object-cover border-2 border-white/50 shadow-md"
        onError={(e) => {
          e.target.src = `https://placehold.co/64x64/EBF4FF/76A9FA?text=${
            student.name ? student.name.charAt(0) : "N"
          }`;
        }}
      />
      <div className="flex-1 text-left">
        <p className="text-xl font-bold text-white truncate">
          {student.name || t.noName}
        </p>
        <p
          className={`text-sm font-semibold ${textColor} inline-flex items-center`}
        >
          {isOvertime ? t.overtimeExclamation : t.statusOnBreak}
          {record.breakType === "special" && (
            <span className="ml-2 px-2 py-0.5 text-xs text-purple-800 bg-purple-300 rounded-full">
              {t.specialCase}
            </span>
          )}
        </p>
        <p className="text-sm text-blue-200">
          ({t.statusPass}: {record.passNumber || "???"}
          {branchDisplay})
        </p>
      </div>

      <div className="text-center px-2">
        <p className={`text-2xl font-bold ${textColor}`}>{elapsedMins}</p>
        <p className="text-xs text-blue-200">{t.minutes}</p>
      </div>

      <div className="flex flex-col space-y-2">
        <button
          onClick={checkInAction}
          className="p-3 rounded-full text-blue-800 bg-white transition-colors hover:bg-gray-200"
          title={t.checkIn}
        >
          <IconCheckIn />
        </button>

        <button
          onClick={(e) => onDeleteClick(e)}
          className="p-3 rounded-full text-red-300 bg-white/10 transition-colors hover:bg-red-500 hover:text-white"
          title={t.delete}
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
};

// =================================================================
// 3. MODALS & UTILITIES (KEPT AS IS)
// =================================================================

window.PasswordConfirmationModal = ({ prompt, onSubmit, onCancel, t }) => {
  if (!prompt.isOpen) return null;

  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <IconLock />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {t.passwordRequired}
        </h3>
        <p className="text-gray-600 mb-4">{prompt.message}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg"
            placeholder={t.passwordPlaceholder}
            autoFocus
          />
          {prompt.error && (
            <p className="text-red-500 text-sm mt-2">{prompt.error}</p>
          )}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-full text-white bg-blue-500 hover:bg-blue-600 font-bold"
            >
              {t.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

window.AdminActionModal = ({
  isOpen,
  onClose,
  onSelectClick,
  onBulkClick,
  isBulkLoading,
  bulkDeleteDate,
  setBulkDeleteDate,
  bulkDeleteMonth,
  setBulkDeleteMonth,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-2xl shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>

        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          {t.adminTitle}
        </h3>

        <div className="space-y-3">
          <button
            onClick={onSelectClick}
            className="w-full px-4 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            {t.multiSelect}
          </button>

          <div className="p-4 bg-gray-100 rounded-lg">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              {t.deleteByDate}
            </label>
            <input
              type="date"
              value={bulkDeleteDate}
              onChange={(e) => setBulkDeleteDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
            />
            <button
              onClick={() => onBulkClick("day")}
              className="w-full mt-2 px-4 py-3 text-lg font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50"
              disabled={isBulkLoading}
            >
              {isBulkLoading ? t.deleting : t.deleteByDateButton}
            </button>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              {t.deleteByMonth}
            </label>
            <input
              type="month"
              value={bulkDeleteMonth}
              onChange={(e) => setBulkDeleteMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
            />
            <button
              onClick={() => onBulkClick("month")}
              className="w-full mt-2 px-4 py-3 text-lg font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              disabled={isBulkLoading}
            >
              {isBulkLoading ? t.deleting : t.deleteByMonthButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.CompletedListHeader = ({
  onAdminClick,
  onMultiDeleteClick,
  onCancelMultiSelect,
  selectionCount,
  isSelectionMode,
  t,
}) => {
  return (
    <div className="w-full max-w-md mx-auto lg:max-w-full mb-4 flex justify-between items-center">
      {!isSelectionMode ? (
        <>
          <h2 className="text-2xl font-bold text-white">{t.historyToday}</h2>
          <button
            onClick={onAdminClick}
            className="p-3 rounded-full text-white bg-white/10 transition-colors hover:bg-white/30"
            title={t.adminTitle}
          >
            <IconDotsVertical />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onCancelMultiSelect}
            className="px-4 py-2 text-white font-semibold bg-gray-600/50 rounded-full hover:bg-gray-500/50"
          >
            {t.cancel}
          </button>
          <button
            onClick={onMultiDeleteClick}
            disabled={selectionCount === 0}
            className="px-4 py-2 text-white font-bold bg-red-500 rounded-full hover:bg-red-600 disabled:opacity-50"
          >
            {t.delete} ({selectionCount})
          </button>
        </>
      )}
    </div>
  );
};

window.LoadingSpinner = () => (
  <div className="flex justify-center items-center mt-10">
    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
);

window.DeleteConfirmationModal = ({
  recordToDelete,
  onCancel,
  onConfirm,
  t,
}) => {
  if (!recordToDelete) return null;

  const { student } = recordToDelete;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <IconAlert />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {t.deleteTitle}
        </h3>
        <p className="text-gray-600 mb-6">
          {t.deleteConfirmMessage(student.name)}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold"
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-full text-white bg-red-500 hover:bg-red-600 font-bold"
          >
            {t.delete}
          </button>
        </div>
      </div>
    </div>
  );
};

// QR Scanner Modal (Updated with Flip/Mirror from previous version)
window.QrScannerModal = ({
  isOpen,
  onClose,
  onScanSuccess,
  lastScannedInfo,
  isScannerBusy,
  t,
}) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // កាមេរ៉ាក្រោយ
  const [isMirrored, setIsMirrored] = useState(false); // State សម្រាប់បិទ/បើក mirror

  const html5QrCodeRef = React.useRef(null);
  const scannerId = "qr-reader";

  // Function to stop the scanner
  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            console.log("QR Scanner stopped.");
          })
          .catch((err) => {
            console.warn(
              "QR Scanner stop error (probably already stopped).",
              err
            );
          });
        html5QrCodeRef.current = null;
      } catch (e) {
        console.warn("Error stopping scanner:", e);
      }
    }
  };

  // Function to start the scanner
  const startScanner = (mode) => {
    setErrorMessage(null);
    const element = document.getElementById(scannerId);
    if (element) {
      const html5QrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = html5QrCode;

      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        onScanSuccess(decodedText);
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCode
        .start({ facingMode: mode }, config, qrCodeSuccessCallback)
        .catch((err) => {
          console.error(`Unable to start ${mode} camera`, err);
          setErrorMessage(t.cameraError);
        });
    }
  };

  // Effect to manage scanner start/stop
  useEffect(() => {
    if (isOpen) {
      if (!isScannerBusy) {
        // Start scanner on open
        startScanner(facingMode);
      } else {
        // Stop if busy
        stopScanner();
      }
    } else {
      // Stop scanner on close
      stopScanner();
    }

    // Cleanup function
    return () => {
      stopScanner();
    };
  }, [isOpen, isScannerBusy, facingMode]);

  // Effect for Mirror control
  useEffect(() => {
    if (!isOpen || isScannerBusy) return;

    // Wait for camera to be ready
    const timeoutId = setTimeout(() => {
      try {
        const videoElement = document.querySelector(`#${scannerId} video`);
        if (videoElement) {
          if (facingMode === "user") {
            // Front Camera: Toggle Mirror
            videoElement.style.setProperty(
              "transform",
              isMirrored ? "scaleX(-1)" : "scaleX(1)",
              "important"
            );
          } else {
            // Back Camera: Always Normal
            videoElement.style.setProperty(
              "transform",
              "scaleX(1)",
              "important"
            );
          }
        }
      } catch (e) {
        console.error("Error applying mirror style:", e);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [isOpen, isScannerBusy, facingMode, isMirrored]);

  const handleFlipCamera = () => {
    if (isScannerBusy) return;
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
    setIsMirrored(false);
  };

  const handleToggleMirror = () => {
    setIsMirrored((prev) => !prev);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-800 bg-gray-200 p-2 rounded-full z-10 hover:bg-gray-300"
        >
          <IconClose />
        </button>

        {/* Flip Camera Button */}
        <button
          onClick={handleFlipCamera}
          className="absolute top-4 left-4 text-gray-800 bg-gray-200 p-2 rounded-full z-10 hover:bg-gray-300"
          title={t.flipCamera}
        >
          <IconCameraRotate className="w-6 h-6" />
        </button>

        {/* Mirror Toggle Button (Only for Front Camera) */}
        {facingMode === "user" && (
          <button
            onClick={handleToggleMirror}
            className="absolute top-16 left-4 text-gray-800 bg-gray-200 p-2 rounded-full z-10 hover:bg-gray-300"
            title={t.toggleMirror}
          >
            {isMirrored ? (
              <IconToggleRight className="w-6 h-6" />
            ) : (
              <IconToggleLeft className="w-6 h-6" />
            )}
          </button>
        )}

        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          {t.scanToComeBack}
        </h3>

        <div
          id={scannerId}
          className="w-full rounded-lg overflow-hidden bg-black"
        ></div>

        <div className="mt-4 text-center h-12">
          {isScannerBusy && (
            <div className="flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-600 text-xl font-bold ml-3">
                {t.processing}
              </p>
            </div>
          )}

          {!isScannerBusy && errorMessage && (
            <p className="text-red-500 text-lg font-bold">{errorMessage}</p>
          )}

          {!isScannerBusy &&
            lastScannedInfo &&
            lastScannedInfo.status === "success" && (
              <p className="text-green-600 text-xl font-bold animate-pulse">
                ✔ {t.scanned}: {lastScannedInfo.name}
              </p>
            )}

          {!isScannerBusy &&
            lastScannedInfo &&
            lastScannedInfo.status === "fail" && (
              <p className="text-red-600 text-xl font-bold">
                ✖ {lastScannedInfo.message}
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

window.InfoAlertModal = ({ alertInfo, onClose, t }) => {
  if (!alertInfo.isOpen) return null;

  const isError = alertInfo.type === "error";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isError ? <IconAlert /> : <IconCheckCircleFill />}

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {isError ? t.alertErrorTitle : t.alertSuccessTitle}
        </h3>

        <p className="text-gray-600 mb-6" style={{ whiteSpace: "pre-line" }}>
          {alertInfo.message}
        </p>

        <button
          onClick={onClose}
          className="w-full px-8 py-3 rounded-full text-white bg-blue-500 hover:bg-blue-600 font-bold"
        >
          {t.ok}
        </button>
      </div>
    </div>
  );
};

window.InputPromptModal = ({ promptInfo, onSubmit, onCancel, t }) => {
  if (!promptInfo.isOpen) return null;

  const [value, setValue] = useState(promptInfo.defaultValue || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <IconPencilSquare />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {promptInfo.title}
        </h3>
        <p className="text-gray-600 mb-4">{promptInfo.message}</p>

        <form onSubmit={handleSubmit}>
          <input
            type={promptInfo.type || "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg"
            autoFocus
          />
          <div className="flex justify-center space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-full text-white bg-blue-500 hover:bg-blue-600 font-bold"
            >
              {t.ok}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

window.PaginationControls = ({
  currentPage,
  totalPages,
  onNext,
  onPrev,
  t,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto lg:max-w-full mt-4 flex justify-between items-center">
      {/* Prev */}
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="p-3 rounded-full text-white bg-white/10 transition-colors hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <IconArrowLeft />
      </button>

      {/* Page Number */}
      <span className="text-lg font-bold text-white">
        {t.paginationPage} {currentPage} / {totalPages}
      </span>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="p-3 rounded-full text-white bg-white/10 transition-colors hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <IconArrowRight />
      </button>
    </div>
  );
};
