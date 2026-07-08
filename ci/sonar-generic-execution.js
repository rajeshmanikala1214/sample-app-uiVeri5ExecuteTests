'use strict'
//
// SonarQube "Generic Test Execution" report generator for ui5-test-runner.
//
// ui5-test-runner ships JUnit/JSON/text generators but NOT the SonarQube
// generic-execution format. Your Jenkinsfile feeds
//   -Dsonar.testExecutionReportPaths=reports/Test-execution.xml
// which requires that specific format (JUnit XML is not accepted there for JS).
//
// A report generator is a plain Node script that ui5-test-runner invokes with
// argv[2] = the resolved report directory, and reads <reportDir>/job.js for the
// results. This mirrors how karma reporters plug into karma.conf.js.
//
// Format reference: SonarQube "Generic test data" (testExecutions version="1").
//
const { join } = require('path')
const { writeFile } = require('fs').promises
const [, , reportDir] = process.argv

const out = []
const o = (t) => out.push(t)
const esc = (t) =>
  String(t).replace(/[<>&"']/g, (m) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  }[m]))

// Map a test-page URL to a real, Sonar-indexable test source file under webapp/.
//   http://localhost:8080/test/unit/unitTests.qunit.html
//     -> webapp/test/unit/unitTests.qunit.js
// This matches sonar.tests=webapp/test and sonar.test.inclusions=webapp/test/**/*.js
function toFilePath (url) {
  let pathname
  try { pathname = new URL(url).pathname } catch (e) { pathname = String(url) }
  pathname = pathname.replace(/\?.*$/, '').replace(/^\/+/, '').replace(/\.html$/, '.js')
  if (!pathname.startsWith('webapp/')) pathname = 'webapp/' + pathname
  return pathname
}

async function main () {
  const job = require(join(reportDir, 'job.js'))
  const files = {} // filePath -> [ testCase xml, ... ]
  const pages = job.qunitPages || {}

  for (const url of Object.keys(pages)) {
    const page = pages[url] || { modules: [] }
    const filePath = toFilePath(url)
    const bucket = files[filePath] || (files[filePath] = [])

    for (const module of page.modules || []) {
      for (const test of module.tests || []) {
        const name = esc(`${module.name} / ${test.name}`)
        let duration = 0
        if (test.start && test.end) {
          duration = Math.max(0, Math.round(new Date(test.end) - new Date(test.start)))
        }
        if (test.skip) {
          bucket.push(`    <testCase name="${name}" duration="${duration}"><skipped message="skipped"/></testCase>`)
        } else if (!test.report) {
          bucket.push(`    <testCase name="${name}" duration="${duration}"><skipped message="no report found"/></testCase>`)
        } else if (test.report.failed) {
          const msg = esc(
            (test.logs || []).filter((l) => !l.result).map((l) => l.message).filter(Boolean).join('; ') ||
            'assertion failed'
          )
          bucket.push(`    <testCase name="${name}" duration="${duration}"><failure message="${msg}"/></testCase>`)
        } else {
          bucket.push(`    <testCase name="${name}" duration="${duration}"/>`)
        }
      }
    }
  }

  o('<?xml version="1.0" encoding="UTF-8"?>')
  o('<testExecutions version="1">')
  for (const filePath of Object.keys(files)) {
    o(`  <file path="${esc(filePath)}">`)
    files[filePath].forEach((tc) => o(tc))
    o('  </file>')
  }
  o('</testExecutions>')

  await writeFile(join(reportDir, 'Test-execution.xml'), out.join('\n'))
}

main()
  .catch((reason) => { console.error(reason); return -1 })
  .then((code = 0) => process.exit(code))