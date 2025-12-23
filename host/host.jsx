/**
 * Premiere Pro ExtendScript for Time Tracker
 * Provides access to project information
 * 
 * @author CyrilG93
 * @version 1.0.0
 */

/**
 * Get current project information
 * @returns {string} JSON string with project info
 */
function getProjectInfo() {
    try {
        // Multiple ways to check if project is open
        var hasProject = false;
        var projectPath = "";

        // Method 1: Check app.project.path
        if (app.project && app.project.path && app.project.path.length > 0) {
            hasProject = true;
            projectPath = app.project.path;
        }
        // Method 2: Check app.project.name (might work when path doesn't)
        else if (app.project && app.project.name && app.project.name.length > 0) {
            hasProject = true;
            // Try to get path from documentID or other properties
            if (app.project.documentID) {
                projectPath = app.project.name;
            }
        }
        // Method 3: Check active sequence's project
        else if (app.project && app.project.activeSequence) {
            hasProject = true;
            projectPath = app.project.name || "Unknown";
        }

        if (!hasProject) {
            return JSON.stringify({
                isOpen: false,
                path: "",
                fileName: "",
                folderName: "",
                fullLocation: "",
                debug: "No project detected via path/name/sequence"
            });
        }

        var projectPath = app.project.path;

        // Determine path separator based on OS
        var separator = "/";
        if ($.os.indexOf("Windows") !== -1) {
            separator = "\\";
        }

        // Normalize path separators
        var normalizedPath = projectPath.replace(/\\/g, separator).replace(/\//g, separator);

        // Split path into parts
        var pathParts = normalizedPath.split(separator);

        // Remove empty parts
        var cleanParts = [];
        for (var i = 0; i < pathParts.length; i++) {
            if (pathParts[i] && pathParts[i].length > 0) {
                cleanParts.push(pathParts[i]);
            }
        }

        // Get file name (last part)
        var fileName = cleanParts[cleanParts.length - 1];

        // Get project folder name (2 levels up from file: NOMProjet/Projet/projet.prproj)
        // So we need the folder 2 levels up from the file
        var folderName = "";
        if (cleanParts.length >= 3) {
            folderName = cleanParts[cleanParts.length - 3];
        } else if (cleanParts.length >= 2) {
            folderName = cleanParts[cleanParts.length - 2];
        }

        // Get full location (partition + project path)
        // Example: EDITING 2025/12 DECEMBER/12 19 Recording Loic Tassel
        // Skip: Volumes on Mac, drive letter on Windows
        var fullLocation = "";
        if (cleanParts.length >= 3) {
            var startIndex = 0;

            // Skip "Volumes" on Mac
            if ($.os.indexOf("Windows") === -1 && cleanParts[0] === "Volumes") {
                startIndex = 1;
            }
            // Skip drive letter on Windows (e.g., "C:")
            if ($.os.indexOf("Windows") !== -1 && cleanParts[0].indexOf(":") !== -1) {
                startIndex = 1;
            }

            // Take from startIndex to 2 levels before the file (exclude PROJET folder and .prproj file)
            var locationParts = [];
            for (var j = startIndex; j < cleanParts.length - 2; j++) {
                locationParts.push(cleanParts[j]);
            }
            fullLocation = locationParts.join("/");
        }

        return JSON.stringify({
            isOpen: true,
            path: projectPath,
            fileName: fileName,
            folderName: folderName,
            fullLocation: fullLocation
        });

    } catch (e) {
        return JSON.stringify({
            isOpen: false,
            path: "",
            fileName: "",
            folderName: "",
            fullLocation: "",
            error: e.toString()
        });
    }
}

/**
 * Check if a project is currently open
 * @returns {string} "true" or "false"
 */
function isProjectOpen() {
    try {
        if (app.project && app.project.path && app.project.path.length > 0) {
            return "true";
        }
        return "false";
    } catch (e) {
        return "false";
    }
}

/**
 * Get the project file path only
 * @returns {string} Project path or empty string
 */
function getProjectPath() {
    try {
        if (app.project && app.project.path) {
            return app.project.path;
        }
        return "";
    } catch (e) {
        return "";
    }
}
