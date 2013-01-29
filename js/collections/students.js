define(["jquery", "underscore", "backbone", "models/student"], function($, _, Backbone, Student) {
	return Backbone.Collection.extend({
		url: "/students",
		model: Student
	});
});