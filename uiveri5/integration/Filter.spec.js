/* global describe, it, beforeEach, browser, element, by, expect */
"use strict";

// Native uiVeri5 rewrite of FilterJourney (OPA5).
describe("Filter", function () {

	const sViewName = "sap.ui.demo.todo.view.App";

    beforeEach(function () {
    browser.get("index.html");
    });
    
	function todoItems() {
		return element.all(by.control({
			controlType: "sap.m.CustomListItem",
			viewName: sViewName,
			ancestor: { id: "todoList", viewName: sViewName }
		}));
	}

	// Press the SegmentedButtonItem with the given filter key (all|active|completed).
	function filterFor(sKey) {
		return element(by.control({
			viewName: sViewName,
			controlType: "sap.m.SegmentedButtonItem",
			properties: { key: sKey }
		})).click();
	}

	beforeEach(function () {
		browser.executeScript("window.localStorage && window.localStorage.clear();");
		browser.get("index.html");
	});

	it("should show 1 item when filtering for 'Active'", function () {
		filterFor("active");
		expect(todoItems().count()).toBe(1);
	});

	it("should show 1 item when filtering for 'Completed'", function () {
		filterFor("completed");
		expect(todoItems().count()).toBe(1);
	});

	it("should show all items again after switching back to 'All'", function () {
		filterFor("completed");
		expect(todoItems().count()).toBe(1);

		filterFor("all");
		expect(todoItems().count()).toBe(2);
	});
});