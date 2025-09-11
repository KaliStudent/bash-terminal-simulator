const { exec } = require('child_process');
const { promisify } = require('util');
const dns = require('dns').promises;
const os = require('os');

const execAsync = promisify(exec);

class NetworkService {
  constructor() {
    // Allowed domains for DNS lookups (whitelist approach)
    this.allowedDomains = [
      'google.com',
      'github.com',
      'stackoverflow.com',
      'wikipedia.org',
      'example.com',
      'localhost',
      '127.0.0.1',
      '::1'
    ];
    
    // Maximum timeout for network operations (5 seconds)
    this.maxTimeout = 5000;
    
    // Rate limiting to prevent abuse
    this.rateLimit = new Map();
    this.rateLimitWindow = 60000; // 1 minute
    this.maxRequestsPerWindow = 10;
  }

  // Rate limiting check
  checkRateLimit(ip) {
    const now = Date.now();
    const userRequests = this.rateLimit.get(ip) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < this.rateLimitWindow);
    
    if (recentRequests.length >= this.maxRequestsPerWindow) {
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimit.set(ip, recentRequests);
    return true;
  }

  // Validate domain against whitelist
  validateDomain(domain) {
    // Remove protocol and path
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    
    return this.allowedDomains.some(allowed => 
      cleanDomain === allowed || cleanDomain.endsWith('.' + allowed)
    );
  }

  // Safe ping command
  async ping(host, options = {}) {
    if (!this.validateDomain(host)) {
      return {
        success: false,
        output: `ping: ${host}: Name or service not known (restricted domain)`,
        error: true
      };
    }

    try {
      const count = options.count || 4;
      const timeout = options.timeout || 5;
      
      // Use system ping with timeout and count limits
      const command = process.platform === 'win32' 
        ? `ping -n ${count} -w ${timeout * 1000} ${host}`
        : `ping -c ${count} -W ${timeout} ${host}`;
      
      const { stdout, stderr } = await execAsync(command, { 
        timeout: this.maxTimeout,
        maxBuffer: 1024 * 1024 // 1MB max output
      });
      
      return {
        success: true,
        output: stdout || stderr,
        error: false
      };
    } catch (error) {
      return {
        success: false,
        output: `ping: ${error.message}`,
        error: true
      };
    }
  }

  // Safe nslookup command
  async nslookup(domain, options = {}) {
    if (!this.validateDomain(domain)) {
      return {
        success: false,
        output: `nslookup: ${domain}: Name or service not known (restricted domain)`,
        error: true
      };
    }

    try {
      const recordType = options.type || 'A';
      const command = `nslookup -type=${recordType} ${domain}`;
      
      const { stdout, stderr } = await execAsync(command, { 
        timeout: this.maxTimeout,
        maxBuffer: 1024 * 1024
      });
      
      return {
        success: true,
        output: stdout || stderr,
        error: false
      };
    } catch (error) {
      return {
        success: false,
        output: `nslookup: ${error.message}`,
        error: true
      };
    }
  }

  // Safe dig command
  async dig(domain, options = {}) {
    if (!this.validateDomain(domain)) {
      return {
        success: false,
        output: `dig: ${domain}: Name or service not known (restricted domain)`,
        error: true
      };
    }

    try {
      const recordType = options.type || 'A';
      const command = `dig ${recordType} ${domain}`;
      
      const { stdout, stderr } = await execAsync(command, { 
        timeout: this.maxTimeout,
        maxBuffer: 1024 * 1024
      });
      
      return {
        success: true,
        output: stdout || stderr,
        error: false
      };
    } catch (error) {
      return {
        success: false,
        output: `dig: ${error.message}`,
        error: true
      };
    }
  }

  // Safe traceroute command
  async traceroute(host, options = {}) {
    if (!this.validateDomain(host)) {
      return {
        success: false,
        output: `traceroute: ${host}: Name or service not known (restricted domain)`,
        error: true
      };
    }

    try {
      const maxHops = options.maxHops || 30;
      const command = process.platform === 'win32' 
        ? `tracert -h ${maxHops} ${host}`
        : `traceroute -m ${maxHops} ${host}`;
      
      const { stdout, stderr } = await execAsync(command, { 
        timeout: this.maxTimeout,
        maxBuffer: 1024 * 1024
      });
      
      return {
        success: true,
        output: stdout || stderr,
        error: false
      };
    } catch (error) {
      return {
        success: false,
        output: `traceroute: ${error.message}`,
        error: true
      };
    }
  }

