define([
	"jquery",
	"underscore",
	"backbone",
	"sockjs",
	"handlebars",
	"libs/bootstrap/bootstrap-rtl",
	"libs/bootstrap/date",
	"libs/bootstrap/daterangepicker",
	"collections/tweets",
	"collections/students",
	"collections/subjects",
	"collections/lessons",
	"views/studentitem",
	"views/subjectitem",
	"views/dashboard",
	"views/studentpage",
	"views/searchpage",
	"models/user"
], function(
	$,
	_,
	Backbone,
	SockJS,
	Handlebars,
	rtl,
	date,
	datePicker,
	TweetsCollection,
	StudentsCollection,
	SubjectsCollection,
	LessonsCollection,
	StudentItemView,
	SubjectItemView,
	DashboardView,
	StudentPageView,
	SearchResultsPageView,
	User
	) {
	return Backbone.View.extend({
		el: document.body,
		events: {
			"submit .navbar-search" : "search",
			"click .add-student" : "addStudentModal",
			"click .add-student-button" : "addStudent",
			"submit .add-student-form" : "addStudent",

			"click .add-subject" : "addSubjectModal",
			"click .add-subject-button" : "addSubject",
			"submit .add-subject-form" : "addSubject",

			"click .add-lesson" : "addLessonModal",
			"click .add-lesson-button" : "addLesson",
			"submit .add-lesson-form" : "addLesson",
			"click .brand" : "home"
		},
		initialize: function() {
			_.bindAll(this, "onOpen", "onMessage", "onClose");
			this.sock = new SockJS("/echo");
			this.sock.onopen = this.onOpen;
			this.sock.onmessage = this.onMessage;
			this.sock.onclose = this.onClose;

			this.students = new StudentsCollection();
			this.students.fetch();
			this.students.bind("reset", this.renderStudentSelector, this);
			this.students.bind("add", this.renderStudentSelector, this);

			this.subjects = new SubjectsCollection();
			this.subjects.fetch();

			this.lessons = new LessonsCollection();
			this.lessons.fetch();

			this.startRange = 0;
			this.endRange = 0;

			//this.lessons.bind("reset", this.renderLessons, this);
			//this.lessons.bind("add", this.renderLessons, this);

			this.subjects.once("reset", _.bind(function() {
			}, this));

			this.subjects.bind("reset", this.renderSubjects, this);
			this.subjects.bind("add", this.renderSubjects, this);

			this.user = new User();
			this.user.fetch();

			this.user.bind("change", this.updateUserViews, this);

			this.$el.find("#search-range").daterangepicker({
				ranges: {
				   'היום': ['today', 'today'],
				   'אתמול': ['yesterday', 'yesterday'],
				   'שבוע אחרון': [Date.today().add({ days: -6 }), 'today'],
				   'חודש אחרון': [Date.today().add({ days: -29 }), 'today'],
				   'החודש הזה': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
				   'החודש שעבר': [Date.today().moveToFirstDayOfMonth().add({ months: -1 }), Date.today().moveToFirstDayOfMonth().add({ days: -1 })]
				},
				opens: 'right',
				format: 'dd/MM/yyyy',
				separator: ' עד ',
				startDate: Date.today().add({ days: -29 }),
				endDate: Date.today(),
				minDate: '01/01/2013',
				maxDate: '12/31/2023',
				locale: {
					applyLabel: 'בחר',
					fromLabel: 'מ',
					toLabel: 'עד',
					customRangeLabel: 'בחר תאריך',
					daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
					monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
					firstDay: 1
				},
				showWeekNumbers: true,
				buttonClasses: ['btn-danger']
			 },
			_.bind(function(start, end) {
				this.startRange = start;
				this.endRange = end;
			}, this)
			);


		},
		render : function() {
			this.$el.find(".dropdown-toggle").dropdown();
			this.$studentsDiv = this.$el.find(".students");
			this.$subjectsDiv = this.$el.find(".subjects");
			this.$searchQuery = this.$el.find(".search-query");
			return this;
		},
		onOpen : function() {
			console.log("socket open");
			app.sock.send("blat");
		},
		onMessage : function(data) {
			console.log(data);
			if (data == "update") {
				//this.tweets.fetch();
			}
		},
		onClose : function() {

		},

		renderStudentSelector: function() {
			this.$studentsDiv.empty();
			this.students.each(_.bind(function(student) {
				var studentView = new StudentItemView({ model: student });
				this.$studentsDiv.append(studentView.$el);
				studentView.render();
			}, this));

		},
		search: function(e) {
			if (this.$searchQuery.val().length == 0 && this.startRange == 0 && this.endRange == 0) {
				return false;
			}

			router.navigate(
				"/search/" + this.$searchQuery.val() +
					"?start=" + (this.startRange ? this.startRange.getTime() : 0) +
					"&end=" + (this.endRange ? this.endRange.getTime() : 0), {trigger: true});

			/*
			this.tweets.fetch({ url: "/tweets?" + $.param({
				q : this.$searchQuery.val(),
				start : this.startRange ? this.startRange.getTime() : 0,
				end : this.endRange ? this.endRange.getTime() : 0
			})});
			*/
			return false;
		},
		addStudentModal: function() {
			this.$el.find("#add-student-modal input").val("");
			this.$el.find("#add-student-modal").modal("show");
			return false;
		},
		addSubjectModal: function() {
			this.$el.find("#add-subject-modal input").val("");
			this.$el.find("#add-subject-modal").modal("show");
			return false;
		},
		addLessonModal: function() {
			var subjectSelect = this.$el.find("#subject-select");
			subjectSelect.empty();

			// populate the subject list in the lesson modal
			this.subjects.each(_.bind(function(subject) {
				$("<option>").val(subject.id).text(subject.get("name")).appendTo(subjectSelect);
			}, this));


			this.$el.find("#add-lesson-modal input").val("");
			this.$el.find("#add-lesson-modal").modal("show");
			return false;
		},
		addStudent: function() {
			var studentName = this.$el.find("#student-name").val();
			var studentNumber = parseInt(this.$el.find("#student-number").val());
			var studentPersonalNumber = this.$el.find("#student-personal-number").val();
			var studentPersonalId = this.$el.find("#student-personal-id").val();
			var studentLdapUsername = this.$el.find("#student-ldap-username").val();

			if (studentName.length == 0) {
				return false;
			}
			if (studentNumber.length == 0) {
				return false;
			}
			if (studentPersonalNumber.length == 0) {
				return false;
			}
			if (studentPersonalId.length == 0) {
				return false;
			}
			if (studentLdapUsername.length == 0) {
				return false;
			}

			this.students.create({
				name : studentName,
				number : studentNumber,
				personal_number : studentPersonalNumber,
				personal_id : studentPersonalId,
				ldap_username : studentLdapUsername
			}, {wait: true});
			this.$el.find("#add-student-modal").modal("hide");
			return false;

		},
		addSubject: function() {
			var subjectName = this.$el.find("#subject-name").val();
			if (subjectName.length == 0) {
				return false;
			}

			this.subjects.create({
				name : subjectName
			}, {wait: true});
			this.$el.find("#add-subject-modal").modal("hide");
			return false;

		},
		addLesson: function() {
			var lessonName = this.$el.find("#lesson-name").val();
			var lessonSubject = this.$el.find("#subject-select").val();
			if (lessonName.length == 0) {
				return false;
			}

			if (lessonSubject.length == 0) {
				return false;
			}

			this.lessons.create({
				name : lessonName,
				subject : lessonSubject
			}, {wait: true});
			this.$el.find("#add-lesson-modal").modal("hide");
			return false;

		},
		filterByStudent: function(id) {
			router.navigate("/student/" + id, {trigger: true});
		},
		showDashboard: function() {
			// TODO: create a window view, this is hackish
			if (this.page) {
				this.page.close();
			}

			this.page = new DashboardView().render();

			this.$el.find(".main-page").html(this.page.$el);
		},
		showStudentPage: function(id) {
			console.log("show student page");
			if (this.page) {
				this.page.close();
			}

			// wait until the students collection has been loaded
			if (this.students.length == 0) {
				this.students.once("reset", function() {
					this.page = new StudentPageView({ model : this.students.get(id) }).render();
					this.$el.find(".main-page").html(this.page.$el);
				}, this);
			} else {
				this.page = new StudentPageView({ model : this.students.get(id) }).render();
				this.$el.find(".main-page").html(this.page.$el);
			}

		},
		showSearchPage: function(query, start, end) {
			if (this.page) {
				this.page.close();
			}

			console.log(decodeURIComponent(query));
			this.$searchQuery.val(decodeURIComponent(query));

			this.page = new SearchResultsPageView({ query : this.$searchQuery.val(), start : start, end : end }).render();

			this.$el.find(".main-page").html(this.page.$el);
		},
		showLesson : function(id) {
			if (this.page) {
				this.page.close();
			}

			this.page = new SearchResultsPageView({ lesson: id }).render();

			this.$el.find(".main-page").html(this.page.$el);

		},
		showSubject : function(id) {
			if (this.page) {
				this.page.close();
			}

			this.page = new SearchResultsPageView({ subject: id }).render();

			this.$el.find(".main-page").html(this.page.$el);

		},
		updateUserViews: function() {

		},
		renderSubjects: function() {
			this.$subjectsDiv.empty();
			this.subjects.each(_.bind(function(subject) {
				var subjectView = new SubjectItemView({ model: subject });
				this.$subjectsDiv.append(subjectView.$el);
				subjectView.render();
			}, this));
		},
		home: function() {
			router.navigate("", {trigger:true});
			return false;
		}

	});
});