const fs = require('fs');
const path = require('path');
const NetworkService = require('./networkService');

class BashSimulator {
  constructor() {
    this.currentDir = '/home/user';
    this.filesystem = this.initializeFilesystem();
    this.networkService = new NetworkService();
    this.editorMode = false;
    this.editorState = null;
  }

  initializeFilesystem() {
    return {
      '/home/user': {
        type: 'directory',
        contents: {
          'Documents': { type: 'directory', contents: {} },
          'Downloads': { type: 'directory', contents: {} },
          'Desktop': { type: 'directory', contents: {} },
          'README.txt': { 
            type: 'file', 
            content: 'Welcome to the bash terminal simulator!\nThis is a practice environment for learning command line skills.' 
          },
          'sample.txt': { 
            type: 'file', 
            content: 'This is a sample text file.\nIt contains multiple lines of text.\nPerfect for practicing file operations.' 
          }
        }
      },
      '/home/user/Documents': {
        type: 'directory',
        contents: {
          'project1': { type: 'directory', contents: {} },
          'notes.txt': { 
            type: 'file', 
            content: 'Important notes:\n- Remember to backup files\n- Use version control\n- Document your work' 
          }
        }
      },
      '/home/user/Downloads': {
        type: 'directory',
        contents: {
          'file1.txt': { type: 'file', content: 'Downloaded file 1' },
          'file2.txt': { type: 'file', content: 'Downloaded file 2' }
        }
      },
      '/home/user/Desktop': {
        type: 'directory',
        contents: {
          'shortcut.txt': { type: 'file', content: 'Desktop shortcut' }
        }
      }
    };
  }

  executeCommand(command) {
    // Check if we're in editor mode
    if (this.editorMode) {
      return this.handleEditorCommand(command);
    }

    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    // Check for --help flag first
    if (args.includes('--help')) {
      return this.getCommandHelp(cmd);
    }

    try {
      switch (cmd) {
        case 'ls':
          return this.ls(args);
        case 'cd':
          return this.cd(args);
        case 'pwd':
          return this.pwd();
        case 'cat':
          return this.cat(args);
        case 'less':
          return this.less(args);
        case 'mkdir':
          return this.mkdir(args);
        case 'touch':
          return this.touch(args);
        case 'rm':
          return this.rm(args);
        case 'rmdir':
          return this.rmdir(args);
        case 'cp':
          return this.cp(args);
        case 'mv':
          return this.mv(args);
        case 'echo':
          return this.echo(args);
        case 'grep':
          return this.grep(args);
        case 'find':
          return this.find(args);
        case 'head':
          return this.head(args);
        case 'tail':
          return this.tail(args);
        case 'wc':
          return this.wc(args);
        case 'sort':
          return this.sort(args);
        case 'uniq':
          return this.uniq(args);
        case 'chmod':
          return this.chmod(args);
        case 'whoami':
          return this.whoami();
        case 'date':
          return this.date();
        case 'history':
          return this.history();
        case 'help':
          return this.help();
        case 'options':
          return this.options(args);
        case 'ai-edit':
          return this.aiEdit(args);
        case 'clear':
          return this.clear();
        // Network commands
        case 'ping':
          return this.ping(args);
        case 'nslookup':
          return this.nslookup(args);
        case 'dig':
          return this.dig(args);
        case 'traceroute':
          return this.traceroute(args);
        case 'netstat':
          return this.netstat(args);
        case 'ip':
          return this.ip(args);
        case 'route':
          return this.route(args);
        case 'arp':
          return this.arp(args);
        case 'whois':
          return this.whois(args);
        case 'iwconfig':
          return this.iwconfig(args);
        case 'ifconfig':
          return this.ifconfig(args);
        default:
          return {
            success: false,
            output: `bash: ${cmd}: command not found`,
            error: true
          };
      }
    } catch (error) {
      return {
        success: false,
        output: `Error: ${error.message}`,
        error: true
      };
    }
  }

  ls(args) {
    // Check for --help first
    if (args.includes('--help')) {
      return this.lsHelp();
    }

    // Parse arguments
    const options = this.parseLsOptions(args);
    const targetPath = options.path || '.';
    const resolvedPath = this.resolvePath(targetPath);
    const dir = this.getDirectory(resolvedPath);
    
    if (!dir) {
      return {
        success: false,
        output: `ls: cannot access '${targetPath}': No such file or directory`,
        error: true
      };
    }

    if (dir.type !== 'directory') {
      return {
        success: false,
        output: `ls: cannot access '${targetPath}': Not a directory`,
        error: true
      };
    }

    // Get directory contents
    let items = Object.keys(dir.contents);
    
    // Apply filters
    if (!options.all && !options.almostAll) {
      items = items.filter(item => !item.startsWith('.'));
    } else if (options.almostAll) {
      items = items.filter(item => item !== '.' && item !== '..');
    }

    // Apply ignore patterns
    if (options.ignore) {
      items = items.filter(item => !item.includes(options.ignore));
    }

    // Apply ignore backups
    if (options.ignoreBackups) {
      items = items.filter(item => !item.endsWith('~'));
    }

    // Sort items
    if (!options.noSort) {
      if (options.sortBy === 'size') {
        items.sort((a, b) => {
          const aData = this.getDirectory(this.joinPath(resolvedPath, a));
          const bData = this.getDirectory(this.joinPath(resolvedPath, b));
          const aSize = aData?.type === 'file' ? (aData.content?.length || 0) : 4096;
          const bSize = bData?.type === 'file' ? (bData.content?.length || 0) : 4096;
          return options.reverse ? bSize - aSize : aSize - bSize;
        });
      } else if (options.sortBy === 'time') {
        // For simplicity, we'll use alphabetical order as time
        items.sort((a, b) => options.reverse ? b.localeCompare(a) : a.localeCompare(b));
      } else if (options.sortBy === 'extension') {
        items.sort((a, b) => {
          const aExt = a.split('.').pop() || '';
          const bExt = b.split('.').pop() || '';
          return options.reverse ? bExt.localeCompare(aExt) : aExt.localeCompare(bExt);
        });
      } else {
        // Default alphabetical sort
        items.sort((a, b) => options.reverse ? b.localeCompare(a) : a.localeCompare(b));
      }
    }

    // Group directories first if requested
    if (options.groupDirectoriesFirst) {
      const dirs = items.filter(item => {
        const itemData = this.getDirectory(this.joinPath(resolvedPath, item));
        return itemData?.type === 'directory';
      });
      const files = items.filter(item => {
        const itemData = this.getDirectory(this.joinPath(resolvedPath, item));
        return itemData?.type !== 'directory';
      });
      items = [...dirs, ...files];
    }

    // Format output
    if (options.longFormat) {
      return this.formatLongListing(items, resolvedPath, options);
    } else if (options.onePerLine) {
      return {
        success: true,
        output: items.join('\n'),
        error: false
      };
    } else if (options.commaSeparated) {
      return {
        success: true,
        output: items.join(', '),
        error: false
      };
    } else if (options.vertical) {
      return {
        success: true,
        output: items.join('\n'),
        error: false
      };
    } else {
      // Default horizontal format
      let formattedItems = items;
      if (options.classify) {
        formattedItems = items.map(item => {
          const itemData = this.getDirectory(this.joinPath(resolvedPath, item));
          if (itemData?.type === 'directory') {
            return item + '/';
          }
          return item;
        });
      }
      if (options.quoteNames) {
        formattedItems = formattedItems.map(item => `"${item}"`);
      }
      return {
        success: true,
        output: formattedItems.join('  '),
        error: false
      };
    }
  }

  parseLsOptions(args) {
    const options = {
      all: false,
      almostAll: false,
      longFormat: false,
      onePerLine: false,
      commaSeparated: false,
      vertical: false,
      reverse: false,
      noSort: false,
      sortBy: 'name',
      groupDirectoriesFirst: false,
      ignore: null,
      ignoreBackups: false,
      humanReadable: false,
      showInode: false,
      classify: false,
      quoteNames: false,
      path: null
    };

    let i = 0;
    while (i < args.length) {
      const arg = args[i];
      
      if (arg.startsWith('-')) {
        // Handle short options
        for (let j = 1; j < arg.length; j++) {
          const flag = arg[j];
          switch (flag) {
            case 'a':
              options.all = true;
              break;
            case 'A':
              options.almostAll = true;
              break;
            case 'l':
              options.longFormat = true;
              break;
            case '1':
              options.onePerLine = true;
              break;
            case 'm':
              options.commaSeparated = true;
              break;
            case 'C':
              options.vertical = true;
              break;
            case 'r':
              options.reverse = true;
              break;
            case 'U':
              options.noSort = true;
              break;
            case 'S':
              options.sortBy = 'size';
              break;
            case 't':
              options.sortBy = 'time';
              break;
            case 'X':
              options.sortBy = 'extension';
              break;
            case 'h':
              options.humanReadable = true;
              break;
            case 'i':
              options.showInode = true;
              break;
            case 'F':
              options.classify = true;
              break;
            case 'Q':
              options.quoteNames = true;
              break;
            case 'B':
              options.ignoreBackups = true;
              break;
            case 'G':
              options.groupDirectoriesFirst = true;
              break;
          }
        }
      } else if (arg.startsWith('--')) {
        // Handle long options
        const longOption = arg.substring(2);
        switch (longOption) {
          case 'all':
            options.all = true;
            break;
          case 'almost-all':
            options.almostAll = true;
            break;
          case 'long':
            options.longFormat = true;
            break;
          case 'reverse':
            options.reverse = true;
            break;
          case 'no-sort':
            options.noSort = true;
            break;
          case 'sort=size':
            options.sortBy = 'size';
            break;
          case 'sort=time':
            options.sortBy = 'time';
            break;
          case 'sort=extension':
            options.sortBy = 'extension';
            break;
          case 'human-readable':
            options.humanReadable = true;
            break;
          case 'inode':
            options.showInode = true;
            break;
          case 'classify':
            options.classify = true;
            break;
          case 'quote-name':
            options.quoteNames = true;
            break;
          case 'ignore-backups':
            options.ignoreBackups = true;
            break;
          case 'group-directories-first':
            options.groupDirectoriesFirst = true;
            break;
          case 'help':
            // This is handled in the main ls method
            break;
        }
      } else {
        // This is a path argument
        options.path = arg;
      }
      i++;
    }

    return options;
  }

  formatLongListing(items, dirPath, options) {
    const details = items.map(item => {
      const itemPath = this.joinPath(dirPath, item);
      const itemData = this.getDirectory(itemPath);
      const type = itemData?.type === 'directory' ? 'd' : '-';
      const permissions = 'rw-r--r--';
      const size = itemData?.type === 'file' ? (itemData.content?.length || 0) : 4096;
      const humanSize = options.humanReadable ? this.formatHumanSize(size) : size.toString();
      const inode = options.showInode ? '12345' : '';
      const owner = 'user';
      const group = 'user';
      const date = 'Jan 01 12:00';
      
      let name = item;
      if (options.classify && itemData?.type === 'directory') {
        name += '/';
      }
      if (options.quoteNames) {
        name = `"${name}"`;
      }
      
      const parts = [
        inode ? inode.padStart(8) : '',
        type + permissions,
        '1',
        owner.padEnd(8),
        group.padEnd(8),
        humanSize.padStart(8),
        date,
        name
      ].filter(part => part !== '');
      
      return parts.join(' ');
    });
    
    return {
      success: true,
      output: details.join('\n'),
      error: false
    };
  }