  // Safe netstat command
  async netstat(options = {}) {
    try {
      const command = process.platform === 'win32' 
        ? 'netstat -an'
        : 'netstat -tuln';
      
      const { stdout, stderr } = await execAsync(command, { 
        timeout: this.maxTimeout,
        maxBuffer: 1024 * 1024
      });
      
      return {
        success: true,
        output: stdout || stderr,
        error: false
      };
    } catch (error) {
      return {
        success: false,
        output: `netstat: ${error.message}`,
        error: true
      };
    }
  }

  // Safe ip addr show command
  async ipAddrShow() {
    try {
      if (process.platform === 'win32') {
        // Use ipconfig on Windows
        const { stdout, stderr } = await execAsync('ipconfig /all', { 
          timeout: this.maxTimeout,
          maxBuffer: 1024 * 1024
        });
        
        return {
          success: true,
          output: stdout || stderr,
          error: false
        };
      } else {
        // Use ip addr show on Linux/Unix
        const { stdout, stderr } = await execAsync('ip addr show', { 
          timeout: this.maxTimeout,
          maxBuffer: 1024 * 1024
        });
        
        return {
          success: true,
          output: stdout || stderr,
          error: false
        };
      }
    } catch (error) {
      return {
        success: false,
        output: `ip: ${error.message}`,
        error: true
      };
    }
  }

  // Safe route command
  async route(options = {}) {
    try {
      const command = process.platform === 'win32' 
        ? 'route print'
        : 'route -n';
      
      const { stdout, stderr } = await execAsync(command, { 
        timeout: this.maxTimeout,
        maxBuffer: 1024 * 1024
      });
      
      return {
        success: true,
        output: stdout || stderr,
        error: false
      };
    } catch (error) {
      return {
        success: false,
        output: `route: ${error.message}`,
        error: true
      };
    }
  }

  // Safe arp command
  async arp(options = {}) {
    try {
      const command = process.platform === 'win32' 
        ? 'arp -a'
        : 'arp -a';
      
      const { stdout, stderr } = await execAsync(command, { 
        timeout: this.maxTimeout,
        maxBuffer: 1024 * 1024
      });
      
      return {
        success: true,
        output: stdout || stderr,
        error: false
      };
    } catch (error) {
      return {
        success: false,
        output: `arp: ${error.message}`,
        error: true
      };
    }
  }

  // Safe whois command
  async whois(domain, options = {}) {
    if (!this.validateDomain(domain)) {
      return {
        success: false,
        output: `whois: ${domain}: Name or service not known (restricted domain)`,
        error: true
      };
    }

    try {
      const command = `whois ${domain}`;
      
      const { stdout, stderr } = await execAsync(command, { 
        timeout: this.maxTimeout,
        maxBuffer: 1024 * 1024
      });
      
      return {
        success: true,
        output: stdout || stderr,
        error: false
      };
    } catch (error) {
      return {
        success: false,
        output: `whois: ${error.message}`,
        error: true
      };
    }
  }

  // Safe iwconfig command (Linux wireless)
  async iwconfig() {
    try {
      if (process.platform === 'win32') {
        return {
          success: false,
          output: 'iwconfig: command not found (Windows system)',
          error: true
        };
      }

      const { stdout, stderr } = await execAsync('iwconfig', { 
        timeout: this.maxTimeout,
        maxBuffer: 1024 * 1024
      });
      
      return {
        success: true,
        output: stdout || stderr,
        error: false
      };
    } catch (error) {
      return {
        success: false,
        output: `iwconfig: ${error.message}`,
        error: true
      };
    }
  }

  // Get system network information (safe alternative)
  async getSystemInfo() {
    try {
      const interfaces = os.networkInterfaces();
      const hostname = os.hostname();
      
      let output = `Hostname: ${hostname}\n\n`;
      output += `Network Interfaces:\n`;
      
      Object.keys(interfaces).forEach(name => {
        output += `\n${name}:\n`;
        interfaces[name].forEach(iface => {
          output += `  ${iface.family}: ${iface.address}`;
          if (iface.internal) output += ' (internal)';
          output += '\n';
        });
      });
      
      return {
        success: true,
        output: output,
        error: false
      };
    } catch (error) {
      return {
        success: false,
        output: `Error getting system info: ${error.message}`,
        error: true
      };
    }
  }
}

module.exports = NetworkService;
