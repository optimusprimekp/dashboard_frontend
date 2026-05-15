import React, { useState, useEffect } from "react";
import mqtt from "mqtt";

const ChirpStackMqttComponent = () => {
  const [message, setMessage] = useState("");
  const [client, setClient] = useState(null);

  // Connect to ChirpStack MQTT broker
  useEffect(() => {
    // ChirpStack MQTT broker URL (replace with your broker's URL)
    const brokerUrl = "ws://35.154.195.248:8083/mqtt"; // Use wss:// if using WebSocket

    // MQTT options (replace with your username and password)
    const options = {
      username: "chirpstack_integration", // ChirpStack MQTT username
      password: "chirpstack_integration", // ChirpStack MQTT password
      clientId: "react-client", // Optional: specify a client ID
      clean: false, // Clean session
    };

    const mqttClient = mqtt.connect(brokerUrl, options);

    // Debugging logs
    mqttClient.on("connect", () => {
      console.log("Connected to ChirpStack MQTT broker");
      mqttClient.subscribe("application/+/device/+/event/up", (err) => {
        if (!err) {
          console.log("Subscribed to uplink events");
        } else {
          console.error("Error subscribing to topic:", err);
        }
      });
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT connection error:", err); // This will capture any errors during connection
    });

    mqttClient.on("message", (topic, payload) => {
      console.log(
        `Received message on topic ${topic}:`,
        JSON.parse(payload.toString())
      );
      setMessage(payload.toString());
    });

    mqttClient.on("reconnect", () => {
      console.log("Reconnecting to ChirpStack MQTT broker...");
    });

    mqttClient.on("close", () => {
      console.log("MQTT connection closed");
    });

    // Store client in state
    setClient(mqttClient);

    // Cleanup when the component unmounts
    return () => {
      mqttClient.end();
      console.log("Disconnected from ChirpStack MQTT broker");
    };
  }, []);

  // Publish a message (optional)
  const publishMessage = (message) => {
    if (client) {
      client.publish("application/1/device/1/command/down", message, (err) => {
        if (!err) {
          console.log(`Message published: ${message}`);
        } else {
          console.error("Error publishing message:", err);
        }
      });
    }
  };

  return (
    <div>
      <h1>ChirpStack MQTT in React</h1>
      <div>
        <h3>Received Message:</h3>
        <pre>{message}</pre>
      </div>
      <div>
        <button onClick={() => publishMessage("Test message")}>
          Publish Message
        </button>
      </div>
    </div>
  );
};

export default ChirpStackMqttComponent;
