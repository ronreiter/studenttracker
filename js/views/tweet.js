define([
	"jquery",
	"underscore",
	"backbone",
	"handlebars",
	"models/tweet",
	"text!templates/tweet.html"
], function($, _, Backbone, Handlebars, Tweet, tweetTemplate) {
    function formatTime(time_string) {
        return time_string.length == 1 ? "0" + time_string : time_string;
    }
	return Backbone.View.extend({
		className: "tweet well",
		model: Tweet,
		tagName: "li",
		template: Handlebars.compile(tweetTemplate),
		events: {
			"click .remove": "removeTweet",
			"click .avatar" : "filterByStudent",
			"click .star" : "toggleStar",
			"click .tags a" : "clickTag",
			"click .text a" : "clickText"
		},
		initialize: function() {
			this.model.bind("change", this.render, this);
		},
		render: function() {
			var createdDate = new Date(this.model.get("created") * 1000);
            var dateString = createdDate.getDate() + "/" + (createdDate.getMonth() + 1) + "/" + (createdDate.getFullYear());
            dateString += " " + createdDate.getHours() + ":";
            dateString += formatTime(createdDate.getMinutes()) + ":";
            dateString += formatTime(createdDate.getSeconds());

			this.student = app.students.get(this.model.get("student"));
			this.$el.html(this.template({
				text : this.model.get("text").replace(/([@#]\S+)/g, "<a>$1</a>"),
				created : dateString,
				student : this.student.toJSON(),
				type : this.model.get("type") == "personal" ? "אישי" : "מקצועי",
				starclass : this.model.get("starred") ? "icon-star" : "icon-star-empty",
				tags : this.model.get("tags"),
                user : this.model.get("user"),
				lesson_name : app.lessons.get(this.model.get("lesson")) ? app.lessons.get(this.model.get("lesson")).get("name") : "ללא"
			}));
			return this;
		},
		removeTweet: function() {
			this.model.destroy();
			this.$el.remove();
		},
		filterByStudent: function() {
			app.filterByStudent(this.student.id);
		},
		toggleStar: function() {
			this.model.save({starred : !this.model.get("starred")})
		},
		clickTag: function(e) {
			router.navigate("/tags/" + encodeURIComponent($(e.target).text()), {trigger: true});
		},
		clickText: function(e) {
			router.navigate("/search/" + encodeURIComponent($(e.target).text()), {trigger: true});
		}

    });
});