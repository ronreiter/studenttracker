define(["jquery", "underscore", "backbone"], function($, _, Backbone) {
	return Backbone.Model.extend({
		urlBase: "/tweets",
		serialize: function() {
			return {
				text : this.get("text"),
				created : this.get("created"),
				student : app.students.get(this.get("student"))
			}
		}
	});
});