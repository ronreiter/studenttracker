define(["jquery", "underscore", "backbone",	"text!templates/dashboard.html", "views/tweet", "collections/tweets"], function($, _, Backbone, dashboardTemplate, TweetView, TweetsCollection) {
	return Backbone.View.extend({
		className: "page",
		events: {
			"submit .write-tweet" : "writeTweet",
			"change .subject-select" : "renderLessonSelector"
		},
		initialize: function() {
			this.tweets = new TweetsCollection();
			this.tweets.bind("reset", this.renderAllTweets, this);
			this.tweets.bind("add", this.renderAllTweets, this);
			this.tweets.fetch();

			app.students.bind("all", this.renderStudentSelector, this);
			app.subjects.bind("all", this.renderSubjectSelector, this);
			app.lessons.bind("all", this.renderLessonSelector, this);

		},
		render: function() {
			this.$el.html(dashboardTemplate);
			this.$tweetText = this.$el.find(".tweet-text");
			this.$tweetsDiv = this.$el.find(".tweets");
			this.$studentSelect = this.$el.find(".student-select");
			this.$subjectSelect = this.$el.find(".subject-select");
			this.$lessonSelect = this.$el.find(".lesson-select");

			this.renderStudentSelector();
			this.renderSubjectSelector();
			this.renderLessonSelector();

			return this;
		},
		refetch: function() {
			this.tweets.fetch();
		},
		writeTweet: function(e) {
			if (this.$tweetText.val().length == 0) {
				return false;
			}

			var personalTweet = this.$el.find("input[name=tweet-type][value=personal]").attr("checked");
			var professionalTweet = this.$el.find("input[name=tweet-type][value=professional]").attr("checked");

			var tweetType = "";
			if (personalTweet) {
				tweetType = "personal"
			} else if (professionalTweet) {
				tweetType = "professional"
			} else {
				alert("בחר אישי או מקצועי.");
				return false;
			}

			if (!this.$lessonSelect.val()) {
				alert("בחר מקצוע.");
				return false;
			}


			console.log(this.$tweetText.val());
			this.tweets.create({
				text : this.$tweetText.val(),
				student : this.$studentSelect.val(),
				type : tweetType,
				lesson : this.$lessonSelect.val()
			});
			this.refetch();
			this.$tweetText.val("");
			return false;
		},
		renderAllTweets: function() {
			if (app.students.length == 0) {
				return;
			}

			this.$tweetsDiv.empty();
			_.each(this.tweets.getOrderedTweets(), _.bind(function(tweet) {
				var tweetView = new TweetView({ model: tweet });
				this.$tweetsDiv.append(tweetView.$el);
				tweetView.render();
			}, this));
		},
		renderStudentSelector: function() {
			if (app.students.length == 0) {
				return;
			}

			this.$studentSelect.empty();
			app.students.each(_.bind(function(student) {
				if (student.id) {
					this.$studentSelect.append(
						$("<option>").attr("value", student.id).text(student.get("name") + " (" + student.get("number") + ")"));
				}
			}, this));
		},
		renderSubjectSelector: function() {
			if (app.subjects.length == 0) {
				return;
			}

			this.$subjectSelect.empty();
			app.subjects.each(_.bind(function(subject) {
				if (subject.id) {
					this.$subjectSelect.append(
						$("<option>").attr("value", subject.id).text(subject.get("name")));
				}
			}, this));

			this.renderLessonSelector();
		},
		renderLessonSelector: function() {
			if (app.lessons.length == 0) {
				return;
			}

			this.$lessonSelect.empty();
			var currentSubject = this.$subjectSelect.val();
			var subjectLessons = app.lessons.select(function(lesson) { return lesson.get("subject") == currentSubject });
			_.each(subjectLessons, _.bind(function(lesson) {
				if (lesson.id) {
					this.$lessonSelect.append(
						$("<option>").attr("value", lesson.id).text(lesson.get("name")));
				}
			}, this));
		},
		close: function() {
			this.tweets.unbind("reset", this.renderAllTweets);
			this.tweets.unbind("add", this.renderAllTweets);

			app.students.unbind("all", this.renderStudentSelector);
			app.students.unbind("all", this.renderSubjectSelector);
			app.students.unbind("all", this.renderLessonSelector);

		}



	});
});