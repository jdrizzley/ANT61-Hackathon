# Unified Satellite Threat Monitor

A comprehensive satellite threat monitoring system that combines orbital simulation with real-time collision detection and space weather monitoring. Operators can input multiple satellites, receive real-time notifications of dangerous situations, and execute suggested mitigation actions.

## 🚀 Features

### Core Functionality
- **Multi-Satellite Management**: Input satellites manually or load from real APIs
- **Real-Time Monitoring**: Continuous threat assessment and alerting
- **Orbital Simulation**: Advanced orbital mechanics simulation using Kepler's equations
- **Collision Detection**: Predictive collision analysis between satellites
- **Space Weather Integration**: Real-time CME and geomagnetic storm monitoring
- **Automated Response**: Suggested actions with execution capabilities

### Data Sources
- **CelesTrak**: TLE (Two-Line Element) data for satellite positioning
- **NASA DONKI**: Coronal Mass Ejection (CME) events and analysis
- **NOAA Space Weather**: Geomagnetic storms and solar wind data
- **Space-Track.org**: Conjunction Data Messages (CDM) - planned integration

### Advanced Features
- **TLE-Based Positioning**: Real satellite data from CelesTrak
- **Custom Orbital Mechanics**: Manual satellite input with orbital parameters
- **Threat Assessment**: Multi-factor risk analysis
- **Action Execution**: Simulate orbital maneuvers and system responses
- **Real-Time Visualization**: Live satellite positions and trajectories

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd unified-satellite-system

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables (Optional)
Create a `.env` file for enhanced API access:
```bash
# NASA API Key (optional - defaults to DEMO_KEY)
VITE_NASA_API_KEY=your_nasa_api_key_here

# Space-Track.org credentials (for future CDM integration)
VITE_SPACETRACK_USERNAME=your_username
VITE_SPACETRACK_PASSWORD=your_password
```

## 📖 Usage

### Adding Satellites

#### Manual Input
1. Select "Manual Input" tab
2. Enter satellite parameters:
   - Name, orbit type (LEO/Polar/GEO/MEO)
   - Altitude, inclination, velocity
   - Orbit-specific parameters (eccentricity, RAAN, etc.)
3. Click "Add Satellite"

#### API Loading
1. Select "Load from APIs" tab
2. **By NORAD ID**: Enter satellite NORAD ID (e.g., 25544 for ISS)
3. **By Group**: Select satellite group and load multiple satellites

### Monitoring Threats

The system automatically monitors:
- **Conjunction Events**: Collision risks with space debris
- **Space Weather**: CME events and geomagnetic storms
- **Satellite Health**: Real-time status monitoring

### Simulation Control

- **Start/Stop Simulation**: Control orbital mechanics simulation
- **Speed Control**: Adjust simulation speed (0.1x to 10x)
- **Collision Prediction**: Analyze collision risks between satellites

### Executing Actions

When threats are detected:
1. Review suggested actions in the alert panel
2. Click "Execute Action" to simulate the response
3. Monitor results and adjust as needed

## 🏗️ Architecture

### Components
- **SatelliteForm**: Input and API loading interface
- **SatelliteList**: Display active satellites with real-time data
- **AlertPanel**: Threat notifications with suggested actions
- **SimulationControlPanel**: Simulation controls and analysis tools

### Hooks
- **useSatelliteData**: Main data management and simulation control

### Utilities
- **api.ts**: Real-time data fetching from space APIs
- **SatelliteSimulator.ts**: Orbital mechanics simulation engine

### Types
- **Satellite.ts**: Comprehensive type definitions for satellites, threats, and actions

## 🔧 Technical Details

### Orbital Mechanics
- Kepler's equation solving using Newton-Raphson method
- ECI (Earth-Centered Inertial) coordinate transformations
- TLE parsing and propagation using satellite.js
- Real-time position and velocity calculations

### Threat Assessment
- Multi-factor risk analysis (miss distance, probability, time to TCA)
- Space weather impact assessment
- Automated action suggestion based on threat level

### Simulation Engine
- Configurable time steps and simulation speed
- Real-time orbital propagation
- Collision prediction algorithms
- Action execution simulation

## 🌐 API Integration

### CelesTrak (Free)
- TLE data for 20+ satellite groups
- Real-time satellite positions
- No authentication required

### NASA DONKI (Free with API key)
- CME events and analysis
- Solar wind predictions
- Space weather alerts

### NOAA Space Weather (Free)
- Geomagnetic storm data
- Kp index monitoring
- Solar wind measurements

## 🚨 Alert System

### Alert Types
- **Critical**: High collision risk, fast CME events
- **Warning**: Medium collision risk, geomagnetic storms
- **Info**: Low-risk events, general notifications

### Suggested Actions
- **Evasive Maneuver**: Emergency orbit adjustments
- **Orbit Adjustment**: Planned trajectory changes
- **Power Down**: System protection during space weather
- **Attitude Change**: Orientation adjustments

## 🔮 Future Enhancements

### Planned Features
- **3D Visualization**: Three.js orbital visualization
- **Space-Track Integration**: Real CDM data for collision analysis
- **Machine Learning**: Predictive threat modeling
- **Multi-Mission Support**: Constellation management
- **Ground Station Integration**: Communication link monitoring

### API Expansions
- **ESA Space Debris**: European space debris data
- **JAXA**: Japanese space agency data
- **Commercial APIs**: SpaceX, OneWeb constellation data

## 🤝 Contributing

This project was built for the ANT61 Hackathon, combining:
- **Jackson's Repository**: Orbital simulation and satellite creation
- **Filip's Repository**: API integration and collision detection

### Development
```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 License

ISC License - Built for ANT61 Hackathon

## 🙏 Acknowledgments

- **CelesTrak**: Free satellite TLE data
- **NASA**: Space weather and CME data
- **NOAA**: Geomagnetic storm monitoring
- **satellite.js**: Orbital mechanics calculations
- **React & TypeScript**: Modern web development
- **Tailwind CSS**: Utility-first styling

---

**Built with ❤️ for ANT61 Hackathon - Unified Satellite Threat Monitoring System**
