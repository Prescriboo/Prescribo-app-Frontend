# App Icons

These icon files are used by electron-builder to create the packaged app icons:

- `icon.icns` - macOS icon (generated from app_icon_512.png)
- `icon.ico` - Windows icon (generated from app_icon_512.png)
- `icon.png` - Linux icon and runtime window icon (512x512)

The window icon is also referenced in `electron/main.js` for the main window,
splash screen, and dialog boxes.
