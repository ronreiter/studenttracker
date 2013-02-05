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
			"click .edit": "toggleEdit",
			"click .avatar" : "filterByStudent",
			"click .star" : "toggleStar",
			"click .tags a" : "clickTag",
			"click .text a" : "clickText",
			"keydown .edit-text" : "changeText",
			"change .edit-text" : "saveText"
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
				raw_text: this.model.get("text"),
				created : dateString,
				student : this.student.toJSON(),
				type : this.model.get("type") == "personal" ? "אישי" : "מקצועי",
				starclass : this.model.get("starred") ? "icon-star" : "icon-star-empty",
				tags : this.model.get("tags"),
                username : this.model.get("username"),
				lesson_name : app.lessons.get(this.model.get("lesson")) ? app.lessons.get(this.model.get("lesson")).get("name") : "ללא"
			}));

			this.$editText = this.$el.find(".edit-text");
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
		toggleEdit: function() {
			this.model.set("editing", !this.model.get("editing"));

			if (this.model.get("editing")) {
				this.$el.find(".text").hide();
				this.$el.find(".edit-text").show();
			} else {
				this.$el.find(".text").show();
				this.$el.find(".edit-text").hide();

			}
		},
		clickTag: function(e) {
			router.navigate("/tags/" + encodeURIComponent($(e.target).text()), {trigger: true});
		},
		clickText: function(e) {
			router.navigate("/search/" + encodeURIComponent($(e.target).text()), {trigger: true});
		},
		changeText: function(e) {
			if (e.keyCode == 13) {
				this.saveText();
			}
		},
		saveText: function() {
			this.model.save({text: this.$editText.val()});
			this.$editText.prop("disabled", true); // disable until update
		}

    });
});