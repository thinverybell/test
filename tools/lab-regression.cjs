'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const checks = [];
function ok(name, pass, detail='') {
  checks.push({name, pass, detail});
  if (!pass) console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  else console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`);
}

const prompt = fs.readFileSync('/mnt/data/Văn bản đã dán (1).txt', 'utf8');
const modules = json('data/lab-modules.json');
const contract = json('data/lab-contract.json');
const boards = json('data/lab-board-profiles.json');
const html = read('lab.html');
const js = read('js/lab.js');
const sidebar = read('js/gh-unified-sidebar.js');
const css = read('css/lab.css');
const index = read('index.html');

const promptModules = [...prompt.matchAll(/36\.\d+ MODULE\s+(\d{3})\s+—\s+(.+)/g)].map(m => ({id:`MODULE_${m[1]}`, name:m[2].trim()}));
ok('Prompt module extraction', promptModules.length === 200, `found ${promptModules.length}`);
ok('Catalog module count', modules.length === 200, `found ${modules.length}`);
ok('Stable module IDs', modules.every((m,i)=>m.moduleId===`MODULE_${String(i+1).padStart(3,'0')}`));
ok('Catalog matches prompt', promptModules.every((p,i)=>modules[i].moduleId===p.id && (modules[i].variant===p.name || modules[i].accessibilityLabels?.name===p.name)), 'names/variants aligned');
ok('Contract field count', contract.moduleContractFields.length===41, `found ${contract.moduleContractFields.length}`);
const contractAliases = {
  'moduleId':['moduleId'],
  'category/family':['category','family'],
  'variant':['variant'],
  'manufacturer':['manufacturer'],
  'assetRef':['assetRef'],
  'assetChecksum':['assetChecksum'],
  'assetVersion':['assetVersion'],
  'license/sourceRef':['license','sourceRef'],
  'pinoutRef':['pinoutRef'],
  'verificationStatus':['verificationStatus'],
  'supportLevel':['supportLevel'],
  'logicVoltage':['logicVoltage'],
  'powerInputs':['powerInputs'],
  'powerOutputs':['powerOutputs'],
  'pins[]':['pins'],
  'ports[]':['ports'],
  'pin anchors':['pinAnchors'],
  'collision geometry':['collisionGeometry'],
  'behavior model':['behaviorModel'],
  'fault model':['faultModel'],
  'compatibility matrix':['compatibilityMatrix'],
  'board requirements':['boardRequirements'],
  'adapter requirements':['adapterRequirements'],
  'example wiring':['exampleWiring'],
  'example code':['exampleCode'],
  'student hint':['studentHint'],
  'teacher note':['teacherNote'],
  'lesson tags':['lessonTags'],
  'test fixture':['testFixture'],
  'render test':['renderTest'],
  'anchor test':['anchorTest'],
  'wiring test':['wiringTest'],
  'power test':['powerTest'],
  'runtime test':['runtimeTest'],
  'diagnostic test':['diagnosticTest'],
  'save/load test':['saveLoadTest'],
  'accessibility labels':['accessibilityLabels'],
  'search aliases':['searchAliases'],
  'localization keys':['localizationKeys'],
  'documentation':['documentation'],
  'known limitations':['knownLimitations']
};
const contractFieldsPresent = modules.every(m => contract.moduleContractFields.every(f => (contractAliases[f]||[]).every(k => Object.prototype.hasOwnProperty.call(m,k))));
ok('Module contract fields present', contractFieldsPresent);
ok('Unverified modules are honest by default', modules.filter(m=>m.verificationStatus==='unverified' && m.supportLevel==='unverified').length===198, '198 unverified + 2 source-verified behavioral boards');
ok('Verified board sources present', boards.profiles.filter(b=>b.verificationStatus==='verified').length>=2, `verified=${boards.profiles.filter(b=>b.verificationStatus==='verified').length}`);

const requiredHtml = ['boardSelect','policySelect','compileBtn','runBtn','resetBtn','consoleBody','serialBody','eventsBody','diagnosticModal','modalFocus','modalCorrect','modalWhy','modalUndo','exportReport','codeEditor'];
ok('Lab UI controls exist', requiredHtml.every(id=>html.includes(`id="${id}"`)), requiredHtml.filter(id=>!html.includes(`id="${id}"`)).join(', '));
const requiredFunctions = ['validateConnection','addWire','rebuildAfterTopology','log','openDiagnostic','compile','run','reset','exportReport','undo','redo'];
ok('Core lab functions present', requiredFunctions.every(n=>new RegExp(`function\\s+${n}\\s*\\(`).test(js)), requiredFunctions.filter(n=>!new RegExp(`function\\s+${n}\\s*\\(`).test(js)).join(', '));
const netlistBody = (js.match(/function buildNetlist\([\s\S]*?\n  }\n\n  function renderBoard/)||[''])[0];
ok('Netlist does not use pixel coordinates as truth', !/routePoints|currentPoint|clientX|clientY|\bx:\b|\by:\b/.test(netlistBody), 'netlist groups componentId:portId endpoints');
ok('Wire add creates undo snapshot', /saveSnapshot\(true\); app\.project\.wires\.push\(wire\)/.test(js));
ok('Port events guard metadata', /if\(!p\.dataset\.component\|\|!p\.dataset\.port\)return/.test(js));
ok('Console responsive drawer CSS', /@media\s*\(max-width:\s*760px\)/.test(css) && /lab-console/.test(css));
ok('Sidebar links to lab', sidebar.includes("href: 'lab.html'") && sidebar.includes("'lab.html': 'lab'"));
ok('Home top navigation links to lab', index.includes('lab-nav-link') && index.includes('href="lab.html"'));

const taxonomyCodes = ['WIRE001','WIRE002','WIRE003','WIRE004','WIRE005','PWR001','PWR002','PWR003','PWR004','PWR005','PWR006','GPIO001','GPIO002','GPIO003','GPIO004','GPIO005','GPIO006','GPIO007','BUS001','BUS002','BUS003','BUS004','UART001','UART002','FW001','FW002','FW003','FW004','COMP001','COMP002','SIM001','SIM002','ASSET001','ASSET002','ASSET003','LESSON001'];
ok('Error taxonomy complete', taxonomyCodes.every(c=>Object.prototype.hasOwnProperty.call(contract.errorTaxonomy,c)));
ok('Strict/sandbox flow rules present', Array.isArray(contract.flowRules.validConnection) && Array.isArray(contract.flowRules.invalidConnection) && Array.isArray(contract.flowRules.recovery));

const failures = checks.filter(x=>!x.pass);
console.log(`\nResult: ${checks.length - failures.length}/${checks.length} checks passed`);
process.exitCode = failures.length ? 1 : 0;
