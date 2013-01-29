from studenttracker.decorators import user_required
from studenttracker.models import *
import tornado.web, tornado.ioloop

class UserHandler(tornado.web.RequestHandler):
	@user_required
	def get(self):
		self.write(json.dumps({
			"id" : str(self.user.id),
			"username" : self.user.username,
			"following" : [str(x) for x in self.user.following],
			"following_lesson" : [str(x) for x in self.user.following_lesson],
			"following_subject" : [str(x) for x in self.user.following_subject],
		}))

	@user_required
	def put(self):
		data = json.loads(self.request.body)
		self.user.username = data["username"]
		self.user.following = [Student.objects.get(x) for x in data["following"]]
		self.user.following_lesson = [Lesson.objects.get(x) for x in data["following"]]
		self.user.following_subject = [Subject.objects.get(x) for x in data["following"]]
		self.user.save()

		self.write(self.request.body)

