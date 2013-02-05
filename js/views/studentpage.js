define(["jquery", "underscore", "backbone", "handlebars", "text!templates/student_page.html", "collections/tweets", "views/tweet"], function($, _, Backbone, Handlebars, studentPageTemplate, TweetsCollection, TweetView) {
	return Backbone.View.extend({
		template: Handlebars.compile(studentPageTemplate),
		events: {
			"click .add-student-button" : "updateStudent",
			"change .student-image" : "changeImage"
		},
		initialize: function() {
			this.tweets = new TweetsCollection();
			this.tweets.bind("reset", this.renderAllTweets, this);
			this.tweets.bind("add", this.renderAllTweets, this);
			this.refetch();
		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			this.$starredTweets = this.$el.find(".starred-tweets");
			this.$professionalTweets = this.$el.find(".professional-tweets");
			this.$personalTweets = this.$el.find(".personal-tweets");

			return this;
		},
		refetch: function() {
			this.tweets.fetchFirst({ student : this.model.id });
			//this.tweets.fetch({ url: "/tweets?" + $.param({ student : this.model.id })});
		},
		renderTweets: function(container, tweets) {
			container.empty();
			_.each(tweets, _.bind(function(tweet) {
				var tweetView = new TweetView({ model: tweet, collection: this.tweets });
				container.append(tweetView.$el);
				tweetView.render();
			}, this));
		},
		renderAllTweets: function() {
			if (this.tweets.length == 0) {
				return;
			}
			this.renderTweets(this.$starredTweets, this.tweets.select(function(tweet) {return tweet.get("starred")}));
			this.renderTweets(this.$professionalTweets, this.tweets.select(function(tweet) {return tweet.get("type") == "professional"}));
			this.renderTweets(this.$personalTweets, this.tweets.select(function(tweet) {return tweet.get("type") == "personal"}));
		},
		close: function() {
			this.tweets.unbind("reset", this.renderAllTweets, this);
			this.tweets.unbind("add", this.renderAllTweets, this);
		},
		updateStudent: function() {
			//this.$el.find(".add-student-button").prop("disabled", true);
			var studentName = this.$el.find(".student-name").val();
			var studentNumber = parseInt(this.$el.find(".student-number").val());
			var studentPersonalId = this.$el.find(".student-personal-id").val();
			var studentPersonalNumber = this.$el.find(".student-personal-number").val();
			var studentLdapUsername = this.$el.find(".student-ldap-username").val();
			var studentImage = this.$el.find(".student-image-preview").attr("src");

			this.model.save({
				name : studentName,
				number : studentNumber,
				personal_id : studentPersonalId,
				personal_number : studentPersonalNumber,
				ldap_username : studentLdapUsername,
				image : studentImage
			});

			return false;
		},
		changeImage: function() {
			var studentImage = this.$el.find(".student-image")[0].files;
			if (!studentImage) {
				return;
			}
			var reader = new FileReader();
			reader.onloadend = _.bind(function(e) {
				var imagePreview = this.$el.find(".student-image-preview");
				imagePreview.attr("src", e.target.result);
			}, this);
			reader.readAsDataURL(studentImage[0]);
		},
		scroll : function() {
			if (!this.fetching && $(document.body).height() - ($(window).scrollTop()+$(window).height())<0) {
				console.log("scroll");
				this.fetching = true;
				this.tweets.fetchNext();
			}
		}
	});
});