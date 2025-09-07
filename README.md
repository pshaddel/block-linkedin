# 🚫 Block LinkedIn

| Distracted | Focused |
|:---:|:---:|
| <img src="assets/distracted.png" alt="Distracted" width="280" /> | <img src="assets/focused.png" alt="Concentration Mode" width="280" /> |

A Chrome extension designed to help you stay focused and avoid LinkedIn distractions during work hours. Take control of your productivity and maintain concentration on what matters most.

## ✨ Features

- 🔒 **Smart Blocking**: Automatically blocks LinkedIn to prevent mindless scrolling
- ⚡ **One-Click Toggle**: Easy enable/disable functionality through the popup interface
- 🎯 **Distraction-Free**: Helps maintain focus during important work sessions
- 🔧 **Customizable**: Adjust settings to match your workflow needs

## 🚀 Getting Started

### Development

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build from `build/chrome-mv3-dev`.

### Project Structure

- `popup.tsx` - Extension popup interface for toggling blocking
- `content.ts` - Content script that handles LinkedIn page blocking
- `background.ts` - Service worker for extension lifecycle management
- `assets/` - Icons and visual assets for the extension

## 🔧 Installation

1. Clone this repository
2. Run `pnpm install` to install dependencies
3. Run `pnpm dev` for development or `pnpm build` for production
4. Load the `build/chrome-mv3-dev` (or `chrome-mv3-prod`) folder in Chrome's extension manager

## 📦 Building for Production

Create a production-ready extension bundle:

```bash
pnpm build
# or
npm run build
```

This creates an optimized bundle in `build/chrome-mv3-prod` ready for distribution.

## 🎨 Visual States

The extension dynamically updates its icon to reflect the current blocking status:

- 🔴 **Blocking Active**: LinkedIn access is restricted
- 🟢 **Blocking Disabled**: Normal browsing allowed

## 📱 Publishing

Ready to publish your extension? Use the built-in [bpp](https://bpp.browser.market) GitHub action for automated submission to browser stores. Follow the [Plasmo deployment guide](https://docs.plasmo.com/framework/workflows/submit) for detailed instructions.

---

Built with ❤️ using [Plasmo Framework](https://docs.plasmo.com/) - The modern browser extension development framework.
