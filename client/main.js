/**
 * Time Tracker - Premiere Pro Extension
 * Tracks time spent on projects and exports to CSV
 * 
 * @author CyrilG93
 * @version 1.3.0
 */

// CSInterface wrapper for communication with Premiere Pro
var csInterface = new CSInterface();

// Storage key
var STORAGE_KEY = 'timeTracker_data';

// DOM elements
var timeDisplay, projectName, totalTime, exportBtn, settingsBtn, settingsPanel, closeSettingsBtn;
var mergeEntriesCheckbox, idleTimeoutInput, languageSelect, clearDataBtn, clearAfterExportBtn;
var idleAlert, dismissIdleBtn, mainDisplay, autoPauseCheckbox;
var logPanel, logContent, showLogsCheckbox, clearLogsBtn;
var importCsvConfigBtn, exportCsvConfigBtn, csvConfigFileInput;
var csvPresetNameInput, saveCsvPresetBtn, csvPresetSelect;

// State
var currentSession = null;
var sessions = [];
var settings = {
    mergeEntries: false,
    autoPause: true,
    idleTimeout: 30,
    language: 'en',
    showLogs: false,
    csvColumns: [
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' },
        { type: 'empty', value: '' }
    ],
    csvColumnPresets: {}
};
var translations = {};
var currentLang = 'en';
var logEntries = [];

// Timers
var trackingInterval = null;
var displayInterval = null;
var idleCheckInterval = null;
var sessionStartTime = null;
var lastProjectPath = '';
var lastProjectInfo = null;

// Constants
var POLL_INTERVAL_MS = 2000;      // Project status check
var DISPLAY_INTERVAL_MS = 1000;   // Timer display update
var IDLE_CHECK_INTERVAL_MS = 30000; // Check for idle state every 30 seconds
var ACTIVITY_CHECK_INTERVAL_MS = 10000; // Check activity every 10 seconds
var AUTO_SAVE_INTERVAL_MS = 30000; // Auto-save every 30 seconds
var CSV_COLUMN_COUNT = 14; // Total number of configurable CSV columns

// Auto-save interval
var autoSaveInterval = null;

// Activity detection
var lastProjectState = '';
var lastActivityTime = null;
var activityCheckInterval = null;

/**
 * Initialize the extension
 */
// ============================================================================
// UPDATE SYSTEM CONSTANTS & TRANSLATIONS
// ============================================================================
const GITHUB_REPO = 'CyrilG93/PremiereTimeTracker';
let CURRENT_VERSION = '1.3.0';

// Update translations with update message
function loadTranslations(lang, callback) {
    var fs = require('fs');
    var path = require('path');
    var langPath = path.join(csInterface.getSystemPath(SystemPath.EXTENSION), 'client', 'lang', lang + '.json');

    // Default messages for update
    const updateMessages = {
        en: {
            updateAvailable: "🚀 New version available! Click to update.",
        },
        fr: {
            updateAvailable: "🚀 Nouvelle version disponible ! Cliquez pour mettre à jour.",
        }
    };

    if (fs.existsSync(langPath)) {
        try {
            var content = fs.readFileSync(langPath, 'utf8');
            translations = JSON.parse(content);
            // Merge update message
            translations.updateAvailable = updateMessages[lang] ? updateMessages[lang].updateAvailable : updateMessages['en'].updateAvailable;
            if (callback) callback();
        } catch (e) {
            console.error('Error loading translations:', e);
            translations = {};
            translations.updateAvailable = updateMessages[lang] ? updateMessages[lang].updateAvailable : updateMessages['en'].updateAvailable;
            if (callback) callback();
        }
    } else {
        console.warn('Translation file not found:', langPath);
        translations = {};
        translations.updateAvailable = updateMessages[lang] ? updateMessages[lang].updateAvailable : updateMessages['en'].updateAvailable;
        if (callback) callback();
    }
}

/**
 * Initialize the extension
 */
function init() {
    timeDisplay = document.getElementById('timeDisplay');
    projectName = document.getElementById('projectName');
    totalTime = document.getElementById('totalTime');
    exportBtn = document.getElementById('exportBtn');
    settingsBtn = document.getElementById('settingsBtn');
    settingsPanel = document.getElementById('settingsPanel');
    closeSettingsBtn = document.getElementById('closeSettingsBtn');
    mergeEntriesCheckbox = document.getElementById('mergeEntries');
    idleTimeoutInput = document.getElementById('idleTimeout');
    languageSelect = document.getElementById('languageSelect');
    clearDataBtn = document.getElementById('clearDataBtn');
    clearAfterExportBtn = document.getElementById('clearAfterExportBtn');
    idleAlert = document.getElementById('idleAlert');
    dismissIdleBtn = document.getElementById('dismissIdleBtn');
    mainDisplay = document.getElementById('mainDisplay');
    logPanel = document.getElementById('logPanel');
    logContent = document.getElementById('logContent');
    showLogsCheckbox = document.getElementById('showLogs');
    clearLogsBtn = document.getElementById('clearLogsBtn');
    importCsvConfigBtn = document.getElementById('importCsvConfigBtn');
    exportCsvConfigBtn = document.getElementById('exportCsvConfigBtn');
    csvConfigFileInput = document.getElementById('csvConfigFileInput');
    csvPresetNameInput = document.getElementById('csvPresetNameInput');
    saveCsvPresetBtn = document.getElementById('saveCsvPresetBtn');
    csvPresetSelect = document.getElementById('csvPresetSelect');

    // Load saved data
    loadData();

    // Load translations
    loadTranslations(settings.language, function () {
        applyTranslations();
    });

    // Check for updates
    checkForUpdates();

    // Event listeners
    exportBtn.addEventListener('click', exportToCSV);
    settingsBtn.addEventListener('click', showSettings);
    closeSettingsBtn.addEventListener('click', hideSettings);
    mergeEntriesCheckbox.addEventListener('change', saveSettings);
    autoPauseCheckbox = document.getElementById('autoPause');
    if (autoPauseCheckbox) {
        autoPauseCheckbox.addEventListener('change', saveSettings);
    }
    idleTimeoutInput.addEventListener('change', saveSettings);
    languageSelect.addEventListener('change', onLanguageChange);
    clearDataBtn.addEventListener('click', clearAllData);
    if (clearAfterExportBtn) {
        clearAfterExportBtn.addEventListener('click', clearAllDataWithConfirmation);
    }
    dismissIdleBtn.addEventListener('click', dismissIdleAlert);

    // Log panel event listeners
    if (showLogsCheckbox) {
        showLogsCheckbox.addEventListener('change', toggleLogPanel);
    }
    var copyLogsBtn = document.getElementById('copyLogsBtn');
    if (copyLogsBtn) {
        copyLogsBtn.addEventListener('click', copyLogs);
    }
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', clearLogs);
    }

    // CSV Columns configuration
    var csvConfigToggle = document.getElementById('csvConfigToggle');
    if (csvConfigToggle) {
        csvConfigToggle.addEventListener('click', toggleCsvConfig);
    }
    if (importCsvConfigBtn) {
        importCsvConfigBtn.addEventListener('click', triggerCsvConfigImport);
    }
    if (exportCsvConfigBtn) {
        exportCsvConfigBtn.addEventListener('click', exportCsvConfig);
    }
    if (csvConfigFileInput) {
        csvConfigFileInput.addEventListener('change', onCsvConfigFileSelected);
    }
    if (saveCsvPresetBtn) {
        saveCsvPresetBtn.addEventListener('click', saveCsvPreset);
    }
    if (csvPresetSelect) {
        csvPresetSelect.addEventListener('change', onCsvPresetSelectChange);
    }
    renderCsvColumnsUI();
    renderCsvPresetOptions();

    // Start polling for project changes
    startTracking();

    // Start idle detection
    startIdleDetection();

    // Start activity detection (for auto-pause)
    startActivityDetection();

    // Handle panel close
    csInterface.addEventListener('com.adobe.csxs.events.WindowVisibilityChanged', onPanelVisibilityChange);

    console.log('Time Tracker initialized');
}

