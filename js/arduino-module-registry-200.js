/* Gia Huy — Arduino Lab expanded board/module connectivity registry
 * Purpose: every catalog item has a concrete 2D connectivity model, ports,
 * metadata, verification state, and a conservative behavioral classification.
 * This file does not claim SPICE/native MCU simulation for every module.
 */
(function(){
  'use strict';
  const names = [
    "Arduino Uno R3","Arduino Nano","Arduino Mega 2560","Arduino Leonardo","Arduino Micro","Arduino Pro Mini 5V","Arduino Pro Mini 3.3V","Arduino Due","Arduino Zero","Arduino MKR Zero",
    "Arduino MKR WiFi 1010","Arduino Nano 33 IoT","Arduino Nano 33 BLE","Arduino Nano RP2040 Connect","Arduino Giga R1 WiFi","Arduino Portenta H7","ESP32 DevKit V1","ESP32 DevKitC","ESP32-S3 DevKitC","ESP32-C3 DevKitM",
    "ESP32-C6 DevKitC","ESP32-S2 DevKit","ESP32-WROVER","NodeMCU ESP8266","Wemos D1 mini","Raspberry Pi Pico","Raspberry Pi Pico W","RP2040 Zero","Seeed XIAO RP2040","STM32 Blue Pill",
    "STM32 Black Pill","STM32 Nucleo F401RE","STM32 Nucleo F411RE","STM32 Nucleo G071RB","Teensy 4.0","Teensy 4.1","Feather M0","Feather RP2040","Feather ESP32-S3","Circuit Playground Express",
    "Arduino Ethernet Shield","Arduino Motor Shield","Arduino Sensor Shield","Arduino Proto Shield","Arduino CNC Shield","ESP32 Expansion Board 38-pin","ESP32 Expansion Board 30-pin","Breadboard 400 point","Breadboard 830 point","Mini Breadboard",
    "HC-SR04","HC-SR05","VL53L0X","VL53L1X","VL6180X","Sharp IR GP2Y0A21","Sharp IR GP2Y0A02","GP2Y0A41","DHT11","DHT22",
    "BME280","BMP280","BMP180","BMP388","SHT30","SHT31","SHT35","DS18B20","LM35","TMP36",
    "MAX6675","BMP388 Sensor Module","BH1750","TSL2561","TSL2591","LDR Module","Photodiode Module","TCS3200","TCS34725","APDS9960 Gesture/Color",
    "ML8511 UV Sensor","GUVA-S12SD UV Sensor","Rain Drop Sensor","Water Level Sensor","Water Flow YF-S201","Soil Moisture Resistive","Soil Moisture Capacitive","PIR HC-SR501","LM393 Sound Sensor","MAX9814 Microphone",
    "MAX4466 Microphone","Piezo Buzzer","Active Buzzer","Passive Buzzer","Flame Sensor","MQ-2 Gas Sensor","MQ-3 Gas Sensor","MQ-4 Gas Sensor","MQ-5 Gas Sensor","MQ-6 Gas Sensor",
    "MQ-7 Gas Sensor","MQ-9 Gas Sensor","MQ-135 Gas Sensor","A3144 Hall Sensor","Reed Switch","Tilt Switch","Vibration SW-420","TTP223 Touch","KY-040 Rotary Encoder","Push Button",
    "4x4 Keypad","3x4 Keypad","Analog Joystick","10k Potentiometer","Slider Potentiometer","Rotary Encoder Module","IR Receiver VS1838B","IR LED","RFID RC522","PN532 NFC",
    "HC-05 Bluetooth","HC-06 Bluetooth","HM-10 BLE","ESP-01 WiFi","W5500 Ethernet","NRF24L01","SX1278 LoRa","RA-02 LoRa","433MHz Transmitter","433MHz Receiver",
    "GPS NEO-6M","GPS NEO-M8N","DS3231 RTC","DS1307 RTC","AT24C256 EEPROM","FRAM I2C","Micro SD Module","PCF8574 GPIO Expander","MCP23017 GPIO Expander","MCP3008 ADC",
    "ADS1115 ADC","MCP3208 ADC","MCP4725 DAC","MCP4921 DAC","AD9833 Signal Generator","INA219 Current Sensor","INA226 Current Monitor","INA3221 Power Monitor","ACS712 Current Sensor","MAX7219 8x8 Matrix",
    "TM1637 4-Digit Display","7-Segment Single Digit","8x8 LED Matrix","16x2 LCD Parallel","16x2 LCD I2C","20x4 LCD I2C","OLED SSD1306","OLED SH1106","TFT ILI9341","TFT ST7735",
    "TFT ST7789","E-Paper 2.13","Nextion HMI","WS2812B LED","WS2812B Strip","NeoPixel Ring","Single LED","RGB LED Common Cathode","RGB LED Common Anode","LED Bargraph",
    "Servo SG90","Servo MG90S","Servo MG996R","28BYJ-48 + ULN2003","NEMA17 Stepper","TT Gear Motor","Mini DC Motor","5V Fan","Mini Water Pump","Solenoid",
    "L298N Motor Driver","TB6612FNG Motor Driver","DRV8833 Motor Driver","A4988 Stepper Driver","Relay 1-Channel","Relay 2-Channel","Relay 4-Channel","MOSFET Driver Module","BTS7960 Driver","Load Cell + HX711",
    "Flex Sensor","Force Sensitive Resistor","MPU6050","MPU9250","BNO055","ADXL345","ADXL335","LIS3DH","HMC5883L","QMC5883L"
  ];

  const deep = (x)=>JSON.parse(JSON.stringify(x));
  const arr = (name,type,rx,ry,side,meta={})=>[name,type,rx,ry,side,{...meta}];
  const evenly = (items, side='right')=>items.map((p,i)=>arr(p[0],p[1],side==='left'?0.08:0.92,0.08+i*(0.84/Math.max(1,items.length-1)),side,p[2]||{}));
  const mergeMeta = (base, extra={})=>({...base,...extra});
  const standardSource = {
    uno:'https://docs.arduino.cc/hardware/uno-rev3/',
    wokwiUno:'https://docs.wokwi.com/parts/wokwi-arduino-uno',
    wokwiNano:'https://docs.wokwi.com/parts/wokwi-arduino-nano',
    mega:'https://docs.wokwi.com/parts/wokwi-arduino-mega',
    esp32:'https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html',
    wokwiEsp32:'https://docs.wokwi.com/guides/esp32',
    pico:'https://docs.wokwi.com/parts/wokwi-pi-pico',
    bluepill:'https://docs.wokwi.com/parts/board-stm32-bluepill',
    hc:'https://docs.wokwi.com/parts/wokwi-hc-sr04',
    ds18:'https://docs.wokwi.com/parts/wokwi-ds18b20',
    oled:'https://docs.wokwi.com/parts/board-ssd1306',
    dht22:'https://docs.wokwi.com/parts/wokwi-dht22',
    ds1307:'https://docs.wokwi.com/parts/wokwi-ds1307',
    mpu6050:'https://docs.wokwi.com/parts/wokwi-mpu6050',
    ili9341:'https://docs.wokwi.com/parts/wokwi-ili9341',
    microsd:'https://docs.wokwi.com/parts/wokwi-microsd-card',
    keypad:'https://docs.wokwi.com/parts/wokwi-membrane-keypad',
    ledbar:'https://docs.wokwi.com/parts/wokwi-led-bar-graph'
  };

  function makeBoard(name, kind='board', pins=[], opts={}){
    return {title:name, sub:opts.sub||`${kind} • physical pin map`, kind, w:opts.w||190, h:opts.h||360,
      supportLevel:opts.supportLevel||'connectivity', logicVoltage:opts.logicVoltage??null,
      model:{kind:'board-profile', simulation:'connectivity-only', family:opts.family||kind},
      verificationStatus:opts.verificationStatus||'derived-common-profile', sourceRef:opts.sourceRef||null,
      ports:pins};
  }
  function boardPorts(pinNames,{leftCount=0,logicVoltage=null,sourceRef=null,verified=false}={}){
    const metaBase={verificationStatus:verified?'verified':'derived-common-profile',sourceRef,voltage:logicVoltage};
    const left=pinNames.filter(p=>p.side==='left'), right=pinNames.filter(p=>p.side!=='left');
    const L=left.map((p,i)=>arr(p.name,p.type??'digital',(0.08),0.05+i*(0.90/Math.max(1,left.length-1)),'left',mergeMeta(metaBase,p.meta)));
    const R=right.map((p,i)=>arr(p.name,p.type??'digital',(0.92),0.05+i*(0.90/Math.max(1,right.length-1)),'right',mergeMeta(metaBase,p.meta)));
    return [...L,...R];
  }
  function dig(name,n,meta={}){return {name,type:'digital',meta:{...meta,direction:'bidirectional',logicalName:name,physicalPin:n}};}
  function analog(name,n,meta={}){return {name,type:'analog-in',meta:{...meta,direction:'input',analog:true,logicalName:name,physicalPin:n}};}
  function pwr(name,voltage,n=null){return {name,type:voltage===0?'ground':voltage>=4.5?'power5':'power',meta:{voltage,direction:voltage===0?'passive':'power-input',physicalPin:n}};}

  function makeUno(){
    const pins=[];
    for(let i=0;i<14;i++) pins.push(dig(`D${i}`,i,{pwm:[3,5,6,9,10,11].includes(i),interrupt:[2,3].includes(i),i2c:(i===18||i===19),spi:[10,11,12,13].includes(i),uart:[0,1].includes(i)}));
    for(let i=0;i<6;i++) pins.push(analog(`A${i}`,`A${i}`,{i2c:i===4?'SDA':i===5?'SCL':null}));
    pins.push(pwr('5V',5,'POWER'));pins.push(pwr('3V3',3.3,'3V3'));pins.push(pwr('VIN',9,'VIN'));pins.push(pwr('GND.1',0,'GND.1'));pins.push(pwr('GND.2',0,'GND.2'));
    pins.push({name:'AREF',type:'analog-in',meta:{reference:true,physicalPin:'AREF',verificationStatus:'verified'}});
    pins.push({name:'IOREF',type:'power',meta:{voltage:5,physicalPin:'IOREF'}});pins.push({name:'RESET',type:'digital',meta:{physicalPin:'RESET'}});
    return makeBoard('Arduino Uno R3','board',boardPorts(pins,{logicVoltage:5,sourceRef:standardSource.uno,verified:true}),{sub:'ATmega328P • 14 digital • 6 analog',logicVoltage:5,sourceRef:standardSource.uno,verificationStatus:'verified'});
  }
  function makeNano(){
    const pins=[];for(let i=0;i<14;i++)pins.push(dig(`D${i}`,i,{pwm:[3,5,6,9,10,11].includes(i),interrupt:[2,3].includes(i),uart:[0,1].includes(i),spi:[10,11,12,13].includes(i)}));
    for(let i=0;i<8;i++)pins.push(analog(`A${i}`,`A${i}`,{inputOnly:i>=6,i2c:i===4?'SDA':i===5?'SCL':null}));
    pins.push(pwr('5V',5,'5V'),pwr('3V3',3.3,'3V3'),pwr('VIN',9,'VIN'),pwr('GND.1',0,'GND.1'),pwr('GND.2',0,'GND.2'));
    pins.push({name:'RESET',type:'digital',meta:{physicalPin:'RESET'}});
    return makeBoard('Arduino Nano','board',boardPorts(pins,{logicVoltage:5,sourceRef:standardSource.wokwiNano,verified:true}),{sub:'ATmega328P • A6/A7 analog-only',logicVoltage:5,sourceRef:standardSource.wokwiNano,verificationStatus:'verified'});
  }
  function makeMega(){
    const pins=[];for(let i=0;i<54;i++)pins.push(dig(`D${i}`,i,{pwm:(i>=2&&i<=13)||[44,45,46].includes(i),uart:[0,1,18,19,16,17,14,15].includes(i),spi:[50,51,52,53].includes(i),interrupt:[2,3,18,19,20,21].includes(i)}));
    for(let i=0;i<16;i++)pins.push(analog(`A${i}`,`A${i}`,{i2c:i===4?'SDA':i===5?'SCL':null}));
    pins.push(pwr('5V.1',5,'5V.1'),pwr('5V.2',5,'5V.2'),pwr('3V3',3.3,'3V3'),pwr('VIN',9,'VIN'));
    for(let i=1;i<=5;i++)pins.push(pwr(`GND.${i}`,0,`GND.${i}`));pins.push({name:'RESET',type:'digital',meta:{physicalPin:'RESET'}});
    return makeBoard('Arduino Mega 2560','board',boardPorts(pins,{logicVoltage:5,sourceRef:standardSource.mega,verified:true}),{sub:'ATmega2560 • 54 digital • 16 analog',logicVoltage:5,sourceRef:standardSource.mega,verificationStatus:'verified',h:420});
  }
  function makeEsp32(name='ESP32 DevKit V1',variant='esp32'){
    const leftNames=['3V3','EN','VP','VN','GPIO34','GPIO35','GPIO32','GPIO33','GPIO25','GPIO26','GPIO27','GPIO14','GPIO12','GND.1','GPIO13','GPIO9','GPIO10','GPIO11','5V'];
    const rightNames=['GND.2','GPIO23','GPIO22','TX0','RX0','GPIO21','GND.3','GPIO19','GPIO18','GPIO5','GPIO17','GPIO16','GPIO4','GPIO0','GPIO2','GPIO15','SD_CMD','SD_D0','SD_CLK'];
    const ps=[];
    const left=leftNames.map((n,i)=>{let type='digital',meta={physicalPin:`L${i+1}`,verificationStatus:variant==='esp32c'?'verified':'variant-dependent'};if(n==='3V3'||n==='5V')return {...pwr(n,n==='5V'?5:3.3,`L${i+1}`),side:'left'};if(n.startsWith('GND'))return {...pwr(n,0,`L${i+1}`),side:'left'};if(n==='VP')return {name:n,type:'analog-in',side:'left',meta:{inputOnly:true,analog:true,physicalPin:`L${i+1}`,logicalName:'GPIO36',verificationStatus:meta.verificationStatus}};if(n==='VN')return {name:n,type:'analog-in',side:'left',meta:{inputOnly:true,analog:true,physicalPin:`L${i+1}`,logicalName:'GPIO39',verificationStatus:meta.verificationStatus}};if(/^GPIO3[245]$/.test(n))return {name:n,type:'analog-in',side:'left',meta:{inputOnly:true,analog:true,physicalPin:`L${i+1}`,logicalName:n,verificationStatus:meta.verificationStatus}};if(n==='EN')type='digital';return {name:n,type,side:'left',meta};});
    const right=rightNames.map((n,i)=>{if(n.startsWith('GND'))return {...pwr(n,0,`R${i+1}`),side:'right'};if(n==='SD_CMD'||n==='SD_D0'||n==='SD_CLK')return {name:n,type:'special',side:'right',meta:{physicalPin:`R${i+1}`,reserved:true,verificationStatus:'verified',note:'flash/SD reserved on some variants'}};let gpio=n.replace('GPIO','');let meta={physicalPin:`R${i+1}`,logicalName:n,pwm:true,interrupt:true,verificationStatus:variant==='esp32c'?'verified':'variant-dependent'};if(['22','21'].includes(gpio))meta.i2c=true;if(['18','19','23','5'].includes(gpio))meta.spi=true;if(n==='TX0')meta.logicalName='GPIO1',meta.uart='TX0';if(n==='RX0')meta.logicalName='GPIO3',meta.uart='RX0';return {name:n,type:'digital',side:'right',meta};});
    ps.push(...left.map((p)=>({...p,meta:{...p.meta,sourceRef:variant==='esp32c'?standardSource.esp32:standardSource.wokwiEsp32}})),...right.map((p)=>({...p,meta:{...p.meta,sourceRef:standardSource.wokwiEsp32}})));
    return makeBoard(name,'board',ps,{sub:'ESP32 • physical header profile',logicVoltage:3.3,sourceRef:standardSource.esp32,verificationStatus:variant==='esp32c'?'verified':'variant-dependent',family:'ESP32'});
  }
  function makePico(name='Raspberry Pi Pico'){
    const ps=[];for(let i=0;i<=22;i++)ps.push(dig(`GP${i}`,i,{pwm:true,i2c:true,spi:true,uart:true}));
    ps.push(analog('GP26',26,{analog:true}),analog('GP27',27,{analog:true}),analog('GP28',28,{analog:true}),pwr('3V3',3.3,'3V3'),pwr('VSYS',5,'VSYS'),pwr('VBUS',5,'VBUS'));
    for(let i=1;i<=8;i++)ps.push(pwr(`GND.${i}`,0,i));
    return makeBoard(name,'board',boardPorts(ps,{logicVoltage:3.3,sourceRef:standardSource.pico,verified:true}),{sub:'RP2040 • GP0–GP28 + power/GND',logicVoltage:3.3,sourceRef:standardSource.pico,verificationStatus:'verified',family:'RP2040',h:430});
  }
  function makeNodeMCU(name){
    const ps=[pwr('VIN',5,'VIN'),pwr('3V3',3.3,'3V3'),pwr('GND',0,'GND'),{name:'RST',type:'digital',meta:{physicalPin:'RST'}},{name:'EN',type:'digital',meta:{physicalPin:'EN'}},{name:'A0',type:'analog-in',meta:{analog:true,physicalPin:'A0'}}];
    for(let i=0;i<=8;i++)ps.push({name:`D${i}`,type:'digital',meta:{logicalName:`GPIO${i}`,pwm:true,i2c:true,spi:true,physicalPin:`D${i}`}});ps.push({name:'RX',type:'digital',meta:{uart:'RX'}},{name:'TX',type:'digital',meta:{uart:'TX'}});
    return makeBoard(name,'board',boardPorts(ps,{logicVoltage:3.3,verified:false}),{sub:'ESP8266 • D0–D8 + A0',logicVoltage:3.3,verificationStatus:'derived-common-profile',family:'ESP8266'});
  }
  function makeStm32(name){
    const ps=[];for(const bank of ['A','B'])for(let i=0;i<16;i++)ps.push({name:`P${bank}${i}`,type:'digital',meta:{physicalPin:`P${bank}${i}`,analog:i<8,pwm:true,interrupt:true}});ps.push({name:'PC13',type:'digital',meta:{physicalPin:'PC13'}},{name:'PC14',type:'digital',meta:{physicalPin:'PC14'}},{name:'PC15',type:'digital',meta:{physicalPin:'PC15'}});ps.push(pwr('3V3',3.3,'3V3'),pwr('5V',5,'5V'),pwr('GND',0,'GND'),{name:'NRST',type:'digital',meta:{physicalPin:'NRST'}});
    return makeBoard(name,'board',boardPorts(ps,{logicVoltage:3.3,sourceRef:name==='STM32 Blue Pill'?standardSource.bluepill:null,verified:name==='STM32 Blue Pill'}),{sub:'STM32 • connectivity pin profile',logicVoltage:3.3,sourceRef:name==='STM32 Blue Pill'?standardSource.bluepill:null,verificationStatus:name==='STM32 Blue Pill'?'verified':'variant-dependent',family:'STM32',h:430});
  }
  function makeTeensy(name){const ps=[];for(let i=0;i<40;i++)ps.push(dig(`D${i}`,i,{pwm:true,interrupt:true}));for(let i=0;i<18;i++)ps.push(analog(`A${i}`,i,{analog:true}));ps.push(pwr('3V3',3.3,'3V3'),pwr('5V',5,'5V'),pwr('GND',0,'GND'),pwr('VIN',5,'VIN'));return makeBoard(name,'board',boardPorts(ps,{logicVoltage:3.3,verified:false}),{sub:'Teensy • connectivity profile',logicVoltage:3.3,verificationStatus:'derived-common-profile',family:'Teensy',h:450});}
  function makeFeather(name){const ps=[];for(let i=0;i<16;i++)ps.push(dig(`D${i}`,i,{pwm:true,interrupt:true,physicalPin:`D${i}`}));for(let i=0;i<8;i++)ps.push(analog(`A${i}`,i,{analog:true,physicalPin:`A${i}`}));ps.push(pwr('USB',5,'USB'),pwr('3V3',3.3,'3V3'),pwr('GND',0,'GND'),pwr('BAT',3.7,'BAT'));return makeBoard(name,'board',boardPorts(ps,{logicVoltage:3.3,verified:false}),{sub:'Feather • connectivity profile',logicVoltage:3.3,verificationStatus:'derived-common-profile',family:'Feather',h:410});}
  function makeCircuitPlayground(){const ps=[];for(let i=0;i<10;i++)ps.push(dig(`A${i}`,i,{pwm:true,physicalPin:`A${i}`}));ps.push(pwr('3V',3.3,'3V'),pwr('GND',0,'GND'),pwr('VBAT',3.7,'VBAT'));return makeBoard('Circuit Playground Express','board',boardPorts(ps,{logicVoltage:3.3,verified:false}),{sub:'ATmega32U4 • touch / motion / light capable board profile',logicVoltage:3.3,verificationStatus:'derived-common-profile',family:'CircuitPlayground',h:320});}
  function makeShield(name){const ps=[pwr('5V',5,'5V'),pwr('3V3',3.3,'3V3'),pwr('VIN',9,'VIN'),pwr('GND',0,'GND')];for(let i=0;i<14;i++)ps.push(dig(`D${i}`,i,{shieldHeader:true}));for(let i=0;i<6;i++)ps.push(analog(`A${i}`,`A${i}`,{shieldHeader:true}));ps.push({name:'AREF',type:'analog-in',meta:{shieldHeader:true}},{name:'RESET',type:'digital',meta:{shieldHeader:true}});return {title:name,sub:'Arduino shield/header breakout',kind:'board',w:210,h:320,supportLevel:'connectivity',logicVoltage:5,verificationStatus:'derived-common-profile',model:{kind:'shield-profile',simulation:'connectivity-only'},ports:boardPorts(ps,{logicVoltage:5,verified:false})};}
  function makeBreadboard(name){const isBig=/830/.test(name),count=isBig?30:20;const ps=[{...pwr('RAIL+',5,'RAIL+'),side:'left'},{...pwr('RAIL-',0,'RAIL-'),side:'left'},{...pwr('RAIL2+',5,'RAIL2+'),side:'right'},{...pwr('RAIL2-',0,'RAIL2-'),side:'right'}];for(let r=1;r<=5;r++)for(let c=1;c<=count;c++)ps.push({name:`${String.fromCharCode(64+r)}${c}`,type:'passive',side:c<=Math.ceil(count/2)?'left':'right',meta:{breadboardNode:true,row:r,column:c,verificationStatus:'derived-breadboard-topology'}});return {title:name,sub:`${count} columns • breadboard topology`,kind:'io',w:300,h:230,supportLevel:'connectivity',logicVoltage:null,verificationStatus:'derived-breadboard-topology',model:{kind:'breadboard',simulation:'net-connectivity'},ports:boardPorts(ps,{logicVoltage:null,verified:false})};}

  const generic = {
    digitalSensor:['VCC','GND','OUT'],
    analogSensor:['VCC','GND','AO'],
    analogDigitalSensor:['VCC','GND','AO','DO'],
    i2c:['VCC','GND','SDA','SCL'],
    i2cInt:['VCC','GND','SDA','SCL','INT'],
    spi:['VCC','GND','SCK','MISO','MOSI','CS'],
    uart:['VCC','GND','TX','RX'],
    radio:['VCC','GND','CE','CSN','SCK','MOSI','MISO','IRQ'],
    relay:['VCC','GND','IN','COM','NO','NC'],
    servo:['VCC','GND','SIG'],
    motor:['A+','A-','B+','B-'],
    motorDriver:['VM','VCC','GND','IN1','IN2','IN3','IN4','ENA','ENB','OUT1','OUT2','OUT3','OUT4'],
    displayI2c:['VCC','GND','SDA','SCL'],
    displaySpi:['VCC','GND','CS','RST','DC','MOSI','SCK','MISO','LED'],
    led:['A','K'],
    rgb:['R','G','B','COM'],
    matrix:['VCC','GND','DIN','CLK','CS'],
    keypad4:['R1','R2','R3','R4','C1','C2','C3','C4'],
    keypad3:['R1','R2','R3','C1','C2','C3'],
    joystick:['VCC','GND','VRX','VRY','SW'],
    encoder:['VCC','GND','CLK','DT','SW'],
    storageI2c:['VCC','GND','SDA','SCL'],
    sd:['VCC','GND','CS','SCK','MOSI','MISO'],
    thermSpi:['VCC','GND','SO','CS','SCK'],
    therm3:['VCC','GND','OUT'],
    loadCell:['E+','E-','A+','A-','VCC','GND','DT','SCK'],
    can:['VCC','GND','CANH','CANL','RX','TX'],
    rs485:['VCC','GND','RO','DI','DE','RE','A','B'],
    level:['HV','LV','GND','HV1','LV1','HV2','LV2','HV3','LV3','HV4','LV4'],
    dacI2c:['VCC','GND','SDA','SCL','OUT'],
  };
  function connectorPorts(names,kind='io',opts={}){
    const ports=names.map((n,i)=>{
      const low=n.toLowerCase(); let type='passive', meta={physicalPin:i+1,verificationStatus:opts.verificationStatus||'derived-common-profile',sourceRef:opts.sourceRef||null};
      if(low==='gnd'||low.startsWith('gnd')||low==='vss'){type='ground';meta.voltage=0;}
      else if(opts.relay && ['com','no','nc'].includes(low)){type='relay-com';meta.relayContact=low.toUpperCase();}
      else if(['vcc','5v','3v3','vin','vs','vm','usb','bat','vbat','vh','lv','hv','vdd','vo','led'].includes(low) || /\+$/.test(low)&&opts.powerPlus){type=low==='5v'||low==='vs'||low==='vm'||low==='vin'?'power5':'power';meta.voltage=opts.defaultVoltage ?? (low==='3v3'||low==='vcc'||low==='lv'||low==='vdd'?3.3:5);}
      else if(/^a\d+$/.test(low)||low==='ao'||low==='out'||/^vr[xy]$/.test(low)){type=opts.digitalOut && low==='out'?'digital-out':'analog-out';meta.analog=type==='analog-out';meta.direction=type==='analog-out'?'output':'output';}
      else if(['sda'].includes(low)){type='i2c-sda';meta.bus='I2C';}
      else if(['scl'].includes(low)){type='i2c-scl';meta.bus='I2C';}
      else if(['sck','clk'].includes(low)){type='digital-pwm';meta.bus=opts.bus||'SPI';}
      else if(['mosi','miso','cs','csn','ss','din','dout','dc','rst','reset','trig','echo','en','ena','enb','in','in1','in2','in3','in4','rpwm','lpwm','de','re','step','dir','ce','irq','int','tx','rx'].includes(low)){type='digital';}
      else if(['sig','signal','data','dq','out1','out2','out3','out4','ro','di','a','b','canh','canl'].includes(low)){type=opts.digitalOut?'digital-out':'digital';meta.direction=type==='digital-out'?'output':'bidirectional';}
      else if(['a','k','r','g','b','com'].includes(low)){type=low==='com'?'ground':'digital-pwm';}
      else if(['com','no','nc'].includes(low)){type='relay-com';}
      if(low==='miso' && opts.spiReadback)type='digital-in';
      return [n,type,0,0,'right',meta];
    });
    const left=ports.slice(0,Math.ceil(ports.length/2)),right=ports.slice(Math.ceil(ports.length/2));
    return [...evenly(left,'left'),...evenly(right,'right')];
  }
  function matchType(name){const n=name.toLowerCase();
    if(/rfid rc522/.test(n))return [['3.3V','GND','RST','SDA/SS','MOSI','MISO','SCK','IRQ'],'rfid-spi'];
    if(/pn532/.test(n))return [['VCC','GND','SDA','SCL','MOSI','MISO','SCK','SS','IRQ'],'nfc-multi-interface'];
    if(/w5500/.test(n))return [['VCC','GND','SCK','MISO','MOSI','CS','RST','INT'],'ethernet-spi'];
    if(/max6675/.test(n))return ['thermSpi',{}];
    if(/tcs3200/.test(n))return [['VCC','GND','S0','S1','S2','S3','OUT','OE'],'color-frequency'];
    if(/mq-|flame sensor|sound sensor|microphone/.test(n))return ['analogDigitalSensor',{}];
    if(/pir hc-sr501|hall sensor|reed switch|tilt switch|vibration/.test(n))return ['digitalSensor',{}];
    if(/water flow/.test(n))return [['VCC','GND','PULSE'],'flow-sensor'];
    if(/water level|rain drop|soil moisture|sharp ir|gp2y0a|ml8511|guva-s12sd|ldr module|photodiode|flex sensor|force sensitive/.test(n))return ['analogDigitalSensor',{}];
    if(/vl53l0x|vl53l1x|vl6180x/.test(n))return ['i2cInt',{}];
    if(/max9814|max4466/.test(n))return [['VCC','GND','OUT'],'analog-mic'];
    if(/tcs34725|apds9960/.test(n))return ['i2cInt',{}];
    if(/ky-040|rotary encoder/.test(n))return ['encoder',{}];
    if(/dht22/.test(n))return [['VCC','DATA','NC','GND'],'dht22'];
    if(/ds18b20/.test(n))return [['VCC','DQ','GND'],'onewire'];
    if(/ds1307/.test(n))return [['GND','5V','SDA','SCL','SQW'],'rtc-i2c'];
    if(/mpu6050/.test(n))return [['VCC','GND','SCL','SDA','XDA','XCL','AD0','INT'],'imu-i2c'];
    if(/ssd1306/.test(n))return [['GND','VCC','SCL','SDA'],'oled-i2c'];
    if(/ili9341/.test(n))return ['displaySpi',{sourceRef:'https://docs.wokwi.com/parts/wokwi-ili9341'}];
    if(/micro sd/.test(n))return [['CD','DO','GND','SCK','VCC','DI','CS'],'sd-card'];
    if(/4x4 keypad/.test(n))return ['keypad4',{sourceRef:'https://docs.wokwi.com/parts/wokwi-membrane-keypad'}]; if(/3x4 keypad/.test(n))return ['keypad3',{sourceRef:'https://docs.wokwi.com/parts/wokwi-membrane-keypad'}];
    if(/lcd parallel/.test(n))return [['VSS','VDD','VO','RS','RW','E','D0','D1','D2','D3','D4','D5','D6','D7'],'display-parallel'];
    if(/lcd i2c/.test(n)||/oled/.test(n))return ['displayI2c',{}]; if(/tft|e-paper/.test(n))return [n.includes('ILI9341')||n.includes('ST7735')||n.includes('ST7789')||n.includes('e-paper')?'displaySpi':'displayI2c',{}];
    if(/nextion/.test(n))return ['uart',{}]; if(/tm1637/.test(n))return [['VCC','GND','CLK','DIO'],'display']; if(/7-segment/.test(n))return [['A','B','C','D','E','F','G','DP','COM1','COM2'],'display']; if(/led bargraph/.test(n)){const x=[];for(let i=1;i<=10;i++){x.push(`A${i}`);x.push(`C${i}`);}return [x,'matrix'];}
    if(/ws2812|neopixel/.test(n))return [['VCC','GND','DIN','DOUT'],'addressable-led']; if(/^single led$/.test(n))return ['led',{}]; if(/rgb led/.test(n))return ['rgb',{}];
    if(/servo/.test(n))return ['servo',{}]; if(/a4988/.test(n))return [['VMOT','VDD','GND','1A','1B','2A','2B','STEP','DIR','EN','MS1','MS2','MS3','RESET','SLEEP'],'a4988-driver']; if(/stepper/.test(n)||/nema17/.test(n))return ['motor',{}]; if(/motor driver|l298n|tb6612|drv8833|bts7960/.test(n))return ['motorDriver',{}]; if(/relay/.test(n))return ['relay',{}]; if(/mosfet/.test(n))return [['VCC','GND','IN','OUT+','OUT-'],'driver'];
    if(/load cell/.test(n))return ['loadCell',{}]; if(/can/.test(n))return ['can',{}]; if(/rs485/.test(n))return ['rs485',{}]; if(/level shifter/.test(n))return ['level',{}];
    if(/mpu6050|mpu9250|bno055|adxl345|lis3dh|hmc5883l|qmc5883l/.test(n))return [n.includes('BNO')||n.includes('MPU')||n.includes('HMC')||n.includes('QMC')?'i2cInt':'i2cInt',{}];
    if(/mcp3008|ads1115|mcp3208/.test(n))return [['VCC','GND','CS','SCK','MOSI','MISO','CH0','CH1','CH2','CH3','CH4','CH5','CH6','CH7'],'adc'];
    if(/mcp4725|ina219|ina226|ina3221|pcf8574|mcp23017|ds3231|ds1307|at24c256|fram i2c|bh1750|tsl2561|tsl2591|tcs34725|apds9960|bme280|bmp280|bmp180|bmp388|sht30|sht31|sht35/.test(n))return ['i2c',{}];
    if(/mcp4921|ad9833/.test(n))return ['spi',{}]; if(/micro sd/.test(n))return ['sd',{}]; if(/max6675/.test(n))return ['thermSpi',{}];
    if(/hc-05|hc-06|hm-10|gps|nextion/.test(n))return ['uart',{}]; if(/nrf24|sx1278|ra-02/.test(n))return ['radio',{}]; if(/433mhz transmitter/.test(n))return [['VCC','GND','DATA'],'radio-tx']; if(/433mhz receiver/.test(n))return [['VCC','GND','DATA'],'radio-rx']; if(/rfid rc522|pn532/.test(n))return ['spi',{}]; if(/w5500/.test(n))return ['spi',{}];
    if(/mq-|flame|sound|microphone|pir|hall|reed|tilt|vibration|ttp223|ir receiver|push button/.test(n))return ['digitalSensor',{}];
    if(/soil|rain|water level|water flow|ldr|photodiode|uv|force sensitive|flex sensor|lm35|tmp36|sharp ir|gp2y0a/.test(n))return ['analogDigitalSensor',{}];
    if(/dht11|dht22|ds18b20/.test(n))return [['VCC','GND','DATA'],'sensor-bus'];
    if(/joystick/.test(n))return ['joystick',{}]; if(/potentiometer|slider/.test(n))return ['analogSensor',{}]; if(/encoder/.test(n))return ['encoder',{}]; if(/ir led/.test(n))return [['A','K'],'led'];
    if(/buzzer/.test(n))return [['VCC','GND','SIG'],'buzzer'];
    if(/flame|mq-|sound|microphone|pir|hall|reed|tilt|vibration/.test(n))return ['digitalSensor',{}];
    if(/camera/.test(n))return [['3V3','GND','SDA','SCL','XCLK','PCLK','VSYNC','HREF','D0','D1','D2','D3','D4','D5','D6','D7'],'camera'];
    return ['digitalSensor',{}];
  }

  const registry={};
  names.forEach((name,idx)=>{
    let t;
    if(name==='Arduino Uno R3')t=makeUno();
    else if(name==='Arduino Nano')t=makeNano();
    else if(name==='Arduino Mega 2560')t=makeMega();
    else if(name==='ESP32 DevKit V1')t=makeEsp32('ESP32 DevKit V1','esp32');
    else if(name==='ESP32 DevKitC')t=makeEsp32('ESP32 DevKitC','esp32c');
    else if(/ESP32-S3 DevKitC/.test(name))t=makeEsp32(name,'variant');
    else if(/ESP32-(C3|C6|S2)|ESP32-WROVER/.test(name))t=makeEsp32(name,'variant');
    else if(/NodeMCU|Wemos D1 mini/.test(name))t=makeNodeMCU(name);
    else if(/Raspberry Pi Pico/.test(name))t=makePico(name);
    else if(/RP2040 Zero|XIAO RP2040/.test(name))t=makePico(name);
    else if(/STM32/.test(name))t=makeStm32(name);
    else if(/Teensy/.test(name))t=makeTeensy(name);
    else if(/Feather/.test(name))t=makeFeather(name);
    else if(name==='Circuit Playground Express')t=makeCircuitPlayground();
    else if(/Shield/.test(name))t=makeShield(name);
    else if(/Breadboard/.test(name))t=makeBreadboard(name);
    else if(name==='Mini Breadboard')t=makeBreadboard(name);
    if(!t){
      const [shape, subtype]=matchType(name);const pinNames=Array.isArray(shape)?shape:(generic[shape]||generic.digitalSensor);const ports=connectorPorts(pinNames,'io',{defaultVoltage:/motor|relay|pump|fan|solenoid/i.test(name)?5:3.3,verificationStatus:'derived-common-profile',sourceRef:null,bus:/i2c/i.test(String(shape))?'I2C':'SPI',digitalOut:/sensor|microphone|buzzer|transmitter|receiver|gps|flame|mq-|hall|reed|tilt|vibration|pir|rain|soil|water|photodiode|ldr|uv/i.test(name),relay:/relay/i.test(name)});
      t={title:name,sub:`${categoryOf(name)} • ${subtype||shape}`,kind:categoryOf(name),w:Math.min(240,150+ports.length*4),h:Math.min(190,88+ports.length*3),supportLevel:'connectivity',logicVoltage:null,
        verificationStatus:/^Arduino|^ESP32|^Raspberry|^RP2040|^STM32|^Teensy|^Feather/.test(name)?'variant-dependent':'derived-common-profile',
        model:{kind:'connectivity-profile',simulation:'interface-only',subtype:subtype||shape},ports};
    }
    // Normalize and enrich every port.
    t.id=`mod-${idx+1}`;t.order=idx+1;t.assetRef=`assets/arduino-topdown-2d-png/mod-${String(idx+1).padStart(3,'0')}.png`;t.asset={kind:'drawn-realistic',ref:t.assetRef,sourceType:'system-generated-detailed-vector',verified:Boolean(t.verificationStatus==='verified'),license:'original-system-generated'};t.verification={
      asset:'topdown-2d-transparent-png',pinout:t.verificationStatus==='verified'?'verified':'source-review-required',
      metadata:'complete',behavior:t.supportLevel==='native'||t.supportLevel==='behavioral'?'behavioral-available':'connectivity-only',
      status:t.verificationStatus,sourceRef:t.sourceRef||null,verifiedAt:t.verificationStatus==='verified'?new Date().toISOString():null
    };
    const directionFor=(type)=>({power:'power-input',power5:'power-input',ground:'passive','analog-in':'input','analog-out':'output','digital':'bidirectional','digital-in':'input','digital-out':'output','digital-pwm':'output','digital-inout':'bidirectional','i2c-sda':'open-drain','i2c-scl':'open-drain','interrupt':'input','led-anode':'output','relay-com':'passive','relay-no':'passive','special':'special'}[type]||'passive');
    t.ports=t.ports.map(p=>{const pm=p[5]||{};return [p[0],p[1],p[2],p[3],p[4],{...pm,label:p[0],role:p[1],direction:pm.direction||directionFor(p[1]),physicalPin:String(pm.physicalPin ?? p[0]),verificationStatus:pm.verificationStatus||t.verificationStatus,sourceRef:pm.sourceRef||t.sourceRef||null}];});
    // Semantic corrections for common connector conventions. These remain conservative and are tagged by verificationStatus.
    if(t.ports){
      const n=name.toLowerCase();
      t.ports=t.ports.map(p=>{const x=[...p],m={...(p[5]||{})},low=String(p[0]).toLowerCase();
        if(/^ao$/.test(low) || /^vr[xy]$/.test(low)){x[1]='analog-out';m.role='analog-out';m.direction='output';m.analog=true;}
        if((low==='out'||low==='do'||low==='sig'||low==='data') && /sensor|pir|flame|mq-|hall|reed|tilt|vibration|rain|soil|water|sound|microphone|receiver/i.test(n)){x[1]='digital-out';m.role='digital-out';m.direction='output';}
        if(low==='dq'||low==='data'||low==='sda'||low==='scl'||low==='tx'||low==='rx'){
          if(!m.protocol && /dht|ds18b20/i.test(n)) m.protocol='OneWire';
          else if(!m.protocol && /i2c|oled|lcd|bh1750|bme|bmp|sht|mpu|bno|tcs34725|apds9960|ds3231|ds1307|eeprom|fram/i.test(n)) m.protocol='I2C';
          else if(!m.protocol && /bluetooth|gps|nextion/i.test(n)) m.protocol='UART';
        }
        if(/relay/i.test(n)&&['com','no','nc'].includes(low)){x[1]='relay-com';m.role='relay-contact';m.direction='passive';}
        return [x[0],x[1],x[2],x[3],x[4],m];});
    }
    const verifiedMap={
      'HC-SR04':{status:'verified',sourceRef:standardSource.hc},
      'DHT22':{status:'verified',sourceRef:standardSource.dht22},
      'DS18B20':{status:'verified',sourceRef:standardSource.ds18},
      'DS1307 RTC':{status:'verified',sourceRef:standardSource.ds1307},
      'OLED SSD1306':{status:'verified',sourceRef:standardSource.oled},
      'MPU6050':{status:'verified',sourceRef:standardSource.mpu6050},
      'TFT ILI9341':{status:'verified',sourceRef:standardSource.ili9341},
      'Micro SD Module':{status:'verified',sourceRef:standardSource.microsd},
      '4x4 Keypad':{status:'verified',sourceRef:standardSource.keypad},
      'LED Bargraph':{status:'verified',sourceRef:standardSource.ledbar}
    };
    if(verifiedMap[name]){t.verificationStatus=verifiedMap[name].status;t.sourceRef=verifiedMap[name].sourceRef;t.verification={...t.verification,status:'verified',pinout:'verified',sourceRef:t.sourceRef,verifiedAt:new Date().toISOString()};t.ports=t.ports.map(p=>[p[0],p[1],p[2],p[3],p[4],{...(p[5]||{}),verificationStatus:'verified',sourceRef:t.sourceRef}]);}
    registry[name]=deep(t);
  });

  function categoryOf(name){const n=name.toLowerCase();if(/arduino|esp32|pico|stm32|teensy|feather|nodemcu|wemos|xiao|shield|breadboard/.test(n))return 'board';if(/lcd|oled|tft|e-paper|7-segment|matrix|display|nextion/.test(n))return 'display';if(/servo|motor|pump|fan|solenoid|stepper|driver|relay|mosfet|bts7960/.test(n))return 'motor';if(/button|keypad|joystick|potentiometer|encoder|led|buzzer|rfid|nfc|bluetooth|wifi|radio|usb|level shifter/.test(n))return 'io';return 'sensor';}

  // Defensive repair: ensure every ESP32 profile has named 38-pin endpoints even if a variant generator changes shape.
  function repairEsp32Ports(t){
    if(!t || !/^ESP32/.test(t.title) || t.ports.every(p=>typeof p[0]==='string')) return t;
    const leftNames=['3V3','EN','VP','VN','GPIO34','GPIO35','GPIO32','GPIO33','GPIO25','GPIO26','GPIO27','GPIO14','GPIO12','GND.1','GPIO13','GPIO9','GPIO10','GPIO11','5V'];
    const rightNames=['GND.2','GPIO23','GPIO22','TX0','RX0','GPIO21','GND.3','GPIO19','GPIO18','GPIO5','GPIO17','GPIO16','GPIO4','GPIO0','GPIO2','GPIO15','SD_CMD','SD_D0','SD_CLK'];
    const make=(n,i,side)=>{const base={physicalPin:`${side==='left'?'L':'R'}${i+1}`,verificationStatus:t.verificationStatus||'variant-dependent',sourceRef:t.sourceRef||standardSource.wokwiEsp32};if(n.startsWith('GND'))return [n,'ground',side==='left'?0.08:0.92,0,side,{...base,voltage:0,direction:'passive'}];if(n==='3V3')return [n,'power',side==='left'?0.08:0.92,0,side,{...base,voltage:3.3,direction:'power-input'}];if(n==='5V')return [n,'power5',side==='left'?0.08:0.92,0,side,{...base,voltage:5,direction:'power-input'}];if(n==='VP')return [n,'analog-in',side==='left'?0.08:0.92,0,side,{...base,analog:true,inputOnly:true,logicalName:'GPIO36',direction:'input'}];if(n==='VN')return [n,'analog-in',side==='left'?0.08:0.92,0,side,{...base,analog:true,inputOnly:true,logicalName:'GPIO39',direction:'input'}];if(/^GPIO3[245]$/.test(n))return [n,'analog-in',side==='left'?0.08:0.92,0,side,{...base,analog:true,inputOnly:true,logicalName:n,direction:'input'}];return [n,'digital',side==='left'?0.08:0.92,0,side,{...base,logicalName:n,pwm:true,interrupt:true,direction:'bidirectional'}];};
    const ports=[];leftNames.forEach((n,i)=>{const p=make(n,i,'left');p[3]=0.05+i*(0.90/Math.max(1,leftNames.length-1));ports.push(p);});rightNames.forEach((n,i)=>{const p=make(n,i,'right');p[3]=0.05+i*(0.90/Math.max(1,rightNames.length-1));ports.push(p);});
    t.ports=ports; return t;
  }
  Object.keys(registry).forEach(k=>repairEsp32Ports(registry[k]));


  // Extended Arduino board catalog: official Arduino families and compatible expansion boards.
  // These entries are conservative connectivity profiles; where a board has complex/high-density
  // connectors, the simulator exposes named interface endpoints rather than claiming exact silicon-level simulation.
  const extraBoardNames = ["Arduino UNO R4 Minima", "Arduino UNO R4 WiFi", "Arduino UNO WiFi Rev2", "Arduino UNO Q", "Arduino UNO Mini Limited Edition", "Arduino Nano Every", "Arduino Nano 33 BLE Rev2", "Arduino Nano 33 BLE Sense", "Arduino Nano 33 BLE Sense Rev2", "Arduino Nano Matter", "Arduino Nano ESP32", "Arduino Nano ESP32-S3", "Arduino Yún Rev2", "Arduino Yún", "Arduino Esplora", "Arduino Mega ADK", "Arduino M0 Pro", "Arduino Leonardo ETH", "Arduino Ethernet Rev3", "Arduino 101", "Arduino MKR WiFi 1000", "Arduino MKR GSM 1400", "Arduino MKR WAN 1310", "Arduino MKR NB 1500", "Arduino MKR FOX 1200", "Arduino MKR Vidor 4000", "Arduino MKR Motor Carrier", "Arduino MKR CAN Shield", "Arduino MKR Relay Proto Shield", "Arduino MKR 485 Shield", "Arduino Edge Control", "Arduino Portenta C33", "Arduino Portenta H7 Lite", "Arduino Portenta H7 Lite Connected", "Arduino Portenta X8", "Arduino Portenta Machine Control", "Arduino Portenta Vision Shield", "Arduino Portenta Mid Carrier", "Arduino Portenta Hat Carrier", "Arduino Nicla Sense ME", "Arduino Nicla Sense Env", "Arduino Nicla Voice", "Arduino Nicla Vision", "Arduino GIGA Display Shield", "Arduino Opta Lite", "Arduino Opta RS485", "Arduino Opta WiFi"];
  function extraPinsFor(name){
    const n=name.toLowerCase();
    const pins=[];
    const addD=(count, prefix='D')=>{for(let i=0;i<count;i++){const p=dig(`${prefix}${i}`,i,{pwm:(i%6===3||i%6===5),interrupt:i<6});p.meta.boardFamily=name;pins.push(p);}};
    const addA=(count)=>{for(let i=0;i<count;i++)pins.push(analog(`A${i}`,`A${i}`,{boardFamily:name}));};
    const addP=()=>{pins.push(pwr(n.includes('33 ')||n.includes('mkr')||n.includes('nicla')||n.includes('portenta')?'3V3':'5V',n.includes('33 ')||n.includes('mkr')||n.includes('nicla')||n.includes('portenta')?3.3:5,'POWER'));
      pins.push(pwr('GND',0,'GND'));pins.push(pwr('VIN',9,'VIN'));pins.push({name:'RESET',type:'digital',meta:{physicalPin:'RESET',direction:'special',boardFamily:name}});};
    if(/opta/.test(n)){['I1','I2','I3','I4','I5','I6','I7','I8','Q0','Q1','Q2','Q3','Q4','A0','A1','A2','A3','RS485-A','RS485-B','CAN-H','CAN-L'].forEach((x,i)=>pins.push({name:x,type:/^A/.test(x)?'analog-in':/^I|^Q/.test(x)?'digital':'special',meta:{physicalPin:x,direction:/^Q/.test(x)?'output':/^A/.test(x)?'input':'bidirectional',boardFamily:name}})); pins.push(pwr('24V',24,'24V'));pins.push(pwr('GND',0,'GND')); return pins;}
    if(/portenta/.test(n)){for(let i=1;i<=80;i++)pins.push({name:`HD${String(i).padStart(2,'0')}`,type:'digital',meta:{physicalPin:`HD${String(i).padStart(2,'0')}`,direction:'bidirectional',boardFamily:name,connector:'high-density'}});['3V3','5V','VIN','GND.1','GND.2','I2C-SDA','I2C-SCL','SPI-MOSI','SPI-MISO','SPI-SCK','UART-TX','UART-RX'].forEach((x,i)=>pins.push({name:x,type:x.startsWith('GND')?'ground':x==='5V'?'power5':x==='3V3'||x==='VIN'?'power':'digital',meta:{physicalPin:x, direction:x.includes('TX')||x.includes('MOSI')?'output':x.includes('RX')||x.includes('MISO')?'input':'bidirectional',boardFamily:name}})); return pins;}
    if(/giga display shield/.test(n)){addD(30);['DISP-SDA','DISP-SCL','DISP-CLK','DISP-MOSI','DISP-MISO','CAM-CLK','CAM-D0','CAM-D1','AUDIO-L','AUDIO-R'].forEach(x=>pins.push({name:x,type:'digital',meta:{physicalPin:x,direction:'bidirectional',boardFamily:name}})); pins.push(pwr('5V',5,'5V'),pwr('GND',0,'GND')); return pins;}
    if(/vision shield|mid carrier|hat carrier|machine control|edge control|mkr .*shield|motor carrier/.test(n)){addD(/machine control|edge control/.test(n)?24:20);addA(/machine control|edge control/.test(n)?6:4);['I2C-SDA','I2C-SCL','SPI-MOSI','SPI-MISO','SPI-SCK','UART-TX','UART-RX'].forEach(x=>pins.push({name:x,type:'digital',meta:{physicalPin:x,direction:'bidirectional',boardFamily:name}}));addP();return pins;}
    if(/nicla/.test(n)){addD(14);addA(3);['I2C-SDA','I2C-SCL','SPI-MOSI','SPI-MISO','SPI-SCK','UART-TX','UART-RX'].forEach(x=>pins.push({name:x,type:'digital',meta:{physicalPin:x,direction:'bidirectional',boardFamily:name}}));pins.push(pwr('3V3',3.3,'3V3'),pwr('GND',0,'GND'));return pins;}
    if(/mkr/.test(n)){addD(14);addA(8);addP();return pins;}
    if(/nano 33|nano matter|nano esp32/.test(n)){addD(22);addA(8);pins.push(pwr('3V3',3.3,'3V3'),pwr('VBUS',5,'VBUS'),pwr('GND',0,'GND'),{name:'RESET',type:'digital',meta:{physicalPin:'RESET'}});return pins;}
    if(/nano/.test(n)){addD(14);addA(8);addP();return pins;}
    if(/mega adk/.test(n)){addD(54);addA(16);addP();return pins;}
    if(/leonardo|esplora|101/.test(n)){addD(20);addA(6);addP();return pins;}
    if(/m0 pro|yún|ethernet rev3/.test(n)){addD(20);addA(6);addP();return pins;}
    if(/uno/.test(n)){addD(14);addA(6);addP();return pins;}
    addD(20);addA(6);addP();return pins;
  }
  function addExtraBoard(name, order){
    const pins=extraPinsFor(name);
    const nl=name.toLowerCase();
    const lv = (/nano 33|nano matter|nano esp32|mkr|portenta|nicla|uno r4 minima|uno r4 wifi/.test(nl)) && !/uno r4 minima|uno r4 wifi/.test(nl) ? 3.3 : 5;
    const ref = `https://docs.arduino.cc/hardware/`;
    const t=makeBoard(name,'board',boardPorts(pins,{logicVoltage:lv,sourceRef:ref,verified:false}),{sub:`Arduino board • ${pins.length} interface endpoints`,logicVoltage:lv,sourceRef:ref,verificationStatus:'variant-dependent',family:'arduino-expanded'});
    t.id=`mod-${order}`;t.order=order;t.assetRef=`assets/arduino-topdown-2d-png/mod-${String(order).padStart(3,'0')}.png`;
    t.asset={kind:'drawn-topdown-board',ref:t.assetRef,sourceType:'system-generated-topdown-vector',verified:false,license:'original-system-generated'};
    t.verification={asset:'topdown-2d-transparent-png',pinout:'source-review-required',metadata:'complete',behavior:'connectivity-only',status:'variant-dependent',sourceRef:ref,verifiedAt:null};
    t.ports=t.ports.map(p=>{const pm=p[5]||{};return [p[0],p[1],p[2],p[3],p[4],{...pm,label:p[0],role:p[1],direction:pm.direction||'bidirectional',physicalPin:String(pm.physicalPin??p[0]),verificationStatus:'variant-dependent',sourceRef:ref}];});
    registry[name]=deep(t);
  }
  extraBoardNames.forEach((n,i)=>addExtraBoard(n,201+i));

  window.GH_ARDUINO_MODULE_REGISTRY_200={version:'2026.09.19',count:Object.keys(registry).length,modules:registry,names:Object.keys(registry),boardCatalog:Object.values(registry).filter(x=>x.kind==='board').map(x=>x.title)};

})();
