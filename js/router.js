define(["backbone"], function(Backbone) {
	function getQueryVariable(variable) {
	    var query = window.location.search.substring(1);
	    var vars = query.split("&");
	    for (var i = 0; i < vars.length; i++) {
	        var pair = vars[i].split("=");
	        if (pair[0] == variable) {
	            return decodeURIComponent(pair[1]);
	        }
	    }
	    return null;
	}

	return Backbone.Router.extend({
		routes : {
			"" : "dashboard",
			"student/:id" : "studentPage",
			"search/:q" : "searchPage",
			"tags/:tag" : "tagPage",
			"lesson/:id" : "lessonPage",
			"subject/:id" : "subjectPage"
		},
		dashboard:function () {
			window.app.showDashboard();
		},
		studentPage:function (id) {
			window.app.showStudentPage(id);
		},
		searchPage:function (q) {
			if (q.indexOf("?") > -1) {
				q = q.substring(0, q.indexOf("?"));
			}
			var start = getQueryVariable("start") ? getQueryVariable("start") : 0;
			var end = getQueryVariable("end") ? getQueryVariable("end") : 0;
			window.app.showSearchPage(q, start, end);
		},
		tagPage: function(tag) {
			window.app.showSearchPage(decodeURIComponent("#" + tag), 0, 0);
		},
		lessonPage: function(id) {
			window.app.showLesson(id);
		},
		subjectPage: function(id) {
			window.app.showSubject(id);
		}

	});

});
