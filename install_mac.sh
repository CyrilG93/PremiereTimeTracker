#!/bin/bash

# ============================================================================
# Time Tracker - Installation Script for macOS
# ============================================================================
# This script installs the Time Tracker extension for Adobe Premiere Pro
# ============================================================================

echo ""
echo "========================================"
echo "Time Tracker - Installation macOS"
echo "========================================"
echo ""

# Extension details
EXTENSION_NAME="PremiereTimeTracker"
EXTENSION_ID="com.cyrilg93.timetracker"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# CEP extension directory for macOS
CEP_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions"
INSTALL_DIR="$CEP_DIR/$EXTENSION_NAME"

echo "Source: $SCRIPT_DIR"
echo "Target: $INSTALL_DIR"
echo ""

# Create CEP directory if it doesn't exist
if [ ! -d "$CEP_DIR" ]; then
    echo "Creating CEP extensions directory..."
    mkdir -p "$CEP_DIR"
fi

# Remove existing installation
if [ -d "$INSTALL_DIR" ]; then
    echo "Removing existing installation..."
    rm -rf "$INSTALL_DIR"
fi

# Copy extension files
echo "Installing extension..."
cp -R "$SCRIPT_DIR" "$INSTALL_DIR"

# Remove installation scripts from installed directory
rm -f "$INSTALL_DIR/install_mac.sh"
rm -f "$INSTALL_DIR/install_windows.bat"

# Set permissions
chmod -R 755 "$INSTALL_DIR"

# Enable debug mode for CEP extensions
echo "Enabling debug mode..."
defaults write com.adobe.CSXS.11 PlayerDebugMode 1

echo ""
echo "✅ Installation complete!"
echo ""
echo "========================================"
echo "Next steps:"
echo "========================================"
echo "1. Restart Adobe Premiere Pro"
echo "2. Go to Window > Extensions > Time Tracker"
echo ""
echo "To uninstall:"
echo "  rm -rf \"$INSTALL_DIR\""
echo ""
