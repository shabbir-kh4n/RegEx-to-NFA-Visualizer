# RegEx to NFA Visualizer

A comprehensive web-based tool for visualizing the conversion of Regular Expressions to Non-deterministic Finite Automata (NFA) using Thompson's Construction algorithm. This educational tool provides step-by-step visualization, interactive animation, and detailed statistics to help students and developers understand automata theory.

![RegEx to NFA Visualizer](https://img.shields.io/badge/Status-Active-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🌟 Features

### Algorithm
- **Thompson's Construction**: Automatic conversion algorithm that transforms regular expressions into NFAs using proven Thompson's Construction rules
- **Step-by-step visualization**: Watch the conversion process unfold with detailed explanations

### Analytics
- **Real-Time Statistics**: Monitor NFA complexity with live tracking of:
  - Number of states
  - Number of transitions
  - Alphabet size
  - Complexity metrics

### Interactive
- **Interactive Animation**: Step-by-step string testing with:
  - Playback controls (play, pause, step forward/backward)
  - Adjustable animation speed (slow, medium, fast)
  - Visual highlighting of active states and transitions

### Educational
- **Conversion Steps**: Detailed breakdown of the regex-to-NFA conversion process including:
  - Preprocessing
  - Postfix conversion
  - Thompson's rules application

### Export
- **Save & Share**: 
  - Download NFA diagrams as PNG images with white background
  - Copy regex patterns to clipboard for easy sharing

### Quick Start
- **Example Templates**: Pre-built regex examples for common patterns:
  - `a*b`
  - `(a|b)*`
  - `ab*c`
  - `(a|b)*abb`
  - `a(b|c)*`

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No installation required!

### Usage

1. **Open the Application**
   - Simply open `index.html` in your web browser
   - Or host it on any web server

2. **Enter a Regular Expression**
   - Type your regex in the input field (e.g., `a*b`, `(a|b)*`)
   - Supported operators:
     - `*` - Kleene Star (zero or more occurrences)
     - `|` - Union/OR operator
     - `()` - Grouping
     - `abc` - Concatenation

3. **Generate NFA**
   - Click the "Generate NFA" button
   - View the generated NFA graph
   - Check the conversion steps in the left sidebar
   - Monitor statistics in the dashboard

4. **Test Strings**
   - Enter a test string in the test input field
   - Click "Test String" to see step-by-step execution
   - Use animation controls to navigate through steps
   - Adjust speed for better visualization

5. **Export**
   - Click the "📥 PNG" button to download the NFA diagram
   - Click the "📋 Copy" button to copy the regex to clipboard

## 🎨 Interface Layout

- **Features Section** (Top): Overview of all features with gradient background
- **Left Sidebar**: 
  - RegEx input
  - Quick examples
  - Conversion steps (collapsible)
- **Right Content Area**:
  - Statistics dashboard
  - NFA graph visualization
  - Test string panel
  - Animation controls
  - Simulation steps

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with gradients, flexbox, and grid
- **JavaScript (ES6+)**: Core logic and interactivity
- **vis-network**: Graph visualization library for rendering NFAs

## 📚 Supported Regular Expression Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `*` | Kleene Star (zero or more) | `a*` matches "", "a", "aa", "aaa", ... |
| `\|` | Union (OR) | `a\|b` matches "a" or "b" |
| `()` | Grouping | `(ab)*` matches "", "ab", "abab", ... |
| Concatenation | Sequential characters | `abc` matches "abc" |

## 🎯 Key Components

### Thompson's Construction Algorithm
The tool implements Thompson's Construction, a classic algorithm for converting regular expressions to NFAs:
1. Parse the regular expression
2. Convert to postfix notation
3. Apply Thompson's rules for each operator
4. Build NFA with epsilon transitions

### Animation System
- State-by-state execution visualization
- Configurable speed settings
- Manual step control
- Visual feedback for current state and transitions

### Statistics Tracking
- Dynamic calculation of NFA properties
- Real-time updates during conversion
- Complexity analysis

## 📁 Project Structure

```
TOC/
├── index.html          # Main HTML structure
├── style.css           # Complete styling (956 lines)
├── script.js           # Core JavaScript logic (1049 lines)
└── README.md           # Project documentation
```

## 🎓 Educational Use

This tool is perfect for:
- **Students**: Learning automata theory and regular expressions
- **Teachers**: Demonstrating conversion algorithms in class
- **Developers**: Understanding regex patterns and their automata equivalents
- **Self-learners**: Exploring formal language theory concepts

## 🌈 Design Highlights

- **Gradient Theme**: Beautiful purple gradient (#667eea to #764ba2)
- **Modern UI**: Clean, professional design with glassmorphism effects
- **Responsive Layout**: Adapts to different screen sizes
- **Custom Scrollbars**: Styled scrollbars matching the theme
- **Interactive Cards**: Hover effects and smooth transitions

## 🔧 Customization

You can customize:
- Color scheme in `style.css` (gradient colors, badge colors)
- Animation speed settings in `script.js`
- Example regex patterns in `index.html`
- Graph layout options in the vis-network configuration

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for:
- Bug fixes
- New features
- Documentation improvements
- Additional regex examples

## 📧 Support

If you encounter any issues or have questions, please open an issue in the repository.

---

**Made with ❤️ for Theory of Computation students**

*Understanding automata theory, one regex at a time* ✨
