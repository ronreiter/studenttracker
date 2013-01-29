define([
	"jquery",
	"underscore",
	"backbone",
	"handlebars",
	"text!templates/student_item.html"
], function($, _, Backbone, Handlebars, studentTemplate) {
	return Backbone.View.extend({
		className: "student",
		tagName: "li",
		template: Handlebars.compile(studentTemplate),
		events: {
			"click .remove": "removeStudent",
			"click .name > a" : "filterByStudent",
			"change .name > .following" : "toggleFollowing"
		},
		initialize: function() {

		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.find(".following").prop("checked", this.model.get("following"));
			return this;
		},
		removeStudent: function(e) {
			e.stopPropagation();
			this.model.destroy();
			this.$el.remove();
		},
		filterByStudent: function(e) {
			e.stopPropagation();
			router.navigate("student/" + this.model.id, {trigger: true});
			//app.filterByStudent(this.model.id);
			return false;
		},
		toggleFollowing: function(e) {
			e.stopPropagation();
			this.model.save({following:this.$el.find(".following").prop("checked")}, {
				success: function() {
					app.page.refetch();
				}
			});
		}
	});
});