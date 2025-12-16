// =================================================================
// 5. SETTINGS PAGE COMPONENT (UPDATED FOR DESKTOP GRID)
// =================================================================

// --- Component សម្រាប់ Page "Settings" ទាំងមូល ---
const SettingsPage = ({
  t,
  language,
  setLanguage,
  background,
  setBackground,
  checkInMode,
  onEditCheckInMode,
  onEditPassword,
  passesInUse,
  totalPasses,
  onEditTotalPasses,
  overtimeLimit,
  onEditOvertimeLimit,
  passPrefix,
  onEditPassPrefix,
  passStartNumber,
  onEditPassStartNumber,
  appBranch,
}) => {
  // ទាញ Icons ពី Global Scope
  const {
    IconLanguage,
    IconPalette,
    IconLock,
    IconTicket,
    IconSettings,
    backgroundStyles,
    IconTimer,
  } = window.appSetup;

  return (
    <div key="settings-page" className="pb-10 text-white">
      {/* បង្ហាញ Title តែលើ Mobile, Desktop មាននៅ Header ហើយ */}
      <h2 className="text-3xl font-bold text-center mb-6 lg:hidden">
        {t.settingsTitle}
      </h2>

      {/* !! ថ្មី !!: Grid Layout សម្រាប់ Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* --- 1. គ្រប់គ្រងកាត (ធំជាងគេ) --- */}
        <div className="md:col-span-2 xl:col-span-1 row-span-2">
          <SettingCard
            title={t.passCardManagement}
            icon={<IconTicket />}
            className="h-full"
          >
            <PassesInfoSetting
              t={t}
              passesInUse={passesInUse}
              totalPasses={totalPasses}
              onEditTotal={onEditTotalPasses}
              passPrefix={passPrefix}
              onEditPassPrefix={onEditPassPrefix}
              passStartNumber={passStartNumber}
              onEditPassStartNumber={onEditPassStartNumber}
              appBranch={appBranch}
            />
          </SettingCard>
        </div>

        {/* --- 2. ការកំណត់លើសម៉ោង --- */}
        <SettingCard title={t.overtimeSettings} icon={<IconTimer />}>
          <OvertimeLimitSetting
            t={t}
            overtimeLimit={overtimeLimit}
            onEditOvertimeLimit={onEditOvertimeLimit}
          />
        </SettingCard>

        {/* --- 3. សុវត្ថិភាព --- */}
        <SettingCard title={t.security} icon={<IconLock />}>
          <div className="space-y-3">
            <CheckInModeSetting
              t={t}
              checkInMode={checkInMode}
              onEditCheckInMode={onEditCheckInMode}
            />
            <button
              onClick={onEditPassword}
              className="w-full px-4 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t.changePassword}
            </button>
          </div>
        </SettingCard>

        {/* --- 4. ភាសា --- */}
        <SettingCard title={t.language} icon={<IconLanguage />}>
          <div className="flex space-x-2 h-full items-center">
            <button
              onClick={() => setLanguage("km")}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                language === "km"
                  ? "bg-white text-blue-800 shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              ខ្មែរ (KM)
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                language === "en"
                  ? "bg-white text-blue-800 shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              English (EN)
            </button>
          </div>
        </SettingCard>

        {/* --- 5. ផ្ទៃខាងក្រោយ --- */}
        <div className="md:col-span-2 xl:col-span-1">
          <SettingCard title={t.background} icon={<IconPalette />}>
            <div className="grid grid-cols-4 gap-3">
              {Object.keys(backgroundStyles).map((key) => (
                <button
                  key={key}
                  onClick={() => setBackground(key)}
                  className={`h-16 rounded-lg ${backgroundStyles[key]} ${
                    background === key
                      ? "ring-4 ring-white scale-105"
                      : "opacity-70 hover:opacity-100"
                  } transition-all shadow-sm`}
                >
                  {/* <span className="bg-black/20 px-1 py-0.5 rounded text-[10px] text-white block mt-auto mx-1 mb-1 truncate">{key}</span> */}
                </button>
              ))}
            </div>
          </SettingCard>
        </div>
      </div>
    </div>
  );
};

// --- Component តូចៗ សម្រាប់ Settings (Updated Card Style) ---
const SettingCard = ({ title, icon, children, className = "" }) => (
  // !! កែសម្រួល !!: ដក max-w-md ចេញ, បន្ថែម h-full និង flex-col ដើម្បីឱ្យស្អាតក្នុង Grid
  <div
    className={`w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-6 flex flex-col ${className}`}
  >
    <div className="flex items-center mb-6">
      <div className="p-3 bg-white/20 rounded-2xl shadow-inner">{icon}</div>
      <h3 className="text-xl font-bold ml-4 text-white">{title}</h3>
    </div>
    <div className="flex-1 w-full">{children}</div>
  </div>
);

