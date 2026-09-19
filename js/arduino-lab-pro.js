/* Gia Huy — Arduino Lab Pro
 * Educational browser-side circuit workbench.
 * The simulator intentionally models supported components behaviorally; it does not claim SPICE-level fidelity.
 */
(function(){
  'use strict';
  const root=document.getElementById('arduinoSimulator');
  if(!root) return;
  const NS='http://www.w3.org/2000/svg';
  const STORAGE_KEY='gh_arduino_lab_pro_v1';
  const SCHEMA_VERSION=5;
  const $=(q)=>root.querySelector(q);
  const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const now=()=>new Date().toLocaleTimeString('vi-VN',{hour12:false});
  const id=(p,n)=>`${p}-${n}`;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const uid=(p)=>`${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const MODULE_FALLBACK=["Arduino Uno R3","Arduino Nano","Arduino Mega 2560","Arduino Leonardo","Arduino Micro","Arduino Pro Mini 5V","Arduino Pro Mini 3.3V","Arduino Due","Arduino Zero","Arduino MKR Zero","Arduino MKR WiFi 1010","Arduino Nano 33 IoT","Arduino Nano 33 BLE","Arduino Nano RP2040 Connect","Arduino Giga R1 WiFi","Arduino Portenta H7","ESP32 DevKit V1","ESP32 DevKitC","ESP32-S3 DevKitC","ESP32-C3 DevKitM","ESP32-C6 DevKitC","ESP32-S2 DevKit","ESP32-WROVER","NodeMCU ESP8266","Wemos D1 mini","Raspberry Pi Pico","Raspberry Pi Pico W","RP2040 Zero","Seeed XIAO RP2040","STM32 Blue Pill","STM32 Black Pill","STM32 Nucleo F401RE","STM32 Nucleo F411RE","STM32 Nucleo G071RB","Teensy 4.0","Teensy 4.1","Feather M0","Feather RP2040","Feather ESP32-S3","Circuit Playground Express","Arduino Ethernet Shield","Arduino Motor Shield","Arduino Sensor Shield","Arduino Proto Shield","Arduino CNC Shield","ESP32 Expansion Board 38-pin","ESP32 Expansion Board 30-pin","Breadboard 400 point","Breadboard 830 point","Mini Breadboard","HC-SR04","HC-SR05","VL53L0X","VL53L1X","VL6180X","Sharp IR GP2Y0A21","Sharp IR GP2Y0A02","GP2Y0A41","DHT11","DHT22","BME280","BMP280","BMP180","BMP388","SHT30","SHT31","SHT35","DS18B20","LM35","TMP36","MAX6675","BMP388 Sensor Module","BH1750","TSL2561","TSL2591","LDR Module","Photodiode Module","TCS3200","TCS34725","APDS9960 Gesture/Color","ML8511 UV Sensor","GUVA-S12SD UV Sensor","Rain Drop Sensor","Water Level Sensor","Water Flow YF-S201","Soil Moisture Resistive","Soil Moisture Capacitive","PIR HC-SR501","LM393 Sound Sensor","MAX9814 Microphone","MAX4466 Microphone","Piezo Buzzer","Active Buzzer","Passive Buzzer","Flame Sensor","MQ-2 Gas Sensor","MQ-3 Gas Sensor","MQ-4 Gas Sensor","MQ-5 Gas Sensor","MQ-6 Gas Sensor","MQ-7 Gas Sensor","MQ-9 Gas Sensor","MQ-135 Gas Sensor","A3144 Hall Sensor","Reed Switch","Tilt Switch","Vibration SW-420","TTP223 Touch","KY-040 Rotary Encoder","Push Button","4x4 Keypad","3x4 Keypad","Analog Joystick","10k Potentiometer","Slider Potentiometer","Rotary Encoder Module","IR Receiver VS1838B","IR LED","RFID RC522","PN532 NFC","HC-05 Bluetooth","HC-06 Bluetooth","HM-10 BLE","ESP-01 WiFi","W5500 Ethernet","NRF24L01","SX1278 LoRa","RA-02 LoRa","433MHz Transmitter","433MHz Receiver","GPS NEO-6M","GPS NEO-M8N","DS3231 RTC","DS1307 RTC","AT24C256 EEPROM","FRAM I2C","Micro SD Module","PCF8574 GPIO Expander","MCP23017 GPIO Expander","MCP3008 ADC","ADS1115 ADC","MCP3208 ADC","MCP4725 DAC","MCP4921 DAC","AD9833 Signal Generator","INA219 Current Sensor","INA226 Current Monitor","INA3221 Power Monitor","ACS712 Current Sensor","MAX7219 8x8 Matrix","TM1637 4-Digit Display","7-Segment Single Digit","8x8 LED Matrix","16x2 LCD Parallel","16x2 LCD I2C","20x4 LCD I2C","OLED SSD1306","OLED SH1106","TFT ILI9341","TFT ST7735","TFT ST7789","E-Paper 2.13","Nextion HMI","WS2812B LED","WS2812B Strip","NeoPixel Ring","Single LED","RGB LED Common Cathode","RGB LED Common Anode","LED Bargraph","Servo SG90","Servo MG90S","Servo MG996R","28BYJ-48 + ULN2003","NEMA17 Stepper","TT Gear Motor","Mini DC Motor","5V Fan","Mini Water Pump","Solenoid","L298N Motor Driver","TB6612FNG Motor Driver","DRV8833 Motor Driver","A4988 Stepper Driver","Relay 1-Channel","Relay 2-Channel","Relay 4-Channel","MOSFET Driver Module","BTS7960 Driver","Load Cell + HX711","Flex Sensor","Force Sensitive Resistor","MPU6050","MPU9250","BNO055","ADXL345","ADXL335","LIS3DH","HMC5883L","QMC5883L"];
  const MODULES=Object.keys(window.GH_ARDUINO_MODULE_REGISTRY_200?.modules||{}).length ? Object.keys(window.GH_ARDUINO_MODULE_REGISTRY_200.modules) : MODULE_FALLBACK;

  const categoryOf=(name)=>{
    const n=name.toLowerCase();
    if(/arduino|esp32|pico|stm32|teensy|feather|nodemcu|wemos|xiao|board|shield/.test(n)) return 'board';
    if(/lcd|oled|tft|e-paper|7-segment|matrix|display|nextion/.test(n)) return 'display';
    if(/servo|motor|pump|fan|solenoid|stepper|driver|relay|mosfet|bts7960/.test(n)) return 'motor';
    if(/button|keypad|joystick|potentiometer|encoder|led|buzzer|rfid|nfc|bluetooth|wifi|radio|usb|level shifter/.test(n)) return 'io';
    return 'sensor';
  };
  const supported = new Set([
    'ESP32 DevKit V1','Arduino Uno R3','Rain Drop Sensor','Soil Moisture Resistive','LDR Module','16x2 LCD I2C',
    'Servo SG90','Push Button','Single LED','Relay 1-Channel','Potentiometer 10k Module','HC-SR04',
    'DHT11','DHT22','DS18B20','PIR HC-SR501','Piezo Buzzer','Active Buzzer','Passive Buzzer',
    'BH1750','MPU6050','TM1637 4-Digit Display','OLED SSD1306','WS2812B LED','28BYJ-48 + ULN2003','L298N Motor Driver'
  ]);

  const templates={
    'ESP32 DevKit V1':{title:'ESP32 DevKit V1',sub:'38-pin • logic 3.3V',kind:'board',w:175,h:340,supportLevel:'native',logicVoltage:3.3,ports:[
      ['3V3','power',.12,.12,'left',{voltage:3.3}],['5V','power5',.12,.22,'left',{voltage:5}],['GND','ground',.12,.32,'left',{}],
      ['GPIO34','analog-in',.88,.10,'right',{analog:true,inputOnly:true}],['GPIO35','analog-in',.88,.18,'right',{analog:true,inputOnly:true}],['GPIO32','analog-in',.88,.26,'right',{analog:true}],['GPIO33','analog-in',.88,.34,'right',{analog:true}],
      ['GPIO21','i2c-sda',.88,.48,'right',{bus:'I2C'}],['GPIO22','i2c-scl',.88,.56,'right',{bus:'I2C'}],['GPIO13','digital-pwm',.88,.68,'right',{pwm:true}],['GPIO14','digital-pwm',.88,.76,'right',{pwm:true}],['GPIO27','digital-in',.88,.90,'right',{}]
    ]},
    'Arduino Uno R3':{title:'Arduino Uno R3',sub:'14 digital • 6 analog • 5V logic',kind:'board',w:185,h:300,supportLevel:'native',logicVoltage:5,ports:[
      ['5V','power5',.10,.12,'left',{voltage:5}],['GND','ground',.10,.22,'left',{}],['3V3','power',.10,.32,'left',{voltage:3.3}],
      ['A0','analog-in',.90,.10,'right',{analog:true}],['A1','analog-in',.90,.18,'right',{analog:true}],['A2','analog-in',.90,.26,'right',{analog:true}],['A3','analog-in',.90,.34,'right',{analog:true}],
      ['D2','digital-in',.90,.50,'right',{interrupt:true}],['D11','digital-pwm',.90,.62,'right',{pwm:true}],['D12','digital-in',.90,.72,'right',{}],['D13','digital-pwm',.90,.82,'right',{pwm:true}]
    ]},
    'Rain Drop Sensor':{title:'Cảm biến mưa',sub:'VCC • GND • AO • DO',kind:'sensor',w:150,h:105,supportLevel:'behavioral',ports:[['VCC','power',.14,.22,'left',{voltage:3.3}],['GND','ground',.14,.76,'left',{}],['AO','analog-out',.86,.30,'right',{analog:true}],['DO','digital-out',.86,.70,'right',{}]]},
    'Soil Moisture Resistive':{title:'Độ ẩm đất',sub:'VCC • GND • AO • DO',kind:'sensor',w:150,h:105,supportLevel:'behavioral',ports:[['VCC','power',.14,.22,'left',{voltage:3.3}],['GND','ground',.14,.76,'left',{}],['AO','analog-out',.86,.30,'right',{analog:true}],['DO','digital-out',.86,.70,'right',{}]]},
    'LDR Module':{title:'Cảm biến ánh sáng',sub:'VCC • GND • AO',kind:'sensor',w:145,h:100,supportLevel:'behavioral',ports:[['VCC','power',.14,.24,'left',{voltage:3.3}],['GND','ground',.14,.76,'left',{}],['AO','analog-out',.86,.50,'right',{analog:true}]]},
    '16x2 LCD I2C':{title:'LCD 1602 I2C',sub:'GND • VCC • SDA • SCL',kind:'display',w:165,h:108,supportLevel:'behavioral',ports:[['GND','ground',.12,.22,'left',{}],['VCC','power',.12,.50,'left',{voltage:5}],['SDA','i2c-sda',.88,.30,'right',{bus:'I2C'}],['SCL','i2c-scl',.88,.70,'right',{bus:'I2C'}]]},
    'Servo SG90':{title:'Servo SG90',sub:'VCC • GND • SIG',kind:'motor',w:135,h:100,supportLevel:'behavioral',ports:[['VCC','power5',.12,.22,'left',{voltage:5}],['GND','ground',.12,.76,'left',{}],['SIG','digital-pwm',.88,.50,'right',{pwm:true}]]},
    'Push Button':{title:'Nút nhấn',sub:'VCC • GND • SIG',kind:'io',w:130,h:92,supportLevel:'behavioral',ports:[['VCC','power',.14,.22,'left',{voltage:3.3}],['GND','ground',.14,.76,'left',{}],['SIG','digital-out',.86,.50,'right',{}]]},
    'Single LED':{title:'LED',sub:'A • K',kind:'io',w:110,h:84,supportLevel:'behavioral',ports:[['A','led-anode',.15,.42,'left',{}],['K','ground',.85,.58,'right',{}]]},
    'Relay 1-Channel':{title:'Relay 1 kênh',sub:'VCC • GND • IN • COM • NO',kind:'io',w:175,h:118,supportLevel:'behavioral',ports:[['VCC','power5',.10,.18,'left',{voltage:5}],['GND','ground',.10,.66,'left',{}],['IN','digital-in',.90,.26,'right',{}],['COM','relay-com',.90,.55,'right',{}],['NO','relay-no',.90,.80,'right',{}]]},
    'Potentiometer 10k Module':{title:'Biến trở 10k',sub:'VCC • GND • AO',kind:'sensor',w:145,h:98,supportLevel:'behavioral',ports:[['VCC','power',.14,.23,'left',{voltage:3.3}],['GND','ground',.14,.75,'left',{}],['AO','analog-out',.86,.50,'right',{analog:true}]]},
    'HC-SR04':{title:'HC-SR04',sub:'VCC • GND • TRIG • ECHO',kind:'sensor',w:160,h:112,supportLevel:'behavioral',ports:[['VCC','power5',.12,.20,'left',{voltage:5}],['GND','ground',.12,.72,'left',{}],['TRIG','digital-out',.88,.32,'right',{}],['ECHO','digital-in',.88,.70,'right',{}]]},
    'DHT11':{title:'DHT11',sub:'VCC • DATA • GND',kind:'sensor',w:140,h:102,supportLevel:'behavioral',ports:[['VCC','power',.12,.20,'left',{voltage:3.3}],['GND','ground',.12,.76,'left',{}],['DATA','digital-inout',.88,.48,'right',{protocol:'OneWire'}]]},
    'DHT22':{title:'DHT22',sub:'VCC • DATA • GND',kind:'sensor',w:145,h:106,supportLevel:'behavioral',ports:[['VCC','power',.12,.20,'left',{voltage:3.3}],['GND','ground',.12,.76,'left',{}],['DATA','digital-inout',.88,.48,'right',{protocol:'OneWire'}]]},
    'DS18B20':{title:'DS18B20',sub:'VCC • DATA • GND',kind:'sensor',w:145,h:100,supportLevel:'behavioral',ports:[['VCC','power',.12,.20,'left',{voltage:3.3}],['GND','ground',.12,.76,'left',{}],['DATA','digital-inout',.88,.50,'right',{protocol:'OneWire'}]]},
    'PIR HC-SR501':{title:'PIR HC-SR501',sub:'VCC • GND • OUT',kind:'sensor',w:150,h:105,supportLevel:'behavioral',ports:[['VCC','power',.12,.22,'left',{voltage:3.3}],['GND','ground',.12,.75,'left',{}],['OUT','digital-out',.88,.50,'right',{}]]},
    'Piezo Buzzer':{title:'Piezo Buzzer',sub:'+ • GND',kind:'io',w:120,h:90,supportLevel:'behavioral',ports:[['+','digital-pwm',.16,.48,'left',{pwm:true}],['GND','ground',.84,.65,'right',{}]]},
    'Active Buzzer':{title:'Active Buzzer',sub:'VCC • GND • SIG',kind:'io',w:135,h:90,supportLevel:'behavioral',ports:[['VCC','power',.12,.22,'left',{voltage:3.3}],['GND','ground',.12,.76,'left',{}],['SIG','digital-in',.88,.50,'right',{}]]},
    'Passive Buzzer':{title:'Passive Buzzer',sub:'VCC • GND • SIG',kind:'io',w:135,h:90,supportLevel:'behavioral',ports:[['VCC','power',.12,.22,'left',{voltage:3.3}],['GND','ground',.12,.76,'left',{}],['SIG','digital-pwm',.88,.50,'right',{pwm:true}]]},
    'BH1750':{title:'BH1750',sub:'VCC • GND • SDA • SCL',kind:'sensor',w:150,h:100,supportLevel:'behavioral',ports:[['VCC','power',.12,.22,'left',{voltage:3.3}],['GND','ground',.12,.76,'left',{}],['SDA','i2c-sda',.88,.34,'right',{bus:'I2C',address:0x23}],['SCL','i2c-scl',.88,.68,'right',{bus:'I2C'}]]},
    'MPU6050':{title:'MPU6050',sub:'VCC • GND • SDA • SCL • INT',kind:'sensor',w:160,h:112,supportLevel:'behavioral',ports:[['VCC','power',.12,.18,'left',{voltage:3.3}],['GND','ground',.12,.78,'left',{}],['SDA','i2c-sda',.88,.25,'right',{bus:'I2C',address:0x68}],['SCL','i2c-scl',.88,.50,'right',{bus:'I2C'}],['INT','interrupt',.88,.76,'right',{}]]},
    'TM1637 4-Digit Display':{title:'TM1637',sub:'VCC • GND • CLK • DIO',kind:'display',w:160,h:105,supportLevel:'behavioral',ports:[['VCC','power',.12,.20,'left',{voltage:5}],['GND','ground',.12,.75,'left',{}],['CLK','digital-out',.88,.34,'right',{}],['DIO','digital-inout',.88,.68,'right',{}]]},
    'OLED SSD1306':{title:'OLED SSD1306',sub:'VCC • GND • SDA • SCL',kind:'display',w:155,h:105,supportLevel:'behavioral',ports:[['VCC','power',.12,.20,'left',{voltage:3.3}],['GND','ground',.12,.76,'left',{}],['SDA','i2c-sda',.88,.34,'right',{bus:'I2C',address:0x3C}],['SCL','i2c-scl',.88,.68,'right',{bus:'I2C'}]]},
    'WS2812B LED':{title:'WS2812B',sub:'VCC • GND • DIN',kind:'io',w:130,h:92,supportLevel:'behavioral',ports:[['VCC','power',.12,.20,'left',{voltage:5}],['GND','ground',.12,.76,'left',{}],['DIN','digital-out',.88,.50,'right',{}]]},
    '28BYJ-48 + ULN2003':{title:'28BYJ-48 + ULN2003',sub:'VCC • GND • IN1..IN4',kind:'motor',w:175,h:115,supportLevel:'behavioral',ports:[['VCC','power5',.10,.18,'left',{voltage:5}],['GND','ground',.10,.78,'left',{}],['IN1','digital-in',.90,.20,'right',{}],['IN2','digital-in',.90,.40,'right',{}],['IN3','digital-in',.90,.60,'right',{}],['IN4','digital-in',.90,.80,'right',{}]]},
    'L298N Motor Driver':{title:'L298N',sub:'VS • GND • IN1 • IN2 • ENA',kind:'motor',w:175,h:125,supportLevel:'behavioral',ports:[['VS','power5',.10,.16,'left',{voltage:5}],['GND','ground',.10,.78,'left',{}],['IN1','digital-in',.90,.24,'right',{}],['IN2','digital-in',.90,.46,'right',{}],['ENA','digital-pwm',.90,.72,'right',{pwm:true}]]}
  };

  const state={
    board:'ESP32 DevKit V1', mode:'strict', activeTab:'diagnostics', filter:'ALL', subsystem:'ALL', search:'',
    components:[], wires:[], diagnostics:[], events:[], serial:[], probes:[], scope:[], logic:[],
    nextComp:1,nextWire:1, selectedPort:null, selectedComp:null, selectedWire:null, correctHint:null,
    zoom:1, panX:0, panY:0, pending:null, drag:null, running:false, simTimer:null, simTime:0,
    sensorStimulus:{temperature:25,humidity:50,light:500,rain:0,soil:50,distance:40,motion:0,pot:50},
    code:`const int LED_PIN = 13;\nconst int BUTTON_PIN = 27;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n  pinMode(BUTTON_PIN, INPUT);\n}\n\nvoid loop() {\n  int pressed = digitalRead(BUTTON_PIN);\n  digitalWrite(LED_PIN, pressed ? HIGH : LOW);\n  delay(100);\n}`,
    lastValidArtifact:null,
    lesson:null,
    history:[], historyIndex:-1,
    hydrated:false
  };

  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('id','labProSvg'); svg.setAttribute('viewBox','0 0 1200 760'); svg.setAttribute('preserveAspectRatio','none');
  const wireLayer=document.createElementNS(NS,'g'); const compLayer=document.createElementNS(NS,'g'); const overlayLayer=document.createElementNS(NS,'g');
  svg.append(wireLayer,compLayer,overlayLayer);

  function makeScaffold(){
    root.innerHTML=`<div class="lab-pro-shell">
      <header class="lab-pro-header">
        <div><span class="lab-pro-kicker">PHÒNG THÍ NGHIỆM VI ĐIỀU KHIỂN</span><h2>Arduino / ESP32 Interactive Lab</h2><p>Đặt linh kiện • nối đúng cổng • viết code • mô phỏng • chẩn đoán</p></div>
        <div class="lab-pro-statuses"><span id="lpBoardBadge"></span><span id="lpModeBadge"></span><span id="lpRunBadge"></span><span id="lpErrorBadge"></span></div>
      </header>
      <div class="lab-pro-toolbar">
        <button data-act="verify" class="lp-btn primary">✓ Verify</button><button data-act="compile" class="lp-btn">⚙ Compile</button><button data-act="run" class="lp-btn">▶ Run</button><button data-act="pause" class="lp-btn">⏸ Pause</button><button data-act="stop" class="lp-btn">■ Stop</button><button data-act="reset" class="lp-btn">↺ Reset</button><button data-act="undo" class="lp-btn">↶ Undo</button><button data-act="redo" class="lp-btn">↷ Redo</button><button data-act="export" class="lp-btn">⇩ Export</button><button data-act="import" class="lp-btn">⇧ Import</button><input id="lpImport" type="file" accept="application/json,.json" hidden>
        <select id="lpBoardSelect" class="lp-select"></select><select id="lpModeSelect" class="lp-select"><option value="strict">Strict</option><option value="sandbox">Sandbox</option></select>
        <button data-act="example" class="lp-btn">⚡ Mạch mẫu</button><button data-act="clear" class="lp-btn danger">Xóa mạch</button>
      </div>
      <div class="lab-pro-layout">
        <aside class="lp-library"><div class="lp-head"><b>THƯ VIỆN</b><span id="lpModuleCount"></span></div><div class="lp-search"><span>⌕</span><input id="lpModuleSearch" placeholder="Tìm module..."/></div><div id="lpCats" class="lp-pills"></div><div id="lpModuleList" class="lp-module-list"></div><div class="lp-lib-note">Ảnh linh kiện thật được tìm tự động từ Wikimedia Commons khi Lab mở. Nếu chưa tìm thấy, hệ thống tự dùng hình 2D dự phòng. Module <b>verified</b> mới được phép native runtime.</div></aside>
        <section class="lp-canvas-wrap"><div class="lp-canvas-head"><span><b>CANVAS</b> • Cổng vật lý / pin anchor</span><span><button data-act="zoomout">−</button><b id="lpZoom">100%</b><button data-act="zoomin">＋</button><button data-act="fit">Fit</button></span></div><div id="lpCanvas" class="lp-canvas" tabindex="0"></div><div id="lpNetBar" class="lp-netbar">Chưa chọn dây</div></section>
        <aside class="lp-right">
          <div class="lp-tabs" role="tablist"><button data-tab="diagnostics" class="active">Console <i id="lpConsoleCount">0</i></button><button data-tab="code">Code</button><button data-tab="serial">Serial</button><button data-tab="pins">Pins</button><button data-tab="scope">Scope</button><button data-tab="logic">Logic</button><button data-tab="events">Events</button></div>
          <section data-panel="diagnostics" class="lp-panel active"><div class="lp-summary"><div><span>Errors</span><b id="lpErrors">0</b></div><div><span>Warnings</span><b id="lpWarnings">0</b></div><div><span>Valid</span><b id="lpValid">0</b></div></div><div class="lp-filter-row"><button data-filter="ALL" class="active">All</button><button data-filter="ERROR">Error</button><button data-filter="CRITICAL">Critical</button><button data-filter="WARNING">Warning</button><button data-filter="SUCCESS">Success</button></div><div id="lpSubsystems" class="lp-filter-row small"></div><label class="lp-search console"><span>⌕</span><input id="lpConsoleSearch" placeholder="Tìm error, GPIO, module, net..."/></label><div id="lpConsoleList" class="lp-list"></div></section>
          <section data-panel="code" class="lp-panel"><div class="lp-code-head"><span>Arduino-style C/C++ • educational runtime</span><button data-act="loadcode" class="lp-mini-btn">Nạp mẫu</button></div><textarea id="lpCode" spellcheck="false"></textarea><div id="lpCodeStatus" class="lp-code-status">Chưa Verify code.</div><div class="lp-code-tools"><button data-act="compile">Compile</button><button data-act="verifycode">Verify code</button></div></section>
          <section data-panel="serial" class="lp-panel"><div class="lp-panel-tools"><b>Serial Monitor</b><button data-act="clearserial">Clear</button></div><pre id="lpSerial" class="lp-terminal"></pre></section>
          <section data-panel="pins" class="lp-panel"><div class="lp-panel-tools"><b>Pin / Net Inspector</b></div><div id="lpInspector" class="lp-inspector">Chọn component, pin hoặc dây trên canvas.</div><div id="lpStimulus" class="lp-stimulus"></div></section>
          <section data-panel="scope" class="lp-panel"><div class="lp-panel-tools"><b>Oscilloscope</b><button data-act="clearprobe">Clear</button></div><canvas id="lpScopeCanvas" width="520" height="260"></canvas><div id="lpScopeInfo" class="lp-small-note">Chọn một net để probe.</div></section>
          <section data-panel="logic" class="lp-panel"><div class="lp-panel-tools"><b>Logic Analyzer</b></div><div id="lpLogicList" class="lp-list"></div></section>
          <section data-panel="events" class="lp-panel"><div class="lp-panel-tools"><b>Events</b><button data-act="clearevents">Clear</button></div><div id="lpEventList" class="lp-list"></div></section>
        </aside>
      </div>
      <div class="lp-footerbar"><span id="lpHelp">Cắm dây: kéo từ chấm cổng này đến chấm cổng kia. Cổng hợp lệ sẽ sáng xanh.</span><span id="lpProgress">0/0</span></div>
    </div>
    <div id="lpModal" class="lp-modal" aria-hidden="true"><div class="lp-modal-card"><div id="lpModalIcon" class="lp-modal-icon">!</div><div class="lp-modal-content"><div id="lpModalTitle" class="lp-modal-title">KẾT NỐI SAI</div><div id="lpModalBody" class="lp-modal-body"></div><div id="lpModalRoute" class="lp-modal-route"></div><div id="lpModalActions" class="lp-modal-actions"><button data-modal="focus">Focus</button><button data-modal="correct">Chân đúng</button><button data-modal="why">Why?</button><button data-modal="close" class="primary">Đóng</button></div></div></div></div>`;
    $('#lpCanvas').appendChild(svg);
    $('#lpCode').value=state.code;
  }

  const boardNames=MODULES.filter(x=>categoryOf(x)==='board').slice(0,40);
  function initBoardSelect(){
    const sel=$('#lpBoardSelect'); sel.innerHTML=boardNames.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
    if(!boardNames.includes(state.board)) state.board='ESP32 DevKit V1'; sel.value=state.board;
    sel.addEventListener('change',()=>{state.board=sel.value; pushHistory('Chọn board'); ensureBoard(); renderAll(); save();});
  }
  function initCats(){
    const cats=[['all','Tất cả'],['board','Board'],['sensor','Cảm biến'],['display','Hiển thị'],['motor','Motor'],['io','I/O']];
    $('#lpCats').innerHTML=cats.map(([k,v],i)=>`<button data-cat="${k}" class="${i===0?'active':''}">${v}</button>`).join('');
    $('#lpCats').addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;$('#lpCats').querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderLibrary();});
  }
  function initSubsystems(){
    const subs=['ALL','WIRING','POWER','GPIO','BUS','UART','FIRMWARE','COMPILER','RUNTIME','ASSET','LESSON'];
    $('#lpSubsystems').innerHTML=subs.map(x=>`<button data-subsystem="${x}" class="${x==='ALL'?'active':''}">${x}</button>`).join('');
    $('#lpSubsystems').addEventListener('click',e=>{const b=e.target.closest('[data-subsystem]');if(!b)return;$('#lpSubsystems').querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.subsystem=b.dataset.subsystem;renderConsole();});
  }

  function syncIdCounters(){
    const compNums=state.components.map(c=>{const m=String(c?.id||'').match(/^C(\d+)$/);return m?Number(m[1]):0;});
    const wireNums=state.wires.map(w=>{const m=String(w?.id||'').match(/^W(\d+)$/);return m?Number(m[1]):0;});
    state.nextComp=Math.max(1,...compNums)+1;
    state.nextWire=Math.max(1,...wireNums)+1;
  }
  function hydrateComponent(c){
    const fresh=templateFor(c.type);
    const keep={id:c.id,type:c.type,x:c.x,y:c.y,rotation:c.rotation||0,status:c.status||'normal'};
    Object.assign(c,fresh,keep,{ports:fresh.ports||[],verification:fresh.verification||null});
    return c;
  }
  function save(){
    try{
      const payload={schemaVersion:SCHEMA_VERSION,registryVersion:window.GH_ARDUINO_MODULE_REGISTRY_200?.version||null,board:state.board,mode:state.mode,components:state.components,wires:state.wires,code:$('#lpCode')?.value||state.code,sensorStimulus:state.sensorStimulus,lesson:state.lesson,diagnostics:state.diagnostics,events:state.events};
      localStorage.setItem(STORAGE_KEY,JSON.stringify(payload));
    }catch(e){ addDiagnostic('ASSET002','WARNING','ASSET','Không thể lưu project vào trình duyệt.',{cause:e.message}); }
  }
  function load(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY); if(!raw) return false; const d=JSON.parse(raw); if(!d||!Array.isArray(d.components)||!Array.isArray(d.wires)) return false;
      state.board=d.board||state.board; state.mode=d.mode||'strict'; state.components=d.components.map(hydrateComponent); state.wires=d.wires; state.code=d.code||state.code; state.sensorStimulus={...state.sensorStimulus,...(d.sensorStimulus||{})}; state.lesson=d.lesson||null; state.diagnostics=Array.isArray(d.diagnostics)?d.diagnostics:[]; state.events=Array.isArray(d.events)?d.events:[];
      syncIdCounters();
      $('#lpCode').value=state.code; $('#lpModeSelect').value=state.mode; return true;
    }catch(e){return false;}
  }
  function pushHistory(label){
    const snap=JSON.stringify({components:state.components,wires:state.wires,board:state.board,mode:state.mode,code:$('#lpCode')?.value||state.code,sensorStimulus:state.sensorStimulus});
    state.history=state.history.slice(0,state.historyIndex+1); state.history.push({label,snap}); state.historyIndex=state.history.length-1;
    if(state.history.length>50){state.history.shift();state.historyIndex--;}
  }
  function restoreSnap(snap){const d=JSON.parse(snap);state.components=(d.components||[]).map(hydrateComponent);state.wires=d.wires||[];state.board=d.board;state.mode=d.mode;state.code=d.code||state.code;state.sensorStimulus={...state.sensorStimulus,...(d.sensorStimulus||{})};syncIdCounters();$('#lpCode').value=state.code;renderAll();save();}
  function templateFor(name){
    const reg=window.GH_ARDUINO_MODULE_REGISTRY_200?.modules?.[name];
    const local=templates[name];
    if(reg){
      const out=structuredClone(reg);
      if(local){
        out.supportLevel=local.supportLevel||out.supportLevel;
        out.behavior=local.behavior||out.behavior;
        out.simulation=local.simulation||out.simulation;
        out.sub=local.sub||out.sub;
      }
      return out;
    }
    if(local) return structuredClone(local);
    const kind=categoryOf(name);
    return {title:name,sub:`${kind} • UNVERIFIED`,kind,w:155,h:92,supportLevel:'unverified',logicVoltage:null,ports:[],verificationStatus:'unverified',verification:{status:'unverified'}};
  }
  function createComponent(name,x=120+Math.random()*600,y=100+Math.random()*460,silent=false){
    const t=templateFor(name); const c={...t,id:`C${state.nextComp++}`,type:name,x:clamp(x,8,1035-t.w),y:clamp(y,8,720-t.h),status:'normal',rotation:0,verification:t.verification||null}; state.components.push(c); if(!silent){pushHistory(`Thêm ${name}`);addEvent('COMPONENT_ADD',`Đã thêm ${name}.`,{componentId:c.id,verificationStatus:c.verificationStatus||'unverified'});} renderAll();save();return c;
  }
  function removeComponent(cid){
    const c=getComp(cid); if(!c)return; pushHistory(`Xóa ${c.title}`); state.wires=state.wires.filter(w=>w.source.componentId!==cid&&w.target.componentId!==cid); state.components=state.components.filter(x=>x.id!==cid); addEvent('COMPONENT_REMOVE',`Đã xóa ${c.title}.`,{componentId:cid}); renderAll();save();
  }
  function rotateComponent(cid){const c=getComp(cid);if(!c)return;pushHistory(`Xoay ${c.title}`);c.rotation=(c.rotation+90)%360;addEvent('ROTATE',`Đã xoay ${c.title} ${c.rotation}°.`,{componentId:cid});renderAll();save();}
  function getComp(cid){return state.components.find(c=>c.id===cid);}
  function getPort(c,pid){return c?.ports?.find(p=>p[0]===pid)||null;}
  function portMeta(c,pid){const p=getPort(c,pid);return p?{name:p[0],type:p[1],rx:p[2],ry:p[3],side:p[4],meta:p[5]||{}}:null;}
  function portPosition(c,pid){const p=portMeta(c,pid);if(!p)return null;let x=c.x+c.w*p.rx,y=c.y+c.h*p.ry; if(c.rotation===90||c.rotation===270){const cx=c.x+c.w/2,cy=c.y+c.h/2;const dx=x-cx,dy=y-cy;if(c.rotation===90){x=cx-dy;y=cy+dx;}else{x=cx+dy;y=cy-dx;}} return {x,y,side:p.side,type:p.type,meta:p.meta};}

  function portStatus(cid,pid){
    if(state.correctHint?.componentId===cid&&state.correctHint?.portId===pid) return 'correct';
    if(state.selectedPort?.componentId===cid&&state.selectedPort?.portId===pid) return 'selected';
    if(state.hoverPort?.componentId===cid&&state.hoverPort?.portId===pid&&state.pending){
      const r=validateConnection(state.pending.componentId,state.pending.portId,cid,pid);
      return r.ok?'candidate-valid':'candidate-invalid';
    }
    const related=state.wires.filter(w=>((w.source.componentId===cid&&w.source.portId===pid)||(w.target.componentId===cid&&w.target.portId===pid)));
    if(related.some(w=>w.validationState==='error'||w.validationState==='faulted')) return 'error';
    if(related.some(w=>w.validationState==='warning')) return 'warning';
    if(related.some(w=>w.validationState==='valid')) return 'valid';
    return 'idle';
  }
  function colorForKind(k){return k==='board'?'#4f46e5':k==='sensor'?'#0ea5e9':k==='display'?'#8b5cf6':k==='motor'?'#f59e0b':k==='io'?'#059669':'#64748b';}

  function svgEl(tag,attrs={}){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e;}
  function pathFor(a,b){const bend=Math.max(45,Math.min(180,Math.abs(b.x-a.x)*.42+30));const x1=a.x+(a.side==='right'?bend:-bend),x2=b.x+(b.side==='left'?-bend:bend);return `M ${a.x} ${a.y} C ${x1} ${a.y}, ${x2} ${b.y}, ${b.x} ${b.y}`;}
  function screenPoint(evt){const r=svg.getBoundingClientRect();let x=(evt.clientX-r.left)/r.width*1200;let y=(evt.clientY-r.top)/r.height*760;return {x:(x-state.panX)/state.zoom,y:(y-state.panY)/state.zoom};}
  function portAtEvent(evt){const p=screenPoint(evt);let best=null,bestD=Infinity;for(const c of state.components){for(const [name] of c.ports){const pp=portPosition(c,name);if(!pp)continue;const d=Math.hypot(pp.x-p.x,pp.y-p.y);if(d<22&&d<bestD){best={componentId:c.id,portId:name,d};bestD=d;}}}return best;}

  function realPhotoFor(name){return window.GH_ARDUINO_REAL_PHOTOS?.get(name)||null;}
  let photoRenderScheduled=false;
  function schedulePhotoRender(){if(photoRenderScheduled)return;photoRenderScheduled=true;requestAnimationFrame(()=>{photoRenderScheduled=false;renderAll();});}
  window.addEventListener('arduino:real-photo-ready',e=>{if(e.detail?.name)schedulePhotoRender();});
  function renderAll(){renderCanvas();renderConsole();renderInspector();renderSerial();renderEvents();renderScope();renderLogic();updateHeader();}
  function renderCanvas(){
    wireLayer.innerHTML='';compLayer.innerHTML='';overlayLayer.innerHTML='';
    const grid=svgEl('rect',{x:0,y:0,width:1200,height:760,fill:'url(#lpGrid)'});overlayLayer.appendChild(grid);
    for(const w of state.wires){
      const sc=getComp(w.source.componentId),tc=getComp(w.target.componentId);if(!sc||!tc)continue;const a=portPosition(sc,w.source.portId),b=portPosition(tc,w.target.portId);if(!a||!b)continue;
      const d=pathFor(a,b); wireLayer.appendChild(svgEl('path',{d,class:'lp-wire-shadow'}));
      const p=svgEl('path',{d,class:`lp-wire ${w.validationState||'valid'} ${state.selectedWire===w.id?'focus':''}`, 'data-wire':w.id});p.addEventListener('pointerdown',e=>{e.stopPropagation();state.selectedWire=w.id;state.selectedPort=null;renderAll();});wireLayer.appendChild(p);
      const e1=svgEl('circle',{cx:a.x,cy:a.y,r:6,class:'lp-wire-end '+(w.validationState==='valid'?'ok':'bad')});const e2=svgEl('circle',{cx:b.x,cy:b.y,r:6,class:'lp-wire-end '+(w.validationState==='valid'?'ok':'bad')});wireLayer.append(e1,e2);
    }
    for(const c of state.components){
      const g=svgEl('g',{class:`lp-comp ${c.status==='faulted'?'faulted':''}`,transform:`translate(${c.x} ${c.y}) rotate(${c.rotation} ${c.w/2} ${c.h/2})`,'data-comp':c.id});
      const box=svgEl('rect',{x:0,y:0,width:c.w,height:c.h,rx:14,class:'lp-comp-box'});g.appendChild(box);
      const photo=realPhotoFor(c.type); const visualSrc=photo?.realPhoto?photo.url:(c.assetRef||''); const asset=svgEl('image',{x:0,y:0,width:c.w,height:c.h,preserveAspectRatio:'xMidYMid slice',href:visualSrc});asset.setAttribute('data-asset',visualSrc||'');asset.setAttribute('data-real-photo',photo?.realPhoto?'1':'0');g.appendChild(asset);
      const shade=svgEl('rect',{x:0,y:0,width:c.w,height:22,rx:12,fill:'rgba(255,255,255,.84)'});g.appendChild(shade);
      const title=svgEl('text',{x:13,y:16,class:'lp-comp-title'});title.textContent=c.title;g.appendChild(title); const photoBadge=realPhotoFor(c.type)?.realPhoto; if(photoBadge){const ph=svgEl('rect',{x:c.w-78,y:4,width:66,height:16,rx:8,class:'lp-real-photo-pill'});g.appendChild(ph);const pt=svgEl('text',{x:c.w-45,y:15,class:'lp-real-photo-text','text-anchor':'middle'});pt.textContent='ẢNH THẬT';g.appendChild(pt);}
      const badge=svgEl('text',{x:c.w-9,y:c.h-8,class:'lp-comp-badge','text-anchor':'end'});{const v=c.verificationStatus||c.verification?.status||'unverified';badge.textContent=`${c.supportLevel==='native'?'NATIVE':c.supportLevel==='behavioral'?'BEHAVIOR':'CONNECT'} • ${v==='verified'?'✓':v.includes('variant')?'◌':'?'} 2D`; }g.appendChild(badge);
      for(const [name] of c.ports){const pp=portPosition(c,name);const rel={x:pp.x-c.x,y:pp.y-c.y};const grp=svgEl('g',{class:`lp-port ${portStatus(c.id,name)}`,'data-comp':c.id,'data-port':name});grp.appendChild(svgEl('circle',{cx:rel.x,cy:rel.y,r:11,class:'lp-port-hit'}));const tx=pp.side==='left'?rel.x+15:rel.x-15;const lab=svgEl('text',{x:tx,y:rel.y+3,class:'lp-port-label','text-anchor':pp.side==='left'?'start':'end'});lab.textContent=name;grp.appendChild(lab);grp.addEventListener('pointerdown',e=>startWire(e,c.id,name));grp.addEventListener('click',e=>{e.stopPropagation();portClick(c.id,name);});g.appendChild(grp);}
      g.addEventListener('pointerdown',e=>{if(e.target.closest('.lp-port'))return;startMove(e,c.id);});g.addEventListener('dblclick',e=>{e.stopPropagation();rotateComponent(c.id);});compLayer.appendChild(g);
    }
    if(state.pending){const c=getComp(state.pending.componentId),a=portPosition(c,state.pending.portId);if(a){overlayLayer.appendChild(svgEl('path',{d:pathFor(a,state.pending.cursor),class:'lp-wire preview'}));}}
    renderNetbar();
  }

  function renderNetbar(){
    const el=$('#lpNetBar'); if(!el)return;
    const w=state.selectedWire?state.wires.find(x=>x.id===state.selectedWire):null;
    if(!w){el.textContent='Chưa chọn dây • Chọn một dây để xem toàn bộ net.';return;}
    const sc=getComp(w.source.componentId),tc=getComp(w.target.componentId);
    const peers=state.wires.filter(x=>x.netId===w.netId&&x.validationState==='valid').length;
    el.innerHTML=`<b>NET ${esc(w.netId||w.id)}</b> · ${esc(sc?.title)}.${esc(w.source.portId)} → ${esc(tc?.title)}.${esc(w.target.portId)} · ${peers} connection`;
  }

  function startWire(e,cid,pid){
    if(e.button!==undefined&&e.button!==0)return; const p=portPosition(getComp(cid),pid);if(!p)return;state.pending={componentId:cid,portId:pid,cursor:{x:p.x,y:p.y,side:'left'}};state.selectedPort={componentId:cid,portId:pid};
    const move=ev=>{state.pending.cursor=screenPoint(ev);renderCanvas();}; const up=ev=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);const t=portAtEvent(ev);if(t&&!(t.componentId===cid&&t.portId===pid)){finishWire(cid,pid,t.componentId,t.portId);}else{state.pending=null;state.selectedPort=null;renderCanvas();}};
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);e.stopPropagation();
  }
  function portClick(cid,pid){if(!state.selectedPort){state.selectedPort={componentId:cid,portId:pid};renderAll();return;}const a=state.selectedPort;if(a.componentId===cid&&a.portId===pid){state.selectedPort=null;renderAll();return;}finishWire(a.componentId,a.portId,cid,pid);state.selectedPort=null;}
  function finishWire(sc,sp,tc,tp){
    const result=validateConnection(sc,sp,tc,tp); state.pending=null;
    if(result.ok){pushHistory(`Nối ${sp} → ${tp}`);const w={id:`W${state.nextWire++}`,source:{componentId:sc,portId:sp},target:{componentId:tc,portId:tp},validationState:'valid',faultState:null,netId:uid('NET'),createdAt:new Date().toISOString()};state.wires.push(w);addEvent('WIRE_OK',`Kết nối hợp lệ: ${componentName(sc)}.${sp} → ${componentName(tc)}.${tp}`,{wireId:w.id,netId:w.netId,source:sc,target:tc,sourcePin:sp,targetPin:tp});resolveRelated(sc,sp,tc,tp);renderAll();save();return;}
    const w={id:`W${state.nextWire++}`,source:{componentId:sc,portId:sp},target:{componentId:tc,portId:tp},validationState:'error',faultState:result.diagnostic.errorCode,netId:uid('FAULT'),committed:state.mode==='sandbox'};
    state.wires.push(w);getComp(sc).status='faulted';getComp(tc).status='faulted';state.selectedWire=w.id;addDiagnostic(result.diagnostic.errorCode,result.diagnostic.severity,result.diagnostic.subsystem,result.diagnostic.studentMessage,{...result.diagnostic,wireId:w.id,source:sc,target:tc,sourcePin:sp,targetPin:tp});addEvent('WIRE_ERROR',result.diagnostic.studentMessage,{wireId:w.id,errorCode:result.diagnostic.errorCode});renderAll();save();openDiagnostic(state.diagnostics[0]);
  }

  function compatiblePower(a,b){
    const av=a?.[5]?.voltage,bv=b?.[5]?.voltage;if(av==null||bv==null)return true;return Math.abs(av-bv)<0.15;
  }
  function portDirection(port){
    const type=port?.[1],meta=port?.[5]||{};
    return meta.direction||({power:'power-input',power5:'power-input',ground:'passive','analog-in':'input','analog-out':'output','digital':'bidirectional','digital-in':'input','digital-out':'output','digital-pwm':'output','digital-inout':'bidirectional','i2c-sda':'open-drain','i2c-scl':'open-drain','interrupt':'input','led-anode':'output','relay-com':'passive','relay-no':'passive'}[type]||'passive');
  }
  function validateConnection(sc,sp,tc,tp){
    const a=getComp(sc),b=getComp(tc),pa=getPort(a,sp),pb=getPort(b,tp); if(!a||!b||!pa||!pb)return {ok:false,diagnostic:makeDiag('WIRE004','ERROR','WIRING','Không xác định được cổng kết nối.',{expected:'port hợp lệ'})};
    const at=pa[1],bt=pb[1];
    const am=pa[5]||{},bm=pb[5]||{};
    if(at==='ground'&&bt==='ground')return {ok:true};
    if(at.startsWith('power')&&bt.startsWith('power')){
      if(!compatiblePower(pa,pb)){return {ok:false,diagnostic:makeDiag('PWR001','ERROR','POWER',`Sai điện áp: ${a.title}.${sp} không tương thích với ${b.title}.${tp}.`,{actual:am.voltage||'unknown',expected:bm.voltage||'module requirement',cause:'voltage-domain mismatch',suggestedFix:`Kiểm tra nguồn cho ${b.title}.`})};}
      return {ok:true};
    }
    if((at==='ground')!==(bt==='ground')&&(at==='ground'||bt==='ground'))return {ok:false,diagnostic:makeDiag('WIRE002','ERROR','WIRING',`${a.title}.${sp} là GND nhưng đang nối với ${b.title}.${tp}.`,{actual:at,expected:bt,cause:'ground-role mismatch',suggestedFix:'Nối GND với GND hoặc nối tín hiệu vào GPIO phù hợp.'})};
    const sourcePower=at.startsWith('power'),targetPower=bt.startsWith('power');
    if(sourcePower!==targetPower){
      if((sourcePower && !targetPower)||(targetPower&&!sourcePower)){
        const psrc=sourcePower?pa:pb,ptgt=sourcePower?pb:pa;const pv=psrc[5]?.voltage;
        if(['digital','digital-in','digital-out','digital-pwm','analog','analog-in','analog-out','i2c-sda','i2c-scl','interrupt','digital-inout'].includes(ptgt[1])) return {ok:false,diagnostic:makeDiag(pv>=4.5?'GPIO001':'WIRE002','ERROR','GPIO',`${a.title}.${sp} đang đưa nguồn ${pv||'?'}V vào cổng tín hiệu ${b.title}.${tp}.`,{actual:`${pv||'?'}V`,expected:'signal',cause:'power-signal mismatch',suggestedFix:`Không nối nguồn vào ${tp}; chọn GPIO hoặc cổng tín hiệu đúng.`})};
      }
      return {ok:true};
    }
    if((at==='i2c-sda'&&bt==='i2c-scl')||(at==='i2c-scl'&&bt==='i2c-sda'))return {ok:false,diagnostic:makeDiag('BUS004','ERROR','BUS',`SDA và SCL đang bị đảo: ${a.title}.${sp} → ${b.title}.${tp}.`,{actual:at,expected:bt,cause:'I2C mapping mismatch',suggestedFix:'SDA → SDA, SCL → SCL.'})};
    if(at==='analog-out'&&['digital','digital-in','digital-out','digital-pwm','interrupt'].includes(bt)||bt==='analog-out'&&['digital','digital-in','digital-out','digital-pwm','interrupt'].includes(at)){
      const board=boardComponent();const rec=board?.ports?.find(p=>['analog-in','analog'].includes(p[1])&&!isPortUsed(board.id,p[0]));return {ok:false,diagnostic:makeDiag('GPIO006','ERROR','GPIO',`${a.title}.${sp} là tín hiệu analog nhưng ${b.title}.${tp} không phải đầu vào ADC.`,{actual:at,expected:'analog/ADC input',cause:'analog-to-digital mismatch',suggestedFix:rec?`Chuyển tín hiệu sang ${board.title}.${rec[0]}.`:'Chọn một chân ADC đã được board profile xác minh.',recommendedTarget:rec?{componentId:board.id,portId:rec[0]}:null})};
    }
    if(['analog-in','analog'].includes(at)&&['analog-out','analog-in','analog'].includes(bt))return {ok:true};
    if(at.startsWith('i2c-')&&bt.startsWith('i2c-')&&at===bt)return {ok:true};
    if(at==='servo-signal')return {ok:true};
    const ad=portDirection(pa),bd=portDirection(pb);
    const signalish=new Set(['digital','digital-in','digital-out','digital-pwm','interrupt','digital-inout','analog','analog-in','analog-out','i2c-sda','i2c-scl','led-anode']);
    if(signalish.has(at)&&signalish.has(bt)){
      if((ad==='output'&&bd==='output')||(ad==='input'&&bd==='input'))return {ok:false,diagnostic:makeDiag('GPIO003','ERROR','GPIO',`Xung đột hướng tín hiệu: ${a.title}.${sp} (${ad}) ↔ ${b.title}.${tp} (${bd}).`,{actual:`${ad} → ${bd}`,expected:'output → input, bidirectional hoặc open-drain',cause:'pin-direction conflict',suggestedFix:'Chọn một chân nhận tín hiệu và một chân phát tín hiệu phù hợp.'})};
      return {ok:true};
    }
    if(at==='relay-com'||at==='relay-no'||bt==='relay-com'||bt==='relay-no')return {ok:true};
    return {ok:false,diagnostic:makeDiag('WIRE002','ERROR','WIRING',`${a.title}.${sp} không tương thích với ${b.title}.${tp}.`,{actual:at,expected:bt,cause:'port-type mismatch',suggestedFix:'Chọn cổng có vai trò điện tương thích.'})};
  }
  function boardComponent(){return state.components.find(c=>c.kind==='board')||null;}
  function isPortUsed(cid,pid){return state.wires.some(w=>((w.source.componentId===cid&&w.source.portId===pid)||(w.target.componentId===cid&&w.target.portId===pid))&&w.validationState==='valid');}
  function componentName(cid){return getComp(cid)?.title||cid;}

  function makeDiag(code,severity,subsystem,msg,extra={}){return {diagnosticId:uid('D'),errorCode:code,severity,subsystem,message:msg,studentMessage:msg,teacherMessage:msg,firstSeenAt:new Date().toISOString(),resolved:false,runBlocked:severity==='CRITICAL',...extra};}
  function addDiagnostic(code,severity,subsystem,msg,meta={}){
    const key=[code,meta.source,meta.target,meta.sourcePin,meta.targetPin,meta.wireId,meta.netId,msg].join('|');
    const found=state.diagnostics.find(d=>d.key===key&&!d.resolved);
    if(found){found.occurrenceCount=(found.occurrenceCount||1)+1;found.lastSeenAt=new Date().toISOString();return found;}
    const d={...makeDiag(code,severity,subsystem,msg,meta),key,occurrenceCount:1,lastSeenAt:new Date().toISOString()};state.diagnostics.unshift(d);updateRunFault();return d;
  }
  function resolveRelated(sc,sp,tc,tp){
    state.diagnostics.filter(d=>!d.resolved&&((d.source===sc&&d.sourcePin===sp)||(d.target===tc&&d.targetPin===tp))).forEach(d=>{d.resolved=true;d.resolvedAt=new Date().toISOString();addEvent('RECOVERY',`Đã sửa lỗi ${d.errorCode}.`,{diagnosticId:d.diagnosticId});});
  }
  function updateRunFault(){return state.diagnostics.some(d=>!d.resolved&&d.severity==='CRITICAL');}

  function verifyCircuit(){
    state.components.forEach(c=>c.status='normal');let valid=0,errors=0,warnings=0;
    for(const w of state.wires){if(!getComp(w.source.componentId)||!getComp(w.target.componentId)||!getPort(getComp(w.source.componentId),w.source.portId)||!getPort(getComp(w.target.componentId),w.target.portId)){w.validationState='error';addDiagnostic('WIRE006','ERROR','WIRING','Dây đang trỏ tới linh kiện hoặc cổng không còn tồn tại.',{wireId:w.id,cause:'dangling endpoint',suggestedFix:'Xóa dây lỗi và nối lại vào cổng hợp lệ.'});errors++;continue;}const r=validateConnection(w.source.componentId,w.source.portId,w.target.componentId,w.target.portId);if(r.ok){w.validationState='valid';resolveRelated(w.source.componentId,w.source.portId,w.target.componentId,w.target.portId);valid++;}else{w.validationState='error';const d=addDiagnostic(r.diagnostic.errorCode,r.diagnostic.severity,r.diagnostic.subsystem,r.diagnostic.studentMessage,{...r.diagnostic,wireId:w.id,source:w.source.componentId,target:w.target.componentId,sourcePin:w.source.portId,targetPin:w.target.portId});w.diagnosticId=d.diagnosticId;getComp(w.source.componentId).status='faulted';getComp(w.target.componentId).status='faulted';errors++;}}
    // Duplicate endpoints.
    const seen=new Set();for(const w of state.wires){const k=[`${w.source.componentId}.${w.source.portId}`,`${w.target.componentId}.${w.target.portId}`].sort().join('|');if(seen.has(k)){w.validationState='error';addDiagnostic('WIRE003','ERROR','WIRING','Kết nối trùng trong cùng cặp cổng.',{wireId:w.id,source:w.source.componentId,target:w.target.componentId,sourcePin:w.source.portId,targetPin:w.target.portId});errors++;}else seen.add(k);}
    detectProtocolConflicts();
    detectPowerAnomalies();
    // Floating signal ports: only for common modules with a board connection expected.
    const floating=[];for(const c of state.components){for(const [pid,type] of c.ports){if(['analog-out','digital-out','i2c-sda','i2c-scl','digital-in','digital-pwm'].includes(type)&&!isPortUsed(c.id,pid)){floating.push({c,pid,type});}}}
    if(floating.length>0){warnings=floating.length;for(const f of floating.slice(0,20)) addDiagnostic('GPIO005','WARNING','GPIO',`${f.c.title}.${f.pid} chưa được nối.`,{source:f.c.id,sourcePin:f.pid,expected:'kết nối tới chân/port phù hợp',cause:'floating or unused port',suggestedFix:'Nối cổng này nếu bài học yêu cầu.'});}
    addEvent(errors?'DRC_ERROR':'DRC_OK',errors?`Kiểm tra phát hiện ${errors} lỗi.`:`Kiểm tra hoàn tất: ${valid} kết nối hợp lệ.`,{valid,errors,warnings});
    setRunState(errors?'FAULT':'READY');renderAll();save();return {ok:errors===0,valid,errors,warnings};
  }

  function detectProtocolConflicts(){
    const i2c=new Map();
    for(const c of state.components){
      const sda=c.ports.find(p=>p[1]==='i2c-sda'), scl=c.ports.find(p=>p[1]==='i2c-scl');
      const address=(sda?.[5]||{}).address ?? (c.behavior?.address);
      if(address==null||!sda||!scl)continue;
      const sdaConnected=isPortUsed(c.id,sda[0]), sclConnected=isPortUsed(c.id,scl[0]);
      if(!sdaConnected||!sclConnected)continue;
      const key=`${state.board}|${address}`;if(!i2c.has(key))i2c.set(key,[]);i2c.get(key).push(c);
    }
    for(const [key,devices] of i2c){if(devices.length>1){const names=devices.map(c=>c.title).join(' + ');addDiagnostic('BUS001','ERROR','BUS',`Xung đột địa chỉ I2C: ${names} dùng cùng địa chỉ ${key.split('|')[1]}.`,{expected:'mỗi thiết bị có địa chỉ duy nhất trên cùng bus',actual:key,cause:'duplicate I2C address',suggestedFix:'Đổi địa chỉ hoặc dùng bus/adapter phù hợp.',componentIds:devices.map(c=>c.id)});}}
    const spiGroups=new Map();
    for(const c of state.components){
      const cs=c.ports.find(p=>/^CS$/i.test(p[0]));if(!cs||!isPortUsed(c.id,cs[0]))continue;const k=`${state.board}|${cs[0]}`;if(!spiGroups.has(k))spiGroups.set(k,[]);spiGroups.get(k).push(c);
    }
    for(const [key,devices] of spiGroups){if(devices.length>1)addDiagnostic('BUS002','ERROR','BUS',`Xung đột CS SPI: ${devices.map(c=>c.title).join(' + ')} đang dùng chung ${key.split('|')[1]}.`,{cause:'duplicate SPI CS',suggestedFix:'Mỗi thiết bị SPI cần CS riêng.',componentIds:devices.map(c=>c.id)});}
  }
  function detectPowerAnomalies(){
    const boards=state.components.filter(c=>c.kind==='board');
    if(boards.length>1)addDiagnostic('PWR008','WARNING','POWER','Có nhiều board nguồn trong cùng project; hãy kiểm tra power rail và common ground.',{cause:'multiple power sources',suggestedFix:'Kiểm tra từng nguồn và nối GND chung khi thiết kế yêu cầu.'});
    for(const c of state.components){
      const vcc=c.ports.find(p=>p[0]==='VCC');const gnd=c.ports.find(p=>p[0]==='GND');
      if(vcc&&gnd&&isPortUsed(c.id,vcc[0])&&!isPortUsed(c.id,gnd[0]))addDiagnostic('PWR005','WARNING','POWER',`${c.title} có VCC nhưng chưa có GND tham chiếu.`,{source:c.id,sourcePin:vcc[0],expected:'VCC + GND',cause:'missing common ground',suggestedFix:`Nối ${c.title}.GND với GND của hệ thống.`});
    }
  }

  function parseCode(code){
    const errors=[];if(!/void\s+setup\s*\(/.test(code))errors.push({code:'COMP002',msg:'Thiếu void setup().'});if(!/void\s+loop\s*\(/.test(code))errors.push({code:'COMP002',msg:'Thiếu void loop().'});
    const libs=[...code.matchAll(/#include\s*[<"]([^>"]+)[>"]/g)].map(x=>x[1]); if(libs.some(x=>/Servo|LiquidCrystal|DHT|Adafruit/.test(x))) {/* educational runtime allows known common libraries */}
    return errors;
  }
  function extractCodePins(code){
    const constants={};for(const m of code.matchAll(/const\s+(?:int|byte|uint8_t|long)\s+([A-Z_][A-Z0-9_]*)\s*=\s*(\d+)/g))constants[m[1]]=Number(m[2]);
    const uses=[];for(const m of code.matchAll(/\b(?:pinMode|digitalRead|digitalWrite|analogRead|analogWrite|ledcAttachPin)\s*\(\s*([A-Z_][A-Z0-9_]*|\d+)/g)){const t=m[1];uses.push({token:t,pin:/^\d+$/.test(t)?Number(t):constants[t]??null});}
    return uses;
  }
  function compileCode(){
    const code=$('#lpCode').value;state.code=code;const errs=parseCode(code);$('#lpCodeStatus').textContent=errs.length?errs.map(e=>`${e.code}: ${e.msg}`).join(' • '):'Compile OK • educational runtime artifact ready.';
    if(errs.length){for(const e of errs)addDiagnostic(e.code,'ERROR','COMPILER',e.msg,{expected:'Arduino setup()/loop()',cause:'syntax/structure'});addEvent('COMPILE_ERROR','Biên dịch thất bại.',{count:errs.length});return false;}
    const board=boardComponent();if(!board){addDiagnostic('FW002','ERROR','FIRMWARE','Chưa có board vi điều khiển trong canvas.',{suggestedFix:'Thêm Arduino/ESP32 board.'});return false;}
    const uses=extractCodePins(code);let mismatch=false;for(const u of uses){if(u.pin==null){addDiagnostic('FW001','WARNING','FIRMWARE',`Không xác định được pin của ${u.token}.`,{suggestedFix:'Khai báo hằng số pin rõ ràng.'});continue;}const target=board.ports.find(p=>p[0].replace(/^D/,'')===String(u.pin)||p[0]===`GPIO${u.pin}`||p[0]===`A${u.pin}`);if(!target){mismatch=true;addDiagnostic('FW001','ERROR','FIRMWARE',`Firmware dùng pin ${u.pin} nhưng ${board.title} không có pin này trong profile.`,{actual:u.pin,expected:'board-supported pin',suggestedFix:'Đổi pin hoặc chọn board phù hợp.'});}}
    if(!mismatch){state.lastValidArtifact={boardId:board.type,codeHash:btoa(unescape(encodeURIComponent(code))).slice(0,32),createdAt:new Date().toISOString()};addEvent('COMPILE_OK','Compile thành công.',{boardId:board.type});}
    renderAll();save();return !mismatch;
  }
  function reconcileFirmware(){
    const board=boardComponent();if(!board)return false;const uses=extractCodePins($('#lpCode').value);let mismatch=false;
    for(const u of uses.filter(x=>x.pin!=null)){const port=board.ports.find(p=>p[0].replace(/^D/,'')===String(u.pin)||p[0]===`GPIO${u.pin}`);if(!port)continue;const wired=isPortUsed(board.id,port[0]);if(!wired){addDiagnostic('FW001','WARNING','FIRMWARE',`Code sử dụng ${port[0]} nhưng chân này chưa có kết nối.`,{source:board.id,sourcePin:port[0],expected:'connected pin',suggestedFix:`Nối thiết bị vào ${port[0]} hoặc đổi code.`});mismatch=true;}}
    return !mismatch;
  }

  function compileAndRun(){
    const v=verifyCircuit();if(!v.ok&&state.mode==='strict')return; if(!compileCode())return; if(!reconcileFirmware()&&state.mode==='strict')return;
    if(state.mode==='strict'&&state.diagnostics.some(d=>!d.resolved&&d.severity==='CRITICAL')){setRunState('FAULT');return;}
    state.running=true;state.simTime=0;state.serial=[];setRunState('RUNNING');clearInterval(state.simTimer);addEvent('SIM_START','Bắt đầu mô phỏng.',{mode:state.mode});
    state.simTimer=setInterval(stepSimulation,100);
    renderAll();
  }
  function stepSimulation(){
    state.simTime=Number((state.simTime+0.1).toFixed(1));const b=boardComponent();if(!b)return;
    const buttonPressed=Math.floor(state.simTime*2)%2===0;let ledValue=0;
    const led=state.components.find(c=>c.type==='Single LED');const btn=state.components.find(c=>c.type==='Push Button');
    if(led&&btn&&isWireConnected(b.id,'GPIO27',btn.id,'SIG')&&isWireConnected(b.id,'GPIO13',led.id,'A'))ledValue=buttonPressed?1:0;
    const temp=state.sensorStimulus.temperature+Math.sin(state.simTime)*.25;
    const light=state.sensorStimulus.light+Math.sin(state.simTime/2)*20;
    const soil=clamp(state.sensorStimulus.soil+Math.sin(state.simTime/3)*2,0,100);
    if(state.serial.length>120)state.serial.shift();state.serial.push(`[${state.simTime.toFixed(1)}s] GPIO13=${ledValue?'HIGH':'LOW'} | BTN=${buttonPressed?1:0} | T=${temp.toFixed(1)}C | LIGHT=${light.toFixed(0)} | SOIL=${soil.toFixed(0)}%`);
    state.scope.push({t:state.simTime,v:ledValue+Math.sin(state.simTime*2)*.15});if(state.scope.length>240)state.scope.shift();
    state.logic.push({t:state.simTime,pin:'GPIO13',value:ledValue});if(state.logic.length>200)state.logic.shift();
    renderSerial();renderScope();renderLogic();
    if(state.simTime>=30){stopSimulation();addEvent('SIM_DONE','Mô phỏng hoàn tất phiên 30 giây.',{simTime:state.simTime});}
  }
  function isWireConnected(c1,p1,c2,p2){return state.wires.some(w=>w.validationState==='valid'&&((w.source.componentId===c1&&w.source.portId===p1&&w.target.componentId===c2&&w.target.portId===p2)||(w.source.componentId===c2&&w.source.portId===p2&&w.target.componentId===c1&&w.target.portId===p1)));}
  function stopSimulation(){clearInterval(state.simTimer);state.running=false;setRunState('STOPPED');addEvent('SIM_STOP','Mô phỏng đã dừng.',{});renderAll();}
  function pauseSimulation(){if(!state.running){return;}clearInterval(state.simTimer);state.running=false;setRunState('PAUSED');addEvent('SIM_PAUSE','Mô phỏng tạm dừng.',{});renderAll();}
  function resetLab(){clearInterval(state.simTimer);state.running=false;state.components=[];state.wires=[];state.diagnostics=[];state.events=[];state.serial=[];state.scope=[];state.logic=[];state.nextComp=1;state.nextWire=1;state.selectedPort=null;state.selectedWire=null;state.correctHint=null;state.simTime=0;ensureBoard();loadExampleCircuit(true);setRunState('READY');renderAll();save();}
  function clearLab(){clearInterval(state.simTimer);state.running=false;pushHistory('Xóa mạch');state.components=[];state.wires=[];state.selectedPort=null;state.selectedWire=null;renderAll();save();setRunState('EDITING');}
  function setRunState(s){const labels={READY:'Sẵn sàng',RUNNING:'Đang chạy',PAUSED:'Tạm dừng',FAULT:'Có lỗi',STOPPED:'Đã dừng',EDITING:'Đang sửa'};$('#lpRunBadge').textContent=labels[s]||s;$('#lpRunBadge').className=`lp-badge ${s.toLowerCase()}`;}

  function updateHeader(){
    $('#lpBoardBadge').textContent=state.board;$('#lpBoardBadge').className='lp-badge';$('#lpModeBadge').textContent=state.mode==='strict'?'STRICT':'SANDBOX';$('#lpModeBadge').className=`lp-badge ${state.mode}`;
    const active=state.diagnostics.filter(d=>!d.resolved);const e=active.filter(d=>d.severity==='ERROR'||d.severity==='CRITICAL').length,w=active.filter(d=>d.severity==='WARNING').length,v=state.wires.filter(x=>x.validationState==='valid').length;
    $('#lpErrorBadge').textContent=`${e}E · ${w}W`;$('#lpConsoleCount').textContent=e+w;$('#lpErrors').textContent=e;$('#lpWarnings').textContent=w;$('#lpValid').textContent=v;$('#lpProgress').textContent=`${v}/${state.wires.length} dây đúng`;
  }
  function filteredDiagnostics(){return state.diagnostics.filter(d=>(state.filter==='ALL'||d.severity===state.filter)&&(state.subsystem==='ALL'||d.subsystem===state.subsystem)&&(!state.search||JSON.stringify(d).toLowerCase().includes(state.search)));}
  function renderConsole(){
    const list=$('#lpConsoleList');const logs=filteredDiagnostics();if(!logs.length){list.innerHTML='<div class="lp-empty">Không có chẩn đoán phù hợp.</div>';return;}
    list.innerHTML=logs.slice(0,300).map(d=>`<article class="lp-log ${esc(d.severity)} ${d.resolved?'resolved':''}" data-did="${esc(d.diagnosticId)}"><div class="lp-log-top"><b>${esc(d.severity)} · ${esc(d.errorCode)}</b><time>${esc(d.lastSeenAt?new Date(d.lastSeenAt).toLocaleTimeString('vi-VN',{hour12:false}):now())}</time></div><p>${esc(d.studentMessage||d.message)}</p>${(d.sourcePin||d.targetPin)?`<div class="lp-route">${esc(componentName(d.source))}.${esc(d.sourcePin||'?')} → ${esc(componentName(d.target))}.${esc(d.targetPin||'?')}</div>`:''}<div class="lp-log-meta">${d.subsystem}${d.occurrenceCount>1?' · ×'+d.occurrenceCount:''}${d.resolved?' · RESOLVED':''}</div><div class="lp-log-actions"><button data-log-action="focus">Focus</button>${d.recommendedTarget?'<button data-log-action="correct">Chân đúng</button>':''}<button data-log-action="why">Why?</button>${d.wireId?'<button data-log-action="deletewire">Xóa dây</button>':''}</div></article>`).join('');
    list.querySelectorAll('[data-did]').forEach(card=>card.addEventListener('click',e=>{const action=e.target.closest('[data-log-action]');const d=state.diagnostics.find(x=>x.diagnosticId===card.dataset.did);if(!d)return;if(!action){openDiagnostic(d);return;}if(action.dataset.logAction==='focus'){focusDiagnostic(d);}else if(action.dataset.logAction==='correct'){showCorrect(d);}else if(action.dataset.logAction==='why'){openDiagnostic(d,true);}else if(action.dataset.logAction==='deletewire'){deleteWire(d.wireId);}}));
  }
  function openDiagnostic(d,whyOnly=false){state.selectedWire=d.wireId||null;renderCanvas();$('#lpModalTitle').textContent=d.severity==='CRITICAL'?'LỖI NGHIÊM TRỌNG':'KẾT NỐI / CẤU HÌNH';$('#lpModalBody').innerHTML=`<p>${esc(d.studentMessage||d.message)}</p>${whyOnly?`<div class="lp-why"><b>Vì sao?</b><br>${esc(d.cause||'Theo rule validation của hệ thống.')}<br><b>Hiện tại:</b> ${esc(typeof d.actual==='string'?d.actual:JSON.stringify(d.actual||'—'))}<br><b>Mong đợi:</b> ${esc(typeof d.expected==='string'?d.expected:JSON.stringify(d.expected||'—'))}</div>`:''}`;const route=(d.source&&d.sourcePin?`${componentName(d.source)}.${d.sourcePin}`:'')+(d.target&&d.targetPin?` → ${componentName(d.target)}.${d.targetPin}`:'');$('#lpModalRoute').textContent=`${d.errorCode}${route?' · '+route:''}${d.suggestedFix?' · '+d.suggestedFix:''}`;$('#lpModal').classList.add('open');$('#lpModal').setAttribute('aria-hidden','false');state.modalDiagnostic=d;}
  function closeModal(){$('#lpModal').classList.remove('open');$('#lpModal').setAttribute('aria-hidden','true');}
  function focusDiagnostic(d){if(d.wireId){focusWire(d.wireId);}else if(d.focusTarget){state.selectedComp=d.focusTarget.componentId;state.selectedWire=null;renderInspector();}else if(d.source){state.selectedComp=d.source;renderInspector();}}
  function focusWire(wid){state.selectedWire=wid;renderCanvas();setTimeout(()=>{if(state.selectedWire===wid){renderCanvas();}},2200);}
  function showCorrect(d){if(d.recommendedTarget){clearTimeout(state.correctHintTimer);state.correctHint=d.recommendedTarget;renderCanvas();$('#lpHelp').textContent=`Chân đúng: ${componentName(d.recommendedTarget.componentId)}.${d.recommendedTarget.portId}`;state.correctHintTimer=setTimeout(()=>{state.correctHint=null;renderCanvas();},3200);}else{$('#lpHelp').textContent=d.suggestedFix||'Kiểm tra board profile và module profile.';}}
  function deleteWire(wid){const i=state.wires.findIndex(w=>w.id===wid);if(i<0)return;pushHistory('Xóa dây');state.wires.splice(i,1);state.diagnostics.filter(d=>!d.resolved&&d.wireId===wid).forEach(d=>{d.resolved=true;d.resolvedAt=new Date().toISOString();addEvent('RECOVERY',`Đã loại bỏ dây lỗi ${wid}; chẩn đoán ${d.errorCode} được đánh dấu đã xử lý.`,{diagnosticId:d.diagnosticId,wireId:wid});});addEvent('WIRE_REMOVE',`Đã xóa dây ${wid}.`,{wireId:wid});renderAll();save();}

  function renderInspector(){
    const el=$('#lpInspector');const c=state.selectedComp?getComp(state.selectedComp):null;
    if(state.selectedWire){const w=state.wires.find(x=>x.id===state.selectedWire);if(w){const s=getComp(w.source.componentId),t=getComp(w.target.componentId);el.innerHTML=`<div class="lp-inspector-card"><b>Dây ${esc(w.id)}</b><div>${esc(s?.title)}.${esc(w.source.portId)} → ${esc(t?.title)}.${esc(w.target.portId)}</div><div>State: <strong class="${w.validationState==='valid'?'good':'bad'}">${esc(w.validationState)}</strong></div><div>Net: ${esc(w.netId||'—')}</div><button data-act="delete-selected-wire" class="lp-mini-btn danger">Xóa dây</button></div>`;return;}}
    if(c){const v=c.verificationStatus||c.verification?.status||'unverified';const src=c.verification?.sourceRef||c.sourceRef||'—';const photo=realPhotoFor(c.type);const photoInfo=photo?.realPhoto?`<div class="lp-photo-meta"><b>Ảnh thực:</b> ${esc(photo.title||'Wikimedia Commons')}<br><span>${esc(photo.license||'See source page')}</span>${photo.artist?`<br><span>${esc(photo.artist)}</span>`:''}<br><a href="${esc(photo.pageUrl)}" target="_blank" rel="noopener">Mở nguồn ↗</a></div>`:`<div class="lp-photo-meta muted">Chưa có ảnh thực; đang dùng hình dự phòng.</div>`;el.innerHTML=`<div class="lp-inspector-card"><b>${esc(c.title)}</b>${photoInfo}<div>Support: <strong>${esc(c.supportLevel)}</strong></div><div>Verification: <strong>${esc(v)}</strong></div><div>Model: ${esc(c.model?.kind||'—')} / ${esc(c.model?.simulation||'—')}</div><div>Ports: ${c.ports.length}</div><div>Source: <small>${esc(src)}</small></div><div class="lp-port-mini-list">${c.ports.slice(0,80).map(p=>`<span>${esc(p[0])}${p[5]?.physicalPin!=null?` <em>P${esc(p[5].physicalPin)}</em>`:''}</span>`).join('')}</div><button data-act="rotate-selected" class="lp-mini-btn">Xoay 90°</button><button data-act="delete-selected-comp" class="lp-mini-btn danger">Xóa</button></div>`;renderStimulus(c);return;}
    if(state.selectedPort){const cc=getComp(state.selectedPort.componentId),p=portMeta(cc,state.selectedPort.portId);if(cc&&p){const m=p.meta||{};el.innerHTML=`<div class="lp-inspector-card"><b>${esc(cc.title)}.${esc(p.name)}</b><div>Role: ${esc(m.role||p.type)}</div><div>Direction: ${esc(m.direction||'—')}</div><div>Voltage: ${esc(m.voltage??cc.logicVoltage??'unknown')}</div><div>Physical pin: <strong>${esc(m.physicalPin??'—')}</strong></div><div>Verify: ${esc(m.verificationStatus||cc.verificationStatus||'unverified')}</div><div>Analog: ${m.analog?'YES':'NO'} · PWM: ${m.pwm?'YES':'NO'} · Bus: ${esc(m.bus||'—')}</div><div>Source: <small>${esc(m.sourceRef||cc.sourceRef||'—')}</small></div></div>`;return;}}
    el.innerHTML='<div class="lp-empty">Chọn component, pin hoặc dây trên canvas.</div>';
  }
  function renderStimulus(c){
    const stimMap={
      'Rain Drop Sensor':['rain','Mức mưa',0,100,'%'],'Soil Moisture Resistive':['soil','Độ ẩm đất',0,100,'%'],'LDR Module':['light','Ánh sáng',0,1000,'lx'],'DHT11':['temperature','Nhiệt độ',0,50,'°C'],'DHT22':['temperature','Nhiệt độ',0,50,'°C'],'DS18B20':['temperature','Nhiệt độ',0,50,'°C'],'HC-SR04':['distance','Khoảng cách',2,400,'cm'],'PIR HC-SR501':['motion','Chuyển động',0,1,'0/1'],'Potentiometer 10k Module':['pot','Biến trở',0,100,'%'],'BH1750':['light','Ánh sáng',0,1000,'lx']
    };const cfg=stimMap[c.type];if(!cfg){$('#lpStimulus').innerHTML='';return;}const [key,label,min,max,unit]=cfg;$('#lpStimulus').innerHTML=`<div class="lp-stim-card"><b>Kích thích cảm biến</b><label>${label}<input id="lpStim-${key}" type="range" min="${min}" max="${max}" step="${key==='motion'?1:.1}" value="${state.sensorStimulus[key]??(min+max)/2}"><span>${state.sensorStimulus[key]??(min+max)/2} ${unit}</span></label></div>`;$('#lpStim-'+key).addEventListener('input',e=>{state.sensorStimulus[key]=Number(e.target.value);e.target.nextElementSibling.textContent=`${e.target.value} ${unit}`;save();});}

  function renderSerial(){const p=$('#lpSerial');if(p)p.textContent=state.serial.join('\n');}
  function addEvent(eventCode,message,meta={}){const e={eventId:uid('E'),time:new Date().toISOString(),eventCode,message,...meta};state.events.unshift(e);if(state.events.length>500)state.events.length=500;renderEvents();}
  function renderEvents(){const list=$('#lpEventList');if(!list)return;if(!state.events.length){list.innerHTML='<div class="lp-empty">Chưa có event.</div>';return;}list.innerHTML=state.events.slice(0,200).map(e=>`<div class="lp-event"><b>${esc(e.eventCode)}</b><time>${esc(new Date(e.time).toLocaleTimeString('vi-VN',{hour12:false}))}</time><p>${esc(e.message)}</p></div>`).join('');}
  function renderScope(){const c=$('#lpScopeCanvas');if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#0f172a';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='rgba(148,163,184,.18)';ctx.lineWidth=1;for(let x=0;x<=c.width;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,c.height);ctx.stroke();}for(let y=0;y<=c.height;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(c.width,y);ctx.stroke();}if(!state.scope.length){$('#lpScopeInfo').textContent='Chưa có tín hiệu. Chạy mô phỏng để tạo dữ liệu.';return;}ctx.strokeStyle='#22c55e';ctx.lineWidth=2;ctx.beginPath();state.scope.forEach((p,i)=>{const x=(i/(state.scope.length-1||1))*c.width;const y=c.height-30-clamp(p.v,-1,1)*90;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();$('#lpScopeInfo').textContent=`Probe: ${state.scope.length} mẫu • simulation time ${state.simTime.toFixed(1)}s`;}
  function renderLogic(){const list=$('#lpLogicList');if(!list)return;if(!state.logic.length){list.innerHTML='<div class="lp-empty">Chưa có dữ liệu logic.</div>';return;}list.innerHTML=`<table class="lp-logic-table"><thead><tr><th>t (s)</th><th>Pin</th><th>Value</th></tr></thead><tbody>${state.logic.slice(-80).reverse().map(x=>`<tr><td>${x.t.toFixed(1)}</td><td>${esc(x.pin)}</td><td><b class="${x.value?'good':'bad'}">${x.value?'HIGH':'LOW'}</b></td></tr>`).join('')}</tbody></table>`;}

  function renderLibrary(){
    const q=($('#lpModuleSearch').value||'').trim().toLowerCase();const cat=$('#lpCats .active')?.dataset.cat||'all';const items=MODULES.filter(n=>(!q||n.toLowerCase().includes(q))&&(cat==='all'||categoryOf(n)===cat));
    $('#lpModuleCount').textContent=`${items.length}/${MODULES.length}`;
    $('#lpModuleList').innerHTML=items.map(n=>{const t=templateFor(n),support=t?.supportLevel||'unverified',verify=t?.verificationStatus||t?.verification?.status||'unverified';const icon=verify==='verified'?'✓':verify.includes('variant')?'◌':'•';const asset=t?.assetRef||'';const photo=realPhotoFor(n);const src=photo?.realPhoto?photo.url:asset;const badge=photo?.realPhoto?'REAL PHOTO':'2D FALLBACK';return `<button class="lp-module" data-module="${esc(n)}"><span class="lp-mod-thumb ${photo?.realPhoto?'real':''}">${src?`<img src="${esc(src)}" alt="${esc(n)}" loading="lazy">`:'<span>2D</span>'}<i>${badge}</i></span><span><b>${esc(n)}</b><small>${esc(support.toUpperCase())} • ${esc(categoryOf(n))} • ${esc(String(verify).toUpperCase())}</small></span><em>${icon}</em></button>`;}).join('');
    $('#lpModuleList').querySelectorAll('[data-module]').forEach(b=>b.addEventListener('click',()=>{createComponent(b.dataset.module);setRunState('EDITING');}));
  }

  function loadExampleCircuit(silent=false){
    state.components=[];state.wires=[];state.nextComp=1;state.nextWire=1;const b=createComponent(state.board,450,70,true);const led=createComponent('Single LED',760,120,true);const btn=createComponent('Push Button',760,270,true);const rain=createComponent('Rain Drop Sensor',760,440,true);
    connectSilent(b.id,state.board==='Arduino Uno R3'?'D13':'GPIO13',led.id,'A');connectSilent(b.id,'GND',led.id,'K');connectSilent(b.id,state.board==='Arduino Uno R3'?'3V3':'3V3',btn.id,'VCC');connectSilent(b.id,'GND',btn.id,'GND');connectSilent(b.id,state.board==='Arduino Uno R3'?'D2':'GPIO27',btn.id,'SIG');
    if(!silent){addEvent('EXAMPLE','Đã nạp mạch mẫu.');pushHistory('Mạch mẫu');}
  }
  function connectSilent(sc,sp,tc,tp){if(!getComp(sc)||!getComp(tc)||!getPort(getComp(sc),sp)||!getPort(getComp(tc),tp))return;const w={id:`W${state.nextWire++}`,source:{componentId:sc,portId:sp},target:{componentId:tc,portId:tp},validationState:'valid',faultState:null,netId:uid('NET'),createdAt:new Date().toISOString()};state.wires.push(w);}

  function startMove(e,cid){
    if(e.button!==undefined&&e.button!==0)return;const c=getComp(cid);if(!c)return;state.selectedComp=cid;state.selectedWire=null;renderInspector();
    const start=screenPoint(e);const dx=start.x-c.x,dy=start.y-c.y;const move=ev=>{const p=screenPoint(ev);c.x=clamp(p.x-dx,8,1150-c.w);c.y=clamp(p.y-dy,8,720-c.h);renderCanvas();};const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);pushHistory(`Di chuyển ${c.title}`);save();};window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);e.stopPropagation();
  }

  function toast(text){$('#lpHelp').textContent=text;clearTimeout(toast.t);toast.t=setTimeout(()=>$('#lpHelp').textContent='Cắm dây: kéo từ chấm cổng này đến chấm cổng kia. Cổng hợp lệ sẽ sáng xanh.',2600);}

  function updateCodeFromUI(){state.code=$('#lpCode').value;save();}
  function exportProject(){const data={schemaVersion:SCHEMA_VERSION,registryVersion:window.GH_ARDUINO_MODULE_REGISTRY_200?.version||null,board:state.board,mode:state.mode,components:state.components,wires:state.wires,code:$('#lpCode').value,sensorStimulus:state.sensorStimulus,diagnostics:state.diagnostics,events:state.events};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='giahuy-arduino-lab-project.json';a.click();URL.revokeObjectURL(a.href);addEvent('EXPORT','Đã xuất project JSON.');}

  function bind(){
    root.addEventListener('click',e=>{
      const tab=e.target.closest('[data-tab]');if(tab){root.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active'));root.querySelectorAll('[data-panel]').forEach(x=>x.classList.remove('active'));tab.classList.add('active');$(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');state.activeTab=tab.dataset.tab;return;}
      const filter=e.target.closest('[data-filter]');if(filter){root.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));filter.classList.add('active');state.filter=filter.dataset.filter;renderConsole();return;}
      const act=e.target.closest('[data-act]');if(act){const a=act.dataset.act; if(a==='verify')verifyCircuit();else if(a==='compile')compileCode();else if(a==='run')compileAndRun();else if(a==='pause')pauseSimulation();else if(a==='stop')stopSimulation();else if(a==='reset')resetLab();else if(a==='clear')clearLab();else if(a==='undo')undo();else if(a==='redo')redo();else if(a==='export')exportProject();else if(a==='import')$('#lpImport').click();else if(a==='example'){pushHistory('Mạch mẫu');loadExampleCircuit();renderAll();save();}else if(a==='clearserial'){state.serial=[];renderSerial();}else if(a==='clearevents'){state.events=[];renderEvents();}else if(a==='zoomout'){state.zoom=clamp(state.zoom-.1,.6,1.8);applyZoom();}else if(a==='zoomin'){state.zoom=clamp(state.zoom+.1,.6,1.8);applyZoom();}else if(a==='fit'){state.zoom=1;state.panX=0;state.panY=0;applyZoom();}else if(a==='loadcode'){$('#lpCode').value=state.code;toast('Code mẫu đã nạp.');}else if(a==='verifycode')compileCode();else if(a==='delete-selected-wire'){deleteWire(state.selectedWire);state.selectedWire=null;renderAll();}else if(a==='delete-selected-comp'){removeComponent(state.selectedComp);state.selectedComp=null;}else if(a==='rotate-selected'){rotateComponent(state.selectedComp);}else if(a==='clearprobe'){state.scope=[];renderScope();}}
      const modal=e.target.closest('[data-modal]');if(modal){const a=modal.dataset.modal;const d=state.modalDiagnostic;if(a==='close')closeModal();else if(a==='focus')focusDiagnostic(d);else if(a==='correct')showCorrect(d);else if(a==='why')openDiagnostic(d,true);}
    });
    $('#lpModuleSearch').addEventListener('input',renderLibrary);$('#lpConsoleSearch').addEventListener('input',e=>{state.search=e.target.value.toLowerCase();renderConsole();});$('#lpCode').addEventListener('input',updateCodeFromUI);$('#lpModeSelect').addEventListener('change',e=>{state.mode=e.target.value;addEvent('MODE_CHANGE',`Chuyển chế độ ${state.mode}.`);save();updateHeader();});
    $('#lpImport').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const d=JSON.parse(reader.result);if(!Array.isArray(d.components)||!Array.isArray(d.wires))throw new Error('Project không hợp lệ.');pushHistory('Import project');state.board=d.board||state.board;state.mode=d.mode||state.mode;state.components=d.components.map(hydrateComponent);state.wires=d.wires;state.code=d.code||state.code;state.diagnostics=Array.isArray(d.diagnostics)?d.diagnostics:[];state.events=Array.isArray(d.events)?d.events:[];syncIdCounters();state.sensorStimulus={...state.sensorStimulus,...(d.sensorStimulus||{})};$('#lpCode').value=state.code;addEvent('IMPORT','Đã import project JSON.');renderAll();save();toast('Import project thành công.');}catch(err){addDiagnostic('ASSET002','ERROR','ASSET',`Import thất bại: ${err.message}`,{cause:'invalid project JSON',suggestedFix:'Kiểm tra file JSON được xuất từ Arduino Lab.'});renderAll();}};reader.readAsText(f);});
    root.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();state.pending=null;state.selectedPort=null;state.hoverPort=null;renderCanvas();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}if((e.key==='Delete'||e.key==='Backspace')&&document.activeElement?.tagName!=='TEXTAREA'&&document.activeElement?.tagName!=='INPUT'){if(state.selectedWire)deleteWire(state.selectedWire);else if(state.selectedComp)removeComponent(state.selectedComp);state.selectedWire=null;state.selectedComp=null;renderAll();}});
    $('#lpCanvas').addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey){return;}e.preventDefault();state.zoom=clamp(state.zoom+(e.deltaY<0?.08:-.08),.6,1.8);applyZoom();},{passive:false});
    svg.addEventListener('pointerdown',e=>{if(e.target===svg){state.selectedPort=null;state.selectedWire=null;state.selectedComp=null;renderAll();}});
  }
  function applyZoom(){svg.style.transform=`translate(${state.panX}px,${state.panY}px) scale(${state.zoom})`;svg.style.transformOrigin='0 0';$('#lpZoom').textContent=`${Math.round(state.zoom*100)}%`;}
  function installGrid(){const defs=svgEl('defs');const p=svgEl('pattern',{id:'lpGrid',width:24,height:24,patternUnits:'userSpaceOnUse'});p.appendChild(svgEl('path',{d:'M24 0H0V24',fill:'none',stroke:'#e5e7eb','stroke-width':1}));defs.appendChild(p);svg.insertBefore(defs,svg.firstChild);}

  // Module catalog follows the loaded registry; fallback is used only if the registry is unavailable.
  makeScaffold();installGrid();initBoardSelect();initCats();initSubsystems();bind();
  const loaded=load();state.hydrated=true;if(!loaded){ensureBoard();loadExampleCircuit(true);}else{ensureBoard();}
  renderLibrary();setRunState('READY');applyZoom();renderAll();pushHistory('Initial state');save(); try{const names=MODULES.slice(); const prog=(done,total)=>{const n=$('#lpProgress');if(n)n.textContent=`Ảnh thật ${done}/${total}`;}; setTimeout(()=>window.GH_ARDUINO_REAL_PHOTOS?.preload(names,prog),700);}catch(_e){}
})();
