define([
	"jquery",
	"underscore",
	"backbone",
	"handlebars",
	"text!templates/subject_item.html",
	"views/lessonitem"
], function($, _, Backbone, Handlebars, subjectTemplate, LessonItemView) {
	return Backbone.View.extend({
		className: "subject",
		tagName: "li",
		template: Handlebars.compile(subjectTemplate),
		events: {
			"click .remove": "removeSubject",
			"click .name > a" : "filterBySubject",
			"change .name > .following" : "toggleFollowing"
		},
		initialize: function() {
			app.lessons.bind("all", this.renderLessons, this);
			this.model.bind("change", this.renderLessons, this);
		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.find(".following").prop("checked", this.model.get("following"));
			this.$lessonList = this.$el.find(".lessons");
			this.renderLessons();

			return this;
		},
		renderLessons : function() {
			this.$lessonList.empty();
			var currentSubject = this.model.id;
			var subjectLessons = app.lessons.select(function(lesson) { return lesson.get("subject") == currentSubject });
			// if (this.model.get("following") || _.some(subjectLessons, function(lesson) { return lesson.get("following") == true })) {
			if (this.model.get("following")) {
				_.each(subjectLessons, _.bind(function(lesson) {
					var lessonView = new LessonItemView({ model: lesson }).render();
					this.$lessonList.append(lessonView.$el);
				}, this));
			}
		},
		removeSubject: function(e) {
			e.stopPropagation();
            if (!confirm("Are you sure?")) {
                return false;
            }
			this.model.destroy();
			this.$el.remove();
		},
		filterBySubject: function(e) {
			e.stopPropagation();
			router.navigate("subject/" + this.model.id, {trigger: true});
			return false;
		},
		toggleFollowing: function(e) {
			e.stopPropagation();
			var checked = this.$el.find(".following").prop("checked");

			this.model.save({following:checked}, {
				success: function() {
					app.page.refetch();
				}
			});

			var currentSubject = this.model.id;

			var subjectLessons = app.lessons.select(function(lesson) { return lesson.get("subject") == currentSubject });
			_.each(subjectLessons, _.bind(function(lesson) {
				lesson.save({following: checked})
			}, this));

		}
	});
});