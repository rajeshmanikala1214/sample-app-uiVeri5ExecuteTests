/* global describe, it, beforeEach, browser, element, by, protractor, expect */
"use strict";

// Native uiVeri5 rewrite of SearchJourney (OPA5). Search is a desktop-only
// feature in this app; the selenium/standalone-chrome sidecar is a desktop
// browser, so the search field is available.
describe("Search", function () {

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

	function searchFor(sQuery) {
		const oSearch = element(by.control({
			id: "searchTodoItemsInput",
			viewName: sViewName,
			interaction: "focus"
		}));
		oSearch.clear();
		return oSearch.sendKeys(sQuery + protractor.Key.ENTER);
	}
	it("should find one item matching 'earn'", function () {
		searchFor("earn"); // matches "Learn OpenUI5"
		expect(todoItems().count()).toBe(1);
	});

	it("should find no items for a non-matching query", function () {
		searchFor("there should not be an item for this search");
		expect(todoItems().count()).toBe(0);
	});
});