const fs = require('fs');
const path = require('path');

class BashSimulator {
  constructor() {
    this.currentDir = '/home/user';
    this.filesystem = this.initializeFilesystem();
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
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

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
        case 'clear':
          return this.clear();
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
    const path = this.resolvePath(args[0] || '.');
    const dir = this.getDirectory(path);
    
    if (!dir) {
      return {
        success: false,
        output: `ls: cannot access '${args[0] || '.'}': No such file or directory`,
        error: true
      };
    }

    if (dir.type !== 'directory') {
      return {
        success: false,
        output: `ls: cannot access '${args[0] || '.'}': Not a directory`,
        error: true
      };
    }

    const items = Object.keys(dir.contents);
    const longFormat = args.includes('-l');
    
    if (longFormat) {
      const details = items.map(item => {
        const itemPath = this.joinPath(path, item);
        const itemData = this.getDirectory(itemPath);
        const type = itemData?.type === 'directory' ? 'd' : '-';
        const permissions = 'rw-r--r--';
        const size = itemData?.type === 'file' ? (itemData.content?.length || 0) : 4096;
        return `${type}${permissions} 1 user user ${size} ${item}`;
      });
      return {
        success: true,
        output: details.join('\n'),
        error: false
      };
    }

    return {
      success: true,
      output: items.join('  '),
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
    if (args.length === 0) {
      return {
        success: false,
        output: 'cat: missing file operand',
        error: true
      };
    }

    const filePath = this.resolvePath(args[0]);
    const file = this.getDirectory(filePath);

    if (!file) {
      return {
        success: false,
        output: `cat: ${args[0]}: No such file or directory`,
        error: true
      };
    }

    if (file.type !== 'file') {
      return {
        success: false,
        output: `cat: ${args[0]}: Is a directory`,
        error: true
      };
    }

    return {
      success: true,
      output: file.content || '',
      error: false
    };
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
clear       - Clear screen`;

    return {
      success: true,
      output: helpText,
      error: false
    };
  }

  clear() {
    return {
      success: true,
      output: '\x1B[2J\x1B[0f', // ANSI escape codes to clear screen
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
    return this.filesystem[path];
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
