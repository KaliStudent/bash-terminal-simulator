# Bash Terminal Simulator

A comprehensive educational tool that simulates a bash terminal environment with admin and student interfaces for teaching command line skills.

## Features

### For Students
- **Free Practice Mode**: Practice with a full bash terminal simulator without restrictions
- **Test Mode**: Take structured tests with command restrictions and time limits
- **Real-time Terminal**: Interactive terminal experience with command execution
- **Session Tracking**: All activities are logged for instructor review

### For Administrators
- **Student Management**: View all students and their activity
- **Test Creation**: Create custom tests with specific command restrictions
- **Activity Monitoring**: Real-time monitoring of student sessions
- **Grading System**: Grade test submissions with feedback
- **Session Analytics**: Detailed logs of all student commands and outputs

### Terminal Commands Supported
- **File Operations**: `ls`, `cd`, `pwd`, `cat`, `mkdir`, `touch`, `rm`, `rmdir`, `cp`, `mv`
- **Text Processing**: `echo`, `grep`, `find`, `head`, `tail`, `wc`, `sort`, `uniq`
- **System Commands**: `whoami`, `date`, `history`, `help`, `clear`, `chmod`
- **Extensible**: Plugin system for adding more commands

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bash-terminal-simulator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open your browser to `http://localhost:3000`
   - Default admin credentials: `admin` / `admin123`

### Production Deployment

1. **Build the client**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Usage

### Admin Interface
1. Login with admin credentials
2. Navigate to different sections:
   - **Students**: View all registered students and their activity
   - **Tests**: Create and manage tests with command restrictions
   - **Sessions**: Monitor active and completed sessions
   - **Submissions**: Grade test submissions

### Student Interface
1. Login with student credentials
2. Choose between:
   - **Free Practice**: Unrestricted terminal access
   - **Test Mode**: Take structured tests with specific requirements

### Creating Tests
1. Go to Admin Dashboard > Tests
2. Click "Create New Test"
3. Fill in test details:
   - Title and description
   - Instructions for students
   - Time limit (optional)
   - Restricted commands (comma-separated list)
4. Save and activate the test

## Architecture

### Backend (Node.js/Express)
- **Authentication**: JWT-based auth with role-based access
- **Database**: SQLite for simplicity and portability
- **API Routes**: RESTful API for all operations
- **Bash Simulator**: Custom implementation of bash commands
- **Session Management**: Track student activities and sessions

### Frontend (React)
- **Admin Dashboard**: Full-featured admin interface
- **Student Interface**: Clean terminal-focused UI
- **Real-time Updates**: WebSocket support for live monitoring
- **Responsive Design**: Works on desktop and mobile

### Database Schema
- **Users**: Admin and student accounts
- **Sessions**: Track student terminal sessions
- **Tests**: Test definitions and configurations
- **Activity Logs**: Command execution history
- **Submissions**: Test submissions and grades

## Extending the System

### Adding New Commands
1. Edit `server/services/bashSimulator.js`
2. Add your command to the `executeCommand` method
3. Implement the command logic
4. Update the help text

### Adding New Features
1. Create new API routes in `server/routes/`
2. Add corresponding React components
3. Update the database schema if needed
4. Test thoroughly

## Security Considerations

- All API endpoints require authentication
- Role-based access control (admin vs student)
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed description

## Roadmap

- [ ] WebSocket real-time terminal updates
- [ ] Advanced command plugins system
- [ ] Bulk student import/export
- [ ] Advanced analytics and reporting
- [ ] Mobile app support
- [ ] Integration with learning management systems
- [ ] Advanced test types (scenario-based, interactive)
- [ ] Command completion and history
- [ ] File upload/download support
- [ ] Multi-language support
