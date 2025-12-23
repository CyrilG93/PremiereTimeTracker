/**
 * Time Tracker - Premiere Pro Extension
 * Tracks time spent on projects and exports to CSV
 * 
 * @author CyrilG93
 * @version 1.0.0
 */

// CSInterface wrapper for communication with Premiere Pro
var csInterface = new CSInterface();

// Storage key
var STORAGE_KEY = 'timeTracker_data';

// DOM elements
var timeDisplay, projectName, totalTime, exportBtn, settingsBtn, settingsPanel, closeSettingsBtn;
var mergeEntriesCheckbox, idleTimeoutInput, languageSelect, clearDataBtn, clearAfterExportBtn;
var idleAlert, dismissIdleBtn;

// State
var currentSession = null;
var sessions = [];
var settings = {
    mergeEntries: false,
    idleTimeout: 30,
    language: 'en'
};
var translations = {};
var currentLang = 'en';

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
var IDLE_CHECK_INTERVAL_MS = 60000;

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

    // Load saved data
    loadData();

    // Load translations
    loadTranslations(settings.language, function () {
        applyTranslations();
    });

    // Event listeners
    exportBtn.addEventListener('click', exportToCSV);
    settingsBtn.addEventListener('click', showSettings);
    closeSettingsBtn.addEventListener('click', hideSettings);
    mergeEntriesCheckbox.addEventListener('change', saveSettings);
    idleTimeoutInput.addEventListener('change', saveSettings);
    languageSelect.addEventListener('change', onLanguageChange);
    clearDataBtn.addEventListener('click', clearAllData);
    if (clearAfterExportBtn) {
        clearAfterExportBtn.addEventListener('click', clearAllDataWithConfirmation);
    }
    dismissIdleBtn.addEventListener('click', dismissIdleAlert);

    // Start polling for project changes
    startTracking();

    // Start idle detection
    startIdleDetection();

    // Handle panel close
    csInterface.addEventListener('com.adobe.csxs.events.WindowVisibilityChanged', onPanelVisibilityChange);

    console.log('Time Tracker initialized');
}

/**
 * Load saved data from localStorage
 */
function loadData() {
    try {
        var data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            var parsed = JSON.parse(data);
            sessions = parsed.sessions || [];
            settings = Object.assign(settings, parsed.settings || {});
        }
        // Apply settings to UI
        mergeEntriesCheckbox.checked = settings.mergeEntries;
        idleTimeoutInput.value = settings.idleTimeout;
        languageSelect.value = settings.language;
        currentLang = settings.language;
    } catch (e) {
        console.error('Error loading data:', e);
    }
}

/**
 * Save data to localStorage
 */
