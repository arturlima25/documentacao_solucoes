# 🎯 Solution Hub - Power Platform Portfolio

> **A modern, interactive documentation system for Power Platform solutions including Power Automate Flows, Power Apps, Data Pipelines, and Dashboards.**

[![Live Demo](https://img.shields.io/badge/demo-live-blue.svg)](https://your-username.github.io/solution-hub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

![Solution Hub Preview](https://via.placeholder.com/800x400/0078D4/FFFFFF?text=Solution+Hub+Preview)

## ✨ Features

- **📱 Multi-Tab Interface** - Organize Flows, Apps, Pipelines, and Dashboards separately
- **🎨 Modern Design** - Clean, professional UI with Microsoft-inspired color scheme
- **🔍 Advanced Filtering** - Filter by project, trigger type, and search text
- **📊 Statistics Dashboard** - Visual insights into your solution portfolio
- **💾 Data Persistence** - Local storage + JSON file export/import
- **🔄 Dependency Tracking** - Manage relationships between flows
- **📱 Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **⚡ No Backend Required** - Runs entirely in the browser (GitHub Pages ready)
- **🎯 Easy Customization** - Simple JSON data structure

## 🚀 Quick Start

### Option 1: Use as Template (Recommended)

1. Click the **"Use this template"** button at the top of this repository
2. Name your new repository (e.g., `my-power-platform-portfolio`)
3. Clone your new repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/my-power-platform-portfolio.git
   cd my-power-platform-portfolio
   ```
4. Open `index.html` in your browser or deploy to GitHub Pages

### Option 2: Fork This Repository

1. Fork this repository
2. Enable GitHub Pages in Settings → Pages → Source: `main` branch
3. Access your portfolio at `https://YOUR-USERNAME.github.io/solution-hub`

### Option 3: Download and Run Locally

1. Download this repository as ZIP
2. Extract the files
3. Open `index.html` in your browser
4. Start documenting your solutions!

## 📂 Project Structure

```
solution-hub/
├── index.html           # Main HTML file
├── styles.css           # Styling and design system
├── script.js            # Application logic
├── flows-data.json      # Your data (CUSTOMIZE THIS!)
├── README.md            # This file
├── LICENSE              # MIT License
└── .gitignore          # Git ignore rules
```

## 🎨 Customization

### 1. Update Your Data

Edit `flows-data.json` to add your own solutions:

```json
{
  "flows": [
    {
      "id": "flow-1001",
      "nome": "Your Flow Name",
      "projeto": "Project Name",
      "gatilho": "Agendado",
      "descricao": "What does this flow do?",
      "status": "ativo",
      "dependencias": [],
      "ultima_atualizacao": "2026-02-14"
    }
  ],
  "aplicativos": [...],
  "pipelines": [...],
  "dashboards": [...],
  "projetos": ["Project 1", "Project 2"]
}
```

### 2. Change Colors

Edit `:root` variables in `styles.css`:

```css
:root {
  --primary-blue: #0078D4;        /* Your primary color */
  --primary-blue-darker: #005a9e; /* Darker shade */
  --primary-blue-light: #2b88d8;  /* Lighter shade */
}
```

### 3. Update Branding

- Change the title in `index.html` (line 6 and 15)
- Update the favicon (add your own icon file)
- Modify the header text to match your brand

## 📊 Data Structure

### Power Automate Flows
```json
{
  "id": "unique-id",
  "nome": "Flow Name",
  "projeto": "Project",
  "gatilho": "Agendado|Manual|Webhook",
  "descricao": "Description",
  "status": "ativo|inativo",
  "dependencias": ["flow-id-1", "flow-id-2"],
  "ultima_atualizacao": "YYYY-MM-DD"
}
```

### Applications
```json
{
  "id": "unique-id",
  "nome": "App Name",
  "projeto": "Project",
  "link": "https://app-url.com",
  "descricao": "What does this app do?",
  "status": "ativo|inativo",
  "ultima_atualizacao": "YYYY-MM-DD"
}
```

### Data Pipelines
```json
{
  "id": "unique-id",
  "nome": "Pipeline Name",
  "projeto": "Project",
  "periodicidade": "Daily at 6:00 AM",
  "descricao": "Pipeline description",
  "status": "ativo|inativo",
  "repo_link": "https://github.com/repo",
  "ultima_atualizacao": "YYYY-MM-DD"
}
```

### Dashboards
```json
{
  "id": "unique-id",
  "nome": "Dashboard Name",
  "projeto": "Project",
  "tipo": "Power BI|Tableau|Excel Dashboard",
  "link": "https://dashboard-url.com",
  "descricao": "Dashboard description",
  "frequencia": "Real-time|Hourly|Daily",
  "status": "ativo|inativo",
  "ultima_atualizacao": "YYYY-MM-DD"
}
```

## 🎯 Use Cases

- **Portfolio Showcase** - Display your Power Platform expertise to potential employers
- **Team Documentation** - Keep track of organizational automation solutions
- **Learning Repository** - Document your learning journey with Power Platform
- **Client Presentations** - Professional way to present your solutions
- **Knowledge Base** - Centralized documentation for your automation portfolio

## 🛠️ Technologies

- **Pure HTML/CSS/JavaScript** - No frameworks, no build process
- **Local Storage API** - Browser-based data persistence
- **CSS Grid & Flexbox** - Modern, responsive layouts
- **ES6+ JavaScript** - Clean, modern JavaScript code

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Ideas for Contributions

- 🌍 Multi-language support
- 🌙 Dark mode toggle
- 📤 Export to PDF/Excel
- 📊 More chart types in statistics
- 🔐 Optional password protection
- 📱 PWA (Progressive Web App) support

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern documentation practices
- Design influenced by Microsoft Fluent Design System
- Built with ❤️ for the Power Platform community

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/your-username/solution-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/solution-hub/discussions)
- **LinkedIn**: [Your LinkedIn Profile](#)

---

**⭐ If you find this useful, please consider giving it a star!**

Made with 💙 by [Your Name](https://github.com/your-username)
