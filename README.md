# KPConnectFrontend

## Introduction

KPConnectFrontend is a modern, React-based front-end application built with Vite. It is designed for managing and monitoring robot configurations and device statuses. The project integrates with backend APIs—including ChirpStack—and connects to an MQTT broker for real-time updates. It also provides weather information using the OpenWeatherMap API. The interface leverages Material UI (MUI) components to ensure a consistent and responsive user experience fileciteturn0file2.

## Features

- **Robot Configuration Management**  
  Configure robot settings such as motor parameters (duty cycle, frequency, temperature thresholds, and voltage/current thresholds) and other miscellaneous configuration settings including battery levels and device status intervals. The UI provides editable fields with validations to ensure safe value ranges.

- **Real-time Status Monitoring**  
  Monitor real-time device data, including distance travelled, firmware versions, and robot state. The integration with MQTT and API endpoints via ChirpStack enables live updates for immediate feedback fileciteturn0file10.

- **Weather Information View**  
  A weather view component fetches current weather data and a 5-day forecast from the OpenWeatherMap API. This component serves as an example use of external API consumption within the application fileciteturn0file11.

- **Development and Build Environment**  
  Powered by Vite for fast builds and hot module replacement, the project uses a Docker-based setup for containerization, as well as ESLint with a comprehensive configuration for JavaScript and React code quality fileciteturn0file2.

- **Responsive UI with Material UI**  
  Uses MUI components for icons, buttons, grids, typography, and other UI elements. The design is optimized for both desktop and mobile experiences.

## Requirements

Before using KPConnectFrontend, make sure you have the following prerequisites installed:

- **Node.js**  
  The project is developed and containerized using Node.js (refer to the Dockerfile for the specific version – node:20-alpine is used) fileciteturn0file2.

- **npm**  
  Node Package Manager is used for dependency management.

- **Environment Variables**  
  Configure the following environment variables either via a .env file or via your system:
  - `VITE_CHIRPSTACK_BASE_URL`: API endpoint for ChirpStack commands.
  - `VITE_CHIRPSTACK_TOKEN`: Access token for ChirpStack API.
  - `VITE_LOCAL_BASE_URL`: Base URL for local API endpoints.
  - `VITE_MQTT_URL`: MQTT broker URL.
  - `VITE_MQTT_USERNAME` and `VITE_MQTT_PASSWORD`: Credentials for MQTT.
  - (For the weather component) An OpenWeatherMap API key, e.g., replacing the demo key in WeatherView.

- **Modern Browser**  
  A modern browser that supports ES modules is recommended to run the application.

## Installation

Follow these steps to get the project running locally:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/kowalskidev/KPConnectFrontend.git
   cd KPConnectFrontend
   ```

2. **Install Dependencies**

   Use npm (or yarn if you prefer) to install the dependencies:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory of the project and add your configuration. For example:

   ```env
   VITE_CHIRPSTACK_BASE_URL=https://your-chirpstack-url.com/api
   VITE_CHIRPSTACK_TOKEN=your_chirpstack_token
   VITE_LOCAL_BASE_URL=http://localhost:3000
   VITE_MQTT_URL=ws://your-mqtt-url:port
   VITE_MQTT_USERNAME=your_mqtt_username
   VITE_MQTT_PASSWORD=your_mqtt_password
   ```

4. **Docker (Optional)**

   If you want to run the application inside a Docker container, use the provided Dockerfile:

   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5173
   CMD ["npm", "run", "dev"]
   ```

   Then build and run the container as needed.

## Usage

After installation, you can run the application in development mode or build it for production.

- **Development Mode**

  Start the development server with hot reloading:

  ```bash
  npm run dev
  ```

  This command starts Vite’s development server on port 5173 (or the one specified in your configuration) fileciteturn0file2.

- **Production Build**

  Compile and bundle the application for production deployment:

  ```bash
  npm run build
  ```

- **Preview Build**

  You can preview the production build locally:

  ```bash
  npm run preview
  ```

## Configuration

KPConnectFrontend is highly configurable:

- **API Endpoints and Tokens**

  The application makes API calls to backend services (for commands, configuration, and MQTT data) using environment variables. Modify these in your `.env` file to point to your desired endpoints.

- **UI Threshold and Editable Fields**

  The configuration UI includes many parameters for robot devices (for example, thresholds for motor duty cycle, voltage, and current). These are validated against specified minimum and maximum values, as detailed throughout the front-end code base fileciteturn0file0, fileciteturn0file5.

- **WeatherView Component**

  To update the weather information, replace the demo OpenWeatherMap API key in the WeatherView component with your actual key. You can also customize the city and units based on your needs.

- **ESLint Configuration**

  ESLint is set up with plugins for React, hooks, and refresh. Adjust the `.eslintrc` or `eslint.config.js` if you need to change linting rules, as shown in the configuration file fileciteturn0file2.

## Contributing

Contributions are welcome! To help improve KPConnectFrontend, please follow these guidelines:

- **Fork and Create a Branch**  
  Create a dedicated branch for your feature or bug fix.

- **Coding Standards**  
  Follow ESLint rules and consistent styling. Ensure your code is well tested and documented.

- **Submit a Pull Request**  
  Once your changes are ready, submit a pull request. Please include a detailed description of your changes and reference any relevant issues.

- **Documentation Updates**  
  Update documentation where necessary. This README should reflect any changes that affect installation, configuration, or usage.

- **Issue Reporting**  
  If you encounter any bugs or have suggestions, please file an issue on the GitHub repository.

Your contributions help build a stronger project and improve the overall experience for everyone using KPConnectFrontend.

------------------------------------------------------------