// ============================================================================
// UPDATE LOGIC
// ============================================================================

function compareVersions(v1, v2) {
    const p1 = v1.replace(/^v/, '').split('.').map(Number);
    const p2 = v2.replace(/^v/, '').split('.').map(Number);
    const len = Math.max(p1.length, p2.length);

    for (let i = 0; i < len; i++) {
        const num1 = p1[i] || 0;
        const num2 = p2[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0;
}

function getAppVersion() {
    try {
        if (window.cep && window.cep.fs) {
            const path = window.cep.fs.readFile(csInterface.getSystemPath(SystemPath.EXTENSION) + "/CSXS/manifest.xml");
            if (path.data) {
                const match = path.data.match(/ExtensionBundleVersion="([^"]+)"/);
                if (match && match[1]) {
                    return match[1];
                }
            }
        }
    } catch (e) {
        console.error('[Update] Error reading manifest:', e);
    }
    return CURRENT_VERSION;
}

async function checkForUpdates() {
    console.log('[Update] Checking for updates...');
    const localVersion = getAppVersion();
    console.log('[Update] Local version:', localVersion);

    // Update settings badge
    const versionBadge = document.getElementById('versionInfo');
    if (versionBadge) {
        versionBadge.textContent = 'v' + localVersion;
    }

    try {
        if (window.require) {
            const https = require('https');
            const options = {
                hostname: 'api.github.com',
                path: `/repos/${GITHUB_REPO}/releases/latest`,
                method: 'GET',
                headers: {
                    'User-Agent': 'PremiereTimeTracker-UpdateCheck'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    handleUpdateResponse(data, localVersion);
                });
            });

            req.on('error', (e) => {
                console.error('[Update] Network error:', e);
            });

            req.end();
        }
    } catch (e) {
        console.error('[Update] Unexpected error:', e);
    }
}

function handleUpdateResponse(data, localVersion) {
    try {
        const release = JSON.parse(data);
        const latestVersion = release.tag_name.replace(/^v/, '');

        console.log('[Update] Latest version:', latestVersion);

        if (compareVersions(latestVersion, localVersion) > 0) {
            console.log('[Update] New version available!');

            // Find zip asset
            const zipAsset = release.assets.find(asset => asset.name.endsWith('.zip'));
            const downloadUrl = zipAsset ? zipAsset.browser_download_url : release.html_url;

            showUpdateBanner(downloadUrl);
        } else {
            console.log('[Update] App is up to date.');
        }
    } catch (e) {
        console.error('[Update] Error parsing response:', e);
    }
}

function showUpdateBanner(downloadUrl) {
    const banner = document.getElementById('updateBanner');
    if (banner) {
        banner.style.display = 'block';

        // Use translation function
        banner.textContent = t('updateAvailable');

        banner.onclick = function () {
            if (downloadUrl) {
                try {
                    csInterface.openURLInDefaultBrowser(downloadUrl);
                } catch (e) {
                    console.error('[Update] Error opening URL:', e);
                    try {
                        window.location.href = downloadUrl;
                    } catch (e2) {
                        console.error('[Update] Fallback failed:', e2);
                    }
                }
            }
        };
    }
}

/**
 * Get the data file path
 */
/**
 * Get the data file path
 * Uses Application Support/AppData for persistence
 */
function getDataFilePath() {
    var os = require('os');
    var path = require('path');
    var platform = os.platform();
    var dataDir;

    // Determine proper data directory based on OS
    if (platform === 'darwin') {
        dataDir = path.join(os.homedir(), 'Library', 'Application Support', 'PremiereTimeTracker');
    } else {
        dataDir = path.join(process.env.APPDATA || os.homedir(), 'PremiereTimeTracker');
    }

    var fs = require('fs');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    return path.join(dataDir, 'timeTracker_data.json');
}

/**
 * Load saved data from file (with migration support)
 */
