from studenttracker.decorators import user_required
from studenttracker.models import *
import tornado.web, tornado.ioloop

class LessonsHandler(tornado.web.RequestHandler):
	@user_required
	def get(self):
		lessons = []
		for lesson in Lesson.objects.order_by("name"):
			lessons.append({
				"id" : str(lesson.id),
				"name" : lesson.name,
				"subject" : str(lesson.subject.id),
				"following" : lesson in self.user.following_lesson,
			})

		self.write(json.dumps(lessons))

	@user_required
	def post(self):
		data = json.loads(self.request.body)
		new_lesson = Lesson(
			name = data["name"],
			subject = Subject.objects.get(id=data["subject"])
		)
		new_lesson.save()
		self.write(json.dumps({
			"id" : str(new_lesson.id),
			"name" : data["name"]
		}))


class LessonHandler(tornado.web.RequestHandler):
	@user_required
	def put(self, id):
		data = json.loads(self.request.body)
		lesson_to_update = Lesson.objects.get(id=id)
		lesson_to_update.name = data["name"]
		lesson_to_update.subject = Subject.objects.get(id=data["subject"])
		lesson_to_update.save()

		if data["following"]:
			if lesson_to_update not in self.user.following_lesson:
				self.user.following_lesson.append(lesson_to_update)
		else:
			if lesson_to_update in self.user.following_lesson:
				self.user.following_lesson.remove(lesson_to_update)

		self.user.save()
		self.write(self.request.body)
	@user_required
	def delete(self, id):
		lesson_to_delete = Lesson.objects.get(id=id)
		lesson_to_delete.delete()

