const { spawn } = require("child_process");
const fs = require('fs');

const isWindows = process.platform === 'win32';

const NPM_COMMAND = isWindows ? 'npm.cmd' : 'npm';
const YO_COMMAND = isWindows ? 'yo.cmd' : 'yo';
const GULP_COMMAND = isWindows ? 'gulp.cmd' : 'gulp';

const createProcessPromise = (command, args, failureMessage, eventCallbackModifier) => new Promise((res, rej) => {
  const newProcess = spawn(command, args);

  newProcess.stdout.pipe(process.stdout);
  newProcess.stderr.pipe(process.stderr);

  if (!!eventCallbackModifier) {
    eventCallbackModifier(newProcess);
  }

  newProcess.on('exit', code => {
    if (!!code) {
      rej(failureMessage);
    }
    res();
  });
});

const runNpmInstall = () => createProcessPromise(NPM_COMMAND, ['i'], 'Failed to install npm packages');

const runYeomanSharePointGenerator = () => createProcessPromise(YO_COMMAND, [
  '@microsoft/sharepoint',
  '--skip-cache',
  '--solution-name',
  'pdftron-webpart-sample',
  '--component-type',
  'webpart',
  '--framework',
  'none',
  '--environment',
  'spo',
  '--component-name',
  'PDFTronSample',
  '--component-description',
  '"PDFTron WebViewer sample web part"',
],
  'Failed to run @microsoft/sharepoint generator',
  p => {
    p.stdout.on('data', function (data) {
      if (data.toString().includes('?')) {
        p.stdin.write("N\n")
      }
    });

    p.stderr.on('data', function (data) {
      if (data.toString().includes('?')) {
        p.stdin.write("N\n")
      }
    });
  });

const installPdfTronWebViewer = () => createProcessPromise(NPM_COMMAND, [
  '--prefix',
  'pdftron-webpart-sample',
  'i',
  '@pdftron/webviewer@7.3.3',
  '--save',
],
  'Failed to install PDFTron WebViewer');

const trustDevCert = async () => {
  process.chdir('./pdftron-webpart-sample');
  /**
   * @note The command `gulp trust-dev-cert` fails if gulp > 3.9.1 is installed
   * as of 2021-07-20
   * Force install gulp@3.9.1 before running `gulp trust-dev-cert`
   */
  await createProcessPromise(NPM_COMMAND, ['i', 'gulp@3.9.1'], 'Failed to install gulp@3.9.1 for trusting dev certificate');
  await createProcessPromise(GULP_COMMAND, ['trust-dev-cert'], 'Failed to trust dev certificate');
  process.chdir('..');
  return Promise.resolve();
};

const migratePdfTronWebPart = () => new Promise((res, rej) => {

  // Create directories to match routes for what guides will show
  fs.mkdirSync('./pdftron-webpart-sample/_catalogs/masterpage/pdftron/lib', { recursive: true });
  fs.mkdirSync('./pdftron-webpart-sample/Shared Documents');

  const ncp = require('ncp').ncp;
  ncp.limit = 16;

  const migrateFiles = (src, dest, callback) => ncp(src, dest, callback);

  const migrateSampleDocs = () => migrateFiles(
    './sample-documents/',
    './pdftron-webpart-sample/Shared Documents',
    e => !!e ? rej('Failed to migrate sample documents') : res());

  const migratePdfTronLocalizationFiles = () => migrateFiles(
    './pdftron-webpart-sample/node_modules/@pdftron/webviewer/public/ui-legacy/i18n/',
    './pdftron-webpart-sample/src/webparts/pdfTronSample',
    e => !!e ? rej('Failed to migrate PDFTron localization files') : migrateSampleDocs());

  const migratePdfTronWebPartSourceCode = () => migrateFiles(
    './web-part-src/',
    './pdftron-webpart-sample/src/webparts/pdfTronSample',
    e => !!e ? rej('Failed to migrate PDFTron web part source code') : migratePdfTronLocalizationFiles());

  const migratePdfTronWebViewerSource = () => migrateFiles(
    './pdftron-webpart-sample/node_modules/@pdftron/webviewer/public/',
    './pdftron-webpart-sample/_catalogs/masterpage/pdftron/lib/',
    e => !!e ? rej('Failed to migrate PDFTron WebViewer source code from node_modules') : migratePdfTronWebPartSourceCode());

  migratePdfTronWebViewerSource();
});

const launchWebPart = () => {
  process.chdir('./pdftron-webpart-sample');
  return createProcessPromise(GULP_COMMAND, ['serve'], 'Failed to start SharePoint server');
};

async function main() {
  try {
    await runNpmInstall();
    await runYeomanSharePointGenerator();
    await trustDevCert();
    await installPdfTronWebViewer();
    await migratePdfTronWebPart();
    await launchWebPart();
  }
  catch (e) {
    console.log(e);
  }
}

main();