function loadData() {
    var fs = require('fs');
    var path = require('path');
    var os = require('os');

    var dataFilePath = getDataFilePath();

    // Check for legacy file in Documents and migrate if needed
    var legacyPath = path.join(os.homedir(), 'Documents', 'TimeTracker_data.json');
    if (fs.existsSync(legacyPath) && !fs.existsSync(dataFilePath)) {
        try {
            log('Migrating data from Documents to new storage location...');
            var legacyData = fs.readFileSync(legacyPath, 'utf8');
            fs.writeFileSync(dataFilePath, legacyData, 'utf8');
            // Rename legacy file to avoid confusion (or delete it)
            fs.renameSync(legacyPath, legacyPath + '.bak');
            log('Migration successful.');
        } catch (e) {
            console.error('Error migrating legacy data:', e);
            log('Error migrating data: ' + e.message, 'error');
        }
    }

    try {
        // Try to load from file first
        if (fs.existsSync(dataFilePath)) {
            var fileContent = fs.readFileSync(dataFilePath, 'utf8');
            var parsed = JSON.parse(fileContent);

            // Validate sessions array
            if (Array.isArray(parsed.sessions)) {
                sessions = parsed.sessions.filter(function (s) {
                    return s && s.id && s.openTime;
                });
                if (sessions.length !== parsed.sessions.length) {
                    console.warn('Removed', parsed.sessions.length - sessions.length, 'corrupted session(s)');
                }
            } else {
                sessions = [];
            }

            // Load settings with defaults
            settings = Object.assign(settings, parsed.settings || {});
            // Keep the CSV config shape stable to avoid invalid entries in UI/export.
            settings.csvColumns = normalizeCsvColumnsConfig(settings.csvColumns);
            // Keep preset list valid and resilient to malformed entries.
            settings.csvColumnPresets = normalizeCsvPresets(settings.csvColumnPresets);
            log('Data loaded from file: ' + sessions.length + ' sessions');
        } else {
            // Try to migrate from localStorage
            var oldData = localStorage.getItem(STORAGE_KEY);
            if (oldData) {
                var parsed = JSON.parse(oldData);
                sessions = parsed.sessions || [];
                settings = Object.assign(settings, parsed.settings || {});
                // Keep the CSV config shape stable to avoid invalid entries in UI/export.
                settings.csvColumns = normalizeCsvColumnsConfig(settings.csvColumns);
                // Keep preset list valid and resilient to malformed entries.
                settings.csvColumnPresets = normalizeCsvPresets(settings.csvColumnPresets);
                log('Migrated ' + sessions.length + ' sessions from localStorage');
                // Save to file and clear localStorage
                saveData();
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        // Apply settings to UI
        mergeEntriesCheckbox.checked = settings.mergeEntries;
        if (autoPauseCheckbox) {
            autoPauseCheckbox.checked = settings.autoPause !== false;
        }
        idleTimeoutInput.value = settings.idleTimeout;
        languageSelect.value = settings.language;
        currentLang = settings.language;

        // Restore debug logs state
        if (showLogsCheckbox) {
            showLogsCheckbox.checked = settings.showLogs || false;
        }
        if (settings.showLogs && logPanel) {
            logPanel.classList.add('show');
        }

        console.log('Data loaded:', sessions.length, 'sessions');
    } catch (e) {
        console.error('Error loading data:', e);
        log('Error loading data: ' + e.message, 'error');
        sessions = [];
    }
}

/**
 * Save data to file
 */
function saveData() {
    var fs = require('fs');
    var dataFilePath = getDataFilePath();

    try {
        // Filter out any sessions with invalid duration before saving
        var validSessions = sessions.filter(function (s) {
            return s && s.id && s.openTime && s.duration > 0;
        });

        if (validSessions.length !== sessions.length) {
            log('Filtered out ' + (sessions.length - validSessions.length) + ' invalid session(s)', 'warn');
            sessions = validSessions;
        }

        var data = {
            sessions: validSessions,
            settings: settings,
            lastSaved: new Date().toISOString()
        };

        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
        log('Data saved: ' + validSessions.length + ' sessions to ' + dataFilePath);
    } catch (e) {
        console.error('Error saving data:', e);
        log('ERROR saving data: ' + e.message + ' - Path: ' + dataFilePath, 'error');
    }
}

/**
 * Save data with provided sessions array (for auto-save with current session)
 */
function saveDataWithSessions(sessionsToSave) {
    var fs = require('fs');
    var dataFilePath = getDataFilePath();

    try {
        // Filter valid sessions
        var validSessions = sessionsToSave.filter(function (s) {
            return s && s.id && s.openTime && s.duration > 0;
        });

        var data = {
            sessions: validSessions,
            settings: settings,
            lastSaved: new Date().toISOString()
        };

        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
        log('Auto-saved: ' + validSessions.length + ' session(s)');
    } catch (e) {
        log('ERROR auto-saving: ' + e.message, 'error');
    }
}

/**
 * Save settings
 */
function saveSettings() {
    settings.mergeEntries = mergeEntriesCheckbox.checked;
    if (autoPauseCheckbox) {
        settings.autoPause = autoPauseCheckbox.checked;
    }
    settings.idleTimeout = parseInt(idleTimeoutInput.value, 10) || 30;
    settings.language = languageSelect.value;

    // Save with current session included if tracking
    if (currentSession && sessionStartTime) {
        var now = new Date();
        currentSession.duration = now.getTime() - sessionStartTime.getTime();
        currentSession.closeTime = now.toISOString();

        if (currentSession.duration >= 1000) {
            var tempSessions = sessions.slice();
            tempSessions.push(currentSession);
            saveDataWithSessions(tempSessions);
        } else {
            saveData();
        }
    } else {
        saveData();
    }
}

/**
 * Start tracking loop
 */
function startTracking() {
    // Initial check
    checkProject();

    // Poll for project changes (heavier - ExtendScript call)
    trackingInterval = setInterval(checkProject, POLL_INTERVAL_MS);

    // Update display more frequently (lightweight)
    displayInterval = setInterval(updateTimerDisplay, DISPLAY_INTERVAL_MS);
}

/**
 * Toggle tracking manually (click on timer)
 */
function toggleTracking() {
    if (currentSession) {
        // Stop tracking
        console.log('Manual stop tracking');
        endSession();
        lastProjectPath = '';
        lastProjectInfo = null;
        showNoProject();
    } else {
        // Try to start tracking with retries
        console.log('Manual start tracking - checking project...');
        tryDetectProject(5, 1000); // 5 attempts, 1 second between each (for NAS)
    }
}

/**
 * Try to detect project with retries
 */
function tryDetectProject(retriesLeft, delayMs) {
    csInterface.evalScript('TimeTracker_getProjectInfo()', function (result) {
        try {
            console.log('Detection attempt, retries left:', retriesLeft, 'result:', result);
            var info = JSON.parse(result);

            if (info.isOpen && info.path) {
                console.log('Project found:', info.folderName);
                lastProjectInfo = info;
                startSession(info);
                lastProjectPath = info.path;
                updateDisplay(info);
            } else if (retriesLeft > 0) {
                // Retry after delay
                console.log('Project not detected, retrying in', delayMs, 'ms...');
                setTimeout(function () {
                    tryDetectProject(retriesLeft - 1, delayMs);
                }, delayMs);
            } else {
                // All retries exhausted - show debug info
                log('No project detected after all retries', 'warn');
                log('Debug info: ' + (info.debug || 'none'), 'warn');
                var msg = (t('noProjectOpen') || 'No project open') + '\n\nDebug: ' + (info.debug || 'Unknown');
                alert(msg);
            }
        } catch (e) {
            console.error('Error parsing result:', e, 'Raw result:', result);
            if (retriesLeft > 0) {
                setTimeout(function () {
                    tryDetectProject(retriesLeft - 1, delayMs);
                }, delayMs);
            }
        }
    });
}

/**
 * Update timer display only (lightweight, every second)
 */
function updateTimerDisplay() {
    if (sessionStartTime && lastProjectInfo) {
        var elapsed = new Date().getTime() - sessionStartTime.getTime();
        timeDisplay.textContent = formatDuration(elapsed);

        // Update total time
        var todayTotal = getTodayTotalTime(lastProjectInfo.path) + elapsed;
        if (totalTime) {
            totalTime.textContent = formatDurationShort(todayTotal);
        }
    }
}

/**
 * Check current project status
 * Uses failedChecksCount to require multiple consecutive failures before ending session
 */
var failedChecksCount = 0;
var FAILED_CHECKS_THRESHOLD = 5; // Require 5 consecutive failures before closing

function checkProject() {
    csInterface.evalScript('TimeTracker_getProjectInfo()', function (result) {
        try {
            // Handle undefined or empty result
            if (!result || result === 'undefined' || result === 'null') {
                handleFailedCheck('Empty result: ' + result);
                return;
            }

            var info = JSON.parse(result);

            // Normalize property names (support both old and new naming styles)
            // Old style: projectName, projectPath, projectRoot
            // New style: isOpen, path, fileName, folderName
            var isOpen = info.isOpen !== undefined ? info.isOpen : (info.projectPath || info.projectName ? true : false);
            var projectPath = info.path || info.projectPath || '';
            var projectName = info.fileName || info.projectName || '';
            var folderName = info.folderName || info.projectRoot || '';

            // Log normalized info periodically for debugging
            if (failedChecksCount === 2) {
                log('Raw response: ' + result.substring(0, 150) + '...', 'info');
                log('Normalized: isOpen=' + isOpen + ', path=' + (projectPath ? 'yes' : 'no') + ', name=' + (projectName ? 'yes' : 'no'), 'info');
            }

            // Check if info has valid properties
            var hasValidProject = isOpen && (projectPath || projectName || folderName);

            if (hasValidProject) {
                // Project is open - reset failed checks counter
                if (failedChecksCount > 0) {
                    log('Project recovered after ' + failedChecksCount + ' failed check(s)');
                }
                failedChecksCount = 0;

                // Extract clean project name from path if needed
                var cleanFolderName = folderName || '';
                if (cleanFolderName.indexOf('/') !== -1) {
                    // If folderName contains path separator, extract the project folder name
                    var parts = cleanFolderName.split('/');
                    // Look for a meaningful folder name (not PROJET, not Volumes)
                    for (var i = parts.length - 1; i >= 0; i--) {
                        if (parts[i] && parts[i] !== 'PROJET' && parts[i] !== 'Volumes' && parts[i].indexOf('.') === -1) {
                            cleanFolderName = parts[i];
                            break;
                        }
                    }
                }
                if (!cleanFolderName && projectName) {
                    cleanFolderName = projectName.replace('.prproj', '');
                }

                // Create normalized info object
                var normalizedInfo = {
                    isOpen: true,
                    path: projectPath || projectName,
                    fileName: projectName,
                    folderName: cleanFolderName,
                    fullLocation: info.fullLocation || ''
                };
                lastProjectInfo = normalizedInfo;

                // Use path or name for project identification
                var projectId = projectPath || projectName;

                if (projectId !== lastProjectPath) {
                    // New project or first detection
                    log('Project detected: ' + (folderName || projectName || 'Unknown'));
                    if (currentSession) {
                        // Close previous session
                        endSession();
                    }
                    // Start new session
                    startSession(normalizedInfo);
                    lastProjectPath = projectId;
                }

                // Update display
                updateDisplay(normalizedInfo);

            } else if (isOpen === false) {
                // Project explicitly closed
                handleFailedCheck('Project closed');
            } else {
                // Missing required info but might have debug info
                handleFailedCheck('Missing project info. Debug: ' + (info.debug || JSON.stringify(info).substring(0, 60)));
            }
        } catch (e) {
            handleFailedCheck('Parse error: ' + e.message);
        }
    });
}

function handleFailedCheck(reason) {
    failedChecksCount++;

    // Only log every few failures to avoid spam
    if (failedChecksCount <= 3 || failedChecksCount % 5 === 0) {
        log('Check failed (' + failedChecksCount + '/' + FAILED_CHECKS_THRESHOLD + '): ' + reason, 'warn');
    }

    if (failedChecksCount >= FAILED_CHECKS_THRESHOLD) {
        // Only end session after multiple consecutive failures
        if (currentSession) {
            log('Ending session after ' + FAILED_CHECKS_THRESHOLD + ' failed checks');
            endSession();
        }
        lastProjectPath = '';
        lastProjectInfo = null;
        showNoProject();
        failedChecksCount = 0;
    }
}

/**
 * Start a new tracking session
 */
function startSession(info) {
    sessionStartTime = new Date();

    // Extract project path - use fullLocation or extract from path
    var projectPath = info.fullLocation || '';
    if (!projectPath && info.path) {
        // Normalize path separators (Windows uses \, Mac uses /)
        var normalizedPath = info.path.replace(/\\/g, '/');

        // Extract path from full project path
        var parts = normalizedPath.split('/').filter(function (p) {
            // Skip empty, Volumes (Mac), and drive letters like C: (Windows)
            return p && p !== 'Volumes' && !/^[A-Z]:$/i.test(p);
        });

        // Remove the project file name and PROJET folder if present
        if (parts.length > 0 && parts[parts.length - 1].indexOf('.prproj') !== -1) {
            parts.pop();
        }
        if (parts.length > 0 && parts[parts.length - 1] === 'PROJET') {
            parts.pop();
        }
        projectPath = parts.join('/');
    }

    currentSession = {
        id: generateId(),
        projectFile: info.fileName,
        projectName: info.folderName,
        projectPath: projectPath,
        openTime: sessionStartTime.toISOString(),
        closeTime: null,
        duration: 0
    };

    log('Session started: ' + currentSession.projectName);

    // Start auto-save interval
    startAutoSave();
}

/**
 * Start auto-save interval
 */
function startAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    autoSaveInterval = setInterval(function () {
        if (currentSession && sessionStartTime) {
            // Update current session duration
            var now = new Date();
            currentSession.duration = now.getTime() - sessionStartTime.getTime();
            currentSession.closeTime = now.toISOString();

            // Save to file (will filter short sessions)
            if (currentSession.duration >= 1000) {
                // Temporarily add current session to array for save
                var tempSessions = sessions.slice();
                tempSessions.push(currentSession);

                // Save with current session included
                saveDataWithSessions(tempSessions);
            }
        }
    }, AUTO_SAVE_INTERVAL_MS);
    log('Auto-save started (every ' + (AUTO_SAVE_INTERVAL_MS / 1000) + 's)');
}

/**
 * Stop auto-save interval
 */
function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

/**
 * End the current session
 */
function endSession() {
    // Stop auto-save first
    stopAutoSave();

    if (!currentSession) {
        log('endSession called but no current session', 'warn');
        return;
    }

    // Make sure we have a valid start time
    if (!sessionStartTime) {
        log('endSession called without sessionStartTime, skipping save', 'warn');
        currentSession = null;
        return;
    }

    var endTime = new Date();
    currentSession.closeTime = endTime.toISOString();
    currentSession.duration = endTime.getTime() - sessionStartTime.getTime();

    log('Session ending: ' + currentSession.projectName + ', duration=' + Math.floor(currentSession.duration / 1000) + 's');

    // Don't save sessions shorter than 1 second
    if (currentSession.duration < 1000) {
        log('Session too short (' + currentSession.duration + 'ms), skipping save', 'warn');
        currentSession = null;
        sessionStartTime = null;
        return;
    }

    // Add to sessions array
    sessions.push(currentSession);
    log('Session added to array. Total sessions: ' + sessions.length);

    saveData();

    currentSession = null;
    sessionStartTime = null;
}

/**
 * Update the display
 */
function updateDisplay(info) {
    if (sessionStartTime) {
        var elapsed = new Date().getTime() - sessionStartTime.getTime();
        timeDisplay.textContent = formatDuration(elapsed);
        timeDisplay.classList.add('tracking');

        // Update total time for today
        var todayTotal = getTodayTotalTime(info.path) + elapsed;
        if (totalTime) {
            totalTime.textContent = formatDurationShort(todayTotal);
        }
    }

    projectName.textContent = info.folderName || info.fileName || '-';
}

/**
 * Show no project state
 */
function showNoProject() {
    timeDisplay.textContent = '00:00:00';
    timeDisplay.classList.remove('tracking');
    projectName.textContent = '-';
    if (totalTime) {
        totalTime.textContent = '';
    }
}

/**
 * Format duration in HH:MM:SS
 */
function formatDuration(ms) {
    var totalSeconds = Math.floor(ms / 1000);
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

/**
 * Format duration for export (H:MM)
 */
function formatDurationExport(ms) {
    var totalMinutes = Math.floor(ms / 60000);
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;

    return hours + ':' + pad(minutes);
}

/**
 * Format duration short (for total display)
 */
function formatDurationShort(ms) {
    var totalMinutes = Math.floor(ms / 60000);
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;

    if (hours > 0) {
        return hours + 'h' + pad(minutes);
    }
    return minutes + 'm';
}

/**
 * Get total time for today for a specific project
 */
function getTodayTotalTime(projectPath) {
    var today = new Date().toDateString();
    var total = 0;

    sessions.forEach(function (session) {
        var sessionDate = new Date(session.openTime).toDateString();
        if (sessionDate === today && session.projectFile === currentSession.projectFile) {
            total += session.duration;
        }
    });

    return total;
}

/**
 * Pad number with leading zero
 */
function pad(num) {
    return num < 10 ? '0' + num : num.toString();
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Export sessions to CSV
 */
function exportToCSV() {
    console.log('Export called. Saved sessions:', sessions.length);

    if (sessions.length === 0 && !currentSession) {
        alert(t('noDataToExport') || 'No data to export');
        return;
    }

    // Create a deep copy of sessions to avoid modifying original data
    var exportSessions = sessions.map(function (s) {
        return {
            id: s.id,
            projectFile: s.projectFile,
            projectName: s.projectName,
            projectPath: s.projectPath,
            openTime: s.openTime,
            closeTime: s.closeTime,
            duration: s.duration
        };
    });

    // Include current session if active (with valid start time)
    if (currentSession && sessionStartTime) {
        var now = new Date();
        exportSessions.push({
            id: currentSession.id,
            projectFile: currentSession.projectFile,
            projectName: currentSession.projectName,
            projectPath: currentSession.projectPath,
            openTime: currentSession.openTime,
            closeTime: now.toISOString(),
            duration: now.getTime() - sessionStartTime.getTime()
        });
    }

    console.log('Sessions to export:', exportSessions.length);

    // Optionally merge entries
    if (settings.mergeEntries) {
        exportSessions = mergeSessionsByDay(exportSessions);
        console.log('After merge:', exportSessions.length);
    }

    // Generate CSV content
    var csv = generateCSV(exportSessions);

    // Download file
    var filename = 'TimeTracker_' + formatDateForFilename(new Date()) + '.csv';
    downloadCSV(csv, filename, exportSessions.length);
}

/**
 * Merge sessions by project and day
 * - Keep earliest open time
 * - Calculate close time as: earliest open + total duration
 * - Sum all durations
 */
function mergeSessionsByDay(sessions) {
    var merged = {};

    sessions.forEach(function (session) {
        var date = new Date(session.openTime);
        var key = session.projectFile + '_' + date.toDateString();

        if (!merged[key]) {
            merged[key] = Object.assign({}, session);
        } else {
            // Add duration
            merged[key].duration += session.duration;
            // Keep earliest open time
            if (session.openTime < merged[key].openTime) {
                merged[key].openTime = session.openTime;
            }
        }
    });

    // Calculate close time as open time + total duration
    Object.keys(merged).forEach(function (key) {
        var session = merged[key];
        var openDate = new Date(session.openTime);
        var closeDate = new Date(openDate.getTime() + session.duration);
        session.closeTime = closeDate.toISOString();
    });

    return Object.values(merged);
}

/**
 * Generate CSV content with customizable columns
 */
function generateCSV(sessions) {
    var lines = [];

    // Header row
    lines.push('A,B,C,D,E,F,G,H,I,J,K,L,M,N');

    sessions.forEach(function (session) {
        var openDate = new Date(session.openTime);
        var closeDate = session.closeTime ? new Date(session.closeTime) : new Date();

        // Build row based on custom column configuration
        var row = [];
        for (var i = 0; i < CSV_COLUMN_COUNT; i++) {
            var colConfig = settings.csvColumns[i] || { type: 'empty', value: '' };
            row.push(getColumnValue(session, colConfig, openDate, closeDate));
        }

        lines.push(row.map(escapeCSV).join(','));
    });

    return lines.join('\r\n');
}

/**
 * Format date as M/D/YYYY
 */
function formatDateShort(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    return month + '/' + day + '/' + year;
}

/**
 * Format time in 12-hour format
 */
function formatTime12h(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return hours + ':' + pad(minutes) + ' ' + ampm;
}

/**
 * Format date and time for filename
 */
function formatDateForFilename(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
        '_' + pad(date.getHours()) + '-' + pad(date.getMinutes());
}

/**
 * Escape CSV field
 */
function escapeCSV(field) {
    if (field === null || field === undefined) {
        return '';
    }
    var str = String(field);
    if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

/**
 * Download CSV file using Node.js (CEP compatible)
 */
function downloadCSV(content, filename, sessionCount) {
    try {
        var fs = require('fs');
        var os = require('os');
        var path = require('path');

        // Save to Desktop
        var desktopPath = path.join(os.homedir(), 'Desktop');
        var filePath = path.join(desktopPath, filename);

        fs.writeFileSync(filePath, content, 'utf8');

        var msg = (t('exportSuccess') || 'Export successful!') + '\n' +
            (sessionCount || 0) + ' sessions\n\n' + filePath;
        alert(msg);
        console.log('CSV exported to:', filePath);

    } catch (e) {
        console.error('Export error:', e);
        // Fallback to blob download
        try {
            var blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            var link = document.createElement('a');
            var url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e2) {
            alert((t('exportError') || 'Export failed: ') + e.message);
        }
    }
}

/**
 * Settings panel controls
 */
function showSettings() {
    settingsPanel.classList.add('show');
}

function hideSettings() {
    settingsPanel.classList.remove('show');
}

/**
 * Language change handler
 */
function onLanguageChange() {
    var newLang = languageSelect.value;
    settings.language = newLang;
    saveSettings();
    loadTranslations(newLang, function () {
        applyTranslations();
    });
}



/**
 * Get translation by key
 */
function t(key) {
    var keys = key.split('.');
    var value = translations;
    for (var i = 0; i < keys.length; i++) {
        if (value && value[keys[i]]) {
            value = value[keys[i]];
        } else {
            return key;
        }
    }
    return value;
}

/**
 * Apply translations to UI
 */
function applyTranslations() {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
        var key = elements[i].getAttribute('data-i18n');
        elements[i].textContent = t(key);
    }

    // Apply translated placeholders for input fields.
    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < placeholders.length; j++) {
        var placeholderKey = placeholders[j].getAttribute('data-i18n-placeholder');
        placeholders[j].setAttribute('placeholder', t(placeholderKey));
    }

    // Re-render preset labels after language switch.
    renderCsvPresetOptions(csvPresetSelect ? csvPresetSelect.value : '');
    document.documentElement.lang = currentLang;
}

/**
 * Clear all tracking data
 */
function clearAllData() {
    if (confirm(t('confirmClear') || 'Are you sure you want to delete all tracking data?')) {
        sessions = [];
        currentSession = null;
        sessionStartTime = null;
        lastProjectPath = '';
        saveData();
        showNoProject();
        hideSettings();
    }
}

/**
 * Clear all data with confirmation (standalone button version)
 */
function clearAllDataWithConfirmation() {
    if (confirm(t('confirmClear') || 'Are you sure you want to delete all tracking data?')) {
        sessions = [];
        saveData();
        console.log('All tracking data cleared');
    }
}

/**
 * Idle detection - shows alert when project is open but not being tracked
 */
var idleStartTime = null;
var idleAlertShown = false; // Flag to prevent repeated alerts

function startIdleDetection() {
    // Check every 30 seconds
    idleCheckInterval = setInterval(checkIdleState, IDLE_CHECK_INTERVAL_MS);
}

function checkIdleState() {
    csInterface.evalScript('TimeTracker_isProjectOpen()', function (result) {
        var projectOpen = result === 'true';

        if (projectOpen && !currentSession) {
            // Project is open but not being tracked - start idle timer
            if (!idleStartTime) {
                idleStartTime = new Date();
                idleAlertShown = false; // Reset flag when idle timer starts
            }

            // Check if idle timeout exceeded
            var idleMs = new Date().getTime() - idleStartTime.getTime();
            var timeoutMs = settings.idleTimeout * 60 * 1000; // Convert minutes to ms

            console.log('Idle time:', Math.floor(idleMs / 1000), 's, timeout:', settings.idleTimeout, 'min');

            if (idleMs >= timeoutMs && !idleAlertShown) {
                showIdleAlert();
                idleAlertShown = true; // Only show once
            }
        } else {
            // Reset idle timer when tracking or no project
            idleStartTime = null;
            idleAlertShown = false;
            idleAlert.classList.remove('show');
        }
    });
}

function showIdleAlert() {
    idleAlert.classList.add('show');
}

function dismissIdleAlert() {
    idleAlert.classList.remove('show');
    idleAlertShown = false;
    // Try to detect project again
    checkProject();
}

/**
 * Activity detection - auto-pause when no activity in Premiere
 */
function startActivityDetection() {
    // Reset activity time when starting
    lastActivityTime = new Date();
    lastProjectState = '';

    // Check activity every 10 seconds
    activityCheckInterval = setInterval(checkActivity, ACTIVITY_CHECK_INTERVAL_MS);
}

function checkActivity() {
    // Only check if auto-pause is enabled and we're tracking
    if (!settings.autoPause || !currentSession) {
        return;
    }

    csInterface.evalScript('TimeTracker_getProjectState()', function (result) {
        console.log('Activity check - state:', result);

        if (result && result !== lastProjectState) {
            // State changed - there's activity
            lastProjectState = result;
            lastActivityTime = new Date();
            console.log('Activity detected, timer reset');
        } else {
            // No change - check if timeout exceeded
            var inactiveMs = new Date().getTime() - lastActivityTime.getTime();
            var timeoutMs = settings.idleTimeout * 60 * 1000;

            console.log('Inactive for:', Math.floor(inactiveMs / 1000), 's');

            if (inactiveMs >= timeoutMs) {
                // Auto-pause: end the session
                console.log('Auto-pause: no activity for', settings.idleTimeout, 'minutes');
                endSession();
                lastProjectPath = '';
                lastProjectInfo = null;
                showNoProject();
                alert('⏸️ Auto-pause: Aucune activité depuis ' + settings.idleTimeout + ' minutes.\nLe chrono a été arrêté.');
            }
        }
    });
}

/**
 * Handle panel visibility changes
 */
function onPanelVisibilityChange(event) {
    if (event.data === 'false') {
        // Panel is closing, end current session
        if (currentSession) {
            endSession();
        }
    }
}

/**
 * Logging system
 */
function log(message, level) {
    level = level || 'info';
    var timestamp = new Date().toLocaleTimeString();
    var logEntry = {
        time: timestamp,
        message: message,
        level: level
    };
    logEntries.push(logEntry);

    // Keep only last 100 entries
    if (logEntries.length > 100) {
        logEntries.shift();
    }

    // Also log to console
    if (level === 'error') {
        console.error('[TT]', message);
    } else if (level === 'warn') {
        console.warn('[TT]', message);
    } else {
        console.log('[TT]', message);
    }

    // Update UI if visible
    if (logContent && settings.showLogs) {
        renderLogs();
    }
}

function renderLogs() {
    if (!logContent) return;

    var html = logEntries.map(function (entry) {
        return '<div class="log-entry ' + entry.level + '">' +
            '<span class="log-time">' + entry.time + '</span>' +
            entry.message +
            '</div>';
    }).join('');

    logContent.innerHTML = html;
    logContent.scrollTop = logContent.scrollHeight;
}

function toggleLogPanel() {
    settings.showLogs = showLogsCheckbox.checked;
    saveSettings();

    if (settings.showLogs) {
        logPanel.classList.add('show');
        renderLogs();
        log('Log panel enabled');
    } else {
        logPanel.classList.remove('show');
    }
}

function copyLogs() {
    var text = logEntries.map(function (entry) {
        return entry.time + ' [' + entry.level.toUpperCase() + '] ' + entry.message;
    }).join('\n');

    // Copy to clipboard
    var textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    log('Logs copied to clipboard (' + logEntries.length + ' entries)');
}

function clearLogs() {
    logEntries = [];
    if (logContent) {
        logContent.innerHTML = '';
    }
    log('Logs cleared');
}

/**
 * CSV Column Configuration
 */
var CSV_COLUMN_TYPES = [
    { value: 'empty', label: 'Empty' },
    { value: 'dateShort', label: 'Date (M/D/YYYY)' },
    { value: 'timeOpen', label: 'Time Open' },
    { value: 'timeClose', label: 'Time Close' },
    { value: 'duration', label: 'Duration (H:MM)' },
    { value: 'platform', label: 'Platform' },
    { value: 'projectName', label: 'Project Name' },
    { value: 'projectFile', label: 'Project File' },
    { value: 'projectPath', label: 'Project Path' },
    { value: 'fixedText', label: 'Fixed Text' }
];

function toggleCsvConfig() {
    var content = document.getElementById('csvConfigContent');
    if (content) {
        content.classList.toggle('show');
    }
}

function renderCsvColumnsUI() {
    var container = document.getElementById('csvColumnsContainer');
    if (!container) return;

    // Always normalize before rendering so every row has a valid config object.
    settings.csvColumns = normalizeCsvColumnsConfig(settings.csvColumns);

    var letters = 'ABCDEFGHIJKLMN'.split('');
    var html = '';

    for (var i = 0; i < CSV_COLUMN_COUNT; i++) {
        var col = settings.csvColumns[i] || { type: 'empty', value: '' };

        html += '<div class="csv-column-row">';
        html += '<span class="csv-column-letter">' + letters[i] + '</span>';
        html += '<select class="csv-column-select" data-col="' + i + '">';

        for (var j = 0; j < CSV_COLUMN_TYPES.length; j++) {
            var opt = CSV_COLUMN_TYPES[j];
            var selected = col.type === opt.value ? ' selected' : '';
            html += '<option value="' + opt.value + '"' + selected + '>' + opt.label + '</option>';
        }

        html += '</select>';
        html += '<input type="text" class="csv-column-value' + (col.type === 'fixedText' ? ' show' : '') + '" ';
        html += 'data-col="' + i + '" value="' + (col.value || '') + '" placeholder="Text...">';
        html += '</div>';
    }

    container.innerHTML = html;

    // Add event listeners
    var selects = container.querySelectorAll('.csv-column-select');
    var inputs = container.querySelectorAll('.csv-column-value');

    selects.forEach(function (select) {
        select.addEventListener('change', onCsvColumnTypeChange);
    });

    inputs.forEach(function (input) {
        input.addEventListener('change', onCsvColumnValueChange);
    });
}

function onCsvColumnTypeChange(e) {
    var colIndex = parseInt(e.target.getAttribute('data-col'));
    var newType = e.target.value;

    settings.csvColumns[colIndex].type = newType;

    // Show/hide text input
    var input = e.target.parentElement.querySelector('.csv-column-value');
    if (input) {
        if (newType === 'fixedText') {
            input.classList.add('show');
        } else {
            input.classList.remove('show');
            settings.csvColumns[colIndex].value = '';
        }
    }

    saveSettings();
}

function onCsvColumnValueChange(e) {
    var colIndex = parseInt(e.target.getAttribute('data-col'));
    settings.csvColumns[colIndex].value = e.target.value;
    saveSettings();
}

// Normalize imported/saved CSV column configs to exactly 14 safe entries.
function normalizeCsvColumnsConfig(columns) {
    var normalized = [];
    var allowedTypes = CSV_COLUMN_TYPES.map(function (type) {
        return type.value;
    });

    for (var i = 0; i < CSV_COLUMN_COUNT; i++) {
        var rawCol = Array.isArray(columns) && columns[i] ? columns[i] : {};
        var type = typeof rawCol.type === 'string' ? rawCol.type : 'empty';

        if (allowedTypes.indexOf(type) === -1) {
            type = 'empty';
        }

        normalized.push({
            type: type,
            value: type === 'fixedText' && typeof rawCol.value === 'string' ? rawCol.value : ''
        });
    }

    return normalized;
}

// Normalize preset collection and keep only valid named presets.
function normalizeCsvPresets(presets) {
    var normalizedPresets = {};
    if (!presets || typeof presets !== 'object') {
        return normalizedPresets;
    }

    Object.keys(presets).forEach(function (presetName) {
        var trimmedName = (presetName || '').trim();
        if (!trimmedName) {
            return;
        }

        // Each preset stores a normalized clone of the CSV column configuration.
        normalizedPresets[trimmedName] = normalizeCsvColumnsConfig(presets[presetName]);
    });

    return normalizedPresets;
}

// Build preset dropdown options sorted alphabetically.
function renderCsvPresetOptions(selectedName) {
    if (!csvPresetSelect) {
        return;
    }

    var presetNames = Object.keys(settings.csvColumnPresets || {}).sort(function (a, b) {
        return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
    var html = '<option value="">' + (t('settings.selectCsvPreset') || 'Load preset...') + '</option>';

    presetNames.forEach(function (presetName) {
        var selected = presetName === selectedName ? ' selected' : '';
        html += '<option value="' + escapeHtml(presetName) + '"' + selected + '>' + escapeHtml(presetName) + '</option>';
    });

    csvPresetSelect.innerHTML = html;
}

// Save current CSV mapping under a user-provided preset name.
function saveCsvPreset() {
    if (!csvPresetNameInput) {
        return;
    }

    var presetName = (csvPresetNameInput.value || '').trim();
    if (!presetName) {
        alert(t('csvPresetNameRequired') || 'Please enter a preset name.');
        return;
    }

    // Ask confirmation when overwriting an existing preset with the same name.
    if (settings.csvColumnPresets[presetName]) {
        var overwriteMessage = (t('csvPresetOverwriteConfirm') || 'A preset with this name already exists. Overwrite it?') + '\n\n' + presetName;
        if (!confirm(overwriteMessage)) {
            return;
        }
    }

    settings.csvColumns = normalizeCsvColumnsConfig(settings.csvColumns);
    settings.csvColumnPresets[presetName] = settings.csvColumns.map(function (col) {
        return { type: col.type, value: col.value };
    });
    settings.csvColumnPresets = normalizeCsvPresets(settings.csvColumnPresets);

    saveSettings();
    renderCsvPresetOptions(presetName);
    csvPresetNameInput.value = '';
    log('CSV preset saved: ' + presetName);
    alert((t('csvPresetSaveSuccess') || 'CSV preset saved: ') + presetName);
}

// Apply selected preset to current CSV table configuration.
function onCsvPresetSelectChange(e) {
    var presetName = e.target.value;
    if (!presetName || !settings.csvColumnPresets[presetName]) {
        return;
    }

    settings.csvColumns = normalizeCsvColumnsConfig(settings.csvColumnPresets[presetName]);
    renderCsvColumnsUI();
    saveSettings();
    log('CSV preset applied: ' + presetName);
}

// Escape user-provided text before injecting into HTML option labels.
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Export current CSV table configuration as a JSON file.
function exportCsvConfig() {
    try {
        var fs = require('fs');
        var os = require('os');
        var path = require('path');

        settings.csvColumns = normalizeCsvColumnsConfig(settings.csvColumns);
        var filename = 'TimeTracker_CSV_Config_' + formatDateForFilename(new Date()) + '.json';
        var desktopPath = path.join(os.homedir(), 'Desktop');
        var filePath = path.join(desktopPath, filename);
        var payload = {
            version: 1,
            exportedAt: new Date().toISOString(),
            csvColumns: settings.csvColumns
        };

        fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
        log('CSV configuration exported to: ' + filePath);
        alert((t('csvConfigExportSuccess') || 'CSV configuration exported!') + '\n\n' + filePath);
    } catch (e) {
        console.error('Error exporting CSV configuration:', e);
        log('CSV config export failed: ' + e.message, 'error');
        alert((t('csvConfigExportError') || 'Failed to export CSV configuration: ') + e.message);
    }
}

// Trigger hidden file input so user can pick a config JSON from disk.
function triggerCsvConfigImport() {
    if (!csvConfigFileInput) return;
    csvConfigFileInput.value = '';
    csvConfigFileInput.click();
}

// Parse selected config file and apply CSV table configuration.
function onCsvConfigFileSelected(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;

    var reader = new FileReader();

    reader.onload = function (loadEvent) {
        try {
            var content = loadEvent.target.result;
            var parsed = JSON.parse(content);
            var importedColumns = Array.isArray(parsed) ? parsed : parsed.csvColumns;

            if (!Array.isArray(importedColumns)) {
                throw new Error('Missing csvColumns array');
            }

            settings.csvColumns = normalizeCsvColumnsConfig(importedColumns);
            renderCsvColumnsUI();
            saveSettings();

            log('CSV configuration imported from: ' + file.name);
            alert(t('csvConfigImportSuccess') || 'CSV configuration imported successfully.');
        } catch (e) {
            console.error('Error importing CSV configuration:', e);
            log('CSV config import failed: ' + e.message, 'error');
            alert((t('csvConfigImportError') || 'Failed to import CSV configuration: ') + e.message);
        }
    };

    reader.onerror = function () {
        log('CSV config import failed: file read error', 'error');
        alert(t('csvConfigImportReadError') || 'Unable to read selected configuration file.');
    };

    reader.readAsText(file);
}

function getColumnValue(session, colConfig, openDate, closeDate) {
    switch (colConfig.type) {
        case 'empty':
            return '';
        case 'dateShort':
            return formatDateShort(openDate);
        case 'timeOpen':
            return formatTime12h(openDate);
        case 'timeClose':
            return formatTime12h(closeDate);
        case 'duration':
            return formatDurationExport(session.duration);
        case 'platform':
            return navigator.platform.indexOf('Mac') !== -1 ? 'MacOS' : 'Windows';
        case 'projectName':
            return session.projectName || session.projectFile || '';
        case 'projectFile':
            return session.projectFile || '';
        case 'projectPath':
            return session.projectPath || '';
        case 'fixedText':
            return colConfig.value || '';
        default:
            return '';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