// --- Component សម្រាប់ បង្ហាញព័ត៌មានកាត ---
const PassesInfoSetting = ({
  t,
  passesInUse,
  totalPasses,
  onEditTotal,
  passPrefix,
  onEditPassPrefix,
  passStartNumber,
  onEditPassStartNumber,
  appBranch,
}) => {
  const { IconPencil, IconType, IconHash } = window.appSetup;
  const passesAvailable = totalPasses - passesInUse;

  return (
    <div className="bg-white/5 rounded-2xl p-4 h-full flex flex-col justify-between">
      <div className="text-center mb-6">
        <span className="bg-blue-600/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30">
          {t.settingsForBranch} "{appBranch}"
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-white text-center mb-6">
        <div className="text-center p-2 bg-white/5 rounded-xl">
          <p className="text-3xl font-bold text-red-300">{passesInUse}</p>
          <p className="text-xs text-blue-200 mt-1">{t.passesInUse}</p>
        </div>
        <div className="text-center p-2 bg-white/5 rounded-xl">
          <p className="text-3xl font-bold text-green-300">{passesAvailable}</p>
          <p className="text-xs text-blue-200 mt-1">{t.passesAvailable}</p>
        </div>
        <div className="text-center p-2 bg-white/5 rounded-xl">
          <p className="text-3xl font-bold">{totalPasses}</p>
          <p className="text-xs text-blue-200 mt-1">{t.passTotal}</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 mb-6">
        <div className="text-center flex-1 border-r border-white/10">
          <p className="text-2xl font-bold">{passPrefix}</p>
          <p className="text-xs text-blue-200">{t.passPrefix}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-2xl font-bold">{passStartNumber}</p>
          <p className="text-xs text-blue-200">{t.passStartNumber}</p>
        </div>
      </div>

      <div className="space-y-3 mt-auto">
        <button
          onClick={onEditTotal}
          className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm text-white font-bold transition-all shadow-md bg-blue-600 hover:bg-blue-700"
        >
          <IconPencil />
          <span className="ml-2">{t.editPassTotal}</span>
        </button>

        <button
          onClick={onEditPassPrefix}
          className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm text-white font-bold transition-all shadow-md bg-blue-600 hover:bg-blue-700"
        >
          <IconType className="w-5 h-5" />
          <span className="ml-2">{t.editPassPrefix}</span>
        </button>

        <button
          onClick={onEditPassStartNumber}
          className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm text-white font-bold transition-all shadow-md bg-blue-600 hover:bg-blue-700"
        >
          <IconHash className="w-5 h-5" />
          <span className="ml-2">{t.editPassStartNumber}</span>
        </button>
      </div>
    </div>
  );
};

// --- Component សម្រាប់ កំណត់នាទីលើសម៉ោង ---
const OvertimeLimitSetting = ({ t, overtimeLimit, onEditOvertimeLimit }) => {
  const { IconPencil } = window.appSetup;

  return (
    <div className="bg-white/5 rounded-2xl p-6 text-center h-full flex flex-col justify-center">
      <p className="text-sm text-blue-200 mb-2">{t.overtimeLimit}</p>
      <p className="text-6xl font-bold text-white mb-6">
        {overtimeLimit}
        <span className="text-2xl ml-2 font-normal opacity-70">
          {t.minutes}
        </span>
      </p>
      <button
        onClick={onEditOvertimeLimit}
        className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-lg text-white font-bold transition-all shadow-lg bg-blue-600 hover:bg-blue-700 mt-auto"
      >
        <IconPencil />
        <span className="ml-2">{t.overtimeLimit}</span>
      </button>
    </div>
  );
};

// --- Component សម្រាប់ ប្ដូររបៀប Check-in ---
const CheckInModeSetting = ({ t, checkInMode, onEditCheckInMode }) => {
  const { IconCheckIn, IconCheckOut } = window.appSetup;

  return (
    <div className="mb-4">
      <p className="text-sm text-blue-200 mb-2">{t.checkInMethod}</p>
      {checkInMode === "scan" ? (
        <button
          onClick={onEditCheckInMode}
          className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-lg text-white font-bold transition-all shadow-md bg-blue-600 hover:bg-blue-700"
        >
          <IconCheckIn className="w-6 h-6 mr-2" />
          {t.checkInMethodScan}
        </button>
      ) : (
        <button
          onClick={onEditCheckInMode}
          className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-lg text-white font-bold transition-all shadow-md bg-green-600 hover:bg-green-700"
        >
          <IconCheckOut className="w-6 h-6 mr-2" />
          {t.checkInMethodAuto}
        </button>
      )}
    </div>
  );
};

// ភ្ជាប់ទៅ Global Scope
window.SettingsPage = SettingsPage;
