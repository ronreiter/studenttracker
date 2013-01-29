define(["jquery", "underscore", "backbone", "models/lesson"], function($, _, Backbone, Lesson) {
	return Backbone.Collection.extend({
		url: "/lessons",
		model: Lesson
	});
});