function saveData() {
    try {
        var data = {
            sessions: sessions,
            settings: settings
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

/**
 * Save settings
 */
function saveSettings() {
    settings.mergeEntries = mergeEntriesCheckbox.checked;
    settings.idleTimeout = parseInt(idleTimeoutInput.value, 10) || 30;
    settings.language = languageSelect.value;
    saveData();
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
 */
function checkProject() {
    csInterface.evalScript('getProjectInfo()', function (result) {
        try {
            var info = JSON.parse(result);

            if (info.isOpen && info.path) {
                // Project is open
                lastProjectInfo = info;

                if (info.path !== lastProjectPath) {
                    // New project or first detection
                    if (currentSession) {
                        // Close previous session
                        endSession();
                    }
                    // Start new session
                    startSession(info);
                    lastProjectPath = info.path;
                }

                // Update display
                updateDisplay(info);

            } else {
                // No project open
                if (currentSession) {
                    endSession();
                }
                lastProjectPath = '';
                showNoProject();
            }
        } catch (e) {
            console.error('Error parsing project info:', e);
        }
    });
}

/**
 * Start a new tracking session
 */
function startSession(info) {
    sessionStartTime = new Date();
    currentSession = {
        id: generateId(),
        projectFile: info.fileName,
        projectName: info.folderName,
        projectPath: info.fullLocation,
        openTime: sessionStartTime.toISOString(),
        closeTime: null,
        duration: 0
    };

    console.log('Session started:', currentSession.projectName);
}

/**
 * End the current session
 */
function endSession() {
    if (!currentSession) return;

    var endTime = new Date();
    currentSession.closeTime = endTime.toISOString();
    currentSession.duration = endTime.getTime() - sessionStartTime.getTime();

    // Add to sessions array
    sessions.push(currentSession);
    saveData();

    console.log('Session ended:', currentSession.projectName, formatDuration(currentSession.duration));

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
 * Format duration for export (Xh Ym)
 */
function formatDurationExport(ms) {
    var totalMinutes = Math.floor(ms / 60000);
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;

    if (hours > 0) {
        return hours + 'h ' + minutes + 'm';
    }
    return minutes + 'm';
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

    // Include current session if active
    var exportSessions = sessions.slice();
    if (currentSession) {
        var tempSession = Object.assign({}, currentSession);
        tempSession.closeTime = new Date().toISOString();
        tempSession.duration = new Date().getTime() - sessionStartTime.getTime();
        exportSessions.push(tempSession);
    }

    console.log('Sessions to export:', exportSessions.length);

    // Optionally merge entries
    if (settings.mergeEntries) {
        exportSessions = mergeSessionsByDay(exportSessions);
        console.log('After merge:', exportSessions.length);
    }

    // Generate CSV content
    var csv = generateCSV(exportSessions);

    // Download file with session count in filename
    var filename = 'TimeTracker_' + exportSessions.length + 'sessions_' + formatDateForFilename(new Date()) + '.csv';
    downloadCSV(csv, filename, exportSessions.length);
}

/**
 * Merge sessions by project and day
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
            // Update close time to latest
            if (session.closeTime > merged[key].closeTime) {
                merged[key].closeTime = session.closeTime;
            }
        }
    });

    return Object.values(merged);
}

/**
 * Generate CSV content with specified format
 */
function generateCSV(sessions) {
    var lines = [];

    // Header row
    lines.push('A,B,C,D,E,F,G,H,I,J,K,L,M,N');

    sessions.forEach(function (session) {
        var openDate = new Date(session.openTime);
        var closeDate = session.closeTime ? new Date(session.closeTime) : new Date();

        var row = [
            '',                                          // A: Empty
            formatDateShort(openDate),                   // B: Month (1/6/2025)
            formatDateShort(openDate),                   // C: Day (1/6/2025)
            formatTime12h(openDate),                     // D: Open time (12:00 AM)
            formatTime12h(closeDate),                    // E: Close time (12:00 AM)
            formatDurationExport(session.duration),      // F: Duration (Xh Ym)
            '',                                          // G: Empty
            'Editing AV room',                           // H: Fixed text
            'Editing',                                   // I: Fixed text
            'Confirmed',                                 // J: Fixed text
            '',                                          // K: Empty
            '',                                          // L: Empty
            session.projectName || session.projectFile,  // M: Project name
            session.projectPath                          // N: Location
        ];

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
 * Format date for filename
 */
function formatDateForFilename(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
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
 * Load translations from JSON file
 */
function loadTranslations(lang, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'lang/' + lang + '.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    translations = JSON.parse(xhr.responseText);
                    currentLang = lang;
                } catch (e) {
                    console.error('Error parsing translations:', e);
                }
            }
            if (callback) callback();
        }
    };
    xhr.send();
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
 * Idle detection
 */
function startIdleDetection() {
    idleCheckInterval = setInterval(checkIdleState, IDLE_CHECK_INTERVAL_MS);
}

function checkIdleState() {
    // Check if project is open but no active session
    csInterface.evalScript('isProjectOpen()', function (result) {
        if (result === 'true' && !currentSession) {
            // Project open but not tracked - check idle timeout
            showIdleAlert();
        }
    });
}

function showIdleAlert() {
    idleAlert.classList.add('show');
}

function dismissIdleAlert() {
    idleAlert.classList.remove('show');
    // Try to detect project again
    checkProject();
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
