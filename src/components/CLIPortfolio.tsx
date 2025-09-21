import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import MatrixBackground from "./MatrixBackground";

const WELCOME = `          
          PPPPPP    AAAA    RRRRRR    AAAA    MM    MM
          PP   PP  AA  AA   RR   RR  AA  AA   MMM  MMM
          PPPPPP  AAAAAAAA  RRRRRR  AAAAAAAA  MM MM MM
          PP      AA    AA  RR  RR  AA    AA  MM    MM
          PP      AA    AA  RR   RR AA    AA  MM    MM

Welcome to my CLI Portfolio!
Type 'help' to get started.`;

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

const SKILLS_TABLE = `┌────────────┬──────────────────────────┐
│ Frontend   │ React, Jetpack Compose   │
│ Backend    │ Node.js, .NET            │
│ Mobile     │ Android (CameraX, OpenCV)│
│ Tools      │ Git, Docker, Firebase    │
└────────────┴──────────────────────────┘
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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const commandHistory = useRef<string[]>([]);
  const historyIndex = useRef<number>(0);

  const commands = [
    "help",
    "about",
    "skills",
    "projects",
    "resume",
    "contact",
    "ls",
    "cat",
    "clear",
    "exit",
  ];

  useEffect(() => {
    if (!containerRef.current) return;

     const term = new Terminal({
       cols: 80,
       rows: 24,
       cursorBlink: true,
       cursorStyle: 'block',
       fontFamily: "monospace",
       allowTransparency: true,
       theme: {
         background: "transparent",
         foreground: "#c7f9cc",
         cursor: "#c7f9cc",
         cursorAccent: "#c7f9cc",
       },
     });

    term.open(containerRef.current);
    termRef.current = term;

    // Show welcome message
    WELCOME.split("\n").forEach((line) => term.writeln(line));
    printPrompt(term);
    
    // Ensure terminal is focused for cursor visibility
    term.focus();

     let input = "";

     // Mobile input handling - simplified approach
     const setupMobileInput = () => {
       const inputEl = inputRef.current;
       if (!inputEl) return;

       let mobileInputValue = "";

       const handleMobileInput = (e: Event) => {
         const target = e.target as HTMLInputElement;
         const newValue = target.value;
         
         // Handle new characters
         if (newValue.length > mobileInputValue.length) {
           const newChar = newValue.slice(mobileInputValue.length);
           mobileInputValue = newValue;
           input += newChar;
           term.write(newChar);
         }
         // Handle deletions
         else if (newValue.length < mobileInputValue.length) {
           const deletedCount = mobileInputValue.length - newValue.length;
           mobileInputValue = newValue;
           for (let i = 0; i < deletedCount; i++) {
             if (input.length > 0) {
               input = input.slice(0, -1);
               term.write("\b \b");
             }
           }
         }
       };

       const handleMobileKeyDown = (e: KeyboardEvent) => {
         if (e.key === "Enter") {
           e.preventDefault();
           term.write("\r\n");
           handleCommand(input, term);
           input = "";
           mobileInputValue = "";
           inputEl.value = "";
         }
       };

       inputEl.addEventListener("input", handleMobileInput);
       inputEl.addEventListener("keydown", handleMobileKeyDown);

       // Focus hidden input on tap
       const handleTouchStart = (e: Event) => {
         console.log("Touch detected, focusing mobile input");
         e.preventDefault();
         inputEl.focus();
         inputEl.click(); // Extra click to ensure focus
       };

       containerRef.current?.addEventListener("touchstart", handleTouchStart, { passive: false });
       containerRef.current?.addEventListener("click", handleTouchStart);

       return () => {
         inputEl.removeEventListener("input", handleMobileInput);
         inputEl.removeEventListener("keydown", handleMobileKeyDown);
         containerRef.current?.removeEventListener("touchstart", handleTouchStart);
         containerRef.current?.removeEventListener("click", handleTouchStart);
       };
     };

     const cleanupMobileInput = setupMobileInput();

     // Desktop input (xterm onKey)
     term.onKey((e) => {
       const ev = e.domEvent;
       const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      const setInput = (newInput: string) => {
        term.write("\x1b[2K\rguest@portfolio:~ $ " + newInput);
        input = newInput;
      };

      switch (ev.key) {
        case "Enter":
          term.write("\r\n");
          handleCommand(input, term);
          input = "";
          break;
        case "Backspace":
          if (input.length > 0) {
            input = input.slice(0, -1);
            term.write("\b \b");
          }
          break;
        case "ArrowUp":
          ev.preventDefault();
          if (historyIndex.current > 0) {
            historyIndex.current--;
            setInput(commandHistory.current[historyIndex.current]);
          }
          break;
        case "ArrowDown":
          ev.preventDefault();
          if (historyIndex.current < commandHistory.current.length - 1) {
            historyIndex.current++;
            setInput(commandHistory.current[historyIndex.current]);
          } else {
            historyIndex.current = commandHistory.current.length;
            setInput("");
          }
          break;
        case "Tab":
          ev.preventDefault();
          const matches = commands.filter((cmd) => cmd.startsWith(input));
          if (matches.length === 1) {
            const completion = matches[0].slice(input.length);
            input += completion;
            term.write(completion);
          }
          break;
        default:
          if (printable && ev.key.length === 1) {
            input += ev.key;
            term.write(ev.key);
          }
      }
    });

     return () => {
       cleanupMobileInput?.();
       term.dispose();
     };
  }, []);

  // Helpers
  function printPrompt(t: Terminal) {
    t.write("\r\nguest@portfolio:~ $ ");
  }

  function typeLines(t: Terminal, text: string, cb: () => void) {
    const lines = text.split("\n");
    let i = 0;
    const step = () => {
      if (i >= lines.length) {
        cb && cb();
        return;
      }
      t.writeln(lines[i]);
      i++;
      setTimeout(step, 30);
    };
    step();
  }

  function handleCommand(raw: string, term: Terminal) {
    const command = raw.trim();
    if (!command) {
      printPrompt(term);
      return;
    }

    commandHistory.current.push(command);
    historyIndex.current = commandHistory.current.length;

    const parts = command.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case "help":
        typeLines(term, HELP_TEXT, () => printPrompt(term));
        break;
      case "about":
        typeLines(term, ABOUT, () => printPrompt(term));
        break;
      case "skills":
        typeLines(term, SKILLS_TABLE, () => printPrompt(term));
        break;
      case "projects":
        if (parts.length === 1) {
          typeLines(term, PROJECTS_LIST, () => printPrompt(term));
        } else {
          const n = parseInt(parts[1], 10);
          const details = PROJECT_DETAILS[n];
          if (details) typeLines(term, details + "\n", () => printPrompt(term));
          else
            typeLines(
              term,
              `No project ${parts[1]}\n`,
              () => printPrompt(term)
            );
        }
        break;
      case "resume":
        typeLines(
          term,
          "Opening resume... (will open in a new tab if available)\n",
          () => printPrompt(term)
        );
        window.open("/resume.pdf", "_blank");
        break;
      case "contact":
        typeLines(term, CONTACT, () => printPrompt(term));
        break;
      case "ls":
        typeLines(
          term,
          "about  skills  projects  contact  resume\n",
          () => printPrompt(term)
        );
        break;
      case "cat":
        if (parts.length < 2) {
          typeLines(term, "Usage: cat <file>\n", () => printPrompt(term));
        } else {
          const file = parts[1].toLowerCase();
          if (file === "about.txt")
            typeLines(term, ABOUT, () => printPrompt(term));
          else if (file === "projects.txt")
            typeLines(term, PROJECTS_LIST, () => printPrompt(term));
          else
            typeLines(
              term,
              `cat: ${file}: No such file\n`,
              () => printPrompt(term)
            );
        }
        break;
      case "clear":
        term.clear();
        printPrompt(term);
        break;
      case "exit":
        typeLines(term, "Goodbye.\n", () => {});
        break;
      default:
        typeLines(
          term,
          `Command not found: ${cmd}. Type 'help' for available commands.\n`,
          () => printPrompt(term)
        );
    }
  }

  return (
    <div className="flex-grow flex items-center justify-center p-6">
      <div className="relative w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden flex flex-col bg-black">
        <MatrixBackground />

        {/* Top bar */}
        <div className="relative z-10 bg-gray-800/50 backdrop-blur-sm h-8 flex items-center px-3 flex-shrink-0 border-b border-gray-600">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-grow text-center text-sm text-gray-400 font-mono">
            guest@portfolio -- bash
          </div>
        </div>

        {/* Terminal */}
        <div ref={containerRef} className="z-10 flex-grow" />

         {/* Hidden input for mobile */}
         <input
           ref={inputRef}
           type="text"
           autoComplete="off"
           autoCorrect="off"
           autoCapitalize="off"
           spellCheck="false"
           style={{
             position: "absolute",
             top: "-1000px",
             left: "-1000px",
             width: "1px",
             height: "1px",
             opacity: 0,
             fontSize: "16px", // prevent iOS zoom
             border: "none",
             outline: "none",
             background: "transparent",
             color: "transparent",
             pointerEvents: "none",
           }}
         />
      </div>
    </div>
  );
}
