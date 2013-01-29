define(["jquery", "underscore", "backbone", "models/subject"], function($, _, Backbone, Subject) {
	return Backbone.Collection.extend({
		url: "/subjects",
		model: Subject
	});
});