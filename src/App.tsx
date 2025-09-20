import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

// Simple CLI-style portfolio component using xterm.js
// Usage: place this component in a React app (Vite / CRA) and ensure xterm is installed.
// npm install xterm

const WELCOME = `Welcome to Param's CLI Portfolio
Type 'help' to get started.
`;

const HELP_TEXT = `Available commands:
help        - show this message
about       - short bio
skills      - list skills
projects    - list projects
projects <n>- show project details (e.g. projects 1)
resume      - open resume (PDF)
contact     - contact info
ls          - list sections (alias for help)
cat <file>  - print pseudo-file contents (e.g. cat about.txt)
clear       - clear the screen
exit        - close (will just print a message)
`;

const ABOUT = `Hi — I'm Param Preetham R, an Associate Software Engineer who loves building developer tools, mobile apps, and delightful UX. I enjoy working with Android, React, backend systems, and small, focused teams that ship quickly.
`;

const SKILLS_TABLE = `┌────────────┬─────────────────────────┐
│ Frontend   │ React, Jetpack Compose  │
│ Backend    │ Node.js, .NET           │
│ Mobile     │ Android (CameraX, OpenCV)│
│ Tools      │ Git, Docker, Firebase   │
└────────────┴─────────────────────────┘
`;

const PROJECTS_LIST = `1) ScanSathi — Android document & ID scanner
2) PrintIt — ID upload + A4-composition service
3) SplitMate — Expense splitting web app
Type 'projects <n>' to view details.
`;

const PROJECT_DETAILS: Record<number, string> = {
  1: `ScanSathi (Android): Real-time document detection using YOLOv8 segmentation, OpenCV-based cropping and alignment, A4 export, and in-app purchases for premium features.`,
  2: `PrintIt (React Native + Web): Customers upload ID images via QR-tokened links; images are verified, corrected, and combined into printable A4 images for customers.`,
  3: `SplitMate (Web): Phone-number/OTP sign-in, groups, split-by-ratio or even, balances and settlements, designed with Firebase backend.`,
};

const CONTACT = `Email: param@example.com
GitHub: https://github.com/parampreetham
LinkedIn: https://www.linkedin.com/in/parampreetham
`;

export default function CLIPortfolio() {
  // const _termRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cols: 80,
      rows: 24,
      cursorBlink: true,
      fontFamily: 'monospace',
      theme: {
        background: '#0b0f12',
        foreground: '#c7f9cc',
      },
    });

    term.open(containerRef.current);
    term.writeln(WELCOME);
    printPrompt(term);

    let input = "";

    const handleCommand = (raw: string) => {
      const line = raw.trim();
      if (!line) {
        printPrompt(term);
        return;
      }

      const parts = line.split(/\s+/);
      const cmd = parts[0].toLowerCase();

      switch (cmd) {
        case 'help':
          typeLines(term, HELP_TEXT, () => printPrompt(term));
          break;
        case 'about':
          typeLines(term, ABOUT, () => printPrompt(term));
          break;
        case 'skills':
          typeLines(term, SKILLS_TABLE, () => printPrompt(term));
          break;
        case 'projects': {
          if (parts.length === 1) {
            typeLines(term, PROJECTS_LIST, () => printPrompt(term));
          } else {
            const n = parseInt(parts[1], 10);
            const details = PROJECT_DETAILS[n];
            if (details) typeLines(term, details + '\n', () => printPrompt(term));
            else typeLines(term, `No project ${parts[1]}\n`, () => printPrompt(term));
          }
          break;
        }
        case 'resume':
          typeLines(term, "Opening resume... (will open in a new tab if available)\n", () => printPrompt(term));
          // open resume — replace with your real resume URL
          window.open('/resume.pdf', '_blank');
          break;
        case 'contact':
          typeLines(term, CONTACT, () => printPrompt(term));
          break;
        case 'ls':
          typeLines(term, "about  skills  projects  contact  resume\n", () => printPrompt(term));
          break;
        case 'cat': {
          if (parts.length < 2) {
            typeLines(term, "Usage: cat <file>\n", () => printPrompt(term));
          } else {
            const file = parts[1].toLowerCase();
            if (file === 'about.txt') typeLines(term, ABOUT, () => printPrompt(term));
            else if (file === 'projects.txt') typeLines(term, PROJECTS_LIST, () => printPrompt(term));
            else typeLines(term, `cat: ${file}: No such file\n`, () => printPrompt(term));
          }
          break;
        }
        case 'clear':
          term.clear();
          printPrompt(term);
          break;
        case 'exit':
          typeLines(term, 'Goodbye.\n', () => {
            // do nothing fancy — leave terminal state as-is
          });
          break;
        default:
          typeLines(term, `Command not found: ${cmd}. Type 'help' for available commands.\n`, () => printPrompt(term));
      }
    };

    term.onKey(e => {
      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.key === 'Backspace') {
        // Do not delete the prompt
        if (input.length > 0) {
          input = input.slice(0, -1);
          term.write('\b \b');
        }
      } else if (ev.key === 'Enter') {
        term.write('\r\n');
        handleCommand(input);
        input = '';
      } else if (printable && ev.key.length === 1) {
        input += ev.key;
        term.write(ev.key);
      }
    });

    // small helper functions
    function printPrompt(t: Terminal) {
      t.write('\r\n> ');
    }

    function typeLines(t: Terminal, text: string, cb: () => void) {
      // naive type effect: print line-by-line
      const lines = text.split('\n');
      let i = 0;
      const step = () => {
        if (i >= lines.length) {
          if (cb) cb();
          return;
        }
        t.writeln(lines[i]);
        i++;
        setTimeout(step, 40);
      };
      step();
    }

    // expose terminal ref to outer scope if needed
    // const _termRef = useRef<Terminal | null>(null);
    // _termRef.current = term;

    return () => {
      try { term.dispose(); } catch (e) {}
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden" style={{ height: '70vh' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
