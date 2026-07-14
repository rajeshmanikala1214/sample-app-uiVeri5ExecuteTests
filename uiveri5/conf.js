const path = require("path");

// uiVeri5 configuration (Protractor/Selenium-based E2E).
// Referenced as the LAST entry of runOptions, exactly like the SAP example
// runOptions: ["--seleniumAddress=...", "./uiveri5/conf.js"].
exports.config = {

	// Built-in E2E profile: Jasmine describe/it, control locators, screenshots.
	profile: "integration",

	// The application under test must be RUNNING and reachable at this URL.
	// In the native Jenkins docker network the node container (where the app is
	// served) is reachable from the Selenium sidecar via the alias "uiVeri5".
	// For a real deployment, set TARGET_SERVER_URL instead of serving locally.
	baseUrl: process.env.TARGET_SERVER_URL || "http://uiVeri5:8080/",

	// uiVeri5 spec files (native uiVeri5 tests, not OPA5).
	specs: path.join(__dirname, "integration", "*.spec.js"),

	// Real Chrome, provided by the selenium/standalone-chrome Piper sidecar.
	browsers: [{
		browserName: "chrome"
	}],

	// The Selenium hub is supplied via the --seleniumAddress runOption (Piper
	// convention). Kept here, commented, as a documented fallback:
	// seleniumAddress: "http://selenium:4444/wd/hub",

	// Runtime parameters, available to specs and to the auth block below.
	params: {
		user: process.env.TEST_USER,
		pass: process.env.TEST_PASS
	},

	// Authentication placeholder. The local Todo app needs none; this shows the
	// standard SAP Cloud form-login shape so the template is reusable for
	// secured apps. Credentials come from the environment (see withCredentials
	// in the pipeline), never hard-coded.
	// auth: {
	//   "sapcloud-form": {
	//     user: "${params.user}",
	//     pass: "${params.pass}",
	//     userFieldSelector: "input[id='j_username']",
	//     passFieldSelector: "input[id='j_password']",
	//     logonButtonSelector: "button[type='submit']"
	//   }
	// },

	timeouts: {
		getPageTimeout: "20000",
		allScriptsTimeout: "20000",
		defaultTimeoutInterval: "60000"
	},

	// Reporters: console summary (always on), JUnit XML for Jenkins/Sonar, and
	// screenshots captured on failure. Paths are relative to the workspace root.
	reporters: [
		{ name: "./reporter/consoleReporter" },
		{ name: "./reporter/junitReporter", reportName: "reports/Test-execution.xml" },
		{
			name: "./reporter/screenshotReporter",
			screenshotsRoot: "reports/screenshots/",
			takeScreenshot: { onExpectFailure: true, onExpectSuccess: false, onAction: false }
		}
	]
};