/*
  AWAAZ — Arduino UNO Q sensor node
  ----------------------------------
  Role in the multi-device architecture:
    Sensing only. This device does NOT run any AI — it reads a physical
    sensor (water flow / panic button / power meter / ration scale) and
    pushes a small JSON event over WiFi to the AWAAZ backend running on
    the Snapdragon Copilot+ PC, which does the actual inference.

  Wiring (adjust to whichever sensor you bring):
    - Water flow sensor  -> digital pin D2 (interrupt, pulse counting)
    - Panic button       -> digital pin D3 (pulled HIGH, pressed = LOW)
    - Power/meter sensor -> analog pin A0

  Before flashing:
    1. Set WIFI_SSID / WIFI_PASS below to the hackathon venue network.
    2. Set SERVER_URL to the Snapdragon PC's LAN IP, e.g.
       http://192.168.1.42:5000/api/arduino/event
    3. Set SENSOR_TYPE to one of: water_flow | panic_button | power_meter | ration_scale
*/

#include <WiFi.h>
#include <WiFiClient.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID   = "YOUR_WIFI_SSID";
const char* WIFI_PASS   = "YOUR_WIFI_PASSWORD";
const char* SERVER_HOST = "192.168.1.42";   // Snapdragon PC LAN IP
const int   SERVER_PORT = 5000;
const char* SERVER_PATH = "/api/arduino/event";

const char* SENSOR_TYPE = "panic_button";   // change per demo scenario
const char* DEVICE_ID   = "AWZ-UNOQ-01";

const int SENSOR_PIN = 3;                   // panic button on D3 (change per wiring)
const unsigned long SEND_COOLDOWN_MS = 5000;

WiFiClient wifi;
HttpClient http(wifi, SERVER_HOST, SERVER_PORT);
unsigned long lastSent = 0;

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println(" connected!");
}

void sendEvent(int value) {
  StaticJsonDocument<256> doc;
  doc["sensorType"] = SENSOR_TYPE;
  doc["value"]      = value;
  doc["deviceId"]   = DEVICE_ID;

  String body;
  serializeJson(doc, body);

  http.beginRequest();
  http.post(SERVER_PATH);
  http.sendHeader("Content-Type", "application/json");
  http.sendHeader("Content-Length", body.length());
  http.beginBody();
  http.print(body);
  http.endRequest();

  int statusCode = http.responseStatusCode();
  String response = http.responseBody();
  Serial.print("POST -> "); Serial.println(statusCode);
  Serial.println(response);
}

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT_PULLUP);
  connectWiFi();
}

void loop() {
  bool triggered = (digitalRead(SENSOR_PIN) == LOW); // active-low button/sensor

  if (triggered && millis() - lastSent > SEND_COOLDOWN_MS) {
    Serial.println("Sensor triggered — sending event to Snapdragon PC");
    sendEvent(1);
    lastSent = millis();
  }

  delay(100);
}