  formatHumanSize(bytes) {
    const units = ['B', 'K', 'M', 'G', 'T'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${Math.round(size)}${units[unitIndex]}`;
  }

  lsHelp() {
    const helpText = `Usage: ls [OPTION]... [FILE]...
List information about the FILEs (the current directory by default).
Sort entries alphabetically if none of -cftuvSUX nor --sort is specified.

Mandatory arguments to long options are mandatory for short options too.
  -a, --all                  do not ignore entries starting with .
  -A, --almost-all           do not list implied . and ..
      --author               with -l, print the author of each file
  -b, --escape               print C-style escapes for nongraphic characters
      --block-size=SIZE      with -l, scale sizes by SIZE when printing them;
                             e.g., '--block-size=M'; see SIZE format below

  -B, --ignore-backups       do not list implied entries ending with ~
  -c                         with -lt: sort by, and show, ctime (time of last
                             change of file status information);
                             with -l: show ctime and sort by name;
                             otherwise: sort by ctime, newest first

  -C                         list entries by columns
      --color[=WHEN]         color the output WHEN; more info below
  -d, --directory            list directories themselves, not their contents
  -D, --dired                generate output designed for Emacs' dired mode
  -f                         list all entries in directory order
  -F, --classify[=WHEN]      append indicator (one of */=>@|) to entries WHEN
      --file-type            likewise, except do not append '*'
      --format=WORD          across -x, commas -m, horizontal -x, long -l,
                             single-column -1, verbose -l, vertical -C

      --full-time            like -l --time-style=full-iso
  -g                         like -l, but do not list owner
      --group-directories-first
                             group directories before files;
                             can be augmented with a --sort option, but any
                             use of --sort=none (-U) disables grouping

  -G, --no-group             in a long listing, don't print group names
  -h, --human-readable       with -l and -s, print sizes like 1K 234M 2G etc.
      --si                   likewise, but use powers of 1000 not 1024
  -H, --dereference-command-line
                             follow symbolic links listed on the command line
      --dereference-command-line-symlink-to-dir
                             follow each command line symbolic link
                             that points to a directory

      --hide=PATTERN         do not list implied entries matching shell PATTERN
                             (overridden by -a or -A)

      --hyperlink[=WHEN]     hyperlink file names WHEN
      --indicator-style=WORD
                             append indicator with style WORD to entry names:
                             none (default), slash (-p),
                             file-type (--file-type), classify (-F)

  -i, --inode                print the index number of each file
  -I, --ignore=PATTERN       do not list implied entries matching shell PATTERN
  -k, --kibibytes            default to 1024-byte blocks for file system usage;
                             used only with -s and per directory totals

  -l                         use a long listing format
  -L, --dereference          when showing file information for a symbolic
                             link, show information for the file the link
                             references rather than for the link itself

  -m                         fill width with a comma separated list of entries
  -n, --numeric-uid-gid      like -l, but list numeric user and group IDs
  -N, --literal              print entry names without quoting
  -o                         like -l, but do not list group information
  -p, --indicator-style=slash
                             append / indicator to directories
  -q, --hide-control-chars   print ? instead of nongraphic characters
      --show-control-chars   show nongraphic characters as-is (the default,
                             unless program is 'ls' and output is a terminal)

  -Q, --quote-name           enclose entry names in double quotes
      --quoting-style=WORD   use quoting style WORD for entry names:
                             literal, locale, shell, shell-always,
                             shell-escape, shell-escape-always, c, escape
                             (overrides QUOTING_STYLE environment variable)

  -r, --reverse              reverse order while sorting
  -R, --recursive            list subdirectories recursively
  -s, --size                 print the allocated size of each file, in blocks
  -S                         sort by file size, largest first
      --sort=WORD            sort by WORD instead of name: none (-U), size (-S),
                             time (-t), version (-v), extension (-X), width

      --time=WORD            select which timestamp used to display or sort;
                               access time (-u): atime, access, use;
                               metadata change time (-c): ctime, status;
                               modified time (default): mtime, modification;
                               birth time: birth, creation;
                             with -l, WORD determines which time to show;
                             with --sort=time, sort by WORD (newest first)

      --time-style=TIME_STYLE
                             time/date format with -l; see TIME_STYLE below
  -t                         sort by time, newest first; see --time
  -T, --tabsize=COLS         assume tab stops at each COLS instead of 8
  -u                         with -lt: sort by, and show, access time;
                             with -l: show access time and sort by name;
                             otherwise: sort by access time, newest first

  -U                         do not sort; list entries in directory order
  -v                         natural sort of (version) numbers within text
  -w, --width=COLS           set output width to COLS.  0 means no limit
  -x                         list entries by lines instead of by columns
  -X                         sort alphabetically by entry extension
  -Z, --context              print any security context of each file
      --zero                 end each output line with NUL, not newline
  -1                         list one file per line

Please implement these features to the command and also implement the "--help" command for each command that is present in the bash simulator. If you provide me a list of  the commands you have installed in the simulator I will provide the additional features as well asa the text for the --help command for each susequent command that needs to be updated.`;

    return {
      success: true,
      output: helpText,
      error: false
    };
  }

  cd(args) {
    const targetPath = args[0] || '/home/user';
    const newPath = this.resolvePath(targetPath);
    const dir = this.getDirectory(newPath);

    if (!dir) {
      return {
        success: false,
        output: `cd: ${targetPath}: No such file or directory`,
        error: true
      };
    }

    if (dir.type !== 'directory') {
      return {
        success: false,
        output: `cd: ${targetPath}: Not a directory`,
        error: true
      };
    }

    this.currentDir = newPath;
    return {
      success: true,
      output: '',
      error: false
    };
  }

  pwd() {
    return {
      success: true,
      output: this.currentDir,
      error: false
    };
  }

  cat(args) {
    // Check for --help first
    if (args.includes('--help')) {
      return this.catHelp();
    }

    // Check for --version
    if (args.includes('--version')) {
      return {
        success: true,
        output: 'cat (GNU coreutils) 8.32\nCopyright (C) 2020 Free Software Foundation, Inc.\nLicense GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.\nThis is free software: you are free to change and redistribute it.\nThere is NO WARRANTY, to the extent permitted by law.\n\nWritten by Torbjörn Granlund and Richard M. Stallman.',
        error: false
      };
    }

    // Parse options
    const options = this.parseCatOptions(args);
    const files = options.files;

    if (files.length === 0) {
      // If no files specified, read from standard input (simulate with empty content)
      return {
        success: true,
        output: this.formatCatOutput('', options),
        error: false
      };
    }

    let output = '';
    let hasError = false;
    let errorMessage = '';

    for (const fileName of files) {
      if (fileName === '-') {
        // Standard input - simulate with empty content
        output += this.formatCatOutput('', options);
        continue;
      }

      const filePath = this.resolvePath(fileName);
      const file = this.getDirectory(filePath);

      if (!file) {
        errorMessage += `cat: ${fileName}: No such file or directory\n`;
        hasError = true;
        continue;
      }

      if (file.type !== 'file') {
        errorMessage += `cat: ${fileName}: Is a directory\n`;
        hasError = true;
        continue;
      }

      output += this.formatCatOutput(file.content || '', options);
    }

    if (hasError && output === '') {
      return {
        success: false,
        output: errorMessage.trim(),
        error: true
      };
    }

    return {
      success: true,
      output: output + (hasError ? '\n' + errorMessage.trim() : ''),
      error: hasError
    };
  }

  parseCatOptions(args) {
    const options = {
      showAll: false,
      numberNonblank: false,
      showEnds: false,
      number: false,
      squeezeBlank: false,
      showTabs: false,
      showNonprinting: false,
      files: []
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('-')) {
        if (arg === '--help' || arg === '--version') {
          // These are handled in the main cat method
          continue;
        }
        
        // Handle short options
        for (let j = 1; j < arg.length; j++) {
          const flag = arg[j];
          switch (flag) {
            case 'A':
              options.showAll = true;
              options.showNonprinting = true;
              options.showEnds = true;
              options.showTabs = true;
              break;
            case 'b':
              options.numberNonblank = true;
              break;
            case 'e':
              options.showNonprinting = true;
              options.showEnds = true;
              break;
            case 'E':
              options.showEnds = true;
              break;
            case 'n':
              options.number = true;
              break;
            case 's':
              options.squeezeBlank = true;
              break;
            case 't':
              options.showNonprinting = true;
              options.showTabs = true;
              break;
            case 'T':
              options.showTabs = true;
              break;
            case 'u':
              // Ignored as per specification
              break;
            case 'v':
              options.showNonprinting = true;
              break;
          }
        }
      } else {
        options.files.push(arg);
      }
    }

    return options;
  }

  formatCatOutput(content, options) {
    let lines = content.split('\n');
    
    // Handle squeeze blank lines
    if (options.squeezeBlank) {
      const squeezedLines = [];
      let prevEmpty = false;
      
      for (const line of lines) {
        if (line === '') {
          if (!prevEmpty) {
            squeezedLines.push(line);
          }
          prevEmpty = true;
        } else {
          squeezedLines.push(line);
          prevEmpty = false;
        }
      }
      lines = squeezedLines;
    }

    // Apply numbering
    if (options.numberNonblank || options.number) {
      const numberedLines = [];
      let lineNumber = 1;
      
      for (const line of lines) {
        if (options.numberNonblank && line !== '') {
          numberedLines.push(`${lineNumber.toString().padStart(6)}  ${line}`);
          lineNumber++;
        } else if (options.number) {
          numberedLines.push(`${lineNumber.toString().padStart(6)}  ${line}`);
          lineNumber++;
        } else {
          numberedLines.push(line);
        }
      }
      lines = numberedLines;
    }

    // Apply formatting
    const formattedLines = lines.map(line => {
      let formattedLine = line;
      
      // Show non-printing characters
      if (options.showNonprinting) {
        formattedLine = this.showNonprinting(formattedLine);
      }
      
      // Show tabs
      if (options.showTabs) {
        formattedLine = formattedLine.replace(/\t/g, '^I');
      }
      
      // Show line endings
      if (options.showEnds) {
        formattedLine += '$';
      }
      
      return formattedLine;
    });

    return formattedLines.join('\n');
  }

  showNonprinting(text) {
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code === 127) return '^?';
      if (code < 32) return `^${String.fromCharCode(code + 64)}`;
      return `M-${String.fromCharCode(code - 128)}`;
    });
  }

  less(args) {
    // Check for --help first
    if (args.includes('--help')) {
      return this.lessHelp();
    }

    // Check for --version
    if (args.includes('--version')) {
      return {
        success: true,
        output: 'less 551\nCopyright (C) 1984-2019  Mark Nudelman\n\nless comes with NO WARRANTY, to the extent permitted by law.\nFor information about the terms of redistribution,\nsee the file named README in the less distribution.\nHomepage: http://www.greenwoodsoftware.com/less',
        error: false
      };
    }

    if (args.length === 0) {
      return {
        success: false,
        output: 'less: missing file operand\nTry \'less --help\' for more information.',
        error: true
      };
    }

    const fileName = args[0];
    const filePath = this.resolvePath(fileName);
    const file = this.getDirectory(filePath);

    if (!file) {
      return {
        success: false,
        output: `less: ${fileName}: No such file or directory`,
        error: true
      };
    }

    if (file.type !== 'file') {
      return {
        success: false,
        output: `less: ${fileName}: Is a directory`,
        error: true
      };
    }

    // For the simulator, we'll display the file content with a note about paging
    const content = file.content || '';
    const lines = content.split('\n');
    
    // Simulate paging by showing first 20 lines with a note
    const displayLines = lines.slice(0, 20);
    const hasMore = lines.length > 20;
    
    let output = displayLines.join('\n');
    if (hasMore) {
      output += `\n\n--- (showing first 20 lines of ${lines.length} total) ---\n`;
      output += `In a real terminal, use arrow keys, Page Up/Down, or 'q' to quit\n`;
      output += `Commands: h=help, q=quit, /search, n=next, p=previous, g=top, G=bottom`;
    }

    return {
      success: true,
      output: output,
      error: false
    };
  }

  options(args) {
    // Check for --help first
    if (args.includes('--help')) {
      return this.optionsHelp();
    }

    // Check for --? flag
    if (args.includes('--?')) {
      return this.listAllCommands();
    }

    // If no arguments or unrecognized arguments, show help
    return this.optionsHelp();
  }

  listAllCommands() {
    const commands = [
      { name: 'ls', description: 'List directory contents', category: 'File Operations' },
      { name: 'cd', description: 'Change directory', category: 'Navigation' },
      { name: 'pwd', description: 'Print working directory', category: 'Navigation' },
      { name: 'cat', description: 'Display file contents', category: 'File Operations' },
      { name: 'less', description: 'View file contents with paging', category: 'File Operations' },
      { name: 'mkdir', description: 'Create directory', category: 'File Operations' },
      { name: 'touch', description: 'Create file', category: 'File Operations' },
      { name: 'rm', description: 'Remove file', category: 'File Operations' },
      { name: 'rmdir', description: 'Remove directory', category: 'File Operations' },
      { name: 'cp', description: 'Copy file', category: 'File Operations' },
      { name: 'mv', description: 'Move/rename file', category: 'File Operations' },
      { name: 'echo', description: 'Display text', category: 'Text Processing' },
      { name: 'grep', description: 'Search text in files', category: 'Text Processing' },
      { name: 'find', description: 'Find files', category: 'File Operations' },
      { name: 'head', description: 'Display first lines of file', category: 'Text Processing' },
      { name: 'tail', description: 'Display last lines of file', category: 'Text Processing' },
      { name: 'wc', description: 'Count lines, words, characters', category: 'Text Processing' },
      { name: 'sort', description: 'Sort lines', category: 'Text Processing' },
      { name: 'uniq', description: 'Remove duplicate lines', category: 'Text Processing' },
      { name: 'chmod', description: 'Change file permissions', category: 'System' },
      { name: 'whoami', description: 'Display current user', category: 'System' },
      { name: 'date', description: 'Display current date', category: 'System' },
      { name: 'history', description: 'Display command history', category: 'System' },
      { name: 'help', description: 'Show general help', category: 'Help' },
      { name: 'options', description: 'List all available commands', category: 'Help' },
      { name: 'ai-edit', description: 'Text editor (nano-like)', category: 'Text Processing' },
      { name: 'clear', description: 'Clear screen', category: 'System' }
    ];

    // Group commands by category
    const categories = {};
    commands.forEach(cmd => {
      if (!categories[cmd.category]) {
        categories[cmd.category] = [];
      }
      categories[cmd.category].push(cmd);
    });

    let output = 'Available Commands in Bash Terminal Simulator\n';
    output += '==============================================\n\n';

    // Display commands by category
    Object.keys(categories).sort().forEach(category => {
      output += `${category}:\n`;
      output += '─'.repeat(category.length + 1) + '\n';
      
      categories[category].forEach(cmd => {
        output += `  ${cmd.name.padEnd(12)} - ${cmd.description}\n`;
      });
      output += '\n';
    });

    output += 'Usage:\n';
    output += '  options --?     List all commands (this output)\n';
    output += '  options --help  Show help for this command\n';
    output += '  command --help  Show help for any specific command\n\n';
    output += `Total commands available: ${commands.length}`;

    return {
      success: true,
      output: output,
      error: false
    };
  }

  aiEdit(args) {
    // Check for --help first
    if (args.includes('--help')) {
      return this.aiEditHelp();
    }

    const fileName = args[0] || 'untitled.txt';
    
    // Check if file exists and is not a directory
    const filePath = this.resolvePath(fileName);
    const file = this.getDirectory(filePath);
    
    if (file && file.type === 'directory') {
      return {
        success: false,
        output: `ai-edit: ${fileName}: Is a directory`,
        error: true
      };
    }

    // Initialize editor state
    const initialContent = (file && file.type === 'file') ? (file.content || '') : '';
    const isNewFile = !file || file.type !== 'file';
    
    this.editorState = {
      fileName: fileName,
      filePath: filePath,
      content: initialContent,
      lines: initialContent.split('\n'),
      cursorLine: 0,
      cursorCol: 0,
      modified: isNewFile,
      isNewFile: isNewFile
    };

    // Enter editor mode
    this.editorMode = true;
    
    // Show editor interface
    const editorDisplay = this.createInteractiveEditor();
    
    return {
      success: true,
      output: editorDisplay,
      error: false,
      editorMode: true
    };
  }

  handleEditorCommand(command) {
    const cmd = command.trim().toLowerCase();
    
    switch (cmd) {
      case 'ctrl+x':
      case 'ctrl+s':
        return this.saveFile();
      case 'ctrl+z':
        return this.exitEditor();
      case 'ctrl+h':
        return this.showEditorHelp();
      case 'ctrl+o':
        return this.openFile();
      case 'ctrl+n':
        return this.newFile();
      case 'ctrl+c':
        return this.copyText();
      case 'ctrl+v':
        return this.cutText();
      case 'ctrl+p':
        return this.pasteText();
      case 'ctrl+f':
        return this.findText();
      case 'ctrl+u':
        return this.undoAction();
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        return this.moveCursor(cmd);
      case 'home':
        return this.moveToLineStart();
      case 'end':
        return this.moveToLineEnd();
      case 'enter':
        return this.insertNewLine();
      case 'backspace':
        return this.deleteBeforeCursor();
      case 'delete':
        return this.deleteAtCursor();
      case 'tab':
        return this.insertTab();
      case 'pageup':
        return this.pageUp();
      case 'pagedown':
        return this.pageDown();
      case 'ctrl+home':
        return this.moveToFileStart();
      case 'ctrl+end':
        return this.moveToFileEnd();
      default:
        // Handle text input
        if (command.length === 1 && command >= ' ' && command <= '~') {
          return this.insertText(command);
        }
        return this.showEditorHelp();
    }
  }

  createInteractiveEditor() {
    const state = this.editorState;
    const lines = state.lines;
    const maxLines = 15; // Lines to display
    
    let output = `\n`;
    output += `┌─────────────────────────────────────────────────────────────────────────────┐\n`;
    output += `│ AI-Edit Text Editor v1.0 - Interactive Mode                                 │\n`;
    output += `└─────────────────────────────────────────────────────────────────────────────┘\n`;
    output += `\n`;
    output += `File: ${state.fileName} ${state.isNewFile ? '(New File)' : `(${lines.length} lines)`} | Modified: ${state.modified ? 'Yes' : 'No'}\n`;
    output += `\n`;
    
    // Display editor content with cursor
    output += `┌─ Editor Content ───────────────────────────────────────────────────────────┐\n`;
    
    const startLine = Math.max(0, state.cursorLine - 7);
    const endLine = Math.min(lines.length, startLine + maxLines);
    
    for (let i = startLine; i < endLine; i++) {
      const lineNum = (i + 1).toString().padStart(3);
      let line = lines[i] || '';
      
      // Add cursor indicator
      if (i === state.cursorLine) {
        const beforeCursor = line.substring(0, state.cursorCol);
        const atCursor = line.charAt(state.cursorCol) || ' ';
        const afterCursor = line.substring(state.cursorCol + 1);
        
        line = beforeCursor + `[${atCursor}]` + afterCursor;
      }
      
      output += `│ ${lineNum} │ ${line.padEnd(70)} │\n`;
    }
    
    // Fill remaining space if needed
    for (let i = endLine; i < startLine + maxLines; i++) {
      output += `│ ${(i + 1).toString().padStart(3)} │ ${' '.padEnd(70)} │\n`;
    }
    
    output += `└─────────────────────────────────────────────────────────────────────────────┘\n`;
    output += `\n`;
    
    // Status bar
    output += `┌─ Status Bar ───────────────────────────────────────────────────────────────┐\n`;
    output += `│ Line: ${(state.cursorLine + 1).toString().padStart(3)}, Col: ${(state.cursorCol + 1).toString().padStart(3)}    Modified: ${state.modified ? 'Yes' : 'No'}    File: ${state.fileName.padEnd(25)} │\n`;
    output += `└─────────────────────────────────────────────────────────────────────────────┘\n`;
    output += `\n`;
    
    // Common shortcuts
    output += `┌─ Common Editor Shortcuts ──────────────────────────────────────────────────┐\n`;
    output += `│ Ctrl+C [COPY]  Ctrl+V [CUT]  Ctrl+P [PASTE]  Ctrl+F [FIND]                │\n`;
    output += `│ Ctrl+X [SAVE&EXIT]  Ctrl+S [SAVE]  Ctrl+U [UNDO]  Ctrl+Z [CLOSE]          │\n`;
    output += `└─────────────────────────────────────────────────────────────────────────────┘\n`;
    output += `\n`;
    output += `Type commands or text to edit. Use Ctrl+Z to exit editor.\n`;

    return output;
  }

  saveFile() {
    const state = this.editorState;
    const content = state.lines.join('\n');
    
    // Save to filesystem
    const parentPath = this.getParentPath(state.filePath);
    const fileName = this.getPathName(state.filePath);
    const parent = this.getDirectory(parentPath);
    
    if (parent && parent.type === 'directory') {
      parent.contents[fileName] = {
        type: 'file',
        content: content,
        size: content.length,
        permissions: '644',
        owner: 'user',
        group: 'user',
        modified: new Date().toISOString()
      };
    }
    
    state.modified = false;
    
    return {
      success: true,
      output: `File saved: ${state.fileName}`,
      error: false,
      editorMode: true
    };
  }

  exitEditor() {
    this.editorMode = false;
    this.editorState = null;
    
    return {
      success: true,
      output: 'Exited editor mode.',
      error: false,
      editorMode: false
    };
  }

  showEditorHelp() {
    return {
      success: true,
      output: `Editor Help:
- Arrow keys: Move cursor
- Home/End: Move to line start/end
- Enter: Insert new line
- Backspace/Delete: Delete characters
- Tab: Insert tab
- Ctrl+S: Save file
- Ctrl+X: Save and exit
- Ctrl+Z: Exit without saving
- Ctrl+H: Show this help`,
      error: false,
      editorMode: true
    };
  }

  moveCursor(direction) {
    const state = this.editorState;
    
    switch (direction) {
      case 'up':
        if (state.cursorLine > 0) {
          state.cursorLine--;
          state.cursorCol = Math.min(state.cursorCol, state.lines[state.cursorLine].length);
        }
        break;
      case 'down':
        if (state.cursorLine < state.lines.length - 1) {
          state.cursorLine++;
          state.cursorCol = Math.min(state.cursorCol, state.lines[state.cursorLine].length);
        }
        break;
      case 'left':
        if (state.cursorCol > 0) {
          state.cursorCol--;
        }
        break;
      case 'right':
        if (state.cursorCol < state.lines[state.cursorLine].length) {
          state.cursorCol++;
        }
        break;
    }
    
    return {
      success: true,
      output: this.createInteractiveEditor(),
      error: false,
      editorMode: true
    };
  }

  insertText(text) {
    const state = this.editorState;
    const line = state.lines[state.cursorLine] || '';
    
    state.lines[state.cursorLine] = line.substring(0, state.cursorCol) + text + line.substring(state.cursorCol);
    state.cursorCol += text.length;
    state.modified = true;
    
    return {
      success: true,
      output: this.createInteractiveEditor(),
      error: false,
      editorMode: true
    };
  }

  insertNewLine() {
    const state = this.editorState;
    const line = state.lines[state.cursorLine] || '';
    
    const beforeCursor = line.substring(0, state.cursorCol);
    const afterCursor = line.substring(state.cursorCol);
    
    state.lines[state.cursorLine] = beforeCursor;
    state.lines.splice(state.cursorLine + 1, 0, afterCursor);
    state.cursorLine++;
    state.cursorCol = 0;
    state.modified = true;
    
    return {
      success: true,
      output: this.createInteractiveEditor(),
      error: false,
      editorMode: true
    };
  }

  deleteBeforeCursor() {
    const state = this.editorState;
    const line = state.lines[state.cursorLine] || '';
    
    if (state.cursorCol > 0) {
      state.lines[state.cursorLine] = line.substring(0, state.cursorCol - 1) + line.substring(state.cursorCol);
      state.cursorCol--;
      state.modified = true;
    }
    
    return {
      success: true,
      output: this.createInteractiveEditor(),
      error: false,
      editorMode: true
    };
  }

  deleteAtCursor() {
    const state = this.editorState;
    const line = state.lines[state.cursorLine] || '';
    
    if (state.cursorCol < line.length) {
      state.lines[state.cursorLine] = line.substring(0, state.cursorCol) + line.substring(state.cursorCol + 1);
      state.modified = true;
    }
    
    return {
      success: true,
      output: this.createInteractiveEditor(),
      error: false,
      editorMode: true
    };
  }

  // Placeholder methods for other editor functions
  openFile() { return this.showEditorHelp(); }
  newFile() { return this.showEditorHelp(); }
  copyText() { return this.showEditorHelp(); }
  cutText() { return this.showEditorHelp(); }
  pasteText() { return this.showEditorHelp(); }
  findText() { return this.showEditorHelp(); }
  undoAction() { return this.showEditorHelp(); }
  moveToLineStart() { return this.showEditorHelp(); }
  moveToLineEnd() { return this.showEditorHelp(); }
  insertTab() { return this.showEditorHelp(); }
  pageUp() { return this.showEditorHelp(); }
  pageDown() { return this.showEditorHelp(); }
  moveToFileStart() { return this.showEditorHelp(); }
  moveToFileEnd() { return this.showEditorHelp(); }

  createEditorInterface(fileName, content, isNewFile) {
    const lines = content.split('\n');
    const totalLines = lines.length;
    const maxLines = 20; // Maximum lines to display at once
    const maxCols = 80;  // Maximum columns to display
    
    // Initialize editor state
    const editorState = {
      lines: lines.length === 0 ? [''] : lines,
      cursorLine: 0,
      cursorCol: 0,
      scrollTop: 0,
      modified: isNewFile,
      fileName: fileName,
      isNewFile: isNewFile
    };

    // Create interactive editor display
    let output = `\n`;
    output += `┌─────────────────────────────────────────────────────────────────────────────┐\n`;
    output += `│ AI-Edit Text Editor v1.0 - Interactive Mode                                 │\n`;
    output += `└─────────────────────────────────────────────────────────────────────────────┘\n`;
    output += `\n`;
    output += `File: ${fileName} ${isNewFile ? '(New File)' : `(${totalLines} lines)`} | Modified: ${editorState.modified ? 'Yes' : 'No'}\n`;
    output += `\n`;
    
    // Display editor content with cursor
    output += `┌─ Editor Content ───────────────────────────────────────────────────────────┐\n`;
    
    const startLine = Math.max(0, editorState.cursorLine - 10);
    const endLine = Math.min(editorState.lines.length, startLine + maxLines);
    
    for (let i = startLine; i < endLine; i++) {
      const lineNum = (i + 1).toString().padStart(3);
      let line = editorState.lines[i] || '';
      
      // Truncate long lines
      if (line.length > maxCols) {
        line = line.substring(0, maxCols - 3) + '...';
      }
      
      // Add cursor indicator
      if (i === editorState.cursorLine) {
        const beforeCursor = line.substring(0, editorState.cursorCol);
        const atCursor = line.charAt(editorState.cursorCol) || ' ';
        const afterCursor = line.substring(editorState.cursorCol + 1);
        
        line = beforeCursor + `[${atCursor}]` + afterCursor;
      }
      
      output += `│ ${lineNum} │ ${line.padEnd(maxCols)} │\n`;
    }
    
    // Fill remaining space if needed
    for (let i = endLine; i < startLine + maxLines; i++) {
      output += `│ ${(i + 1).toString().padStart(3)} │ ${' '.padEnd(maxCols)} │\n`;
    }
    
    output += `└─────────────────────────────────────────────────────────────────────────────┘\n`;
    output += `\n`;
    
    // Interactive controls
    output += `┌─ Interactive Controls ─────────────────────────────────────────────────────┐\n`;
    output += `│ Use these commands to navigate and edit:                                   │\n`;
    output += `│                                                                             │\n`;
    output += `│ NAVIGATION:                                                                 │\n`;
    output += `│   up/down/left/right  - Move cursor                                       │\n`;
    output += `│   home/end            - Move to line start/end                            │\n`;
    output += `│   pageup/pagedown     - Move up/down by screen                            │\n`;
    output += `│   ctrl+home/ctrl+end  - Move to file start/end                            │\n`;
    output += `│                                                                             │\n`;
    output += `│ EDITING:                                                                    │\n`;
    output += `│   type text           - Insert at cursor                                   │\n`;
    output += `│   backspace           - Delete before cursor                               │\n`;
    output += `│   delete              - Delete at cursor                                   │\n`;
    output += `│   enter               - Insert new line                                    │\n`;
    output += `│   tab                 - Insert tab                                         │\n`;
    output += `│                                                                             │\n`;
    output += `│ FILE OPERATIONS:                                                           │\n`;
    output += `│   ctrl+s              - Save file                                          │\n`;
    output += `│   ctrl+x              - Save and exit                                      │\n`;
    output += `│   ctrl+z              - Exit with save prompt                              │\n`;
    output += `│   ctrl+o              - Open file                                          │\n`;
    output += `│   ctrl+n              - New file                                           │\n`;
    output += `│   ctrl+h              - Show help                                          │\n`;
    output += `└─────────────────────────────────────────────────────────────────────────────┘\n`;
    output += `\n`;
    
    // Status bar
    output += `┌─ Status Bar ───────────────────────────────────────────────────────────────┐\n`;
    output += `│ Line: ${(editorState.cursorLine + 1).toString().padStart(3)}, Col: ${(editorState.cursorCol + 1).toString().padStart(3)}    Modified: ${editorState.modified ? 'Yes' : 'No'}    File: ${fileName.padEnd(25)} │\n`;
    output += `└─────────────────────────────────────────────────────────────────────────────┘\n`;
    output += `\n`;
    
    // Interactive simulation
    output += `┌─ Interactive Simulation ───────────────────────────────────────────────────┐\n`;
    output += `│ This editor simulates real-time text editing. In a real terminal:         │\n`;
    output += `│                                                                             │\n`;
    output += `│ 1. Cursor would move in real-time as you type                              │\n`;
    output += `│ 2. Text would appear/disappear as you edit                                 │\n`;
    output += `│ 3. Scrolling would happen automatically                                    │\n`;
    output += `│ 4. All keyboard shortcuts would work instantly                             │\n`;
    output += `│                                                                             │\n`;
    output += `│ Current file content (${editorState.lines.length} lines):                    │\n`;
    output += `└─────────────────────────────────────────────────────────────────────────────┘\n`;
    output += `\n`;
    
    // Show current content
    if (editorState.lines.length === 0 || (editorState.lines.length === 1 && editorState.lines[0] === '')) {
      output += `(Empty file - start typing to add content)\n`;
    } else {
      editorState.lines.forEach((line, index) => {
        output += `${(index + 1).toString().padStart(3)}: ${line}\n`;
      });
    }
    
    output += `\n`;
    output += `┌─ Multi-line Navigation Example ────────────────────────────────────────────┐\n`;
    output += `│ To demonstrate multi-line traversal:                                      │\n`;
    output += `│                                                                             │\n`;
    output += `│ 1. Use arrow keys to move between lines                                    │\n`;
    output += `│ 2. Press Enter to create new lines                                         │\n`;
    output += `│ 3. Use Home/End to jump to line boundaries                                 │\n`;
    output += `│ 4. Use Page Up/Down to scroll through long files                           │\n`;
    output += `│ 5. Use Ctrl+Home/End to jump to file start/end                             │\n`;
    output += `│                                                                             │\n`;
    output += `│ The cursor indicator [ ] shows your current position                        │\n`;
    output += `└─────────────────────────────────────────────────────────────────────────────┘\n`;
    output += `\n`;
    output += `┌─ Common Editor Shortcuts ──────────────────────────────────────────────────┐\n`;
    output += `│ Ctrl+C [COPY]  Ctrl+V [CUT]  Ctrl+P [PASTE]  Ctrl+F [FIND]                │\n`;
    output += `│ Ctrl+X [SAVE&EXIT]  Ctrl+S [SAVE]  Ctrl+U [UNDO]  Ctrl+Z [CLOSE]          │\n`;
    output += `└─────────────────────────────────────────────────────────────────────────────┘\n`;

    return output;
  }

  mkdir(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'mkdir: missing operand',
        error: true
      };
    }

    const dirPath = this.resolvePath(args[0]);
    const parentPath = this.getParentPath(dirPath);
    const dirName = this.getPathName(dirPath);
    const parent = this.getDirectory(parentPath);

    if (!parent) {
      return {
        success: false,
        output: `mkdir: cannot create directory '${args[0]}': No such file or directory`,
        error: true
      };
    }

    if (parent.contents[dirName]) {
      return {
        success: false,
        output: `mkdir: cannot create directory '${args[0]}': File exists`,
        error: true
      };
    }

    parent.contents[dirName] = { type: 'directory', contents: {} };
    this.filesystem[dirPath] = { type: 'directory', contents: {} };

    return {
      success: true,
      output: '',
      error: false
    };
  }

  touch(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'touch: missing file operand',
        error: true
      };
    }

    const filePath = this.resolvePath(args[0]);
    const parentPath = this.getParentPath(filePath);
    const fileName = this.getPathName(filePath);
    const parent = this.getDirectory(parentPath);

    if (!parent) {
      return {
        success: false,
        output: `touch: cannot touch '${args[0]}': No such file or directory`,
        error: true
      };
    }

    if (!parent.contents[fileName]) {
      parent.contents[fileName] = { type: 'file', content: '' };
      this.filesystem[filePath] = { type: 'file', content: '' };
    }

    return {
      success: true,
      output: '',
      error: false
    };
  }

  rm(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'rm: missing operand',
        error: true
      };
    }

    const filePath = this.resolvePath(args[0]);
    const parentPath = this.getParentPath(filePath);
    const fileName = this.getPathName(filePath);
    const parent = this.getDirectory(parentPath);

    if (!parent || !parent.contents[fileName]) {
      return {
        success: false,
        output: `rm: cannot remove '${args[0]}': No such file or directory`,
        error: true
      };
    }

    if (parent.contents[fileName].type === 'directory') {
      return {
        success: false,
        output: `rm: cannot remove '${args[0]}': Is a directory`,
        error: true
      };
    }

    delete parent.contents[fileName];
    delete this.filesystem[filePath];

    return {
      success: true,
      output: '',
      error: false
    };
  }

  rmdir(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'rmdir: missing operand',
        error: true
      };
    }

    const dirPath = this.resolvePath(args[0]);
    const parentPath = this.getParentPath(dirPath);
    const dirName = this.getPathName(dirPath);
    const parent = this.getDirectory(parentPath);

    if (!parent || !parent.contents[dirName]) {
      return {
        success: false,
        output: `rmdir: cannot remove '${args[0]}': No such file or directory`,
        error: true
      };
    }

    if (parent.contents[dirName].type !== 'directory') {
      return {
        success: false,
        output: `rmdir: cannot remove '${args[0]}': Not a directory`,
        error: true
      };
    }

    if (Object.keys(parent.contents[dirName].contents).length > 0) {
      return {
        success: false,
        output: `rmdir: cannot remove '${args[0]}': Directory not empty`,
        error: true
      };
    }

    delete parent.contents[dirName];
    delete this.filesystem[dirPath];

    return {
      success: true,
      output: '',
      error: false
    };
  }

  cp(args) {
    if (args.length < 2) {
      return {
        success: false,
        output: 'cp: missing file operand',
        error: true
      };
    }

    const sourcePath = this.resolvePath(args[0]);
    const destPath = this.resolvePath(args[1]);
    const source = this.getDirectory(sourcePath);

    if (!source) {
      return {
        success: false,
        output: `cp: cannot stat '${args[0]}': No such file or directory`,
        error: true
      };
    }

    const destParentPath = this.getParentPath(destPath);
    const destName = this.getPathName(destPath);
    const destParent = this.getDirectory(destParentPath);

    if (!destParent) {
      return {
        success: false,
        output: `cp: cannot create '${args[1]}': No such file or directory`,
        error: true
      };
    }

    destParent.contents[destName] = JSON.parse(JSON.stringify(source));
    this.filesystem[destPath] = JSON.parse(JSON.stringify(source));

    return {
      success: true,
      output: '',
      error: false
    };
  }

  mv(args) {
    if (args.length < 2) {
      return {
        success: false,
        output: 'mv: missing file operand',
        error: true
      };
    }

    const sourcePath = this.resolvePath(args[0]);
    const destPath = this.resolvePath(args[1]);
    const source = this.getDirectory(sourcePath);

    if (!source) {
      return {
        success: false,
        output: `mv: cannot stat '${args[0]}': No such file or directory`,
        error: true
      };
    }

    const sourceParentPath = this.getParentPath(sourcePath);
    const sourceName = this.getPathName(sourcePath);
    const sourceParent = this.getDirectory(sourceParentPath);

    const destParentPath = this.getParentPath(destPath);
    const destName = this.getPathName(destPath);
    const destParent = this.getDirectory(destParentPath);

    if (!destParent) {
      return {
        success: false,
        output: `mv: cannot create '${args[1]}': No such file or directory`,
        error: true
      };
    }

    // Move the item
    destParent.contents[destName] = source;
    delete sourceParent.contents[sourceName];
    delete this.filesystem[sourcePath];
    this.filesystem[destPath] = source;

    return {
      success: true,
      output: '',
      error: false
    };
  }

  echo(args) {
    const text = args.join(' ').replace(/^["']|["']$/g, '');
    return {
      success: true,
      output: text,
      error: false
    };
  }

  grep(args) {
    if (args.length < 2) {
      return {
        success: false,
        output: 'grep: missing file operand',
        error: true
      };
    }

    const pattern = args[0];
    const filePath = this.resolvePath(args[1]);
    const file = this.getDirectory(filePath);

    if (!file) {
      return {
        success: false,
        output: `grep: ${args[1]}: No such file or directory`,
        error: true
      };
    }

    if (file.type !== 'file') {
      return {
        success: false,
        output: `grep: ${args[1]}: Is a directory`,
        error: true
      };
    }

    const lines = (file.content || '').split('\n');
    const matches = lines.filter(line => line.includes(pattern));
    
    return {
      success: true,
      output: matches.join('\n'),
      error: false
    };
  }

  find(args) {
    if (args.length < 2) {
      return {
        success: false,
        output: 'find: missing file operand',
        error: true
      };
    }

    const searchPath = this.resolvePath(args[0]);
    const pattern = args[1];
    const results = this.findFiles(searchPath, pattern);

    return {
      success: true,
      output: results.join('\n'),
      error: false
    };
  }

  head(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'head: missing file operand',
        error: true
      };
    }

    const filePath = this.resolvePath(args[0]);
    const file = this.getDirectory(filePath);

    if (!file) {
      return {
        success: false,
        output: `head: cannot open '${args[0]}' for reading: No such file or directory`,
        error: true
      };
    }

    if (file.type !== 'file') {
      return {
        success: false,
        output: `head: error reading '${args[0]}': Is a directory`,
        error: true
      };
    }

    const lines = (file.content || '').split('\n');
    const numLines = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10;
    const result = lines.slice(0, numLines).join('\n');

    return {
      success: true,
      output: result,
      error: false
    };
  }

  tail(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'tail: missing file operand',
        error: true
      };
    }

    const filePath = this.resolvePath(args[0]);
    const file = this.getDirectory(filePath);

    if (!file) {
      return {
        success: false,
        output: `tail: cannot open '${args[0]}' for reading: No such file or directory`,
        error: true
      };
    }

    if (file.type !== 'file') {
      return {
        success: false,
        output: `tail: error reading '${args[0]}': Is a directory`,
        error: true
      };
    }

    const lines = (file.content || '').split('\n');
    const numLines = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10;
    const result = lines.slice(-numLines).join('\n');

    return {
      success: true,
      output: result,
      error: false
    };
  }

  wc(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'wc: missing file operand',
        error: true
      };
    }

    const filePath = this.resolvePath(args[0]);
    const file = this.getDirectory(filePath);

    if (!file) {
      return {
        success: false,
        output: `wc: ${args[0]}: No such file or directory`,
        error: true
      };
    }

    if (file.type !== 'file') {
      return {
        success: false,
        output: `wc: ${args[0]}: Is a directory`,
        error: true
      };
    }

    const content = file.content || '';
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    const chars = content.length;

    return {
      success: true,
      output: `${lines} ${words} ${chars} ${args[0]}`,
      error: false
    };
  }

  sort(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'sort: missing file operand',
        error: true
      };
    }

    const filePath = this.resolvePath(args[0]);
    const file = this.getDirectory(filePath);

    if (!file) {
      return {
        success: false,
        output: `sort: cannot read: ${args[0]}: No such file or directory`,
        error: true
      };
    }

    if (file.type !== 'file') {
      return {
        success: false,
        output: `sort: read error: ${args[0]}: Is a directory`,
        error: true
      };
    }

    const lines = (file.content || '').split('\n');
    const sorted = lines.sort();
    const result = sorted.join('\n');

    return {
      success: true,
      output: result,
      error: false
    };
  }

  uniq(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'uniq: missing file operand',
        error: true
      };
    }

    const filePath = this.resolvePath(args[0]);
    const file = this.getDirectory(filePath);

    if (!file) {
      return {
        success: false,
        output: `uniq: ${args[0]}: No such file or directory`,
        error: true
      };
    }

    if (file.type !== 'file') {
      return {
        success: false,
        output: `uniq: ${args[0]}: Is a directory`,
        error: true
      };
    }

    const lines = (file.content || '').split('\n');
    const unique = [...new Set(lines)];
    const result = unique.join('\n');

    return {
      success: true,
      output: result,
      error: false
    };
  }

  chmod(args) {
    // Simplified chmod - just return success
    return {
      success: true,
      output: '',
      error: false
    };
  }

  whoami() {
    return {
      success: true,
      output: 'user',
      error: false
    };
  }

  date() {
    return {
      success: true,
      output: new Date().toString(),
      error: false
    };
  }

  history() {
    return {
      success: true,
      output: 'History not implemented in this simulator',
      error: false
    };
  }

  help() {
    const helpText = `Available commands:
ls          - List directory contents
cd          - Change directory
pwd         - Print working directory
cat         - Display file contents
less        - View file contents with paging
mkdir       - Create directory
touch       - Create file
rm          - Remove file
rmdir       - Remove directory
cp          - Copy file
mv          - Move/rename file
echo        - Display text
grep        - Search text in files
find        - Find files
head        - Display first lines of file
tail        - Display last lines of file
wc          - Count lines, words, characters
sort        - Sort lines
uniq        - Remove duplicate lines
chmod       - Change file permissions
whoami      - Display current user
date        - Display current date
history     - Display command history
help        - Show this help
options     - List all available commands
ai-edit     - Text editor (nano-like)
clear       - Clear screen

Network commands:
ping        - Send ICMP echo requests to hosts
nslookup    - Query DNS name servers
dig         - DNS lookup utility
traceroute  - Trace route to network host
netstat     - Print network connections
ip          - Show/manipulate network devices
route       - Show/manipulate routing table
arp         - Show/manipulate ARP cache
whois       - Query whois directory service
iwconfig    - Configure wireless interfaces
ifconfig    - Configure network interfaces (alias for ip)

Use 'command --help' for detailed help on any specific command.`;

    return {
      success: true,
      output: helpText,
      error: false
    };
  }

  getCommandHelp(command) {
    switch (command) {
      case 'ls':
        return this.lsHelp();
      case 'cd':
        return this.cdHelp();
      case 'pwd':
        return this.pwdHelp();
      case 'cat':
        return this.catHelp();
      case 'less':
        return this.lessHelp();
      case 'mkdir':
        return this.mkdirHelp();
      case 'touch':
        return this.touchHelp();
      case 'rm':
        return this.rmHelp();
      case 'rmdir':
        return this.rmdirHelp();
      case 'cp':
        return this.cpHelp();
      case 'mv':
        return this.mvHelp();
      case 'echo':
        return this.echoHelp();
      case 'grep':
        return this.grepHelp();
      case 'find':
        return this.findHelp();
      case 'head':
        return this.headHelp();
      case 'tail':
        return this.tailHelp();
      case 'wc':
        return this.wcHelp();
      case 'sort':
        return this.sortHelp();
      case 'uniq':
        return this.uniqHelp();
      case 'chmod':
        return this.chmodHelp();
      case 'whoami':
        return this.whoamiHelp();
      case 'date':
        return this.dateHelp();
      case 'history':
        return this.historyHelp();
      case 'options':
        return this.optionsHelp();
      case 'ai-edit':
        return this.aiEditHelp();
      case 'clear':
        return this.clearHelp();
      // Network commands
      case 'ping':
        return this.pingHelp();
      case 'nslookup':
        return this.nslookupHelp();
      case 'dig':
        return this.digHelp();
      case 'traceroute':
        return this.tracerouteHelp();
      case 'netstat':
        return this.netstatHelp();
      case 'ip':
        return this.ipHelp();
      case 'route':
        return this.routeHelp();
      case 'arp':
        return this.arpHelp();
      case 'whois':
        return this.whoisHelp();
      case 'iwconfig':
        return this.iwconfigHelp();
      case 'ifconfig':
        return this.ipHelp(); // ifconfig is alias for ip
      default:
        return {
          success: false,
          output: `No help available for command: ${command}`,
          error: true
        };
    }
  }

  clear() {
    // Save session history before clearing
    this.saveSessionHistory();
    
    return {
      success: true,
      output: 'CLEAR_SCREEN', // Special command for frontend to clear display
      error: false,
      clearScreen: true
    };
  }

  saveSessionHistory() {
    // This would save the current session history to a file accessible by administrators
    // For now, we'll simulate this functionality
    const sessionData = {
      timestamp: new Date().toISOString(),
      currentDir: this.currentDir,
      filesystem: this.filesystem,
      sessionId: this.sessionId || 'default'
    };
    
    // In a real implementation, this would save to a database or file system
    // accessible by administrators
    console.log('Session history saved:', sessionData);
    
    return sessionData;
  }

  // Network command implementations
  async ping(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'ping: missing host operand\nTry \'ping --help\' for more information.',
        error: true
      };
    }

    const host = args[0];
    const options = {};
    
    // Parse common ping options
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '-c' && i + 1 < args.length) {
        options.count = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '-W' && i + 1 < args.length) {
        options.timeout = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '--help') {
        return this.pingHelp();
      }
    }

    try {
      return await this.networkService.ping(host, options);
    } catch (error) {
      return {
        success: false,
        output: `ping: ${error.message}`,
        error: true
      };
    }
  }

  async nslookup(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'nslookup: missing domain operand\nTry \'nslookup --help\' for more information.',
        error: true
      };
    }

    const domain = args[0];
    const options = {};
    
    // Parse nslookup options
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '-type' && i + 1 < args.length) {
        options.type = args[i + 1];
        i++;
      } else if (args[i] === '--help') {
        return this.nslookupHelp();
      }
    }

    try {
      return await this.networkService.nslookup(domain, options);
    } catch (error) {
      return {
        success: false,
        output: `nslookup: ${error.message}`,
        error: true
      };
    }
  }

  async dig(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'dig: missing domain operand\nTry \'dig --help\' for more information.',
        error: true
      };
    }

    const domain = args[0];
    const options = {};
    
    // Parse dig options
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '+type' && i + 1 < args.length) {
        options.type = args[i + 1];
        i++;
      } else if (args[i] === '--help') {
        return this.digHelp();
      }
    }

    try {
      return await this.networkService.dig(domain, options);
    } catch (error) {
      return {
        success: false,
        output: `dig: ${error.message}`,
        error: true
      };
    }
  }

  async traceroute(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'traceroute: missing host operand\nTry \'traceroute --help\' for more information.',
        error: true
      };
    }

    const host = args[0];
    const options = {};
    
    // Parse traceroute options
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '-m' && i + 1 < args.length) {
        options.maxHops = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '--help') {
        return this.tracerouteHelp();
      }
    }

    try {
      return await this.networkService.traceroute(host, options);
    } catch (error) {
      return {
        success: false,
        output: `traceroute: ${error.message}`,
        error: true
      };
    }
  }

  async netstat(args) {
    const options = {};
    
    // Parse netstat options
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-a') {
        options.all = true;
      } else if (args[i] === '-n') {
        options.numeric = true;
      } else if (args[i] === '-t') {
        options.tcp = true;
      } else if (args[i] === '-u') {
        options.udp = true;
      } else if (args[i] === '--help') {
        return this.netstatHelp();
      }
    }

    try {
      return await this.networkService.netstat(options);
    } catch (error) {
      return {
        success: false,
        output: `netstat: ${error.message}`,
        error: true
      };
    }
  }

  async ip(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'ip: missing operand\nTry \'ip --help\' for more information.',
        error: true
      };
    }

    const subcommand = args[0];
    
    if (subcommand === 'addr' && args[1] === 'show') {
      try {
        return await this.networkService.ipAddrShow();
      } catch (error) {
        return {
          success: false,
          output: `ip: ${error.message}`,
          error: true
        };
      }
    } else if (subcommand === '--help') {
      return this.ipHelp();
    } else {
      return {
        success: false,
        output: `ip: unknown command "${subcommand}"\nTry 'ip --help' for more information.`,
        error: true
      };
    }
  }

  async route(args) {
    const options = {};
    
    // Parse route options
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n') {
        options.numeric = true;
      } else if (args[i] === '--help') {
        return this.routeHelp();
      }
    }

    try {
      return await this.networkService.route(options);
    } catch (error) {
      return {
        success: false,
        output: `route: ${error.message}`,
        error: true
      };
    }
  }

  async arp(args) {
    const options = {};
    
    // Parse arp options
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-a') {
        options.all = true;
      } else if (args[i] === '--help') {
        return this.arpHelp();
      }
    }

    try {
      return await this.networkService.arp(options);
    } catch (error) {
      return {
        success: false,
        output: `arp: ${error.message}`,
        error: true
      };
    }
  }

  async whois(args) {
    if (args.length === 0) {
      return {
        success: false,
        output: 'whois: missing domain operand\nTry \'whois --help\' for more information.',
        error: true
      };
    }

    const domain = args[0];
    const options = {};
    
    // Parse whois options
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--help') {
        return this.whoisHelp();
      }
    }

    try {
      return await this.networkService.whois(domain, options);
    } catch (error) {
      return {
        success: false,
        output: `whois: ${error.message}`,
        error: true
      };
    }
  }

  async iwconfig(args) {
    const options = {};
    
    // Parse iwconfig options
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--help') {
        return this.iwconfigHelp();
      }
    }

    try {
      return await this.networkService.iwconfig();
    } catch (error) {
      return {
        success: false,
        output: `iwconfig: ${error.message}`,
        error: true
      };
    }
  }

  async ifconfig(args) {
    // Alias for ip addr show
    return this.ip(['addr', 'show']);
  }

  // Help methods for each command
  cdHelp() {
    return {
      success: true,
      output: `Usage: cd [DIRECTORY]
Change the current directory to DIRECTORY.

Arguments:
  DIRECTORY    The directory to change to. If not specified, changes to home directory.

Examples:
  cd /home/user/Documents    Change to Documents directory
  cd ..                      Go up one directory level
  cd ~                       Go to home directory
  cd                         Go to home directory`,
      error: false
    };
  }

  pwdHelp() {
    return {
      success: true,
      output: `Usage: pwd
Print the name of the current working directory.

This command displays the full path of the current directory.

Examples:
  pwd                        Print current directory`,
      error: false
    };
  }

  catHelp() {
    return {
      success: true,
      output: `Usage: cat [OPTION]... [FILE]...
Concatenate FILE(s) to standard output.

With no FILE, or when FILE is -, read standard input.

  -A, --show-all           equivalent to -vET
  -b, --number-nonblank    number nonempty output lines, overrides -n
  -e                       equivalent to -vE
  -E, --show-ends          display $ at end of each line
  -n, --number             number all output lines
  -s, --squeeze-blank      suppress repeated empty output lines
  -t                       equivalent to -vT
  -T, --show-tabs          display TAB characters as ^I
  -u                       (ignored)
  -v, --show-nonprinting   use ^ and M- notation, except for LFD and TAB
      --help        display this help and exit
      --version     output version information and exit

Examples:
  cat f - g  Output f's contents, then standard input, then g's contents.
  cat        Copy standard input to standard output.`,
      error: false
    };
  }

  lessHelp() {
    return {
      success: true,
      output: `                   SUMMARY OF LESS COMMANDS

      Commands marked with * may be preceded by a number, N.
      Notes in parentheses indicate the behavior if N is given.
      A key preceded by a caret indicates the Ctrl key; thus ^K is ctrl-K.

  h  H                 Display this help.
  q  :q  Q  :Q  ZZ     Exit.
 ---------------------------------------------------------------------------

                           MOVING

  e  ^E  j  ^N  CR  *  Forward  one line   (or N lines).
  y  ^Y  k  ^K  ^P  *  Backward one line   (or N lines).
  f  ^F  ^V  SPACE  *  Forward  one window (or N lines).
  b  ^B  ESC-v      *  Backward one window (or N lines).
  z                 *  Forward  one window (and set window to N).
  w                 *  Backward one window (and set window to N).
  ESC-SPACE         *  Forward  one window, but don't stop at end-of-file.
  d  ^D             *  Forward  one half-window (and set half-window to N).
  u  ^U             *  Backward one half-window (and set half-window to N).
  ESC-)  RightArrow *  Right one half screen width (or N positions).
  ESC-(  LeftArrow  *  Left  one half screen width (or N positions).
  ESC-}  ^RightArrow   Right to last column displayed.
  ESC-{  ^LeftArrow    Left  to first column.
  F                    Forward forever; like "tail -f".
  ESC-F                Like F but stop when search pattern is found.
  r  ^R  ^L            Repaint screen.
  R                    Repaint screen, discarding buffered input.
        ---------------------------------------------------
        Default "window" is the screen height.
        Default "half-window" is half of the screen height.
 ---------------------------------------------------------------------------

                          SEARCHING

  /pattern          *  Search forward for (N-th) matching line.
  ?pattern          *  Search backward for (N-th) matching line.
  n                 *  Repeat previous search (for N-th occurrence).
  N                 *  Repeat previous search in reverse direction.
  ESC-n             *  Repeat previous search, spanning files.
  ESC-N             *  Repeat previous search, reverse dir. & spanning files.
  ESC-u                Undo (toggle) search highlighting.
  ESC-U                Clear search highlighting.
  &pattern          *  Display only matching lines.
        ---------------------------------------------------
        A search pattern may begin with one or more of:
        ^N or !  Search for NON-matching lines.
        ^E or *  Search multiple files (pass thru END OF FILE).
        ^F or @  Start search at FIRST file (for /) or last file (for ?).
        ^K       Highlight matches, but don't move (KEEP position).
        ^R       Don't use REGULAR EXPRESSIONS.
        ^W       WRAP search if no match found.
 ---------------------------------------------------------------------------

                           JUMPING

  g  <  ESC-<       *  Go to first line in file (or line N).
  G  >  ESC->       *  Go to last line in file (or line N).
  p  %              *  Go to beginning of file (or N percent into file).
  t                 *  Go to the (N-th) next tag.
  T                 *  Go to the (N-th) previous tag.
  {  (  [           *  Find close bracket } ) ].
  }  )  ]           *  Find open bracket { ( [.
  ESC-^F <c1> <c2>  *  Find close bracket <c2>.
  ESC-^B <c1> <c2>  *  Find open bracket <c1>.
        ---------------------------------------------------
        Each "find close bracket" command goes forward to the close bracket
          matching the (N-th) open bracket in the top line.
        Each "find open bracket" command goes backward to the open bracket
          matching the (N-th) close bracket in the bottom line.

  m<letter>            Mark the current top line with <letter>.
  M<letter>            Mark the current bottom line with <letter>.
  '<letter>            Go to a previously marked position.
  ''                   Go to the previous position.
  ^X^X                 Same as '.
  ESC-M<letter>        Clear a mark.
        ---------------------------------------------------
        A mark is any upper-case or lower-case letter.
        Certain marks are predefined:
             ^  means  beginning of the file
             $  means  end of the file
 ---------------------------------------------------------------------------

                        CHANGING FILES

  :e [file]            Examine a new file.
  ^X^V                 Same as :e.
  :n                *  Examine the (N-th) next file from the command line.
  :p                *  Examine the (N-th) previous file from the command line.
  :x                *  Examine the first (or N-th) file from the command line.
  :d                   Delete the current file from the command line list.
  =  ^G  :f            Print current file name.
 ---------------------------------------------------------------------------

                    MISCELLANEOUS COMMANDS

  -<flag>              Toggle a command line option [see OPTIONS below].
  --<name>             Toggle a command line option, by name.
  _<flag>              Display the setting of a command line option.
  __<name>             Display the setting of an option, by name.
  +cmd                 Execute the less cmd each time a new file is examined.

  !command             Execute the shell command with $SHELL.
  |Xcommand            Pipe file between current pos & mark X to shell command.
  s file               Save input to a file.
  v                    Edit the current file with $VISUAL or $EDITOR.
  V                    Print version number of "less".
 ---------------------------------------------------------------------------

                           OPTIONS

        Most options may be changed either on the command line,
        or from within less by using the - or -- command.
        Options may be given in one of two forms: either a single
        character preceded by a -, or a name preceded by --.

  -?  ........  --help
                  Display help (from command line).
  -a  ........  --search-skip-screen
                  Search skips current screen.
  -A  ........  --SEARCH-SKIP-SCREEN
                  Search starts just after target line.
  -b [N]  ....  --buffers=[N]
                  Number of buffers.
  -B  ........  --auto-buffers
                  Don't automatically allocate buffers for pipes.
  -c  ........  --clear-screen
                  Repaint by clearing rather than scrolling.
  -d  ........  --dumb
                  Dumb terminal.
  -D xcolor  .  --color=xcolor
                  Set screen colors.
  -e  -E  ....  --quit-at-eof  --QUIT-AT-EOF
                  Quit at end of file.
  -f  ........  --force
                  Force open non-regular files.
  -F  ........  --quit-if-one-screen
                  Quit if entire file fits on first screen.
  -g  ........  --hilite-search
                  Highlight only last match for searches.
  -G  ........  --HILITE-SEARCH
                  Don't highlight any matches for searches.
  -h [N]  ....  --max-back-scroll=[N]
                  Backward scroll limit.
  -i  ........  --ignore-case
                  Ignore case in searches that do not contain uppercase.
  -I  ........  --IGNORE-CASE
                  Ignore case in all searches.
  -j [N]  ....  --jump-target=[N]
                  Screen position of target lines.
  -J  ........  --status-column
                  Display a status column at left edge of screen.
  -k [file]  .  --lesskey-file=[file]
                  Use a lesskey file.
  -K  ........  --quit-on-intr
                  Exit less in response to ctrl-C.
  -L  ........  --no-lessopen
                  Ignore the LESSOPEN environment variable.
  -m  -M  ....  --long-prompt  --LONG-PROMPT
                  Set prompt style.
  -n  -N  ....  --line-numbers  --LINE-NUMBERS
                  Don't use line numbers.
  -o [file]  .  --log-file=[file]
                  Copy to log file (standard input only).
  -O [file]  .  --LOG-FILE=[file]
                  Copy to log file (unconditionally overwrite).
  -p [pattern]  --pattern=[pattern]
                 Start at pattern (from command line).
  -P [prompt]   --prompt=[prompt]
                  Define new prompt.
  -q  -Q  ....  --quiet  --QUIET  --silent --SILENT
                  Quiet the terminal bell.
  -r  -R  ....  --raw-control-chars  --RAW-CONTROL-CHARS
                  Output "raw" control characters.
  -s  ........  --squeeze-blank-lines
                  Squeeze multiple blank lines.
  -S  ........  --chop-long-lines
                  Chop (truncate) long lines rather than wrapping.
  -t [tag]  ..  --tag=[tag]
                  Find a tag.
  -T [tagsfile] --tag-file=[tagsfile]
                  Use an alternate tags file.
  -u  -U  ....  --underline-special  --UNDERLINE-SPECIAL
                  Change handling of backspaces.
  -V  ........  --version
                  Display the version number of "less".
  -w  ........  --hilite-unread
                  Highlight first new line after forward-screen.
  -W  ........  --HILITE-UNREAD
                  Highlight first new line after any forward movement.
  -x [N[,...]]  --tabs=[N[,...]]
                  Set tab stops.
  -X  ........  --no-init
                  Don't use termcap init/deinit strings.
  -y [N]  ....  --max-forw-scroll=[N]
                  Forward scroll limit.
  -z [N]  ....  --window=[N]
                  Set size of window.
  -" [c[c]]  .  --quotes=[c[c]]
                  Set shell quote characters.
  -~  ........  --tilde
                  Don't display tildes after end of file.
  -# [N]  ....  --shift=[N]
                  Set horizontal scroll amount (0 = one half screen width).
                --file-size
                  Automatically determine the size of the input file.
                --follow-name
                  The F command changes files if the input file is renamed.
                --incsearch
                  Search file as each pattern character is typed in.
                --line-num-width=N
                  Set the width of the -N line number field to N characters.
                --mouse
                  Enable mouse input.
                --no-keypad
                  Don't send termcap keypad init/deinit strings.
                --no-histdups
                  Remove duplicates from command history.
                --rscroll=C
                  Set the character used to mark truncated lines.
                --save-marks
                  Retain marks across invocations of less.
                --status-col-width=N
                  Set the width of the -J status column to N characters.
                --use-backslash
                  Subsequent options use backslash as escape char.
                --use-color
                  Enables colored text.
                --wheel-lines=N
                  Each click of the mouse wheel moves N lines.


 ---------------------------------------------------------------------------

                          LINE EDITING

        These keys can be used to edit text being entered
        on the "command line" at the bottom of the screen.

 RightArrow ..................... ESC-l ... Move cursor right one character.
 LeftArrow ...................... ESC-h ... Move cursor left one character.
 ctrl-RightArrow  ESC-RightArrow  ESC-w ... Move cursor right one word.
 ctrl-LeftArrow   ESC-LeftArrow   ESC-b ... Move cursor left one word.
 HOME ........................... ESC-0 ... Move cursor to start of line.
 END ............................ ESC-$ ... Move cursor to end of line.
 BACKSPACE ................................ Delete char to left of cursor.
 DELETE ......................... ESC-x ... Delete char under cursor.
 ctrl-BACKSPACE   ESC-BACKSPACE ........... Delete word to left of cursor.
 ctrl-DELETE .... ESC-DELETE .... ESC-X ... Delete word under cursor.
 ctrl-U ......... ESC (MS-DOS only) ....... Delete entire line.
 UpArrow ........................ ESC-k ... Retrieve previous command line.
 DownArrow ...................... ESC-j ... Retrieve next command line.
 TAB ...................................... Complete filename & cycle.
 SHIFT-TAB ...................... ESC-TAB   Complete filename & reverse cycle.
 ctrl-L ................................... Complete filename, list all.`,
      error: false
    };
  }

  optionsHelp() {
    return {
      success: true,
      output: `Usage: options [OPTION]
List all available commands in the bash terminal simulator.

Options:
  --?     List all commands with descriptions and categories
  --help  Display this help message

Examples:
  options --?     Show complete list of all commands
  options --help  Show this help message
  options         Show this help message

This command provides a comprehensive overview of all commands
available in the bash terminal simulator, organized by category.`,
      error: false
    };
  }

  aiEditHelp() {
    return {
      success: true,
      output: `AI-Edit Text Editor - Nano-like Text Editor
==============================================

Usage: ai-edit [FILE]
       ai-edit --help

AI-Edit is a user-friendly text editor similar to nano, designed for
easy text editing in the bash terminal simulator.

ARGUMENTS:
  FILE    The file to edit. If the file doesn't exist, it will be created.
          If no file is specified, opens a blank file named 'untitled.txt'.

BASIC OPERATIONS:
  Opening Files:
    ai-edit filename.txt     Open existing file
    ai-edit newfile.txt      Create new file
    ai-edit /path/to/file    Open file with full path

KEYBOARD SHORTCUTS:
  File Operations:
    Ctrl+X  - Save and Exit (prompts for filename if new file)
    Ctrl+S  - Save changes (stay in editor)
    Ctrl+Z  - Exit with save prompt (asks to save or rename)
    Ctrl+O  - Open file
    Ctrl+N  - New file

  Navigation:
    Arrow Keys    - Move cursor
    Home/End      - Move to beginning/end of line
    Page Up/Down  - Move up/down by screen
    Ctrl+Home     - Move to beginning of file
    Ctrl+End      - Move to end of file

  Editing:
    Type text     - Insert characters at cursor
    Backspace     - Delete character before cursor
    Delete        - Delete character at cursor
    Enter         - Insert new line
    Tab           - Insert tab character

  Search & Replace:
    Ctrl+F  - Find text
    Ctrl+R  - Replace text
    F3      - Find next occurrence
    F4      - Find previous occurrence

  Help:
    Ctrl+H  - Show this help

SAVING FILES:
  Save and Exit (Ctrl+X):
    1. Press Ctrl+X
    2. If new file, enter filename
    3. Press Y to confirm saving
    4. Press Enter to execute

  Save Changes (Ctrl+S):
    1. Press Ctrl+S
    2. File is saved automatically
    3. Stay in editor

  Exit with Save Prompt (Ctrl+Z):
    1. Press Ctrl+Z
    2. Choose option:
       - Y: Save changes to current file
       - N: Save as new file (prompts for filename)
       - C: Cancel and return to editor

FEATURES:
  - Line numbers display
  - Status bar with cursor position
  - Modified file indicator
  - Auto-save capability
  - Search and replace functionality
  - Multiple file support
  - Syntax highlighting (basic)

EXAMPLES:
  ai-edit                     Open blank file (untitled.txt)
  ai-edit myfile.txt          Edit existing file
  ai-edit newdocument.txt     Create new file
  ai-edit --help              Show this help

NOTES:
  - This is a simulated editor interface for the terminal simulator
  - In a real terminal, the editor would be fully interactive
  - All keyboard shortcuts are displayed in the editor interface
  - Files are automatically saved to the simulator's filesystem

For more information about text editing, see the editor interface
when you run 'ai-edit filename'.`,
      error: false
    };
  }

  // Network command help methods
  pingHelp() {
    return {
      success: true,
      output: `Usage: ping [OPTION]... HOST
Send ICMP ECHO_REQUEST packets to network hosts.

OPTIONS:
  -c COUNT   stop after sending COUNT packets
  -W SECONDS timeout in seconds to wait for a reply
  --help     display this help and exit

DESCRIPTION:
  ping uses the ICMP protocol's mandatory ECHO_REQUEST datagram to elicit
  an ICMP ECHO_RESPONSE from a host or gateway.

  HOST may be a hostname or IP address.

EXAMPLES:
  ping google.com
  ping -c 4 google.com
  ping -W 5 8.8.8.8

NOTE: This command is sandboxed and only allows access to whitelisted domains.`,
      error: false
    };
  }

  nslookupHelp() {
    return {
      success: true,
      output: `Usage: nslookup [OPTION]... DOMAIN
Query Internet name servers interactively.

OPTIONS:
  -type=TYPE query for specific record type (A, AAAA, MX, etc.)
  --help     display this help and exit

DESCRIPTION:
  nslookup is a program to query Internet domain name servers.

  DOMAIN may be a hostname or IP address.

EXAMPLES:
  nslookup google.com
  nslookup -type=MX google.com
  nslookup 8.8.8.8

NOTE: This command is sandboxed and only allows access to whitelisted domains.`,
      error: false
    };
  }

  digHelp() {
    return {
      success: true,
      output: `Usage: dig [OPTION]... DOMAIN
DNS lookup utility.

OPTIONS:
  +type=TYPE query for specific record type (A, AAAA, MX, etc.)
  --help     display this help and exit

DESCRIPTION:
  dig (domain information groper) is a flexible tool for interrogating
  DNS name servers.

  DOMAIN may be a hostname or IP address.

EXAMPLES:
  dig google.com
  dig +type=MX google.com
  dig @8.8.8.8 google.com

NOTE: This command is sandboxed and only allows access to whitelisted domains.`,
      error: false
    };
  }

  tracerouteHelp() {
    return {
      success: true,
      output: `Usage: traceroute [OPTION]... HOST
Print the route packets trace to network host.

OPTIONS:
  -m MAXHOPS maximum number of hops (default: 30)
  --help     display this help and exit

DESCRIPTION:
  traceroute tracks the route packets taken from an IP network on their
  way to a given host.

  HOST may be a hostname or IP address.

EXAMPLES:
  traceroute google.com
  traceroute -m 15 google.com
  traceroute 8.8.8.8

NOTE: This command is sandboxed and only allows access to whitelisted domains.`,
      error: false
    };
  }

  netstatHelp() {
    return {
      success: true,
      output: `Usage: netstat [OPTION]...
Print network connections, routing tables, interface statistics.

OPTIONS:
  -a         show all connections (default: show connected)
  -n         show numerical addresses instead of trying to determine symbolic host names
  -t         show TCP connections
  -u         show UDP connections
  --help     display this help and exit

DESCRIPTION:
  netstat prints information about the Linux networking subsystem.

EXAMPLES:
  netstat
  netstat -a
  netstat -tuln
  netstat --help

NOTE: This command shows local network information only.`,
      error: false
    };
  }

  ipHelp() {
    return {
      success: true,
      output: `Usage: ip [OPTIONS] OBJECT { COMMAND | help }
Show / manipulate routing, network devices, interfaces and tunnels.

OBJECTS:
  addr       protocol address management
  link       network device configuration
  route      routing table management
  neigh      neighbour/ARP tables

COMMANDS:
  show       show information about objects
  add        add new objects
  del        delete objects
  set        change objects

EXAMPLES:
  ip addr show
  ip route show
  ip link show
  ip --help

NOTE: This command shows local network information only.`,
      error: false
    };
  }

  routeHelp() {
    return {
      success: true,
      output: `Usage: route [OPTION]...
Show / manipulate the IP routing table.

OPTIONS:
  -n         show numerical addresses instead of trying to determine symbolic host names
  --help     display this help and exit

DESCRIPTION:
  route manipulates the kernel's IP routing tables.

EXAMPLES:
  route
  route -n
  route --help

NOTE: This command shows local routing information only.`,
      error: false
    };
  }

  arpHelp() {
    return {
      success: true,
      output: `Usage: arp [OPTION]...
Manipulate the system ARP cache.

OPTIONS:
  -a         display (all) entries in current ARP table
  --help     display this help and exit

DESCRIPTION:
  arp manipulates the kernel's ARP cache in various ways.

EXAMPLES:
  arp
  arp -a
  arp --help

NOTE: This command shows local ARP table information only.`,
      error: false
    };
  }

  whoisHelp() {
    return {
      success: true,
      output: `Usage: whois [OPTION]... DOMAIN
Client for the whois directory service.

OPTIONS:
  --help     display this help and exit

DESCRIPTION:
  whois searches for an object in a RFC 3912 database.

  DOMAIN may be a hostname or IP address.

EXAMPLES:
  whois google.com
  whois 8.8.8.8
  whois --help

NOTE: This command is sandboxed and only allows access to whitelisted domains.`,
      error: false
    };
  }

  iwconfigHelp() {
    return {
      success: true,
      output: `Usage: iwconfig [INTERFACE] [OPTION]...
Configure a wireless network interface.

OPTIONS:
  --help     display this help and exit

DESCRIPTION:
  iwconfig is used to configure the parameters of a wireless network interface.

EXAMPLES:
  iwconfig
  iwconfig wlan0
  iwconfig --help

NOTE: This command shows wireless interface information only.`,
      error: false
    };
  }

  mkdirHelp() {
    return {
      success: true,
      output: `Usage: mkdir [OPTION]... DIRECTORY...
Create directories.

Arguments:
  DIRECTORY    The directory name(s) to create

Examples:
  mkdir newdir               Create a new directory
  mkdir dir1 dir2 dir3       Create multiple directories`,
      error: false
    };
  }

  touchHelp() {
    return {
      success: true,
      output: `Usage: touch [OPTION]... FILE...
Create empty files or update file timestamps.

Arguments:
  FILE    The file name(s) to create or update

Examples:
  touch newfile.txt          Create an empty file
  touch file1.txt file2.txt  Create multiple files`,
      error: false
    };
  }

  rmHelp() {
    return {
      success: true,
      output: `Usage: rm [OPTION]... FILE...
Remove files or directories.

Arguments:
  FILE    The file(s) to remove

Examples:
  rm file.txt                Remove a file
  rm file1.txt file2.txt     Remove multiple files

Note: This command only removes files, not directories. Use rmdir for directories.`,
      error: false
    };
  }

  rmdirHelp() {
    return {
      success: true,
      output: `Usage: rmdir [OPTION]... DIRECTORY...
Remove empty directories.

Arguments:
  DIRECTORY    The directory name(s) to remove

Examples:
  rmdir emptydir             Remove an empty directory
  rmdir dir1 dir2 dir3       Remove multiple empty directories

Note: Directories must be empty to be removed.`,
      error: false
    };
  }

  cpHelp() {
    return {
      success: true,
      output: `Usage: cp [OPTION]... SOURCE DEST
Copy files and directories.

Arguments:
  SOURCE    The source file or directory
  DEST      The destination file or directory

Examples:
  cp file.txt copy.txt       Copy file to new name
  cp file.txt /path/to/dir/  Copy file to directory`,
      error: false
    };
  }

  mvHelp() {
    return {
      success: true,
      output: `Usage: mv [OPTION]... SOURCE DEST
Move or rename files and directories.

Arguments:
  SOURCE    The source file or directory
  DEST      The destination file or directory

Examples:
  mv oldname.txt newname.txt Rename a file
  mv file.txt /path/to/dir/  Move file to directory`,
      error: false
    };
  }

  echoHelp() {
    return {
      success: true,
      output: `Usage: echo [OPTION]... [STRING]...
Display a line of text.

Arguments:
  STRING    The text to display

Examples:
  echo Hello World           Display "Hello World"
  echo "Hello World"         Display "Hello World" (with quotes)
  echo $HOME                 Display the value of HOME variable`,
      error: false
    };
  }

  grepHelp() {
    return {
      success: true,
      output: `Usage: grep [OPTION]... PATTERN [FILE]...
Search for patterns in files.

Arguments:
  PATTERN    The text pattern to search for
  FILE       The file(s) to search in

Examples:
  grep "hello" file.txt      Search for "hello" in file.txt
  grep "error" *.log         Search for "error" in all .log files`,
      error: false
    };
  }

  findHelp() {
    return {
      success: true,
      output: `Usage: find [PATH] [PATTERN]
Find files and directories.

Arguments:
  PATH      The directory to search in
  PATTERN   The pattern to match file names

Examples:
  find . "*.txt"             Find all .txt files in current directory
  find /home "file*"         Find files starting with "file" in /home`,
      error: false
    };
  }

  headHelp() {
    return {
      success: true,
      output: `Usage: head [OPTION]... [FILE]...
Display the first lines of files.

Arguments:
  FILE    The file(s) to display

Options:
  -n NUM    Display first NUM lines (default: 10)

Examples:
  head file.txt              Display first 10 lines
  head -n 5 file.txt         Display first 5 lines`,
      error: false
    };
  }

  tailHelp() {
    return {
      success: true,
      output: `Usage: tail [OPTION]... [FILE]...
Display the last lines of files.

Arguments:
  FILE    The file(s) to display

Options:
  -n NUM    Display last NUM lines (default: 10)

Examples:
  tail file.txt              Display last 10 lines
  tail -n 5 file.txt         Display last 5 lines`,
      error: false
    };
  }

  wcHelp() {
    return {
      success: true,
      output: `Usage: wc [OPTION]... [FILE]...
Count lines, words, and characters in files.

Arguments:
  FILE    The file(s) to count

Examples:
  wc file.txt                Count lines, words, characters in file.txt
  wc *.txt                   Count in all .txt files`,
      error: false
    };
  }

  sortHelp() {
    return {
      success: true,
      output: `Usage: sort [OPTION]... [FILE]...
Sort lines of text files.

Arguments:
  FILE    The file(s) to sort

Examples:
  sort file.txt              Sort lines in file.txt alphabetically
  sort file1.txt file2.txt   Sort lines from multiple files`,
      error: false
    };
  }

  uniqHelp() {
    return {
      success: true,
      output: `Usage: uniq [OPTION]... [FILE]...
Remove duplicate lines from sorted files.

Arguments:
  FILE    The file(s) to process

Examples:
  uniq file.txt              Remove duplicate lines from file.txt
  sort file.txt | uniq       Sort and remove duplicates`,
      error: false
    };
  }

  chmodHelp() {
    return {
      success: true,
      output: `Usage: chmod [OPTION]... MODE[,MODE]... FILE...
Change file permissions.

Arguments:
  MODE    The permission mode to set
  FILE    The file(s) to modify

Examples:
  chmod 755 file.txt         Set permissions to rwxr-xr-x
  chmod +x script.sh         Make script executable

Note: This is a simplified implementation in the simulator.`,
      error: false
    };
  }

  whoamiHelp() {
    return {
      success: true,
      output: `Usage: whoami
Print the current user name.

This command displays the username of the current user.

Examples:
  whoami                     Print current username`,
      error: false
    };
  }

  dateHelp() {
    return {
      success: true,
      output: `Usage: date [OPTION]...
Display or set the system date and time.

Examples:
  date                       Display current date and time
  date +%Y-%m-%d             Display date in YYYY-MM-DD format`,
      error: false
    };
  }

  historyHelp() {
    return {
      success: true,
      output: `Usage: history
Display command history.

This command shows the list of previously executed commands.

Examples:
  history                    Display command history

Note: History functionality is not fully implemented in this simulator.`,
      error: false
    };
  }

  clearHelp() {
    return {
      success: true,
      output: `Usage: clear
Clear the terminal screen.

This command clears the terminal display.

Examples:
  clear                      Clear the screen`,
      error: false
    };
  }

  // Helper methods
  resolvePath(inputPath) {
    if (inputPath.startsWith('/')) {
      return inputPath;
    }
    return this.joinPath(this.currentDir, inputPath);
  }

  joinPath(base, relative) {
    if (relative.startsWith('/')) {
      return relative;
    }
    
    const parts = base.split('/').filter(p => p);
    const relParts = relative.split('/').filter(p => p);
    
    for (const part of relParts) {
      if (part === '..') {
        parts.pop();
      } else if (part !== '.') {
        parts.push(part);
      }
    }
    
    return '/' + parts.join('/');
  }

  getDirectory(path) {
    // First check if it's a direct filesystem entry (directory)
    if (this.filesystem[path]) {
      return this.filesystem[path];
    }
    
    // If not found, check if it's a file within a directory
    const parentPath = this.getParentPath(path);
    const fileName = this.getPathName(path);
    const parent = this.filesystem[parentPath];
    
    if (parent && parent.type === 'directory' && parent.contents[fileName]) {
      return parent.contents[fileName];
    }
    
    return null;
  }

  getParentPath(path) {
    const parts = path.split('/').filter(p => p);
    if (parts.length <= 1) {
      return '/';
    }
    return '/' + parts.slice(0, -1).join('/');
  }

  getPathName(path) {
    const parts = path.split('/').filter(p => p);
    return parts[parts.length - 1] || '';
  }

  findFiles(searchPath, pattern) {
    const results = [];
    const searchDir = this.getDirectory(searchPath);
    
    if (!searchDir || searchDir.type !== 'directory') {
      return results;
    }

    const search = (dir, currentPath) => {
      for (const [name, item] of Object.entries(dir.contents)) {
        const itemPath = this.joinPath(currentPath, name);
        
        if (name.includes(pattern)) {
          results.push(itemPath);
        }
        
        if (item.type === 'directory') {
          search(item, itemPath);
        }
      }
    };

    search(searchDir, searchPath);
    return results;
  }
}

module.exports = BashSimulator;
