/* global describe, it, beforeEach, browser, element, by, protractor, expect */
"use strict";

// Native uiVeri5 rewrite of TodoListJourney (OPA5). Instead of bootstrapping the
// component in-page, uiVeri5 drives a real browser against the running app and
// locates controls with by.control (same matcher vocabulary as OPA5 waitFor).
describe("Todo List", function () {

	const sViewName = "sap.ui.demo.todo.view.App";

    beforeEach(function () {
    browser.get("index.html");
    });

	// All todo rows, scoped to the "todoList" control.
	function todoItems() {
		return element.all(by.control({
			controlType: "sap.m.CustomListItem",
			viewName: sViewName,
			ancestor: { id: "todoList", viewName: sViewName }
		}));
	}

	it("should start with the two initial items", function () {
		expect(todoItems().count()).toBe(2);
	});

	it("should add an item", function () {
		element(by.control({
			id: "addTodoItemInput",
			viewName: sViewName,
			interaction: "focus"
		})).sendKeys("my test" + protractor.Key.ENTER);

		expect(todoItems().count()).toBe(3);
	});
});