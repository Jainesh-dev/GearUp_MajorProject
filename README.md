# ⛑️ GearUp – Smart Mining Helmet Monitoring System

**An IoT and AI-based approach to improving worker safety in mining environments.**

GearUp is a Smart Mining Helmet Monitoring System designed to enhance safety in hazardous mining environments through IoT-based sensor monitoring, centralized data management, and planned AI-powered safety equipment detection.

The system combines an ESP32-based smart helmet with a web-based monitoring dashboard to help monitor environmental conditions and support worker safety management.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Hardware Components](#-hardware-components)
- [Software Modules](#-software-modules)
- [How It Works](#-how-it-works)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Environment Configuration](#-environment-configuration)
- [Future Enhancements](#-future-enhancements)
- [Project Status](#-project-status)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Overview

Mining environments can expose workers to hazardous conditions such as harmful gases, extreme temperatures, humidity, and physical impacts.

GearUp aims to address these challenges by integrating smart helmet sensors with a centralized software platform.

The project is designed around three major components:

1. **IoT Monitoring:** An ESP32-based helmet collects sensor readings from the surrounding environment.
2. **Web-Based Monitoring:** A backend API receives sensor data, while a PostgreSQL database stores monitoring records and a React dashboard presents the information.
3. **AI-Based Safety Detection:** A planned computer vision module using YOLO and OpenCV aims to identify workers and safety equipment through camera footage.

The ultimate goal is to provide a unified platform for mining safety monitoring.

---

## ✨ Key Features

### IoT-Based Helmet Monitoring
- Environmental temperature and humidity monitoring.
- Gas sensor readings using MQ-series sensors.
- Motion and acceleration monitoring.
- Infrared temperature measurement.
- ESP32-based wireless communication.

### Web-Based Monitoring Dashboard
- Centralized monitoring interface.
- Helmet monitoring information.
- Sensor data visualization.
- Backend API integration.
- Database-supported monitoring records.

### AI-Based Safety Monitoring (Planned)
- Worker detection using YOLO.
- Safety helmet detection.
- Safety vest detection.
- PPE compliance monitoring.
- Camera-based worker monitoring.

### Backend and Database
- REST API development using FastAPI.
- Data validation using Pydantic.
- Database operations using SQLAlchemy.
- PostgreSQL data storage.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | TanStack Router |
| Backend | Python, FastAPI |
| API Validation | Pydantic |
| ORM | SQLAlchemy |
| Database | PostgreSQL |
| IoT Firmware | ESP32, Arduino/C++ |
| Communication | Wi-Fi, HTTP |
| AI / Computer Vision (Planned) | YOLO, OpenCV, PyTorch |
| Development Tools | VS Code, Git, GitHub |

---

## 🏗️ System Architecture

```text
                 SMART MINING HELMET
                         |
              +----------+----------+
              |          |          |
            DHT11       MQ Sensors  ADXL345
              |          |          |
              +----------+----------+
                         |
                       ESP32
                         |
                    Wi-Fi / HTTP
                         |
                         v
                 FASTAPI BACKEND
                         |
                 Data Validation
                         |
                    SQLAlchemy
                         |
                         v
                  POSTGRESQL DB
                         |
                         v
                 REACT DASHBOARD
                         |
                 Monitoring Interface


          AI-BASED CAMERA MONITORING
                         |
                    Camera Feed
                         |
                      OpenCV
                         |
                    YOLO Model
                         |
              Worker / PPE Detection
                         |
               Safety Monitoring
```

*The AI camera-monitoring pipeline represents the planned integration.*

---

## 🔌 Hardware Components

| Component | Purpose |
|---|---|
| ESP32 | Main microcontroller and Wi-Fi communication |
| DHT11 | Temperature and humidity measurement |
| MQ2 | Gas and smoke sensing |
| MQ135 | Air-quality-related gas sensing |
| ADXL345 | Motion and acceleration measurement |
| MLX90614 | Non-contact infrared temperature measurement |
| OLED Display (SSD1306) | Local information display |

*The exact sensors and their integration may vary as hardware development progresses.*

---

## 💻 Software Modules

### 1. Frontend – React + TypeScript

The frontend provides the user interface for monitoring helmet data and accessing system information.

Responsibilities:
- Dashboard and monitoring interface.
- Navigation between application pages.
- Displaying sensor information.
- Communicating with backend APIs.

### 2. Backend – Python + FastAPI

The backend acts as the communication layer between the IoT hardware, database, and frontend.

Responsibilities:
- Receiving HTTP requests from ESP32.
- Validating incoming sensor data.
- Processing application requests.
- Managing database operations.
- Providing API endpoints to the frontend.

### 3. Database – PostgreSQL

PostgreSQL provides persistent storage for monitoring information.

Responsibilities:
- Storing sensor readings.
- Maintaining helmet-related records.
- Supporting historical monitoring and analysis.

### 4. AI Module – YOLO + OpenCV (Planned)

The planned computer vision module will process camera footage to identify workers and safety equipment.

Potential detection classes:
- Person
- Safety helmet
- No safety helmet
- Safety vest
- No safety vest

Additional compliance logic will be required to determine whether safety equipment is actually being worn by a particular worker.

---

## ⚙️ How It Works

1. Sensors connected to the smart helmet collect environmental and motion-related readings.
2. The ESP32 processes the sensor readings.
3. The ESP32 transmits available data to the backend through Wi-Fi using HTTP.
4. FastAPI receives and validates the incoming data.
5. SQLAlchemy handles database operations with PostgreSQL.
6. The React frontend communicates with the backend and presents monitoring information.
7. The planned AI module will analyse camera footage for worker and PPE detection.

---

## 📁 Project Structure

```text
GearUp/
│
├── Backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── ...
│   ├── requirements.txt
│   └── .env.example
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── Firmware/
│   └── ...
│
├── AI-Model/
│   └── ...
│
├── .gitignore
└── README.md
```

*Note: Update this structure to match the actual folders and files in your repository.*

---

## 🚀 Installation and Setup

### Prerequisites

Install the following before running the project:

- Python 3.10 or later (compatible with your dependencies)
- Node.js and npm
- PostgreSQL
- Git
- Arduino IDE or a compatible ESP32 development environment

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd GearUp
```

### 2. Backend Setup

Open a terminal:

```bash
cd Backend
```

Create and activate a virtual environment:

**Windows:**

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your environment variables as described below.

Start the FastAPI server:

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal, commonly:

```text
http://localhost:5173
```

### 4. ESP32 Firmware Setup

1. Open the firmware project in Arduino IDE.
2. Install the required sensor and ESP32 libraries.
3. Configure Wi-Fi credentials locally.
4. Configure the backend server IP address and correct API endpoint.
5. Upload the firmware to the ESP32.
6. Open Serial Monitor to inspect sensor readings and HTTP responses.

Make sure the ESP32 and backend computer are connected to the same network.

---

## 🔐 Environment Configuration

Create a local `.env` file inside the `Backend` directory.

Example:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/YOUR_DATABASE
```

Replace the placeholders with your local PostgreSQL credentials and database name.

**Security Notice:**
- Never commit `.env` files.
- Never publish database passwords or Wi-Fi credentials.
- Keep real credentials private.
- Use `.env.example` to document required configuration variables without including secrets.

---

## 🔮 Future Enhancements

- Integration of a trained YOLO model for PPE detection.
- Real-time camera-based worker monitoring.
- Worker-to-PPE association and compliance analysis.
- Worker presence monitoring in designated mining areas.
- Automated safety alerts for abnormal environmental readings.
- Historical sensor data analysis and reporting.
- Improved helmet battery monitoring.
- Cloud-based monitoring and remote access.

---

## 📊 Project Status

**GearUp is currently under development.**

| Module | Status |
|---|---|
| ESP32 sensor integration | Under development |
| Sensor data transmission | Under development |
| FastAPI backend | Under development |
| PostgreSQL integration | Under development |
| React monitoring dashboard | Under development |
| YOLO-based PPE detection | Planned |
| Camera-based worker monitoring | Planned |
| Integrated safety alert system | Future enhancement |

*Update these statuses as each module is implemented and tested.*

---

## 🌟 What Makes GearUp Different?

GearUp focuses on combining IoT-based environmental monitoring with AI-assisted visual safety monitoring in one mining-focused platform.

Unlike a standalone sensor monitoring system, the proposed solution aims to combine:

- Smart helmet-based environmental monitoring.
- Centralized web-based monitoring.
- Historical data management.
- AI-assisted worker and PPE detection.
- A foundation for more comprehensive mining safety analysis.

This integrated approach aims to make mining safety monitoring more accessible, organized, and intelligent.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit your changes.
5. Open a Pull Request.

---

## 📄 License

This project is developed as an academic major project.

A formal open-source license can be added to the repository if the project is intended to permit reuse and redistribution.

---

## 👨‍💻 Developed As

**Major Project – GearUp: Smart Mining Helmet Monitoring System**

*Building safer mining environments through IoT, software engineering, and intelligent monitoring.*

