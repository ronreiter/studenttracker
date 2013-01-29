define([
	"jquery",
	"underscore",
	"backbone",
	"handlebars",
	"text!templates/lesson_item.html"
], function($, _, Backbone, Handlebars, lessonTemplate) {
	return Backbone.View.extend({
		className: "lesson",
		tagName: "li",
		template: Handlebars.compile(lessonTemplate),
		events: {
			"click .remove": "removeLesson",
			"click .name > a" : "filterByLesson",
			"change .name > .following" : "toggleFollowing"
		},
		initialize: function() {

		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.find(".following").prop("checked", this.model.get("following"));
			return this;
		},
		removeLesson: function(e) {
			e.stopPropagation();
            if (!confirm("Are you sure?")) {
                return false;
            }
			this.model.destroy();
			this.$el.remove();
		},
		filterByLesson: function(e) {
			e.stopPropagation();
			router.navigate("lesson/" + this.model.id, {trigger: true});
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